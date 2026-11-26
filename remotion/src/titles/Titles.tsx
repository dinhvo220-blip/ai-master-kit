// Mẫu title học từ 6 ảnh Darren gửi (26/11/2026) + chữ đổi mượt kiểu @raw.to.reel (nhòe ngang vào/ra, chồng nhau, không đứng khựng)
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender, staticFile} from 'remotion';
import {loadFonts} from '../fonts';

const FPS = 30;
const SAFE = {l: 70, r: 190};
const CX = 480;
const SANS = 'Be Vietnam Pro', SERIF = 'NotoSerifDisplay', SCRIPT = 'DancingScript', VIBES = 'GreatVibes', ANTON = 'Anton';
const GOLD = '#D9B26A', GOLD_L = '#F3DDA2', AMBER = '#C47A2C', CREAM = '#F5EBDD';
const f = (t: number) => Math.round(t * FPS);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const EIN = Easing.bezier(0.16, 1, 0.3, 1);      // vào: nhanh rồi phanh mềm
const EOUT = Easing.bezier(0.55, 0, 0.85, 0.35);  // ra: tăng tốc dần
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = EIN) => interpolate(fr, [a, b], [from, to], {...cl, easing: e});

// ---------- font ----------
const R: Record<string, string> = {
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
};
let extra = false;
const loadExtra = () => {
  if (extra) return; extra = true;
  const h = delayRender('title-fonts');
  const J: Promise<any>[] = [];
  const add = (fam: string, url: string, o: FontFaceDescriptors) => J.push(new FontFace(fam, `url(${staticFile('fonts/' + url)}) format('woff2')`, o).load().then((x) => (document as any).fonts.add(x)));
  for (const k of Object.keys(R)) {
    for (const st of ['normal', 'italic']) add(SERIF, `noto-serif-display-${k}-wght-${st}.woff2`, {weight: '100 900', style: st, unicodeRange: R[k]});
    add(SCRIPT, `dancing-script-${k}-700-normal.woff2`, {weight: '700', unicodeRange: R[k]});
    add(VIBES, `great-vibes-${k}-400-normal.woff2`, {weight: '400', unicodeRange: R[k]});
    add(ANTON, `anton-${k}-400-normal.woff2`, {weight: '400', unicodeRange: R[k]});
  }
  Promise.all(J).then(() => continueRender(h)).catch((e) => {console.error(e); continueRender(h);});
};

// ---------- tiện ích ----------
// nhòe NGANG (motion blur theo chiều chạy) – CSS blur() chỉ nhòe đều nên dùng SVG filter
const HBlur: React.FC<{id: string; x: number; y?: number}> = ({id, x, y = 0}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-60%" y="-40%" width="220%" height="180%"><feGaussianBlur stdDeviation={`${Math.max(0.01, x)} ${Math.max(0, y)}`} /></filter>
  </svg>
);
// hạt nhiễu phim
const Grain: React.FC<{fr: number; o?: number; freq?: number}> = ({fr, o = 0.12, freq = 0.85}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: o, pointerEvents: 'none'}}>
    <filter id={`gr${fr}`}><feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={Math.floor(fr / 2)} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter={`url(#gr${fr})`} />
  </svg>
);
const Person: React.FC<{a?: string; b?: string}> = ({a = '#3B2A1E', b = '#120C08'}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs><linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
    <ellipse cx={480} cy={790} rx={150} ry={185} fill="url(#pp)" />
    <rect x={430} y={950} width={100} height={190} fill="url(#pp)" />
    <path d="M 120 1920 C 130 1300, 290 1110, 480 1090 C 670 1110, 830 1300, 840 1920 Z" fill="url(#pp)" />
    <text x={480} y={1760} textAnchor="middle" fill="rgba(255,255,255,.28)" fontFamily={SANS} fontSize={26}>[ vị trí người nói ]</text>
  </svg>
);

