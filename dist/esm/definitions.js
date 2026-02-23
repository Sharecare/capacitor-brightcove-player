export var AudioPlayerStatus;
(function (AudioPlayerStatus) {
    AudioPlayerStatus["NONE"] = "NONE";
    AudioPlayerStatus["ERROR"] = "ERROR";
    AudioPlayerStatus["LOADING"] = "LOADING";
    AudioPlayerStatus["LOADED"] = "LOADED";
    AudioPlayerStatus["RUNNING"] = "RUNNING";
    AudioPlayerStatus["PAUSED"] = "PAUSED";
    AudioPlayerStatus["STOPPED"] = "STOPPED";
    AudioPlayerStatus["ENDED"] = "ENDED";
})(AudioPlayerStatus || (AudioPlayerStatus = {}));
export var AudioInterruptionType;
(function (AudioInterruptionType) {
    AudioInterruptionType["BEGAN"] = "began";
    AudioInterruptionType["ENDED"] = "ended";
})(AudioInterruptionType || (AudioInterruptionType = {}));
export var AudioInterruptionReason;
(function (AudioInterruptionReason) {
    AudioInterruptionReason["DEFAULT"] = "default";
    AudioInterruptionReason["APP_WAS_SUSPENDED"] = "appWasSuspended";
    AudioInterruptionReason["BUILT_IN_MIC_MUTED"] = "builtInMicMuted";
    AudioInterruptionReason["ROUTE_DISCONNECTED"] = "routeDisconnected";
    AudioInterruptionReason["UNKNOWN"] = "unknown";
})(AudioInterruptionReason || (AudioInterruptionReason = {}));
export var AudioErrorType;
(function (AudioErrorType) {
    AudioErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    AudioErrorType["IO_ERROR"] = "IO_ERROR";
    AudioErrorType["TIMEOUT"] = "TIMEOUT";
    AudioErrorType["DECODER_ERROR"] = "DECODER_ERROR";
    AudioErrorType["DRM_ERROR"] = "DRM_ERROR";
    AudioErrorType["UNKNOWN"] = "UNKNOWN";
})(AudioErrorType || (AudioErrorType = {}));
export var DownloadStatus;
(function (DownloadStatus) {
    DownloadStatus["REQUESTED"] = "REQUESTED";
    DownloadStatus["IN_PROGRESS"] = "IN_PROGRESS";
    DownloadStatus["PAUSED"] = "PAUSED";
    DownloadStatus["CANCELED"] = "CANCELED";
    DownloadStatus["COMPLETED"] = "COMPLETED";
    DownloadStatus["DELETED"] = "DELETED";
    DownloadStatus["FAILED"] = "FAILED";
})(DownloadStatus || (DownloadStatus = {}));
//# sourceMappingURL=definitions.js.map