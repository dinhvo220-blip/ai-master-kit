import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/tygar/index.ts'), publicDir: path.resolve('public')});
const comp = await selectComposition({serveUrl, id: 'TygarGfx', browserExecutable: '/usr/bin/google-chrome', inputProps: {preview: true, safe: true}});
for (const fr of frames) {
  await renderStill({composition: comp, serveUrl, frame: fr, output: `out/ty_${fr}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable: '/usr/bin/google-chrome', scale: 0.5, inputProps: {preview: true, safe: true}});
  console.log('ok', fr);
}
