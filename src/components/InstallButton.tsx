import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global reference for native prompt event
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Allow listening across components
const listeners = new Set<() => void>();
function notifyListeners() {
  listeners.forEach((cb) => cb());
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    notifyListeners();
    console.log('🎉 Gram Seva PWA installed successfully!');
  });
}

export function usePWAInstall() {
  const [hasPrompt, setHasPrompt] = useState<boolean>(Boolean(deferredPrompt));
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    const update = () => {
      setHasPrompt(Boolean(deferredPrompt));
    };

    listeners.add(update);

    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      if (standalone) {
        setIsInstalled(true);
        deferredPrompt = null;
        setHasPrompt(false);
      }
    };

    checkStandalone();

    return () => {
      listeners.delete(update);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('PWA install prompt error:', err);
      } finally {
        deferredPrompt = null;
        setHasPrompt(false);
        notifyListeners();
      }
    }
  };

  return {
    isInstalled,
    hasPrompt,
    triggerInstall
  };
}

/**
 * Reusable Header / Inline Install Button
 * Directly triggers deferredPrompt.prompt() with zero alerts or manual modal pop-ups
 */
export const InstallButton: React.FC<{
  className?: string;
  variant?: 'header' | 'banner' | 'card' | 'floating';
}> = ({ className = '', variant = 'header' }) => {
  const { isInstalled, triggerInstall } = usePWAInstall();

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  return (
    <button
      id="pwa-install-header-btn"
      onClick={triggerInstall}
      className={
        className ||
        (variant === 'header'
          ? 'px-2.5 py-1.5 sm:px-3 sm:py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs rounded-xl shadow-md border-2 border-emerald-400 flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer'
          : 'w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-lg border-2 border-emerald-400 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer')
      }
      title="ग्राम सेवा ऐप इंस्टॉल करें (Install App)"
    >
      <Download className="w-3.5 h-3.5 text-white stroke-[3]" />
      <span className="hidden sm:inline">ऐप इंस्टॉल करें 📲</span>
      <span className="sm:hidden font-black">इंस्टॉल 📲</span>
    </button>
  );
};

/**
 * Smart Install Banner
 * Stays visible until installed, triggers native browser prompt directly
 */
export const InstallBanner: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const { isInstalled, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('gramseva_pwa_banner_dismissed') === 'true';
  });

  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('gramseva_pwa_banner_dismissed', 'true');
    if (onDismiss) onDismiss();
  };

  return (
    <div
      id="pwa-install-banner"
      className="w-full max-w-3xl mx-auto px-2 sm:px-4 my-2"
    >
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white p-3 sm:p-3.5 rounded-2xl shadow-lg border-2 border-emerald-500/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 relative overflow-hidden">
        {/* Background tractor accent */}
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-8xl">
          🚜
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img
            src="/pwa-192.png"
            alt="Gram Seva App Icon"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl shadow-md border-2 border-white bg-white p-0.5 shrink-0"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h4 className="font-black text-sm sm:text-base text-amber-300 tracking-wide">
                ग्राम सेवा ऐप इंस्टॉल करें
              </h4>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-1.5 py-0.5 rounded-full uppercase">
                Fast App
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium line-clamp-1">
              बिना इंटरनेट भी सभी मिस्त्री व दुकानों के नंबर तुरंत पाएं!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            id="pwa-banner-install-btn"
            onClick={triggerInstall}
            className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md border border-emerald-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>अभी इंस्टॉल करें 📲</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-xl transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
