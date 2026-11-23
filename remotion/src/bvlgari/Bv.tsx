// Style "Bvlgari Holiday 2026" – sao 8 cánh, bầu trời sao + pháo hoa vàng, lưới Pantheon. Chữ serif sang, dễ đọc. 23/11/2026
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender} from 'remotion';
import {noise2D} from '@remotion/noise';
import {loadFonts} from '../fonts';

const FPS = 30;
const SAFE = {l: 70, r: 190, t: 245, b: 385};
const CX = 480;
const W_SAFE = 820;
const NAVY = '#0E1936';
const NAVY2 = '#1E2E63';
const GOLD = '#D9B76C';
const GOLD_L = '#F5E6B8';
const WHITE = '#FFFFFF';
const SANS = 'Be Vietnam Pro';
const SERIF = 'Noto Serif Display';
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const f = (t: number) => Math.round(t * FPS);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = EIN) =>
  interpolate(fr, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const life = (fr: number, s: number, e: number, inD = 12, outD = 8) => Math.min(ip(fr, f(s), f(s) + inD), ip(fr, f(e) - outD, f(e), 1, 0, EOUT));
const active = (fr: number, s: number, e: number) => fr >= f(s) && fr < f(e);
type DT = any;

const VI = 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB';
const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LEXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+20A0-20AB, U+20AD-20C0';
let serifLoaded = false;
const loadSerif = () => {
  if (serifLoaded) return; serifLoaded = true;
  const h = delayRender('serif');
  const jobs: Promise<any>[] = [];
  for (const st of ['normal', 'italic']) for (const [sub, r] of [['latin', LAT], ['latin-ext', LEXT], ['vietnamese', VI]]) {
    const ff = new FontFace(SERIF, `url(${staticFile(`fonts/noto-serif-display-${sub}-wght-${st}.woff2`)}) format('woff2')`, {weight: '100 900', style: st, unicodeRange: r});
    jobs.push(ff.load().then((x) => (document as any).fonts.add(x)));
  }
  Promise.all(jobs).then(() => continueRender(h)).catch(() => continueRender(h));
};

const head = (D: DT, fr: number) => { const h = D.head[Math.min(fr, D.head.length - 1)]; return {x: h[0], y: h[1], top: h[2], w: h[3]}; };

// ---------- camera ----------
const camera = (D: DT, fr: number) => {
  let s = 1, blur = 0, bright = 1, tx = 0, ty = 0;
  let sh = D.shots[0];
  for (const x of D.shots) if (fr >= f(x.s)) sh = x;
  s *= sh.z + ip(fr, f(sh.s), f(sh.e), 0, 0.03, Easing.linear);
  for (const p of D.punches) {
    const pf = f(p.t), hd = Math.max(9, p.hold ?? 20);
    const v = interpolate(fr, [pf - 4, pf + 8, pf + hd, pf + hd + 14], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
    s *= 1 + v * (p.amt ?? 0.04);
  }
  for (const c of D.cuts) {
    const cf = f(c.t);
    if (fr >= cf - 7 && fr < cf + 10) {
      const v = fr < cf ? ip(fr, cf - 7, cf, 0, 1, Easing.in(Easing.cubic)) : ip(fr, cf, cf + 10, 1, 0, Easing.out(Easing.cubic));
      s *= 1 + 0.07 * v; blur += 10 * v; bright += 0.12 * v;
    }
  }
  for (const sk of D.shakes ?? []) {
    const sf = f(sk.t);
    if (fr >= sf && fr < sf + 10) { const a = (sk.amp ?? 8) * (1 - (fr - sf) / 10); tx += noise2D('x', fr * 0.5, 0) * a; ty += noise2D('y', fr * 0.5, 0) * a; }
  }
  const h = head(D, fr);
  return {s, blur, bright, tx, ty, ox: h.x, oy: h.y};
};
const camStyle = (c: any, k = 1): React.CSSProperties => ({position: 'absolute', inset: 0, transformOrigin: `${c.ox}px ${c.oy}px`, transform: `translate(${c.tx * k}px,${c.ty * k}px) scale(${1 + (c.s - 1) * k})`});

// ---------- motifs ----------
const STAR8 = (r: number, ri: number) => {
  const p: string[] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 - Math.PI / 2; const rr = i % 2 ? ri : r; p.push(`${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)}`); }
  return 'M' + p.join('L') + 'Z';
};
const Star: React.FC<{size: number; color?: string; glow?: boolean; style?: React.CSSProperties}> = ({size, color = GOLD, glow, style}) => (
  <svg width={size} height={size} viewBox="-10 -10 20 20" style={{overflow: 'visible', ...(glow ? {filter: `drop-shadow(0 0 ${size * 0.15}px ${GOLD_L})`} : {}), ...style}}>
    <defs><linearGradient id="sg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={GOLD_L} /><stop offset=".55" stopColor={color} /><stop offset="1" stopColor="#9C7A35" /></linearGradient></defs>
    <path d={STAR8(10, 4.2)} fill="url(#sg)" />
  </svg>
);
const goldText: React.CSSProperties = {background: `linear-gradient(180deg, ${GOLD_L} 0%, ${GOLD} 55%, #A9843F 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

// bầu trời sao (nền)
const SkyField: React.FC<{fr: number; n?: number; seed?: string}> = ({fr, n = 60, seed = 'a'}) => <>
  {Array.from({length: n}).map((_, i) => {
    const x = random(`${seed}x${i}`) * 1080, y = random(`${seed}y${i}`) * 1920, ph = random(`${seed}p${i}`) * 60;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin((fr + ph) * 0.12));
    const big = random(`${seed}b${i}`) > 0.85;
    return big ? <Star key={i} size={26 + random(`${seed}s${i}`) * 20} glow style={{position: 'absolute', left: x, top: y, opacity: tw, transform: `rotate(${fr * 0.6}deg)`}} />
      : <div key={i} style={{position: 'absolute', left: x, top: y, width: 4, height: 4, borderRadius: 2, background: GOLD_L, opacity: tw, boxShadow: `0 0 8px ${GOLD_L}`}} />;
  })}
</>;
// pháo hoa vàng
const Firework: React.FC<{x: number; y: number; k: number; r?: number}> = ({x, y, k, r = 220}) => {
  if (k < 0 || k > 26) return null;
  const p = ip(k, 0, 20, 0, 1, Easing.out(Easing.cubic)); const o = ip(k, 12, 26, 1, 0);
  return <svg width={2 * r} height={2 * r} viewBox={`${-r} ${-r} ${2 * r} ${2 * r}`} style={{position: 'absolute', left: x - r, top: y - r, opacity: o, overflow: 'visible'}}>
    {Array.from({length: 16}).map((_, i) => { const a = (i / 16) * Math.PI * 2; const r1 = r * p * 0.55, r2 = r * p;
      return <g key={i}><line x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={GOLD_L} strokeWidth={3} strokeLinecap="round" />
        <circle cx={Math.cos(a) * r2} cy={Math.sin(a) * r2} r={4} fill={GOLD} /></g>; })}
  </svg>;
};

// ---------- transitions ----------
// 1) StarWipe: sao 8 cánh vàng lớn dần che cảnh -> cắt -> mở ra qua lỗ hình sao
const StarWipe: React.FC<{fr: number; t: number}> = ({fr, t}) => {
  const cf = f(t);
  if (fr < cf - 10 || fr > cf + 12) return null;
  const pre = fr < cf;
  const sc = pre ? ip(fr, cf - 10, cf, 0, 140, Easing.in(Easing.cubic)) : 0;
  const hole = pre ? 0 : ip(fr, cf, cf + 12, 0, 150, Easing.in(Easing.quad));
  const rot = (fr - cf) * 4;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs><radialGradient id="wg" cx="50%" cy="45%" r="70%"><stop offset="0" stopColor={GOLD_L} /><stop offset=".5" stopColor={GOLD} /><stop offset="1" stopColor="#8C6A2C" /></radialGradient></defs>
      {pre ? <path d={STAR8(10, 4.2)} fill="url(#wg)" transform={`translate(540 860) scale(${sc}) rotate(${rot})`} /> : null}
    </svg>
    {!pre ? <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs><mask id="hm"><rect width="1080" height="1920" fill="white" /><path d={STAR8(10, 4.2)} fill="black" transform={`translate(540 860) scale(${hole}) rotate(${rot})`} /></mask>
        <radialGradient id="wg2" cx="50%" cy="45%" r="70%"><stop offset="0" stopColor={GOLD_L} /><stop offset=".5" stopColor={GOLD} /><stop offset="1" stopColor="#8C6A2C" /></radialGradient></defs>
      <rect width="1080" height="1920" fill="url(#wg2)" mask="url(#hm)" />
    </svg> : null}
  </AbsoluteFill>;
};
// 2) SkyWipe: màn trời sao xanh đêm quét chéo + pháo hoa vàng + tên chương (ngắn ~1.2s)
const SkyWipe: React.FC<{fr: number; w: any}> = ({fr, w}) => {
  const cf = f(w.t), dur = f(w.hold ?? 1.0);
  if (fr < cf - 9 || fr > cf + dur + 10) return null;
  const inP = ip(fr, cf - 9, cf, 0, 1, Easing.inOut(Easing.cubic));
  const outP = ip(fr, cf + dur, cf + dur + 10, 0, 1, Easing.inOut(Easing.cubic));
  const x0 = (1 - inP) * 1500, x1 = -outP * 1500;
  const k = fr - cf;
  return <AbsoluteFill style={{pointerEvents: 'none', transform: `translateX(${inP < 1 ? x0 : x1}px) skewX(-8deg)`}}>
    <AbsoluteFill style={{left: -300, right: -300, background: `radial-gradient(ellipse at 50% 40%, ${NAVY2} 0%, ${NAVY} 60%, #070D20 100%)`}} />
    <AbsoluteFill style={{left: -300, right: -300, background: `linear-gradient(90deg, ${GOLD} 0, ${GOLD_L} 10px, transparent 10px), linear-gradient(270deg, ${GOLD} 0, ${GOLD_L} 10px, transparent 10px)`}} />
    <SkyField fr={fr} n={46} seed={'w' + w.t} />
    <Firework x={250} y={600} k={k + 4} />
    <Firework x={820} y={1150} k={k - 4} r={180} />
    <Firework x={300} y={1350} k={k - 10} r={150} />
    <div style={{position: 'absolute', left: SAFE.l + 40, width: W_SAFE, top: 760, textAlign: 'center', transform: 'skewX(8deg)'}}>
      <div style={{display: 'flex', justifyContent: 'center', marginBottom: 18}}><Star size={54} glow style={{transform: `rotate(${k * 3}deg) scale(${ip(k, 0, 10)})`}} /></div>
      {w.kicker ? <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 12, color: GOLD_L, opacity: ip(k, 2, 12)}}>{w.kicker}</div> : null}
      <div style={{overflow: 'hidden', paddingTop: 40, marginTop: -30}}>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: w.size ?? 96, lineHeight: 1.15, letterSpacing: 2, ...goldText, transform: `translateY(${(1 - ip(k, 2, 16)) * 110}%)`, whiteSpace: 'nowrap'}}>{w.title}</div>
      </div>
    </div>
  </AbsoluteFill>;
};
// 3) MeshWipe: lưới ô Pantheon (ô vuông lõm viền vàng) lật kín rồi mở
const MeshWipe: React.FC<{fr: number; t: number}> = ({fr, t}) => {
  const cf = f(t);
  if (fr < cf - 10 || fr > cf + 12) return null;
  const C = 6, R = 11, S = 180;
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {Array.from({length: C * R}).map((_, i) => {
      const c = i % C, r = Math.floor(i / C);
      const d = Math.hypot(c - 2.5, (r - 4.8) * 0.9) * 1.1;
      const a = ip(fr, cf - 10 + d, cf - 4 + d * 0.6, 0, 1, Easing.out(Easing.cubic));
      const b = ip(fr, cf + 1 + d, cf + 7 + d, 0, 1, Easing.in(Easing.cubic));
      const v = fr < cf ? a : 1 - b;
      if (v <= 0) return null;
      return <div key={i} style={{position: 'absolute', left: c * S, top: r * S, width: S, height: S, transform: `scale(${v})`,
        background: `linear-gradient(135deg, ${NAVY2}, ${NAVY})`, boxShadow: `inset 0 0 0 3px ${GOLD}, inset 0 0 0 14px ${NAVY}, inset 0 0 0 16px ${GOLD}55`}}>
        <div style={{position: 'absolute', left: S / 2 - 12, top: S / 2 - 12}}><Star size={24} /></div>
      </div>;
    })}
  </AbsoluteFill>;
};

