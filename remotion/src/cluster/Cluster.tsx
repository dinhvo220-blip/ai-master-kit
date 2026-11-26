// Mẫu hiệu ứng chữ học từ 3 video raw.to.reel (26/11/2026 tối) – bóng người giả thay clip thật.
// Cụm chữ chồng tầng theo lời · bay vào có vệt nhòe hướng · kéo nét · nền xám nhấn mạnh · phụ đề 1 từ
// · icon nét vẽ dần · chữ lồng hoạ tiết + chữ viền · hàng thẻ trên đầu · màn kết khung ảnh lật 3D + outro.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender, staticFile} from 'remotion';
import {loadFonts} from '../fonts';

const FPS = 30;
const SANS = 'Be Vietnam Pro', SERIF = 'NotoSerifDisplay';
const BLUE = '#1E9BE8', YEL = '#FFC400', RED = '#E8262A', ORG = '#F26B1D', CYAN = '#19D3E6';
const f = (t: number) => Math.round(t * FPS);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = Easing.bezier(0.16, 1, 0.3, 1)) => interpolate(fr, [a, b], [from, to], {...cl, easing: e});
export const TOTAL = 24.0;

const R: Record<string, string> = {
  latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  'latin-ext': 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
  vietnamese: 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
};
let ld = false;
const loadSerif = () => {
  if (ld) return; ld = true;
  const h = delayRender('serif');
  Promise.all(Object.keys(R).flatMap((k) => ['normal', 'italic'].map((st) => new FontFace(SERIF, `url(${staticFile(`fonts/noto-serif-display-${k}-wght-${st}.woff2`)}) format('woff2')`, {weight: '100 900', style: st, unicodeRange: R[k]}).load().then((x) => (document as any).fonts.add(x)))))
    .then(() => continueRender(h)).catch(() => continueRender(h));
};

