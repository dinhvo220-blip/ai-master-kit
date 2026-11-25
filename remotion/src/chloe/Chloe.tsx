// Chloé Eau de Parfum – video kể chuyện "Vì sao luôn có một chiếc nơ" (24/11/2026)
// Tông sáng: kem/nude ruy băng/hồng phấn/mực nâu. Serif nghiêng (Noto Serif Display) + Be Vietnam Pro.
// Shotcraft: text-as-mask (chữ Chloé chứa ảnh), light-leak-burn (chuyển cảnh mùi hương), sheen sweep, halation.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing, spring, useVideoConfig, delayRender, continueRender, random} from 'remotion';
import {loadFonts} from '../fonts';
import data from './chloe.json';
const D: any = data;
const FPS = 30;
const SAFE_L = 70, SAFE_R = 890, CX = 480;
export const C = {bg: '#F6EFE7', bg2: '#ECE1D5', ink: '#2B211B', ink2: '#5A4A3E', nude: '#D9C6AE', nude2: '#B99C7D', blush: '#EBC9C2', rose: '#B5615B', amber: '#D59A55', cream: '#FFFaf3'};
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const SANS = 'Be Vietnam Pro';
const SERIF = 'NotoSerifDisplay';
const VI = 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB';
const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LEXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
let serifLoaded = false;
export const loadSerif = () => {
  if (serifLoaded) return; serifLoaded = true;
  const h = delayRender('serif');
  const jobs: Promise<any>[] = [];
  for (const st of ['normal', 'italic']) for (const [sub, r] of [['latin', LAT], ['latin-ext', LEXT], ['vietnamese', VI]]) {
    const ff = new FontFace(SERIF, `url(${staticFile(`fonts/noto-serif-display-${sub}-wght-${st}.woff2`)}) format('woff2')`, {weight: '100 900', style: st, unicodeRange: r});
    jobs.push(ff.load().then((x) => (document as any).fonts.add(x)));
  }
  Promise.all(jobs).then(() => continueRender(h)).catch((e) => {console.error(e); continueRender(h);});
};
const f = (t: number) => Math.round(t * FPS);
const cl = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};
const inP = (fr: number, t: number, d = 12) => interpolate(fr, [f(t), f(t) + d], [0, 1], {...cl, easing: EIN});
const outP = (fr: number, t: number, d = 8) => interpolate(fr, [f(t) - d, f(t)], [1, 0], {...cl, easing: EOUT});
const life = (fr: number, s: number, e: number, a = 12, b = 9) => Math.min(inP(fr, s, a), outP(fr, e, b));
const vnCap: React.CSSProperties = {paddingTop: '0.34em', marginTop: '-0.3em'};

