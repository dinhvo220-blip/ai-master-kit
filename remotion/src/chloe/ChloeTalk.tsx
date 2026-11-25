// Chloé – Darren đứng nói "Vì sao luôn có một chiếc nơ" (25/11/2026)
// Nhẹ nhàng kiểu Chloé: tông kem/hồng phấn, serif nghiêng Noto Serif Display + Be Vietnam Pro.
// Nền thay sau lưng (iris mềm): cuộn phim lịch sử, lụa bay, sáng Paris, tiệm hoa, tối Paris. Ảnh chèn ≤2.6 s.
import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate, Easing, random, delayRender, continueRender} from 'remotion';
import {loadFonts} from '../fonts';
import {loadSerif, Mood, C} from './Chloe';
import data from './talk.json';
const D: any = data;
const FPS = 30;
const SAFE_L = 70, SAFE_R = 890;
const SANS = 'Be Vietnam Pro', SERIF = 'NotoSerifDisplay', SCRIPT = 'DancingScript';
let scriptLoaded = false;
const loadScript = () => {
  if (scriptLoaded) return; scriptLoaded = true;
  const h = delayRender('script');
  const R: any = {latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD', 'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF', vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB'};
  Promise.all(Object.keys(R).map((k) => new FontFace(SCRIPT, `url(${staticFile(`fonts/dancing-script-${k}-700-normal.woff2`)}) format('woff2')`, {weight: '700', unicodeRange: R[k]}).load().then((x) => (document as any).fonts.add(x))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
};
const EIN = Easing.bezier(0.16, 1, 0.3, 1), EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const f = (t: number) => Math.round(t * FPS);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const inP = (fr: number, t: number, d = 12) => interpolate(fr, [f(t), f(t) + d], [0, 1], {...cl, easing: EIN});
const outP = (fr: number, t: number, d = 9) => interpolate(fr, [f(t) - d, f(t)], [1, 0], {...cl, easing: EOUT});
const life = (fr: number, s: number, e: number, a = 14, b = 10) => Math.min(inP(fr, s, a), outP(fr, e, b));
const vnCap: React.CSSProperties = {paddingTop: '0.34em', marginTop: '-0.3em'};
const GRADE = 'brightness(1.04) contrast(0.95) saturate(0.93) sepia(0.06)';
const HEAD = {x: 640, y: 760};

// ---------- camera: zoom rất nhẹ theo câu ----------
const camScale = (fr: number) => {
  const z: number[] = D.zooms; let k = 0;
  for (let i = 0; i < z.length; i++) if (fr >= f(z[i])) k = i;
  const tgt = (i: number) => (i % 3 === 1 ? 1.045 : i % 3 === 2 ? 1.02 : 1.0);
  const prev = k > 0 ? tgt(k - 1) : 1.0;
  const p = interpolate(fr, [f(z[k]), f(z[k]) + 20], [0, 1], {...cl, easing: Easing.inOut(Easing.sin)});
  const drift = interpolate(fr - f(z[k]), [0, 240], [0, 0.012], cl);
  return prev + (tgt(k) - prev) * p + drift;
};

// ---------- nền: cuộn phim tư liệu ----------
const FILM = ['chloe/06_gaby_1952.jpg', 'chloe/08_invite_1957.jpg', 'chloe/07_1960_dress.jpg', 'chloe/09_dancer.jpg', 'chloe/10_blouse.jpg', 'chloe/11_blouse_bow.jpg'];
const Strip: React.FC<{lf: number; y: number; rot: number; dir: number; off: number; h: number}> = ({lf, y, rot, dir, off, h}) => {
  const fw = h * 0.78, gap = 26, n = 10;
  const x = -((lf * 2.2 * dir + off) % ((fw + gap) * FILM.length)) - (dir < 0 ? (fw + gap) * FILM.length : 0);
  return (
    <div style={{position: 'absolute', left: -300, top: y, width: 1700, height: h + 70, transform: `rotate(${rot}deg)`, background: '#1d1612', boxShadow: '0 20px 50px rgba(40,25,15,0.35)', overflow: 'hidden'}}>
      {[0, 1].map((r) => (
        <div key={r} style={{position: 'absolute', left: 0, right: 0, top: r ? h + 44 : 9, height: 16, backgroundImage: 'repeating-linear-gradient(90deg, transparent 0 14px, #EFE4D6 14px 30px, transparent 30px 44px)', opacity: 0.85, transform: `translateX(${(x % 44)}px)`}} />
      ))}
      <div style={{position: 'absolute', top: 35, left: 0, height: h, display: 'flex', gap, transform: `translateX(${x}px)`}}>
        {Array.from({length: n * 2}, (_, i) => (
          <div key={i} style={{width: fw, height: h, flex: 'none', overflow: 'hidden', background: '#000'}}>
            <Img src={staticFile(FILM[i % FILM.length])} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'sepia(0.55) contrast(1.05) brightness(0.95)'}} />
          </div>
        ))}
      </div>
    </div>
  );
};
const FilmBg: React.FC<{lf: number}> = ({lf}) => (
  <AbsoluteFill>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 40%, #F7EEE2 0%, #EADCC8 70%, #DCC9B1 100%)'}} />
    <Strip lf={lf} y={250} rot={-7} dir={1} off={0} h={330} />
    <Strip lf={lf} y={1060} rot={-7} dir={-1} off={300} h={330} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 70% at 50% 45%, transparent 50%, rgba(60,40,25,0.35) 100%)'}} />
    <AbsoluteFill style={{opacity: 0.08 + 0.04 * Math.sin(lf * 1.7), background: '#FFE8C8', mixBlendMode: 'screen'}} />
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'multiply'}}>
      <filter id={`gr${lf % 4}`}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={lf % 7} /></filter>
      <rect width="1080" height="1920" filter={`url(#gr${lf % 4})`} />
    </svg>
  </AbsoluteFill>
);

