'use client';

import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PushPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) return;
    if (Notification.permission === 'default') {
      const dismissed = sessionStorage.getItem('push-prompt-dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 5000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setShowPrompt(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setShowPrompt(false);
    } catch (err) {
      console.error('Push subscription error:', err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('push-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-sky-500/10 flex items-center justify-center shrink-0">
            <Bell className="h-5 w-5 text-sky-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">Enable Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">Get notified about lessons, achievements, and messages.</p>
            <div className="flex gap-2 mt-3">
              <Button
                onClick={handleSubscribe}
                disabled={subscribing}
                size="sm"
                className="bg-sky-500 text-slate-950 font-bold text-xs"
              >
                {subscribing ? 'Enabling...' : 'Enable'}
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
                className="text-slate-400 text-xs"
              >
                Not Now
              </Button>
            </div>
          </div>
          <button onClick={handleDismiss} className="text-slate-600 hover:text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
