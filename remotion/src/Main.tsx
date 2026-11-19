import React from 'react';
import {AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate, Easing, random} from 'remotion';
import {noise2D} from '@remotion/noise';
import {loadFonts} from './fonts';
import data from './data.json';
const D: any = data;
const FPS = 30;
const SAFE = {l: 70, r: 190, t: 245, b: 385};
const CX = 480;
const C = {cream: '#FBF6EE', ink: '#14241C', red: '#8E1B1B', gold: '#EBCB8B', camel: '#B79262', blush: '#E9D9C4', pink: '#2F5A44', deepgold: '#B8893E', ...(D.palette ?? {})};
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const SANS = 'Be Vietnam Pro';
const SERIF = 'Playfair Display';
const f = (t: number) => Math.round(t * FPS);
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

// enter/exit progress
const life = (fr: number, s: number, e: number, inD = 12, outD = 8) => {
  const a = interpolate(fr, [f(s), f(s) + inD], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
  const b = interpolate(fr, [f(e) - outD, f(e)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EOUT});
  return Math.min(a, b);
};
const active = (fr: number, s: number, e: number) => fr >= f(s) && fr < f(e);

const head = (fr: number) => {
  const h = D.head[Math.min(fr, D.head.length - 1)];
  return {x: h[0], y: h[1], top: h[2], w: h[3]};
};

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',')})`; };
const iris = (fr: number, s: number, e: number, cx: number, cy: number) => {
  const a = interpolate(fr, [f(s), f(s) + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1)});
  const b = interpolate(fr, [f(e) - 12, f(e)], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.65, 0, 0.35, 1)});
  const r = Math.min(a, b) * 1700;
  return {r, mask: `radial-gradient(circle at ${cx}px ${cy}px, black ${r}px, transparent ${r + 140}px)`};
};
const darkW = (fr: number) => { let w = 0; for (const r of D.replace) if (r.dark) w = Math.max(w, life(fr, r.s, r.e, 12, 12)); return w; };
// ---------- camera ----------
const camera = (fr: number) => {
  let s = 1, blur = 0, bright = 1, rot = 0, tx = 0, ty = 0;
  // shot base zoom + ken burns
  const shots: any[] = D.shots;
  let sh = shots[0];
  for (const x of shots) if (fr >= f(x.s)) sh = x;
  const kb = interpolate(fr, [f(sh.s), f(sh.e)], [0, 0.035], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  s *= sh.z + kb;
  // punches
  for (const p of D.punches) {
    const pf = f(p.t);
    const hd = Math.max(9, p.hold ?? 30); const v = interpolate(fr, [pf - 4, pf + 8, pf + hd, pf + hd + 14], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
    s *= 1 + v * (p.amt ?? 0.06);
  }
  // cut transitions (zoom-blur)
  for (const c of D.cuts) {
    const cf = f(c.t);
    if (fr >= cf - 7 && fr < cf + 10) {
      const k = c.big ? 1 : 0.6;
      const v = fr < cf ? interpolate(fr, [cf - 7, cf], [0, 1], {easing: Easing.in(Easing.cubic)}) : interpolate(fr, [cf, cf + 10], [1, 0], {easing: Easing.out(Easing.cubic)});
      s *= 1 + 0.1 * k * v; blur += 14 * k * v; bright += 0.18 * k * v;
      if (c.big) rot += (fr < cf ? 1 : -1) * 3 * v;
    }
  }
  // shakes
  for (const sk of D.shakes) {
    const sf = f(sk.t);
    if (fr >= sf && fr < sf + 10) {
      const amp = (sk.amp ?? 10) * (1 - (fr - sf) / 10);
      tx += noise2D('x', fr * 0.5, 0) * amp; ty += noise2D('y', fr * 0.5, 0) * amp;
    }
  }
  const h = head(fr);
  return {s, blur, bright, rot, tx, ty, ox: h.x, oy: h.y};
};
const camStyle = (c: any, k = 1): React.CSSProperties => ({
  position: 'absolute', inset: 0,
  transformOrigin: `${c.ox}px ${c.oy}px`,
  transform: `translate(${c.tx}px,${c.ty}px) scale(${1 + (c.s - 1) * k}) rotate(${c.rot}deg)`,
});

// ---------- backgrounds ----------
const bgModeAt = (fr: number) => {
  // returns weights for {replace: gradient spec, blur}
  let blur = 0, tint = 0;
  for (const b of D.blur) { const v = life(fr, b.s, b.e, 10, 10); blur = Math.max(blur, v * b.amt); tint = Math.max(tint, v * (b.tint ?? 0)); }
  const reps = D.replace.map((r: any) => ({r, v: life(fr, r.s, r.e, 8, 10)})).filter((x: any) => x.v > 0);
  return {blur, tint, reps};
};

const Wall: React.FC<{fr: number; w: any}> = ({fr, w}) => {
  const v = life(fr, w.s, w.e, 14, 10);
  if (v <= 0) return null;
  const rows = 9;
  const t = fr - f(w.s);
  return (
    <div style={{position: 'absolute', left: SAFE.l, top: SAFE.t, width: 1080 - SAFE.l - SAFE.r, height: 1920 - SAFE.t - SAFE.b, overflow: 'hidden', opacity: v * (w.op ?? 0.55),
      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)', WebkitMaskComposite: 'source-in' as any}}>
      {Array.from({length: rows}).map((_, i) => {
        const dir = i % 2 ? 1 : -1;
        const x = -400 + dir * t * (2.2 + (i % 3) * 0.6) + (i * 137) % 300;
        const filled = i % 3 === 1;
        return (
          <div key={i} style={{position: 'absolute', top: i * 150 - 20, left: x, whiteSpace: 'nowrap', fontFamily: SERIF, fontWeight: 900, fontStyle: i % 2 ? 'italic' : 'normal', fontSize: 150, lineHeight: '150px', letterSpacing: 4,
            color: filled ? w.color : 'transparent', WebkitTextStroke: filled ? '0px' : `2.5px ${w.color}`, opacity: filled ? 0.35 : 1, fontVariantNumeric: 'lining-nums'}}>
            {(w.text + '  ').repeat(8)}
          </div>
        );
      })}
    </div>
  );
};

// behind-person big title
const Title: React.FC<{fr: number; t: any}> = ({fr, t}) => {
  if (!active(fr, t.s - 0.1, t.e + 0.1)) return null;
  const v = life(fr, t.s, t.e, 16, 9);
  const dw = darkW(fr);
  const col = t.dark ? mix(t.color, t.dark, dw) : t.color;
  const scol = t.smallColor ?? mix(C.ink, C.cream, dw);
  const k = fr - f(t.s);
  const chars = [...t.big];
  const size = t.size;
  return (
    <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: t.y, textAlign: 'center', opacity: Math.min(1, v * 1.3)}}>
      <div style={{position: 'absolute', left: -60, right: -60, top: -50, height: size + 160, background: 'radial-gradient(ellipse at 50% 50%, rgba(251,246,238,.85) 0%, rgba(251,246,238,.55) 40%, rgba(251,246,238,0) 70%)', opacity: (1 - dw) * v}} />
      {t.small ? (
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 40, letterSpacing: interpolate(v, [0, 1], [18, 6]), color: scol, textTransform: 'uppercase', marginBottom: 4, position: 'relative',
          transform: `translateY(${(1 - v) * 20}px)`, filter: `blur(${(1 - v) * 6}px)`}}>{t.small}</div>
      ) : null}
      <div style={{fontFamily: t.font === 'sans' ? SANS : SERIF, fontWeight: 900, fontStyle: t.italic ? 'italic' : 'normal', fontSize: size, lineHeight: `${size * 0.95}px`, color: col, whiteSpace: 'nowrap', position: 'relative', fontVariantNumeric: 'lining-nums',
        textShadow: t.extrude ? Array.from({length: 10}).map((_, i) => `${i + 1}px ${i + 1}px 0 ${t.extrude}`).join(',') : t.glow ? `0 0 40px ${t.glow}` : undefined,
        letterSpacing: t.track ? interpolate(k, [0, 22], [0.3 * size, 0.02 * size], {extrapolateRight: 'clamp', easing: EIN}) : 0.01 * size}}>
        {chars.map((ch, i) => {
          const p = interpolate(k, [i * 2, i * 2 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
          return <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 60}px) scale(${0.9 + 0.1 * p})`, filter: `blur(${(1 - p) * 8}px)`}}>{ch === ' ' ? ' ' : ch}</span>;
        })}
      </div>
    </div>
  );
};