// ---------- nền: lụa bay ----------
const SilkBg: React.FC<{lf: number}> = ({lf}) => {
  const layers = [
    {y: 180, a: 140, c1: '#F8E6DE', c2: '#E9C2B8', sp: 0.022, ph: 0},
    {y: 520, a: 170, c1: '#FFF4EC', c2: '#EED3C6', sp: 0.018, ph: 1.7},
    {y: 900, a: 150, c1: '#F3D7CF', c2: '#DDAFA6', sp: 0.025, ph: 3.1},
    {y: 1250, a: 180, c1: '#FFF1E8', c2: '#E8C4B6', sp: 0.02, ph: 4.4},
  ];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(170deg, #FBEFE8 0%, #F2D9D0 55%, #E8C7BD 100%)'}}>
      <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
        <defs>
          {layers.map((L, i) => (
            <linearGradient key={i} id={`sg${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={L.c2} />
              <stop offset={`${45 + 10 * Math.sin(lf * 0.03 + i)}%`} stopColor={L.c1} />
              <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="100%" stopColor={L.c2} />
            </linearGradient>
          ))}
        </defs>
        {layers.map((L, i) => {
          const t = lf * L.sp * 6 + L.ph;
          const pts = (yy: number, amp: number, k: number) => Array.from({length: 9}, (_, j) => {
            const x = -200 + j * 185; const y = yy + Math.sin(t + j * 0.7 + k) * amp + Math.sin(t * 0.6 + j * 1.3) * amp * 0.35;
            return [x, y];
          });
          const top = pts(L.y, L.a, 0), bot = pts(L.y + 420, L.a * 0.8, 0.9);
          const path = (p: number[][]) => p.map(([x, y], j) => (j ? `S${x - 92} ${y} ${x} ${y}` : `M${x} ${y}`)).join(' ');
          const d = `${path(top)} L${bot[bot.length - 1][0]} ${bot[bot.length - 1][1]} ${path([...bot].reverse()).replace(/^M/, 'L')} Z`;
          return <path key={i} d={d} fill={`url(#sg${i})`} opacity={0.9} style={{filter: 'drop-shadow(0 18px 24px rgba(150,90,80,0.22))'}} />;
        })}
      </svg>
      <AbsoluteFill style={{background: `linear-gradient(105deg, transparent ${(lf * 1.2) % 160 - 30}%, rgba(255,255,255,0.35) ${(lf * 1.2) % 160 - 22}%, transparent ${(lf * 1.2) % 160 - 12}%)`}} />
    </AbsoluteFill>
  );
};

// ---------- nền: sáng sớm Paris (rộng, mái nhà + nắng + sương) ----------
const MorningWide: React.FC<{lf: number}> = ({lf}) => {
  const rise = interpolate(lf, [0, 60], [40, 0], {...cl, easing: EIN});
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #CFE1EA 0%, #EAF0EC 35%, #FBEBD2 68%, #F6DCC4 100%)'}}>
      <div style={{position: 'absolute', left: 120, top: 380 + rise, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, #FFF8E6 0%, rgba(255,232,190,0.85) 25%, rgba(255,226,180,0) 70%)'}} />
      {Array.from({length: 8}, (_, i) => <div key={i} style={{position: 'absolute', left: 380, top: 640, width: 60, height: 1500, transformOrigin: 'top center', transform: `rotate(${-60 + i * 17}deg)`,
        background: 'linear-gradient(180deg, rgba(255,240,205,0.6), rgba(255,240,205,0))', opacity: 0.45 + 0.15 * Math.sin(lf / 25 + i), filter: 'blur(12px)'}} />)}
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <path d="M0 1080 L60 1080 L60 1020 L110 985 L160 1020 L160 1050 L240 1050 L240 980 L262 980 L262 950 L284 950 L284 980 L370 980 L370 1040 L450 1040 L450 965 L500 925 L550 965 L550 1050 L640 1050 L640 1000 L690 1000 L690 975 L708 975 L708 1000 L780 1000 L780 1060 L860 1060 L860 990 L910 950 L960 990 L960 1060 L1080 1060 L1080 1920 L0 1920Z" fill="#CDBBA8" opacity="0.8" />
        <path d="M690 1000 L705 800 L720 1000Z M705 760 L711 800 L699 800Z M680 940 L730 940 L726 955 L684 955Z" fill="#BCA894" opacity="0.85" />
        <path d="M0 1160 L120 1140 L260 1155 L400 1130 L560 1150 L720 1128 L880 1148 L1080 1132 L1080 1920 L0 1920Z" fill="#B9A590" opacity="0.7" />
      </svg>
      {Array.from({length: 34}, (_, i) => {
        const x = random(`mx${i}`) * 1080, y = 250 + random(`my${i}`) * 1300 - lf * (0.2 + random(`mv${i}`) * 0.4);
        const tw = 0.5 + 0.5 * Math.sin(lf / 7 + i * 1.9);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 7, height: 7, borderRadius: '50%', background: '#fff', boxShadow: '0 0 14px 5px rgba(255,244,210,0.9)', opacity: tw}} />;
      })}
    </AbsoluteFill>
  );
};

// ---------- nền: ảnh thật Paris (Unsplash) – mờ chiều sâu + màu theo tông ----------
const TONE: any = {
  morning: {f: 'blur(3px) brightness(1.08) saturate(0.95) sepia(0.08)', ov: 'radial-gradient(circle at 50% 18%, rgba(255,240,210,0.45), transparent 55%)', dust: 1},
  rose: {f: 'blur(3.5px) brightness(1.05) saturate(1.05)', ov: 'linear-gradient(180deg, rgba(255,232,228,0.18), rgba(255,240,235,0.05))', dust: 0},
  evening: {f: 'blur(4px) brightness(0.82) saturate(1.05)', ov: 'radial-gradient(ellipse 80% 60% at 50% 40%, transparent 40%, rgba(25,15,30,0.45) 100%)', dust: 0, bokeh: 1},
};
const PhotoBg: React.FC<{lf: number; b: any}> = ({lf, b}) => {
  const T = TONE[b.tone] || TONE.morning;
  const kb = 1.06 + lf * 0.0006;
  return (
    <AbsoluteFill>
      <Img src={staticFile(b.img)} style={{position: 'absolute', inset: -30, width: 1140, height: 1980, objectFit: 'cover', filter: T.f, transform: `translateX(${b.dx || 0}px) scale(${kb})`, transformOrigin: '50% 40%'}} />
      <AbsoluteFill style={{background: T.ov}} />
      {T.dust ? Array.from({length: 26}, (_, i) => {
        const x = random(`px${i}`) * 1080, y = 200 + random(`py${i}`) * 1300 - lf * (0.2 + random(`pv${i}`) * 0.4);
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 5, height: 5, borderRadius: '50%', background: '#fff', boxShadow: '0 0 12px 4px rgba(255,240,205,0.85)', opacity: 0.5 + 0.5 * Math.sin(lf / 7 + i * 1.9)}} />;
      }) : null}
      {T.bokeh ? Array.from({length: 14}, (_, i) => {
        const x = random(`bx${i}`) * 1080, y = 150 + random(`by${i}`) * 900, r = 30 + random(`br${i}`) * 60;
        return <div key={i} style={{position: 'absolute', left: x - r, top: y - r + Math.sin(lf / 40 + i) * 10, width: r * 2, height: r * 2, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,205,140,0.55), rgba(255,190,120,0) 70%)', opacity: 0.6 + 0.4 * Math.sin(lf / 22 + i)}} />;
      }) : null}
    </AbsoluteFill>
  );
};

