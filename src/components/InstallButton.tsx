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

// Global reference for prompt event
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
  const [promptAvailable, setPromptAvailable] = useState<boolean>(Boolean(deferredPrompt));
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
      setPromptAvailable(Boolean(deferredPrompt));
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
        setPromptAvailable(false);
      }
    };

    checkStandalone();

    return () => {
      listeners.delete(update);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    try {
      // Trigger native browser install dialog directly
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (err) {
      console.error('Install prompt error:', err);
    } finally {
      deferredPrompt = null;
      notifyListeners();
    }
  };

  return {
    isInstallable: promptAvailable && !isInstalled,
    isInstalled,
    triggerInstall
  };
}

/**
 * Reusable Header / Inline Install Button
 * Hidden entirely if deferredPrompt is null or already installed
 */
export const InstallButton: React.FC<{
  className?: string;
  variant?: 'header' | 'banner' | 'card' | 'floating';
}> = ({ className = '', variant = 'header' }) => {
  const { isInstallable, triggerInstall } = usePWAInstall();

  // If prompt is not ready or already installed, hide the button completely
  if (!isInstallable) {
    return null;
  }

  return (
    <button
      id="pwa-install-btn"
      onClick={triggerInstall}
      className={
        className ||
        (variant === 'header'
          ? 'p-1.5 sm:px-2.5 sm:py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md border-2 border-amber-200 flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer animate-pulse'
          : 'w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg border-2 border-amber-300 flex items-center justify-center gap-2 active:scale-98 transition-all')
      }
      title="ग्राम सेवा ऐप इंस्टॉल करें (Install App)"
    >
      <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
      <span className="hidden sm:inline">ऐप इंस्टॉल करें 📲</span>
      <span className="sm:hidden font-black">इंस्टॉल 📲</span>
    </button>
  );
};

/**
 * Prominent Smart Install Banner (Only shown when beforeinstallprompt is ready and not yet installed)
 */
export const InstallBanner: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const { isInstallable, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    return localStorage.getItem('gramseva_pwa_banner_dismissed') === 'true';
  });

  if (!isInstallable || dismissed) {
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
      className="w-full max-w-3xl mx-auto px-2 sm:px-4 my-2.5"
    >
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white p-3 sm:p-4 rounded-2xl shadow-xl border-2 border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none text-9xl">
          🚜
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <img
            src="/pwa-192x192.png"
            alt="Gram Seva App Icon"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-md border-2 border-amber-300 bg-white p-0.5 shrink-0"
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
                मुफ़्त PWA
              </span>
            </div>
            <p className="text-xs text-emerald-100 font-medium line-clamp-1">
              बिना इंटरनेट ऑफलाइन भी मिस्त्री व दुकानों के नंबर पाएं!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            onClick={triggerInstall}
            className="flex-1 sm:flex-none px-4 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-amber-200 flex items-center justify-center gap-1.5 transition-transform cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>अभी इंस्टॉल करें</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-xl transition-colors cursor-pointer"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
