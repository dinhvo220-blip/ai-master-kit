// Video mẫu trình diễn các kiểu chữ đã học (26/11/2026) – bóng người giả thay clip thật.
// 01 chữ khổng lồ sau đầu đổi theo lời · 02 thẻ kính + pill · 03 số đếm + lưới icon · 04 hai vế
// 05 serif nghiêng thân hẹp + quầng sáng (Gucci) · 06 chữ viết tay lộ dần (Chloé) · màn kết.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender, staticFile} from 'remotion';
import {loadFonts} from '../fonts';

const FPS = 30;
const SAFE = {l: 70, r: 190};
const CX = 480;
const INK = '#0D0A07', BROWN = '#2A1A0E', AMBER = '#C47A2C', GOLD = '#D9B26A', GOLD_L = '#F3DDA2', CREAM = '#F5EBDD';
const GREEN = '#1C3A2A', GGOLD = '#7E5718';
const SANS = 'Be Vietnam Pro', SERIF = 'NotoSerifDisplay', COND = 'NSDCond', SCRIPT = 'DancingScript';
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const f = (t: number) => Math.round(t * FPS);
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = EIN) =>
  interpolate(fr, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const life = (fr: number, s: number, e: number, inD = 10, outD = 7) => Math.min(ip(fr, f(s), f(s) + inD), ip(fr, f(e) - outD, f(e), 1, 0, EOUT));
const on = (fr: number, s: number, e: number) => fr >= f(s) - 1 && fr < f(e) + 1;

// ---------- font ----------
const R: Record<string, string> = {
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
};
let extraLoaded = false;
const loadExtra = () => {
  if (extraLoaded) return; extraLoaded = true;
  const h = delayRender('extra-fonts');
  const jobs: Promise<any>[] = [];
  for (const k of Object.keys(R)) {
    for (const st of ['normal', 'italic']) jobs.push(new FontFace(SERIF, `url(${staticFile(`fonts/noto-serif-display-${k}-wght-${st}.woff2`)}) format('woff2')`, {weight: '100 900', style: st, unicodeRange: R[k]}).load().then((x) => (document as any).fonts.add(x)));
    jobs.push(new FontFace(COND, `url(${staticFile(`fonts/noto-serif-display-${k}-wdth-italic.woff2`)}) format('woff2')`, {weight: '100 900', style: 'italic', stretch: '62.5% 100%', unicodeRange: R[k]}).load().then((x) => (document as any).fonts.add(x)));
    jobs.push(new FontFace(SCRIPT, `url(${staticFile(`fonts/dancing-script-${k}-700-normal.woff2`)}) format('woff2')`, {weight: '700', unicodeRange: R[k]}).load().then((x) => (document as any).fonts.add(x)));
  }
  Promise.all(jobs).then(() => continueRender(h)).catch((e) => {console.error(e); continueRender(h);});
};

const goldText: React.CSSProperties = {background: `linear-gradient(180deg, ${GOLD_L} 0%, ${GOLD} 55%, ${AMBER} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingTop: '0.34em', marginTop: '-0.3em'};

// ---------- cảnh ----------
type Scene = {s: number; e: number; tone: 'dark' | 'blush' | 'cream'; label?: string};
const SC: Scene[] = [
  {s: 0, e: 7.6, tone: 'dark', label: '01 · Chữ khổng lồ sau đầu – đổi theo lời'},
  {s: 7.6, e: 12.2, tone: 'dark', label: '02 · Thẻ kính mờ + pill'},
  {s: 12.2, e: 16.8, tone: 'dark', label: '03 · Số đếm + lưới icon sáng dần'},
  {s: 16.8, e: 21.0, tone: 'dark', label: '04 · Hai vế đối xứng'},
  {s: 21.0, e: 26.6, tone: 'blush', label: '05 · Serif nghiêng thân hẹp + quầng sáng'},
  {s: 26.6, e: 31.2, tone: 'cream', label: '06 · Chữ viết tay lộ dần'},
  {s: 31.2, e: 35.0, tone: 'dark'},
];
export const TOTAL = 35.0;

const Bg: React.FC<{fr: number; tone: Scene['tone']}> = ({fr, tone}) => {
  if (tone === 'dark') {
    const bok = Array.from({length: 14}).map((_, i) => {
      const x = random(`bx${i}`) * 1080, y = 200 + random(`by${i}`) * 1300, r = 40 + random(`br${i}`) * 110;
      const dx = Math.sin(fr / 90 + i) * 20;
      return <div key={i} style={{position: 'absolute', left: x + dx - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(243,221,162,${0.10 + random(`bo${i}`) * 0.12}), transparent 70%)`}} />;
    });
    return <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% 30%, #4A3220 0%, ${BROWN} 45%, ${INK} 100%)`}}>{bok}</AbsoluteFill>;
  }
  if (tone === 'blush') return <AbsoluteFill style={{background: 'radial-gradient(110% 70% at 50% 30%, #FBEFEA 0%, #F2DCD4 55%, #E4C6BC 100%)'}} />;
  return <AbsoluteFill style={{background: 'radial-gradient(110% 70% at 50% 30%, #FFFBF4 0%, #F4EADB 60%, #E6D6C0 100%)'}} />;
};
const Person: React.FC<{tone: Scene['tone']}> = ({tone}) => {
  const [a, b] = tone === 'dark' ? ['#3B2A1E', '#120C08'] : tone === 'blush' ? ['#B88F82', '#6E4E44'] : ['#A89580', '#5E4C3C'];
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs><linearGradient id={`pp-${tone}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
      <ellipse cx={480} cy={790} rx={150} ry={185} fill={`url(#pp-${tone})`} />
      <rect x={430} y={950} width={100} height={190} fill={`url(#pp-${tone})`} />
      <path d="M 120 1920 C 130 1300, 290 1110, 480 1090 C 670 1110, 830 1300, 840 1920 Z" fill={`url(#pp-${tone})`} />
      <text x={480} y={1760} textAnchor="middle" fill="rgba(255,255,255,.28)" fontFamily={SANS} fontSize={26}>[ vị trí người nói ]</text>
    </svg>
  );
};
const Label: React.FC<{fr: number; sc: Scene}> = ({fr, sc}) => {
  if (!sc.label) return null;
  const a = life(fr, sc.s + 0.1, sc.e, 10, 6);
  const dark = sc.tone === 'dark';
  return <div style={{position: 'absolute', left: SAFE.l, top: 250, opacity: a * 0.92, transform: `translateX(${(1 - a) * -20}px)`, padding: '8px 18px', borderRadius: 30,
    background: dark ? 'rgba(245,235,221,.12)' : 'rgba(28,23,18,.08)', border: `1px solid ${dark ? 'rgba(245,235,221,.3)' : 'rgba(28,23,18,.2)'}`,
    fontFamily: SANS, fontWeight: 500, fontSize: 22, color: dark ? CREAM : '#3A2C25', letterSpacing: '0.02em'}}>{sc.label}</div>;
};

// ---------- 01: chữ khổng lồ sau đầu (mask trượt lên + giãn chữ, ra bằng mờ tan) ----------
const BigWord: React.FC<{fr: number; s: number; e: number; small: string; word: string; serif?: boolean; top?: number}> = ({fr, s, e, small, word, serif, top = 330}) => {
  if (!on(fr, s, e + 0.3)) return null;
  const S = f(s), E = f(e);
  const pin = ip(fr, S, S + 14);
  const pout = ip(fr, E - 4, E + 8, 0, 1, Easing.inOut(Easing.cubic));
  const fs = Math.min(serif ? 290 : 300, (serif ? 820 : 760) / (0.6 * word.length));
  const sm = ip(fr, S + 2, S + 14);
  return (
    <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top, textAlign: 'center', opacity: 1 - pout, filter: `blur(${pout * 12}px)`, transform: `translateY(${-pout * 18}px) scale(${1 + pout * 0.04})`}}>
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, letterSpacing: `${interpolate(sm, [0, 1], [0.25, -0.01])}em`, color: CREAM, opacity: sm, textShadow: '0 2px 12px rgba(0,0,0,.5)'}}>{small}</div>
      <div style={{overflow: 'hidden', paddingTop: '0.42em', marginTop: serif ? '-0.5em' : '-0.62em', paddingBottom: '0.12em'}}>
        <div style={{...goldText, fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 500 : 800, fontSize: fs, lineHeight: 1.02, whiteSpace: 'nowrap',
          letterSpacing: `${interpolate(pin, [0, 1], [serif ? 0.06 : -0.02, serif ? -0.01 : -0.05])}em`,
          transform: `translateY(${(1 - pin) * 105}%)`, filter: `blur(${(1 - pin) * 6}px) drop-shadow(0 8px 30px rgba(0,0,0,.45))`, fontVariantNumeric: 'lining-nums'}}>{word}</div>
      </div>
    </div>
  );
};

