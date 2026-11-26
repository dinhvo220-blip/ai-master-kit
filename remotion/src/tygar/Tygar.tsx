// Bvlgari Le Gemme Tygar – voice-off "chai 13 củ luôn hết hàng" (26/11/2026)
// Style: dynamic word reels (mục 6h) + luxury tiger's eye (đen – nâu hổ phách – vàng).
// preview=true: nền + bóng người giả để duyệt bố cục khi chưa có clip.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender, staticFile} from 'remotion';
import {loadFonts} from '../fonts';

const FPS = 30;
const SAFE = {l: 70, r: 190, t: 245, b: 385};
const CX = 480;
const INK = '#0D0A07';
const BROWN = '#2A1A0E';
const AMBER = '#C47A2C';
const GOLD = '#D9B26A';
const GOLD_L = '#F3DDA2';
const CREAM = '#F5EBDD';
const SANS = 'Be Vietnam Pro';
const SERIF = 'Noto Serif Display';
const EIN = Easing.bezier(0.16, 1, 0.3, 1);
const EOUT = Easing.bezier(0.7, 0, 0.84, 0);
const f = (t: number) => Math.round(t * FPS);
const ip = (fr: number, a: number, b: number, from = 0, to = 1, e = EIN) =>
  interpolate(fr, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
const life = (fr: number, s: number, e: number, inD = 10, outD = 7) => Math.min(ip(fr, f(s), f(s) + inD), ip(fr, f(e) - outD, f(e), 1, 0, EOUT));
const on = (fr: number, s: number, e: number) => fr >= f(s) - 1 && fr < f(e) + 1;

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

// ---------- beat plan (giây ước lượng theo kịch bản, sẽ khớp lại theo timestamp lời thật) ----------
export const BEATS = {
  hook: [0, 3.3],
  tygar: [3.3, 6.4],
  gemme: [6.4, 10.0],
  stone: [10.0, 14.2],
  kerala: [14.2, 17.4],
  cavallier: [17.4, 20.6],
  notes: [[20.6, 24.4, 'bưởi', 'hương đầu', 'tươi · sáng · sạch'], [24.4, 28.4, 'gừng', 'hương giữa', 'cay the · nam tính'], [28.4, 33.0, 'hổ phách', 'hương cuối', 'gỗ ấm · bám gần da']] as [number, number, string, string, string][],
  pyramid: [33.0, 37.6],
  wear: [37.6, 40.6],
  why: [40.6, 46.0],
  bf: [46.0, 52.0],
  end: [52.0, 55.5],
};
export const TOTAL = 55.5;

// ---------- placeholder (chỉ để duyệt) ----------
const PreviewBg: React.FC<{fr: number}> = ({fr}) => {
  const bok = Array.from({length: 14}).map((_, i) => {
    const x = random(`bx${i}`) * 1080, y = 200 + random(`by${i}`) * 1300, r = 40 + random(`br${i}`) * 110;
    const dx = Math.sin(fr / 90 + i) * 20;
    return <div key={i} style={{position: 'absolute', left: x + dx - r, top: y - r, width: r * 2, height: r * 2, borderRadius: '50%', background: `radial-gradient(circle, rgba(243,221,162,${0.10 + random(`bo${i}`) * 0.12}), transparent 70%)`}} />;
  });
  return <AbsoluteFill style={{background: `radial-gradient(120% 70% at 50% 30%, #4A3220 0%, ${BROWN} 45%, ${INK} 100%)`}}>{bok}</AbsoluteFill>;
};
const PreviewPerson: React.FC = () => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id="pp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B2A1E" /><stop offset="1" stopColor="#120C08" /></linearGradient>
    </defs>
    <ellipse cx={480} cy={720} rx={150} ry={185} fill="url(#pp)" />
    <path d="M 120 1920 C 130 1240, 290 1060, 480 1040 C 670 1060, 830 1240, 840 1920 Z" fill="url(#pp)" />
    <rect x={430} y={880} width={100} height={190} fill="#2A1D14" />
    <text x={480} y={1700} textAnchor="middle" fill="rgba(245,235,221,.25)" fontFamily={SANS} fontSize={26}>[ clip của Darren ]</text>
  </svg>
);

