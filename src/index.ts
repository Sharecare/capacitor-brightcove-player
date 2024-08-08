import { registerPlugin } from '@capacitor/core';
import type { BrightcovePlayerPlugin } from './definitions';

console.log('INITIALIZING BRIGHTCOVE PLAYER!')

const BrightcovePlayer = registerPlugin<BrightcovePlayerPlugin>('BrightcovePlayer', {
  web: () => import('./web').then(m => {
    new m.BrightcovePlayerWeb();
    console.log('Initialized Brightcove!')
})
});
console.log('INITIALIZED!', BrightcovePlayer)

export * from './definitions'
export { BrightcovePlayer };