// ---------- nền: kem + vân xếp ly rất mờ (gợi nếp chai/áo lụa) ----------
const Bg: React.FC<{fr: number}> = ({fr}) => {
  const sweep = interpolate(fr % 420, [0, 420], [-40, 140]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 95% 70% at 50% 40%, ${C.cream} 0%, ${C.bg} 55%, ${C.bg2} 100%)`}} />
      <AbsoluteFill style={{opacity: 0.35, backgroundImage: `repeating-linear-gradient(90deg, rgba(185,156,125,0.0) 0 34px, rgba(185,156,125,0.10) 34px 36px, rgba(255,255,255,0.35) 36px 40px, rgba(185,156,125,0.0) 40px 74px)`}} />
      <AbsoluteFill style={{background: `linear-gradient(100deg, transparent ${sweep}%, rgba(255,255,255,0.45) ${sweep + 7}%, transparent ${sweep + 16}%)`}} />
    </AbsoluteFill>
  );
};

// ---------- nền tâm trạng cho phần mùi hương ----------
export const Mood: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const t0 = f(sc.s), lf = fr - t0;
  if (sc.mood === 'mist') {
    return (
      <AbsoluteFill>
        {Array.from({length: 70}, (_, i) => {
          const a = random(`ma${i}`) * Math.PI * 2, sp = 2 + random(`ms${i}`) * 5, r = 2 + random(`mr${i}`) * 7;
          const st = 4 + random(`mt${i}`) * 26, lt = Math.max(0, lf - st);
          const ang = -Math.PI / 2 + 0.75 + (random(`ma${i}`) - 0.5) * 0.9;
          const d = lt * sp * 1.6;
          const x = 488 + Math.cos(ang) * d, y = 812 + Math.sin(ang) * d - lt * 0.4;
          const o = lt <= 0 ? 0 : Math.min(1, lt / 6) * Math.max(0, 1 - lt / 75);
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: r * (1 + lt / 30), height: r * (1 + lt / 30), borderRadius: '50%', background: 'rgba(255,255,255,0.9)', boxShadow: '0 0 10px rgba(217,198,174,0.9)', filter: 'blur(1.5px)', opacity: o}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (sc.mood === 'morning') {
    const open = interpolate(lf, [6, 40], [0, 1], {...cl, easing: EIN});
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #FBF3E2 0%, #F7E9CF 55%, #F3E2D6 100%)'}} />
        {/* tia nắng */}
        {Array.from({length: 7}, (_, i) => <div key={i} style={{position: 'absolute', left: 120 + i * 120, top: 520, width: 70, height: 1100, transformOrigin: 'top center', transform: `rotate(${18 - i * 2}deg)`,
          background: 'linear-gradient(180deg, rgba(255,236,190,0.55), rgba(255,236,190,0))', opacity: (0.35 + 0.2 * Math.sin(lf / 20 + i)) * open, filter: 'blur(10px)'}} />)}
        {/* khung cửa sổ Paris: 2 cánh mở ra */}
        <div style={{position: 'absolute', left: 230, top: 640, width: 500, height: 600, perspective: 1400}}>
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: 'linear-gradient(180deg, #DCE9F0 0%, #F4EEDD 60%, #FBE3C4 100%)'}}>
            <div style={{position: 'absolute', left: 300, top: 300, width: 260, height: 260, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,246,220,1) 0%, rgba(255,226,170,0.7) 30%, transparent 70%)', transform: `translateY(${-40 * open}px)`}} />
            <svg width="500" height="600" viewBox="0 0 500 600" style={{position: 'absolute', inset: 0}}>
              <path d="M0 470 L40 470 L40 430 L70 410 L100 430 L100 455 L150 455 L150 400 L165 400 L165 380 L180 380 L180 400 L230 400 L230 440 L280 440 L280 395 L310 370 L340 395 L340 450 L390 450 L390 420 L420 420 L420 405 L432 405 L432 420 L460 420 L460 460 L500 460 L500 600 L0 600Z" fill="#C9B8A6" opacity="0.75" />
              <path d="M240 440 L248 330 L256 440Z M248 300 L252 330 L244 330Z" fill="#B7A592" opacity="0.8" />
              <path d="M0 520 L60 505 L120 515 L200 500 L300 512 L400 498 L500 510 L500 600 L0 600Z" fill="#B3A08C" opacity="0.6" />
            </svg>
          </div>
          {[0, 1].map((s) => (
            <div key={s} style={{position: 'absolute', top: 0, height: 600, width: 250, [s ? 'right' : 'left']: 0, transformOrigin: s ? 'right center' : 'left center',
              transform: `rotateY(${(s ? 1 : -1) * 62 * open}deg)`, border: `12px solid #EFE3D3`, boxShadow: '0 10px 30px rgba(90,70,50,0.3)', background: 'rgba(220,233,240,0.35)'}}>
              <div style={{position: 'absolute', left: '50%', top: 0, bottom: 0, width: 6, background: C.cream}} />
              <div style={{position: 'absolute', top: '33%', left: 0, right: 0, height: 6, background: C.cream}} />
              <div style={{position: 'absolute', top: '66%', left: 0, right: 0, height: 6, background: C.cream}} />
            </div>
          ))}
          <div style={{position: 'absolute', inset: -16, border: '16px solid #E7D7C3', boxShadow: '0 20px 40px rgba(90,70,50,0.25)'}} />
          <div style={{position: 'absolute', left: -40, right: -40, bottom: -44, height: 28, background: '#E7D7C3', boxShadow: '0 8px 20px rgba(90,70,50,0.25)'}} />
        </div>
        {/* giọt sương lấp lánh */}
        {Array.from({length: 26}, (_, i) => {
          const x = 140 + random(`dx${i}`) * 700, y = 640 + random(`dy${i}`) * 620 - lf * (0.3 + random(`dv${i}`) * 0.5);
          const tw = 0.5 + 0.5 * Math.sin(lf / 6 + i * 1.7);
          return <div key={i} style={{position: 'absolute', left: x, top: y, width: 6, height: 6, borderRadius: '50%', background: '#fff', boxShadow: '0 0 12px 4px rgba(255,240,200,0.9)', opacity: tw * open}} />;
        })}
      </AbsoluteFill>
    );
  }
  if (sc.mood === 'rose') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{background: 'radial-gradient(ellipse 90% 70% at 50% 45%, #FBEDEA 0%, #F2D3CD 60%, #E7BDB6 100%)'}} />
        {Array.from({length: 22}, (_, i) => {
          const x0 = 60 + random(`px${i}`) * 860, sp = 1.6 + random(`ps${i}`) * 2.2, sz = 34 + random(`pz${i}`) * 46;
          const y = -120 + ((lf * sp + random(`py${i}`) * 1900) % 1950);
          const x = x0 + Math.sin(lf / 28 + i) * 50, rot = lf * (1 + random(`pr${i}`)) + i * 40;
          const col = ['#E9A9A6', '#DD8F8E', '#F2C2BE', '#C9706F'][i % 4];
          return (
            <svg key={i} width={sz} height={sz} viewBox="0 0 40 40" style={{position: 'absolute', left: x, top: y, transform: `rotate(${rot}deg) rotateX(${Math.sin(lf / 15 + i) * 50}deg)`, opacity: 0.85, filter: 'drop-shadow(0 4px 6px rgba(140,60,60,0.18))'}}>
              <path d="M20 3 C33 6 38 20 30 31 C25 37 15 37 10 31 C2 20 7 6 20 3Z" fill={col} />
              <path d="M20 6 C24 14 24 24 20 34" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" />
            </svg>
          );
        })}
      </AbsoluteFill>
    );
  }
  if (sc.mood === 'evening') {
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{background: 'linear-gradient(180deg, #F3D9B8 0%, #E6B98C 45%, #C98F7E 100%)'}} />
        <AbsoluteFill style={{background: 'radial-gradient(circle at 70% 30%, rgba(255,226,170,0.75) 0%, transparent 45%)'}} />
        {/* lụa gợn sóng */}
        <svg width="1080" height="1920" style={{position: 'absolute', inset: 0}}>
          {Array.from({length: 9}, (_, i) => {
            const y = 700 + i * 70, ph = lf / 30 + i * 0.5;
            const d = Array.from({length: 13}, (_, k) => {
              const x = -60 + k * 100; const yy = y + Math.sin(ph + k * 0.6) * (40 + i * 3);
              return `${k ? 'L' : 'M'}${x} ${yy.toFixed(1)}`;
            }).join(' ');
            return <path key={i} d={d} fill="none" stroke={i % 2 ? 'rgba(255,240,220,0.55)' : 'rgba(150,90,70,0.25)'} strokeWidth={i % 2 ? 3 : 2} />;
          })}
        </svg>
      </AbsoluteFill>
    );
  }
  return null;
};

