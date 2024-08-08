import { registerPlugin } from '@capacitor/core';
console.log('INITIALIZING BRIGHTCOVE PLAYER!');
const BrightcovePlayer = registerPlugin('BrightcovePlayer', {
    web: () => import('./web').then(m => {
        new m.BrightcovePlayerWeb();
        console.log('Initialized Brightcove!');
    })
});
console.log('INITIALIZED!', BrightcovePlayer);
export * from './definitions';
export { BrightcovePlayer };
//# sourceMappingURL=index.js.map