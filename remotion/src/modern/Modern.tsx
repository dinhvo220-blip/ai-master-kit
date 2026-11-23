// Style "Modern Clean" (Black Friday multi-brand, 23/11/2026)
// Chữ sans hiện đại đen/trắng, kính mờ, ảnh quầy làm chuyển cảnh, không màu mè.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useCurrentFrame, interpolate, Easing, random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {loadFonts} from '../fonts';

const FPS = 30;
const SAFE = {l: 70, r: 190, t: 245, b: 385};
const CX = 480;
const W_SAFE = 1080 - SAFE.l - SAFE.r; // 820
const INK = '#111111';
const WHITE = '#FFFFFF';
const CHAMP = '#EBD5A9';
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const SANS = 'Be Vietnam Pro';
const f = (t: number) => Math.round(t * FPS);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = EIN) =>
  interpolate(fr, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const life = (fr: number, s: number, e: number, inD = 12, outD = 8) => Math.min(ip(fr, f(s), f(s) + inD), ip(fr, f(e) - outD, f(e), 1, 0, EOUT));
const active = (fr: number, s: number, e: number) => fr >= f(s) && fr < f(e);

type DT = any;

const head = (D: DT, fr: number) => {
  const h = D.head[Math.min(fr, D.head.length - 1)];
  return {x: h[0], y: h[1], top: h[2], w: h[3]};
};

// ---------- camera ----------
const camera = (D: DT, fr: number) => {
  let s = 1, blur = 0, bright = 1, tx = 0, ty = 0;
  let sh = D.shots[0];
  for (const x of D.shots) if (fr >= f(x.s)) sh = x;
  s *= sh.z + ip(fr, f(sh.s), f(sh.e), 0, 0.035, Easing.linear);
  for (const p of D.punches) {
    const pf = f(p.t), hd = Math.max(9, p.hold ?? 24);
    const v = interpolate(fr, [pf - 4, pf + 8, pf + hd, pf + hd + 14], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
    s *= 1 + v * (p.amt ?? 0.05);
  }
  for (const c of D.cuts) {
    const cf = f(c.t);
    if (fr >= cf - 7 && fr < cf + 10) {
      const v = fr < cf ? ip(fr, cf - 7, cf, 0, 1, Easing.in(Easing.cubic)) : ip(fr, cf, cf + 10, 1, 0, Easing.out(Easing.cubic));
      s *= 1 + 0.08 * v; blur += 12 * v; bright += 0.12 * v;
    }
  }
  for (const sk of D.shakes) {
    const sf = f(sk.t);
    if (fr >= sf && fr < sf + 10) { const a = (sk.amp ?? 8) * (1 - (fr - sf) / 10); tx += noise2D('x', fr * 0.5, 0) * a; ty += noise2D('y', fr * 0.5, 0) * a; }
  }
  const h = head(D, fr);
  return {s, blur, bright, tx, ty, ox: h.x, oy: h.y};
};
const camStyle = (c: any, k = 1): React.CSSProperties => ({
  position: 'absolute', inset: 0, transformOrigin: `${c.ox}px ${c.oy}px`,
  transform: `translate(${c.tx * k}px,${c.ty * k}px) scale(${1 + (c.s - 1) * k})`,
});

// ---------- small pieces ----------
const glassLight: React.CSSProperties = {background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,.85)', boxShadow: '0 18px 44px rgba(0,0,0,.18)'};
const glassDark: React.CSSProperties = {background: 'rgba(14,14,14,.55)', backdropFilter: 'blur(18px)', WebkitBackdropFilter: 'blur(18px)', border: '1.5px solid rgba(255,255,255,.18)', boxShadow: '0 18px 44px rgba(0,0,0,.25)'};

const GiftIcon: React.FC<{size?: number; color?: string}> = ({size = 30, color = WHITE}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{flex: 'none'}}><path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7c-1.6-3.6-6-3.6-5.2-.4.4 1.4 3 .4 5.2.4M12 7c1.6-3.6 6-3.6 5.2-.4-.4 1.4-3 .4-5.2.4" stroke={color} strokeWidth={1.6} fill="none" strokeLinejoin="round" /></svg>
);

// chữ hiện từng từ: blur + trượt lên
const WordsIn: React.FC<{text: string; k: number; stagger?: number; style?: React.CSSProperties}> = ({text, k, stagger = 3, style}) => (
  <span style={style}>
    {text.split(' ').map((w, i) => {
      const p = ip(k, i * stagger, i * stagger + 12);
      return <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 24}px)`, filter: `blur(${(1 - p) * 8}px)`, marginRight: '0.28em'}}>{w}</span>;
    })}
  </span>
);

// ---------- behind-person title ----------
const TitleM: React.FC<{fr: number; t: any; D: DT}> = ({fr, t}) => {
  if (!active(fr, t.s - 0.05, t.e + 0.05)) return null;
  const v = life(fr, t.s, t.e, 16, 9);
  const k = fr - f(t.s);
  const size = t.size;
  const col = t.color ?? INK;
  const lineP = ip(k, 4, 22);
  const chars = [...t.big];
  return (
    <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: t.y, textAlign: 'center', opacity: v}}>
      {t.glow !== false ? <div style={{position: 'absolute', left: -40, right: -40, top: -40, height: size + 130, background: 'radial-gradient(ellipse at 50% 55%, rgba(255,255,255,.75) 0%, rgba(255,255,255,.35) 42%, rgba(255,255,255,0) 70%)'}} /> : null}
      {t.small ? (
        <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 6}}>
          <div style={{height: 2, width: 60 * lineP, background: col, opacity: 0.6}} />
          <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: interpolate(lineP, [0, 1], [16, 8]), color: col, textTransform: 'uppercase', opacity: lineP, whiteSpace: 'nowrap', textShadow: t.shadow ? '0 2px 12px rgba(0,0,0,.6)' : undefined}}>{t.small}</div>
          <div style={{height: 2, width: 60 * lineP, background: col, opacity: 0.6}} />
        </div>
      ) : null}
      <div style={{position: 'relative', overflow: 'hidden', paddingTop: size * 0.36, marginTop: -size * 0.36}}>
        <div style={{fontFamily: SANS, fontWeight: t.weight ?? 900, fontSize: size, lineHeight: `${size * 1.02}px`, color: col, whiteSpace: 'nowrap', letterSpacing: ip(k, 0, 26, 0.05 * size, -0.01 * size), textTransform: 'uppercase', textShadow: t.shadow ? '0 4px 24px rgba(0,0,0,.45)' : undefined}}>
          {chars.map((ch, i) => {
            const p = ip(k, i * 1.5, i * 1.5 + 14);
            return <span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - p) * 105}%)`, opacity: Math.min(1, p * 1.5)}}>{ch === ' ' ? ' ' : ch}</span>;
          })}
        </div>
      </div>
    </div>
  );
};