// ---------- B-roll cover (hook) ----------
const BRoll: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  if (!active(fr, b.s, b.e)) return null;
  const v = life(fr, b.s, b.e, 6, 10);
  const k = fr - f(b.s);
  return <AbsoluteFill style={{opacity: v}}>
    <OffthreadVideo src={staticFile(b.src)} muted playbackRate={b.rate ?? 1} style={{width: 1080, height: 1920, objectFit: 'cover', transform: `scale(${1.05 + 0.04 * ip(k, 0, f(b.e - b.s), 0, 1, Easing.linear)})`}} />
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,25,54,.55) 0%, rgba(14,25,54,0) 40%, rgba(14,25,54,0) 60%, rgba(14,25,54,.6) 100%)'}} />
    <SkyField fr={fr} n={18} seed="br" />
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: 300, textAlign: 'center'}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 30, letterSpacing: ip(k, 0, 24, 20, 12), color: GOLD_L, textShadow: '0 2px 12px rgba(0,0,0,.6)'}}>{b.kicker}</div>
      <div style={{overflow: 'hidden', paddingTop: 50, marginTop: -40}}>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 118, letterSpacing: 10, ...goldText, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.5))', transform: `translateY(${(1 - ip(k, 4, 20)) * 110}%)`}}>{b.title}</div>
      </div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 46, color: WHITE, marginTop: 6, opacity: ip(k, 14, 28), textShadow: '0 2px 14px rgba(0,0,0,.6)'}}>{b.sub}</div>
    </div>
  </AbsoluteFill>;
};