const BgSwap: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  const s = f(b.s), e = f(b.e);
  if (fr < s - 1 || fr > e + 1) return null;
  const R = 1700;
  const r = Math.min(interpolate(fr, [s, s + 18], [0, R], {...cl, easing: Easing.bezier(0.33, 0, 0.2, 1)}), interpolate(fr, [e - 14, e], [R, 0], {...cl, easing: Easing.bezier(0.6, 0, 0.8, 0.4)}));
  const lf = fr - s;
  const mask = `radial-gradient(circle at ${HEAD.x}px ${HEAD.y}px, #000 ${Math.max(0, r - 140)}px, transparent ${r}px)`;
  let body: React.ReactNode = null;
  if (b.kind === 'film') body = <FilmBg lf={lf} />;
  else if (b.kind === 'silk') body = <SilkBg lf={lf} />;
  else if (b.kind === 'morning') body = <MorningWide lf={lf} />;
  else if (b.kind === 'photo') body = <PhotoBg lf={lf} b={b} />;
  else body = <Mood fr={fr} sc={{s: b.s, mood: b.kind}} />;
  return <AbsoluteFill style={{WebkitMaskImage: mask, maskImage: mask}}>{body}</AbsoluteFill>;
};

// ---------- tiêu đề (dải trên) ----------
const Title: React.FC<{fr: number; t: any}> = ({fr, t}) => {
  if (fr < f(t.s) - 1 || fr > f(t.e) + 1) return null;
  const o = outP(fr, t.e, 10);
  const lines = t.text.split('\n');
  const kp = inP(fr, t.s, 16);
  const right = t.side === 'r';
  return (
    <div style={{position: 'absolute', left: right ? 440 : SAFE_L, width: right ? SAFE_R - 440 : SAFE_R - SAFE_L, top: 268, textAlign: right ? 'right' : 'center', opacity: o, transform: `translateY(${(1 - o) * -16}px)`}}>
      {right ? <div style={{position: 'absolute', inset: '-26px -30px -24px -40px', borderRadius: 26, background: 'rgba(255,249,243,0.78)', backdropFilter: 'blur(10px)', boxShadow: '0 12px 34px rgba(80,60,40,0.15)', opacity: kp}} />
        : <div style={{position: 'absolute', left: '50%', top: '50%', width: 860, height: 380, marginLeft: -430, marginTop: -190, background: 'radial-gradient(ellipse at center, rgba(255,248,240,0.78) 0%, rgba(255,248,240,0.45) 45%, transparent 72%)', opacity: kp}} />}
      <div style={{position: 'relative'}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: `${0.5 - 0.22 * kp}em`, color: C.nude2, opacity: kp, marginBottom: 6}}>{t.kick}</div>
        {lines.map((ln: string, i: number) => {
          const p = inP(fr, t.s + 0.1 + i * 0.12, 18);
          return (
            <div key={i} style={{overflow: 'hidden', paddingBottom: 8}}>
              <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: t.size, lineHeight: 1.08, color: C.ink, ...vnCap, transform: `translateY(${(1 - p) * 105}%)`}}>{ln}</div>
            </div>
          );
        })}
        <div style={{margin: right ? '10px 0 0 auto' : '10px auto 0', width: 100 * inP(fr, t.s + 0.3, 20), height: 1.5, background: `linear-gradient(90deg, transparent, ${C.nude2}, transparent)`}} />
      </div>
    </div>
  );
};

