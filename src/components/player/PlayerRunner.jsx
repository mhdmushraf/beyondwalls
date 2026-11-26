import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import MenuBoardView from './MenuBoardView';
import UrgentOverlay from './UrgentOverlay';
import { QRCodeSVG } from 'qrcode.react';
import { BrandTile } from '@/components/Brand';

const QR_POS = {
  bottom_right: { bottom: '3vh', right: '2vw' },
  bottom_left: { bottom: '3vh', left: '2vw' },
  top_right: { top: '3vh', right: '2vw' },
  top_left: { top: '3vh', left: '2vw' },
};

function chime() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [880, 660].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.35;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o.start(t); o.stop(t + 0.32);
    });
  } catch (e) { /* audio blocked */ }
}

const CACHE_NAME = 'bw-media-v1';

/** Media is cached in Cache Storage so the screen keeps playing when the network drops. */
async function cacheMedia(url) {
  try {
    const cache = await caches.open(CACHE_NAME);
    let response = await cache.match(url);
    if (!response) {
      const fetched = await fetch(url, { mode: 'cors' });
      if (!fetched.ok) return url;
      await cache.put(url, fetched.clone());
      response = fetched;
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (e) {
    return url;
  }
}

const FIT_CLASS = {
  fit: 'object-contain',
  stretch: 'object-fill',
  fill: 'object-cover',
};

export default function PlayerRunner({ token, onMoved }) {
  // Last good manifest is kept so the screen keeps playing after a reboot with no internet.
  const [manifest, setManifest] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bw_manifest') || 'null'); } catch (e) { return null; }
  });
  const [index, setIndex] = useState(0);
  const [blank, setBlank] = useState(false);
  const [displayUrl, setDisplayUrl] = useState(null);

  const currentRef = useRef(null);
  const displayRef = useRef(null);
  const manifestRef = useRef(null);
  const startedAt = useRef(Date.now());
  const lastCommand = useRef(localStorage.getItem('bw_last_command') || '');

  const items = manifest?.items || [];
  const current = items.length ? items[index % items.length] : null;

  useEffect(() => {
    currentRef.current = current;
    manifestRef.current = manifest;
    displayRef.current = displayUrl;
  }, [current, manifest, displayUrl]);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('playerManifest', { device_token: token });
      setManifest(res.data);
      try { localStorage.setItem('bw_manifest', JSON.stringify(res.data)); } catch (e) { /* storage full */ }
    } catch (e) {
      if (e?.response?.status === 409) onMoved();
    }
  }, [token, onMoved]);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  // Chime when a new urgent message arrives.
  const urgent = manifest?.urgent || null;
  const chimedFor = useRef('');
  useEffect(() => {
    if (!urgent || urgent.sound === 'none') return undefined;
    if (chimedFor.current !== urgent.id) { chimedFor.current = urgent.id; chime(); }
    if (urgent.sound !== 'chime_repeat') return undefined;
    const id = setInterval(chime, 60000);
    return () => clearInterval(id);
  }, [urgent?.id, urgent?.sound]);

  // Resolve (and cache) the current item.
  useEffect(() => {
    let alive = true;
    if (!current || current.kind === 'menu') {
      setDisplayUrl(null);
      return () => { alive = false; };
    }
    if (current.type === 'video') {
      setDisplayUrl(current.url);
      return () => { alive = false; };
    }
    cacheMedia(current.url).then((url) => {
      if (alive) setDisplayUrl(url);
    });
    return () => { alive = false; };
  }, [current?.id, current?.url]);

  // Advance still images on their duration.
  useEffect(() => {
    if (!current || current.type === 'video') return undefined;
    const timer = setTimeout(() => setIndex((value) => value + 1), (current.duration || 15) * 1000);
    return () => clearTimeout(timer);
  }, [current?.id, index]);

  // Count each marketplace ad that actually starts on screen (not under an urgent takeover or blank).
  useEffect(() => {
    if (!current?.ad || !current.booking_id || urgent || blank) return;
    try {
      const plays = JSON.parse(localStorage.getItem('bw_ad_plays') || '{}');
      plays[current.booking_id] = (plays[current.booking_id] || 0) + 1;
      localStorage.setItem('bw_ad_plays', JSON.stringify(plays));
    } catch (e) { /* storage unavailable */ }
  }, [current?.id, index]); // eslint-disable-line

  // Heartbeat every 60s (also delivers counted ad plays; kept on the device if offline).
  useEffect(() => {
    const send = async () => {
      let plays = {};
      try { plays = JSON.parse(localStorage.getItem('bw_ad_plays') || '{}'); } catch (e) { plays = {}; }
      try {
        const item = currentRef.current;
        await base44.functions.invoke('playerHeartbeat', {
          ad_plays: plays,
          device_token: token,
          current_item: manifestRef.current?.urgent ? `Urgent: ${manifestRef.current.urgent.text_en}`
            : item ? (item.kind === 'menu' ? `Menu: ${item.menu?.name || ''}` : item.type === 'video' ? 'Video' : 'Image') : 'House slide',
          uptime_seconds: Math.floor((Date.now() - startedAt.current) / 1000),
          player_version: 'bw-player-1.1',
        });
        // Remove only what was sent; plays counted meanwhile stay.
        try {
          const now = JSON.parse(localStorage.getItem('bw_ad_plays') || '{}');
          Object.keys(plays).forEach((k) => { now[k] = (now[k] || 0) - plays[k]; if (now[k] <= 0) delete now[k]; });
          localStorage.setItem('bw_ad_plays', JSON.stringify(now));
        } catch (e) { /* ignore */ }
      } catch (e) {
        if (e?.response?.status === 409) onMoved();
      }
    };
    send();
    const id = setInterval(send, 60000);
    return () => clearInterval(id);
  }, [token, onMoved]);

  // Poll for commands every 15s.
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await base44.functions.invoke('playerCommand', { device_token: token });
        const command = res.data?.command;
        if (!command || command === lastCommand.current) return;
        lastCommand.current = command;
        localStorage.setItem('bw_last_command', command);
        const action = command.split(':')[0];
        if (action === 'restart') {
          setIndex(0);
          setBlank(false);
          load();
        } else if (action === 'refresh') {
          load();
        } else if (action === 'blank') {
          setBlank(true);
        } else if (action === 'unblank') {
          setBlank(false);
        } else if (action === 'takeover') {
          setBlank(false);
          load();
        }
      } catch (e) {
        if (e?.response?.status === 409) onMoved();
      }
    }, 15000);
    return () => clearInterval(id);
  }, [token, load, onMoved]);

  // Snapshot every 5 minutes.
  const capture = useCallback(async () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#141E3E';
      ctx.fillRect(0, 0, 640, 360);

      const item = currentRef.current;
      if (item && item.type === 'image') {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = reject;
          image.src = displayRef.current || item.url;
        });
        const scale = Math.min(640 / image.width, 360 / image.height);
        const width = image.width * scale;
        const height = image.height * scale;
        ctx.drawImage(image, (640 - width) / 2, (360 - height) / 2, width, height);
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 26px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(manifestRef.current?.screen?.name || 'Beyond Walls', 320, 195);
      }

      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      await base44.functions.invoke('playerSnapshot', { device_token: token, image: dataUrl });
    } catch (e) {
      // Snapshot is best effort.
    }
  }, [token]);

  useEffect(() => {
    const first = setTimeout(capture, 30000);
    const id = setInterval(capture, 5 * 60 * 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [capture]);

  const house = manifest?.house || { title: 'Advertise here', subtitle: 'beyondwalls.linkzoneglobal.com' };
  const fit = FIT_CLASS[manifest?.screen?.display_mode] || 'object-contain';

  if (blank) {
    return <div className="fixed inset-0 bg-black" />;
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {urgent && <UrgentOverlay message={urgent} />}
      {!urgent && manifest?.qr && (
        <div className="absolute z-40 flex items-center gap-[1vw] rounded-[1.2vw] bg-white/95 p-[0.8vw] shadow-2xl" style={QR_POS[manifest.qr.position] || QR_POS.bottom_right}>
          <QRCodeSVG value={`${window.location.origin}/q/${manifest.qr.id}?s=${manifest.screen?.id || ''}`} size={Math.round(window.innerHeight * 0.14)} />
          {manifest.qr.label && <span className="max-w-[14vw] text-[1.6vw] font-bold leading-tight text-[#111027]">{manifest.qr.label}<span className="block text-[1vw] font-medium text-[#6B6787]">Scan with your camera</span></span>}
        </div>
      )}
      {current ? (
        current.kind === 'menu' ? (
          <div className="w-full" style={{ maxWidth: 'calc(100vh * 16 / 9)' }}>
            <MenuBoardView board={current.menu} />
          </div>
        ) : current.type === 'video' ? (
          <video
            key={`${current.id}-${displayUrl}`}
            src={displayUrl || current.url}
            className="max-h-full max-w-full"
            autoPlay
            muted
            playsInline
            onEnded={() => setIndex((value) => value + 1)}
          />
        ) : displayUrl ? (
          <img key={displayUrl} src={displayUrl} alt="" className={`h-full w-full ${fit}`} />
        ) : (
          <div className="h-full w-full bg-black" />
        )
      ) : (
        <div className="absolute inset-0 bg-bw-navy flex flex-col items-center justify-center text-center px-8">
          <div className="absolute inset-0 bg-gradient-to-br from-bw-navy via-bw-navy to-bw-coral/40" />
          <div className="relative z-10">
            <div className="flex justify-center"><BrandTile size={72} dark /></div>
            <p className="mt-6 text-3xl md:text-5xl font-semibold text-white">{house.title}</p>
            <p className="mt-3 text-base md:text-2xl text-bw-coral">{house.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}