// phụ đề 1 dòng, viền tối, từ khóa serif nghiêng vàng (Tygar v2)
const SUBS_DARK: [number, number, string, string[]][] = [
  [0.3, 2.2, 'Một chai nước hoa 13 củ', ['13 củ']],
  [2.2, 4.2, 'đó chính là chai Tygar', ['Tygar']],
  [4.2, 6.0, 'Black Friday giảm 20%', ['giảm']],
  [6.0, 7.4, 'dùng là ghiền luôn', ['ghiền']],
  [7.9, 10.0, 'Mọi người ghé quầy Bvlgari', ['Bvlgari']],
  [10.0, 12.0, 'tặng kem tay full size', ['full size']],
  [12.5, 16.5, 'Ai mua rồi sẽ mua đi mua lại', ['mua đi mua lại']],
  [17.0, 18.9, 'tươi mà không nhạt', ['nhạt']],
  [18.9, 20.8, 'sang mà không nặng', ['nặng']],
];
const SubsDark: React.FC<{fr: number}> = ({fr}) => {
  const cur = SUBS_DARK.find(([s, e]) => fr >= f(s) && fr < f(e));
  if (!cur) return null;
  const [s, e, txt, keys] = cur;
  const a = Math.min(ip(fr, f(s), f(s) + 6), ip(fr, f(e) - 4, f(e), 1, 0, Easing.linear));
  const parts: [string, boolean][] = [];
  let rest = txt;
  while (rest.length) {
    let hit = -1, k = '';
    for (const kw of keys) { const i = rest.indexOf(kw); if (i >= 0 && (hit < 0 || i < hit)) { hit = i; k = kw; } }
    if (hit < 0) { parts.push([rest, false]); break; }
    if (hit > 0) parts.push([rest.slice(0, hit), false]);
    parts.push([k, true]); rest = rest.slice(hit + k.length);
  }
  const fs = Math.min(46, Math.round(800 / (0.53 * txt.length)));
  const sh: React.CSSProperties = {WebkitTextStroke: '7px rgba(20,12,6,.92)', paintOrder: 'stroke fill', textShadow: '0 4px 14px rgba(0,0,0,.55)'};
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1445, textAlign: 'center', whiteSpace: 'nowrap', opacity: a,
    transform: `translateY(${(1 - ip(fr, f(s), f(s) + 7)) * 14}px)`, filter: `blur(${(1 - ip(fr, f(s), f(s) + 6)) * 4}px)`}}>
    {parts.map(([p, k], i) => k
      ? <span key={i} style={{...sh, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: fs * 1.2, color: GOLD_L}}>{p}</span>
      : <span key={i} style={{...sh, fontFamily: SANS, fontWeight: 600, fontSize: fs, color: '#FFF8EC'}}>{p}</span>)}
  </div>;
};