// ---------- cảnh ----------
type Sc = {s: number; e: number; label: string};
export const SC: Sc[] = [
  {s: 0, e: 8.2, label: '00 · Chữ đổi mượt – nhòe ngang vào/ra'},
  {s: 8.2, e: 14.0, label: '01 · Serif uốn + chữ tan hạt'},
  {s: 14.0, e: 19.6, label: '02 · Chữ khối + chữ viết tay đè lên'},
  {s: 19.6, e: 25.4, label: '03 · Chữ viết tay nhũ vàng lấp lánh'},
  {s: 25.4, e: 31.0, label: '04 · Serif kính trong + vệt sáng'},
  {s: 31.0, e: 36.4, label: '05 · Chữ mờ nhòe hạt'},
  {s: 36.4, e: 42.0, label: '06 · Tường chữ lặp'},
];
export const TOTAL = 42.0;
const XF = 12; // số frame chồng giữa 2 cảnh

// ================= 00: chữ khổng lồ đổi mượt (học từ mẫu raw.to.reel) =================
// vào: vệt nhòe ngang dài co lại thành chữ (9 frame) · giữa: KHÔNG đứng im, trôi/phóng rất chậm
// ra: chữ kéo giãn ngang thành vệt + mờ dần (10 frame), từ sau vào CHỒNG lên lúc từ trước đang tan
const SmearWord: React.FC<{fr: number; s: number; e: number; small: string; word: string; serif?: boolean; id: string; dir?: number}> = ({fr, s, e, small, word, serif, id, dir = 1}) => {
  const S = f(s), E = f(e);
  if (fr < S - 1 || fr > E + 11) return null;
  const p = ip(fr, S + 1, S + 10, 0, 1, Easing.out(Easing.exp));
  const q = ip(fr, E - 3, E + 7, 0, 1, EOUT);
  const drift = interpolate(fr, [S, E + 10], [0, 1], cl);
  const bx = (1 - p) * 70 + q * 90;
  const sx = 1 + (1 - p) * 0.35 + q * 0.55;
  const o = Math.min(1, p * 1.6) * (1 - q);
  const tx = (1 - p) * -60 * dir + q * 80 * dir + drift * 14 * dir;
  const fs = Math.min(serif ? 290 : 300, (serif ? 820 : 760) / (0.6 * word.length));
  const sm = ip(fr, S + 2, S + 14);
  return (
    <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 330, textAlign: 'center'}}>
      <HBlur id={id} x={bx} />
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, color: CREAM, opacity: sm * (1 - q), letterSpacing: `${(1 - sm) * 0.3}em`, textShadow: '0 2px 12px rgba(0,0,0,.5)', filter: `blur(${q * 6}px)`}}>{small}</div>
      <div style={{marginTop: serif ? '-0.2em' : '-0.32em', transform: `translateX(${tx}px) scale(${1 + drift * 0.035})`}}>
        <div style={{display: 'inline-block', fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 500 : 800, fontSize: fs, lineHeight: 1.1, whiteSpace: 'nowrap', letterSpacing: serif ? '-0.01em' : '-0.05em',
          background: `linear-gradient(180deg, ${GOLD_L} 0%, ${GOLD} 55%, ${AMBER} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingTop: '0.3em', marginTop: '-0.3em',
          opacity: o, transform: `scaleX(${sx})`, filter: `url(#${id}) drop-shadow(0 8px 30px rgba(0,0,0,.45))`}}>{word}</div>
      </div>
    </div>
  );
};
const SUB0: [number, number, string, string][] = [[0.3, 2.3, 'Một chai nước hoa 13 củ', '13 củ'], [2.3, 4.3, 'đó chính là chai Tygar', 'Tygar'], [4.3, 6.2, 'Black Friday giảm sâu', 'giảm sâu'], [6.2, 8.0, 'dùng là ghiền luôn', 'ghiền']];
const SmoothSub: React.FC<{fr: number}> = ({fr}) => (
  <>{SUB0.map(([s, e, t, k], i) => {
    const S = f(s), E = f(e);
    if (fr < S - 1 || fr > E + 8) return null;
    const p = ip(fr, S + 3, S + 10), q = ip(fr, E - 4, E + 2, 0, 1, EOUT);
    const [a, b] = t.split(k);
    const sh: React.CSSProperties = {WebkitTextStroke: '7px rgba(20,12,6,.92)', paintOrder: 'stroke fill'};
    return <div key={i} style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1445, textAlign: 'center', whiteSpace: 'nowrap', opacity: Math.min(p, 1 - q),
      transform: `translateY(${(1 - p) * 12 - q * 10}px)`, filter: `blur(${(1 - p) * 5 + q * 5}px)`}}>
      <span style={{...sh, fontFamily: SANS, fontWeight: 600, fontSize: 46, color: '#FFF8EC'}}>{a}</span>
      <span style={{...sh, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 56, color: GOLD_L}}>{k}</span>
      <span style={{...sh, fontFamily: SANS, fontWeight: 600, fontSize: 46, color: '#FFF8EC'}}>{b}</span>
    </div>;
  })}</>
);
const Scene0: React.FC<{fr: number}> = ({fr}) => {
  const bok = Array.from({length: 12}).map((_, i) => {
    const x = random(`bx${i}`) * 1080, y = 200 + random(`by${i}`) * 1300, r = 40 + random(`br${i}`) * 110;
    return <div key={i} style={{position: 'absolute', left: x + Math.sin(fr / 90 + i) * 20 - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(243,221,162,${0.10 + random(`bo${i}`) * 0.12}), transparent 70%)`}} />;
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 70% at 50% 30%, #4A3220 0%, #2A1A0E 45%, #0D0A07 100%)'}}>
      {bok}
      <SmearWord fr={fr} s={0.3} e={2.3} small="một chai nước hoa" word="13tr" id="w0" />
      <SmearWord fr={fr} s={2.3} e={4.3} small="đó chính là" word="Tygar" serif id="w1" dir={-1} />
      <SmearWord fr={fr} s={4.3} e={6.2} small="Black Friday" word="-20%" id="w2" />
      <SmearWord fr={fr} s={6.2} e={7.9} small="dùng là" word="ghiền" serif id="w3" dir={-1} />
      <Person />
      <SmoothSub fr={fr} />
    </AbsoluteFill>
  );
};

// ================= 01: serif uốn + chữ tan hạt (mẫu "bao giờ cho đến bây giờ") =================
const GrainFx: React.FC<{id: string; scale: number; seed: number}> = ({id, scale, seed}) => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <filter id={id} x="-30%" y="-30%" width="160%" height="160%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </svg>
);
const Scene1: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  const S = f(s), E = f(e);
  const line = (d: number) => {
    const p = ip(fr, S + d, S + d + 22, 0, 1, Easing.out(Easing.cubic));
    const q = ip(fr, E - 16, E, 0, 1, EOUT);
    return {p, q, o: Math.min(1, p * 1.4) * (1 - q), g: (1 - p) * 140 + q * 120};
  };
  const L1 = line(4), L2 = line(10), L3 = line(16);
  const ln = (d: number) => ip(fr, S + d, S + d + 18, 0, 1, Easing.inOut(Easing.cubic));
  const sd = Math.floor(fr / 2);
  const serif = (sz: number, w = 400): React.CSSProperties => ({fontFamily: SERIF, fontWeight: w, fontSize: sz, color: '#F4F1F6', lineHeight: 0.95, letterSpacing: '-0.02em', whiteSpace: 'nowrap'});
  const drift = interpolate(fr, [S, E], [0, 1], cl);
  return (
    <AbsoluteFill style={{background: '#141215'}}>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 45% at 95% 70%, rgba(110,52,140,.55), transparent 70%), radial-gradient(50% 35% at 0% 95%, rgba(90,40,120,.45), transparent 70%)'}} />
      {['a', 'b', 'c', 'd'].map((k, i) => <GrainFx key={k} id={`g1${k}`} scale={[L1.g, L2.g, L3.g, 26][i]} seed={sd + i} />)}
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 560, transform: `scale(${1 + drift * 0.03})`}}>
        {/* dòng 1: chữ đầu tan hạt cố định */}
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', opacity: L1.o, filter: `url(#g1a)`, transform: `translateX(${-40 + (1 - L1.p) * -30}px)`}}>
          <span style={{...serif(118, 500), filter: 'url(#g1d)', opacity: 0.85}}>m</span><span style={serif(118, 500)}>ùi hương</span>
        </div>
        <div style={{position: 'absolute', right: 0, top: -50, textAlign: 'right', opacity: ln(14)}}>
          <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: '0.14em', color: '#EDE7F0'}}>DARREN</div>
        </div>
        <div style={{position: 'absolute', right: 0, top: -4, width: 300, height: 1.5, background: 'rgba(237,231,240,.7)', transformOrigin: 'right', transform: `scaleX(${ln(12)})`}} />
        {/* dòng 2: IN HOA thân mảnh */}
        <div style={{textAlign: 'center', marginTop: 8, opacity: L2.o, filter: `url(#g1b)`, transform: `translateX(${(1 - L2.p) * 30}px)`}}>
          <span style={{...serif(132, 300), letterSpacing: '-0.035em', fontVariationSettings: "'wdth' 80"}}>CỦA RIÊNG</span>
        </div>
        {/* dòng 3: chữ cuối tan hạt */}
        <div style={{display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginTop: 4, opacity: L3.o, filter: `url(#g1c)`, transform: `translateX(${90 + (1 - L3.p) * -30}px)`}}>
          <span style={serif(118, 500)}>mìn</span><span style={{...serif(118, 500), filter: 'url(#g1d)', opacity: 0.85}}>h</span>
        </div>
        <div style={{position: 'absolute', left: 0, bottom: 40, opacity: ln(20)}}>
          <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 28, letterSpacing: '0.06em', color: '#EDE7F0'}}>Bvlgari · Tygar</div>
        </div>
        <div style={{position: 'absolute', left: 0, bottom: 86, width: 300, height: 1.5, background: 'rgba(237,231,240,.7)', transformOrigin: 'left', transform: `scaleX(${ln(18)})`}} />
      </div>
      <Grain fr={fr} o={0.22} />
    </AbsoluteFill>
  );
};