// ---------- chapter tag ----------
const Chapter: React.FC<{fr: number; c: any}> = ({fr, c}) => {
  if (!active(fr, c.s, c.e)) return null;
  const v = life(fr, c.s, c.e, 14, 10);
  const prog = ip(fr, f(c.s), f(c.e), 0, 1, Easing.linear);
  return <div style={{position: 'absolute', left: SAFE.l + 6, top: SAFE.t + 12, opacity: v, transform: `translateX(${(1 - v) * -30}px)`, ...glassDark, borderRadius: 999, padding: '10px 22px 12px', display: 'flex', alignItems: 'center', gap: 14}}>
    <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 24, color: 'rgba(255,255,255,.75)', letterSpacing: 2}}>{c.num}</div>
    <div style={{width: 1.5, height: 24, background: 'rgba(255,255,255,.4)'}} />
    <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 26, color: WHITE, letterSpacing: 5}}>{c.name}</div>
    <div style={{position: 'absolute', left: 22, right: 22, bottom: 5, height: 2, borderRadius: 1, background: 'rgba(255,255,255,.18)'}}>
      <div style={{width: `${prog * 100}%`, height: 2, borderRadius: 1, background: WHITE}} />
    </div>
  </div>;
};

// ---------- chip near product ----------
const Chips: React.FC<{fr: number; g: any}> = ({fr, g}) => {
  if (!active(fr, g.s, g.e)) return null;
  const out = life(fr, g.s, g.e, 1, 9);
  return <div style={{position: 'absolute', inset: 0, opacity: out}}>
    {g.items.map((it: any, i: number) => {
      if (fr < f(it.t)) return null;
      if (it.te !== undefined && fr >= f(it.te) + 8) return null;
      const p = it.te !== undefined && fr >= f(it.te) ? ip(fr, f(it.te), f(it.te) + 8, 1, 0, EOUT) : ip(fr, f(it.t), f(it.t) + 13);
      const side = it.side ?? (i % 2 ? 1 : -1);
      const bob = Math.sin((fr + i * 23) * 0.045) * 4;
      const pos: React.CSSProperties = side < 0 ? {left: it.x ?? SAFE.l + 10} : {right: it.x ?? SAFE.r + 10};
      return <div key={i} style={{position: 'absolute', top: it.y + bob, ...pos, opacity: p, transform: `translateX(${side * (1 - p) * 50}px)`, filter: `blur(${(1 - p) * 8}px)`}}>
        <div style={{...glassLight, borderRadius: 22, padding: '12px 22px 14px', display: 'flex', alignItems: 'center', gap: 14}}>
          {it.tag ? <div style={{fontFamily: SANS, fontWeight: 700, fontSize: 20, letterSpacing: 3, color: WHITE, background: INK, borderRadius: 8, padding: '4px 10px 5px'}}>{it.tag}</div> : null}
          <div>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: it.size ?? 38, color: INK, whiteSpace: 'nowrap', lineHeight: 1.15}}>{it.text}</div>
            {it.sub ? <div style={{fontFamily: SANS, fontWeight: 400, fontSize: 25, color: 'rgba(17,17,17,.65)', whiteSpace: 'nowrap', marginTop: 2}}>{it.sub}</div> : null}
          </div>
        </div>
      </div>;
    })}
  </div>;
};