// ---------- 02: thẻ kính + pill ----------
const IcPin = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>;
const IcBottle = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><rect x="8" y="2.5" width="8" height="4" rx="1" /><rect x="5" y="8" width="14" height="13.5" rx="2.5" /><path d="M10 6.5v1.5M14 6.5v1.5" /></svg>;
const IcGift = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><rect x="3.5" y="9" width="17" height="11.5" rx="1.5" /><path d="M2.5 9h19M12 9v11.5" /><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z" /></svg>;
const Glass: React.FC<{fr: number; s: number; e: number; top: number; icon: React.ReactNode; title: string; sub: string; width?: number}> = ({fr, s, e, top, icon, title, sub, width = 660}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 12, 8);
  return (
    <div style={{position: 'absolute', left: CX - width / 2, width, top, opacity: a, transform: `translateY(${ip(fr, f(s), f(s) + 12, 24, 0)}px)`, filter: `blur(${ip(fr, f(s), f(s) + 12, 8, 0)}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 28px', borderRadius: 22, background: 'rgba(255,248,235,.12)', backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,240,215,.28)', boxShadow: '0 18px 50px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18)'}}>
        <div style={{width: 64, height: 64, borderRadius: 32, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(145deg, ${GOLD_L}, ${AMBER})`}}>{icon}</div>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: CREAM, letterSpacing: '-0.01em'}}>{title}</div>
          <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 25, color: 'rgba(245,235,221,.78)', marginTop: 2}}>{sub}</div>
        </div>
      </div>
    </div>
  );
};
const Pill: React.FC<{fr: number; s: number; e: number; y: number; text: string; dark?: boolean}> = ({fr, s, e, y, text, dark}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 12, 6);
  return <div style={{position: 'absolute', left: CX, top: y, transform: `translate(calc(-50% + ${(1 - a) * -40}px),0)`, filter: `blur(${(1 - a) * 6}px)`, opacity: a, padding: '12px 26px', borderRadius: 40,
    background: dark ? 'rgba(13,10,7,.72)' : `linear-gradient(135deg, ${GOLD_L}, ${GOLD})`, color: dark ? GOLD_L : INK, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    border: dark ? `1px solid ${GOLD}` : 'none', boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>{text}</div>;
};

// ---------- 03: số đếm + lưới icon ----------
const Counter: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e + 0.3)) return null;
  const S = f(s), E = f(e);
  const p = ip(fr, S + 6, S + 60, 0, 1, Easing.out(Easing.cubic));
  const pin = ip(fr, S, S + 14);
  const pout = ip(fr, E - 4, E + 8, 0, 1, Easing.inOut(Easing.cubic));
  const n = Math.round(500 * p);
  const pop = fr > S + 60 ? 1 + 0.05 * Math.max(0, 1 - (fr - S - 60) / 10) : 1;
  return (
    <div style={{position: 'absolute', left: SAFE.l - 40, right: SAFE.r - 40, top: 330, textAlign: 'center', opacity: (1 - pout) * pin, filter: `blur(${pout * 12 + (1 - pin) * 6}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, color: CREAM, textShadow: '0 2px 12px rgba(0,0,0,.5)'}}>đã có hơn</div>
      <div style={{...goldText, fontFamily: SANS, fontWeight: 800, fontSize: 300, lineHeight: 1.0, letterSpacing: '-0.05em', marginTop: '-0.42em', fontVariantNumeric: 'tabular-nums', transform: `scale(${pop})`, filter: 'drop-shadow(0 8px 30px rgba(0,0,0,.45))'}}>{n}</div>
    </div>
  );
};
const BottleGrid: React.FC<{fr: number; s: number; e: number; top?: number}> = ({fr, s, e, top = 1150}) => {
  if (!on(fr, s, e)) return null;
  const N = 24, st = f(s) + 8;
  return (
    <div style={{position: 'absolute', left: CX - 330, width: 660, top, opacity: life(fr, s, e, 10, 8)}}>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', rowGap: 10}}>
        {Array.from({length: N}).map((_, i) => {
          const lit = ip(fr, st + i * 2, st + i * 2 + 6);
          return <div key={i} style={{display: 'flex', justifyContent: 'center', opacity: 0.35 + lit * 0.65, filter: lit > 0.5 ? `drop-shadow(0 0 8px ${GOLD})` : 'none'}}><IcBottle c={lit > 0.5 ? GOLD_L : 'rgba(245,235,221,.5)'} s={40} /></div>;
        })}
      </div>
      <div style={{textAlign: 'center', marginTop: 18, fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: '0.16em', color: CREAM, opacity: ip(fr, st + 40, st + 52)}}>KHÁCH ĐÃ CHỌN TYGAR</div>
    </div>
  );
};

// ---------- 04: hai vế ----------
const Duo: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const out = ip(fr, f(e) - 8, f(e), 0, 1, EOUT);
  const L = (txt: string, hi: string, d: number, align: 'left' | 'right') => {
    const st = f(s) + d;
    return (
      <div style={{textAlign: align, lineHeight: 1.15, marginBottom: 6, opacity: ip(fr, st, st + 10), transform: `translateX(${ip(fr, st, st + 12, align === 'left' ? -40 : 40, 0)}px)`, filter: `blur(${ip(fr, st, st + 10, 10, 0)}px)`}}>
        <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, color: CREAM}}>{txt} </span>
        <span style={{display: 'inline-block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 84, ...goldText}}>{hi}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: SAFE.l + 20, right: SAFE.r + 20, top: 350, opacity: 1 - out, filter: `blur(${out * 10}px) drop-shadow(0 6px 20px rgba(0,0,0,.5))`}}>
      {L('tươi mà không', 'nhạt', 4, 'left')}
      {L('sang mà không', 'nặng', 30, 'right')}
    </div>
  );
};

// ---------- 05: serif nghiêng thân hẹp + quầng sáng (Gucci 25/11) ----------
const GLOW = 'drop-shadow(0 0 7px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(255,255,255,0.75))';
const ap = (fr: number, d: number, e: number) => {
  const p = ip(fr, f(d), f(d) + 14);
  const x = ip(fr, f(e) - 8, f(e), 0, 1, Easing.in(Easing.quad));
  return {o: Math.min(1, p * 1.3) * (1 - x), blur: (1 - p) * 12 + x * 10, y: (1 - p) * 16, sp: (1 - p) * 0.12};
};
const GucciBeat: React.FC<{fr: number; s: number; e: number; part: 'back' | 'front'}> = ({fr, s, e, part}) => {
  if (!on(fr, s, e)) return null;
  const small: React.CSSProperties = {fontFamily: SANS, fontWeight: 400, fontSize: 40, letterSpacing: '-0.04em', color: '#2A2622', lineHeight: 1.15, whiteSpace: 'nowrap'};
  const P = (d: number, dx: number, st: React.CSSProperties, txt: string) => {
    const a = ap(fr, d, e);
    return <div style={{...st, opacity: a.o, transform: `translate(${dx}px, ${a.y}px)`, filter: `blur(${a.blur}px) ${GLOW}`, letterSpacing: `calc(${st.letterSpacing ?? '0em'} + ${a.sp}em)`}}>{txt}</div>;
  };
  const heavy = ap(fr, s + 0.2, e);
  return (
    <>
      {part === 'back' && <div style={{position: 'absolute', left: SAFE.l - 30, right: SAFE.r - 30, top: 330, textAlign: 'center', opacity: heavy.o, transform: `translateY(${heavy.y}px) scale(${1.04 - 0.04 * Math.min(1, heavy.o)})`, filter: `blur(${heavy.blur}px)`}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 220, letterSpacing: '-0.045em', color: '#FFFFFF', lineHeight: 1.1, textShadow: '0 22px 46px rgba(28,58,42,0.55), 0 6px 18px rgba(28,58,42,0.35)'}}>-20%</span>
      </div>}
      {part === 'front' && <div data-front style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1110, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {P(s + 0.9, -120, small, 'ở Hà Nội')}
        {P(s + 1.3, 0, {fontFamily: COND, fontStyle: 'italic', fontVariationSettings: "'wdth' 62.5", fontWeight: 600, fontSize: 132, letterSpacing: '-0.01em', color: GREEN, lineHeight: 1.08, whiteSpace: 'nowrap', paddingTop: '0.22em', marginTop: '-0.22em',
          backgroundImage: `linear-gradient(180deg, ${GREEN} 0%, ${GREEN} 55%, #6F8F7C 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'}, 'cũng giảm giá')}
        {P(s + 1.9, 130, {...small, fontWeight: 300}, 'mọi người ơi')}
      </div>}
    </>
  );
};
const GUCCI_SUB: [number, string, boolean][] = [[21.3, 'Gucci', true], [21.6, 'Beauty', true], [21.9, 'ở', false], [22.1, 'Hà', false], [22.3, 'Nội', false], [22.6, 'cũng', false], [22.9, 'giảm', false], [23.2, '20%', true]];
const GUCCI_SUB2: [number, string, boolean][] = [[24.0, 'từ', false], [24.2, 'hôm', false], [24.4, 'nay', false], [24.6, 'đến', false], [24.9, '30/11', true], [25.3, 'luôn', false], [25.5, 'nha', false]];
const SubsGucci: React.FC<{fr: number}> = ({fr}) => {
  const t = fr / FPS;
  const line = t >= 21.2 && t < 23.9 ? GUCCI_SUB : t >= 23.9 && t < 26.4 ? GUCCI_SUB2 : null;
  if (!line) return null;
  const s0 = line === GUCCI_SUB ? 21.2 : 23.9, e0 = line === GUCCI_SUB ? 23.9 : 26.4;
  const o = Math.min(ip(fr, f(s0), f(s0) + 5), ip(fr, f(e0) - 4, f(e0), 1, 0, Easing.linear));
  return (
    <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1460, display: 'flex', justifyContent: 'center', alignItems: 'baseline', columnGap: 10, whiteSpace: 'nowrap', opacity: o,
      filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.8))'}}>
      {line.map(([ws, w, k], i) => {
        const lit = t >= ws - 0.03;
        return k && /\d/.test(w)
          ? <span key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, letterSpacing: '-0.02em', color: lit ? GGOLD : 'rgba(165,122,53,0.45)', lineHeight: 1.25}}>{w}</span>
          : k
          ? <span key={i} style={{fontFamily: COND, fontStyle: 'italic', fontVariationSettings: "'wdth' 62.5", fontWeight: 600, fontSize: 54, color: lit ? GGOLD : 'rgba(165,122,53,0.45)', lineHeight: 1.25}}>{w}</span>
          : <span key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, letterSpacing: '-0.02em', color: lit ? GREEN : 'rgba(28,58,42,0.5)', lineHeight: 1.25}}>{w}</span>;
      })}
    </div>
  );
};