// ---------- khối chữ ----------
const goldText: React.CSSProperties = {background: `linear-gradient(180deg, ${GOLD_L} 0%, ${GOLD} 55%, ${AMBER} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingTop: '0.34em', marginTop: '-0.3em'};

// chữ khổng lồ sau đầu, 2 tầng: dòng nhỏ + từ khóa (mask-slide + blur)
const BigWord: React.FC<{fr: number; s: number; e: number; small: string; word: string; serif?: boolean; size?: number; top?: number}> = ({fr, s, e, small, word, serif, size, top = 300}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 9, 6);
  const y = ip(fr, f(s), f(s) + 9, 60, 0);
  const bl = ip(fr, f(s), f(s) + 9, 14, 0);
  const out = ip(fr, f(e) - 6, f(e), 0, 1, EOUT);
  const fs = size ?? Math.min(serif ? 300 : 340, 860 / (0.56 * word.length));
  return (
    <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top, textAlign: 'center', opacity: a}}>
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 40, letterSpacing: '-0.01em', color: CREAM, opacity: ip(fr, f(s) + 3, f(s) + 12), textShadow: '0 2px 12px rgba(0,0,0,.5)'}}>{small}</div>
      <div style={{overflow: 'visible', marginTop: serif ? -10 : -30}}>
        <div style={{...goldText, fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 500 : 800, fontSize: fs, lineHeight: 1.02, whiteSpace: 'nowrap', letterSpacing: serif ? '-0.01em' : '-0.05em',
          transform: `translateY(${y - out * 40}px)`, filter: `blur(${bl + out * 10}px) drop-shadow(0 8px 30px rgba(0,0,0,.45))`, fontVariantNumeric: 'lining-nums'}}>{word}</div>
      </div>
    </div>
  );
};

// thẻ kính mờ (glass card)
const Glass: React.FC<{fr: number; s: number; e: number; top: number; icon: React.ReactNode; title: string; sub: string; width?: number}> = ({fr, s, e, top, icon, title, sub, width = 640}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 12, 8);
  return (
    <div style={{position: 'absolute', left: CX - width / 2, width, top, opacity: a, transform: `translateY(${ip(fr, f(s), f(s) + 12, 24, 0)}px)`, filter: `blur(${ip(fr, f(s), f(s) + 12, 8, 0)}px)`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 28px', borderRadius: 22, background: 'rgba(255,248,235,.12)', backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
        border: '1px solid rgba(255,240,215,.28)', boxShadow: '0 18px 50px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.18)'}}>
        <div style={{width: 64, height: 64, borderRadius: 32, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(145deg, ${GOLD_L}, ${AMBER})`}}>{icon}</div>
        <div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 32, color: CREAM, letterSpacing: '-0.01em'}}>{title}</div>
          <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 25, color: 'rgba(245,235,221,.78)', marginTop: 2}}>{sub}</div>
        </div>
      </div>
    </div>
  );
};

const Pill: React.FC<{fr: number; s: number; e: number; x: number; y: number; text: string; dark?: boolean}> = ({fr, s, e, x, y, text, dark}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 10, 6);
  return <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,0) scale(${ip(fr, f(s), f(s) + 10, 0.85, 1)})`, opacity: a, padding: '12px 26px', borderRadius: 40,
    background: dark ? 'rgba(13,10,7,.72)' : `linear-gradient(135deg, ${GOLD_L}, ${GOLD})`, color: dark ? GOLD_L : INK, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: '0.02em', whiteSpace: 'nowrap',
    border: dark ? `1px solid ${GOLD}` : 'none', boxShadow: '0 10px 30px rgba(0,0,0,.35)'}}>{text}</div>;
};

// icon nét mảnh
const IcBottle = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><rect x="8" y="2.5" width="8" height="4" rx="1" /><rect x="5" y="8" width="14" height="13.5" rx="2.5" /><path d="M10 6.5v1.5M14 6.5v1.5" /></svg>;
const IcPin = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></svg>;
const IcPen = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z" /><path d="M14 6l3 3" /></svg>;
const IcGem = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><path d="M6 3h12l3 6-9 12L3 9z" /><path d="M3 9h18M9 3l3 18 3-18" /></svg>;

// ---------- viên đá mắt hổ (cabochon + dải sáng chatoyant chạy) ----------
const TigerEye: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 14, 8);
  const sc = ip(fr, f(s), f(s) + 16, 0.7, 1);
  const band = interpolate(fr, [f(s), f(e)], [-60, 60]);
  const W = 340, H = 240;
  return (
    <div style={{position: 'absolute', left: CX - W / 2, top: 1020, width: W, opacity: a, transform: `scale(${sc})`, textAlign: 'center'}}>
      <div style={{position: 'relative', width: W, height: H, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 30px 80px rgba(0,0,0,.6), 0 0 60px rgba(196,122,44,.35)`,
        background: `repeating-linear-gradient(100deg, #3A210C 0px, #7A4A16 14px, #C98A2E 22px, #5A3410 34px, #2A170A 46px, #8D5A1C 58px)`}}>
        <div style={{position: 'absolute', inset: 0, background: `linear-gradient(100deg, transparent ${40 + band}%, rgba(255,230,160,.75) ${50 + band}%, transparent ${60 + band}%)`, mixBlendMode: 'screen'}} />
        <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(60% 55% at 38% 30%, rgba(255,255,255,.45), transparent 60%)'}} />
        <div style={{position: 'absolute', inset: 0, borderRadius: '50%', boxShadow: 'inset 0 -30px 60px rgba(0,0,0,.65), inset 0 10px 30px rgba(255,220,150,.25)'}} />
      </div>
      <div style={{fontFamily: SANS, fontWeight: 300, fontSize: 28, color: CREAM, letterSpacing: '0.18em', marginTop: 18}}>TIGER'S EYE</div>
    </div>
  );
};

