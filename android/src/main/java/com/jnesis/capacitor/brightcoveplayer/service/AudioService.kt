package com.jnesis.capacitor.brightcoveplayer.service

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.os.*
import androidx.media3.common.AudioAttributes
import androidx.media3.common.MediaItem
import androidx.media3.common.MediaMetadata
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.common.util.UnstableApi
import androidx.media3.common.util.Util
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.datasource.HttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.dash.DashMediaSource
import androidx.media3.exoplayer.dash.DefaultDashChunkSource
import androidx.media3.exoplayer.dash.manifest.DashManifest
import androidx.media3.exoplayer.source.MediaSource
import androidx.media3.exoplayer.upstream.DefaultLoadErrorHandlingPolicy
import androidx.media3.exoplayer.upstream.ParsingLoadable
import androidx.media3.session.CommandButton
import androidx.media3.session.DefaultMediaNotificationProvider
import androidx.media3.session.MediaSession
import androidx.media3.session.MediaSessionService
import androidx.media3.session.SessionCommand
import androidx.media3.session.SessionResult
import com.brightcove.player.controller.ExoPlayerSourceSelector
import com.brightcove.player.dash.BrightcoveDashManifestParser
import com.brightcove.player.dash.OfflineDashManifestParser
import com.brightcove.player.edge.OfflineStoreManager
import com.brightcove.player.model.Video
import com.brightcove.player.offline.MultiDataSource
import com.getcapacitor.PluginCall
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import com.jnesis.capacitor.brightcoveplayer.capacitorbrightcoveplayer.R
import com.jnesis.capacitor.brightcoveplayer.events.AudioNotificationCloseEvent
import com.jnesis.capacitor.brightcoveplayer.events.EventBus
import com.jnesis.capacitor.brightcoveplayer.exception.MissingFileIdException
import com.jnesis.capacitor.brightcoveplayer.exception.MissingSourceUrlException
import com.jnesis.capacitor.brightcoveplayer.exception.PluginException
import com.jnesis.capacitor.brightcoveplayer.manager.CatalogManager
import com.jnesis.capacitor.brightcoveplayer.model.AudioErrorDetails
import com.jnesis.capacitor.brightcoveplayer.model.AudioPlaybackState
import com.jnesis.capacitor.brightcoveplayer.utils.AudioNotificationOptions
import io.reactivex.Observable
import io.reactivex.subjects.BehaviorSubject
import io.reactivex.subjects.PublishSubject
import io.reactivex.subjects.Subject
import java.net.URI
import java.util.concurrent.TimeUnit


// Media3 MediaSessionService: the session owns the notification, lock-screen controls and the foreground state
@UnstableApi
class AudioService : MediaSessionService() {

    val playbackState: BehaviorSubject<AudioPlaybackState> = BehaviorSubject.create<AudioPlaybackState>().apply { onNext(AudioPlaybackState()) }
    val positionState: PublishSubject<AudioPlaybackState> = PublishSubject.create<AudioPlaybackState>().apply { onNext(AudioPlaybackState()) }

    var activity: Activity? = null

    var remainingTime: Long? = null

    private var unsubscribe: Subject<Any>? = null

    private val binder = AudioServiceBinder()

    private var exoPlayer: ExoPlayer? = null
    private var mediaSession: MediaSession? = null
    private var currentMediaSource: MediaSource? = null
    private var currentMedia: Video? = null
    private var preventStop = false
    private var defaultPosterUrl: String? = null
    private var loaded: Boolean = false

    companion object {
        const val NOTIFICATION_ID = 89425
        private const val CLOSE_COMMAND = "close"
        private const val REWIND_COMMAND = "rewind"
        private const val FORWARD_COMMAND = "forward"
    }

    override fun onCreate() {
        super.onCreate()
        setMediaNotificationProvider(
            DefaultMediaNotificationProvider.Builder(this)
                .setNotificationId(NOTIFICATION_ID)
                .setChannelId(getString(R.string.notification_channel_id))
                .setChannelName(R.string.notification_channel_name)
                .build()
        )
    }

    // The plugin binds without an action; Media3 controllers bind with their own actions
    override fun onBind(intent: Intent?): IBinder? = super.onBind(intent) ?: binder

    override fun onGetSession(controllerInfo: MediaSession.ControllerInfo): MediaSession? = mediaSession

    override fun onTaskRemoved(rootIntent: Intent?) = pauseAllPlayersAndStopSelf()

    override fun onDestroy() {
        destroyPlayer()
        super.onDestroy()
    }