// orbit ring around head (half: 'back' | 'front')
const Orbit: React.FC<{fr: number; o: any; half: 'back' | 'front'}> = ({fr, o, half}) => {
  if (!active(fr, o.s, o.e)) return null;
  const v = life(fr, o.s, o.e, 14, 10);
  const h = head(fr);
  const txt = [...o.text];
  const N = txt.length;
  const rx = (o.rx ?? 370) * (0.7 + 0.3 * v), ry = o.ry ?? 48;
  const cx = Math.min(Math.max(h.x, SAFE.l + rx + 20), 1080 - SAFE.r - rx - 20);
  const cy = h.top + (o.dy ?? (0.25 * h.w + 20));
  const rot = -(fr - f(o.s)) * (o.speed ?? 0.022);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: v}}>
      {txt.map((ch, i) => {
        const th = rot + (i / N) * Math.PI * 2;
        const depth = Math.sin(th);
        if ((half === 'front') !== depth >= 0) return null;
        const x = cx - rx * Math.cos(th), y = cy + ry * depth;
        const sc = 0.72 + 0.28 * (depth + 1) / 2;
        return <div key={i} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${sc}) scaleX(${0.55 + 0.45 * Math.abs(Math.sin(th))})`, fontFamily: o.font === 'serif' ? SERIF : SANS, fontStyle: o.font === 'serif' ? 'italic' : 'normal',
          fontWeight: 800, fontSize: o.size ?? 46, color: o.color, opacity: 0.5 + 0.5 * (depth + 1) / 2, textShadow: o.shadow ?? '0 2px 10px rgba(0,0,0,.35)', whiteSpace: 'pre'}}>{ch}</div>;
      })}
    </div>
  );
};

const Floats: React.FC<{fr: number; o: any}> = ({fr, o}) => {
  if (!active(fr, o.s, o.e)) return null;
  const out = life(fr, o.s, o.e, 1, 10);
  const h = head(fr);
  const slots = [[-1, 150], [1, 260], [-1, 370], [1, 480]];
  const bgc = o.bg ?? 'rgba(251,246,238,.9)';
  return <div style={{position: 'absolute', inset: 0, opacity: out}}>
    {o.words.map((w: string, i: number) => {
      const t0 = o.times ? o.times[i] : o.s + i * (o.gap ?? 0.5);
      const k = fr - f(t0);
      if (k < 0) return null;
      const p = interpolate(k, [0, 14], [0, 1], {extrapolateRight: 'clamp', easing: EIN});
      const [side, dy] = slots[i % slots.length];
      const size = 50;
      const wpx = w.length * size * 0.55 + 48;
      const cx = side < 0 ? SAFE.l + 6 + wpx / 2 : 1080 - SAFE.r - 6 - wpx / 2;
      const cy = Math.max(SAFE.t + 30, h.top + dy) + Math.sin((fr + i * 20) * 0.05) * 5;
      return <div key={i} style={{position: 'absolute', left: cx, top: cy, transform: `translate(-50%,-50%) translateX(${side * (1 - p) * 80}px) rotate(${side * -3}deg)`, opacity: p, filter: `blur(${(1 - p) * 8}px)`,
        background: bgc, borderRadius: 999, padding: '6px 24px 10px', boxShadow: '0 10px 28px rgba(0,0,0,.22)'}}>
        <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900, fontSize: size, color: o.color ?? C.red, whiteSpace: 'nowrap'}}>{w}</div>
      </div>;
    })}
  </div>;
};

const Sparkles: React.FC<{fr: number; sp: any}> = ({fr, sp}) => {
  if (!active(fr, sp.s, sp.e)) return null;
  const v = life(fr, sp.s, sp.e, 8, 10);
  return <div style={{position: 'absolute', inset: 0, opacity: v, pointerEvents: 'none'}}>
    {Array.from({length: sp.n ?? 14}).map((_, i) => {
      const x = sp.x + (random(`x${i}${sp.s}`) - 0.5) * sp.w;
      const y = sp.y + (random(`y${i}${sp.s}`) - 0.5) * sp.h;
      const ph = random(`p${i}`) * 40;
      const tw = 0.5 + 0.5 * Math.sin((fr + ph) * 0.25);
      const sz = 18 + random(`s${i}`) * 26;
      return <svg key={i} width={sz} height={sz} viewBox="-10 -10 20 20" style={{position: 'absolute', left: x, top: y, opacity: tw, transform: `rotate(${fr * 2 + ph}deg) scale(${0.6 + tw * 0.6})`, filter: `drop-shadow(0 0 6px ${sp.color})`}}>
        <path d="M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10Z" fill={sp.color} />
      </svg>;
    })}
  </div>;
};

// ---------- front graphics (outside camera) ----------
const Pill: React.FC<{text: string; v: number; variant?: string; num?: string}> = ({text, v, variant, num}) => {
  const st: any = {
    ink: {bg: C.ink, fg: C.cream, bd: 'none'},
    cream: {bg: 'rgba(251,246,238,.94)', fg: C.ink, bd: 'none'},
    gold: {bg: 'linear-gradient(135deg,#F7E2B0,#D4A955)', fg: C.ink, bd: 'none'},
    pink: {bg: 'linear-gradient(135deg,#FBE3E8,#F0B3C0)', fg: '#5A1F2C', bd: 'none'},
    red: {bg: C.red, fg: C.cream, bd: 'none'},
    ghost: {bg: 'transparent', fg: C.cream, bd: `2px solid ${C.cream}`},
  }[variant ?? 'ink'];
  return <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '14px 28px', borderRadius: 999, background: st.bg, color: st.fg, border: st.bd, fontFamily: SANS, fontWeight: 800, fontSize: 38, letterSpacing: 1,
    boxShadow: '0 10px 30px rgba(0,0,0,.25)', opacity: v, transform: `translateY(${(1 - v) * 30}px) scale(${0.85 + 0.15 * v})`, filter: `blur(${(1 - v) * 6}px)`, whiteSpace: 'nowrap', textTransform: 'uppercase'}}>
    {num ? <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 34, opacity: 0.8}}>{num}</span> : null}{text}
  </div>;
};

const PillGroup: React.FC<{fr: number; g: any}> = ({fr, g}) => {
  if (!active(fr, g.s, g.e)) return null;
  const out = life(fr, g.s, g.e, 1, 8);
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: g.y ?? 1080, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16, rowGap: 18, opacity: out}}>
    {g.items.map((it: any, i: number) => {
      const p = interpolate(fr, [f(it.t), f(it.t) + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
      if (fr < f(it.t)) return null;
      if (it.sep) return <div key={i} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 40, color: g.sepColor ?? C.cream, opacity: p, alignSelf: 'center', textShadow: '0 2px 10px rgba(0,0,0,.5)'}}>{it.text}</div>;
      const bounce = it.bounce ? 1 + 0.08 * Math.sin(clamp((fr - f(it.t)) / 10) * Math.PI) : 1;
      return <div key={i} style={{transform: `scale(${bounce})`}}><Pill text={it.text} v={p} variant={it.variant ?? g.variant} num={it.num} /></div>;
    })}
  </div>;
};

const BigFront: React.FC<{fr: number; b: any}> = ({fr, b}) => {
  if (!active(fr, b.s, b.e)) return null;
  const v = life(fr, b.s, b.e, 10, 8);
  const k = fr - f(b.s);
  const lines: string[] = b.lines;
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: b.y, textAlign: 'center'}}>
    {lines.map((ln, li) => {
      const p = interpolate(k, [li * 5, li * 5 + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
      const style: React.CSSProperties = {fontFamily: b.font === 'sans' ? SANS : SERIF, fontWeight: 900, fontStyle: b.italic ? 'italic' : 'normal', fontSize: b.size, lineHeight: `${b.size * 1.0}px`, color: b.color, whiteSpace: 'nowrap', textTransform: b.upper ? 'uppercase' : 'none', fontVariantNumeric: 'lining-nums'};
      return <div key={li} style={{overflow: 'hidden', paddingBottom: 8, opacity: v}}>
        <div style={{position: 'relative', transform: `translateY(${(1 - p) * 110}%)`}}>
          {b.echo ? [3, 2, 1].map((e) => <div key={e} style={{...style, position: 'absolute', left: 0, right: 0, top: 0, color: 'transparent', WebkitTextStroke: `2px ${b.color}`, opacity: 0.15 * (4 - e), transform: `translateY(${-e * 14 * (1 - clamp(k / 24))}px)`}}>{ln}</div>) : null}
          <div style={{...style, textShadow: b.shadow ?? '0 6px 24px rgba(0,0,0,.45)'}}>{ln}</div>
        </div>
      </div>;
    })}
  </div>;
};

const Strike: React.FC<{fr: number; s: any}> = ({fr, s}) => {
  if (!active(fr, s.s, s.e)) return null;
  const v = life(fr, s.s, s.e, 10, 8);
  const ln = interpolate(fr, [f(s.tStrike), f(s.tStrike) + 7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const nv = interpolate(fr, [f(s.tNew), f(s.tNew) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: s.y, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: v}}>
    <div style={{position: 'relative', fontFamily: SANS, fontWeight: 800, fontSize: 46, color: 'rgba(30,23,18,.7)', letterSpacing: 4, background: 'rgba(251,246,238,.85)', borderRadius: 999, padding: '4px 22px'}}>
      {s.old}
      <svg style={{position: 'absolute', left: -10, top: 0, width: 'calc(100% + 20px)', height: '100%', overflow: 'visible'}} viewBox="0 0 100 10" preserveAspectRatio="none">
        <path d="M0,6 C30,3 60,7 100,4" stroke={C.red} strokeWidth={1.6} fill="none" strokeDasharray={110} strokeDashoffset={110 * (1 - ln)} vectorEffect="non-scaling-stroke" style={{strokeWidth: 7}} />
      </svg>
    </div>
    <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900, fontSize: 96, color: C.red, opacity: nv, transform: `translateY(${(1 - nv) * 40}px)`, filter: `blur(${(1 - nv) * 8}px)`, textShadow: '0 0 24px rgba(255,255,255,.95), 0 0 8px rgba(255,255,255,.9)', whiteSpace: 'nowrap'}}>{s.new}</div>
  </div>;
};

const Pins: React.FC<{fr: number; p: any}> = ({fr, p}) => {
  if (!active(fr, p.s, p.e)) return null;
  const v = life(fr, p.s, p.e, 12, 8);
  return <div style={{position: 'absolute', left: SAFE.l + 20, right: SAFE.r + 20, top: p.y, background: 'rgba(251,246,238,.95)', borderRadius: 28, padding: '26px 30px', boxShadow: '0 18px 40px rgba(0,0,0,.3)',
    opacity: v, transform: `translateY(${(1 - v) * 50}px)`, filter: `blur(${(1 - v) * 8}px)`}}>
    <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 26, letterSpacing: 6, color: C.red, marginBottom: 10}}>{p.label ?? 'GHÉ STORE'}</div>
    {p.items.map((it: any, i: number) => {
      const q = interpolate(fr, [f(it.t), f(it.t) + 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
      const rip = clamp((fr - f(it.t)) / 18);
      return <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, margin: '10px 0', opacity: q, transform: `translateX(${(1 - q) * -30}px)`}}>
        <div style={{position: 'relative', width: 44, height: 44}}>
          <div style={{position: 'absolute', left: 22 - 30 * rip, top: 30 - 30 * rip, width: 60 * rip, height: 60 * rip, borderRadius: '50%', border: `3px solid ${C.red}`, opacity: 1 - rip}} />
          <svg width="44" height="44" viewBox="0 0 24 24"><path d="M12 2C7.6 2 4 5.4 4 9.8 4 15.5 12 22 12 22s8-6.5 8-12.2C20 5.4 16.4 2 12 2zm0 10.5a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4z" fill={C.red} /></svg>
        </div>
        <div style={{fontFamily: SERIF, fontWeight: 700, fontSize: 46, color: C.ink}}>{it.name}</div>
      </div>;
    })}
  </div>;
};

const Timeline: React.FC<{fr: number; t: any}> = ({fr, t}) => {
  if (!active(fr, t.s, t.e)) return null;
  const v = life(fr, t.s, t.e, 12, 8);
  const p = interpolate(fr, [f(t.s) + 6, f(t.s) + 30], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  const W = 700;
  return <div style={{position: 'absolute', left: CX - W / 2, width: W, top: t.y, opacity: v, transform: `translateY(${(1 - v) * 30}px)`}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SERIF, fontWeight: 900, fontSize: 64, color: t.dark ? C.cream : C.ink, textShadow: t.dark ? '0 4px 16px rgba(0,0,0,.5)' : '0 0 18px rgba(255,255,255,.95), 0 0 6px rgba(255,255,255,.9)', fontVariantNumeric: 'lining-nums'}}>
      <span>{t.a ?? '20.11'}</span><span style={{opacity: interpolate(p, [0.7, 1], [0, 1])}}>{t.b ?? '30.11'}</span>
    </div>
    <div style={{position: 'relative', height: 12, marginTop: 10, borderRadius: 6, background: t.dark ? 'rgba(251,246,238,.25)' : 'rgba(20,36,28,.18)'}}>
      <div style={{position: 'absolute', left: 0, top: 0, height: 12, width: `${p * 100}%`, borderRadius: 6, background: `linear-gradient(90deg, ${C.gold}, #D4A955)`}} />
      <div style={{position: 'absolute', left: `calc(${p * 100}% - 14px)`, top: -8, width: 28, height: 28, borderRadius: '50%', background: C.gold, boxShadow: `0 0 20px ${C.gold}`}} />
    </div>
  </div>;
};

const Receipt: React.FC<{fr: number; r: any}> = ({fr, r}) => {
  if (!active(fr, r.s, r.e)) return null;
  const v = life(fr, r.s, r.e, 12, 8);
  const cnt = interpolate(fr, [f(r.s) + 4, f(r.s) + 30], [0, 5000000], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const g = interpolate(fr, [f(r.tGift), f(r.tGift) + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.34, 1.4, 0.64, 1)});
  const stp = interpolate(fr, [f(r.tStamp), f(r.tStamp) + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <div style={{position: 'absolute', left: SAFE.l + 40, right: SAFE.r + 40, top: r.y, opacity: v, transform: `translateY(${(1 - v) * 60}px) rotate(-2deg)`}}>
    <div style={{background: C.cream, borderRadius: 22, padding: '24px 30px', boxShadow: '0 18px 40px rgba(0,0,0,.35)', position: 'relative'}}>
      <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 28, letterSpacing: 4, color: C.red}}>{r.label ?? 'HÓA ĐƠN SAU GIẢM TỪ'}</div>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 84, color: C.ink, fontVariantNumeric: 'lining-nums tabular-nums'}}>{Math.round(cnt).toLocaleString('vi-VN')}đ</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, marginTop: 6, opacity: g, transform: `scale(${0.6 + 0.4 * g})`, transformOrigin: 'left center'}}>
        <svg width="56" height="56" viewBox="0 0 24 24"><path d="M3 10h18v11H3zM2 6h20v4H2zM12 6v15M12 6c-2-4-7-4-6 0M12 6c2-4 7-4 6 0" stroke={C.red} strokeWidth={1.6} fill="none" /></svg>
        <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 44, color: C.ink}}>{r.gift ?? 'TẶNG THÊM'} <span style={{color: C.red}}>{r.giftHi ?? 'SIZE 30ML'}</span></div>
      </div>
      <div style={{position: 'absolute', right: -24, top: -64, transform: `rotate(-12deg) scale(${2.2 - 1.2 * stp})`, opacity: stp, border: `5px solid ${C.red}`, color: C.red, borderRadius: 14, padding: '6px 16px', fontFamily: SANS, fontWeight: 900, fontSize: 40, letterSpacing: 2, background: 'rgba(251,246,238,.85)'}}>{r.stamp ?? 'NHANH TAY!'}</div>
    </div>
  </div>;
};

