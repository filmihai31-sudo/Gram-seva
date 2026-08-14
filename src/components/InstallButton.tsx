import React, { useState, useEffect } from 'react';
import {
  Download,
  Smartphone,
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Share2,
  MoreVertical,
  Layers,
  ArrowRight
} from 'lucide-react';

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
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

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

  const isIframe = typeof window !== 'undefined' && window.self !== window.top;

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
    } else {
      // If deferred prompt is not available (e.g. inside iframe or browser restrictions), open guide modal
      setShowGuideModal(true);
    }
  };

  const copyAppUrl = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const openInBrowserDirectly = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank');
    }
  };

  return {
    isInstalled,
    hasPrompt,
    isIframe,
    showGuideModal,
    setShowGuideModal,
    copiedLink,
    copyAppUrl,
    openInBrowserDirectly,
    triggerInstall
  };
}

/**
 * Universal Install Guide Modal
 * Guides user on Android Chrome, iPhone Safari & iframe preview
 */
export const PWAInstallGuideModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { isIframe, copiedLink, copyAppUrl, openInBrowserDirectly } = usePWAInstall();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-emerald-500 relative overflow-hidden animate-in zoom-in-95 duration-200 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-slate-900 leading-tight">
                ऐप फोन में इंस्टॉल करें
              </h3>
              <p className="text-xs text-emerald-700 font-bold">ग्राम सेवा (Gram Seva PWA)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 text-sm">
          {isIframe ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-start gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <h4 className="font-black text-amber-900 text-xs sm:text-sm">
                    आप प्रीव्यू मोड (Iframe) में हैं
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    ब्राउज़र सुरक्षा के कारण प्रीव्यू विंडो से सीधे ऐप इंस्टॉल नहीं होती। इसे असली Chrome ब्राउज़र टैब में खोलें:
                  </p>
                </div>
              </div>
              <button
                onClick={openInBrowserDirectly}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Chrome में खोलें और इंस्टॉल करें</span>
              </button>
            </div>
          ) : null}

          {/* Android Chrome Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900 text-xs sm:text-sm">
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>Android (Google Chrome में इंस्टॉल कैसे करें):</span>
            </div>
            <ol className="text-xs space-y-1.5 text-slate-600 list-decimal list-inside font-medium">
              <li>
                Chrome में ऊपर दाईं तरफ <strong className="text-slate-900">⋮ (3 डॉट्स)</strong> पर टैप करें।
              </li>
              <li>
                मेनू में <strong className="text-emerald-700">"Install app"</strong> या <strong className="text-emerald-700">"Add to Home screen"</strong> चुनें।
              </li>
              <li>
                <strong className="text-slate-900">"Install"</strong> बटन दबाएं — ऐप तुरंत आपके फोन में बिना प्ले स्टोर के सेव हो जाएगी।
              </li>
            </ol>
          </div>

          {/* iPhone Safari Instructions */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 font-black text-slate-900 text-xs sm:text-sm">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>iPhone / iOS (Safari ब्राउज़र):</span>
            </div>
            <ol className="text-xs space-y-1.5 text-slate-600 list-decimal list-inside font-medium">
              <li>
                Safari में नीचे <strong className="text-slate-900">Share (⎋)</strong> बटन दबाएं।
              </li>
              <li>
                नीचे स्क्रॉल करके <strong className="text-blue-700">"Add to Home Screen" (+)</strong> पर टैप करें।
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={copyAppUrl}
            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700">लिंक कॉपी हो गया!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>ऐप लिंक कॉपी करें</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xs rounded-xl transition-all"
          >
            समझ गया (OK)
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Header Install Button (always visible in navbar until installed)
 */
export const InstallButton: React.FC<{
  className?: string;
  variant?: 'header' | 'banner' | 'card' | 'floating';
}> = ({ className = '', variant = 'header' }) => {
  const { isInstalled, triggerInstall, showGuideModal, setShowGuideModal } = usePWAInstall();

  // Hide permanently if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
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

      <PWAInstallGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </>
  );
};

/**
 * Sleek Automatic Sliding PWA Bottom-Sheet / Banner
 * Automatically slides into view on load and provides 1-Click "Install Now"
 * Permanently hides once the app is installed.
 */
export const InstallBanner: React.FC<{ onDismiss?: () => void }> = ({ onDismiss }) => {
  const { isInstalled, triggerInstall, showGuideModal, setShowGuideModal } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('gramseva_pwa_bottomsheet_dismissed') === 'true';
    } catch (_) {
      return false;
    }
  });

  // Permanently hidden if installed or dismissed for this session
  if (isInstalled || dismissed) {
    return (
      <PWAInstallGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    );
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('gramseva_pwa_bottomsheet_dismissed', 'true');
    } catch (_) {}
    if (onDismiss) onDismiss();
  };

  return (
    <>
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

      <PWAInstallGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
      />
    </>
  );
};
