import { PluginListenerHandle } from '@capacitor/core';
export interface VideoPlayerPositionState {
    currentMillis: number;
    totalMillis: number;
}
export interface ClosedVideoPlayerState extends VideoPlayerPositionState {
    completed: boolean;
    subtitle: string;
}
export declare enum AudioPlayerStatus {
    NONE = "NONE",
    ERROR = "ERROR",
    LOADING = "LOADING",
    LOADED = "LOADED",
    RUNNING = "RUNNING",
    PAUSED = "PAUSED",
    STOPPED = "STOPPED",
    ENDED = "ENDED"
}
export declare enum AudioInterruptionType {
    BEGAN = "began",
    ENDED = "ended"
}
export declare enum AudioInterruptionReason {
    DEFAULT = "default",
    APP_WAS_SUSPENDED = "appWasSuspended",
    BUILT_IN_MIC_MUTED = "builtInMicMuted",
    ROUTE_DISCONNECTED = "routeDisconnected",
    UNKNOWN = "unknown"
}
export interface AudioInterruptionInfo {
    interruptionType: AudioInterruptionType;
    reason: AudioInterruptionReason;
    isLowPowerModeEnabled: boolean;
    wasSuspended: boolean;
    shouldResume?: boolean;
}
export interface AudioPlayerState {
    state: AudioPlayerStatus;
    currentMillis?: number;
    totalMillis?: number;
    error?: string;
    remainingTime?: number;
}
export interface AudioNotificationOptions {
    forwardIncrementMs?: number;
    rewindIncrementMs?: number;
}
export declare enum DownloadStatus {
    REQUESTED = "REQUESTED",
    IN_PROGRESS = "IN_PROGRESS",
    PAUSED = "PAUSED",
    CANCELED = "CANCELED",
    COMPLETED = "COMPLETED",
    DELETED = "DELETED",
    FAILED = "FAILED"
}
export interface DownloadStateMediaInfo {
    mediaId: string;
    status: DownloadStatus;
    estimatedSize?: number;
    maxSize?: number;
    downloadedBytes?: number;
    progress?: number;
    reason?: string;
    title?: string;
}
export interface MediaMetaData {
    mediaId: string;
    title: string;
    totalMillis: number;
    thumbnail: string;
    posterUrl: string;
    downloaded: boolean;
    fileSize: number;
    subtitles: Array<Subtitle>;
}
export interface Subtitle {
    language: string;
    src: string;
}
export interface BrightcovePlayerPlugin {
    addListener(eventName: string, listenerFunc: (...args: any) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
    removeAllListeners(): Promise<void>;
    updateBrightcoveAccount(options: {
        accountId: string;
        policyKey: string;
    }): Promise<void>;
    getMetadata(options: {
        fileId: string;
    }): Promise<{
        metadata: MediaMetaData;
    }>;
    playVideo(options: {
        fileId?: string;
        position?: number;
        local?: boolean;
        subtitle?: string;
    }): Promise<{
        name?: string;
        duration?: number;
    }>;
    pauseVideo(): Promise<void>;
    closeVideo(): Promise<void>;
    setSubtitleLanguage(options: {
        language: string;
    }): Promise<void>;
    loadAudio(options: {
        fileId: string;
        local?: boolean;
        defaultPosterUrl?: string;
    }): Promise<{
        name?: string;
        duration?: number;
    }>;
    stopAudio(): Promise<void>;
    pauseAudio(): Promise<void>;
    playAudio(): Promise<void>;
    backwardAudio(options: {
        amount?: number;
    }): Promise<void>;
    forwardAudio(options: {
        amount?: number;
    }): Promise<void>;
    seekToAudio(options: {
        position: number;
    }): Promise<void>;
    enableAudioLooping(options?: {
        time: number;
    }): Promise<void>;
    disableAudioLooping(): Promise<void>;
    isAudioLooping(): Promise<{
        value: boolean;
    }>;
    getAudioPlayerState(): Promise<AudioPlayerState>;
    destroyAudioPlayer(): Promise<void>;
    setAudioNotificationOptions(options: AudioNotificationOptions): Promise<void>;
    setDownloadNotifications(options: {
        enabled: boolean;
    }): Promise<void>;
    isMediaAvailableLocally(options: {
        fileId: string;
    }): Promise<{
        value: boolean;
    }>;
    downloadMedia(options: {
        fileId: string;
    }): Promise<void>;
    getDownloadedMediasState(): Promise<{
        medias: Array<DownloadStateMediaInfo>;
    }>;
    deleteDownloadedMedia(options: {
        fileId: string;
    }): Promise<void>;
    notifyBackButtonPressed(): Promise<void>;
    playInternalAudio(options: {
        file: string;
    }): Promise<void>;
    deleteAllDownloadedMedias(): Promise<void>;
}
