import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'path';
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({entryPoint: path.resolve('src/gucci/index.ts'), publicDir: path.resolve('public')});
const comp = await selectComposition({serveUrl, id: 'GucciTalk', browserExecutable: '/usr/bin/google-chrome'});
for (const fr of frames) {
  await renderStill({composition: comp, serveUrl, frame: fr, output: `out/g_${fr}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable: '/usr/bin/google-chrome', scale: 0.5});
  console.log('ok', fr);
}