const Trio: React.FC<{fr: number}> = ({fr}) => {
  const T = D.trio;
  if (fr < f(T.s) - 1 || fr > f(T.e) + 1) return null;
  const o = outP(fr, T.e, 10);
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 262, height: 330, opacity: o}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 900, height: 420, marginLeft: -450, marginTop: -210, background: 'radial-gradient(ellipse at center, rgba(255,248,240,0.8) 0%, rgba(255,248,240,0.4) 45%, transparent 72%)', opacity: inP(fr, T.s, 14)}} />
      {T.words.map(([w, d]: [string, number], i: number) => {
        const p = inP(fr, d, 16);
        const pos = [{l: 30, t: 10}, {l: 300, t: 105}, {l: 470, t: 205}][i];
        return <div key={i} style={{position: 'absolute', left: pos.l, top: pos.t, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 74, color: i === 1 ? C.rose : C.ink, opacity: p, letterSpacing: `${0.12 - 0.12 * p}em`, transform: `translateY(${(1 - p) * 20}px)`, filter: `blur(${(1 - p) * 6}px)`, ...vnCap}}>{w}</div>;
      })}
    </div>
  );
};

const Quote: React.FC<{fr: number}> = ({fr}) => {
  const q = D.quote; if (fr < f(q.s) - 1 || fr > f(q.e) + 1) return null;
  const p = inP(fr, q.s, 16), o = Math.min(p, outP(fr, q.e, 10));
  return (
    <div style={{position: 'absolute', left: 150, width: 660, top: 290, opacity: o, transform: `translateY(${(1 - p) * 26}px) rotate(${-1.5 * p}deg)`}}>
      <div style={{background: '#FFFBF5', padding: '34px 40px 30px', boxShadow: '0 20px 44px rgba(80,60,40,0.22)', border: `1px solid ${C.nude}`, textAlign: 'center'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 110, lineHeight: 0.5, color: C.nude2, height: 44}}>“</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 46, color: C.ink, ...vnCap}}>{q.text}</div>
        <div style={{margin: '14px auto 0', width: 120 * inP(fr, q.s + 0.3, 18), height: 1.5, background: C.nude2}} />
      </div>
    </div>
  );
};

