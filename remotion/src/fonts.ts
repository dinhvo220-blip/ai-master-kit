import {continueRender, delayRender, staticFile} from 'remotion';
const VI = 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB';
const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LEXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
const faces: [string, string, string, string][] = [];
for (const w of ['500', '600', '800', '900']) for (const [sub, r] of [['latin', LAT], ['latin-ext', LEXT], ['vietnamese', VI]]) faces.push(['Be Vietnam Pro', `be-vietnam-pro-${sub}-${w}-normal.woff2`, w, 'normal' + '|' + r]);
for (const w of ['700', '900']) for (const st of ['normal', 'italic']) for (const [sub, r] of [['latin', LAT], ['latin-ext', LEXT], ['vietnamese', VI]]) faces.push(['Playfair Display', `playfair-display-${sub}-${w}-${st}.woff2`, w, st + '|' + r]);
let loaded = false;
export const loadFonts = () => {
  if (loaded) return; loaded = true;
  const h = delayRender('fonts');
  Promise.all(faces.map(([fam, file, w, sr]) => {
    const [st, r] = sr.split('|');
    const f = new FontFace(fam, `url(${staticFile('fonts/' + file)}) format('woff2')`, {weight: w, style: st, unicodeRange: r});
    return f.load().then((ff) => (document as any).fonts.add(ff));
  })).then(() => continueRender(h)).catch((e) => {console.error(e); continueRender(h);});
};
