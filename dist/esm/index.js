import { registerPlugin } from '@capacitor/core';
const BrightcovePlayer = registerPlugin('BrightcovePlayer', {
    web: () => import('./web').then(m => new m.BrightcovePlayerWeb())
});
export * from './definitions';
export { BrightcovePlayer };
//# sourceMappingURL=index.js.map