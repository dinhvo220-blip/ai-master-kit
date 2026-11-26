// Bvlgari Le Gemme Tygar – cover 00:21.15–00:42.20 bằng ảnh thật (bulgari.com + Wikimedia Commons). 26/11/2026
// Comp bắt đầu tại 20.5 s của clip gốc (frame gốc 615). Khung local f = (t - 20.5) * 30.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender} from 'remotion';
import {loadFonts} from '../fonts';

const T0 = 20.5;
const F = (t: number) => Math.round((t - T0) * 30);
const CX = 480; // tâm vùng an toàn
const GOLD = '#D9B76C', GOLD_L = '#F6E7B8', GOLD_D = '#9A7433', INK = '#0B0907';
const SANS = 'Be Vietnam Pro', SERIF = 'Noto Serif Display';
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = EIN) =>
  interpolate(fr, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const img = (n: string) => staticFile('tygar/' + n);

// mốc (khớp lời)
const IN = F(21.15), S2 = F(23.6), S3 = F(27.02), S4 = F(29.7), S5 = F(33.04), OUT = F(42.2);
const W_TYGAR = F(23.76), W_MATHO = F(25.22), W_VANGNAU = F(26.3), W_VE = F(28.72), W_KERALA = F(29.02);
const W_VUON = F(31.18), W_ANDO = F(32.34), W_XIT = F(35.7), W_BUOI = F(36.46), W_GUNG = F(39.74), W_CAY = F(40.98), W_VIENDA = F(22.96);

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

// ---------- chữ ----------
const Kicker: React.FC<{fr: number; s: number; e: number; text: string; y: number; color?: string}> = ({fr, s, e, text, y, color = GOLD}) => {
  const a = Math.min(ip(fr, s, s + 20), ip(fr, e - 8, e, 1, 0, EOUT));
  const sp = interpolate(ip(fr, s, s + 24), [0, 1], [0.55, 0.32]);
  return <div style={{position: 'absolute', left: 70, right: 190, top: y, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 26,
    letterSpacing: `${sp}em`, color, opacity: a, textShadow: '0 2px 12px rgba(0,0,0,.6)'}}>{text}</div>;
};

// mask-slide từng dòng (dấu tiếng Việt in hoa: paddingTop + marginTop âm)
const Slide: React.FC<{fr: number; s: number; e: number; text: string; y: number; size: number; italic?: boolean; color?: string; weight?: number; grad?: boolean; track?: number}> =
  ({fr, s, e, text, y, size, italic, color = '#fff', weight = 500, grad, track = 0}) => {
  const p = ip(fr, s, s + 16);
  const o = ip(fr, e - 8, e, 1, 0, EOUT);
  const st: React.CSSProperties = {display: 'inline-block', fontFamily: SERIF, fontStyle: italic ? 'italic' : 'normal', fontWeight: weight, fontSize: size, lineHeight: 1.05,
    letterSpacing: `${track}em`, transform: `translateY(${(1 - p) * 110}%)`, paddingTop: '0.36em', marginTop: '-0.36em',
    color, filter: `blur(${(1 - p) * 6}px) drop-shadow(0 4px 18px rgba(0,0,0,.55))`};
  if (grad) Object.assign(st, {backgroundImage: `linear-gradient(180deg, ${GOLD_L} 15%, ${GOLD} 55%, ${GOLD_D} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'});
  return <div style={{position: 'absolute', left: 70, right: 190, top: y, textAlign: 'center', overflow: 'hidden', paddingTop: '0.36em', marginTop: '-0.36em', opacity: o}}>
    <span style={st}>{text}</span></div>;
};

// tracking expand (tên brand)
const Track: React.FC<{fr: number; s: number; e: number; text: string; y: number; size: number}> = ({fr, s, e, text, y, size}) => {
  const p = ip(fr, s, s + 22);
  const o = Math.min(p, ip(fr, e - 8, e, 1, 0, EOUT));
  return <div style={{position: 'absolute', left: 40, right: 160, top: y, textAlign: 'center', opacity: o}}>
    <span style={{fontFamily: SERIF, fontWeight: 400, fontSize: size, letterSpacing: `${interpolate(p, [0, 1], [0.5, 0.14])}em`, marginRight: '-0.14em',
      backgroundImage: `linear-gradient(180deg, ${GOLD_L} 10%, ${GOLD} 55%, ${GOLD_D} 100%)`, WebkitBackgroundClip: 'text', color: 'transparent',
      filter: `blur(${(1 - p) * 10}px) drop-shadow(0 6px 24px rgba(0,0,0,.6))`, paddingTop: '0.3em'}}>{text}</span></div>;
};

const Rule: React.FC<{fr: number; s: number; y: number; w?: number}> = ({fr, s, y, w = 200}) => (
  <div style={{position: 'absolute', left: CX - w / 2, top: y, width: w, height: 1.5, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
    transform: `scaleX(${ip(fr, s, s + 18)})`}} />
);

// bụi vàng bokeh trôi chậm (seed cố định)
const Dust: React.FC<{fr: number; n?: number; op?: number}> = ({fr, n = 26, op = 1}) => (
  <AbsoluteFill style={{opacity: op}}>
    {new Array(n).fill(0).map((_, i) => {
      const x = random('dx' + i) * 1080, y0 = random('dy' + i) * 1920, sp = 0.3 + random('ds' + i) * 0.8, r = 2 + random('dr' + i) * 7;
      const y = ((y0 - fr * sp) % 1920 + 1920) % 1920;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(fr / (14 + random('dt' + i) * 20) + i));
      return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * 2, height: r * 2, borderRadius: '50%',
        background: `radial-gradient(circle, rgba(246,231,184,${0.55 * tw}) 0%, rgba(217,183,108,0) 70%)`, filter: r > 6 ? 'blur(2px)' : undefined}} />;
    })}
  </AbsoluteFill>
);

const Vignette: React.FC<{k?: number}> = ({k = 0.75}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 40%, rgba(0,0,0,${k}) 100%)`}} />
);

// vệt sáng (light leak) che điểm chuyển cảnh
const Leak: React.FC<{fr: number; at: number}> = ({fr, at}) => {
  const v = interpolate(fr, [at - 9, at, at + 10], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  if (v <= 0) return null;
  const x = interpolate(fr, [at - 9, at + 10], [-300, 1300]);
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: v * 0.55}}>
    <div style={{position: 'absolute', left: x - 700, top: -200, width: 1400, height: 2300, transform: 'rotate(18deg)',
      background: 'radial-gradient(ellipse 40% 50% at 50% 50%, rgba(255,214,140,1) 0%, rgba(230,150,60,.75) 35%, rgba(120,60,10,0) 75%)'}} />
  </AbsoluteFill>;
};