const Chapter: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  if (!sc.chapter) return null;
  const p = inP(fr, sc.s + 0.1, 14);
  return (
    <div style={{position: 'absolute', left: 92, top: 262, display: 'flex', alignItems: 'center', gap: 14, opacity: p * 0.9}}>
      <div style={{width: 46 * p, height: 1.5, background: C.nude2}} />
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: '0.28em', color: C.ink2}}>{sc.chapter}</div>
    </div>
  );
};

const TitleBlock: React.FC<{fr: number; s: number; kicker: string; title: string; size: number; out?: number}> = ({fr, s, kicker, title, size, out}) => {
  const lines = title.split('\n');
  const kp = inP(fr, s + 0.05, 16);
  const o = out ? outP(fr, out, 8) : 1;
  const top = lines.length > 1 ? 318 : 360;
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top, textAlign: 'center', opacity: o, transform: `translateY(${(1 - o) * -20}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 21, letterSpacing: `${0.55 - 0.25 * kp}em`, color: C.nude2, opacity: kp, marginBottom: 10}}>{kicker}</div>
      {lines.map((ln, i) => {
        const p = inP(fr, s + 0.12 + i * 0.12, 18);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: 10}}>
            <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: size, lineHeight: 1.08, color: C.ink, ...vnCap, transform: `translateY(${(1 - p) * 105}%)`}}>{ln}</div>
          </div>
        );
      })}
      <div style={{margin: '14px auto 0', width: 110 * inP(fr, s + 0.35, 20), height: 1.5, background: `linear-gradient(90deg, transparent, ${C.nude2}, transparent)`}} />
    </div>
  );
};

const Title: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  if (!sc.title) return null;
  if (sc.title2) return (
    <>
      <TitleBlock fr={fr} s={sc.s} kicker={sc.kicker} title={sc.title} size={sc.size} out={sc.title2.d - 0.05} />
      {fr >= f(sc.title2.d) - 2 ? <TitleBlock fr={fr} s={sc.title2.d} kicker={sc.title2.kicker} title={sc.title2.text} size={sc.size + 6} /> : null}
    </>
  );
  return <TitleBlock fr={fr} s={sc.s} kicker={sc.kicker} title={sc.title} size={sc.size} />;
};

// ---------- ảnh sản phẩm lớn (nền trắng hòa vào nền kem bằng multiply) ----------
const Hero: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const h = sc.hero;
  const kb = interpolate(fr, [f(sc.s), f(sc.e)], [h.from, h.to], {...cl, easing: Easing.inOut(Easing.sin)});
  const p = inP(fr, sc.s + 0.05, 20);
  const sw = interpolate(fr, [f(h.sheen), f(h.sheen) + 22], [-60, 160], cl);
  const halo = h.halo ? 0.55 + 0.25 * Math.sin(fr / 18) : 0;
  return (
    <div style={{position: 'absolute', left: SAFE_L - 40, width: SAFE_R - SAFE_L + 80, top: 600, height: 760, overflow: 'hidden', opacity: p, filter: `blur(${(1 - p) * 8}px)`,
      WebkitMaskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000 62%, transparent 100%)', maskImage: 'radial-gradient(ellipse 62% 60% at 50% 50%, #000 62%, transparent 100%)'}}>
      
      {halo ? <div style={{position: 'absolute', left: '15%', right: '15%', top: '18%', bottom: '18%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,236,200,0.9), transparent 70%)', opacity: halo, filter: 'blur(30px)'}} /> : null}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${kb})`, transformOrigin: `${h.ox}% ${h.oy}%`}}>
        <Img src={staticFile(h.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${sw}%, rgba(255,255,255,0.75) ${sw + 6}%, transparent ${sw + 13}%)`, mixBlendMode: 'soft-light'}} />
      </div>
    </div>
  );
};

const Card: React.FC<{fr: number; c: any; sc: any}> = ({fr, c, sc}) => {
  const end = c.until ?? sc.e;
  const p = inP(fr, c.d, 16);
  const o = Math.min(p, c.nofade ? (fr < f(end) + 8 ? 1 : 0) : outP(fr, end, 8));
  if (o <= 0) return null;
  const kb = interpolate(fr, [f(c.d), f(end)], [1.0, 1.08], cl);
  const rot = (c.rot ?? 0) * (0.6 + 0.4 * p);
  const pl = c.pleat ? interpolate((fr - f(c.d)) % 70, [0, 70], [-30, 130]) : 0;
  return (
    <div style={{position: 'absolute', left: c.x - c.w / 2, top: c.y - c.h / 2, width: c.w, height: c.h, opacity: o,
      transform: `translateY(${(1 - p) * 60}px) rotate(${rot}deg) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 10}px)`}}>
      <div style={{position: 'absolute', inset: -14, background: C.cream, boxShadow: '0 24px 50px rgba(80,60,40,0.22), 0 2px 6px rgba(80,60,40,0.12)'}} />
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: '#fff'}}>
        <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`, filter: c.sepia ? 'sepia(0.35) contrast(1.05)' : c.dim ? 'sepia(0.2) brightness(1.02)' : undefined}} />
        {c.pleat ? <div style={{position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent ${pl}%, rgba(255,255,255,0.55) ${pl + 5}%, transparent ${pl + 10}%)`, mixBlendMode: 'soft-light'}} /> : null}
      </div>
      <div style={{position: 'absolute', inset: -7, border: `1px solid ${C.nude2}`, opacity: 0.6}} />
    </div>
  );
};

const Badge: React.FC<{fr: number; b: any; sc: any}> = ({fr, b, sc}) => {
  const {fps} = useVideoConfig();
  const sp = spring({frame: fr - f(b.d), fps, config: {damping: 16, stiffness: 150}});
  const o = Math.min(inP(fr, b.d, 6), outP(fr, sc.e, 8));
  if (fr < f(b.d)) return null;
  const R = 88;
  return (
    <div style={{position: 'absolute', left: b.x - R, top: b.y - R, width: R * 2, height: R * 2, borderRadius: '50%', opacity: o, transform: `scale(${0.4 + 0.6 * sp}) rotate(${(1 - sp) * -25}deg)`,
      background: `radial-gradient(circle at 35% 30%, #FFF6EC, ${C.nude} 70%)`, boxShadow: '0 12px 30px rgba(80,60,40,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{position: 'absolute', inset: 10, borderRadius: '50%', border: `1.5px solid ${C.nude2}`}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: '0.3em', color: C.ink2}}>NĂM</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 52, color: C.ink, fontVariantNumeric: 'lining-nums'}}>{b.text}</div>
    </div>
  );
};

const Label: React.FC<{fr: number; l: any; sc: any}> = ({fr, l, sc}) => {
  const end = l.until ?? sc.e;
  const p = inP(fr, l.d, 12);
  const o = Math.min(p, outP(fr, end, 8));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: l.x - 400, width: 800, top: l.y - 32, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - p) * 22}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 28px', background: 'rgba(255,250,243,0.94)', border: `1.5px solid ${C.nude2}`, borderRadius: 999,
        fontFamily: SANS, fontWeight: 700, fontSize: 24, letterSpacing: '0.14em', color: C.ink, boxShadow: '0 10px 26px rgba(80,60,40,0.18)'}}>
        {l.pin ? <svg width="20" height="26" viewBox="0 0 22 28"><path d="M11 1C5.5 1 1 5.3 1 10.6 1 18 11 27 11 27s10-9 10-16.4C21 5.3 16.5 1 11 1z" fill="none" stroke={C.rose} strokeWidth="2" /><circle cx="11" cy="10.5" r="3.5" fill={C.rose} /></svg> : null}
        {l.text}
      </div>
    </div>
  );
};