// ---------- ảnh quầy ----------
const BrandCard: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  const s = f(b.s), e = f(b.e);
  if (fr < s || fr >= e) return null;
  const k = fr - s, left = e - fr;
  const inP = ip(k, 0, 11, 0, 1, Easing.bezier(0.22, 1, 0.36, 1));
  const outP = ip(left, 0, 9, 1, 0, Easing.out(Easing.cubic));
  const kb = ip(k, 0, e - s, 1.0, 1.08, Easing.linear);
  const CW = 820, CH = Math.round(CW / b.ar), top = b.top ?? 420;
  return <AbsoluteFill style={{opacity: 1 - outP * 0.95, transform: `scale(${1 + outP * 0.3})`, filter: `blur(${(1 - inP) * 14 + outP * 14}px)`}}>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY2}, ${NAVY} 60%, #070D20)`}} />
    <SkyField fr={fr} n={40} seed="bc" />
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: SAFE.t + 30, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 12, color: GOLD_L}}>{b.kicker}</div>
    <div style={{position: 'absolute', left: CX - CW / 2, top, width: CW, height: CH, borderRadius: 26, overflow: 'hidden', boxShadow: `0 30px 70px rgba(0,0,0,.6), 0 0 0 3px ${GOLD}`, transform: `translateY(${(1 - inP) * 80}px)`}}>
      <Img src={staticFile(b.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />
      <div style={{position: 'absolute', top: -200, bottom: -200, width: 160, left: ip(k, 6, 26, -300, CW + 300, Easing.inOut(Easing.cubic)), background: 'linear-gradient(90deg, transparent, rgba(255,240,200,.4), transparent)', transform: 'skewX(-20deg)'}} />
    </div>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: top + CH + 10, paddingTop: 40, textAlign: 'center', overflow: 'hidden'}}>
      <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 96, letterSpacing: interpolate(ip(k, 8, 30), [0, 1], [40, 14]), lineHeight: 1.15, ...goldText, transform: `translateY(${(1 - ip(k, 8, 30)) * 100}%)`, whiteSpace: 'nowrap'}}>{b.name}</div>
    </div>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: top + CH + 160, textAlign: 'center', opacity: ip(k, 16, 30), fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: WHITE}}>{b.tag}</div>
  </AbsoluteFill>;
};