// ================= 02: chữ khối đỏ phát sáng + chữ viết tay đè lên (mẫu "Chomage and Chill") =================
const Scene2: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  const S = f(s), E = f(e);
  const word = 'FRIDAY';
  const q = ip(fr, E - 12, E, 0, 1, EOUT);
  const script = ip(fr, S + 22, S + 46, 0, 1, Easing.inOut(Easing.sin));
  const glow = 0.8 + 0.2 * Math.sin(fr / 9);
  const dust = Array.from({length: 40}).map((_, i) => {
    const x = 120 + random(`dx${i}`) * 760, y0 = 640 + random(`dy${i}`) * 260, sp = 0.6 + random(`ds${i}`) * 1.4;
    const y = y0 - ((fr * sp) % 220);
    return <div key={i} style={{position: 'absolute', left: x, top: y, width: 3 + random(`dz${i}`) * 4, height: 3 + random(`dz${i}`) * 4, borderRadius: '50%', background: '#FF5A2A', opacity: 0.25 + random(`do${i}`) * 0.5, filter: 'blur(1px)'}} />;
  });
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, background: `radial-gradient(55% 22% at 45% 42%, rgba(200,30,10,${0.35 * glow}), transparent 75%)`}} />
      {dust}
      <HBlur id="b2" x={q * 80} />
      <div style={{position: 'absolute', left: SAFE.l - 20, right: SAFE.r - 20, top: 620, textAlign: 'center', opacity: 1 - q, filter: 'url(#b2)', transform: `scaleX(${1 + q * 0.4}) scale(${1 + interpolate(fr, [S, E], [0, 0.03], cl)})`}}>
        <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 36, letterSpacing: '0.5em', color: 'rgba(255,220,200,.85)', opacity: ip(fr, S + 4, S + 18), marginBottom: -10}}>BLACK</div>
        <div style={{display: 'inline-flex', overflow: 'hidden', paddingTop: 10}}>
          {word.split('').map((c, i) => {
            const p = ip(fr, S + 2 + i * 2, S + 16 + i * 2);
            return <span key={i} style={{display: 'inline-block', fontFamily: ANTON, fontSize: 250, lineHeight: 1.05, letterSpacing: '0.01em', transform: `translateY(${(1 - p) * 105}%)`,
              background: `linear-gradient(90deg, rgba(0,0,0,.18) 0 18%, transparent 18% 52%, rgba(0,0,0,.12) 52% 70%, transparent 70%), linear-gradient(180deg, #FF4A26 0%, #E3200F 55%, #A80F07 100%)`,
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: `drop-shadow(0 0 ${18 * glow}px rgba(255,60,20,.75)) drop-shadow(0 0 50px rgba(255,40,0,.45))`}}>{c}</span>;
          })}
        </div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 300, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: '#fff', letterSpacing: '0.1em', opacity: ip(fr, S + 20, S + 30)}}>&amp;</div>
        <div style={{position: 'absolute', left: 0, right: 0, top: 255, textAlign: 'center', transform: 'rotate(-7deg)'}}>
          <span style={{display: 'inline-block', fontFamily: SCRIPT, fontWeight: 700, fontSize: 230, lineHeight: 1.2, padding: '0.2em 0.2em 0',
            background: 'linear-gradient(180deg, #FFE7D2 0%, #FFB089 40%, #F05A2C 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            clipPath: `inset(-30% ${100 - script * 100}% -30% -5%)`, filter: 'drop-shadow(0 6px 18px rgba(0,0,0,.6)) drop-shadow(0 0 14px rgba(255,140,90,.35))'}}>giảm sâu</span>
        </div>
      </div>
      <Grain fr={fr} o={0.12} />
    </AbsoluteFill>
  );
};

