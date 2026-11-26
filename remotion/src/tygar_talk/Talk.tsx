// Talking-head trên clip thật (dựa trên bộ đồ hoạ soạn trước src/tygar) – voice "chai 13 củ luôn hết hàng" (26/11/2026)
// Style: dynamic word reels (mục 6h) + luxury tiger's eye (đen – nâu hổ phách – vàng).
// preview=true: nền + bóng người giả để duyệt bố cục khi chưa có clip.
import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, useCurrentFrame, interpolate, Easing, random, continueRender, delayRender, staticFile} from 'remotion';
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


// ---------- khối chữ ----------
const darkText: React.CSSProperties = {background: 'linear-gradient(180deg, #5A3516 0%, #2A170A 60%, #160C05 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', paddingTop: '0.34em', marginTop: '-0.3em'};
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
      <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 38, letterSpacing: '-0.01em', color: '#2A170A', opacity: ip(fr, f(s) + 3, f(s) + 12), textShadow: '0 0 14px rgba(255,240,215,.55)'}}>{small}</div>
      <div style={{overflow: 'visible', marginTop: serif ? -10 : -30}}>
        <div style={{...darkText, fontFamily: serif ? SERIF : SANS, fontStyle: serif ? 'italic' : 'normal', fontWeight: serif ? 500 : 800, fontSize: fs, lineHeight: 1.02, whiteSpace: 'nowrap', letterSpacing: serif ? '-0.01em' : '-0.05em',
          transform: `translateY(${y - out * 40}px)`, filter: `blur(${bl + out * 10}px) drop-shadow(0 0 18px rgba(255,238,210,.55))`, fontVariantNumeric: 'lining-nums'}}>{word}</div>
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
      <div style={{display: 'flex', alignItems: 'center', gap: 22, padding: '20px 28px', borderRadius: 22, background: 'rgba(16,11,7,.62)', backdropFilter: 'blur(18px) saturate(1.4)', WebkitBackdropFilter: 'blur(18px) saturate(1.4)',
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
const Pyramid: React.FC<{fr: number; s: number; e: number; rows: [string, string, number][]; top?: number}> = ({fr, s, e, rows, top = 1120}) => {
  if (!on(fr, s, e)) return null;
  return (
    <div style={{position: 'absolute', left: SAFE.l + 40, right: SAFE.r + 40, top, opacity: life(fr, s, e, 12, 8)}}>
      <div style={{borderRadius: 24, padding: '22px 30px', background: 'rgba(13,10,7,.55)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: `1px solid rgba(217,178,106,.45)`}}>
        <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 22, letterSpacing: '0.22em', color: GOLD, textAlign: 'center', marginBottom: 10}}>LE GEMME TYGAR</div>
        {rows.map(([k, v, t], i) => {
          const st = f(t);
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

// ---------- 2 vế "tươi mà không nhạt / sang mà không nặng" ----------
const Duo: React.FC<{fr: number; s: number; e: number; d2?: number}> = ({fr, s, e, d2 = 26}) => {
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
      {L('sang mà không', 'nặng', d2, 'right')}
    </div>
  );
};

// ---------- lưới chai sáng dần (mục 6h icon grid) ----------
const BottleGrid: React.FC<{fr: number; s: number; e: number; top?: number; delay?: number}> = ({fr, s, e, top = 1420, delay = 70}) => {
  if (!on(fr, s, e)) return null;
  const N = 24, st = f(s) + delay;
  return (
    <div style={{position: 'absolute', left: CX - 330, width: 660, top, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', rowGap: 8, opacity: life(fr, s, e, 10, 8)}}>
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
    <div style={{position: 'absolute', left: CX - W / 2 - 34, width: W + 68, top: 1130, padding: '22px 34px', boxSizing: 'border-box', borderRadius: 24, background: 'rgba(16,11,7,.66)', backdropFilter: 'blur(16px)', border: '1px solid rgba(217,178,106,.4)', opacity: life(fr, s, e, 12, 8)}}>
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
        <div style={{...R(16), fontFamily: SANS, fontWeight: 300, fontSize: 34, color: CREAM}}>bưởi · gừng · long diên hương</div>
        <div style={{...R(24), margin: '60px auto 0', width: 560, borderRadius: 24, padding: '26px 30px', border: `1px solid ${GOLD}`, background: 'rgba(255,248,235,.06)'}}>
          <div style={{fontFamily: SANS, fontWeight: 800, fontSize: 96, lineHeight: 1, ...goldText}}>-20%</div>
          <div style={{fontFamily: SANS, fontWeight: 600, fontSize: 34, color: CREAM, marginTop: 8}}>Black Friday · 20 – 30/11</div>
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

const IcGift = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><rect x="3.5" y="9" width="17" height="11.5" rx="1.5" /><path d="M2.5 9h19M12 9v11.5" /><path d="M12 9c-2-4-6-4-6-1.5S10 9 12 9zM12 9c2-4 6-4 6-1.5S14 9 12 9z" /></svg>;
const IcHand = ({c = INK, s = 34}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={1.6}><rect x="7" y="3" width="10" height="15" rx="3" /><path d="M9 3V1.8h6V3M7 9h10" /><path d="M10 21h4" /></svg>;

// ---------- phụ đề (cụm nghĩa, từ khóa serif nghiêng vàng) ----------
// [bắt đầu, kết thúc, câu, từ khóa]
const SUBS: [number, number, string, string[]][] = [
  [0.0, 1.06, 'Một chai nước hoa 13 củ', ['13 củ']],
  [1.06, 2.84, 'nhưng luôn hết hàng ở Bvlgari', ['hết hàng']],
  [2.84, 4.4, 'Đó chính là chai Tygar', ['Tygar']],
  [4.4, 5.84, 'của dòng Le Gemme mọi người', ['Le Gemme']],
  [5.84, 7.2, 'Chai rất là xinh', ['xinh']],
  [7.2, 9.36, 'và nó lấy cảm hứng từ viên đá mắt hổ', ['đá mắt hổ']],
  [9.36, 12.6, 'Thì cái chai này quầy sẽ gói qua', ['gói']],
  [12.6, 14.1, 'và đem đi, và Darren đã mượn', ['mượn']],
  [14.1, 16.04, 'để mà quay cho mọi người xem', []],
  [16.04, 18.98, 'Tại vì chai này ít khi mà có chai mới ở cửa hàng lắm', ['chai mới']],
  [18.98, 21.1, 'tại vì nó luôn cháy hàng đó mọi người', ['cháy hàng']],
  [42.3, 44.4, 'Tuy nhiên thì nốt này Darren thấy unisex', ['unisex']],
  [44.4, 46.3, 'nam nữ xài bình thường vô tư', ['nam nữ']],
  [46.3, 47.9, 'Và một cái nốt hương Darren thấy ấn tượng', ['ấn tượng']],
  [47.9, 49.14, 'đó chính là long diên hương mọi người', ['long diên hương']],
  [49.14, 50.5, 'Một cái nốt bưởi kết hợp với', ['bưởi']],
  [50.5, 52.12, 'long diên hương, cay cay nhẹ của gừng', ['gừng']],
  [52.12, 54.5, 'Một cái hương cực kỳ cuốn luôn', ['cuốn']],
  [54.5, 56.24, 'Ai mà mua rồi sẽ mua đi mua lại', ['mua đi mua lại']],
  [56.24, 58.5, 'Một cái mùi hương tươi mà không nhạt', ['tươi']],
  [58.5, 59.76, 'sang mà không bị nặng mùi', ['sang']],
  [59.76, 61.7, 'Mọi người thực sự là dùng sẽ ghiền', ['ghiền']],
  [61.7, 62.8, 'và sẽ mua đi mua lại luôn', []],
  [62.8, 64.38, 'Đó là lý do vì sao em này luôn cháy hàng', ['cháy hàng']],
  [64.38, 67.0, 'Mặc dù giá cũng nằm trong phân khúc cao cấp á mọi người', ['cao cấp']],
  [67.0, 68.06, '13 củ', ['13 củ']],
  [68.06, 69.84, 'Trong dịp Black Friday này giảm 20%', ['giảm 20%']],
  [69.84, 72.28, 'thì đâu đó còn 10 triệu mấy và tặng thêm một chai sữa tắm', ['10 triệu mấy']],
  [72.28, 75.6, 'hoặc là một cái tuýp kem tay, full size luôn nha', ['full size']],
  [75.6, 76.9, 'Vừa được có deal hời', ['deal hời']],
];
const Subs: React.FC<{fr: number; hide: boolean}> = ({fr, hide}) => {
  const cur = SUBS.find(([s, e]) => fr >= f(s) && fr < f(e));
  if (!cur || hide) return null;
  const [s, , txt, keys] = cur;
  const a = ip(fr, f(s), f(s) + 5);
  // tách từ khóa
  const parts: [string, boolean][] = [];
  let rest = txt;
  while (rest.length) {
    let hit = -1, k = '';
    for (const kw of keys) { const i = rest.indexOf(kw); if (i >= 0 && (hit < 0 || i < hit)) { hit = i; k = kw; } }
    if (hit < 0) { parts.push([rest, false]); break; }
    if (hit > 0) parts.push([rest.slice(0, hit), false]);
    parts.push([k, true]); rest = rest.slice(hit + k.length);
  }
  return <div style={{position: 'absolute', left: SAFE.l, right: SAFE.r, top: 1395, textAlign: 'center', opacity: a, display: 'flex', justifyContent: 'center',
    transform: `translateY(${(1 - a) * 10}px)`, lineHeight: 1.22}}><div style={{padding: '8px 22px 12px', borderRadius: 18, background: 'rgba(14,9,5,.42)', backdropFilter: 'blur(6px)', maxWidth: 800}}>
    {parts.map(([p, k], i) => k
      ? <span key={i} style={{whiteSpace: 'nowrap', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 600, fontSize: 52, color: GOLD_L, textShadow: '0 2px 4px rgba(0,0,0,.9), 0 0 18px rgba(0,0,0,.6)'}}>{p}</span>
      : <span key={i} style={{fontFamily: SANS, fontWeight: 600, fontSize: 42, color: '#FFF8EC', textShadow: '0 2px 4px rgba(0,0,0,.9), 0 0 18px rgba(0,0,0,.6)'}}>{p}</span>)}
  </div></div>;
};

// sticker viên đá mắt hổ THẬT (ảnh Wikimedia, cutout) nổi cạnh chai
const StoneSticker: React.FC<{fr: number; s: number; e: number}> = ({fr, s, e}) => {
  if (!on(fr, s, e)) return null;
  const a = life(fr, s, e, 12, 8);
  const sc = ip(fr, f(s), f(s) + 14, 0.5, 1, Easing.bezier(0.34, 1.4, 0.64, 1));
  return <div style={{position: 'absolute', left: 640, top: 1080 + Math.sin(fr / 14) * 6, width: 220, opacity: a, transform: `scale(${sc}) rotate(${-8 + Math.sin(fr / 30) * 3}deg)`, textAlign: 'center'}}>
    <Img src={staticFile('tygar_talk/stone_c.png')} style={{width: 220, filter: 'drop-shadow(0 18px 24px rgba(0,0,0,.6))'}} />
    <div style={{fontFamily: SANS, fontWeight: 500, fontSize: 22, letterSpacing: '0.2em', color: CREAM, marginTop: 6, textShadow: '0 2px 8px rgba(0,0,0,.8)'}}>TIGER'S EYE</div>
  </div>;
};

const COVER: [number, number] = [21.15, 42.2];
export const TygarTalk: React.FC<{noPerson?: boolean}> = ({noPerson = false}) => {
  loadFonts(); loadSerif();
  const fr = useCurrentFrame();
  const price = (t0: number) => Math.round(ip(fr, f(t0), f(t0) + 26, 0, 13, Easing.out(Easing.cubic)));
  const ten = Math.round(ip(fr, f(70.2), f(70.2) + 22, 13, 10, Easing.out(Easing.cubic)));
  const inCover = fr >= f(COVER[0]) && fr < f(COVER[1]);
  const endS = 76.9;
  return (
    <AbsoluteFill style={{background: INK, overflow: 'hidden'}}>
      <OffthreadVideo src={staticFile('tygar_talk/base.mp4')} muted style={{filter: 'contrast(1.04) saturate(1.05)'}} />
      {/* ===== SAU NGƯỜI ===== */}
      <BigWord fr={fr} s={42.6} e={46.3} small="nam nữ đều xài" word="unisex" serif size={170} top={228} />
      <BigWord fr={fr} s={47.7} e={49.14} small="ấn tượng nhất" word="long diên hương" serif size={96} top={228}  />
      <BigWord fr={fr} s={52.7} e={54.5} small="một mùi hương" word="cuốn" serif size={170} top={228} />
      <BigWord fr={fr} s={54.7} e={56.24} small="mua đi" word="mua lại" serif size={170} top={228} />
      <BigWord fr={fr} s={61.2} e={62.8} small="dùng là" word="ghiền" serif size={170} top={228} />
      <BigWord fr={fr} s={62.8} e={64.38} small="lý do luôn" word="cháy hàng" serif size={140} top={228}  />
      <BigWord fr={fr} s={66.9} e={68.06} small="giá" word={`${price(66.95)}tr`} size={190} top={228}  />
      <BigWord fr={fr} s={68.06} e={69.84} small="Black Friday giảm" word="-20%" size={190} top={228}  />
      <BigWord fr={fr} s={69.84} e={72.28} small="chỉ còn" word={`${ten}tr+`} size={190} top={228}  />
      {/* ===== NGƯỜI (matte) ===== */}
      {!noPerson && <OffthreadVideo src={staticFile('tygar_talk/person.webm')} transparent muted style={{position: 'absolute', inset: 0, filter: 'contrast(1.04) saturate(1.05)'}} />}
      {/* chữ lớn đoạn đầu: đầu ở cao, đặt TRƯỚC người, chỉ đè tóc */}
      <BigWord fr={fr} s={0.0} e={2.84} small="chai nước hoa" word={`${price(0.1)}tr`} size={150} top={228}  />
      <BigWord fr={fr} s={2.84} e={4.4} small="đó chính là" word="Tygar" serif size={150} top={228} />
      <BigWord fr={fr} s={4.4} e={5.84} small="của dòng" word="Le Gemme" serif size={125} top={228}  />
      <BigWord fr={fr} s={5.84} e={7.2} small="chai rất là" word="xinh" serif size={150} top={228} />
      <BigWord fr={fr} s={7.2} e={9.36} small="cảm hứng từ" word="mắt hổ" serif size={150} top={228}  />
      <BigWord fr={fr} s={13.4} e={16.04} small="Darren đã" word="mượn" serif size={150} top={228} />
      <BigWord fr={fr} s={16.04} e={18.98} small="ít khi có" word="chai mới" serif size={125} top={228}  />
      <BigWord fr={fr} s={18.98} e={21.0} small="vì luôn" word="cháy hàng" serif size={125} top={228}  />
      {/* ===== TRƯỚC NGƯỜI ===== */}
      <Pill fr={fr} s={1.5} e={2.84} x={CX} y={1170} text="LUÔN HẾT HÀNG" />
      <Glass fr={fr} s={3.4} e={5.84} top={1160} icon={<IcBottle />} title="Bvlgari Le Gemme Tygar" sub="Eau de Parfum" width={600} />
      <StoneSticker fr={fr} s={8.5} e={9.6} />
      <Glass fr={fr} s={10.0} e={13.3} top={1160} icon={<IcGift />} title="Khách mua → quầy gói mang đi" sub="hiếm khi còn chai trưng sẵn" width={640} />
      <Pill fr={fr} s={13.7} e={16.04} x={CX} y={1170} text="MƯỢN QUẦY ĐỂ QUAY" dark />
      <Pill fr={fr} s={19.8} e={21.0} x={CX} y={1170} text="CHÁY HÀNG LIÊN TỤC" />
      <Pill fr={fr} s={44.6} e={46.3} x={CX - 110} y={1170} text="NAM" dark />
      <Pill fr={fr} s={44.86} e={46.3} x={CX + 110} y={1170} text="NỮ" dark />
      <Glass fr={fr} s={48.1} e={49.14} top={1160} icon={<IcGem />} title="Long diên hương" sub="nốt Darren thấy ấn tượng nhất" width={600} />
      <Pyramid fr={fr} s={49.3} e={52.2} top={1040} rows={[['TƯƠI SÁNG', 'Bưởi', 49.5], ['ẤN TƯỢNG', 'Long diên hương', 50.5], ['CAY NHẸ', 'Gừng', 51.5]]} />
      <BottleGrid fr={fr} s={54.5} e={56.24} top={1200} delay={10} />
      <Duo fr={fr} s={56.9} e={59.9} d2={f(58.5) - f(56.9)} />
      <Pill fr={fr} s={64.9} e={67.0} x={CX} y={1170} text="PHÂN KHÚC CAO CẤP" dark />
      <Timeline fr={fr} s={68.06} e={69.84} />
      <Glass fr={fr} s={71.1} e={72.28} top={1160} icon={<IcGift />} title="Tặng 1 chai sữa tắm" sub="khi mua Tygar dịp Black Friday" width={620} />
      <Glass fr={fr} s={72.7} e={endS} top={1160} icon={<IcHand />} title="hoặc 1 tuýp kem tay" sub="full size luôn" width={560} />
      <Subs fr={fr} hide={inCover || fr >= f(endS) || on(fr, 49.3, 52.2) || on(fr, 56.9, 59.9)} />
      <EndCard fr={fr} s={endS} e={80} />
    </AbsoluteFill>
  );
};
