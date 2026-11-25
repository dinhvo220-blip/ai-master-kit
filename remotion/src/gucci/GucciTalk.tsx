// Gucci Beauty – Darren đứng nói "Hà Nội cũng giảm 20%" (25/11/2026)
// Chữ kiểu mới (học từ mẫu Darren gửi): serif nghiêng thân hẹp (Noto Serif Display wdth 62.5) có quầng sáng
// + đổ màu mờ dần ở chân chữ, sans mảnh viết thường xen kẽ to nhỏ; hiện bằng nhòe tan, ẩn bằng nhòe ngang.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate, Easing, delayRender, continueRender} from 'remotion';
import {loadFonts} from '../fonts';
import {loadSerif} from '../chloe/Chloe';
import data from './talk.json';
const D: any = data;
const FPS = 30;
const SAFE_L = 70, SAFE_R = 890;
const SANS = 'Be Vietnam Pro', COND = 'NSDCond';
const G = {green: '#1C3A2A', green2: '#3F6650', gold: '#7E5718', gold2: '#B98A3E', ink: '#26231F', blush: '#F6E3DD'};
const f = (t: number) => Math.round(t * FPS);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const inP = (fr: number, t: number, d = 12) => interpolate(fr, [f(t), f(t) + d], [0, 1], {...cl, easing: EIN});
const GRADE = 'brightness(1.03) contrast(0.97) saturate(0.96)';
const R: any = {latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB'};
let condLoaded = false;
const loadCond = () => {
  if (condLoaded) return; condLoaded = true;
  const h = delayRender('cond');
  Promise.all(Object.keys(R).map((k) => new FontFace(COND, `url(${staticFile(`fonts/noto-serif-display-${k}-wdth-italic.woff2`)}) format('woff2')`, {weight: '100 900', style: 'italic', stretch: '62.5% 100%', unicodeRange: R[k]}).load().then((x) => (document as any).fonts.add(x))))
    .then(() => continueRender(h)).catch((e) => {console.error(e); continueRender(h);});
};

const camScale = (fr: number) => {
  const z: number[] = D.zooms; let k = 0;
  for (let i = 0; i < z.length; i++) if (fr >= f(z[i])) k = i;
  const tgt = (i: number) => (i % 3 === 1 ? 1.04 : i % 3 === 2 ? 1.018 : 1.0);
  const prev = k > 0 ? tgt(k - 1) : 1.0;
  const p = interpolate(fr, [f(z[k]), f(z[k]) + 18], [0, 1], {...cl, easing: Easing.inOut(Easing.sin)});
  return prev + (tgt(k) - prev) * p + interpolate(fr - f(z[k]), [0, 240], [0, 0.01], cl);
};

// ---------- bố cục khung (đầu nhô khỏi khung) ----------
const CT = 1090, CS = 0.94, CTX = 30, CTY = 470;
const cardP = (fr: number) => {
  for (const c of D.cards) {
    const s = f(c.s), e = f(c.e);
    if (fr >= s - 1 && fr <= e + 1) return Math.min(interpolate(fr, [s, s + 16], [0, 1], {...cl, easing: Easing.bezier(0.33, 0, 0.15, 1)}), interpolate(fr, [e - 14, e], [1, 0], {...cl, easing: Easing.bezier(0.6, 0, 0.8, 0.5)}));
  }
  return 0;
};

// ---------- chữ v2 (theo mẫu): sans nhỏ lệch trái · serif nghiêng chữ thường · sans nhỏ lệch phải; chữ khối sau đầu ----------
const SERIF = 'NotoSerifDisplay';
const GLOW = 'drop-shadow(0 0 7px rgba(255,255,255,0.95)) drop-shadow(0 0 22px rgba(255,255,255,0.75))';
const ap = (fr: number, d: number, e: number) => {
  const p = inP(fr, d, 14);
  const x = interpolate(fr, [f(e) - 8, f(e)], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  return {o: Math.min(1, p * 1.3) * (1 - x), blur: (1 - p) * 12 + x * 10, y: (1 - p) * 16};
};
const Piece: React.FC<{fr: number; d: number; e: number; children: React.ReactNode; style: React.CSSProperties; dx?: number}> = ({fr, d, e, children, style, dx = 0}) => {
  if (d == null || fr < f(d)) return <div style={{...style, visibility: 'hidden'}}>{children}</div>;
  const a = ap(fr, d, e);
  return <div style={{...style, opacity: a.o, transform: `translate(${dx}px, ${a.y}px)`, filter: `blur(${a.blur}px) ${GLOW}`}}>{children}</div>;
};
const Beat: React.FC<{fr: number; b: any; onCard: boolean}> = ({fr, b, onCard}) => {
  if (fr < f(b.s) - 1 || fr > f(b.e) + 1) return null;
  const top = onCard ? 300 : 1095;
  const small: React.CSSProperties = {fontFamily: SANS, fontWeight: 400, fontSize: 40, letterSpacing: '-0.04em', color: '#2A2622', lineHeight: 1.15, whiteSpace: 'nowrap'};
  const serif: React.CSSProperties = {fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: Math.min(124, 780 / (0.52 * b.serif.length)), letterSpacing: '-0.015em', color: G.green, lineHeight: 1.08, whiteSpace: 'nowrap', paddingTop: '0.22em', marginTop: '-0.22em'};
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      {b.a ? <Piece fr={fr} d={b.ad} e={b.e} style={small} dx={-110}>{b.a}</Piece> : null}
      <Piece fr={fr} d={b.sd} e={b.e} style={serif}>{b.serif}</Piece>
      {b.b ? <Piece fr={fr} d={b.bd} e={b.e} style={{...small, fontWeight: 300}} dx={130}>{b.b}</Piece> : null}
    </div>
  );
};
const CardWord: React.FC<{fr: number}> = ({fr}) => {
  const c = D.cards.find((x: any) => fr >= f(x.s) && fr <= f(x.e));
  if (!c) return null;
  const a = ap(fr, c.s + 0.25, c.e);
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 700, textAlign: 'center', opacity: a.o, transform: `translateY(${a.y}px)`, filter: `blur(${a.blur}px)`}}>
      <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: '-0.045em', color: '#FFFFFF', lineHeight: 1.1, whiteSpace: 'nowrap',
        textShadow: '0 20px 40px rgba(28,58,42,0.45), 0 4px 14px rgba(28,58,42,0.3)'}}>{c.word}</span>
    </div>
  );
};
const Heavy: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  if (!b.heavy || fr < f(b.hd) || fr > f(b.e) + 1) return null;
  const a = ap(fr, b.hd, b.e);
  return (
    <div style={{position: 'absolute', left: 0, width: 960, top: 335, textAlign: 'center', opacity: a.o, transform: `translateY(${a.y}px) scale(${1.04 - 0.04 * Math.min(1, a.o)})`, filter: `blur(${a.blur}px)`}}>
      <span style={{fontFamily: SANS, fontWeight: 900, fontSize: 230, letterSpacing: '-0.045em', color: '#FFFFFF', lineHeight: 1.1, paddingTop: '0.25em',
        textShadow: '0 22px 46px rgba(28,58,42,0.55), 0 6px 18px rgba(28,58,42,0.35)'}}>{b.heavy}</span>
    </div>
  );
};