// ================= 03: chữ viết tay nhũ vàng + sao lấp lánh (mẫu "Open Atlas") =================
const FOIL = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 0.85  0 0 0 0 0.6  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;
const Star: React.FC<{x: number; y: number; s: number; o: number}> = ({x, y, s, o}) => (
  <svg width={s * 2} height={s * 2} viewBox="-1 -1 2 2" style={{position: 'absolute', left: x - s, top: y - s, opacity: o, filter: 'drop-shadow(0 0 6px #FFE6B0)'}}>
    <path d="M0 -1 C0.06 -0.12 0.12 -0.06 1 0 C0.12 0.06 0.06 0.12 0 1 C-0.06 0.12 -0.12 0.06 -1 0 C-0.12 -0.06 -0.06 -0.12 0 -1Z" fill="#FFF6DE" />
  </svg>
);
const Scene3: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  const S = f(s), E = f(e);
  const q = ip(fr, E - 12, E, 0, 1, EOUT);
  const r1 = ip(fr, S + 4, S + 30, 0, 1, Easing.inOut(Easing.sin));
  const r2 = ip(fr, S + 16, S + 44, 0, 1, Easing.inOut(Easing.sin));
  const shine = interpolate(fr, [S + 40, S + 75], [-40, 140], cl);
  const foil = (sz: number, r: number): React.CSSProperties => ({display: 'inline-block', fontFamily: VIBES, fontSize: sz, lineHeight: 1.15, padding: '0.25em 0.3em 0.1em', whiteSpace: 'nowrap',
    backgroundImage: `linear-gradient(105deg, transparent ${shine - 12}%, rgba(255,255,240,.95) ${shine}%, transparent ${shine + 12}%), ${FOIL}, linear-gradient(170deg, #FFF1D0 0%, #E8B87A 22%, #9A5E2C 45%, #F6D7A0 62%, #B77C45 80%, #FFE9C4 100%)`,
    WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
    WebkitMaskImage: `linear-gradient(90deg, #000 ${r * 120 - 20}%, transparent ${r * 120}%)`, maskImage: `linear-gradient(90deg, #000 ${r * 120 - 20}%, transparent ${r * 120}%)`,
    filter: 'drop-shadow(0 0 1px rgba(255,230,180,.8)) drop-shadow(0 0 18px rgba(255,190,120,.45)) drop-shadow(0 4px 6px rgba(40,0,10,.6))'});
  const stars: [number, number, number, number][] = [[690, 690, 36, 52], [835, 905, 30, 60], [300, 900, 22, 66], [770, 1060, 40, 72], [560, 640, 18, 80]];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 45%, #6B1424 0%, #4A0C18 55%, #2E0610 100%)'}}>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 600, opacity: 1 - q, filter: `blur(${q * 10}px)`, transform: `translateY(${-q * 20}px) scale(${1 + interpolate(fr, [S, E], [0, 0.03], cl)})`}}>
        <div style={{textAlign: 'left', marginLeft: 40}}><span style={foil(205, r1)}>Le Gemme</span></div>
        <div style={{textAlign: 'right', marginTop: -100, marginRight: 0}}><span style={foil(225, r2)}>Tygar</span></div>
        <div style={{textAlign: 'center', marginTop: -20, fontFamily: SERIF, fontWeight: 500, fontSize: 42, color: '#F0C894', opacity: ip(fr, S + 40, S + 54), filter: 'drop-shadow(0 0 10px rgba(255,190,120,.4))'}}>Bvlgari Parfums</div>
      </div>
      {stars.map(([x, y, sz, d], i) => {
        const t = fr - S - d;
        const o = t < 0 ? 0 : Math.max(0, Math.sin((t / 22) * Math.PI)) * (1 - q);
        return <Star key={i} x={x} y={y} s={sz * (0.6 + 0.6 * o)} o={o} />;
      })}
      <Grain fr={fr} o={0.1} />
    </AbsoluteFill>
  );
};

