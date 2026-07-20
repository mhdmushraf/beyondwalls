import React, { useState, useEffect } from 'react';
import SEOHead from "@/components/SEOHead";
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Copy, Check, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function ScreenPairing() {
  const navigate = useNavigate();
  const [screen, setScreen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const screenId = params.get('screen_id');
    if (!screenId) { navigate('/my-screens'); return; }
    (async () => {
      try {
        const s = await base44.entities.Screen.get(screenId);
        setScreen(s);
      } catch {
        toast.error('Screen not found');
        navigate('/my-screens');
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  const copyCode = () => {
    navigator.clipboard.writeText(screen.setup_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="h-8 w-48 bg-slate-100 rounded animate-pulse mb-6" />
        <div className="h-64 bg-slate-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!screen) return null;
  const playerUrl = `${window.location.origin}/ScreenPlayer?setup_code=${screen.setup_code}&auto_start=true`;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
      <SEOHead noIndex title="ScreenPairing | Beyond Walls" />
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/my-screens')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-heading text-xl sm:text-2xl font-bold text-slate-900">Pair your screen</h1>
          <p className="text-sm text-slate-500">{screen.name}</p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 text-center space-y-4">
        <p className="text-sm font-medium text-slate-500">Your setup code</p>
        <div className="flex items-center justify-center gap-3">
          <code className="text-3xl sm:text-4xl font-mono font-bold tracking-wider text-slate-900 bg-slate-50 px-6 py-3 rounded-xl">
            {screen.setup_code}
          </code>
          <Button variant="outline" size="icon" onClick={copyCode}>
            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-xs text-slate-400">The screen will go live automatically once paired.</p>
      </Card>

      <Card className="p-5 sm:p-6 space-y-4">
        <h2 className="font-heading font-semibold text-slate-900">How to pair</h2>
        <ol className="space-y-3">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">1</span>
            <p className="text-sm text-slate-600">Open the Beyond Walls player on your screen device.</p>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">2</span>
            <p className="text-sm text-slate-600">Enter the setup code above when prompted.</p>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 text-violet-600 text-xs font-bold flex items-center justify-center">3</span>
            <p className="text-sm text-slate-600">The screen will connect and start displaying content automatically.</p>
          </li>
        </ol>
        <a href={playerUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <ExternalLink className="w-4 h-4" />
            Open player on this device
          </Button>
        </a>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/my-screens')} className="flex-1">Back to My Screens</Button>
        <Button onClick={() => navigate('/add-screen')} className="flex-1">Add another screen</Button>
      </div>
    </div>
  );
}