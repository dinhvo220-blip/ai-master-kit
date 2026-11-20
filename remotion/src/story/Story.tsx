// Burberry Beauty – video kể chuyện kiểu "Thế giới xa xỉ" (nền tối, serif vàng, ảnh khung vàng, phụ đề karaoke)
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate, Easing, spring, useVideoConfig, delayRender, continueRender} from 'remotion';
import {loadFonts} from '../fonts';
import data from './story.json';
let D: any = data;
const FPS = 30;
const CX = 480; // tâm vùng an toàn (x 70→890)
const SAFE_L = 70, SAFE_R = 890;
const C = {bg0: '#2B1D13', bg1: '#0C0806', gold: '#D9B677', gold2: '#F1DDB0', gold3: '#A9803F', red: '#B0352B', cream: '#F4EADB', camel: '#C19A6B'};
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const SANS = 'Be Vietnam Pro';
const SERIF = 'NotoSerifDisplay';
const VI = 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB';
const LAT = 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const LEXT = 'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF';
let serifLoaded = false;
const loadSerif = () => {
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
const goldText: React.CSSProperties = {background: `linear-gradient(180deg, ${C.gold2} 0%, ${C.gold} 45%, ${C.gold3} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'};

const Bg: React.FC<{fr: number}> = ({fr}) => {
  const sweep = interpolate(fr % 360, [0, 360], [-30, 130]);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse 90% 60% at 45% 42%, ${C.bg0} 0%, #170F0A 55%, ${C.bg1} 100%)`}} />
      {/* họa tiết check rất mờ */}
      <AbsoluteFill style={{opacity: 0.06, backgroundImage: `repeating-linear-gradient(90deg, transparent 0 118px, ${C.camel} 118px 122px, transparent 122px 150px, #000 150px 160px, transparent 160px 240px), repeating-linear-gradient(0deg, transparent 0 118px, ${C.camel} 118px 122px, transparent 122px 150px, #000 150px 160px, transparent 160px 240px)`}} />
      <AbsoluteFill style={{background: `linear-gradient(105deg, transparent ${sweep}%, rgba(241,221,176,0.05) ${sweep + 8}%, transparent ${sweep + 18}%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)'}} />
    </AbsoluteFill>
  );
};

const Chapter: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  if (!sc.chapter) return null;
  const p = inP(fr, sc.s + 0.1, 14);
  return (
    <div style={{position: 'absolute', left: 92, top: 262, display: 'flex', alignItems: 'center', gap: 14, opacity: p * 0.9}}>
      <div style={{width: 46 * p, height: 1.5, background: C.gold}} />
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 20, letterSpacing: '0.28em', color: C.gold}}>{sc.chapter}</div>
    </div>
  );
};

const Title: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const lines: string[] = sc.title.split('\n');
  const kp = inP(fr, sc.s + 0.05, 16);
  const top = lines.length > 1 ? 318 : 352;
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top, textAlign: 'center'}}>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: `${0.6 - 0.28 * kp}em`, color: C.gold, opacity: kp * 0.85, marginBottom: 14}}>{sc.kicker}</div>
      {lines.map((ln, i) => {
        const p = inP(fr, sc.s + 0.12 + i * 0.12, 18);
        return (
          <div key={i} style={{overflow: 'hidden', paddingBottom: 8}}>
            <div style={{fontFamily: SERIF, fontWeight: 600, fontSize: sc.size, lineHeight: 1.12, letterSpacing: '0.02em', textTransform: 'uppercase', fontVariantNumeric: 'lining-nums', paddingTop: '0.34em', marginTop: '-0.3em', transform: `translateY(${(1 - p) * 105}%)`, ...goldText, filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.5))'}}>{ln}</div>
          </div>
        );
      })}
      <div style={{margin: '16px auto 0', width: 120 * inP(fr, sc.s + 0.35, 20), height: 1.5, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
    </div>
  );
};

const Card: React.FC<{fr: number; c: any; sc: any}> = ({fr, c, sc}) => {
  const end = c.until ?? sc.e;
  const p = inP(fr, c.d, 16);
  const o = Math.min(p, outP(fr, end, 8));
  if (o <= 0) return null;
  const kb = interpolate(fr, [f(c.d), f(end)], [1.0, 1.07], cl);
  const rot = (c.rot ?? 0) * (0.6 + 0.4 * p);
  return (
    <div style={{position: 'absolute', left: c.x - c.w / 2, top: c.y - c.h / 2, width: c.w, height: c.h, opacity: o,
      transform: `translateY(${(1 - p) * 60}px) rotate(${rot}deg) scale(${0.94 + 0.06 * p})`, filter: `blur(${(1 - p) * 10}px)`}}>
      <div style={{position: 'absolute', inset: -10, border: `1.5px solid ${C.gold}`, opacity: 0.85, boxShadow: `0 0 30px rgba(217,182,119,0.18)`}} />
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.6)', background: '#000'}}>
        <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />
      </div>
      {['tl', 'tr', 'bl', 'br'].map((k) => (
        <div key={k} style={{position: 'absolute', width: 18, height: 18, [k[0] === 't' ? 'top' : 'bottom']: -16, [k[1] === 'l' ? 'left' : 'right']: -16,
          borderTop: k[0] === 't' ? `3px solid ${C.gold}` : undefined, borderBottom: k[0] === 'b' ? `3px solid ${C.gold}` : undefined,
          borderLeft: k[1] === 'l' ? `3px solid ${C.gold}` : undefined, borderRight: k[1] === 'r' ? `3px solid ${C.gold}` : undefined}} />
      ))}
    </div>
  );
};

const Credit: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const has = (sc.cards?.length || sc.trio) ? 1 : 0;
  if (!has) return null;
  return <div style={{position: 'absolute', right: 1080 - SAFE_R + 4, top: 1352, fontFamily: SANS, fontWeight: 500, fontSize: 15, letterSpacing: '0.08em', color: C.gold, opacity: 0.55 * life(fr, sc.s + 0.3, sc.e)}}>{D.src}</div>;
};

const Badge: React.FC<{fr: number; b: any; sc: any}> = ({fr, b, sc}) => {
  const {fps} = useVideoConfig();
  const sp = spring({frame: fr - f(b.d), fps, config: {damping: 14, stiffness: 160}});
  const o = Math.min(inP(fr, b.d, 6), outP(fr, sc.e, 8));
  if (fr < f(b.d)) return null;
  const R = 92;
  return (
    <div style={{position: 'absolute', left: b.x - R, top: b.y - R, width: R * 2, height: R * 2, borderRadius: '50%', opacity: o, transform: `scale(${0.4 + 0.6 * sp}) rotate(${(1 - sp) * -30}deg)`,
      background: `radial-gradient(circle at 35% 30%, ${C.gold2}, ${C.gold} 45%, ${C.gold3} 100%)`, boxShadow: '0 10px 30px rgba(0,0,0,0.55), inset 0 0 0 5px rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <div style={{position: 'absolute', inset: 12, borderRadius: '50%', border: '1.5px solid rgba(60,35,10,0.45)'}} />
      <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 14, letterSpacing: '0.3em', color: '#4A2E12', marginBottom: 2}}>{b.label ?? 'NĂM'}</div>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: b.small ? 44 : 50, color: '#3A220C', fontVariantNumeric: 'lining-nums'}}>{b.text}</div>
    </div>
  );
};

const Label: React.FC<{fr: number; l: any; sc: any}> = ({fr, l, sc}) => {
  const end = l.until ?? sc.e;
  const p = inP(fr, l.d, 12);
  const o = Math.min(p, outP(fr, end, 8));
  if (o <= 0) return null;
  return (
    <div style={{position: 'absolute', left: l.x - 400, width: 800, top: l.y - 34, display: 'flex', justifyContent: 'center', opacity: o, transform: `translateY(${(1 - p) * 24}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: l.big ? '14px 34px' : '11px 26px', background: 'rgba(12,8,6,0.82)', border: `1.5px solid ${C.gold}`, borderRadius: 999,
        fontFamily: l.big ? SERIF : SANS, fontWeight: l.big ? 700 : 700, fontSize: l.big ? 46 : 24, letterSpacing: l.big ? '0.06em' : '0.16em', color: C.gold2, boxShadow: '0 8px 24px rgba(0,0,0,0.5)'}}>
        {l.pin ? <svg width="22" height="28" viewBox="0 0 22 28"><path d="M11 1C5.5 1 1 5.3 1 10.6 1 18 11 27 11 27s10-9 10-16.4C21 5.3 16.5 1 11 1z" fill="none" stroke={C.gold} strokeWidth="2" /><circle cx="11" cy="10.5" r="3.5" fill={C.gold} /></svg> : null}
        {l.text}
      </div>
    </div>
  );
};