// ================= 04: serif kính trong + vệt sáng chéo (mẫu "dive") =================
const Scene4: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  const S = f(s), E = f(e);
  const p = ip(fr, S + 4, S + 26);
  const q = ip(fr, E - 12, E, 0, 1, EOUT);
  const sweep = interpolate(fr, [S, S + 40], [-400, 1300], {...cl, easing: Easing.inOut(Easing.cubic)});
  const hue = interpolate(fr, [S, E], [0, 60], cl);
  const streaks = Array.from({length: 7}).map((_, i) => {
    const off = (random(`st${i}`) - 0.5) * 900, w = 2 + random(`sw${i}`) * 10, o = 0.15 + random(`so${i}`) * 0.35;
    const mv = interpolate(fr, [S, E], [-120, 120], cl) * (0.5 + random(`sv${i}`));
    return <div key={i} style={{position: 'absolute', left: 480 + off + mv, top: 300, width: w, height: 1300, transform: 'rotate(38deg)', transformOrigin: 'center',
      background: 'linear-gradient(180deg, transparent, rgba(160,200,255,.9) 45%, rgba(220,200,255,.9) 55%, transparent)', opacity: o * p * (1 - q), filter: 'blur(3px)'}} />;
  });
  return (
    <AbsoluteFill style={{background: 'radial-gradient(70% 50% at 80% 10%, rgba(30,50,120,.55), transparent 70%), radial-gradient(60% 40% at 90% 95%, rgba(80,30,110,.5), transparent 70%), #04060D'}}>
      {streaks}
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 520, textAlign: 'center', fontFamily: SERIF, fontWeight: 400, fontSize: 30, letterSpacing: '0.32em', color: '#E8ECF8', opacity: ip(fr, S + 10, S + 26) * (1 - q)}}>GUCCI BEAUTY · HOLIDAY</div>
      <HBlur id="b4" x={(1 - p) * 40 + q * 70} />
      <div style={{position: 'absolute', left: SAFE.l - 30, right: SAFE.r - 30, top: 640, textAlign: 'center', opacity: Math.min(1, p * 1.3) * (1 - q), filter: 'url(#b4)', transform: `scaleX(${1 + q * 0.4}) scale(${1 + interpolate(fr, [S, E], [0, 0.04], cl)})`}}>
        <span style={{display: 'inline-block', fontFamily: SERIF, fontWeight: 300, fontSize: 290, lineHeight: 1.1, letterSpacing: '-0.03em', padding: '0.2em 0.1em 0',
          background: `linear-gradient(${120 + hue}deg, rgba(90,170,255,.55) 0%, rgba(200,225,255,.95) 22%, rgba(110,120,255,.75) 40%, rgba(255,255,255,1) 52%, rgba(170,120,255,.75) 66%, rgba(110,210,255,.7) 85%, rgba(220,200,255,.9) 100%)`,
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', WebkitTextStroke: '1.5px rgba(210,230,255,.75)',
          filter: 'drop-shadow(0 0 10px rgba(120,170,255,.6)) drop-shadow(0 0 40px rgba(120,100,255,.35))'}}>flora</span>
      </div>
      {/* lóe sáng chạy qua */}
      <div style={{position: 'absolute', left: sweep - 160, top: 640, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.9) 0%, rgba(170,200,255,.35) 25%, transparent 60%)', mixBlendMode: 'screen', opacity: 1 - q}} />
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1080, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 40, color: '#C9D4F0', opacity: ip(fr, S + 30, S + 44) * (1 - q)}}>Gorgeous Gardenia</div>
      <Grain fr={fr} o={0.08} />
    </AbsoluteFill>
  );
};

