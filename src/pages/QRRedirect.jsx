import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/** Public landing for screen QR codes: count the scan, then forward. */
export default function QRRedirect() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    base44.functions.invoke('qrScan', { id, s: params.get('s') || '' })
      .then((res) => {
        if (!alive) return;
        if (res.data?.url) window.location.replace(res.data.url);
        else setFailed(true);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [id, params]);

  return (
    <div className="min-h-screen bg-bw-cream flex items-center justify-center p-6 text-center">
      {failed ? (
        <div>
          <p className="text-lg font-bold text-bw-navy">This offer has ended</p>
          <p className="mt-1 text-sm text-bw-muted">Ask the staff for the latest deals.</p>
        </div>
      ) : (
        <div className="w-64 space-y-3">
          <div className="bw-shimmer h-6 w-40 mx-auto rounded-lg" />
          <div className="bw-shimmer h-4 w-56 mx-auto rounded-lg" />
        </div>
      )}
    </div>
  );
}