const Stamp: React.FC<{fr: number; s: any; sc: any}> = ({fr, s, sc}) => {
  const end = s.until ?? sc.e;
  if (fr < f(s.d)) return null;
  const k = interpolate(fr, [f(s.d), f(s.d) + 6], [1.7, 1], {...cl, easing: Easing.out(Easing.cubic)});
  const o = Math.min(interpolate(fr, [f(s.d), f(s.d) + 4], [0, 1], cl), outP(fr, end, 8));
  return (
    <div style={{position: 'absolute', left: s.x - 400, width: 800, top: s.y - 50, display: 'flex', justifyContent: 'center', opacity: o}}>
      <div style={{transform: `rotate(-6deg) scale(${k})`, border: `4px solid ${C.red}`, outline: `1.5px solid ${C.red}`, outlineOffset: 5, padding: '10px 28px', fontFamily: SANS, fontWeight: 900, fontSize: 44, letterSpacing: '0.1em', color: C.red, background: 'rgba(244,234,219,0.92)'}}>{s.text}</div>
    </div>
  );
};

const Checks: React.FC<{fr: number; sc: any}> = ({fr, sc}) => (
  <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 1262, display: 'flex', justifyContent: 'center', gap: 18}}>
    {sc.checks.map((c: any, i: number) => {
      const p = inP(fr, c.d, 12); const o = Math.min(p, outP(fr, sc.e, 8));
      return (
        <div key={i} style={{opacity: o, transform: `translateY(${(1 - p) * 20}px)`, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: 'rgba(12,8,6,0.85)', border: `1.5px solid ${C.gold}`, borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 25, color: C.cream}}>
          <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill={C.gold} /><path d="M6.5 12.5l3.5 3.5 7.5-8" fill="none" stroke="#2A1A0C" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" strokeDashoffset={20 - 20 * inP(fr, c.d + 0.1, 10)} /></svg>
          {c.text}
        </div>
      );
    })}
  </div>
);