// ---------- 06: chữ viết tay lộ dần (Chloé 25/11) ----------
const ScriptBeat: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const o = life(fr, s, e, 10, 9);
  const tp = ip(fr, f(s + 0.3), f(s + 1.6), 0, 1, Easing.inOut(Easing.sin));
  const small: [string, number][] = [['vì sao', s + 1.4], ['Chloé', s + 1.7], ['luôn có', s + 2.0], ['một chiếc nơ', s + 2.3]];
  return (
    <>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 300, textAlign: 'center', opacity: o}}>
        <div style={{display: 'inline-block', fontFamily: SCRIPT, fontWeight: 700, fontSize: 150, lineHeight: 1.25, padding: '0.3em 0.15em 0', marginTop: '-0.3em',
          backgroundImage: 'linear-gradient(180deg, #A9564F 0%, #C77C72 45%, #E9C2B8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          clipPath: `inset(-40% ${100 - tp * 100}% -40% -5%)`, filter: 'drop-shadow(0 6px 14px rgba(169,86,79,0.18))', transform: 'rotate(-4deg)'}}>Paris 1952</div>
      </div>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 545, opacity: o, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 14}}>
        {small.map(([w, d], i) => {
          const q = ip(fr, f(d), f(d) + 12);
          return <span key={i} style={{fontFamily: SANS, fontWeight: i % 2 ? 400 : 600, fontStyle: 'italic', fontSize: [44, 36, 40, 34][i % 4], color: i % 2 ? '#B99C7D' : '#3A2C25', opacity: q, transform: `translateY(${(1 - q) * 14}px)`, display: 'inline-block', filter: `blur(${(1 - q) * 4}px) drop-shadow(0 0 10px rgba(255,251,244,.9))`}}>{w}</span>;
        })}
      </div>
    </>
  );
};

