import { WebPlugin } from '@capacitor/core';
import type { BrightcovePlayerPlugin, AudioPlayerState, AudioNotificationOptions, DownloadStateMediaInfo, MediaMetaData } from './definitions';
export declare class BrightcovePlayerWeb extends WebPlugin implements BrightcovePlayerPlugin {
    constructor();
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
        fileId: string;
        position?: number;
        local?: boolean;
    }): Promise<{
        name: string;
        duration: number;
    }>;
    pauseVideo(): Promise<void>;
    closeVideo(): Promise<void>;
    setDownloadNotifications(options: {
        enabled: boolean;
    }): Promise<void>;
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
    backwardAudio(options: {
        amount: number;
    }): Promise<void>;
    forwardAudio(options: {
        amount: number;
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
    stopAudio(): Promise<void>;
    pauseAudio(): Promise<void>;
    playAudio(): Promise<void>;
    getAudioPlayerState(): Promise<AudioPlayerState>;
    destroyAudioPlayer(): Promise<void>;
    setAudioNotificationOptions(options: AudioNotificationOptions): Promise<void>;
    isMediaAvailableLocally(options: {
        fileId: string;
    }): Promise<{
        value: boolean;
    }>;
    downloadMedia(options: {
        fileId: string;
        showNotification?: boolean;
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