const Chips: React.FC<{fr: number}> = ({fr}) => {
  const vis = D.chips.filter((c: any) => fr >= f(c.d) - 1 && fr <= f(c.e) + 1);
  return (
    <div style={{position: 'absolute', left: 84, top: 700, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start'}}>
      {vis.map((c: any, i: number) => {
        const p = inP(fr, c.d, 14), o = Math.min(p, outP(fr, c.e, 10));
        return <div key={c.text} style={{opacity: o, transform: `translateX(${(1 - p) * -30}px)`, padding: '10px 26px', borderRadius: 999, background: 'rgba(255,250,244,0.88)', backdropFilter: 'blur(8px)', border: `1.5px solid ${C.nude}`, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 36, color: C.ink, boxShadow: '0 10px 24px rgba(80,60,40,0.16)', ...vnCap, paddingTop: 22}}>{c.text}</div>;
      })}
    </div>
  );
};

const Insert: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  const s = f(b.s), e = f(b.e);
  if (fr < s - 1 || fr > e + 1) return null;
  const o = Math.min(inP(fr, b.s, 10), outP(fr, b.e, 10));
  const x = interpolate(fr, [f(b.sw) - 7, f(b.sw) + 7], [0, 1], {...cl, easing: Easing.inOut(Easing.sin)});
  const kb = interpolate(fr, [s, e], [1.06, 1.0], cl);
  const kp = inP(fr, b.s + 0.15, 16);
  return (
    <AbsoluteFill style={{opacity: o, filter: `blur(${(1 - o) * 10}px)`}}>
      <AbsoluteFill style={{background: C.bg}} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 70% at 50% 45%, ${C.cream} 0%, ${C.bg} 55%, ${C.bg2} 100%)`}} />
      <div style={{position: 'absolute', left: 480 - 345, top: 445, width: 690, height: 920, transform: `translateY(${(1 - o) * 30}px)`}}>
        <div style={{position: 'absolute', inset: -16, background: C.cream, boxShadow: '0 28px 60px rgba(80,60,40,0.25), 0 2px 8px rgba(80,60,40,0.12)'}} />
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#fff'}}>
          {b.imgs.map((im: string, i: number) => (
            <AbsoluteFill key={i} style={{opacity: i === 0 ? 1 : x}}>
              <Img src={staticFile(im)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb + (i ? 0.04 * (1 - x) : 0)})`}} />
            </AbsoluteFill>
          ))}
        </div>
        <div style={{position: 'absolute', inset: -8, border: `1px solid ${C.nude2}`, opacity: 0.6}} />
      </div>
      <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 285, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: `${0.5 - 0.22 * kp}em`, color: C.nude2, opacity: kp, marginBottom: 6}}>{b.kick}</div>
        <div style={{overflow: 'hidden', paddingBottom: 8}}>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 64, color: C.ink, ...vnCap, transform: `translateY(${(1 - inP(fr, b.s + 0.25, 18)) * 105}%)`}}>{b.label}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Deal: React.FC<{fr: number; d: any}> = ({fr, d}) => {
  if (fr < f(d.s) - 1 || fr > f(d.e) + 1) return null;
  const p = inP(fr, d.s, 16), o = Math.min(p, outP(fr, d.e, 10));
  const bp = inP(fr, d.s + 0.2, 20);
  return (
    <div style={{position: 'absolute', left: 150, width: 660, top: 268, opacity: o, transform: `translateY(${(1 - p) * 24}px) scale(${0.96 + 0.04 * p})`}}>
      <div style={{borderRadius: 28, background: 'rgba(255,250,244,0.9)', backdropFilter: 'blur(12px)', border: `1.5px solid ${C.nude}`, boxShadow: '0 18px 40px rgba(80,60,40,0.2)', padding: '24px 30px 22px', textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: '0.3em', color: C.nude2}}>{d.kick}</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: d.gift ? 76 : 110, lineHeight: 1.1, color: d.gift ? C.ink : C.rose, fontVariantNumeric: 'lining-nums', ...vnCap,
          letterSpacing: `${0.1 - 0.1 * bp}em`, opacity: bp}}>{d.big}</div>
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: C.ink2, marginTop: 2}}>{d.sub}</div>
      </div>
    </div>
  );
};