// ---------- nền "quầy" có bokeh màu + người giả ----------
const Bg: React.FC<{fr: number; gray: number}> = ({fr, gray}) => {
  const cols = ['#FF8FB1', '#7FD6E8', '#FFD27A', '#B9A3FF', '#FFB38A'];
  return (
    <AbsoluteFill style={{filter: `grayscale(${gray}) blur(${gray * 10}px) brightness(${1 - gray * 0.12}) contrast(${1 + gray * 0.1})`, transform: `scale(${1.02 + gray * 0.03})`}}>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, #F7EDE4 0%, #E9D6C6 45%, #B89A84 100%)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 1180, height: 740, background: 'linear-gradient(180deg, #6B4A3A, #3A2820)'}} />
      {Array.from({length: 22}).map((_, i) => {
        const x = random(`x${i}`) * 1080, y = 120 + random(`y${i}`) * 1100, r = 30 + random(`r${i}`) * 90;
        return <div key={i} style={{position: 'absolute', left: x - r + Math.sin(fr / 70 + i) * 14, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, ${cols[i % 5]}AA, transparent 70%)`}} />;
      })}
    </AbsoluteFill>
  );
};
const Person: React.FC<{fr: number}> = ({fr}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, transform: `translateX(${Math.sin(fr / 40) * 4}px)`}}>
    <defs>
      <linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C99577" /><stop offset="1" stopColor="#9A6A52" /></linearGradient>
      <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1F2A44" /><stop offset="1" stopColor="#0E1424" /></linearGradient>
    </defs>
    <ellipse cx={480} cy={720} rx={165} ry={175} fill="#2A1A12" />
    <ellipse cx={480} cy={800} rx={140} ry={170} fill="url(#sk)" />
    <rect x={435} y={940} width={90} height={150} fill="url(#sk)" />
    <path d="M 110 1920 C 120 1290, 290 1100, 480 1080 C 670 1100, 840 1290, 850 1920 Z" fill="url(#cl)" />
    <text x={480} y={1760} textAnchor="middle" fill="rgba(255,255,255,.3)" fontFamily={SANS} fontSize={26}>[ vị trí người nói ]</text>
  </svg>
);

// ---------- 1 từ trong cụm: bay vào có vệt nhòe theo hướng HOẶC kéo nét từ mờ ----------
type WP = {fr: number; t: number; x: number; y: number; id: string; mode?: 'fly' | 'focus'; dx?: number; dy?: number; anchor?: 'l' | 'c' | 'r'; children: React.ReactNode};
const Word: React.FC<WP> = ({fr, t, x, y, id, mode = 'focus', dx = -90, dy = 50, anchor = 'c', children}) => {
  const S = f(t);
  if (fr < S) return null;
  const p = ip(fr, S, S + (mode === 'fly' ? 6 : 8), 0, 1, Easing.out(Easing.cubic));
  const tx = anchor === 'c' ? '-50%' : anchor === 'r' ? '-100%' : '0%';
  if (mode === 'fly') {
    const bx = (1 - p) * Math.abs(dx) * 0.7, by = (1 - p) * Math.abs(dy) * 0.7;
    return (
      <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx},0) translate(${(1 - p) * dx}px, ${(1 - p) * dy}px)`, opacity: Math.min(1, p * 2), filter: `url(#${id})`}}>
        <svg width={0} height={0} style={{position: 'absolute'}}><filter id={id} x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation={`${bx + 0.01} ${by}`} /></filter></svg>
        {children}
      </div>
    );
  }
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(${tx},0) scale(${1.08 - 0.08 * p})`, opacity: p, filter: `blur(${(1 - p) * 14}px)`}}>{children}</div>;
};
// cả cụm rời đi cùng lúc: mờ tan + phóng nhẹ
const Cluster: React.FC<{fr: number; s: number; e: number; children: React.ReactNode}> = ({fr, s, e, children}) => {
  if (fr < f(s) - 1 || fr > f(e) + 7) return null;
  const q = ip(fr, f(e), f(e) + 6, 0, 1, Easing.in(Easing.quad));
  const drift = interpolate(fr, [f(s), f(e)], [1, 1.035], cl);
  return <AbsoluteFill style={{opacity: 1 - q, filter: `blur(${q * 12}px)`, transform: `scale(${drift + q * 0.05})`, transformOrigin: '480px 600px'}}>{children}</AbsoluteFill>;
};
const small = (c = '#fff', sz = 44): React.CSSProperties => ({fontFamily: SANS, fontWeight: 500, fontSize: sz, color: c, whiteSpace: 'nowrap', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,.35)'});
const big = (c = '#fff', sz = 170, up = false): React.CSSProperties => ({fontFamily: SANS, fontWeight: 900, fontSize: sz, color: c, whiteSpace: 'nowrap', letterSpacing: '-0.05em', lineHeight: 1, textTransform: up ? 'uppercase' : 'none', textShadow: '0 8px 24px rgba(0,0,0,.28)'});
const serifB = (c: string, sz = 150): React.CSSProperties => ({fontFamily: SERIF, fontWeight: 800, fontSize: sz, color: c, whiteSpace: 'nowrap', letterSpacing: '-0.03em', lineHeight: 1.05, textShadow: '0 8px 24px rgba(0,0,0,.25)'});

// ---------- icon nét mảnh vẽ dần (3 màu lệch nhau) ----------
const BOTTLE = 'M -60 -40 L -60 110 Q -60 140 -30 140 L 30 140 Q 60 140 60 110 L 60 -40 Q 60 -60 40 -60 L 22 -60 L 22 -95 L -22 -95 L -22 -60 L -40 -60 Q -60 -60 -60 -40 Z';
const LineIcon: React.FC<{fr: number; s: number; e: number; x: number; y: number; sc?: number; rot?: number}> = ({fr, s, e, x, y, sc = 1, rot = 0}) => {
  if (fr < f(s) || fr > f(e) + 6) return null;
  const L = 900;
  const out = ip(fr, f(e), f(e) + 6);
  return (
    <svg width={400} height={400} viewBox="-200 -200 400 400" style={{position: 'absolute', left: x - 200, top: y - 200 + Math.sin(fr / 18) * 6, opacity: 1 - out, transform: `rotate(${rot}deg) scale(${sc})`}}>
      {[[BLUE, 0, -14, 10], [YEL, 4, 12, -8], ['#FFFFFF', 8, 0, 0]].map(([c, d, ox, oy], i) => {
        const p = ip(fr, f(s) + (d as number), f(s) + (d as number) + 18, 0, 1, Easing.inOut(Easing.cubic));
        return <path key={i} d={BOTTLE} transform={`translate(${ox} ${oy})`} fill="none" stroke={c as string} strokeWidth={9} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={L} strokeDashoffset={L * (1 - p)} />;
      })}
    </svg>
  );
};

// ---------- phụ đề 1 từ ở ngực ----------
const ONE: [number, string][] = [[6.7, 'vậy'], [7.05, 'thì'], [7.4, 'thử'], [7.8, 'ngay'], [8.25, 'mùi'], [8.6, 'này'], [9.0, 'nè'], [9.5, 'mọi'], [9.8, 'người']];
const OneWord: React.FC<{fr: number}> = ({fr}) => {
  const t = fr / FPS;
  const i = ONE.findIndex(([s], k) => t >= s && (k === ONE.length - 1 ? t < 10.4 : t < ONE[k + 1][0]));
  if (i < 0) return null;
  const S = f(ONE[i][0]);
  const p = ip(fr, S, S + 4, 0, 1, Easing.out(Easing.back(2)));
  return <div style={{position: 'absolute', left: 70, right: 190, top: 1180, textAlign: 'center', transform: `scale(${1.15 - 0.15 * p})`, opacity: Math.min(1, p * 2)}}>
    <span style={{fontFamily: SANS, fontWeight: 800, fontSize: 64, color: '#fff', letterSpacing: '-0.02em', textShadow: '0 4px 18px rgba(0,0,0,.55)'}}>{ONE[i][1]}</span>
  </div>;
};

// ---------- chữ lồng hoạ tiết (SVG pattern trong <text>) + chữ chỉ có viền ----------
const TexWord: React.FC<{fr: number; t: number}> = ({fr, t}) => {
  const S = f(t);
  if (fr < S) return null;
  const p = ip(fr, S, S + 8, 0, 1, Easing.out(Easing.cubic));
  const shift = (fr - S) * 3;
  return (
    <svg width={900} height={330} viewBox="0 0 900 330" style={{position: 'absolute', left: 30, top: 380, opacity: p, filter: `blur(${(1 - p) * 12}px)`, transform: `scale(${1.08 - 0.08 * p})`, overflow: 'visible'}}>
      <defs>
        <pattern id="tiger" patternUnits="userSpaceOnUse" width="140" height="330" patternTransform={`rotate(14) translate(${shift} 0)`}>
          <rect width="140" height="330" fill="#7A4A16" />
          <rect x="0" width="22" height="330" fill="#C98A2E" /><rect x="34" width="12" height="330" fill="#3A210C" />
          <rect x="60" width="30" height="330" fill="#E2A64A" /><rect x="96" width="10" height="330" fill="#2A170A" /><rect x="112" width="18" height="330" fill="#A86A22" />
        </pattern>
        <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
          <stop offset={Math.max(0, ((fr - S) % 60) / 60 - 0.1)} stopColor="#fff" stopOpacity="0" />
          <stop offset={((fr - S) % 60) / 60} stopColor="#fff" stopOpacity="0.55" />
          <stop offset={Math.min(1, ((fr - S) % 60) / 60 + 0.1)} stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <text x={450} y={260} textAnchor="middle" fontFamily={SERIF} fontWeight={800} fontSize={232} letterSpacing={-5} fill="url(#tiger)" stroke="#2A170A" strokeWidth={2}>Tygar</text>
      <text x={450} y={260} textAnchor="middle" fontFamily={SERIF} fontWeight={800} fontSize={232} letterSpacing={-5} fill="url(#shine)">Tygar</text>
    </svg>
  );
};
const OutlineWord: React.FC<{fr: number; t: number; txt: string; x: number; y: number}> = ({fr, t, txt, x, y}) => {
  const S = f(t);
  if (fr < S) return null;
  const p = ip(fr, S, S + 18, 0, 1, Easing.inOut(Easing.cubic));
  return (
    <svg width={700} height={230} viewBox="0 0 700 230" style={{position: 'absolute', left: x - 350, top: y}}>
      <text x={350} y={190} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={200} letterSpacing={p < 1 ? 40 * (1 - p) : 0}
        fill="none" stroke="#fff" strokeWidth={3} strokeDasharray={1400} strokeDashoffset={1400 * (1 - p)} style={{filter: 'drop-shadow(0 4px 10px rgba(0,0,0,.4))'}}>{txt}</text>
    </svg>
  );
};


// ---------- CHỮ KÍNH XUYÊN THẤU (mẫu "1st"/"CALGARY"): bản sao cảnh phía sau bị cắt theo hình chữ,
// đảo sáng + nhuộm xanh (nền sáng → chữ xanh đậm, nền tối → chữ xanh sáng), lệch nhẹ như qua thấu kính, viền sáng mảnh.
// Với clip thật: thay <Scene/> bằng <OffthreadVideo> cùng nguồn + cùng transform với video gốc.
const GlassWord: React.FC<{fr: number; t: number; e: number; id: string; text: string; x: number; y: number; size: number; serif?: boolean; Scene: React.FC; tint?: string}> = ({fr, t, e, id, text, x, y, size, serif, Scene, tint = '#2F7BFF'}) => {
  const S = f(t), E = f(e);
  if (fr < S || fr > E + 7) return null;
  const p = ip(fr, S, S + 9, 0, 1, Easing.out(Easing.cubic));
  const q = ip(fr, E, E + 6, 0, 1, Easing.in(Easing.quad));
  const slide = (1 - p) * -120 + q * 60;
  const fam = serif ? SERIF : SANS, wt = serif ? 800 : 900;
  const T = (extra: any) => <text x={x + slide} y={y} textAnchor="middle" fontFamily={fam} fontWeight={wt} fontSize={size} letterSpacing={serif ? -4 : -2} {...extra}>{text}</text>;
  const lens = 1.06, ox = Math.sin(fr / 25) * 10;
  return (
    <AbsoluteFill style={{opacity: Math.min(1, p * 1.6) * (1 - q), filter: `blur(${(1 - p) * 10 + q * 10}px)`}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs><clipPath id={id} clipPathUnits="userSpaceOnUse">{T({})}</clipPath></defs></svg>
      <AbsoluteFill style={{clipPath: `url(#${id})`, isolation: 'isolate'}}>
        <AbsoluteFill style={{transform: `translate(${ox + 14}px, 10px) scale(${lens})`, transformOrigin: `${x}px ${y}px`, filter: 'grayscale(1) invert(0.9) contrast(1.15) brightness(1.05)'}}><Scene /></AbsoluteFill>
        <AbsoluteFill style={{background: `linear-gradient(180deg, ${tint} 0%, #1C3FD6 100%)`, mixBlendMode: 'color'}} />
        <AbsoluteFill style={{background: `linear-gradient(115deg, transparent ${30 + ((fr - S) % 90)}%, rgba(255,255,255,.35) ${40 + ((fr - S) % 90)}%, transparent ${50 + ((fr - S) % 90)}%)`, mixBlendMode: 'screen'}} />
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {T({fill: 'none', stroke: 'rgba(225,240,255,.75)', strokeWidth: 1.6})}
        {T({fill: 'none', stroke: 'rgba(10,30,90,.35)', strokeWidth: 1, transform: 'translate(2 3)'})}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- hàng thẻ trên đầu ----------
const Cards: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (fr < f(s) || fr > f(e) + 7) return null;
  const out = ip(fr, f(e), f(e) + 6);
  const items: [string, string, string][] = [['Tygar', '#C47A2C', '#3A210C'], ['Onekh', '#2E7D6B', '#0F2E27'], ['Gyan', '#7B3FA0', '#2A1238']];
  return (
    <div style={{position: 'absolute', left: 95, top: 320, width: 770, display: 'flex', justifyContent: 'space-between', opacity: 1 - out, filter: `blur(${out * 10}px)`}}>
      {items.map(([n, c1, c2], i) => {
        const st = f(s) + i * 5;
        const p = ip(fr, st, st + 10, 0, 1, Easing.out(Easing.back(1.4)));
        return (
          <div key={n} style={{width: 230, height: 270, borderRadius: 18, background: '#fff', padding: 10, boxSizing: 'border-box', boxShadow: '0 14px 34px rgba(0,0,0,.3)',
            transform: `translateY(${(1 - p) * -80}px) rotate(${(i - 1) * 3 * p}deg)`, opacity: Math.min(1, p * 2)}}>
            <div style={{height: 175, borderRadius: 12, background: `radial-gradient(70% 70% at 50% 35%, ${c1}, ${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <svg width={70} height={100} viewBox="-70 -100 140 250"><path d={BOTTLE} fill="rgba(255,255,255,.18)" stroke="#fff" strokeWidth={6} /></svg>
            </div>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 34, color: '#1A1410', textAlign: 'center', marginTop: 10}}>{n}</div>
          </div>
        );
      })}
    </div>
  );
};

// ---------- màn kết khung ảnh lật 3D + outro thanh tìm kiếm ----------
const EndCard: React.FC<{fr: number; s: number}> = ({fr, s}) => {
  const S = f(s);
  if (fr < S - 6) return null;
  const a = ip(fr, S - 6, S + 4);
  const flip = ip(fr, S, S + 18, 0, 1, Easing.out(Easing.back(1.2)));
  const nm = ip(fr, S + 14, S + 24);
  const OUT = f(21.2);
  const o2 = ip(fr, OUT - 4, OUT + 4);
  const bar = ip(fr, OUT + 6, OUT + 20, 0, 1, Easing.inOut(Easing.cubic));
  const glitch = fr > OUT + 6 && fr < OUT + 22 ? Math.sin(fr * 2.1) * 10 * (1 - bar) : 0;
  return (
    <AbsoluteFill style={{opacity: a}}>
      <AbsoluteFill style={{background: 'radial-gradient(80% 60% at 50% 40%, rgba(60,40,30,.55), rgba(20,14,10,.85))', backdropFilter: 'blur(20px)'}} />
      <div style={{position: 'absolute', left: 480 - 190, top: 470, width: 380, perspective: 900, opacity: 1 - o2}}>
        <div style={{transform: `rotateY(${(1 - flip) * 70}deg) rotateX(${(1 - flip) * 15}deg) rotate(${-4 * flip}deg)`, background: '#fff', padding: 14, borderRadius: 14, boxShadow: '0 30px 60px rgba(0,0,0,.5)'}}>
          <div style={{height: 380, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(180deg, #F2E3D5, #C9A58A)', position: 'relative'}}>
            <svg width={352} height={380} viewBox="0 0 352 380"><ellipse cx={176} cy={150} rx={70} ry={80} fill="#B5836A" /><path d="M 30 380 C 40 280, 110 240, 176 236 C 242 240, 312 280, 322 380 Z" fill="#1F2A44" /></svg>
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 70, right: 190, top: 950, textAlign: 'center', opacity: nm * (1 - o2), transform: `translateY(${(1 - nm) * 20}px)`}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, color: '#fff', letterSpacing: '-0.04em'}}>Darren</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 40, color: '#F3DDA2'}}>Luxury Beauty · escentials</div>
      </div>
      {/* outro kiểu TikTok */}
      <AbsoluteFill style={{background: '#0E0F1A', opacity: o2}}>
        <div style={{position: 'absolute', left: 480 - 260, top: 860, width: 520, height: 84, opacity: bar > 0 ? 1 : 0}}>
          {[['#25F4EE', -6 - glitch, -4], ['#FE2C55', 6 + glitch, 4]].map(([c, dx, dy], i) => (
            <div key={i} style={{position: 'absolute', inset: 0, transform: `translate(${dx}px, ${dy}px) scaleX(${bar})`, borderRadius: 12, background: c as string, opacity: 0.9}} />
          ))}
          <div style={{position: 'absolute', inset: 0, transform: `scaleX(${bar})`, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', padding: '0 26px', gap: 16, boxSizing: 'border-box'}}>
            <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth={2.4}><circle cx="10.5" cy="10.5" r="6.5" /><path d="M15.5 15.5L21 21" /></svg>
            <span style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, color: '#111', opacity: ip(fr, OUT + 18, OUT + 26)}}>@darrenbeauty01</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- whip/zoom-blur giữa các cảnh (chữ dính theo khung) ----------
const CUTS = [6.5, 10.5, 14.5];
const whip = (fr: number) => {
  let k = 0;
  for (const c of CUTS) { const d = fr - f(c); if (d > -6 && d < 7) k = Math.max(k, 1 - Math.abs(d) / 7); }
  return k;
};

const Label: React.FC<{fr: number}> = ({fr}) => {
  const L: [number, number, string][] = [[0, 3.2, 'Cụm chữ chồng tầng theo lời'], [3.2, 6.5, 'Nền xám + mờ ở câu nhấn mạnh'], [6.5, 10.5, 'Phụ đề 1 từ + icon nét vẽ dần'], [10.5, 14.5, 'Chữ kính xuyên thấu (như gương)'], [14.5, 17.6, 'Hàng thẻ trên đầu + chữ viền'], [17.6, 24, 'Màn kết khung ảnh lật 3D + outro']];
  const c = L.find(([s, e]) => fr >= f(s) && fr < f(e));
  if (!c) return null;
  const a = Math.min(ip(fr, f(c[0]) + 3, f(c[0]) + 12), ip(fr, f(c[1]) - 6, f(c[1]), 1, 0));
  return <div style={{position: 'absolute', left: 70, top: 250, opacity: a * 0.92, padding: '8px 18px', borderRadius: 30, background: 'rgba(20,14,10,.45)', border: '1px solid rgba(255,255,255,.3)', fontFamily: SANS, fontWeight: 500, fontSize: 22, color: '#fff'}}>{c[2]}</div>;
};

export const ClusterDemo: React.FC = () => {
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const SceneCopy: React.FC = () => <><Bg fr={fr} gray={0} /><Person fr={fr} /></>;
  const gray = Math.min(ip(fr, f(3.4), f(3.4) + 6), ip(fr, f(6.2), f(6.2) + 6, 1, 0));
  const w = whip(fr);
  const zoom = 1 + interpolate(fr, [0, f(TOTAL)], [0, 0.04], cl) + w * 0.14;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><filter id="whip" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={`${w * 60 + 0.01} ${w * 8}`} /></filter></svg>
      <AbsoluteFill style={{transform: `scale(${zoom}) translateX(${w * 30}px)`, filter: w > 0.02 ? 'url(#whip)' : 'none'}}>
        <Bg fr={fr} gray={gray} />
        {/* lớp SAU người */}
        <Cluster fr={fr} s={0.3} e={3.1}>
          <Word fr={fr} t={0.3} x={150} y={372} id="w1" mode="fly" dx={-120} dy={0} anchor="l"><span style={small('#1A1410')}>nếu bạn đang</span></Word>
          <Word fr={fr} t={0.6} x={480} y={400} id="w2" mode="fly" dx={-90} dy={70}><span style={big('#FFFFFF', 190)}>tìm</span></Word>
          <Word fr={fr} t={1.1} x={790} y={575} id="w3" anchor="r"><span style={small('#1A1410', 40)}>một mùi hương</span></Word>
        </Cluster>
        <Cluster fr={fr} s={3.3} e={6.3}>
          <Word fr={fr} t={3.3} x={140} y={360} id="w5" anchor="l"><span style={small('#fff')}>nhưng lại</span></Word>
          <Word fr={fr} t={3.5} x={480} y={385} id="w6" mode="fly" dx={0} dy={110}><span style={big(RED, 138, true)}>QUÁ NỒNG</span></Word>
          <Word fr={fr} t={4.4} x={800} y={560} id="w7" anchor="r"><span style={small('#fff', 40)}>ai đi ngang cũng né</span></Word>
        </Cluster>
        <Cluster fr={fr} s={10.6} e={14.4}>
          <Word fr={fr} t={10.6} x={140} y={360} id="w8" anchor="l"><span style={small('#1A1410')}>chai</span></Word>
        </Cluster>
        <Person fr={fr} />
        {/* lớp TRƯỚC người */}
        <Cluster fr={fr} s={1.7} e={3.1}>
          <Word fr={fr} t={1.7} x={170} y={1150} id="w4a" anchor="l"><span style={small('#fff', 42)}>để đi</span></Word>
          <Word fr={fr} t={1.95} x={480} y={1180} id="w4" mode="fly" dx={110} dy={0}><span style={serifB(BLUE, 140)}>hẹn hò</span></Word>
        </Cluster>
        {/* chữ kính: nằm TRƯỚC người, nhìn xuyên thấy đầu/áo phía sau */}
        <GlassWord fr={fr} t={10.9} e={14.4} id="gl1" text="Tygar" x={480} y={640} size={250} serif Scene={SceneCopy} />
        <GlassWord fr={fr} t={11.9} e={14.4} id="gl2" text="LE GEMME" x={480} y={1320} size={150} Scene={SceneCopy} tint="#5AA0FF" />
        <LineIcon fr={fr} s={6.8} e={10.3} x={790} y={560} sc={0.9} rot={8} />
        <LineIcon fr={fr} s={7.3} e={10.3} x={190} y={760} sc={0.6} rot={-10} />
        <OneWord fr={fr} />
        <Cluster fr={fr} s={11.6} e={14.4}>
          <Word fr={fr} t={11.6} x={480} y={1110} id="w9"><span style={small('#fff', 42)}>dòng</span></Word>
        </Cluster>
        <Cards fr={fr} s={14.6} e={17.5} />
        <Cluster fr={fr} s={15.3} e={17.5}>
          <Word fr={fr} t={15.3} x={170} y={1150} id="wa" anchor="l"><span style={small('#fff', 42)}>chai nào cũng</span></Word>
          <Word fr={fr} t={15.6} x={480} y={1185} id="wb" mode="fly" dx={-100} dy={60}><span style={big(YEL, 150)}>đáng tiền</span></Word>
          <Word fr={fr} t={16.2} x={480} y={1330} id="wc"><span style={small('#fff', 38)}>bộ sưu tập</span></Word>
          <OutlineWord fr={fr} t={16.4} txt="2026" x={480} y={1340} />
        </Cluster>
      </AbsoluteFill>
      <EndCard fr={fr} s={17.6} />
      <Label fr={fr} />
    </AbsoluteFill>
  );
};