// ---------- cảnh ----------
const BOTTLES = ['onekh', 'amunae', 'gyan', 'falkar', 'yasep', 'sahare'];
const Scene1: React.FC<{fr: number}> = ({fr}) => {
  const push = interpolate(fr, [IN, S2], [1, 1.07]);
  const capGlow = ip(fr, W_VIENDA - 4, W_VIENDA + 10);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at 50% 52%, #2a2016 0%, #120e0a 55%, ${INK} 100%)`}}>
    <Dust fr={fr} n={18} op={0.7} />
    <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: `${CX}px 900px`}}>
      {/* sàn phản chiếu nhẹ */}
      <div style={{position: 'absolute', left: 60, width: 840, top: 1135, height: 3, background: `linear-gradient(90deg, transparent, rgba(217,183,108,.45), transparent)`}} />
      {BOTTLES.map((b, i) => {
        const s = IN + 4 + i * 4;
        const p = ip(fr, s, s + 18);
        const w = 140, gap = -4, x0 = CX - (6 * w + 5 * gap) / 2 + i * (w + gap);
        const h = b === 'falkar' ? 312 : 384; // chai Falkar thấp hơn (đúng tỉ lệ thật)
        return <div key={b} style={{position: 'absolute', left: x0, top: 1135 - h, width: w, height: h, opacity: p,
          transform: `translateY(${(1 - p) * 140}px)`, filter: `blur(${(1 - p) * 8}px) drop-shadow(0 18px 22px rgba(0,0,0,.7))`}}>
          <Img src={img(b + '_cut.png')} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom'}} />
          {/* quầng sáng ở nắp đá khi nói "một viên đá" */}
          <div style={{position: 'absolute', left: -20, right: -20, top: -30, height: 90, opacity: capGlow * (0.6 + 0.4 * Math.sin(fr / 6 + i)),
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(255,236,190,.55), rgba(255,236,190,0) 70%)', mixBlendMode: 'screen'}} />
        </div>;
      })}
      {/* bóng phản chiếu */}
      {BOTTLES.map((b, i) => {
        const s = IN + 4 + i * 4, p = ip(fr, s, s + 18);
        const w = 140, gap = -4, x0 = CX - (6 * w + 5 * gap) / 2 + i * (w + gap);
        const h = b === 'falkar' ? 312 : 384;
        return <div key={'r' + b} style={{position: 'absolute', left: x0, top: 1138, width: w, height: h, opacity: p * 0.22, transform: 'scaleY(-1)',
          WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 40%)', maskImage: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 40%)'}}>
          <Img src={img(b + '_cut.png')} style={{width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom'}} />
        </div>;
      })}
    </AbsoluteFill>
    <Kicker fr={fr} s={IN + 2} e={S2 + 6} text="BVLGARI · LE GEMME" y={330} />
    <Rule fr={fr} s={IN + 8} y={378} />
    <Slide fr={fr} s={IN + 10} e={S2 + 6} text="mỗi chai" y={420} size={64} italic color={GOLD_L} weight={400} />
    <Slide fr={fr} s={W_VIENDA - 6} e={S2 + 6} text="một viên đá quý" y={505} size={92} weight={500} grad />
    <Vignette k={0.55} />
  </AbsoluteFill>;
};

const Scene2: React.FC<{fr: number}> = ({fr}) => {
  const kb = interpolate(fr, [S2 - 10, S3 + 10], [1.12, 1.0]);
  const p = ip(fr, S2 + 2, S2 + 26);
  const rot = interpolate(fr, [S2, S3], [-6, 3]);
  const fl = Math.sin(fr / 18) * 8;
  const shine = interpolate(fr, [W_MATHO - 2, W_MATHO + 16], [-0.4, 1.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{background: INK}}>
    <AbsoluteFill style={{transform: `scale(${kb})`}}>
      <Img src={img('texture.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(.42) saturate(1.1) blur(2px)'}} />
    </AbsoluteFill>
    <Vignette k={0.85} />
    <Dust fr={fr} n={16} op={0.6} />
    {/* viên đá mắt hổ thật (cutout) */}
    <div style={{position: 'absolute', left: CX - 300, top: 700 + fl, width: 600, height: 571, opacity: p,
      transform: `scale(${interpolate(p, [0, 1], [0.7, 1])}) rotate(${rot}deg)`, filter: `blur(${(1 - p) * 10}px) drop-shadow(0 40px 50px rgba(0,0,0,.75))`}}>
      <Img src={img('stone_c.png')} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
      <div style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.9,
        WebkitMaskImage: `url(${img('stone_c.png')})`, WebkitMaskSize: 'contain', WebkitMaskRepeat: 'no-repeat', WebkitMaskPosition: 'center',
        background: `linear-gradient(110deg, transparent ${shine * 100 - 18}%, rgba(255,255,255,.9) ${shine * 100}%, transparent ${shine * 100 + 18}%)`}} />
    </div>
    <Kicker fr={fr} s={S2 + 2} e={S3 + 4} text="LE GEMME" y={300} />
    <Track fr={fr} s={W_TYGAR - 4} e={S3 + 4} text="TYGAR" y={330} size={150} />
    <Slide fr={fr} s={W_MATHO - 4} e={S3 + 4} text="đá mắt hổ" y={1330} size={72} italic color={GOLD_L} weight={400} />
    <Slide fr={fr} s={W_VANGNAU - 4} e={S3 + 4} text="TIGER'S EYE · SẮC VÀNG NÂU" y={1438} size={28} color={GOLD} weight={500} track={0.22} />
  </AbsoluteFill>;
};