    fun destroyPlayer(removeNotification: Boolean = true) {
        refreshNotificationToBeginning()
        unsubscribe?.onNext(Any())
        unsubscribe?.onComplete()
        playbackState.onNext(AudioPlaybackState())
        positionState.onNext(AudioPlaybackState())
        mediaSession?.release()
        mediaSession = null
        exoPlayer?.release()
        exoPlayer = null
        currentMediaSource = null
        currentMedia = null
        loaded = false
    }

    fun loadMedia(call: PluginCall) {
        loaded = false
        val mediaId = call.getString("fileId")!!
        this.defaultPosterUrl = call.getString("defaultPosterUrl")

        CatalogManager.checkCredentials()
        ensurePlayer()

        playbackState.onNext(AudioPlaybackState(AudioPlaybackState.State.LOADING))

        val callback = { video: Video?, local: Boolean ->
            currentMedia = video
            currentMediaSource = getMediaSourceFromVideo(video, local)
                    .also {
                        exoPlayer!!.setMediaSource(it!!)
                        exoPlayer!!.prepare()
                    }

            call.resolve()
        }

        try {
            if (call.getBoolean("local", false)!!) {
                CatalogManager.tryToLoadLocallyOrFetchRemotely(mediaId, call, callback)
            } else {
                CatalogManager.fetchRemoteMedia(mediaId, call, callback)
            }
        } catch (t: Throwable) {
            call.reject(t.localizedMessage, PluginException.ErrorCode.TECHNICAL_ERROR.name, Exception(t))
        }
    }

    private fun buildHttpDataSourceFactory(): HttpDataSource.Factory {
        return DefaultHttpDataSource.Factory().setUserAgent(Util.getUserAgent(this@AudioService, "Capacitor Brightcove Plugin"))
    }

    private fun getMediaSourceFromVideo(video: Video?, local: Boolean): MediaSource? {
        return if (local) {
            getLocalMediaSource(video)
        } else {
            getRemoteMediaSource(video)
        }
    }

    private fun getLocalMediaSource(video: Video?): MediaSource? {
        if (video == null) {
            return null
        }
        // Since 10.x the parser and data source only resolve downloaded segments when given the offline store
        val offlineStore = OfflineStoreManager.getInstance(this@AudioService)
        val dataSourceFactory: DataSource.Factory = MultiDataSource.Factory(this@AudioService, buildHttpDataSourceFactory(), null, offlineStore)
        val manifestParser: ParsingLoadable.Parser<out DashManifest> = OfflineDashManifestParser(BrightcoveDashManifestParser(), offlineStore)

        val videoSource: MediaSource = DashMediaSource.Factory(
                DefaultDashChunkSource.Factory(dataSourceFactory),
                dataSourceFactory
        )
                .setManifestParser(manifestParser)
                .setLoadErrorHandlingPolicy(DefaultLoadErrorHandlingPolicy())
                .setFallbackTargetLiveOffsetMs(30000L)
                .createMediaSource(buildMediaItem(video))

        val captionPairs = video.properties["captionSources"] as MutableList<*>?
        captionPairs?.clear()
        return videoSource
    }

    private fun getRemoteMediaSource(video: Video?): MediaSource? {
        if (video == null) {
            return null
        }

        val dataSourceFactory: DataSource.Factory = MultiDataSource.Factory(this@AudioService, buildHttpDataSourceFactory(), null)

        return DashMediaSource
                .Factory(dataSourceFactory)
                .createMediaSource(buildMediaItem(video))
    }

    // Title, description and artwork are read from the metadata by the Media3 notification
    private fun buildMediaItem(video: Video): MediaItem {
        return MediaItem.Builder()
            .setUri(getVideoUrl(video))
            .setMediaMetadata(MediaMetadata.Builder()
                .setTitle(video.properties["name"]?.toString() ?: "")
                .setArtist(video.properties["description"]?.toString() ?: "")
                .setArtworkUri(getPoster(video)?.let { Uri.parse(it.toString()) })
                .build())
            .build()
    }

    private fun getPoster(video: Video): URI? {
        return if (this.defaultPosterUrl !== null) {
            URI.create(this.defaultPosterUrl)
        } else {
            video.properties["stillImageUri"] as URI?
        }
    }

    private fun getVideoUrl(video: Video?): String {
        return ExoPlayerSourceSelector().selectSource(video!!).url ?: throw MissingSourceUrlException()
    }

    fun play() {
        checkFile()
        exoPlayer!!.play()
        preventStop = false
    }

    fun pause() {
        checkFile()
        exoPlayer!!.pause()
    }