// ---------- màn kết ----------
const EndCard: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const Rr = (d: number) => ({opacity: ip(fr, f(s) + d, f(s) + d + 12), transform: `translateY(${ip(fr, f(s) + d, f(s) + d + 12, 24, 0)}px)`});
  return (
    <AbsoluteFill style={{background: 'radial-gradient(90% 60% at 50% 40%, rgba(74,50,32,.9), rgba(13,10,7,.96))'}}>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 560, textAlign: 'center'}}>
        <div style={{...Rr(2), fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: '0.42em', color: GOLD}}>KIỂU CHỮ ĐÃ HỌC</div>
        <div style={{...Rr(8), fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 170, lineHeight: 1.1, ...goldText}}>AI Master</div>
        <div style={{...Rr(16), fontFamily: SANS, fontWeight: 300, fontSize: 32, color: CREAM}}>Darren chọn kiểu nào · mình dựng kiểu đó</div>
        <div style={{...Rr(26), marginTop: 50, display: 'inline-flex', alignItems: 'center', gap: 14, padding: '14px 30px', borderRadius: 40, border: `1px solid ${GOLD}`, fontFamily: SANS, fontWeight: 600, fontSize: 32, color: GOLD_L}}><IcGift c={GOLD_L} s={34} />@darrenbeauty01</div>
      </div>
    </AbsoluteFill>
  );
};