const EndCard: React.FC<{fr: number; e: any}> = ({fr, e}) => {
  if (!active(fr, e.s, e.e + 1)) return null;
  const v = interpolate(fr, [f(e.s), f(e.s) + 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
  const items: string[] = e.items;
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1130, opacity: v, transform: `translateY(${(1 - v) * 80}px)`}}>
    <div style={{background: 'rgba(251,246,238,.96)', borderRadius: 30, padding: '30px 34px', boxShadow: '0 20px 50px rgba(0,0,0,.35)', textAlign: 'center'}}>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 70, letterSpacing: 10, color: C.ink}}>{e.brand}</div>
      <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 32, letterSpacing: 6, color: C.red, margin: '4px 0 14px'}}>{e.sub}</div>
      {items.map((t, i) => {
        const q = interpolate(fr, [f(e.s) + 8 + i * 5, f(e.s) + 18 + i * 5], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EIN});
        return <div key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: C.ink, margin: '8px 0', opacity: q, transform: `translateY(${(1 - q) * 20}px)`}}>{t}</div>;
      })}
    </div>
  </div>;
};

// ---------- subtitles (karaoke) ----------
const Subs: React.FC<{fr: number}> = ({fr}) => {
  const t = fr / FPS;
  const ln = D.lines.find((l: any) => t >= l.s && t < l.e);
  if (!ln) return null;
  for (const h of D.hideSubs) if (t >= h.s && t < h.e) return null;
  const k = fr - f(ln.s);
  const v = interpolate(k, [0, 5], [0, 1], {extrapolateRight: 'clamp', easing: EIN});
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1330, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', columnGap: 22, rowGap: 0, opacity: v, transform: `translateY(${(1 - v) * 14}px)`}}>
      {ln.words.map((w: any, i: number) => {
        const on = t >= w.s;
        const cur = on && t < w.e + 0.05;
        const pop = cur ? 1 + 0.08 * Math.sin(clamp((t - w.s) / Math.max(0.12, w.e - w.s)) * Math.PI) : 1;
        return <span key={i} style={{fontFamily: SANS, fontWeight: 800, fontSize: 66, lineHeight: '84px', color: w.key ? C.gold : '#FFFFFF', opacity: on ? 1 : 0.55,
          WebkitTextStroke: `10px ${C.ink}`, paintOrder: 'stroke fill', display: 'inline-block', transform: `scale(${pop})`, transformOrigin: '50% 100%',
          textShadow: w.key && on ? `0 0 18px rgba(242,212,155,.55)` : '0 4px 10px rgba(0,0,0,.35)'}}>{w.t}</span>;
      })}
    </div>
  </div>;
};

