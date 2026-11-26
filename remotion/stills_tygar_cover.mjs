// node stills_tygar.mjs f1 f2 ... -> out/tyc_<f>.png (1 lần bundle)
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const b = await bundle({entryPoint: './src/tygar_cover/index.ts'});
const comp = await selectComposition({serveUrl: b, id: 'TygarCover', browserExecutable: '/usr/bin/google-chrome'});
for (const f of process.argv.slice(2)) {
  await renderStill({serveUrl: b, composition: comp, frame: +f, output: `out/tyc_${f}.png`, scale: 0.5, browserExecutable: '/usr/bin/google-chrome'});
  console.log('ok', f);
}