// ---------- info card (front) ----------
const Info: React.FC<{fr: number; c: any}> = ({fr, c}) => {
  if (!active(fr, c.s, c.e)) return null;
  const v = life(fr, c.s, c.e, 14, 9);
  const k = fr - f(c.s);
  const dark = c.dark;
  const fg = dark ? WHITE : INK, fg2 = dark ? 'rgba(255,255,255,.7)' : 'rgba(17,17,17,.6)';
  return <>{c.cover ? <AbsoluteFill style={{background: 'rgba(12,12,12,.42)', backdropFilter: `blur(${v * 30}px)`, WebkitBackdropFilter: `blur(${v * 30}px)`, opacity: v}} /> : null}
  <div style={{position: 'absolute', left: SAFE.l + (c.inset ?? 30), right: SAFE.r + (c.inset ?? 30), top: c.y, opacity: v, transform: `translateY(${(1 - v) * 40}px) scale(${0.96 + 0.04 * v})`, filter: `blur(${(1 - v) * 10}px)`}}>
    <div style={{...(dark ? glassDark : glassLight), borderRadius: 30, padding: '24px 32px 26px'}}>
      {c.label ? <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 24, letterSpacing: 6, color: fg2, textTransform: 'uppercase', marginBottom: 6}}>{c.label}</div> : null}
      {c.big ? <div style={{display: 'flex', alignItems: 'baseline', gap: 16}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: c.bigSize ?? 112, lineHeight: 1, color: fg, letterSpacing: -3, fontVariantNumeric: 'tabular-nums'}}>{scramble(c.big, k)}</div>
        {c.bigSub ? <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: fg2}}><WordsIn text={c.bigSub} k={k - 8} /></div> : null}
      </div> : null}
      {(c.rows ?? []).map((r: any, i: number) => {
        const q = ip(fr, f(r.t), f(r.t) + 12);
        if (fr < f(r.t)) return null;
        return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 14, opacity: q, transform: `translateX(${(1 - q) * -24}px)`}}>
          {r.icon === 'gift' ? <GiftIcon size={34} color={fg} /> : <div style={{width: 26, height: 26, borderRadius: 13, background: fg, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none'}}>
            <svg width="16" height="16" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" stroke={dark ? INK : WHITE} strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
          <div style={{fontFamily: SANS, fontWeight: r.strong ? 800 : 500, fontSize: r.size ?? 36, color: fg, lineHeight: 1.25}}>{r.text}</div>
        </div>;
      })}
    </div>
  </div></>;
};
// số/ký tự giải mã dần
const scramble = (txt: string, k: number) => {
  const chars = [...txt];
  return chars.map((ch, i) => {
    const lock = 3 + i * 2;
    if (k >= lock || !/[0-9]/.test(ch)) return ch;
    return String(Math.floor(random(`s${i}-${k}`) * 10));
  }).join('');
};

