import { useEffect, useState } from 'react';
import AccessingScreen from '@/components/auth/AccessingScreen';

/**
 * After sign-in the page reloads into the portal. This keeps ONE continuous
 * "Accessing your platform" screen across that reload: it picks up where the
 * sign-in page left off (no intro replay), finishes the steps, then fades out.
 */
export default function AccessOverlay() {
  const active = typeof window !== 'undefined' && window.__bwAccess;
  const [step, setStep] = useState(1);
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(!active);

  useEffect(() => {
    if (!active) return undefined;
    const t1 = setTimeout(() => setStep(2), 700);
    const t2 = setTimeout(() => setLeaving(true), 1600);
    const t3 = setTimeout(() => { setGone(true); window.__bwAccess = false; document.documentElement.style.background = ''; }, 2150);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [active]);

  if (gone) return null;
  return <AccessingScreen step={step} intro={false} leaving={leaving} />;
}