const Chips: React.FC<{fr: number; sc: any}> = ({fr, sc}) => (
  <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 1266, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 12}}>
    {sc.chips.map((c: any, i: number) => {
      const p = inP(fr, c.d, 10); const o = Math.min(p, outP(fr, sc.e, 8));
      return <div key={i} style={{opacity: o, transform: `scale(${0.85 + 0.15 * p})`, padding: '9px 20px', borderRadius: 999, background: i % 2 ? 'rgba(217,182,119,0.16)' : 'rgba(12,8,6,0.85)', border: `1.5px solid ${C.gold}`, fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 28, color: C.gold2}}>{c.text}</div>;
    })}
  </div>
);

const Rain: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const o = life(fr, sc.s, sc.e, 12, 9);
  const drops = Array.from({length: 46}, (_, i) => i);
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 640, height: 640, overflow: 'hidden', opacity: o}}>
      {drops.map((i) => {
        const x = (i * 97.3) % 820; const sp = 26 + (i * 13) % 18; const y = ((fr * sp + i * 211) % 760) - 120;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: 2, height: 60 + (i % 4) * 18, transform: 'rotate(12deg)', background: `linear-gradient(180deg, transparent, rgba(241,221,176,${0.25 + (i % 3) * 0.12}))`}} />;
      })}
      {/* chiếc ô nét vàng */}
      <svg width="300" height="300" viewBox="0 0 300 300" style={{position: 'absolute', left: 410 - 150, top: 190, opacity: inP(fr, sc.s + 0.4, 16)}}>
        <path d="M30 150 Q150 20 270 150 Q240 132 210 150 Q180 132 150 150 Q120 132 90 150 Q60 132 30 150Z" fill="rgba(217,182,119,0.12)" stroke={C.gold} strokeWidth="3" />
        <path d="M150 150 V250 Q150 272 128 272 Q110 272 108 254" fill="none" stroke={C.gold} strokeWidth="3" strokeLinecap="round" />
        <line x1="150" y1="42" x2="150" y2="28" stroke={C.gold} strokeWidth="3" />
      </svg>
    </div>
  );
};

const Trio: React.FC<{fr: number; sc: any}> = ({fr, sc}) => (
  <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 680, display: 'flex', justifyContent: 'center', gap: 22}}>
    {sc.trio.map((t: any, i: number) => {
      const p = inP(fr, t.d, 14); const o = Math.min(p, outP(fr, sc.e, 8));
      return (
        <div key={i} style={{width: 252, opacity: o, transform: `translateY(${(1 - p) * 50}px)`, filter: `blur(${(1 - p) * 8}px)`}}>
          <div style={{width: 252, height: 400, border: `1.5px solid ${C.gold}`, padding: 6}}>
            <Img src={staticFile(t.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </div>
          <div style={{marginTop: 18, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 30, lineHeight: 1.1, color: C.gold2}}>{t.name}</div>
        </div>
      );
    })}
  </div>
);

const Comment: React.FC<{fr: number; sc: any}> = ({fr, sc}) => {
  const p = inP(fr, sc.comment.d, 14);
  return (
    <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: p}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '18px 30px', background: C.cream, borderRadius: 22, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', transform: `translateY(${(1 - p) * 30}px)`}}>
        <svg width="40" height="40" viewBox="0 0 24 24"><path d="M4 4h16v11H8l-4 4z" fill="none" stroke="#2A1A0C" strokeWidth="2" strokeLinejoin="round" /></svg>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 30, color: '#2A1A0C'}}>Bình luận cho mình biết nhé!</div>
      </div>
      <div style={{display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 800}}>
        {(sc.comment.names ?? ['Hero', 'Goddess', 'Her', 'Prorsum']).map((n: string, i: number) => {
          const q = inP(fr, sc.comment.d + 0.25 + i * 0.12, 12);
          return <div key={n} style={{opacity: q, transform: `scale(${0.8 + 0.2 * q})`, padding: '12px 22px', border: `1.5px solid ${C.gold}`, borderRadius: 999, fontFamily: SERIF, fontWeight: 700, fontSize: 30, color: C.gold2, background: 'rgba(12,8,6,0.8)'}}>{n}</div>;
        })}
      </div>
    </div>
  );
};