// ================= 05: chữ mờ nhòe hạt (mẫu "VIBE") =================
const Scene5: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  const S = f(s), E = f(e);
  const p = ip(fr, S + 2, S + 30, 0, 1, Easing.out(Easing.cubic));
  const q = ip(fr, E - 12, E, 0, 1, EOUT);
  const breathe = 1.5 * Math.sin(fr / 10);
  const bl = 5 + (1 - p) * 30 + q * 30 + breathe;
  return (
    <AbsoluteFill style={{background: '#08090B'}}>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 520, textAlign: 'center', fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: '0.3em', color: '#E9E6F0', opacity: ip(fr, S + 12, S + 26) * (1 - q)}}>NƯỚC HOA</div>
      <HBlur id="b5" x={bl * 1.8} y={bl * 0.6} />
      <div style={{position: 'absolute', left: SAFE.l - 40, right: SAFE.r - 40, top: 660, textAlign: 'center', opacity: Math.min(1, p * 1.5) * (1 - q), filter: 'url(#b5)', transform: `translateX(${(1 - p) * -30 + q * 40}px) scale(${1.06 - 0.06 * p + interpolate(fr, [S, E], [0, 0.03], cl)})`}}>
        <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 185, letterSpacing: '-0.03em', color: '#FFFFFF', whiteSpace: 'nowrap',
          textShadow: '-14px 0 30px rgba(80,200,255,.75), 14px 0 30px rgba(255,120,220,.7), 0 0 60px rgba(200,200,255,.5)'}}>MÊ MỆT</span>
      </div>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1060, textAlign: 'center', fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: '0.3em', color: '#E9E6F0', opacity: ip(fr, S + 22, S + 36) * (1 - q)}}>DÙNG LÀ GHIỀN</div>
      <Grain fr={fr} o={0.35} freq={1.1} />
    </AbsoluteFill>
  );
};

