import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '@/lib/i18n';
import PlayerPairing from '@/components/player/PlayerPairing';
import PlayerRunner from '@/components/player/PlayerRunner';

const DEVICE_KEY = 'bw_device_id';
const TOKEN_KEY = 'bw_device_token';

function readDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(DEVICE_KEY, id);
    }
    return id;
  } catch (e) {
    return crypto.randomUUID();
  }
}

export default function Player() {
  const { t } = useI18n();
  const [deviceId] = useState(readDeviceId);
  const [phase, setPhase] = useState('init');
  const [code, setCode] = useState('');
  const [token, setToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  useEffect(() => {
    let alive = true;

    const stored = (() => {
      try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; }
    })();

    if (stored) {
      setToken(stored);
      setPhase('playing');
      return () => { alive = false; };
    }

    (async () => {
      try {
        const res = await base44.functions.invoke('playerRegister', { device_id: deviceId });
        if (!alive) return;
        const data = res.data || {};
        if (data.status === 'claimed' && data.device_token) {
          try { localStorage.setItem(TOKEN_KEY, data.device_token); } catch (e) { /* storage unavailable */ }
          setToken(data.device_token);
          setPhase('playing');
        } else if (data.status === 'replaced') {
          setPhase('moved');
        } else {
          setCode(data.code || '');
          setPhase('pairing');
        }
      } catch (e) {
        if (alive) setPhase('pairing');
      }
    })();

    return () => { alive = false; };
  }, [deviceId, resetKey]);

  useEffect(() => {
    if (phase !== 'pairing') return undefined;
    const id = setInterval(async () => {
      try {
        const res = await base44.functions.invoke('playerRegister', { device_id: deviceId });
        const data = res.data || {};
        if (data.status === 'claimed' && data.device_token) {
          try { localStorage.setItem(TOKEN_KEY, data.device_token); } catch (e) { /* storage unavailable */ }
          setToken(data.device_token);
          setPhase('playing');
        } else if (data.status === 'replaced') {
          setPhase('moved');
        }
      } catch (e) {
        // Keep polling; the TV may be offline for a moment.
      }
    }, 5000);
    return () => clearInterval(id);
  }, [phase, deviceId]);

  const handleMoved = useCallback(() => {
    try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* storage unavailable */ }
    setToken(null);
    setPhase('moved');
  }, []);

  const enterCode = async (value) => {
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('playerPair', { device_id: deviceId, code: value });
      if (res.data?.device_token) {
        try { localStorage.setItem(TOKEN_KEY, res.data.device_token); } catch (e) { /* storage unavailable */ }
        setToken(res.data.device_token);
        setPhase('playing');
      } else {
        setError('Code not found');
      }
    } catch (e) {
      setError(e?.response?.data?.error || 'Code not found');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'playing' && token) {
    return <PlayerRunner token={token} onMoved={handleMoved} />;
  }

  if (phase === 'moved') {
    return (
      <div className="fixed inset-0 bg-bw-navy text-white flex flex-col items-center justify-center px-6 text-center">
        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
          <span className="h-3.5 w-3.5 rounded-sm bg-bw-coral" />
        </div>
        <h1 className="mt-6 text-xl md:text-2xl font-semibold max-w-md">{t('player.movedTitle')}</h1>
        <p className="mt-2 text-sm text-white/60 max-w-sm">{t('player.movedBody')}</p>
        <button
          type="button"
          onClick={async () => {
            setError('');
            setCode('');
            try {
              await base44.functions.invoke('playerRegister', { device_id: deviceId, reset: true });
            } catch (e) {
              // Registration is retried by the boot effect below.
            }
            setPhase('init');
            setResetKey((value) => value + 1);
          }}
          className="mt-6 rounded-xl bg-bw-coral px-5 py-3 text-sm font-semibold text-white"
        >
          {t('player.setUpAgain')}
        </button>
      </div>
    );
  }

  if (phase === 'pairing') {
    return <PlayerPairing code={code} onSubmit={enterCode} busy={busy} error={error} />;
  }

  return (
    <div className="fixed inset-0 bg-bw-navy flex items-center justify-center">
      <div className="flex items-center gap-1.5">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="h-2 w-2 rounded-full bg-white/40 animate-pulse"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}