export const Demo: React.FC<{safe?: boolean}> = ({safe = false}) => {
  loadFonts(); loadExtra();
  const fr = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: INK}}>
      {SC.map((sc, i) => {
        if (!on(fr, sc.s - 0.3, sc.e + 0.3)) return null;
        const a = Math.min(i === 0 ? 1 : ip(fr, f(sc.s) - 6, f(sc.s) + 6), i === SC.length - 1 ? 1 : ip(fr, f(sc.e) - 6, f(sc.e) + 6, 1, 0, Easing.linear));
        const z = interpolate(fr, [f(sc.s), f(sc.e)], [1, 1.03], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return (
          <AbsoluteFill key={i} style={{opacity: a}}>
            <AbsoluteFill style={{transform: `scale(${z})`}}>
              <Bg fr={fr} tone={sc.tone} />
              {/* lớp SAU người */}
              {i === 0 && <>
                <BigWord fr={fr} s={0.3} e={2.2} small="một chai nước hoa" word="13tr" />
                <BigWord fr={fr} s={2.2} e={4.2} small="đó chính là" word="Tygar" serif />
                <BigWord fr={fr} s={4.2} e={6.0} small="Black Friday" word="-20%" />
                <BigWord fr={fr} s={6.0} e={7.6} small="dùng là" word="ghiền" serif />
              </>}
              {i === 1 && <BigWord fr={fr} s={7.8} e={12.2} small="quầy" word="Bvlgari" serif />}
              {i === 2 && <Counter fr={fr} s={12.3} e={16.8} />}
              {i === 4 && <GucciBeat fr={fr} s={21.0} e={26.6} part="back" />}
              {i !== 6 && <Person tone={sc.tone} />}
              {/* lớp TRƯỚC người */}
              {i === 1 && <>
                <Glass fr={fr} s={8.0} e={12.1} top={1150} icon={<IcPin s={34} />} title="Quầy Bvlgari · Takashimaya" sub="Black Friday 20 – 30/11" />
                <Pill fr={fr} s={9.4} e={12.1} y={1300} text="TẶNG KEM TAY FULL SIZE" dark />
              </>}
              {i === 2 && <BottleGrid fr={fr} s={12.4} e={16.8} />}
              {i === 3 && <Duo fr={fr} s={16.9} e={21.0} />}
              {i === 4 && <GucciBeat fr={fr} s={21.0} e={26.6} part="front" />}
              {i === 5 && <ScriptBeat fr={fr} s={26.6} e={31.2} />}
              {i === 6 && <EndCard fr={fr} s={31.2} e={35.0} />}
            </AbsoluteFill>
            <Label fr={fr} sc={sc} />
          </AbsoluteFill>
        );
      })}
      <SubsDark fr={fr} />
      <SubsGucci fr={fr} />
      {safe && <div style={{position: 'absolute', left: 70, top: 245, width: 820, height: 1290, border: '3px solid rgba(255,0,0,.7)'}} />}
    </AbsoluteFill>
  );
};