    fun stop() {
        playbackState.onNext(AudioPlaybackState(AudioPlaybackState.State.STOPPED))
        positionState.onNext(AudioPlaybackState(
                currentMillis = 0,
                totalMillis = 0,
                remainingTime = remainingTime
        ))
        refreshNotificationToBeginning()
    }

    fun onAudioEnd() {

        if (preventStop || exoPlayer == null) return
        preventStop = true

        playbackState.onNext(AudioPlaybackState(AudioPlaybackState.State.ENDED))
        positionState.onNext(AudioPlaybackState(
                currentMillis = 0,
                totalMillis = 0,
                remainingTime = remainingTime
        ))
        pause()

        refreshNotificationToBeginning()
    }

    private fun refreshNotificationToBeginning() {
        if(currentMediaSource !== null) {
            pause()
            seekTo(0)
        }

    }

    fun seekTo(millis: Long) {

        checkFile()

        var position = millis
        if (millis < 0) position = 0
        if (millis > (exoPlayer!!.duration - 10)) position = exoPlayer!!.duration - 10

        exoPlayer!!.seekTo(position)
        positionState.onNext(AudioPlaybackState(
                currentMillis = exoPlayer!!.currentPosition,
                totalMillis = exoPlayer!!.duration,
                remainingTime = remainingTime
        ))
    }

    fun backward(millis: Long) {
        checkFile()
        seekTo(exoPlayer!!.currentPosition - millis)
    }

    fun forward(millis: Long) {
        checkFile()
        seekTo(exoPlayer!!.currentPosition + millis)
    }

    fun toggleLooping(enabled: Boolean) {
        ensurePlayer()
        activity!!.runOnUiThread {
            if (enabled) {
                exoPlayer!!.repeatMode = Player.REPEAT_MODE_ONE
            } else {
                this.remainingTime = null
                exoPlayer!!.repeatMode = Player.REPEAT_MODE_OFF
            }
        }
    }

    fun isLooping(): Boolean {
        ensurePlayer()
        return exoPlayer!!.repeatMode == Player.REPEAT_MODE_ONE
    }

    fun getPlayerState(): AudioPlaybackState {
        ensurePlayer()

        return AudioPlaybackState(
                playbackState.value.state,
                if (playbackState.value.state == AudioPlaybackState.State.STOPPED) 0 else exoPlayer!!.currentPosition,
                exoPlayer!!.contentDuration,
                playbackState.value.error
        )
    }

    private fun ensurePlayer() {
        if (exoPlayer == null) {
        exoPlayer = ExoPlayer
            .Builder(this)
            .setSeekBackIncrementMs(AudioNotificationOptions.audioNotificationRewindIncrementMs)
            .setSeekForwardIncrementMs(AudioNotificationOptions.audioNotificationForwardIncrementMs)
            .setAudioAttributes(AudioAttributes.DEFAULT, true)
            .setHandleAudioBecomingNoisy(true)
            .build()
            .also {
                it.addListener(object : Player.Listener {

                    override fun onPlayerError(error: PlaybackException) {
                        val errorDetails = AudioErrorDetails(
                            message = error.message ?: error.toString(),
                            code = error.errorCode,
                            type = AudioErrorDetails.categorizeErrorCode(error.errorCode),
                            cause = error.cause?.message
                        )
                        playbackState.onNext(AudioPlaybackState(
                            state = AudioPlaybackState.State.ERROR,
                            error = error.toString(),
                            errorDetails = errorDetails
                        ))
                    }

                    override fun onIsPlayingChanged(isPlaying: Boolean) {
                        playbackState.onNext(AudioPlaybackState(if (isPlaying) AudioPlaybackState.State.RUNNING else AudioPlaybackState.State.PAUSED))
                    }

                    override fun onPlaybackStateChanged(state: Int) {
                        when (state) {
                            Player.STATE_ENDED -> {
                                onAudioEnd()
                            }

                            Player.STATE_READY -> {
                                if(!loaded) {
                                    loaded = true
                                    playbackState.onNext(AudioPlaybackState(AudioPlaybackState.State.LOADED))
                                }
                            }
                        }
                    }
            })
            }

            unsubscribe = PublishSubject.create()

            initRemainingLoopTimeInterval()

            initPositionInterval()

            createSession()
        }
    }