// ---------- brand interlude: ảnh quầy ----------
const BrandCard: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  const s = f(b.s), e = f(b.e);
  if (fr < s || fr >= e) return null;
  const k = fr - s, left = e - fr;
  const inP = ip(k, 0, 11, 0, 1, Easing.bezier(0.22, 1, 0.36, 1));
  const outP = ip(left, 0, 9, 1, 0, Easing.out(Easing.cubic));
  const whip = (1 - inP);
  const kb = ip(k, 0, e - s, 1.0, 1.08, Easing.linear);
  const nameP = ip(k, 8, 30);
  const tagP = ip(k, 16, 30);
  const CW = 820, CH = Math.round(CW / b.ar);
  const top = b.top ?? 380;
  return <AbsoluteFill style={{opacity: 1 - outP * 0.95, transform: `translateX(${whip * 900}px) scale(${1 + outP * 0.35})`, filter: `blur(${whip * 18 + outP * 16}px)`}}>
    <AbsoluteFill style={{background: '#0d0d0d'}}>
      <Img src={staticFile(b.img)} style={{position: 'absolute', left: -300, top: -100, width: 1680, height: 2120, objectFit: 'cover', filter: 'blur(42px) brightness(.62) saturate(1.1)', transform: `scale(${kb})`}} />
    </AbsoluteFill>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: SAFE.t + 20, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 10, color: 'rgba(255,255,255,.8)'}}>{b.kicker}</div>
    <div style={{position: 'absolute', left: CX - CW / 2, top, width: CW, height: CH, borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.5)', transform: `translateY(${(1 - inP) * 80}px)`}}>
      <Img src={staticFile(b.img)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${kb})`}} />
      {/* shine sweep */}
      <div style={{position: 'absolute', top: -200, bottom: -200, width: 160, left: ip(k, 6, 26, -300, CW + 300, Easing.inOut(Easing.cubic)), background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)', transform: 'skewX(-20deg)'}} />
    </div>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: top + CH + 40 - 36, paddingTop: 36, textAlign: 'center', overflow: 'hidden'}}>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: b.nameSize ?? 104, color: WHITE, letterSpacing: interpolate(nameP, [0, 1], [40, 14]), lineHeight: 1.1, transform: `translateY(${(1 - nameP) * 100}%)`, whiteSpace: 'nowrap'}}>{b.name}</div>
    </div>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: top + CH + 172, display: 'flex', justifyContent: 'center', opacity: tagP, transform: `translateY(${(1 - tagP) * 20}px)`}}>
      <div style={{...glassDark, borderRadius: 999, padding: '10px 26px 12px', fontFamily: SANS, fontWeight: 600, fontSize: 32, color: WHITE, letterSpacing: 2, whiteSpace: 'nowrap'}}>{b.tag}</div>
    </div>
  </AbsoluteFill>;
};

// hook montage: ảnh 4 quầy lật nhanh
const Montage: React.FC<{fr: number; m: any}> = ({fr, m}) => {
  const s = f(m.s), e = f(m.e);
  if (fr < s || fr >= e) return null;
  const k = fr - s;
  const per = Math.round((e - s) / m.items.length);
  const idx = Math.min(m.items.length - 1, Math.floor(k / per));
  const it = m.items[idx];
  const kk = k - idx * per;
  const inP = ip(k, 0, 8), outP = ip(e - fr, 0, 7, 1, 0, Easing.out(Easing.cubic));
  const pop = ip(kk, 0, 7);
  const CW = 760, CH = Math.round(CW / it.ar);
  const top = 760 - CH / 2;
  return <AbsoluteFill style={{opacity: inP * (1 - outP), filter: `blur(${(1 - inP) * 14 + outP * 12}px)`, transform: `scale(${1 + outP * 0.3})`}}>
    <AbsoluteFill style={{background: 'rgba(10,10,10,.55)', backdropFilter: 'blur(26px)', WebkitBackdropFilter: 'blur(26px)'}} />
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: SAFE.t + 20, textAlign: 'center', fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 10, color: 'rgba(255,255,255,.85)'}}>{m.kicker}</div>
    {m.items.slice(0, idx).map((p: any, i: number) => (
      <div key={i} style={{position: 'absolute', left: CX - 330 + (i - (idx - 1) / 2) * 26, top: top + 10, width: 660, height: Math.round(660 / p.ar), borderRadius: 26, overflow: 'hidden', opacity: 0.35, transform: `rotate(${(i - 1.5) * 4}deg) scale(.92)`}}>
        <Img src={staticFile(p.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
    ))}
    <div style={{position: 'absolute', left: CX - CW / 2, top, width: CW, height: CH, borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 70px rgba(0,0,0,.5)', opacity: pop, transform: `scale(${0.86 + 0.14 * pop}) rotate(${(1 - pop) * (idx % 2 ? 4 : -4)}deg)`}}>
      <Img src={staticFile(it.img)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
    </div>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: top + CH + 36, textAlign: 'center', fontFamily: SANS, fontWeight: 800, fontSize: 84, letterSpacing: 12, color: WHITE, opacity: pop, transform: `translateY(${(1 - pop) * 20}px)`}}>{it.name}</div>
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: top + CH + 140, display: 'flex', justifyContent: 'center', gap: 14}}>
      {m.items.map((_: any, i: number) => <div key={i} style={{width: i === idx ? 40 : 12, height: 12, borderRadius: 6, background: i <= idx ? WHITE : 'rgba(255,255,255,.3)'}} />)}
    </div>
  </AbsoluteFill>;
};

// ---------- persistent gift note ----------
const GiftNote: React.FC<{fr: number; D: DT}> = ({fr, D}) => {
  const n = D.note;
  if (!n || !active(fr, n.s, n.e)) return null;
  const v = life(fr, n.s, n.e, 14, 10);
  let hi = 0;
  for (const h of D.noteHi) hi = Math.max(hi, life(fr, h.s, h.e, 10, 10));
  for (const h of D.noteHide) if (active(fr, h.s, h.e)) return null;
  const pulse = hi > 0 ? 1 + 0.03 * Math.sin(fr * 0.25) * hi : 1;
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1478, display: 'flex', justifyContent: 'center', opacity: v, transform: `translateY(${(1 - v) * 16}px) scale(${pulse})`}}>
    <div style={{...glassDark, background: `rgba(14,14,14,${0.5 + 0.1 * hi})`, border: `1.5px solid rgba(235,213,169,${0.25 + 0.6 * hi})`, borderRadius: 999, padding: '9px 22px 10px 16px', display: 'flex', alignItems: 'center', gap: 10}}>
      <GiftIcon size={26} color={hi > 0.5 ? CHAMP : WHITE} />
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 24, color: WHITE, whiteSpace: 'nowrap', letterSpacing: 0.3}}>
        {n.a}<span style={{fontWeight: 700, color: hi > 0.5 ? CHAMP : WHITE}}>{n.b}</span>
      </div>
    </div>
  </div>;
};


// ---------- cover title (full màn, nền mờ) ----------
const CoverTitle: React.FC<{fr: number; c: any}> = ({fr, c}) => {
  if (!active(fr, c.s, c.e)) return null;
  const v = life(fr, c.s, c.e, 8, 10);
  const k = fr - f(c.s);
  const sz = c.size ?? 150;
  return <AbsoluteFill style={{opacity: v}}>
    <AbsoluteFill style={{background: 'rgba(10,10,10,.5)', backdropFilter: `blur(${v * 34}px)`, WebkitBackdropFilter: `blur(${v * 34}px)`}} />
    <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: c.y ?? 640, textAlign: 'center', transform: `scale(${1.06 - 0.06 * ip(k, 0, 30)})`}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 32, letterSpacing: ip(k, 0, 20, 20, 10), color: 'rgba(255,255,255,.85)', textTransform: 'uppercase'}}>{c.small}</div>
      {c.lines.map((ln: string, i: number) => <div key={i} style={{overflow: 'hidden', paddingTop: sz * 0.36, marginTop: -sz * 0.3}}>
        <div style={{fontFamily: SANS, fontWeight: 900, fontSize: sz, lineHeight: 1.0, color: WHITE, letterSpacing: -2, whiteSpace: 'nowrap', transform: `translateY(${(1 - ip(k, 3 + i * 5, 17 + i * 5)) * 110}%)`}}>{ln}</div>
      </div>)}
      {c.sub ? <div style={{display: 'flex', justifyContent: 'center', marginTop: 26, opacity: ip(k, 14, 26)}}>
        <div style={{background: WHITE, color: INK, borderRadius: 999, padding: '12px 30px 14px', fontFamily: SANS, fontWeight: 700, fontSize: 36}}>{c.sub}</div></div> : null}
    </div>
  </AbsoluteFill>;
};


// ---------- băng chữ chạy (thay cover, không che mặt) ----------
const Ticker: React.FC<{fr: number; t: any}> = ({fr, t}) => {
  if (!active(fr, t.s, t.e)) return null;
  const k = fr - f(t.s);
  const out = ip(fr, f(t.e) - 8, f(t.e), 1, 0, EOUT);
  return <div style={{position: 'absolute', left: SAFE.l, width: W_SAFE, top: t.y, opacity: out}}>
    {t.lines.map((ln: string, i: number) => {
      const wipe = ip(k, i * 4, i * 4 + 14, 0, 1, Easing.bezier(0.65, 0, 0.35, 1));
      const light = (t.tone === 'light') !== (i % 2 === 1);
      const dir = i % 2 ? 1 : -1;
      const x = dir * (fr - f(t.s)) * 3.2 - (dir > 0 ? 1600 : 0);
      const unit = `${ln}   ✦   `;
      return <div key={i} style={{position: 'relative', height: 74, marginBottom: 12, borderRadius: 16, overflow: 'hidden',
        ...(light ? glassLight : glassDark), clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0 round 16px)`, transform: `rotate(${i % 2 ? 1.2 : -1.2}deg)`,
        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, black 40px, black calc(100% - 40px), transparent 100%)'}}>
        <div style={{position: 'absolute', top: 0, left: x, height: 74, display: 'flex', alignItems: 'center', whiteSpace: 'pre', fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 3, color: light ? INK : WHITE}}>
          {Array.from({length: 8}).map((_, j) => <span key={j}>{unit.split('✦').map((part, q, arr) => <React.Fragment key={q}>{part}{q < arr.length - 1 ? <span style={{color: light ? '#B08A4A' : CHAMP}}>✦</span> : null}</React.Fragment>)}</span>)}
        </div>
      </div>;
    })}
  </div>;
};