// ================= 06: tường chữ lặp, chữ khuyết mờ (mẫu denim) =================
const WALL = ['BLACK FRIDAY', 'ESCENTIALS', 'CRESCENT MALL', 'TAKASHIMAYA', '20.11 – 30.11', 'DARREN BEAUTY', 'GIẢM 20%', 'LE GEMME TYGAR', 'BVLGARI', 'QUÀ FULL SIZE'];
const Scene6: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  const S = f(s), E = f(e);
  const q = ip(fr, E - 12, E, 0, 1, EOUT);
  const rows = 26;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', left: SAFE.l + 30, right: SAFE.r + 30, top: 330, height: 1150, overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)', maskImage: 'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)'}}>
        {Array.from({length: rows}).map((_, r) => {
          const st = S + r * 1.2;
          const p = ip(fr, st, st + 14);
          const dir = r % 2 ? 1 : -1;
          const x = dir * ((fr - S) * (0.8 + random(`rv${r}`) * 1.2)) - 300 - random(`ro${r}`) * 300;
          const hi = r === 13;
          return (
            <div key={r} style={{whiteSpace: 'nowrap', height: 44, transform: `translateX(${x + (1 - p) * 120 * dir}px)`, opacity: p * (1 - q), filter: `blur(${(1 - p) * 6 + q * 6}px)`}}>
              {Array.from({length: 8}).map((__, k) => {
                const w = hi ? 'BLACK FRIDAY · GIẢM 20%' : WALL[(r * 3 + k * 7) % WALL.length];
                const dim = hi ? 1 : 0.18 + random(`wd${r}-${k}`) * 0.82;
                const pulse = hi ? 0 : 0.15 * Math.sin(fr / 12 + r + k);
                return <span key={k} style={{fontFamily: SANS, fontWeight: 800, fontSize: hi ? 40 : 36, letterSpacing: '-0.01em', marginRight: 34,
                  color: hi ? '#FFFFFF' : '#2EA8E6', opacity: Math.min(1, Math.max(0.1, dim + pulse)), textShadow: hi ? '0 0 18px rgba(46,168,230,.9)' : 'none'}}>{w}</span>;
              })}
            </div>
          );
        })}
      </div>
      <Grain fr={fr} o={0.08} />
    </AbsoluteFill>
  );
};