    private fun initRemainingLoopTimeInterval() {
        Observable
                .interval(50, TimeUnit.MILLISECONDS)
                .takeUntil(unsubscribe)
                .filter {
                    playbackState.value.state == AudioPlaybackState.State.RUNNING
                }
                .subscribe {
                    activity!!.runOnUiThread {
                        if (!isLooping()) return@runOnUiThread

                        if (remainingTime != null) {
                            remainingTime = remainingTime?.minus(50)
                            if (remainingTime!! <= 0) {
                                this.remainingTime = null
                                    this.stop()
                                    this.toggleLooping(false)
                            }
                        }
                    }
                }
    }

    private fun initPositionInterval() {
        Observable
                .interval(1, TimeUnit.SECONDS)
                .takeUntil(unsubscribe)
                .filter { playbackState.value.state == AudioPlaybackState.State.RUNNING }
                .subscribe {
                    activity!!.runOnUiThread {
                        positionState.onNext(AudioPlaybackState(
                                state = playbackState.value.state,
                                currentMillis = exoPlayer!!.currentPosition,
                                totalMillis = exoPlayer!!.duration,
                                remainingTime = remainingTime
                        ))
                    }
                }
    }

    private fun createSession() {
        val builder = MediaSession.Builder(this, exoPlayer!!).setCallback(SessionCallback())
        createContentIntent()?.let { builder.setSessionActivity(it) }
        mediaSession = builder.build().apply { setMediaButtonPreferences(notificationButtons()) }
    }

    // Rewind/forward use the increments from setAudioNotificationOptions; close goes to the overflow menu
    private fun notificationButtons(): List<CommandButton> {
        return listOf(
            CommandButton.Builder(CommandButton.ICON_SKIP_BACK)
                .setSessionCommand(SessionCommand(REWIND_COMMAND, Bundle.EMPTY))
                .setSlots(CommandButton.SLOT_BACK)
                .setDisplayName(REWIND_COMMAND)
                .build(),
            CommandButton.Builder(CommandButton.ICON_SKIP_FORWARD)
                .setSessionCommand(SessionCommand(FORWARD_COMMAND, Bundle.EMPTY))
                .setSlots(CommandButton.SLOT_FORWARD)
                .setDisplayName(FORWARD_COMMAND)
                .build(),
            CommandButton.Builder(CommandButton.ICON_STOP)
                .setSessionCommand(SessionCommand(CLOSE_COMMAND, Bundle.EMPTY))
                .setSlots(CommandButton.SLOT_OVERFLOW)
                .setDisplayName(CLOSE_COMMAND)
                .build()
        )
    }

    private fun createContentIntent(): PendingIntent? {
        val currentActivity = activity ?: return null

        val intent = Intent(currentActivity, currentActivity.javaClass).apply {
            action = Intent.ACTION_MAIN
            addCategory(Intent.CATEGORY_LAUNCHER)
        }

        var intentFlagType = PendingIntent.FLAG_ONE_SHOT
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            intentFlagType =
                PendingIntent.FLAG_IMMUTABLE // or only use FLAG_MUTABLE >> if it needs to be used with inline replies or bubbles.
        }

        return PendingIntent.getActivity(currentActivity, 0, intent, intentFlagType)
    }

    private fun checkFile() = currentMediaSource ?: throw MissingFileIdException()

    inner class AudioServiceBinder : Binder() {
        fun getService(): AudioService = this@AudioService
    }

    private inner class SessionCallback : MediaSession.Callback {

        override fun onConnect(session: MediaSession, controller: MediaSession.ControllerInfo): MediaSession.ConnectionResult {
            val sessionCommands = MediaSession.ConnectionResult.DEFAULT_SESSION_COMMANDS.buildUpon()
                .add(SessionCommand(REWIND_COMMAND, Bundle.EMPTY))
                .add(SessionCommand(FORWARD_COMMAND, Bundle.EMPTY))
                .add(SessionCommand(CLOSE_COMMAND, Bundle.EMPTY))
                .build()

            return MediaSession.ConnectionResult.AcceptedResultBuilder(session)
                .setAvailableSessionCommands(sessionCommands)
                .build()
        }

        override fun onCustomCommand(session: MediaSession, controller: MediaSession.ControllerInfo, customCommand: SessionCommand, args: Bundle): ListenableFuture<SessionResult> {
            when (customCommand.customAction) {
                REWIND_COMMAND -> session.player.seekBack()
                FORWARD_COMMAND -> session.player.seekForward()
                CLOSE_COMMAND -> {
                    destroyPlayer()
                    EventBus.publish(AudioNotificationCloseEvent())
                }
                else -> return super.onCustomCommand(session, controller, customCommand, args)
            }
            return Futures.immediateFuture(SessionResult(SessionResult.RESULT_SUCCESS))
        }
    }
}