const Pin: React.FC<{fr: number}> = ({fr}) => {
  const q = D.pin; if (fr < f(q.s) - 1 || fr > f(q.e) + 1) return null;
  const p = inP(fr, q.s, 16), o = Math.min(p, outP(fr, q.e, 10));
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 300, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - p) * 20}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20, padding: '18px 34px 18px 26px', borderRadius: 999, background: 'rgba(255,250,244,0.9)', backdropFilter: 'blur(12px)', border: `1.5px solid ${C.nude}`, boxShadow: '0 16px 36px rgba(80,60,40,0.2)'}}>
        <svg width="40" height="52" viewBox="0 0 22 28"><path d="M11 1C5.5 1 1 5.3 1 10.6 1 18 11 27 11 27s10-9 10-16.4C21 5.3 16.5 1 11 1z" fill={C.rose} /><circle cx="11" cy="10.5" r="3.6" fill="#FFF6F0" /></svg>
        <div>
          <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 48, color: C.ink, lineHeight: 1.1, ...vnCap}}>{q.a}</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.08em', color: C.ink2}}>{q.b}</div>
        </div>
      </div>
    </div>
  );
};

const End: React.FC<{fr: number}> = ({fr}) => {
  const s = D.end.s; if (fr < f(s)) return null;
  const p = inP(fr, s, 22);
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 270, textAlign: 'center', opacity: p}}>
      <div style={{position: 'absolute', left: '50%', top: '50%', width: 860, height: 400, marginLeft: -430, marginTop: -200, background: 'radial-gradient(ellipse at center, rgba(255,248,240,0.85) 0%, rgba(255,248,240,0.45) 45%, transparent 72%)'}} />
      <div style={{position: 'relative'}}>
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 96, letterSpacing: `${0.2 - 0.17 * p}em`, color: C.ink, lineHeight: 1.1, ...vnCap}}>Chloé</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 34, color: C.ink2}}>câu chuyện của chiếc nơ</div>
        <div style={{margin: '14px auto 10px', width: 160 * inP(fr, s + 0.3, 20), height: 1.5, background: C.nude2}} />
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: '0.12em', color: C.rose}}>@darrenbeauty01</div>
      </div>
    </div>
  );
};