const Photo: React.FC<{src: string; fr: number; a: number; b: number; z0: number; z1: number; filt?: string; ox?: string}> = ({src, fr, a, b, z0, z1, filt, ox = '50% 50%'}) => (
  <AbsoluteFill style={{transform: `scale(${interpolate(fr, [a, b], [z0, z1])})`, transformOrigin: ox}}>
    <Img src={img(src)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: filt}} />
  </AbsoluteFill>
);

const Scene34: React.FC<{fr: number}> = ({fr}) => {
  const x4 = ip(fr, S4 - 8, S4 + 14, 0, 1, Easing.inOut(Easing.cubic));
  return <AbsoluteFill style={{background: INK}}>
    <Photo src="kerala.jpg" fr={fr} a={S3 - 10} b={S4 + 14} z0={1.0} z1={1.12} filt="saturate(1.05) contrast(1.04)" ox="50% 45%" />
    {/* rừng gia vị → dây tiêu: lộ dần bằng vòng mở từ tâm (iris mềm) */}
    <AbsoluteFill style={{opacity: x4, filter: x4 < 0.999 ? `blur(${(1 - x4) * 8}px)` : undefined}}>
      <Photo src="pepper.jpg" fr={fr} a={S4 - 8} b={S5 + 10} z0={1.08} z1={1.0} filt="saturate(1.08) contrast(1.05)" ox="42% 60%" />
    </AbsoluteFill>
    {/* gradient tối phía trên + dưới để chữ đọc được, ảnh vẫn rõ */}
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(8,6,4,.72) 0%, rgba(8,6,4,.25) 30%, rgba(0,0,0,0) 48%, rgba(0,0,0,0) 62%, rgba(8,6,4,.55) 82%, rgba(8,6,4,.8) 100%)'}} />
    <Kicker fr={fr} s={W_VE - 6} e={S5 + 4} text="NGUỒN CẢM HỨNG" y={300} color={GOLD_L} />
    <Track fr={fr} s={W_KERALA - 8} e={S5 + 4} text="KERALA" y={330} size={140} />
    <Slide fr={fr} s={W_KERALA + 4} e={S5 + 4} text="Ấn Độ" y={545} size={44} italic color="#fff" weight={400} />
    <Slide fr={fr} s={W_VUON - 4} e={S5 + 4} text="khu vườn gia vị" y={1300} size={84} italic color={GOLD_L} weight={400} />
    <Slide fr={fr} s={W_ANDO - 4} e={S5 + 4} text="CỦA ẤN ĐỘ" y={1425} size={30} color={GOLD} weight={500} track={0.3} />
  </AbsoluteFill>;
};