const Label: React.FC<{fr: number; sc: Sc}> = ({fr, sc}) => {
  const a = Math.min(ip(fr, f(sc.s) + 4, f(sc.s) + 14), ip(fr, f(sc.e) - 8, f(sc.e), 1, 0));
  return <div style={{position: 'absolute', left: SAFE.l, top: 250, opacity: a * 0.9, padding: '8px 18px', borderRadius: 30, background: 'rgba(245,235,221,.1)', border: '1px solid rgba(245,235,221,.3)',
    fontFamily: SANS, fontWeight: 500, fontSize: 22, color: CREAM}}>{sc.label}</div>;
};

export const Titles: React.FC<{safe?: boolean}> = ({safe = false}) => {
  loadFonts(); loadExtra();
  const fr = useCurrentFrame();
  const scenes = [
    <Scene0 fr={fr} />, <Scene1 fr={fr} s={SC[1].s} e={SC[1].e} />, <Scene2 fr={fr} s={SC[2].s} e={SC[2].e} />, <Scene3 fr={fr} s={SC[3].s} e={SC[3].e} />,
    <Scene4 fr={fr} s={SC[4].s} e={SC[4].e} />, <Scene5 fr={fr} s={SC[5].s} e={SC[5].e} />, <Scene6 fr={fr} s={SC[6].s} e={SC[6].e} />,
  ];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {SC.map((sc, i) => {
        // chồng cảnh XF frame: cảnh mới hiện dần trên cảnh cũ, không cắt cứng
        if (fr < f(sc.s) - XF || fr > f(sc.e) + XF) return null;
        const a = i === 0 ? 1 : ip(fr, f(sc.s) - XF, f(sc.s) + 2, 0, 1, Easing.inOut(Easing.sin));
        return <AbsoluteFill key={i} style={{opacity: a}}>{scenes[i]}<Label fr={fr} sc={sc} /></AbsoluteFill>;
      })}
      {safe && <div style={{position: 'absolute', left: 70, top: 245, width: 820, height: 1290, border: '3px solid rgba(255,0,0,.7)'}} />}
    </AbsoluteFill>
  );
};