const Strikes: React.FC<{fr: number; sc: any}> = ({fr, sc}) => (
  <>
    {sc.strikes.map((s: any, i: number) => {
      const p = inP(fr, s.d, 10), o = Math.min(p, outP(fr, sc.e, 8));
      const ln = inP(fr, s.d + 0.35, 8);
      return (
        <div key={i} style={{position: 'absolute', left: s.x - 170, width: 340, top: 1230, display: 'flex', justifyContent: 'center', opacity: o, transform: `scale(${0.85 + 0.15 * p}) rotate(${i ? 3 : -3}deg)`}}>
          <div style={{position: 'relative', padding: '12px 30px', background: C.cream, border: `1.5px solid ${C.ink2}`, borderRadius: 999, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 40, color: ln > 0.5 ? C.ink2 : C.ink, boxShadow: '0 10px 24px rgba(80,60,40,0.2)'}}>
            {s.text}
            <svg width="100%" height="20" viewBox="0 0 100 20" preserveAspectRatio="none" style={{position: 'absolute', left: 0, top: '50%', marginTop: -8}}>
              <path d="M6 12 Q50 4 94 10" fill="none" stroke={C.rose} strokeWidth="3" strokeLinecap="round" strokeDasharray="100" strokeDashoffset={100 - 100 * ln} vectorEffect="non-scaling-stroke" />
            </svg>
          </div>
        </div>
      );
    })}
  </>
);

