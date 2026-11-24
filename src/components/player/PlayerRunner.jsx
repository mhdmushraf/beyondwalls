import React, { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';

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
  const [manifest, setManifest] = useState(null);
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
    } catch (e) {
      if (e?.response?.status === 409) onMoved();
    }
  }, [token, onMoved]);

  useEffect(() => {
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  // Resolve (and cache) the current item.
  useEffect(() => {
    let alive = true;
    if (!current) {
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

  // Heartbeat every 60s.
  useEffect(() => {
    const send = async () => {
      try {
        const item = currentRef.current;
        await base44.functions.invoke('playerHeartbeat', {
          device_token: token,
          current_item: item ? (item.type === 'video' ? 'Video' : 'Image') : 'House slide',
          uptime_seconds: Math.floor((Date.now() - startedAt.current) / 1000),
          player_version: 'bw-player-1.0',
        });
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
      {current ? (
        current.type === 'video' ? (
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
            <div className="mx-auto h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
              <span className="h-5 w-5 rounded-md bg-bw-coral" />
            </div>
            <p className="mt-6 text-3xl md:text-5xl font-semibold text-white">{house.title}</p>
            <p className="mt-3 text-base md:text-2xl text-bw-coral">{house.subtitle}</p>
          </div>
        </div>
      )}
    </div>
  );
}