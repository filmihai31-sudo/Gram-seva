import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, Sparkles, CheckCircle2 } from 'lucide-react';

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

// Cross-component listener registry
const listeners = new Set<() => void>();
function notifyListeners() {
  listeners.forEach((cb) => cb());
}

if (typeof window !== 'undefined') {
  // Listen as soon as the app loads
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notifyListeners();
    console.log('⚡ PWA beforeinstallprompt event captured and ready for 1-click install.');
  });

  // Permanently hide once installed
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    try {
      localStorage.setItem('gramseva_pwa_installed', 'true');
    } catch (_) {}
    notifyListeners();
    console.log('🎉 Gram Seva PWA installed successfully!');
  });
}

export function usePWAInstall() {
  const [hasPrompt, setHasPrompt] = useState<boolean>(Boolean(deferredPrompt));
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (localStorage.getItem('gramseva_pwa_installed') === 'true') {
        return true;
      }
    } catch (_) {}
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    const update = () => {
      setHasPrompt(Boolean(deferredPrompt));
      try {
        if (localStorage.getItem('gramseva_pwa_installed') === 'true') {
          setIsInstalled(true);
        }
      } catch (_) {}
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
        try {
          localStorage.setItem('gramseva_pwa_installed', 'true');
        } catch (_) {}
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
          try {
            localStorage.setItem('gramseva_pwa_installed', 'true');
          } catch (_) {}
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
 * Header Install Button (always visible in navbar until installed)
 */
export const InstallButton: React.FC<{
  className?: string;
  variant?: 'header' | 'banner' | 'card' | 'floating';
}> = ({ className = '', variant = 'header' }) => {
  const { isInstalled, triggerInstall } = usePWAInstall();

  // Hide permanently if already installed
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
 * Sleek Automatic Sliding PWA Bottom-Sheet / Banner
 * Automatically slides into view on load and provides 1-Click "Install Now"
 * Permanently hides once the app is installed.
 */
export const InstallBanner: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const { isInstalled, triggerInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gramseva_pwa_bottomsheet_dismissed') === 'true';
    } catch (_) {
      return false;
    }
  });

  // Permanently hidden if installed or dismissed for this session
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('gramseva_pwa_bottomsheet_dismissed', 'true');
    } catch (_) {}
    if (onDismiss) onDismiss();
  };

  return (
    <div
      id="pwa-sliding-bottom-sheet"
      className="fixed bottom-3 sm:bottom-5 left-0 right-0 z-50 px-3 sm:px-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom-6 duration-300 ease-out"
    >
      <div className="w-full max-w-2xl bg-slate-900/95 backdrop-blur-md text-white p-3 sm:p-4 rounded-3xl shadow-2xl border-2 border-emerald-500 pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="बंद करें"
        >
          <X className="w-4 h-4" />
        </button>

        {/* App Icon + Text info */}
        <div className="flex items-center gap-3 w-full sm:w-auto pr-6 sm:pr-0">
          <div className="relative shrink-0">
            <img
              src="/pwa-192.png"
              alt="Gram Seva Logo"
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shadow-lg border-2 border-emerald-400 bg-emerald-600 p-0.5 object-cover"
              onError={(e) => {
                // Fallback emoji if image failed
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-0.5 rounded-full shadow-xs">
              <Sparkles className="w-3 h-3 fill-slate-950" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm sm:text-base text-white tracking-wide truncate">
                ग्राम सेवा ऐप इंस्टॉल करें
              </h4>
              <span className="bg-emerald-600/90 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/50 shrink-0">
                मुफ़्त
              </span>
            </div>
            <p className="text-xs text-emerald-300 font-bold mt-0.5 line-clamp-1">
              तेज़ी से चलाने के लिए फोन में जोड़ें
            </p>
          </div>
        </div>

        {/* Action Button: 1-Click Native Install */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
          <button
            id="pwa-bottom-sheet-install-btn"
            onClick={triggerInstall}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg border-2 border-emerald-400 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>अभी इंस्टॉल करें (Install Now)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