// ---------- timeline ----------
const Timeline: React.FC<{fr: number; t: any}> = ({fr, t}) => {
  if (!active(fr, t.s, t.e)) return null;
  const v = life(fr, t.s, t.e, 12, 8);
  const p = ip(fr, f(t.s) + 6, f(t.s) + 32, 0, 1, Easing.inOut(Easing.cubic));
  const W = 680;
  return <>{t.cover ? <AbsoluteFill style={{background: 'rgba(12,12,12,.42)', backdropFilter: `blur(${v * 30}px)`, WebkitBackdropFilter: `blur(${v * 30}px)`, opacity: v}} /> : null}<div style={{position: 'absolute', left: CX - W / 2 - 34, width: W + 68, top: t.y, opacity: v, transform: `translateY(${(1 - v) * 30}px)`, ...glassLight, borderRadius: 30, padding: '20px 34px 26px', boxSizing: 'border-box'}}>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: 6, color: 'rgba(17,17,17,.6)', marginBottom: 4}}>{t.label ?? 'THỜI GIAN ÁP DỤNG'}</div>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: INK, letterSpacing: -1}}>
      <span>{t.a}</span><span style={{opacity: ip(p, 0.7, 1)}}>{t.b}</span>
    </div>
    <div style={{position: 'relative', height: 6, marginTop: 10, borderRadius: 3, background: 'rgba(17,17,17,.15)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 6, width: `${p * 100}%`, borderRadius: 3, background: INK}} />
      <div style={{position: 'absolute', left: `calc(${p * 100}% - 11px)`, top: -8, width: 22, height: 22, borderRadius: 11, background: INK, boxShadow: '0 0 0 6px rgba(17,17,17,.12)'}} />
    </div>
  </div></>;
};

// ---------- front big word ----------
const BigWord: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  if (!active(fr, b.s, b.e)) return null;
  const v = life(fr, b.s, b.e, 10, 8);
  const k = fr - f(b.s);
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: b.y, textAlign: 'center', opacity: v}}>
    <div style={{overflow: 'hidden', paddingBottom: 6, paddingTop: b.size * 0.36, marginTop: -b.size * 0.36}}>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: b.size, lineHeight: 1.05, color: b.color ?? WHITE, letterSpacing: -2, textTransform: 'uppercase', whiteSpace: 'nowrap', transform: `translateY(${(1 - ip(k, 0, 12)) * 105}%)`, textShadow: b.dark ? 'none' : '0 6px 30px rgba(0,0,0,.45)'}}>{b.text}</div>
    </div>
    {b.sub ? <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 34, color: b.color ?? WHITE, letterSpacing: 4, marginTop: 4, textShadow: b.dark ? 'none' : '0 3px 14px rgba(0,0,0,.5)'}}><WordsIn text={b.sub} k={k - 6} /></div> : null}
  </div>;
};