const Checks: React.FC<{fr: number; sc: any}> = ({fr, sc}) => (
  <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 1252, display: 'flex', justifyContent: 'center', gap: 14}}>
    {sc.checks.map((c: any, i: number) => {
      const p = inP(fr, c.d, 12); const o = Math.min(p, outP(fr, sc.e, 8));
      return (
        <div key={i} style={{opacity: o, transform: `translateY(${(1 - p) * 20}px)`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', background: 'rgba(255,250,243,0.95)', border: `1.5px solid ${C.nude2}`, borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 26, color: C.ink, boxShadow: '0 8px 20px rgba(80,60,40,0.16)'}}>
          <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill={C.rose} /><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 - 20 * inP(fr, c.d + 0.1, 10)} /></svg>
          {c.text}
        </div>
      );
    })}
  </div>
);

const Chips: React.FC<{fr: number; sc: any}> = ({fr, sc}) => (
  <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 1250, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 14}}>
    {sc.chips.map((c: any, i: number) => {
      const p = inP(fr, c.d, 12); const o = Math.min(p, outP(fr, sc.e, 8));
      return <div key={i} style={{opacity: o, transform: `translateY(${(1 - p) * 18}px) scale(${0.9 + 0.1 * p})`, padding: '10px 26px', borderRadius: 999, background: 'rgba(255,250,243,0.92)', border: `1.5px solid ${C.nude2}`, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 34, color: C.ink, boxShadow: '0 8px 22px rgba(80,60,40,0.18)'}}>{c.text}</div>;
    })}
  </div>
);

