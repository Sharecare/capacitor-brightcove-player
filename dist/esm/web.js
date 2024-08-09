import { WebPlugin } from '@capacitor/core';
export class BrightcovePlayerWeb extends WebPlugin {
    constructor() {
        super({
            name: 'BrightcovePlayer',
            platforms: ['web'],
        });
        window.addEventListener('backButton', () => this.notifyBackButtonPressed());
    }
    // Brightcove account
    async updateBrightcoveAccount(options) {
        console.log('updateBrightcoveAccount', options);
        throw this.unimplemented('Not implemented on web.');
    }
    // Video & Audio
    getMetadata(options) {
        console.log('getMetadata', options);
        throw this.unimplemented('Not implemented on web.');
    }
    // Video
    async playVideo(options) {
        console.log('playVideo', options);
        throw this.unimplemented('Not implemented on web.');
    }
    pauseVideo() {
        throw this.unimplemented('Not implemented on web.');
    }
    closeVideo() {
        throw this.unimplemented('Not implemented on web.');
    }
    // Android only
    async setDownloadNotifications(options) {
        console.log('setDownloadNotifications', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async setSubtitleLanguage(options) {
        console.log('setSubtitleLanguage', options);
        throw this.unimplemented('Not implemented on web.');
    }
    // Audio
    async loadAudio(options) {
        console.log('loadAudio', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async backwardAudio(options) {
        console.log('backwardAudio', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async forwardAudio(options) {
        console.log('forwardAudio', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async seekToAudio(options) {
        console.log('seekTo', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async enableAudioLooping(options) {
        console.log('enable looping', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async disableAudioLooping() {
        console.log('disable looping');
        throw this.unimplemented('Not implemented on web.');
    }
    async isAudioLooping() {
        console.log('is looping');
        throw this.unimplemented('Not implemented on web.');
    }
    async stopAudio() {
        console.log('stopAudio');
        throw this.unimplemented('Not implemented on web.');
    }
    async pauseAudio() {
        console.log('pauseAudio');
        throw this.unimplemented('Not implemented on web.');
    }
    async playAudio() {
        console.log('playAudio');
        throw this.unimplemented('Not implemented on web.');
    }
    async getAudioPlayerState() {
        console.log('getAudioPlayerState');
        throw this.unimplemented('Not implemented on web.');
    }
    async destroyAudioPlayer() {
        throw this.unimplemented('Not implemented on web.');
    }
    async setAudioNotificationOptions(options) {
        console.log('Set audio notification options', options);
        throw this.unimplemented('Not implemented on web.');
    }
    // Offline files
    async isMediaAvailableLocally(options) {
        console.log('Is Media Available Locally', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async downloadMedia(options) {
        console.log('Download Media', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async getDownloadedMediasState() {
        console.log("get Downloaded medias");
        throw this.unimplemented('Not implemented on web.');
    }
    async deleteDownloadedMedia(options) {
        console.log("Delete downloaded file", options);
        throw this.unimplemented('Not implemented on web.');
    }
    // Workaround for Android : better solution ?
    async notifyBackButtonPressed() {
        console.log('Not implemented');
        throw this.unimplemented('Not implemented on web.');
    }
    async playInternalAudio(options) {
        console.log('Local internal not implemented ', options);
        throw this.unimplemented('Not implemented on web.');
    }
    async deleteAllDownloadedMedias() {
        console.log('Delete all downloaded medias');
        throw this.unimplemented('Not implemented on web.');
    }
}
//# sourceMappingURL=web.js.map