// ---------- transitions overlays ----------
const Ribbon: React.FC<{fr: number; tr: any}> = ({fr, tr}) => {
  const cf = f(tr.t);
  if (fr < cf - 9 || fr > cf + 10) return null;
  const cols = tr.colors ?? [C.camel, C.ink, C.red];
  return <AbsoluteFill style={{pointerEvents: 'none'}}>
    {cols.map((c: string, i: number) => {
      const x = interpolate(fr, [cf - 9 + i * 2, cf + 8 + i * 2], [-1700, 1700], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
      return <div key={i} style={{position: 'absolute', left: x - 200, top: -400, width: 900 - i * 120, height: 2800, background: c, transform: 'skewX(-18deg)'}} />;
    })}
    {(() => { const s = interpolate(fr, [cf - 3, cf, cf + 6], [0, 1.4, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}); return <svg width={200} height={200} viewBox="-10 -10 20 20" style={{position: 'absolute', left: 380, top: 860, transform: `scale(${s}) rotate(${fr * 6}deg)`}}><path d="M0,-10 C1,-2 2,-1 10,0 C2,1 1,2 0,10 C-1,2 -2,1 -10,0 C-2,-1 -1,-2 0,-10Z" fill={C.gold} /></svg>; })()}
  </AbsoluteFill>;
};
const Flash: React.FC<{fr: number; tr: any}> = ({fr, tr}) => {
  const cf = f(tr.t);
  const o = interpolate(fr, [cf - 2, cf, cf + 9], [0, 0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: tr.color ?? '#FFF8EC', opacity: o}} />;
};
const LightLeak: React.FC<{fr: number; l: any}> = ({fr, l}) => {
  if (!active(fr, l.s, l.e)) return null;
  const v = life(fr, l.s, l.e, 20, 20) * (l.op ?? 0.35);
  const x = 200 + Math.sin(fr * 0.02) * 300, y = 500 + Math.cos(fr * 0.017) * 400;
  return <AbsoluteFill style={{mixBlendMode: 'screen', opacity: v, background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,190,90,.9), rgba(255,140,60,.3) 25%, transparent 55%), radial-gradient(circle at ${1080 - x}px ${1700 - y}px, rgba(255,220,150,.7), transparent 45%)`}} />;
};

const pscale = (fr: number) => {
  let ps = 1;
  for (const p of D.pscale) { const v = life(fr, p.s, p.e, 12, 12); ps = Math.min(ps, 1 - (1 - p.ps) * v); }
  return ps;
};
export const Main: React.FC = () => {
  loadFonts();
  const fr = useCurrentFrame();
  const cam = camera(fr);
  const bg = bgModeAt(fr);
  const cs = camStyle(cam);
  const ps = pscale(fr);
  const subj: React.CSSProperties = {position: 'absolute', inset: 0, transformOrigin: '540px 1920px', transform: `scale(${ps})`};
  const filt = cam.blur > 0.2 ? `blur(${cam.blur}px) brightness(${cam.bright})` : undefined;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, filter: filt}}>
        {/* sharp base (shows below the treatment fade) */}
        <div style={cs}><OffthreadVideo src={staticFile('base.mp4')} muted style={{width: 1080, height: 1920}} /></div>
        <div style={{position: 'absolute', inset: 0, WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 52%, transparent 70%)'}}>
          {bg.reps.map(({r}: any, i: number) => { const m = iris(fr, r.s, r.e, head(fr).x, head(fr).y); return <AbsoluteFill key={i} style={{background: r.bg, WebkitMaskImage: m.mask}} />; })}
          {D.walls.map((w: any, i: number) => { if (!active(fr, w.s, w.e)) return null; const m = iris(fr, w.s, w.e, head(fr).x, head(fr).y); return <div key={i} style={{...camStyle(cam, 0.4), WebkitMaskImage: m.mask}}><Wall fr={fr} w={w} /></div>; })}
        </div>
        <div style={camStyle(cam, 0.25)}>
          {D.titles.map((t: any, i: number) => <Title key={i} fr={fr} t={t} />)}
        </div>
        <div style={cs}>
        </div>
        {/* person cut-out */}
        <div style={cs}>
          <div style={subj}><OffthreadVideo src={staticFile('person.webm')} transparent muted style={{width: 1080, height: 1920}} /></div>
        </div>
        <div style={cs}>
          {D.floats.map((o: any, i: number) => <Floats key={i} fr={fr} o={o} />)}
          {D.sparkles.map((s: any, i: number) => <Sparkles key={i} fr={fr} sp={s} />)}
        </div>
        {D.leaks.map((l: any, i: number) => <LightLeak key={i} fr={fr} l={l} />)}
      </div>
      {/* front graphics */}
      {D.pills.map((g: any, i: number) => <PillGroup key={i} fr={fr} g={g} />)}
      {D.bigs.map((b: any, i: number) => <BigFront key={i} fr={fr} b={b} />)}
      {D.strikes.map((s: any, i: number) => <Strike key={i} fr={fr} s={s} />)}
      {D.pins.map((p: any, i: number) => <Pins key={i} fr={fr} p={p} />)}
      {D.timelines.map((t: any, i: number) => <Timeline key={i} fr={fr} t={t} />)}
      {D.receipts.map((r: any, i: number) => <Receipt key={i} fr={fr} r={r} />)}
      {D.endcards.map((e: any, i: number) => <EndCard key={i} fr={fr} e={e} />)}
      <Subs fr={fr} />
      {D.transitions.filter((t: any) => t.type === 'ribbon').map((t: any, i: number) => <Ribbon key={i} fr={fr} tr={t} />)}
      {D.transitions.filter((t: any) => t.type === 'flash').map((t: any, i: number) => <Flash key={i} fr={fr} tr={t} />)}
    </AbsoluteFill>
  );
};
