import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Global hook or state for PWA Install Prompt
export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    if (isStandalone) {
      setIsInstalled(true);
    }

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) && !(window as any).MSStream;
    setIsIOS(isIosDevice);

    // 3. Listen for beforeinstallprompt event (Chromium browsers: Chrome, Edge, Samsung Internet, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    // 4. Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      setShowIOSInstructions(false);
      console.log('🎉 PWA Gram Seva installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the PWA install prompt');
          setIsInstalled(true);
        } else {
          console.log('User dismissed the PWA install prompt');
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    } else if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      // Fallback for browsers that already installed or don't support beforeinstallprompt directly
      alert('📲 ऐप इंस्टॉल करने के लिए ब्राउज़र के 3 डॉट्स (⋮) मेनू पर क्लिक करें और "Install App" या "Add to Home screen" चुनें।');
    }
  };

  return {
    isInstallable: Boolean(deferredPrompt) || (isIOS && !isInstalled),
    hasPrompt: Boolean(deferredPrompt),
    isInstalled,
    isIOS,
    showIOSInstructions,
    setShowIOSInstructions,
    triggerInstall
  };
}

/**
 * Reusable Header / Inline Install Button
 */
export const InstallButton: React.FC<{
  className?: string;
  variant?: 'header' | 'banner' | 'card' | 'floating';
}> = ({ className = '', variant = 'header' }) => {
  const { isInstalled, isInstallable, triggerInstall, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();

  // If already installed, don't show prompt
  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        id="pwa-install-btn"
        onClick={triggerInstall}
        className={
          className ||
          (variant === 'header'
            ? 'p-1.5 sm:px-2.5 sm:py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md border-2 border-amber-200 flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer animate-pulse'
            : 'w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm rounded-xl shadow-lg border-2 border-amber-300 flex items-center justify-center gap-2 active:scale-98 transition-all')
        }
        title="ग्राम सेवा ऐप अपने फोन में इंस्टॉल करें (Install App)"
      >
        <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" />
        <span className="hidden sm:inline">ऐप इंस्टॉल करें 📲</span>
        <span className="sm:hidden font-black">इंस्टॉल 📲</span>
      </button>

      {/* iOS Safari Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border-2 border-emerald-600 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">iPhone / iPad पर इंस्टॉल करें</h3>
                  <p className="text-xs text-slate-500">Gram Seva PWA</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm font-medium">
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  Safari ब्राउज़र के नीचे स्थित <strong className="text-slate-900">शेयर (Share <Share className="w-4 h-4 inline text-blue-600" />)</strong> बटन दबाएं।
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  नीचे स्क्रॉल करें और <strong className="text-slate-900">'Add to Home Screen' (<PlusSquare className="w-4 h-4 inline text-slate-700" /> होम स्क्रीन पर जोड़ें)</strong> चुनें।
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  ऊपर दाएं कोने में <strong className="text-emerald-700">'Add' (जोड़ें)</strong> पर क्लिक करें।
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
            >
              समझ गया (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * Prominent Smart Install Banner (Appears on top or above categories for mobile/desktop visitors)
 */
export const InstallBanner: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const { isInstalled, triggerInstall, showIOSInstructions, setShowIOSInstructions } = usePWAInstall();
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
    <>
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
              className="p-2 text-emerald-200 hover:text-white hover:bg-emerald-600/50 rounded-xl transition-colors"
              title="बंद करें"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* iOS Safari Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border-2 border-emerald-600 text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-100 p-2 rounded-xl text-emerald-700">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">iPhone / iPad पर इंस्टॉल करें</h3>
                  <p className="text-xs text-slate-500">Gram Seva PWA</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm font-medium">
              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">1</span>
                <div>
                  Safari ब्राउज़र के नीचे स्थित <strong className="text-slate-900">शेयर (Share <Share className="w-4 h-4 inline text-blue-600" />)</strong> बटन दबाएं।
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">2</span>
                <div>
                  नीचे स्क्रॉल करें और <strong className="text-slate-900">'Add to Home Screen' (<PlusSquare className="w-4 h-4 inline text-slate-700" /> होम स्क्रीन पर जोड़ें)</strong> चुनें।
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="bg-emerald-600 text-white font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0 text-xs">3</span>
                <div>
                  ऊपर दाएं कोने में <strong className="text-emerald-700">'Add' (जोड़ें)</strong> पर क्लिक करें।
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition-colors"
            >
              समझ गया (Done)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