// ---------- end card ----------
const EndCard: React.FC<{fr: number; e: any}> = ({fr, e}) => {
  if (!active(fr, e.s, e.e + 1)) return null;
  const k = fr - f(e.s);
  const v = ip(k, 0, 16);
  return <AbsoluteFill>
    <AbsoluteFill style={{background: 'rgba(10,10,10,.45)', backdropFilter: `blur(${v * 22}px)`, WebkitBackdropFilter: `blur(${v * 22}px)`, opacity: v}} />
    <div style={{position: 'absolute', left: SAFE.l + 10, right: SAFE.r + 10, top: 330, opacity: v, transform: `translateY(${(1 - v) * 60}px)`}}>
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: 10, color: 'rgba(255,255,255,.8)', textAlign: 'center'}}>{e.kicker}</div>
      <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 112, letterSpacing: -2, color: WHITE, textAlign: 'center', lineHeight: 1.05, marginTop: 6}}>{e.title}</div>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 36, letterSpacing: 6, color: CHAMP, textAlign: 'center', marginTop: 6}}>{e.sub}</div>
      <div style={{...glassDark, borderRadius: 30, padding: '20px 30px 24px', marginTop: 34}}>
        {e.items.map((it: any, i: number) => {
          const q = ip(k, 10 + i * 5, 22 + i * 5);
          return <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: i ? '1px solid rgba(255,255,255,.14)' : 'none', opacity: q, transform: `translateX(${(1 - q) * -24}px)`}}>
            <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 38, color: WHITE, letterSpacing: 4}}>{it.a}</div>
            <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 30, color: 'rgba(255,255,255,.8)'}}>{it.b}</div>
          </div>;
        })}
      </div>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 24, opacity: ip(k, 34, 46)}}>
        <GiftIcon size={30} color={CHAMP} />
        <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 27, color: WHITE}}>{e.note}</div>
      </div>
      <div style={{display: 'flex', justifyContent: 'center', marginTop: 26, opacity: ip(k, 40, 52), transform: `scale(${0.9 + 0.1 * ip(k, 40, 52)})`}}>
        <div style={{background: WHITE, color: INK, borderRadius: 999, padding: '14px 34px 16px', fontFamily: SANS, fontWeight: 800, fontSize: 36, letterSpacing: 1}}>{e.cta}</div>
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
  const top = D.subY?.find((x: any) => t >= x.s && t < x.e)?.y ?? 1330;
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 6, opacity: v, transform: `translateY(${(1 - v) * 12}px)`, filter: `blur(${(1 - v) * 4}px)`}}>
      {ln.words.map((w: any, i: number) => {
        const on = t >= w.s;
        const cur = on && t < w.e + 0.04;
        const bp = cur ? ip(fr, f(w.s), f(w.s) + 4) : 0;
        return <span key={i} style={{position: 'relative', display: 'inline-block', padding: '0 10px 4px', fontFamily: SANS, fontWeight: 800, fontSize: 58, lineHeight: '78px', letterSpacing: -0.5,
          color: cur ? INK : w.key ? CHAMP : WHITE, opacity: on ? 1 : 0.5,
          textShadow: cur ? 'none' : '0 2px 4px rgba(0,0,0,.45), 0 6px 22px rgba(0,0,0,.45)'}}>
          {cur ? <span style={{position: 'absolute', left: 0, right: 0, top: 6, bottom: 4, borderRadius: 14, background: WHITE, transform: `scale(${0.85 + 0.15 * bp})`, opacity: bp, boxShadow: '0 6px 20px rgba(0,0,0,.25)'}} /> : null}
          <span style={{position: 'relative'}}>{w.t}</span>
        </span>;
      })}
    </div>
  </div>;
};