// medallion note hương: ảnh thật trong khung tròn viền vàng + đường nối vẽ dần về chai
const Note: React.FC<{fr: number; s: number; src: string; cx: number; cy: number; d: number; idx: string; name: string; sub: string; subAt: number; lx: number; ly: number; side: 'l' | 'r'}> =
  ({fr, s, src, cx, cy, d, idx, name, sub, subAt, lx, ly, side}) => {
  const ln = ip(fr, s, s + 12, 0, 1, Easing.inOut(Easing.cubic));
  const p = ip(fr, s + 4, s + 20);
  const sc = interpolate(p, [0, 1], [0.55, 1]);
  const ring = ip(fr, s + 4, s + 22);
  const x2 = cx + (side === 'l' ? d / 2 : -d / 2) * 0.98;
  const len = Math.hypot(lx - x2, ly - cy);
  const fl = Math.sin((fr - s) / 20) * 5;
  return <>
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <line x1={lx} y1={ly} x2={x2} y2={cy + fl} stroke={GOLD} strokeWidth={2} strokeDasharray={len} strokeDashoffset={len * (1 - ln)} opacity={0.9} />
      <circle cx={lx} cy={ly} r={6 * ln} fill={GOLD_L} />
    </svg>
    {/* gợn sóng khi bật */}
    <div style={{position: 'absolute', left: cx - d / 2, top: cy - d / 2 + fl, width: d, height: d, borderRadius: '50%', border: `2px solid ${GOLD}`,
      transform: `scale(${1 + ring * 0.45})`, opacity: ring > 0 ? (1 - ring) * 0.8 : 0}} />
    <div style={{position: 'absolute', left: cx - d / 2, top: cy - d / 2 + fl, width: d, height: d, borderRadius: '50%', overflow: 'hidden', opacity: p,
      transform: `scale(${sc})`, boxShadow: `0 0 0 4px ${GOLD}, 0 0 0 9px rgba(217,183,108,.25), 0 24px 50px rgba(0,0,0,.7)`, filter: `blur(${(1 - p) * 8}px)`}}>
      <Img src={img(src)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(fr, [s, s + 120], [1.15, 1.0], {extrapolateRight: 'clamp'})})`}} />
    </div>
    <div style={{position: 'absolute', left: cx - 170, width: 340, top: cy + d / 2 + 30 + fl, textAlign: 'center'}}>
      <div style={{fontFamily: SANS, fontSize: 22, letterSpacing: '0.3em', color: GOLD, opacity: ip(fr, s + 8, s + 22)}}>{idx}</div>
      <div style={{overflow: 'hidden', paddingTop: '0.36em', marginTop: '-0.2em'}}>
        <div style={{fontFamily: SERIF, fontSize: 66, fontWeight: 500, lineHeight: 1.05, transform: `translateY(${(1 - ip(fr, s + 10, s + 26)) * 110}%)`,
          backgroundImage: `linear-gradient(180deg, ${GOLD_L} 15%, ${GOLD} 60%, ${GOLD_D} 100%)`, WebkitBackgroundClip: 'text', color: 'transparent',
          paddingTop: '0.36em', marginTop: '-0.36em'}}>{name}</div>
      </div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontSize: 31, color: '#F3EBDD', marginTop: 4, opacity: ip(fr, subAt, subAt + 14),
        transform: `translateY(${(1 - ip(fr, subAt, subAt + 14)) * 14}px)`, filter: `blur(${(1 - ip(fr, subAt, subAt + 14)) * 5}px)`}}>{sub}</div>
    </div>
  </>;
};

const Scene5: React.FC<{fr: number}> = ({fr}) => {
  const p = ip(fr, S5 + 2, S5 + 28);
  const bh = 760, bw = bh * 503 / 1374;
  const by = 560; // đỉnh chai
  const fl = Math.sin(fr / 24) * 6;
  const shine = interpolate(fr, [S5 + 22, S5 + 44], [-0.3, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const shine2 = interpolate(fr, [W_XIT - 4, W_XIT + 18], [-0.3, 1.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const glow = 0.55 + 0.15 * Math.sin(fr / 16);
  return <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 50% at 44% 52%, #3a2a14 0%, #17110a 50%, ${INK} 100%)`}}>
    <AbsoluteFill style={{opacity: 0.13}}>
      <Img src={img('texture.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${interpolate(fr, [S5, OUT], [1.05, 1.15])})`}} />
    </AbsoluteFill>
    <Dust fr={fr} n={24} op={0.85} />
    {/* quầng sáng sau chai */}
    <div style={{position: 'absolute', left: CX - 380, top: by - 80, width: 760, height: 1000, opacity: glow * p,
      background: 'radial-gradient(ellipse 45% 45% at 50% 50%, rgba(232,190,110,.42) 0%, rgba(232,190,110,0) 70%)'}} />
    {/* sàn */}
    <div style={{position: 'absolute', left: CX - 330, top: by + bh - 8, width: 660, height: 60, borderRadius: '50%', opacity: p,
      background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,.65), rgba(0,0,0,0) 70%)'}} />
    <div style={{position: 'absolute', left: CX - bw / 2, top: by + fl, width: bw, height: bh, opacity: p,
      transform: `translateY(${(1 - p) * 120}px) scale(${interpolate(p, [0, 1], [0.92, 1])})`, filter: `blur(${(1 - p) * 10}px) drop-shadow(0 30px 40px rgba(0,0,0,.7))`}}>
      <Img src={img('tygar_c.png')} style={{width: '100%', height: '100%'}} />
      {[shine, shine2].map((sh, k) => (
        <div key={k} style={{position: 'absolute', inset: 0, mixBlendMode: 'screen',
          WebkitMaskImage: `url(${img('tygar_c.png')})`, WebkitMaskSize: '100% 100%',
          background: `linear-gradient(115deg, transparent ${sh * 100 - 14}%, rgba(255,240,205,.55) ${sh * 100}%, transparent ${sh * 100 + 14}%)`}} />
      ))}
    </div>
    <Kicker fr={fr} s={S5 + 6} e={OUT + 20} text="BVLGARI · LE GEMME TYGAR" y={300} />
    <Rule fr={fr} s={S5 + 12} y={348} w={160} />
    <Slide fr={fr} s={S5 + 14} e={OUT + 20} text="Tầng hương" y={385} size={74} italic color={GOLD_L} weight={400} />
    <Note fr={fr} s={W_BUOI - 4} src="grape_sq.jpg" cx={205} cy={830} d={250} idx="01" name="Bưởi" sub="tươi sáng" subAt={W_BUOI + 12}
      lx={CX - bw / 2 + 18} ly={by + 300} side="l" />
    <Note fr={fr} s={W_GUNG - 4} src="ginger_sq.jpg" cx={742} cy={1010} d={250} idx="02" name="Gừng" sub="cay nhẹ, nam tính" subAt={W_CAY - 4}
      lx={CX + bw / 2 - 18} ly={by + 470} side="r" />
    <Vignette k={0.5} />
  </AbsoluteFill>;
};

export const Tygar: React.FC = () => {
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const sm = Easing.inOut(Easing.cubic);
  // vào/ra: hoà tan chéo + zoom + nhòe (mượt, không lộ hình tròn)
  const cin = ip(fr, IN - 10, IN + 6, 0, 1, sm);
  const cout = ip(fr, OUT - 4, OUT + 10, 0, 1, sm);
  const cov = Math.min(cin, 1 - cout);
  const vz = 1 - cov; // video phía dưới
  // cảnh: hoà tan chéo 12 frame ở mỗi ranh giới
  const X = 6;
  const w = (a: number, b: number, first = false, last = false) =>
    Math.min(first ? 1 : ip(fr, a - X, a + X, 0, 1, sm), last ? 1 : ip(fr, b - X, b + X, 1, 0, sm));
  const layers: [number, React.ReactNode, number][] = [
    [w(IN, S2, true), <Scene1 fr={fr} />, IN],
    [w(S2, S3), <Scene2 fr={fr} />, S2],
    [w(S3, S5), <Scene34 fr={fr} />, S3],
    [w(S5, OUT, false, true), <Scene5 fr={fr} />, S5],
  ];
  return <AbsoluteFill style={{background: '#000'}}>
    <AbsoluteFill style={{transform: `scale(${1 + 0.07 * (fr < IN + 8 ? cin : 1 - cout)})`, filter: `blur(${10 * (fr < IN + 8 ? cin : 1 - cout)}px)`}}>
      <OffthreadVideo src={staticFile('tygar/seg.mp4')} muted />
    </AbsoluteFill>
    {cov > 0.001 && <AbsoluteFill style={{opacity: cov, transform: `scale(${fr < IN + 8 ? 1.08 - 0.08 * cin : 1 + 0.06 * cout})`, filter: cov < 0.999 ? `blur(${(1 - cov) * 12}px)` : undefined}}>
      <AbsoluteFill style={{background: INK}} />
      {layers.map(([o, node, a], k) => o > 0.001 ? <AbsoluteFill key={k} style={{opacity: o, transform: `scale(${1 + (1 - o) * (fr < a ? -0.0 : 0.03)})`, filter: o < 0.999 ? `blur(${(1 - o) * 8}px)` : undefined}}>{node}</AbsoluteFill> : null)}
      <Leak fr={fr} at={S2} />
    </AbsoluteFill>}
  </AbsoluteFill>;
};