// ---------- bố cục khung người bo góc (mẫu Darren 25/11) ----------
const CT = 1050, CS = 0.95, CTX = -6, CTY = 452;
const spans = (() => { const r: any[] = []; for (const c of D.cards) { const l = r[r.length - 1]; if (l && c.s - l.e < 1.6) l.e = c.e; else r.push({s: c.s, e: c.e}); } return r; })();
const cardP = (fr: number) => {
  for (const sp of spans) {
    const s = f(sp.s), e = f(sp.e);
    if (fr >= s - 1 && fr <= e + 1) return Math.min(interpolate(fr, [s, s + 16], [0, 1], {...cl, easing: Easing.bezier(0.33, 0, 0.15, 1)}), interpolate(fr, [e - 14, e], [1, 0], {...cl, easing: Easing.bezier(0.6, 0, 0.8, 0.5)}));
  }
  return 0;
};
const CardBg: React.FC<{fr: number; p: number}> = ({fr, p}) => (
  <AbsoluteFill style={{opacity: Math.min(1, p * 1.5), background: 'linear-gradient(180deg, #FFF8F3 0%, #F8E9E3 45%, #F1D9D2 100%)'}}>
    <AbsoluteFill style={{background: `radial-gradient(circle at ${30 + 10 * Math.sin(fr / 60)}% 22%, rgba(255,255,255,0.9), transparent 45%)`}} />
  </AbsoluteFill>
);
const CardTop: React.FC<{fr: number}> = ({fr}) => (
  <>
    {D.cards.map((c: any, k: number) => {
      if (fr < f(c.s) - 1 || fr > f(c.e) + 1) return null;
      const o = Math.min(inP(fr, c.s + 0.15, 14), outP(fr, c.e, 10));
      const tp = inP(fr, c.s + 0.3, 22);
      const lf = fr - f(c.s);
      return (
        <AbsoluteFill key={k} style={{opacity: Math.max(o, fr < f(c.e) + 1 ? 1 : 0)}}>
          {(() => {
            const ein = interpolate(fr, [f(c.s), f(c.s) + 16], [1, 0], {...cl, easing: Easing.bezier(0.16, 1, 0.3, 1)});
            const eout = interpolate(fr, [f(c.e) - 12, f(c.e)], [0, 1], {...cl, easing: Easing.bezier(0.7, 0, 0.84, 0)});
            const x = 640 * ein - 640 * eout;
            return (
              <div style={{position: 'absolute', left: 480 - 165, top: 262, width: 330, height: 440, borderRadius: 28, overflow: 'hidden', zIndex: 2, boxShadow: '0 22px 46px rgba(120,70,60,0.28)', border: '7px solid #FFFaf6',
                transform: `translateX(${x}px) rotate(${(ein - eout) * 8 + 1.5}deg)`, filter: `blur(${(ein + eout) * 6}px)`}}>
                <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos, transform: `scale(${1.1 - lf * 0.0008})`}} />
              </div>
            );
          })()}
          <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 655, textAlign: 'center', opacity: o, zIndex: 1}}>
            <div style={{display: 'inline-block', fontFamily: SCRIPT, fontWeight: 700, fontSize: 122, lineHeight: 1.25, paddingTop: '0.3em', marginTop: '-0.3em', padding: '0.3em 0.15em 0', 
              backgroundImage: 'linear-gradient(180deg, #A9564F 0%, #C77C72 45%, #E9C2B8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              clipPath: `inset(-40% ${100 - tp * 100}% -40% -5%)`, filter: 'drop-shadow(0 6px 14px rgba(169,86,79,0.18))', transform: `rotate(-4deg)`}}>{c.script}</div>
          </div>
          <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 900, opacity: o, display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 14}}>
            {c.small.map(([w, d]: [string, number], i: number) => {
              const q = inP(fr, d, 12);
              return <span key={i} style={{fontFamily: SANS, fontWeight: i % 2 ? 400 : 600, fontStyle: 'italic', fontSize: [44, 36, 40, 34][i % 4], color: i % 2 ? '#B99C7D' : '#3A2C25', opacity: q, transform: `translateY(${(1 - q) * 14}px)`, display: 'inline-block', filter: `blur(${(1 - q) * 4}px)`}}>{w}</span>;
            })}
          </div>
        </AbsoluteFill>
      );
    })}
  </>
);