// ---------- product card (lower third, sang trọng) ----------
const Product: React.FC<{fr: number; p: any}> = ({fr, p}) => {
  if (!active(fr, p.s, p.e)) return null;
  const v = life(fr, p.s, p.e, 14, 10);
  const k = fr - f(p.s);
  const line = ip(k, 4, 22);
  return <div style={{position: 'absolute', left: SAFE.l + 10, width: W_SAFE - 20, top: p.y, opacity: v, transform: `translateY(${(1 - v) * 40}px)`, filter: `blur(${(1 - v) * 8}px)`}}>
    <div style={{position: 'relative', background: 'linear-gradient(135deg, rgba(14,25,54,.86), rgba(30,46,99,.78))', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderRadius: 26, padding: '22px 30px 24px', boxShadow: '0 20px 50px rgba(0,0,0,.35)', border: `1.5px solid ${GOLD}AA`, overflow: 'hidden'}}>
      <div style={{position: 'absolute', right: -30, top: -30, opacity: 0.18, transform: `rotate(${k * 0.8}deg)`}}><Star size={170} /></div>
      <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
        <Star size={26} glow style={{transform: `rotate(${k * 2}deg)`}} />
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: GOLD_L}}>{p.kicker}</div>
      </div>
      <div style={{overflow: 'hidden', paddingTop: 34, marginTop: -26}}>
        <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: p.size ?? 64, lineHeight: 1.12, ...goldText, transform: `translateY(${(1 - ip(k, 3, 18)) * 105}%)`, whiteSpace: 'nowrap'}}>{p.name}</div>
      </div>
      <div style={{height: 1.5, width: `${line * 100}%`, background: `linear-gradient(90deg, ${GOLD}, transparent)`, margin: '8px 0 12px'}} />
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 10}}>
        {(p.notes ?? []).map((n: any, i: number) => {
          const q = ip(fr, f(n.t ?? p.s + 0.4 + i * 0.25), f(n.t ?? p.s + 0.4 + i * 0.25) + 10);
          return <div key={i} style={{opacity: q, transform: `translateY(${(1 - q) * 14}px)`, padding: '6px 16px 8px', borderRadius: 999, border: `1.5px solid ${GOLD}99`, fontFamily: SANS, fontWeight: 600, fontSize: 28, color: WHITE, whiteSpace: 'nowrap'}}>{n.text ?? n}</div>;
        })}
      </div>
      {p.line ? <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: '#E8E3D6', marginTop: 12, opacity: ip(fr, f(p.lineT ?? p.s + 0.8), f(p.lineT ?? p.s + 0.8) + 12)}}>{p.line}</div> : null}
    </div>
  </div>;
};

