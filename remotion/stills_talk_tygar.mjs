import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
const np = process.env.NP === '1';
const b = await bundle({entryPoint: './src/tygar_talk/index.ts'});
const comp = await selectComposition({serveUrl: b, id: 'TygarTalk', inputProps: {noPerson: np}, browserExecutable: '/usr/bin/google-chrome'});
for (const f of process.argv.slice(2)) {
  await renderStill({serveUrl: b, composition: comp, frame: +f, inputProps: {noPerson: np}, output: `out/tt_${f}.png`, scale: 0.5, browserExecutable: '/usr/bin/google-chrome'});
  console.log('ok', f);
}
