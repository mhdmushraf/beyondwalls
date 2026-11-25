import { useEffect, useRef, useState } from 'react';

export const MENU_THEMES = {
  night: { bg: '#15112B', text: '#FFFFFF', sub: '#B9B3D6', price: '#FFCC33', accent: '#6F3FFD', highlight: 'rgba(111,63,253,.35)' },
  light: { bg: '#FFFFFF', text: '#111027', sub: '#6B6787', price: '#5A2DED', accent: '#5A2DED', highlight: 'rgba(111,63,253,.12)' },
  forest: { bg: '#0F3D2E', text: '#F5E6C8', sub: '#B8CBB9', price: '#F5E6C8', accent: '#F2C14E', highlight: 'rgba(242,193,78,.18)' },
  coffee: { bg: '#3B1F12', text: '#FFF4E6', sub: '#D9BFA7', price: '#F2C14E', accent: '#F2C14E', highlight: 'rgba(242,193,78,.18)' },
};

/** Scales a fixed 1920x1080 (or 1080x1920) canvas to fit its parent. */
export function ScaledCanvas({ width = 1920, height = 1080, children, className = '' }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.2);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const fit = () => {
      const w = el.clientWidth;
      const h = el.clientHeight || (w * height) / width;
      setScale(Math.min(w / width, h / height));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);
  return (
    <div ref={ref} className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <div style={{ width, height, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        {children}
      </div>
    </div>
  );
}

function fmt(n) {
  if (n === undefined || n === null || n === '') return '';
  const v = Number(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

/** Renders a menu board at 1920x1080 design size. */
export function MenuBoardCanvas({ board, highlightId }) {
  const theme = MENU_THEMES[board?.theme] || MENU_THEMES.night;
  const items = (board?.items || []).filter((i) => !i.sold_out);
  const layout = board?.layout || 'photo_left';
  const photo = board?.photo_url;
  const showPhoto = photo && (layout === 'photo_left' || layout === 'photo_top');
  const cols = layout === 'two_column' ? 2 : 1;

  const list = (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, columnGap: 60, rowGap: 18 }}>
      {items.map((item) => (
        <div key={item.id} style={{
          display: 'flex', alignItems: 'center', gap: 22, padding: '14px 22px', borderRadius: 20,
          background: item.id === highlightId ? theme.highlight : 'transparent',
        }}>
          {item.emoji ? <span style={{ fontSize: 52 }}>{item.emoji}</span> : null}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: theme.text, fontSize: 40, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name_en}</span>
              {(item.tags || []).slice(0, 2).map((tag) => (
                <span key={tag} style={{ background: theme.price, color: theme.bg, fontSize: 20, fontWeight: 700, borderRadius: 999, padding: '4px 14px' }}>{tag}</span>
              ))}
            </div>
            {item.name_ar ? <div className="bw-ar" dir="rtl" style={{ color: theme.sub, fontSize: 28, textAlign: 'left' }}>{item.name_ar}</div> : null}
          </div>
          <div style={{ textAlign: 'right' }}>
            {item.was_price ? <div style={{ color: theme.sub, fontSize: 26, textDecoration: 'line-through' }}>{fmt(item.was_price)}</div> : null}
            <div style={{ color: theme.price, fontSize: 48, fontWeight: 800 }}>{fmt(item.price)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ width: 1920, height: 1080, background: theme.bg, display: 'flex', flexDirection: layout === 'photo_top' ? 'column' : 'row', fontFamily: 'Inter, sans-serif' }}>
      {showPhoto && (
        <div style={{ [layout === 'photo_top' ? 'height' : 'width']: layout === 'photo_top' ? 380 : 820, flexShrink: 0, backgroundImage: `url(${photo})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      )}
      <div style={{ flex: 1, padding: '70px 80px', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
          <span style={{ color: theme.text, fontSize: 84, fontWeight: 800, letterSpacing: -2 }}>{board?.name || 'Menu'}</span>
          {board?.name_ar ? <span className="bw-ar" style={{ color: theme.accent === '#6F3FFD' ? '#C9B8FF' : theme.accent, fontSize: 64, fontWeight: 700 }}>{board.name_ar}</span> : null}
        </div>
        {items.length ? list : <div style={{ color: theme.sub, fontSize: 36 }}>Add items to your menu</div>}
        <div style={{ marginTop: 'auto', color: theme.sub, fontSize: 22 }}>Prices in {board?.currency || 'AED'} · incl. VAT</div>
      </div>
    </div>
  );
}

export default function MenuBoardView({ board, highlightId, className }) {
  return (
    <ScaledCanvas className={className}>
      <MenuBoardCanvas board={board} highlightId={highlightId} />
    </ScaledCanvas>
  );
}
