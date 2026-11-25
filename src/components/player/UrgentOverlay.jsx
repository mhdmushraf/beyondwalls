
const STYLES = {
  urgent: ['#E5484D', '#8C141F', '#FFD7D9'],
  notice: ['#F59E0B', '#92400E', '#FEF3C7'],
  info: ['#6F3FFD', '#2A1B6B', '#DDD3FF'],
};

/**
 * Full-screen takeover. `inline` renders at 1920x1080 design size (for previews
 * inside ScaledCanvas); otherwise it covers the viewport on the TV.
 */
export default function UrgentOverlay({ message, inline = false }) {
  if (!message) return null;
  const [a, b, soft] = STYLES[message.style] || STYLES.urgent;
  const box = inline
    ? { width: 1920, height: 1080, position: 'relative' }
    : { position: 'fixed', inset: 0, zIndex: 50 };
  const unit = inline ? 1 : null;
  const px = (n) => (unit ? `${n}px` : `${(n / 1080) * 100}vh`);
  return (
    <div style={{ ...box, background: `linear-gradient(135deg, ${a} 0%, ${b} 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'Inter, sans-serif', padding: px(60) }}>
      <div style={{ width: px(150), height: px(150), borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: a, fontSize: px(90), fontWeight: 800 }}>!</div>
      <div style={{ marginTop: px(60), color: '#fff', fontSize: px(110), fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{message.text_en}</div>
      {message.text_ar ? <div className="bw-ar" dir="rtl" style={{ marginTop: px(30), color: soft, fontSize: px(80), fontWeight: 700 }}>{message.text_ar}</div> : null}
      {message.subtext ? <div style={{ marginTop: px(40), color: soft, fontSize: px(42), fontWeight: 500 }}>{message.subtext}</div> : null}
    </div>
  );
}