// ---------- tag nhỏ (sau khi card thu lại) ----------
const Tag: React.FC<{fr: number; g: any}> = ({fr, g}) => {
  if (!active(fr, g.s, g.e)) return null;
  const v = life(fr, g.s, g.e, 12, 9);
  return <div style={{position: 'absolute', top: g.y, ...(g.side < 0 ? {left: SAFE.l + 6} : {right: SAFE.r + 6}), opacity: v, transform: `translateX(${(g.side ?? -1) * (1 - v) * 40}px)`}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 12px 14px', borderRadius: 999, background: 'rgba(14,25,54,.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1.5px solid ${GOLD}99`}}>
      <Star size={24} />
      <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 32, ...goldText, whiteSpace: 'nowrap'}}>{g.text}</div>
      {g.sub ? <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, color: '#E8E3D6', whiteSpace: 'nowrap'}}>{g.sub}</div> : null}
    </div>
  </div>;
};

// ---------- băng chữ chạy ----------
const Ticker: React.FC<{fr: number; t: any}> = ({fr, t}) => {
  if (!active(fr, t.s, t.e)) return null;
  const k = fr - f(t.s);
  const out = ip(fr, f(t.e) - 8, f(t.e), 1, 0, EOUT);
  return <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: t.y, opacity: out}}>
    {t.lines.map((ln: string, i: number) => {
      const wipe = ip(k, i * 4, i * 4 + 14, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
      const dir = i % 2 ? 1 : -1;
      const x = dir * k * 3 - (dir > 0 ? 1600 : 0);
      return <div key={i} style={{position: 'relative', height: 70, marginBottom: 12, borderRadius: 14, overflow: 'hidden', background: i % 2 ? `linear-gradient(90deg, ${GOLD}, ${GOLD_L}, ${GOLD})` : 'rgba(14,25,54,.85)', border: `1.5px solid ${GOLD}`,
        clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 14px)`, transform: `rotate(${i % 2 ? 1 : -1}deg)`}}>
        <div style={{position: 'absolute', top: 0, left: x, height: 70, display: 'flex', alignItems: 'center', whiteSpace: 'pre'}}>
          {Array.from({length: 8}).map((_, j) => <span key={j} style={{display: 'inline-flex', alignItems: 'center', gap: 22, paddingRight: 22}}>
            <span style={{fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: 3, color: i % 2 ? NAVY : GOLD_L}}>{ln}</span>
            <Star size={22} color={i % 2 ? NAVY : GOLD} /></span>)}
        </div>
      </div>;
    })}
  </div>;
};

