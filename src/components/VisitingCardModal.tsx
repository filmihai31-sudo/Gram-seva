import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import {
  X,
  Download,
  Share2,
  CheckCircle2,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  QrCode,
  Palette,
  Briefcase,
  ExternalLink,
  Award,
  Smartphone
} from 'lucide-react';
import { WorkerService } from '../App';

export type CardTemplateId = 'emerald' | 'royalgold' | 'festiveorange' | 'darkslate' | 'classicred';

interface VisitingCardModalProps {
  worker: WorkerService;
  isOpen: boolean;
  onClose: () => void;
}

export const VisitingCardModal: React.FC<VisitingCardModalProps> = ({ worker, isOpen, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState<CardTemplateId>('emerald');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const shopTitle = worker.shopName || worker.hindiName || worker.name;
  const ownerName = worker.name;
  const phone = worker.phone;
  const village = worker.village || 'ग्राम';
  const district = worker.district || 'जिला';
  const state = worker.state || 'उत्तर प्रदेश';
  const category = worker.customCategory || worker.category || 'सेवा प्रदाता';
  const charges = worker.charges || 'उचित रेट';
  const expYears = worker.experienceYears || 1;

  // Deep link to shop profile URL
  const shopDeepLink = `${window.location.origin}${window.location.pathname}?shop=${worker.id}`;

  // Generate QR Code on mount or worker change
  useEffect(() => {
    if (worker) {
      // QR Code links to shop profile URL or tel link
      const qrPayload = shopDeepLink;
      QRCode.toDataURL(
        qrPayload,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        },
        (err, url) => {
          if (!err && url) {
            setQrCodeDataUrl(url);
          }
        }
      );
    }
  }, [worker, shopDeepLink]);

  if (!isOpen) return null;

  // Handle PNG Image Download via html2canvas
  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setStatusToast('एचडी कार्ड तैयार हो रहा है... 📥');

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // High-DPI crisp export
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false
      });

      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      const cleanFileName = (shopTitle || 'Visiting_Card').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
      link.download = `${cleanFileName}_GramSeva_Card.png`;
      link.href = dataUrl;
      link.click();

      setStatusToast('गैलरी में डाउनलोड हो गया! 🖼️');
    } catch (err) {
      console.error('Card export failed:', err);
      setStatusToast('डाउनलोड में त्रुटि हुई, पुनः प्रयास करें!');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusToast(null), 3500);
    }
  };

  // Handle WhatsApp / Web Share
  const handleShareCard = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);
    setStatusToast('शेयर तैयार हो रहा है... 📲');

    const shareText = `🏪 *${shopTitle}*\n👨‍💼 मालिक: ${ownerName}\n📍 स्थान: ${village}, ${district} (${state})\n📞 संपर्क: ${phone}\n💰 रेट: ${charges}\n\nग्राम सेवा डिजिटल कार्ड देखें व दुकान से जुड़ें: ${shopDeepLink}`;

    try {
      if (navigator.share) {
        // Try sharing generated image file if Web Share supports files
        const canvas = await html2canvas(cardRef.current, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        canvas.toBlob(async (blob) => {
          if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'card.png', { type: 'image/png' })] })) {
            const file = new File([blob], `${shopTitle}_GramSeva.png`, { type: 'image/png' });
            try {
              await navigator.share({
                title: `${shopTitle} - ग्राम सेवा विजिटिंग कार्ड`,
                text: shareText,
                files: [file]
              });
              setStatusToast('सफलतापूर्वक शेयर किया गया! 🚀');
            } catch (err: any) {
              if (err.name !== 'AbortError') {
                openWhatsAppDirect(shareText);
              }
            }
          } else {
            // Web share text fallback
            try {
              await navigator.share({
                title: `${shopTitle} - ग्राम सेवा विजिटिंग कार्ड`,
                text: shareText,
                url: shopDeepLink
              });
              setStatusToast('शेयर कर दिया गया! 🚀');
            } catch (err: any) {
              if (err.name !== 'AbortError') {
                openWhatsAppDirect(shareText);
              }
            }
          }
          setIsGenerating(false);
          setTimeout(() => setStatusToast(null), 3500);
        }, 'image/png');
      } else {
        openWhatsAppDirect(shareText);
        setIsGenerating(false);
        setTimeout(() => setStatusToast(null), 3500);
      }
    } catch (err) {
      openWhatsAppDirect(shareText);
      setIsGenerating(false);
      setTimeout(() => setStatusToast(null), 3500);
    }
  };

  const openWhatsAppDirect = (text: string) => {
    const cleanNum = phone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    setStatusToast('व्हाट्सएप पर शेयर खोल दिया गया! 💬');
  };

  // Theme metadata
  const templates = [
    {
      id: 'emerald' as CardTemplateId,
      name: 'Modern Emerald',
      hindiName: '1. एमरैल्ड ग्रीन (ग्राम सेवा थीम)',
      desc: 'साफ, प्रोफेशनल व भरोसेमंद ग्राम सेवा लुक',
      badgeBg: 'bg-emerald-600 text-white',
      borderAccent: 'border-emerald-500'
    },
    {
      id: 'royalgold' as CardTemplateId,
      name: 'Royal Gold',
      hindiName: '2. रॉयल गोल्ड (रॉयल प्रीमियम लुक)',
      desc: 'गहरा नीला व सुनहरा रॉयल बिजनेस डिजाइन',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      borderAccent: 'border-amber-400'
    },
    {
      id: 'festiveorange' as CardTemplateId,
      name: 'Festive Orange',
      hindiName: '3. देशी ऑरेंज (पारंपरिक / फेस्टिव लुक)',
      desc: 'केसरिया-संतरी भारतीय व्यापार शैली',
      badgeBg: 'bg-orange-600 text-white',
      borderAccent: 'border-orange-500'
    },
    {
      id: 'darkslate' as CardTemplateId,
      name: 'Dark Slate',
      hindiName: '4. डार्क स्लेट (आधुनिक टेक लुक)',
      desc: 'आधुनिक स्लेट ब्लैक व नियोन लुक',
      badgeBg: 'bg-emerald-400 text-slate-950 font-black',
      borderAccent: 'border-emerald-400'
    },
    {
      id: 'classicred' as CardTemplateId,
      name: 'Classic Red',
      hindiName: '5. क्लासिक रेड (रिटेल / जनरल स्टोर)',
      desc: 'लाल व सफेद पारम्परिक दुकान डिजाइन',
      badgeBg: 'bg-red-600 text-white',
      borderAccent: 'border-red-600'
    }
  ];

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl border-2 border-emerald-300 flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl shrink-0">
              <QrCode className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                <span>डिजिटल विजिटिंग कार्ड</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  ऑटो-जनरेटेड
                </span>
              </h3>
              <p className="text-xs text-slate-600 font-semibold">
                {shopTitle} • {village}, {district}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Toast Notification */}
        {statusToast && (
          <div className="bg-slate-900 text-amber-300 px-4 py-2 rounded-2xl text-xs font-black text-center shadow-lg border border-amber-400 animate-bounce flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{statusToast}</span>
          </div>
        )}

        {/* Template Selector Bar */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-700" />
            <span>कार्ड थीम स्टाइल चुनें (Select 1 of 5 Designs):</span>
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplate(tpl.id)}
                className={`px-3 py-2 rounded-2xl text-xs font-black shrink-0 transition-all border flex items-center gap-1.5 ${
                  activeTemplate === tpl.id
                    ? 'bg-emerald-900 text-amber-300 border-amber-400 shadow-md ring-2 ring-emerald-400 scale-98'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{tpl.hindiName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ================= VISITING CARD CANVAS CONTAINER ================= */}
        <div className="bg-slate-100 p-3 sm:p-5 rounded-3xl border border-slate-200 flex justify-center items-center overflow-x-auto">
          
          {/* Card Frame Target for html2canvas */}
          <div
            ref={cardRef}
            className={`w-[340px] sm:w-[420px] rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 border-2 select-none ${
              activeTemplate === 'emerald'
                ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white border-emerald-400'
                : activeTemplate === 'royalgold'
                ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white border-amber-400'
                : activeTemplate === 'festiveorange'
                ? 'bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 text-white border-amber-300'
                : activeTemplate === 'darkslate'
                ? 'bg-slate-950 text-slate-100 border-emerald-400'
                : 'bg-white text-slate-900 border-red-600'
            }`}
          >
            {/* Visual Background Accents */}
            {activeTemplate === 'emerald' && (
              <div className="absolute -right-12 -top-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
            )}
            {activeTemplate === 'royalgold' && (
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />
            )}
            {activeTemplate === 'festiveorange' && (
              <div className="absolute -left-10 -top-10 w-32 h-32 bg-amber-300/20 rounded-full blur-xl pointer-events-none" />
            )}
            {activeTemplate === 'classicred' && (
              <div className="absolute top-0 left-0 right-0 h-14 bg-red-600 pointer-events-none" />
            )}

            {/* TOP CARD HEADER ROW */}
            <div className={`relative z-10 flex items-start justify-between gap-3 ${activeTemplate === 'classicred' ? 'pt-1' : ''}`}>
              <div className="flex-1 min-w-0">
                {/* Gram Seva Verified App Badge */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border shadow-2xs mb-2 bg-emerald-500/20 border-emerald-400 text-emerald-300 backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ग्राम सेवा सत्यापित व्यापार</span>
                </div>

                {/* Business Name */}
                <h2 className={`text-lg sm:text-xl font-black leading-tight tracking-tight ${
                  activeTemplate === 'classicred' ? 'text-white' : activeTemplate === 'royalgold' ? 'text-amber-300' : 'text-white'
                }`}>
                  {shopTitle}
                </h2>

                {/* Category & Experience */}
                <p className={`text-xs font-bold mt-0.5 ${
                  activeTemplate === 'classicred' ? 'text-red-100' : 'text-slate-300'
                }`}>
                  {category} • {expYears} साल का अनुभव
                </p>
              </div>

              {/* Owner Avatar */}
              <img
                src={worker.avatarUrl}
                alt={ownerName}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md shrink-0 bg-white"
              />
            </div>

            {/* CARD MIDDLE BODY ROW */}
            <div className={`relative z-10 my-4 p-3 rounded-2xl flex items-center justify-between gap-3 border ${
              activeTemplate === 'emerald'
                ? 'bg-slate-900/60 border-emerald-500/40 text-slate-100'
                : activeTemplate === 'royalgold'
                ? 'bg-slate-900/80 border-amber-400/40 text-slate-100'
                : activeTemplate === 'festiveorange'
                ? 'bg-amber-950/40 border-amber-300/40 text-white'
                : activeTemplate === 'darkslate'
                ? 'bg-slate-900 border-slate-800 text-slate-200'
                : 'bg-red-50 border-red-200 text-slate-900'
            }`}>
              {/* Owner & Contact Details */}
              <div className="flex-1 min-w-0 flex flex-col gap-1 text-xs">
                <div className="font-extrabold flex items-center gap-1.5">
                  <span className="opacity-70">प्रो०:</span>
                  <span className="font-black text-sm">{ownerName}</span>
                </div>

                <div className="font-bold flex items-center gap-1.5 text-amber-300">
                  <Phone className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="text-xs sm:text-sm font-black tracking-wide">{phone}</span>
                </div>

                <div className="font-semibold flex items-center gap-1.5 opacity-90 text-[11px] truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{village}, {district} ({state})</span>
                </div>

                <div className="inline-flex items-center gap-1 text-[10px] font-black mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20">
                    💰 {charges}
                  </span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center shrink-0 bg-white p-1.5 rounded-2xl shadow-md border border-slate-200">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="QR Code" className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                    QR...
                  </div>
                )}
                <span className="text-[8px] font-black text-slate-800 mt-1 uppercase tracking-tighter">
                  स्कैन करें 📱
                </span>
              </div>
            </div>

            {/* CARD BOTTOM FOOTER */}
            <div className={`relative z-10 flex items-center justify-between text-[10px] font-extrabold border-t pt-2.5 ${
              activeTemplate === 'emerald'
                ? 'border-emerald-500/30 text-emerald-300'
                : activeTemplate === 'royalgold'
                ? 'border-amber-400/30 text-amber-300'
                : activeTemplate === 'festiveorange'
                ? 'border-amber-300/30 text-amber-100'
                : activeTemplate === 'darkslate'
                ? 'border-slate-800 text-emerald-400'
                : 'border-red-200 text-red-700'
            }`}>
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ग्राम सेवा डिजिटल व्यापार नेटवर्क</span>
              </div>
              <span className="font-bold">gramseva.app</span>
            </div>

          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleShareCard}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-emerald-500 disabled:opacity-50"
          >
            <Share2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>📲 WhatsApp पर भेजें (Share)</span>
          </button>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadCard}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-amber-300 font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-slate-700 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-amber-300 shrink-0" />
            <span>📥 कार्ड डाउनलोड करें (PNG)</span>
          </button>
        </div>

        {/* Informational Tip */}
        <p className="text-[11px] text-slate-500 font-bold text-center">
          💡 यह विजिटिंग कार्ड ग्राहक सीधे व्हाट्सएप पर शेयर कर सकते हैं या दुकान के प्रचार के लिए प्रिंट करवा सकते हैं।
        </p>

      </div>
    </div>
  );
};