const Subs: React.FC<{fr: number}> = ({fr}) => {
  const t = fr / FPS; const cp = cardP(fr); const busy = cp < 0.5 && D.beats.some((b: any) => t >= b.sd && t < b.e);
  const s = D.subs.find((x: any) => t >= x.s && t < x.e);
  if (!s) return null;
  const o = Math.min(inP(fr, s.s, 5), interpolate(fr, [f(s.e) - 4, f(s.e)], [1, 0], cl));
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: busy ? 1488 : 1440 + 40 * cp, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'baseline', columnGap: 10, opacity: o,
      filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.95)) drop-shadow(0 0 16px rgba(255,255,255,0.8))'}}>
      {s.words.map((w: any, i: number) => {
        const on = t >= w.s - 0.03;
        return w.k
          ? <span key={i} style={{fontFamily: COND, fontStyle: 'italic', fontStretch: '62.5%', fontVariationSettings: "'wdth' 62.5", fontWeight: 600, fontSize: 52, color: on ? G.gold : 'rgba(165,122,53,0.45)', lineHeight: 1.25}}>{w.w}</span>
          : <span key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: '-0.02em', color: on ? G.green : 'rgba(28,58,42,0.55)', lineHeight: 1.25}}>{w.w}</span>;
      })}
    </div>
  );
};

export const GucciTalk: React.FC = () => {
  loadFonts(); loadCond(); loadSerif();
  const fr = useCurrentFrame();
  const z = camScale(fr);
  const p = cardP(fr);
  const cam: React.CSSProperties = {transform: `scale(${z})`, transformOrigin: '50% 40%'};
  const lay: React.CSSProperties = {transform: `translate(${CTX * p}px, ${CTY * p}px) scale(${1 - (1 - CS) * p})`, transformOrigin: '0 0'};
  const clip = p > 0 ? `inset(${CT * p}px ${50 * p}px ${30 * p}px ${50 * p}px round ${64 * p}px)` : undefined;
  const pclip = p > 0 ? `inset(0 0 ${(1920 - CT - 90) * p}px 0)` : undefined;
  
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {p > 0 ? <AbsoluteFill style={{opacity: Math.min(1, p * 1.5), background: `radial-gradient(ellipse 90% 60% at 50% 25%, #FFFDFB 0%, ${G.blush} 60%, #EBCFC7 100%)`}} /> : null}
      <AbsoluteFill style={{clipPath: clip}}>
        <AbsoluteFill style={lay}><AbsoluteFill style={cam}>
          <OffthreadVideo src={staticFile('gucci_base.mp4')} muted style={{width: '100%', height: '100%', filter: GRADE}} />
        </AbsoluteFill></AbsoluteFill>
      </AbsoluteFill>
      {D.beats.map((b: any, i: number) => <Heavy key={i} fr={fr} b={b} />)}
      <CardWord fr={fr} />
      <AbsoluteFill style={{clipPath: pclip}}>
        <AbsoluteFill style={lay}><AbsoluteFill style={cam}>
          <OffthreadVideo src={staticFile('gucci_person.webm')} muted transparent style={{width: '100%', height: '100%', filter: GRADE}} />
        </AbsoluteFill></AbsoluteFill>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 20% 10%, rgba(255,240,232,0.3), transparent 45%)', mixBlendMode: 'screen'}} />
      {D.beats.map((b: any, i: number) => <Beat key={i} fr={fr} b={b} onCard={p > 0.5} />)}
      <Subs fr={fr} />
    </AbsoluteFill>
  );
};