const Arrow: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const p = inP(fr, sc.arrow.d, 18), o = outP(fr, sc.e, 8);
  return (
    <svg width="1080" height="1920" style={{position: 'absolute', inset: 0, opacity: o}}>
      <path d="M330 1250 C 400 1330, 560 1330, 630 1265" fill="none" stroke={C.rose} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="420" strokeDashoffset={420 - 420 * p} />
      <path d="M612 1252 L632 1264 L618 1284" fill="none" stroke={C.rose} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity={p > 0.92 ? 1 : 0} />
    </svg>
  );
};

// ---------- shotcraft text-as-mask: chữ "Chloé" chứa ảnh áo, rồi nở ra chiếm màn ----------
const MaskWord: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const m = sc.mask;
  const lf = fr - f(sc.s);
  const g = interpolate(fr, [f(m.grow), f(m.grow) + 30], [0, 1], {...cl, easing: Easing.bezier(0.4, 0, 0.2, 1)});
  const S = 1 + 7 * g;
  const drift = interpolate(lf, [0, 80], [60, -60], cl);
  const appear = inP(fr, sc.s + 0.05, 20);
  const cover = interpolate(g, [0.2, 0.85], [0, 1], cl);
  const kp = inP(fr, sc.s + 0.2, 16) * (1 - g);
  return (
    <AbsoluteFill>
      <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 600, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: `${0.6 - 0.28 * kp}em`, color: C.nude2, opacity: kp}}>{sc.kicker}</div>
      <div style={{position: 'absolute', left: -200, width: 1480, top: 680, height: 520, display: 'flex', justifyContent: 'center', alignItems: 'center', transform: `scale(${S})`, transformOrigin: '47% 52%', opacity: appear}}>
        <div style={{fontFamily: SERIF, fontWeight: 800, fontSize: 330, lineHeight: 1.2, letterSpacing: '-0.01em', paddingTop: '0.25em', marginTop: '-0.2em',
          backgroundImage: `url(${staticFile(m.img)})`, backgroundSize: '820px auto', backgroundPosition: `${50 + drift / 10}% 22%`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          filter: `drop-shadow(0 6px 18px rgba(80,60,40,${0.25 * (1 - g)}))`}}>{m.word}</div>
      </div>
      <AbsoluteFill style={{opacity: cover}}>
        <Img src={staticFile(m.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${1.15 - 0.1 * g})`}} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- chuyển cảnh: dải ruy băng satin quét chéo ----------
const RibbonWipe: React.FC<{fr: number; t: number}> = ({fr, t}) => {
  const p = interpolate(fr, [f(t) - 2, f(t) + 26], [0, 1], {...cl, easing: Easing.bezier(0.65, 0, 0.35, 1)});
  if (p <= 0 || p >= 1) return null;
  const x = interpolate(p, [0, 1], [-1700, 1700]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: x - 400, top: 560, width: 2000, height: 820, transform: 'rotate(-16deg)', transformOrigin: 'center',
        background: `linear-gradient(180deg, ${C.nude2} 0%, ${C.nude} 18%, #F1E5D6 46%, ${C.nude} 70%, ${C.nude2} 100%)`, boxShadow: '0 30px 80px rgba(80,60,40,0.35)'}}>
        <div style={{position: 'absolute', inset: 0, opacity: 0.25, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 3px, transparent 3px 7px), repeating-linear-gradient(-45deg, rgba(120,90,60,0.25) 0 3px, transparent 3px 7px)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 40, height: 3, background: 'rgba(255,255,255,0.6)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 40, height: 3, background: 'rgba(255,255,255,0.6)'}} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- chuyển cảnh: light-leak-burn (shotcraft, dựng dọc, tông đào/hồng) ----------
const LightLeak: React.FC<{fr: number; t: number}> = ({fr, t}) => {
  const P = f(t);
  if (fr < P - 28 || fr > P + 44) return null;
  const sweep = interpolate(fr, [P - 28, P + 44], [0, 1], {...cl, easing: Easing.bezier(0.4, 0, 0.3, 1)});
  const rise = interpolate(fr, [P - 28, P], [0, 1], {...cl, easing: Easing.in(Easing.quad)});
  const fall = interpolate(fr, [P, P + 44], [1, 0], {...cl, easing: Easing.out(Easing.cubic)});
  const I = fr <= P ? rise : fall;
  const cx = interpolate(sweep, [0, 1], [1400, -400]), cy = interpolate(sweep, [0, 1], [-300, 2200]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: '#F6C9A0', opacity: I * 0.12, mixBlendMode: 'screen'}} />
      {[0, 1, 2].map((i) => {
        const d = 1300 + i * 400; const col = ['#FFE2B8', '#F7B98F', '#EFA3A0'][i];
        return <div key={i} style={{position: 'absolute', left: cx + i * 200 - 200 - d / 2, top: cy + i * 260 - 260 - d / 2, width: d, height: d, borderRadius: '50%',
          background: `radial-gradient(circle, ${col} 0%, ${col}cc 30%, transparent 68%)`, filter: 'blur(80px)', mixBlendMode: 'screen', opacity: [0.95, 0.8, 0.6][i] * I}} />;
      })}
      <div style={{position: 'absolute', left: cx - 500, top: cy - 500, width: 1000, height: 1000, borderRadius: '50%', background: 'radial-gradient(circle, #FFF6E8 0%, #FFE2B8aa 45%, transparent 70%)', filter: 'blur(70px)', mixBlendMode: 'screen', opacity: I * I}} />
    </AbsoluteFill>
  );
};

const EndCard: React.FC<{fr: number}> = ({fr}) => {
  const s = D.end - D.endCard;
  const p = inP(fr, s, 22);
  if (fr < f(s)) return null;
  const bow = inP(fr, s + 0.5, 30);
  return (
    <AbsoluteFill style={{opacity: p}}>
      <Bg fr={fr} />
      <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 660, textAlign: 'center'}}>
        <svg width="260" height="90" viewBox="0 0 260 90" style={{display: 'block', margin: '0 auto 10px'}}>
          <path d="M130 45 C 95 10, 30 15, 22 40 C 30 62, 95 70, 130 45 C 165 70, 230 62, 238 40 C 230 15, 165 10, 130 45 M130 45 L 95 85 M130 45 L 168 85" fill="none" stroke={C.nude2} strokeWidth="3" strokeLinecap="round" strokeDasharray="900" strokeDashoffset={900 - 900 * bow} />
          <circle cx="130" cy="45" r={7 * bow} fill={C.nude2} />
        </svg>
        <div style={{fontFamily: SERIF, fontWeight: 500, fontSize: 132, letterSpacing: `${0.2 - 0.18 * p}em`, lineHeight: 1.1, color: C.ink, ...vnCap}}>Chloé</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 50, color: C.ink2, marginTop: 2}}>Eau de Parfum</div>
        <div style={{margin: '26px auto 0', width: 260 * inP(fr, s + 0.3, 20), height: 1.5, background: `linear-gradient(90deg, transparent, ${C.nude2}, transparent)`}} />
        <div style={{marginTop: 22, fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.4em', color: C.nude2}}>PARIS · 1952</div>
        <div style={{marginTop: 30, fontFamily: SANS, fontWeight: 500, fontSize: 17, letterSpacing: '0.08em', color: C.ink2, opacity: 0.6}}>{D.src}</div>
      </div>
    </AbsoluteFill>
  );
};