const EndCard: React.FC<{fr: number}> = ({fr}) => {
  const s = D.end - 2.6;
  const p = inP(fr, s, 20);
  if (fr < f(s)) return null;
  return (
    <AbsoluteFill style={{opacity: p}}>
      <Bg fr={fr} />
      <div style={{position: 'absolute', left: SAFE_L, width: SAFE_R - SAFE_L, top: 760, textAlign: 'center'}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: `${0.7 - 0.3 * p}em`, color: C.gold, opacity: 0.85}}>BRITISH HERITAGE SINCE 1856</div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 108, letterSpacing: '0.04em', lineHeight: 1.05, marginTop: 18, paddingTop: '0.2em', ...goldText}}>BURBERRY</div>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 52, color: C.gold2, marginTop: 4}}>{D.endSub ?? 'Beauty'}</div>
        <div style={{margin: '26px auto 0', width: 260 * inP(fr, s + 0.3, 20), height: 1.5, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`}} />
        <div style={{marginTop: 22, fontFamily: SANS, fontWeight: 500, fontSize: 18, letterSpacing: '0.1em', color: C.gold, opacity: 0.6}}>Thông tin & hình ảnh: burberry.com · Coty</div>
      </div>
    </AbsoluteFill>
  );
};

const Subs: React.FC<{fr: number}> = ({fr}) => {
  const t = fr / FPS;
  const s = D.subs.find((x: any) => t >= x.s && t < x.e);
  if (D.nosubs || !s || t > D.end - 2.6) return null;
  const o = Math.min(inP(fr, s.s, 5), outP(fr, s.e, 4));
  return (
    <div style={{position: 'absolute', left: SAFE_L + 10, width: SAFE_R - SAFE_L - 20, top: 1418, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 12, rowGap: 4, opacity: o}}>
      {s.words.map((w: any, i: number) => {
        const on = t >= w.s;
        return <span key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 38, lineHeight: 1.25, color: on ? '#FFFFFF' : 'rgba(255,255,255,0.42)', textShadow: '0 2px 10px rgba(0,0,0,0.85)'}}>{w.w}</span>;
      })}
    </div>
  );
};

export const Story: React.FC<{d?: any}> = ({d}) => {
  if (d) D = d;
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const t = fr / FPS;
  return (
    <AbsoluteFill style={{background: C.bg1}}>
      <Bg fr={fr} />
      {D.scenes.map((sc: any, i: number) => {
        if (t < sc.s - 0.05 || t > sc.e + 0.05) return null;
        const o = life(fr, sc.s, sc.e, 10, 7);
        return (
          <AbsoluteFill key={i} style={{opacity: o}}>
            <Chapter fr={fr} sc={sc} />
            {sc.rain ? <Rain fr={fr} sc={sc} /> : null}
            {(sc.cards ?? []).map((c: any, j: number) => <Card key={j} fr={fr} c={c} sc={sc} />)}
            {sc.trio ? <Trio fr={fr} sc={sc} /> : null}
            <Title fr={fr} sc={sc} />
            {sc.badge ? <Badge fr={fr} b={sc.badge} sc={sc} /> : null}
            {(sc.labels ?? []).map((l: any, j: number) => <Label key={j} fr={fr} l={l} sc={sc} />)}
            {sc.checks ? <Checks fr={fr} sc={sc} /> : null}
            {sc.chips ? <Chips fr={fr} sc={sc} /> : null}
            {sc.stamp ? <Stamp fr={fr} s={sc.stamp} sc={sc} /> : null}
            {sc.comment ? <Comment fr={fr} sc={sc} /> : null}
            <Credit fr={fr} sc={sc} />
          </AbsoluteFill>
        );
      })}
      <EndCard fr={fr} />
      <Subs fr={fr} />
    </AbsoluteFill>
  );
};