// ---------- tháp hương (tóm tắt 3 tầng) ----------
const Pyramid: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const rows = [['HƯƠNG ĐẦU', 'Bưởi'], ['HƯƠNG GIỮA', 'Gừng Ấn Độ'], ['HƯƠNG CUỐI', 'Gỗ hổ phách']];
  return (
    <div style={{position: 'absolute', left: SAFE.l + 40, right: SAFE.r + 40, top: 1120, opacity: life(fr, s, e, 12, 8)}}>
      <div style={{borderRadius: 24, padding: '22px 30px', background: 'rgba(13,10,7,.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid rgba(217,178,106,.45)`}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.22em', color: GOLD, textAlign: 'center', marginBottom: 10}}>LE GEMME TYGAR · CITRUS WOODY</div>
        {rows.map(([k, v], i) => {
          const st = f(s) + 6 + i * 6;
          return (
            <div key={k} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderTop: i ? '1px solid rgba(217,178,106,.25)' : 'none', opacity: ip(fr, st, st + 10), transform: `translateX(${ip(fr, st, st + 10, -30, 0)}px)`}}>
              <span style={{fontFamily: SANS, fontWeight: 400, fontSize: 24, letterSpacing: '0.14em', color: 'rgba(245,235,221,.7)'}}>{k}</span>
              <span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 48, color: GOLD_L}}>{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- 3 chấm tiến độ tầng hương ----------
const NoteDots: React.FC<{fr: number}> = ({fr}) => {
  const [a0] = BEATS.notes[0]; const b2 = BEATS.notes[2][1];
  if (!on(fr, a0, b2)) return null;
  const idx = BEATS.notes.findIndex(([s, e]) => fr >= f(s) && fr < f(e));
  return (
    <div style={{position: 'absolute', left: CX - 120, width: 240, top: 1250, display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: life(fr, a0, b2)}}>
      {[0, 1, 2].map((i) => <div key={i} style={{width: i === idx ? 64 : 16, height: 16, borderRadius: 8, background: i <= idx ? GOLD : 'rgba(245,235,221,.3)', transition: 'none'}} />)}
    </div>
  );
};

// ---------- 2 vế "tươi mà không nhạt / sang mà không nặng" ----------
const Duo: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const L = (txt: string, hi: string, d: number, align: 'left' | 'right') => {
    const st = f(s) + d;
    return (
      <div style={{textAlign: align, lineHeight: 1.15, marginBottom: 6, opacity: ip(fr, st, st + 10), transform: `translateX(${ip(fr, st, st + 12, align === 'left' ? -40 : 40, 0)}px)`, filter: `blur(${ip(fr, st, st + 10, 10, 0)}px)`}}>
        <span style={{fontFamily: SANS, fontWeight: 300, fontSize: 44, color: CREAM}}>{txt} </span>
        <span style={{display: 'inline-block', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 88, ...goldText}}>{hi}</span>
      </div>
    );
  };
  return (
    <div style={{position: 'absolute', left: SAFE.l + 10, right: SAFE.r + 10, top: 1060, opacity: life(fr, s, e, 8, 8)}}>
      {L('tươi mà không', 'nhạt', 0, 'left')}
      {L('sang mà không', 'nặng', 26, 'right')}
    </div>
  );
};

// ---------- lưới chai sáng dần (mục 6h icon grid) ----------
const BottleGrid: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const N = 24, st = f(s) + 70;
  return (
    <div style={{position: 'absolute', left: CX - 330, width: 660, top: 1420, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', rowGap: 8, opacity: life(fr, s, e, 10, 8)}}>
      {Array.from({length: N}).map((_, i) => {
        const lit = ip(fr, st + i * 1.5, st + i * 1.5 + 6);
        return <div key={i} style={{display: 'flex', justifyContent: 'center', opacity: 0.35 + lit * 0.65, filter: lit > 0.5 ? `drop-shadow(0 0 8px ${GOLD})` : 'none'}}><IcBottle c={lit > 0.5 ? GOLD_L : 'rgba(245,235,221,.5)'} s={40} /></div>;
      })}
    </div>
  );
};

// ---------- timeline Black Friday + pins ----------
const Timeline: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const p = ip(fr, f(s) + 20, f(s) + 50, 0, 1, Easing.inOut(Easing.cubic));
  const W = 600;
  return (
    <div style={{position: 'absolute', left: CX - W / 2, width: W, top: 1150, opacity: life(fr, s, e, 12, 8)}}>
      <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: SANS, fontWeight: 700, fontSize: 40, color: CREAM, fontVariantNumeric: 'tabular-nums'}}><span>20.11</span><span style={{color: GOLD_L}}>30.11</span></div>
      <div style={{position: 'relative', height: 6, borderRadius: 3, background: 'rgba(245,235,221,.25)', marginTop: 12}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 6, width: `${p * 100}%`, borderRadius: 3, background: `linear-gradient(90deg, ${AMBER}, ${GOLD_L})`}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 11px)`, top: -8, width: 22, height: 22, borderRadius: 11, background: GOLD_L, boxShadow: `0 0 16px ${GOLD}`}} />
      </div>
      <div style={{textAlign: 'center', marginTop: 16, fontFamily: SANS, fontWeight: 300, fontSize: 26, color: 'rgba(245,235,221,.8)', letterSpacing: '0.16em'}}>BLACK FRIDAY</div>
    </div>
  );
};

// ---------- màn kết ----------
const EndCard: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const a = ip(fr, f(s), f(s) + 14);
  const R = (d: number) => ({opacity: ip(fr, f(s) + d, f(s) + d + 12), transform: `translateY(${ip(fr, f(s) + d, f(s) + d + 12, 24, 0)}px)`});
  return (
    <AbsoluteFill style={{background: `radial-gradient(90% 60% at 50% 40%, rgba(74,50,32,.88), rgba(13,10,7,.94))`, opacity: a}}>
      <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 470, textAlign: 'center'}}>
        <div style={{...R(4), fontFamily: SANS, fontWeight: 300, fontSize: 30, letterSpacing: '0.42em', color: GOLD}}>BVLGARI · LE GEMME</div>
        <div style={{...R(10), fontFamily: SERIF, fontStyle: 'italic', fontWeight: 500, fontSize: 210, lineHeight: 1.1, ...goldText}}>Tygar</div>
        <div style={{...R(16), fontFamily: SANS, fontWeight: 300, fontSize: 34, color: CREAM}}>bưởi · gừng · gỗ hổ phách</div>
        <div style={{...R(24), margin: '60px auto 0', width: 560, borderRadius: 24, padding: '26px 30px', border: `1px solid ${GOLD}`, background: 'rgba(255,248,235,.06)'}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1, ...goldText}}>-20%</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: CREAM, marginTop: 8}}>Black Friday · đến 30/11</div>
        </div>
        <div style={{...R(32), marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center'}}>
          {['Quầy Bvlgari · Takashimaya', 'Quầy Bvlgari · Crescent Mall'].map((t) => (
            <div key={t} style={{display: 'flex', alignItems: 'center', gap: 12, fontFamily: SANS, fontWeight: 500, fontSize: 32, color: CREAM}}><IcPin c={GOLD} s={36} />{t}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- tổng ----------
export const Tygar: React.FC<{preview?: boolean; safe?: boolean}> = ({preview = true, safe = false}) => {
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const B = BEATS;
  // đếm giá ở hook
  const price = Math.round(ip(fr, 4, 34, 0, 13, Easing.out(Easing.cubic)));
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      {preview && <PreviewBg fr={fr} />}

      {/* ===== LỚP SAU NGƯỜI ===== */}
      <BigWord fr={fr} s={B.hook[0]} e={B.hook[1]} small="chai nước hoa" word={`${price}tr`} size={360} top={270} />
      <BigWord fr={fr} s={B.tygar[0]} e={B.tygar[1]} small="tên nó là" word="Tygar" serif size={290} />
      <BigWord fr={fr} s={B.gemme[0]} e={B.gemme[0] + 1.8} small="bộ sưu tập" word="Le Gemme" serif size={200} top={320} />
      <BigWord fr={fr} s={B.gemme[0] + 1.8} e={B.gemme[1]} small="nghĩa là" word="đá quý" serif size={230} top={300} />
      <BigWord fr={fr} s={B.stone[0]} e={B.stone[1]} small="lấy cảm hứng từ" word="mắt hổ" serif size={230} top={300} />
      <BigWord fr={fr} s={B.kerala[0]} e={B.kerala[1]} small="hành trình về" word="Kerala" serif size={240} top={300} />
      <BigWord fr={fr} s={B.cavallier[0]} e={B.cavallier[1]} small="sáng tạo bởi" word="Cavallier" serif size={185} top={320} />
      <BigWord fr={fr} s={B.wear[0]} e={B.wear[1]} small="mặc được" word="ngày & đêm" serif size={150} top={330} />
      {B.notes.map(([s, e, w, k]) => <BigWord key={w} fr={fr} s={s} e={e} small={k} word={w} serif size={w.length > 5 ? 190 : 260} top={300} />)}
      <BigWord fr={fr} s={B.bf[0]} e={B.bf[1]} small="Black Friday giảm" word="-20%" size={250} top={290} />

      {/* ===== NGƯỜI (clip + matte khi có) ===== */}
      {preview && <PreviewPerson />}

      {/* ===== LỚP TRƯỚC NGƯỜI ===== */}
      <Pill fr={fr} s={1.2} e={B.hook[1]} x={CX} y={1130} text="LUÔN HẾT HÀNG" />
      <Glass fr={fr} s={B.tygar[0] + 0.5} e={B.tygar[1]} top={1150} icon={<IcBottle />} title="Bvlgari Le Gemme Tygar" sub="Eau de Parfum · nhóm hương Citrus Woody" width={660} />
      <Pill fr={fr} s={B.gemme[0] + 0.4} e={B.gemme[1]} x={CX} y={1160} text="DÒNG NƯỚC HOA CAO CẤP NHẤT" dark />
      <TigerEye fr={fr} s={B.stone[0]} e={B.stone[1]} />
      <Glass fr={fr} s={B.kerala[0]} e={B.kerala[1]} top={1150} icon={<IcPin />} title="Kerala · Ấn Độ" sub="“khu vườn gia vị” của Ấn Độ" />
      <Glass fr={fr} s={B.cavallier[0]} e={B.cavallier[1]} top={1150} icon={<IcPen />} title="Jacques Cavallier" sub="Bậc thầy nước hoa · người tạo ra Tygar" />
      {B.notes.map(([s, e, w, , d]) => <Pill key={d} fr={fr} s={s + 0.4} e={e} x={CX} y={1160} text={d} dark />)}
      <NoteDots fr={fr} />
      <Pyramid fr={fr} s={B.pyramid[0]} e={B.pyramid[1]} />
      <Pill fr={fr} s={B.wear[0]} e={B.wear[1]} x={CX - 150} y={1160} text="ĐI LÀM" />
      <Pill fr={fr} s={B.wear[0] + 0.5} e={B.wear[1]} x={CX + 150} y={1160} text="ĐI TIỆC TỐI" dark />
      <Duo fr={fr} s={B.why[0]} e={B.why[1]} />
      <BottleGrid fr={fr} s={B.why[0]} e={B.why[1]} />
      <Timeline fr={fr} s={B.bf[0]} e={B.bf[1]} />
      <EndCard fr={fr} s={B.end[0]} e={B.end[1]} />

      {safe && <div style={{position: 'absolute', left: SAFE.l, top: SAFE.t, right: SAFE.r, bottom: SAFE.b, border: '3px solid rgba(255,40,40,.8)'}} />}
    </AbsoluteFill>
  );
};
