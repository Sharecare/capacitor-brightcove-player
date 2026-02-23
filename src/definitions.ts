import { PluginListenerHandle } from '@capacitor/core';

export interface VideoPlayerPositionState {
  currentMillis: number,
  totalMillis: number
}

export interface ClosedVideoPlayerState extends VideoPlayerPositionState {
  completed: boolean,
  subtitle: string
}

export enum AudioPlayerStatus {
  NONE = "NONE",
  ERROR = "ERROR",
  LOADING = "LOADING",
  LOADED = "LOADED",
  RUNNING = "RUNNING",
  PAUSED = "PAUSED",
  STOPPED = "STOPPED",
  ENDED = "ENDED"
}

export enum AudioInterruptionType {
  BEGAN = "began",
  ENDED = "ended"
}

export enum AudioInterruptionReason {
  DEFAULT = "default",                   // Phone call, Siri, other app audio
  APP_WAS_SUSPENDED = "appWasSuspended", // System suspended app (Low Power Mode!)
  BUILT_IN_MIC_MUTED = "builtInMicMuted",// Mic was muted
  ROUTE_DISCONNECTED = "routeDisconnected", // Audio route disconnected (e.g., Bluetooth)
  UNKNOWN = "unknown"
}

export enum AudioErrorType {
  NETWORK_ERROR = "NETWORK_ERROR",   // Connection failed, bad HTTP status, network timeout
  IO_ERROR = "IO_ERROR",             // File not found, permission denied, other IO issues
  TIMEOUT = "TIMEOUT",
  DECODER_ERROR = "DECODER_ERROR",
  DRM_ERROR = "DRM_ERROR",
  UNKNOWN = "UNKNOWN"
}

export interface AudioErrorDetails {
  message: string;
  code: number;           // Raw ExoPlayer error code
  type: AudioErrorType;   // Convenience categorization
  cause?: string;         // Root cause message if available
}

export interface AudioInterruptionInfo {
  interruptionType: AudioInterruptionType;
  reason: AudioInterruptionReason;
  isLowPowerModeEnabled: boolean;
  wasSuspended: boolean;
  shouldResume?: boolean; // Only present when interruptionType is "ended"
}

export interface AudioPlayerState {
  state: AudioPlayerStatus,
  currentMillis?: number,
  totalMillis?: number,
  error?: string,                    // Only used if state = AudioPlayerStatus.ERROR (backwards compatible)
  errorDetails?: AudioErrorDetails,  // Detailed error info if state = AudioPlayerStatus.ERROR
  remainingTime?: number             // Only used if setLooping() is used
}

export interface AudioNotificationOptions {
  forwardIncrementMs?: number;
  rewindIncrementMs?: number;
}

export enum DownloadStatus {
  REQUESTED = "REQUESTED",
  IN_PROGRESS = "IN_PROGRESS",
  PAUSED = "PAUSED",
  CANCELED = "CANCELED",
  COMPLETED =  "COMPLETED",
  DELETED = "DELETED",
  FAILED = "FAILED"
}

export interface DownloadStateMediaInfo {
  mediaId: string
  status: DownloadStatus,
  estimatedSize?: number,
  maxSize?: number,
  downloadedBytes?: number,
  progress?: number,
  reason?: string,
  title?: string,
}

export interface MediaMetaData {
  mediaId: string,
  title: string,
  totalMillis: number,
  thumbnail: string,
  posterUrl: string,
  downloaded: boolean,
  fileSize: number // in bytes
  subtitles: Array<Subtitle>
}

export interface Subtitle {
  language: string;
  src: string;
}

export interface BrightcovePlayerPlugin {

  addListener(eventName: string, listenerFunc: (...args: any) => void): Promise<PluginListenerHandle> & PluginListenerHandle;
  removeAllListeners(): Promise<void>;

  // Brightcove account
  updateBrightcoveAccount(options: { accountId: string, policyKey: string }): Promise<void>;

  // Video & Audio
  getMetadata(options: { fileId: string }) : Promise<{ metadata: MediaMetaData }>

  // Video - Return nothing if video resume
  playVideo(options: { fileId?: string, position?: number, local?: boolean, subtitle?: string }): Promise<{ name?: string, duration?: number }>;

  pauseVideo(): Promise<void>;
  closeVideo(): Promise<void>;

  setSubtitleLanguage(options: { language: string }): Promise<void>;

  // Audio
  loadAudio(options: { fileId: string, local?: boolean, defaultPosterUrl?: string }): Promise<{ name?: string, duration?: number }>;
  stopAudio():  Promise<void>;
  pauseAudio():  Promise<void>;
  playAudio(): Promise<void>;
  backwardAudio(options: { amount?: number }): Promise<void>;
  forwardAudio(options: { amount?: number }): Promise<void>;
  seekToAudio(options: { position: number }): Promise<void>;
  enableAudioLooping(options?: { time: number }): Promise<void>;
  disableAudioLooping(): Promise<void>;
  isAudioLooping(): Promise<{ value: boolean }>
  getAudioPlayerState(): Promise<AudioPlayerState>
  destroyAudioPlayer(): Promise<void>;
  setAudioNotificationOptions(options: AudioNotificationOptions): Promise<void>;

  // Offline files
  setDownloadNotifications(options: { enabled: boolean }): Promise<void>;
  isMediaAvailableLocally(options: { fileId: string }): Promise<{value: boolean}>;
  downloadMedia(options: { fileId: string }): Promise<void>;
  getDownloadedMediasState(): Promise<{medias: Array<DownloadStateMediaInfo>}>;
  deleteDownloadedMedia(options: { fileId: string}): Promise<void>;

  // Workaround for Android : better solution ?
  notifyBackButtonPressed(): Promise<void>;

  playInternalAudio(options: {file: string}): Promise<void>;

  // iOS only as for 0.0.20
  deleteAllDownloadedMedias(): Promise<void>
}