const Subs: React.FC<{fr: number}> = ({fr}) => {
  const t = fr / FPS; const cp = cardP(fr);
  const s = D.subs.find((x: any) => t >= x.s && t < x.e);
  if (!s) return null;
  const o = Math.min(inP(fr, s.s, 5), outP(fr, s.e, 4));
  const p = inP(fr, s.s, 8);
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 1392 + 70 * cp, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'baseline', columnGap: 11, maxWidth: SAFE_R - SAFE_L - 20, padding: '8px 26px 12px', borderRadius: 22,
        background: 'rgba(255,250,245,0.82)', backdropFilter: 'blur(10px)', boxShadow: '0 8px 24px rgba(80,55,40,0.18)', border: '1px solid rgba(217,198,174,0.7)', transform: `translateY(${(1 - p) * 8}px)`}}>
        {s.words.map((w: any, i: number) => {
          const on = t >= w.s - 0.03;
          return w.k
            ? <span key={i} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 46, lineHeight: 1.35, color: C.rose, opacity: on ? 1 : 0.42}}>{w.w}</span>
            : <span key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, lineHeight: 1.35, color: C.ink, opacity: on ? 1 : 0.42}}>{w.w}</span>;
        })}
      </div>
    </div>
  );
};

export const ChloeTalk: React.FC = () => {
  loadFonts(); loadSerif(); loadScript();
  const fr = useCurrentFrame();
  const z = camScale(fr);
  const p = cardP(fr);
  const cam: React.CSSProperties = {transform: `scale(${z})`, transformOrigin: '56% 42%'};
  const lay: React.CSSProperties = {transform: `translate(${CTX * p}px, ${CTY * p}px) scale(${1 - (1 - CS) * p})`, transformOrigin: '0 0'};
  const clip = p > 0 ? `inset(${CT * p}px ${60 * p}px ${24 * p}px ${60 * p}px round ${60 * p}px)` : undefined;
  const pclip = p > 0 ? `inset(0 0 ${(1920 - CT - 90) * p}px 0)` : undefined;
  const titles = D.titles.filter((t: any) => t.behind);
  const front = D.titles.filter((t: any) => !t.behind);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {p > 0 ? <CardBg fr={fr} p={p} /> : null}
      {p > 0 ? <CardTop fr={fr} /> : null}
      <AbsoluteFill style={{clipPath: clip, boxShadow: p > 0 ? '0 20px 50px rgba(120,70,60,0.3)' : undefined}}>
        <AbsoluteFill style={lay}><AbsoluteFill style={cam}>
          <OffthreadVideo src={staticFile('chloe_base.mp4')} muted style={{width: '100%', height: '100%', filter: GRADE}} />
          {D.bgs.map((b: any, i: number) => <BgSwap key={i} fr={fr} b={b} />)}
        </AbsoluteFill></AbsoluteFill>
      </AbsoluteFill>
      {titles.map((t: any, i: number) => <Title key={i} fr={fr} t={t} />)}
      <Trio fr={fr} />
      <End fr={fr} />
      <AbsoluteFill style={{clipPath: pclip}}>
        <AbsoluteFill style={lay}><AbsoluteFill style={cam}>
          <OffthreadVideo src={staticFile('chloe_person.webm')} muted transparent style={{width: '100%', height: '100%', filter: GRADE}} />
        </AbsoluteFill></AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 18% 12%, rgba(255,236,220,0.35), transparent 45%)', mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 60%, rgba(70,45,35,0.18) 100%)', opacity: 1 - p}} />
      {front.map((t: any, i: number) => <Title key={i} fr={fr} t={t} />)}
      <Quote fr={fr} />
      <Chips fr={fr} />
      {D.deal.map((d: any, i: number) => <Deal key={i} fr={fr} d={d} />)}
      <Pin fr={fr} />
      {D.inserts.map((b: any, i: number) => <Insert key={i} fr={fr} b={b} />)}
      <Subs fr={fr} />
    </AbsoluteFill>
  );
};