// ---------- chapter tag ----------
const Chapter: React.FC<{fr: number; c: any}> = ({fr, c}) => {
  if (!active(fr, c.s, c.e)) return null;
  const v = life(fr, c.s, c.e, 14, 10);
  return <div style={{position: 'absolute', left: SAFE.l + 6, top: SAFE.t + 10, opacity: v, transform: `translateX(${(1 - v) * -30}px)`, display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px 11px 14px', borderRadius: 999, background: 'rgba(14,25,54,.72)', border: `1.5px solid ${GOLD}88`}}>
    <Star size={22} /><div style={{fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: GOLD_L}}>{c.name}</div>
  </div>;
};

// ---------- sparkle quanh hộp quà ----------
const Twinkle: React.FC<{fr: number; s: any}> = ({fr, s}) => {
  if (!active(fr, s.s, s.e)) return null;
  const v = life(fr, s.s, s.e, 10, 10);
  return <AbsoluteFill style={{opacity: v, pointerEvents: 'none'}}>
    {Array.from({length: s.n ?? 10}).map((_, i) => {
      const x = s.x + (random(`tx${i}${s.s}`) - 0.5) * s.w, y = s.y + (random(`ty${i}${s.s}`) - 0.5) * s.h;
      const ph = random(`tp${i}`) * 50, tw = Math.max(0, Math.sin((fr + ph) * 0.18));
      return <Star key={i} size={14 + random(`tz${i}`) * 22} glow style={{position: 'absolute', left: x, top: y, opacity: tw, transform: `scale(${0.5 + tw * 0.7}) rotate(${fr * 3}deg)`}} />;
    })}
  </AbsoluteFill>;
};

// ---------- end card ----------
const EndCard: React.FC<{fr: number; e: any}> = ({fr, e}) => {
  if (!active(fr, e.s, e.e + 1)) return null;
  const k = fr - f(e.s);
  const v = ip(k, 0, 16);
  return <AbsoluteFill>
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${NAVY2}EE, ${NAVY}F2 60%, #070D20F5)`, opacity: v}} />
    <AbsoluteFill style={{opacity: v}}><SkyField fr={fr} n={50} seed="end" /><Firework x={260} y={520} k={k - 6} /><Firework x={820} y={700} k={k - 14} r={170} /></AbsoluteFill>
    <div style={{position: 'absolute', left: SAFE.l + 10, right: SAFE.r + 10, top: 360, opacity: v, transform: `translateY(${(1 - v) * 50}px)`, textAlign: 'center'}}>
      <div style={{display: 'flex', justifyContent: 'center'}}><Star size={70} glow style={{transform: `rotate(${k * 1.5}deg)`}} /></div>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 12, color: GOLD_L, marginTop: 16}}>{e.kicker}</div>
      <div style={{paddingTop: 30, marginTop: -20, fontFamily: SERIF, fontWeight: 600, fontSize: 104, letterSpacing: 8, ...goldText}}>{e.title}</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 42, color: WHITE, marginTop: 4}}>{e.sub}</div>
      <div style={{marginTop: 34, borderRadius: 26, border: `1.5px solid ${GOLD}AA`, background: 'rgba(14,25,54,.6)', padding: '16px 28px 20px', textAlign: 'left'}}>
        {e.items.map((it: any, i: number) => { const q = ip(k, 10 + i * 4, 22 + i * 4);
          return <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderTop: i ? `1px solid ${GOLD}33` : 'none', opacity: q, transform: `translateX(${(1 - q) * -20}px)`}}>
            <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: 36, color: GOLD_L}}>{it.a}</div>
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 26, color: '#E8E3D6'}}>{it.b}</div></div>; })}
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 28, opacity: ip(k, 36, 48)}}>
        <div style={{background: `linear-gradient(135deg, ${GOLD_L}, ${GOLD})`, color: NAVY, borderRadius: 999, padding: '14px 34px 16px', fontFamily: SANS, fontWeight: 800, fontSize: 34}}>{e.cta}</div>
      </div>
    </div>
  </AbsoluteFill>;
};