const Subs: React.FC<{fr: number; dark: boolean}> = ({fr, dark}) => {
  const t = fr / FPS;
  const s = D.subs.find((x: any) => t >= x.s && t < x.e);
  if (!s || t > D.end - D.endCard) return null;
  const o = Math.min(inP(fr, s.s, 5), outP(fr, s.e, 4));
  return (
    <div style={{position: 'absolute', left: SAFE_L + 10, width: SAFE_R - SAFE_L - 20, top: 1412, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 4, opacity: o}}>
      {s.words.map((w: any, i: number) => {
        const on = t >= w.s;
        const col = w.k ? C.rose : C.ink;
        return <span key={i} style={{fontFamily: SANS, fontWeight: 700, fontSize: 40, lineHeight: 1.25, color: on ? col : 'rgba(43,33,27,0.38)',
          textShadow: dark ? '0 0 14px rgba(255,248,238,0.95), 0 0 4px rgba(255,248,238,0.9)' : '0 0 12px rgba(255,250,243,0.9)'}}>{w.w}</span>;
      })}
    </div>
  );
};

export const Chloe: React.FC = () => {
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const t = fr / FPS;
  const cur = D.scenes.find((sc: any) => t >= sc.s && t < sc.e);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Bg fr={fr} />
      {D.scenes.map((sc: any, i: number) => {
        if (t < sc.s - 0.05 || t > sc.e + 0.05) return null;
        const o = life(fr, sc.s, sc.e, 12, 9);
        return (
          <AbsoluteFill key={i} style={{opacity: o}}>
            {sc.mood && sc.mood !== 'mist' ? <Mood fr={fr} sc={sc} /> : null}
            <Chapter fr={fr} sc={sc} />
            {sc.hero ? <Hero fr={fr} sc={sc} /> : null}
            {sc.mood === 'mist' ? <Mood fr={fr} sc={sc} /> : null}
            {(sc.cards ?? []).map((c: any, j: number) => <Card key={j} fr={fr} c={c} sc={sc} />)}
            {sc.arrow ? <Arrow fr={fr} sc={sc} /> : null}
            {sc.mask ? <MaskWord fr={fr} sc={sc} /> : <Title fr={fr} sc={sc} />}
            {sc.badge ? <Badge fr={fr} b={sc.badge} sc={sc} /> : null}
            {(sc.labels ?? []).map((l: any, j: number) => <Label key={j} fr={fr} l={l} sc={sc} />)}
            {sc.strikes ? <Strikes fr={fr} sc={sc} /> : null}
            {sc.checks ? <Checks fr={fr} sc={sc} /> : null}
            {sc.chips ? <Chips fr={fr} sc={sc} /> : null}
          </AbsoluteFill>
        );
      })}
      {D.scenes.filter((sc: any) => sc.leak).map((sc: any, i: number) => <LightLeak key={'l' + i} fr={fr} t={sc.leak} />)}
      {D.scenes.filter((sc: any) => sc.ribbon).map((sc: any, i: number) => <RibbonWipe key={'r' + i} fr={fr} t={sc.ribbon} />)}
      <EndCard fr={fr} />
      <Subs fr={fr} dark={!!(cur && (cur.mood === 'evening' || cur.mood === 'rose'))} />
    </AbsoluteFill>
  );
};