// ---------- transitions ----------
const Flash: React.FC<{fr: number; tr: any}> = ({fr, tr}) => {
  const cf = f(tr.t);
  const o = interpolate(fr, [cf - 2, cf, cf + 9], [0, tr.op ?? 0.85, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: tr.color ?? '#FFFFFF', opacity: o}} />;
};
const Bokeh: React.FC<{fr: number; l: any}> = ({fr, l}) => {
  if (!active(fr, l.s, l.e)) return null;
  const v = life(fr, l.s, l.e, 18, 18) * (l.op ?? 0.3);
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: v}}>
    {Array.from({length: 10}).map((_, i) => {
      const x = random(`bx${i}`) * 1080, y = (random(`by${i}`) * 1920 - fr * (0.6 + random(`bs${i}`))) % 1920;
      const r = 30 + random(`br${i}`) * 70;
      return <div key={i} style={{position: 'absolute', left: x, top: (y + 1920) % 1920, width: r, height: r, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,236,200,.9), rgba(255,236,200,0) 70%)'}} />;
    })}
  </AbsoluteFill>;
};

export const Modern: React.FC<{d: DT}> = ({d: D}) => {
  loadFonts();
  const fr = useCurrentFrame();
  const cam = camera(D, fr);
  const cs = camStyle(cam);
  const filt = cam.blur > 0.2 ? `blur(${cam.blur}px) brightness(${cam.bright})` : undefined;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, filter: filt}}>
        <div style={cs}><OffthreadVideo src={staticFile(D.base)} muted style={{width: 1080, height: 1920}} /></div>
        <div style={camStyle(cam, 0.25)}>
          {D.titles.map((t: any, i: number) => <TitleM key={i} fr={fr} t={t} D={D} />)}
        </div>
        {D.person ? <div style={cs}><OffthreadVideo src={staticFile(D.person)} transparent muted style={{width: 1080, height: 1920}} /></div> : null}
        <div style={camStyle(cam, 0.25)}>{(D.titlesFront ?? []).map((t: any, i: number) => <TitleM key={i} fr={fr} t={t} D={D} />)}</div>
        {D.bokeh.map((l: any, i: number) => <Bokeh key={i} fr={fr} l={l} />)}
      </div>
      {D.chips.map((g: any, i: number) => <Chips key={i} fr={fr} g={g} />)}
      {D.infos.map((c: any, i: number) => <Info key={i} fr={fr} c={c} />)}
      {D.bigs.map((b: any, i: number) => <BigWord key={i} fr={fr} b={b} />)}
      {D.timelines.map((t: any, i: number) => <Timeline key={i} fr={fr} t={t} />)}
      {(D.tickers ?? []).map((t: any, i: number) => <Ticker key={i} fr={fr} t={t} />)}
      {(D.tickers ?? []).some((t: any) => t.y < 330 && active(fr, t.s - 0.2, t.e + 0.2)) ? null : D.chapters.map((c: any, i: number) => <Chapter key={i} fr={fr} c={c} />)}
      {(D.covers ?? []).map((c: any, i: number) => <CoverTitle key={i} fr={fr} c={c} />)}
      {D.montages.map((m: any, i: number) => <Montage key={i} fr={fr} m={m} />)}
      {D.brands.map((b: any, i: number) => <BrandCard key={i} fr={fr} b={b} />)}
      {D.endcards.map((e: any, i: number) => <EndCard key={i} fr={fr} e={e} />)}
      <Subs fr={fr} D={D} />
      <GiftNote fr={fr} D={D} />
      {D.flashes.map((t: any, i: number) => <Flash key={i} fr={fr} tr={t} />)}
    </AbsoluteFill>
  );
};