// ---------- subtitles ----------
const Subs: React.FC<{fr: number; D: DT}> = ({fr, D}) => {
  const t = fr / FPS;
  for (const h of D.hideSubs) if (t >= h.s && t < h.e) return null;
  const ln = D.lines.find((l: any) => t >= l.s && t < l.e);
  if (!ln) return null;
  const k = fr - f(ln.s);
  const v = ip(k, 0, 6);
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: D.subTop ?? 1335, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 4, opacity: v, transform: `translateY(${(1 - v) * 12}px)`, filter: `blur(${(1 - v) * 4}px)`}}>
      {ln.words.map((w: any, i: number) => {
        const on = t >= w.s, cur = on && t < w.e + 0.04;
        const bp = cur ? ip(fr, f(w.s), f(w.s) + 4) : 0;
        return <span key={i} style={{position: 'relative', display: 'inline-block', padding: '6px 10px 8px', fontFamily: SANS, fontWeight: 800, fontSize: 56, lineHeight: '72px',
          color: cur ? NAVY : w.key ? GOLD_L : WHITE, opacity: on ? 1 : 0.5, textShadow: cur ? 'none' : '0 2px 4px rgba(0,0,0,.5), 0 6px 22px rgba(0,0,0,.45)'}}>
          {cur ? <span style={{position: 'absolute', left: 0, right: 0, top: 6, bottom: 4, borderRadius: 12, background: `linear-gradient(135deg, ${GOLD_L}, ${GOLD})`, transform: `scale(${0.85 + 0.15 * bp})`, opacity: bp, boxShadow: '0 6px 18px rgba(0,0,0,.3)'}} /> : null}
          <span style={{position: 'relative'}}>{w.t}</span>
        </span>;
      })}
    </div>
  </div>;
};

export const Bv: React.FC<{d: DT}> = ({d: D}) => {
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const cam = camera(D, fr);
  const cs = camStyle(cam);
  const filt = cam.blur > 0.2 ? `blur(${cam.blur}px) brightness(${cam.bright})` : undefined;
  const topTicker = (D.tickers ?? []).some((t: any) => t.y < 360 && active(fr, t.s - 0.2, t.e + 0.2));
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, filter: filt}}>
        <div style={cs}><OffthreadVideo src={staticFile(D.base)} muted style={{width: 1080, height: 1920}} /></div>
      </div>
      {(D.twinkles ?? []).map((s: any, i: number) => <Twinkle key={i} fr={fr} s={s} />)}
      {(D.tags ?? []).map((g: any, i: number) => <Tag key={i} fr={fr} g={g} />)}
      {(D.products ?? []).map((p: any, i: number) => <Product key={i} fr={fr} p={p} />)}
      {(D.tickers ?? []).map((t: any, i: number) => <Ticker key={i} fr={fr} t={t} />)}
      {topTicker ? null : (D.chapters ?? []).map((c: any, i: number) => <Chapter key={i} fr={fr} c={c} />)}
      {(D.brolls ?? []).map((b: any, i: number) => <BRoll key={i} fr={fr} b={b} />)}
      {(D.brands ?? []).map((b: any, i: number) => <BrandCard key={i} fr={fr} b={b} />)}
      {(D.endcards ?? []).map((e: any, i: number) => <EndCard key={i} fr={fr} e={e} />)}
      <Subs fr={fr} D={D} />
      {(D.meshes ?? []).map((t: number, i: number) => <MeshWipe key={i} fr={fr} t={t} />)}
      {(D.stars ?? []).map((t: number, i: number) => <StarWipe key={i} fr={fr} t={t} />)}
      {(D.skies ?? []).map((w: any, i: number) => <SkyWipe key={i} fr={fr} w={w} />)}
    </AbsoluteFill>
  );
};
