import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import {
  X,
  Download,
  Share2,
  Phone,
  MapPin,
  ShieldCheck,
  Sparkles,
  QrCode,
  Palette,
  Award,
  Scale,
  Stethoscope,
  Activity,
  CookingPot,
  Wrench,
  Hammer,
  Sprout,
  GraduationCap,
  BookOpen,
  Scissors,
  Zap,
  Droplet,
  ShoppingCart,
  Store,
  Car,
  Truck,
  HardHat,
  Ruler,
  CheckCircle2,
  Landmark,
  BadgeCheck
} from 'lucide-react';
import { WorkerService } from '../types';
import { getProfessionBadge } from '../utils/professionBadges';

export type CardTemplateId =
  | 'lawyer'
  | 'doctor'
  | 'halwai'
  | 'technician'
  | 'agriculture'
  | 'teacher'
  | 'tailor'
  | 'electrician'
  | 'grocery'
  | 'salon'
  | 'driver'
  | 'construction';

interface VisitingCardModalProps {
  worker: WorkerService;
  isOpen: boolean;
  onClose: () => void;
}

interface TemplateConfig {
  id: CardTemplateId;
  name: string;
  hindiName: string;
  iconEmoji: string;
  categoryKeyword: string;
  cardBg: string;
  textColor: string;
  accentBorder: string;
  headerAccent: string;
  badgeStyle: string;
  phoneColor: string;
  subtextColor: string;
  detailsBg: string;
  detailsBorder: string;
  footerBorder: string;
  footerText: string;
}

export const VisitingCardModal: React.FC<VisitingCardModalProps> = ({ worker, isOpen, onClose }) => {
  const [activeTemplate, setActiveTemplate] = useState<CardTemplateId>('lawyer');
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
  const mapAddress = worker.mapAddress || '';
  const category = worker.customCategory || worker.category || 'सेवा प्रदाता';
  const charges = worker.charges || 'उचित रेट';
  const expYears = worker.experienceYears || 1;
  const professionBadge = getProfessionBadge(worker.category, worker.customCategory);

  // Standard direct deep link for this shop
  const shopDeepLink = `https://gramseva.app/?shopId=${worker.id}`;
  // Local deep link for current preview environment
  const currentAppDeepLink = `${window.location.origin}${window.location.pathname}?shopId=${worker.id}`;

  // 12 Distinct Profession-Specific Templates Configuration
  const templates: TemplateConfig[] = [
    {
      id: 'lawyer',
      name: 'Advocate & Legal',
      hindiName: '1. ⚖️ अधिवक्ता (Lawyer)',
      iconEmoji: '⚖️',
      categoryKeyword: 'lawyer advocate vakeel वकील कचहरी',
      cardBg: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-900',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-amber-100/90',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'doctor',
      name: 'Doctor & Medical',
      hindiName: '2. 🩺 डॉक्टर व क्लीनिक',
      iconEmoji: '🩺',
      categoryKeyword: 'doctor clinic medical health डॉक्टर क्लीनिक वैद्य अस्पताल दवा',
      cardBg: 'bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-teal-400',
      headerAccent: 'text-teal-300',
      badgeStyle: 'bg-teal-400 text-teal-950 border-teal-300',
      phoneColor: 'text-teal-300',
      subtextColor: 'text-teal-100/90',
      detailsBg: 'bg-teal-950/80',
      detailsBorder: 'border-teal-400/40',
      footerBorder: 'border-teal-400/40',
      footerText: 'text-teal-300'
    },
    {
      id: 'halwai',
      name: 'Sweets & Halwai',
      hindiName: '3. 🍯 हलवाई व मिष्ठान',
      iconEmoji: '🍯',
      categoryKeyword: 'halwai sweet cook cater हलवाई मिठाई बावर्ची स्वीट्स मावा रसोई',
      cardBg: 'bg-gradient-to-br from-amber-700 via-orange-700 to-yellow-900',
      textColor: 'text-white',
      accentBorder: 'border-yellow-300',
      headerAccent: 'text-yellow-200',
      badgeStyle: 'bg-yellow-300 text-amber-950 border-yellow-200 font-black',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-yellow-100',
      detailsBg: 'bg-amber-950/80',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-300/40',
      footerText: 'text-yellow-200'
    },
    {
      id: 'technician',
      name: 'Mechanic & Technician',
      hindiName: '4. 🔧 मैकेनिक व तकनीशियन',
      iconEmoji: '🔧',
      categoryKeyword: 'mechanic technician garage motor मैकेनिक गैरेज मोटर मिस्त्री ऑटो',
      cardBg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-blue-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-blue-400/40',
      footerBorder: 'border-blue-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'agriculture',
      name: 'Agriculture & Farm',
      hindiName: '5. 🌾 कृषि व खाद-बीज',
      iconEmoji: '🌾',
      categoryKeyword: 'farmer agriculture kisan tractor seed खाद बीज किसान कृषि बोरिंग हार्वेस्टर',
      cardBg: 'bg-gradient-to-br from-emerald-950 via-green-900 to-yellow-950',
      textColor: 'text-white',
      accentBorder: 'border-lime-400',
      headerAccent: 'text-lime-300',
      badgeStyle: 'bg-lime-400 text-emerald-950 border-lime-300',
      phoneColor: 'text-lime-300',
      subtextColor: 'text-lime-100',
      detailsBg: 'bg-emerald-950/80',
      detailsBorder: 'border-lime-400/40',
      footerBorder: 'border-lime-400/40',
      footerText: 'text-lime-300'
    },
    {
      id: 'teacher',
      name: 'Teacher & Coaching',
      hindiName: '6. 📚 शिक्षक व कोचिंग',
      iconEmoji: '📚',
      categoryKeyword: 'teacher coaching school tuition tutor शिक्षक अध्यापक कोचिंग ट्यूशन स्कूल',
      cardBg: 'bg-gradient-to-br from-indigo-950 via-blue-900 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-indigo-300',
      headerAccent: 'text-indigo-200',
      badgeStyle: 'bg-indigo-300 text-indigo-950 border-indigo-200',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-indigo-100',
      detailsBg: 'bg-indigo-950/80',
      detailsBorder: 'border-indigo-300/40',
      footerBorder: 'border-indigo-300/40',
      footerText: 'text-indigo-200'
    },
    {
      id: 'tailor',
      name: 'Tailor & Boutique',
      hindiName: '7. ✂️ दर्जी व बुटीक',
      iconEmoji: '✂️',
      categoryKeyword: 'tailor boutique cloth fashion silai दर्जी सिलाई बुटीक कपड़ा मैचिंग',
      cardBg: 'bg-gradient-to-br from-fuchsia-950 via-purple-950 to-pink-950',
      textColor: 'text-white',
      accentBorder: 'border-pink-400',
      headerAccent: 'text-pink-300',
      badgeStyle: 'bg-pink-400 text-purple-950 border-pink-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-pink-100',
      detailsBg: 'bg-purple-950/80',
      detailsBorder: 'border-pink-400/40',
      footerBorder: 'border-pink-400/40',
      footerText: 'text-pink-300'
    },
    {
      id: 'electrician',
      name: 'Electrician & Solar',
      hindiName: '8. ⚡ इलेक्ट्रीशियन व प्लंबर',
      iconEmoji: '⚡',
      categoryKeyword: 'electrician plumber solar wiring light इलेक्ट्रीशियन प्लंबर वायरिंग सोलर बिजली',
      cardBg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950',
      textColor: 'text-white',
      accentBorder: 'border-cyan-400',
      headerAccent: 'text-cyan-300',
      badgeStyle: 'bg-cyan-400 text-slate-950 border-cyan-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-cyan-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-cyan-400/40',
      footerBorder: 'border-cyan-400/40',
      footerText: 'text-cyan-300'
    },
    {
      id: 'grocery',
      name: 'Kirana & General Store',
      hindiName: '9. 🛒 किराना व जनरल स्टोर',
      iconEmoji: '🛒',
      categoryKeyword: 'kirana grocery general store shop किराना जनरल स्टोर दुकान राशन प्रोविजन',
      cardBg: 'bg-gradient-to-br from-red-950 via-rose-900 to-amber-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-red-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-rose-100',
      detailsBg: 'bg-red-950/80',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'salon',
      name: 'Salon & Beauty Parlour',
      hindiName: '10. 💇 सैलून व ब्यूटी पार्लर',
      iconEmoji: '💇',
      categoryKeyword: 'salon beauty parlour makeup barber hair सैलून ब्यूटी पार्लर कटिंग मेकअप नाई',
      cardBg: 'bg-gradient-to-br from-rose-950 via-pink-900 to-purple-950',
      textColor: 'text-white',
      accentBorder: 'border-rose-300',
      headerAccent: 'text-rose-200',
      badgeStyle: 'bg-rose-300 text-rose-950 border-rose-200',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-rose-100',
      detailsBg: 'bg-rose-950/80',
      detailsBorder: 'border-rose-300/40',
      footerBorder: 'border-rose-300/40',
      footerText: 'text-rose-200'
    },
    {
      id: 'driver',
      name: 'Driver & Transport',
      hindiName: '11. 🚗 ड्राइवर व ट्रांसपोर्ट',
      iconEmoji: '🚗',
      categoryKeyword: 'driver transport auto taxi cab vehicle गाड़ी ड्राइवर ऑटो टैक्सी पिकअप लोडर',
      cardBg: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-neutral-900',
      textColor: 'text-white',
      accentBorder: 'border-yellow-400',
      headerAccent: 'text-yellow-300',
      badgeStyle: 'bg-yellow-400 text-zinc-950 border-yellow-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-zinc-200',
      detailsBg: 'bg-zinc-900/90',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-400/40',
      footerText: 'text-yellow-300'
    },
    {
      id: 'construction',
      name: 'Mason & Construction',
      hindiName: '12. 🏗️ राजमिस्त्री व निर्माण',
      iconEmoji: '🏗️',
      categoryKeyword: 'mason construction carpenter paint contractor राजमिस्त्री बढ़ई पेंटर ठेकेदार सरिया सीमेंट',
      cardBg: 'bg-gradient-to-br from-amber-950 via-stone-900 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-orange-400',
      headerAccent: 'text-orange-300',
      badgeStyle: 'bg-orange-400 text-stone-950 border-orange-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-stone-200',
      detailsBg: 'bg-stone-900/90',
      detailsBorder: 'border-orange-400/40',
      footerBorder: 'border-orange-400/40',
      footerText: 'text-orange-300'
    }
  ];

  // Auto-detect template based on category on open
  useEffect(() => {
    if (worker) {
      const combined = `${worker.category || ''} ${worker.customCategory || ''}`.toLowerCase();
      const matched = templates.find((t) => {
        const keywords = t.categoryKeyword.split(' ');
        return keywords.some((k) => k.length > 2 && combined.includes(k.toLowerCase()));
      });

      if (matched) {
        setActiveTemplate(matched.id);
      } else {
        setActiveTemplate('lawyer');
      }
    }
  }, [worker]);

  // Generate QR Code with shop deep link
  useEffect(() => {
    if (worker) {
      // Use standard deep link payload
      const qrPayload = shopDeepLink;
      QRCode.toDataURL(
        qrPayload,
        {
          width: 240,
          margin: 1,
          color: {
            dark: '#020617',
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

  const currentTheme = templates.find((t) => t.id === activeTemplate) || templates[0];

  // ==================== 1. HIGH-QUALITY PNG CARD DOWNLOAD ====================
  const handleDownloadCard = async () => {
    const cardElement = document.getElementById('visiting-card-container') || cardRef.current;
    if (!cardElement) return;

    setIsGenerating(true);
    setStatusToast('एचडी कार्ड तैयार हो रहा है... 📥');

    try {
      // High-resolution clean render using html2canvas targeting only #visiting-card-container
      const canvas = await html2canvas(cardElement, {
        scale: 3, // Crisp 3x Retina DPI export for photo gallery & prints
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
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusToast('गैलरी में सफलतापूर्वक डाउनलोड हो गया! 🖼️');
    } catch (err) {
      console.error('Card export failed:', err);
      setStatusToast('डाउनलोड में त्रुटि हुई, पुनः प्रयास करें!');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setStatusToast(null), 3500);
    }
  };

  // ==================== 2. WHATSAPP SHARING WITH DIRECT DEEP LINK ====================
  const handleShareCard = async () => {
    const cardElement = document.getElementById('visiting-card-container') || cardRef.current;
    if (!cardElement) return;

    setIsGenerating(true);
    setStatusToast('व्हाट्सएप शेयर तैयार हो रहा है... 📲');

    const addressText = `${village}, ${district} (${state})${mapAddress ? ` - ${mapAddress}` : ''}`;
    
    // Complete, high-converting WhatsApp Payload with direct deep link
    const shareText = `🏪 *${shopTitle}*\n👨‍💼 प्रोपराइटर: *${ownerName}*\n💼 श्रेणी: *${professionBadge.hindiTitle || category}*\n📍 पता: *${addressText}*\n📞 फोन/संपर्क: *${phone}*\n💰 सेवा शुल्क/रेट: *${charges}*\n\n✨ *ग्राम सेवा ऐप पर पूरी दुकान की प्रोफाइल देखें व संपर्क करें:*\n👉 ${shopDeepLink}`;

    try {
      if (navigator.share) {
        const canvas = await html2canvas(cardElement, {
          scale: 2,
          useCORS: true,
          logging: false
        });

        canvas.toBlob(async (blob) => {
          if (
            blob &&
            navigator.canShare &&
            navigator.canShare({ files: [new File([blob], 'card.png', { type: 'image/png' })] })
          ) {
            const file = new File([blob], `${shopTitle}_GramSeva_Card.png`, { type: 'image/png' });
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
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
    setStatusToast('व्हाट्सएप चैट खुल गई! 💬');
  };

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
              <p className="text-xs text-slate-600 font-semibold truncate max-w-[240px] sm:max-w-md">
                {shopTitle} • {village}, {district}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
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

        {/* ==================== 4. 12 THEME SELECTOR ==================== */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-700" />
              <span>विजिटिंग कार्ड थीम चुनें (12 स्पेशल डिजाइन):</span>
            </label>
            <span className="text-[10px] font-bold text-slate-500">
              चयनित: {currentTheme.name}
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplate(tpl.id)}
                className={`px-3 py-2 rounded-2xl text-xs font-black shrink-0 transition-all border flex items-center gap-1.5 cursor-pointer ${
                  activeTemplate === tpl.id
                    ? 'bg-slate-950 text-amber-300 border-amber-400 shadow-md ring-2 ring-emerald-400 scale-95'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span>{tpl.hindiName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ==================== CARD CONTAINER TARGET FOR HTML2CANVAS ==================== */}
        <div className="bg-slate-100 p-3 sm:p-5 rounded-3xl border border-slate-200 flex justify-center items-center overflow-x-auto">
          
          {/* Card Frame Target strictly with ID="visiting-card-container" */}
          <div
            id="visiting-card-container"
            ref={cardRef}
            className={`w-[340px] sm:w-[420px] rounded-3xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 border-3 select-none ${currentTheme.cardBg} ${currentTheme.textColor} ${currentTheme.accentBorder}`}
          >
            {/* Background Aesthetic Watermark & Motifs */}
            <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-20 bg-amber-300 pointer-events-none" />
            <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full blur-2xl opacity-15 bg-emerald-400 pointer-events-none" />

            {/* Profession Specific Graphic Overlays */}
            {activeTemplate === 'lawyer' && (
              <div className="absolute right-4 top-14 opacity-10 pointer-events-none">
                <Scale className="w-28 h-28 text-amber-300" />
              </div>
            )}
            {activeTemplate === 'doctor' && (
              <div className="absolute right-2 top-14 opacity-10 pointer-events-none">
                <HeartPulse className="w-28 h-28 text-teal-300" />
              </div>
            )}
            {activeTemplate === 'halwai' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <CookingPot className="w-28 h-28 text-yellow-300" />
              </div>
            )}
            {activeTemplate === 'technician' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Wrench className="w-28 h-28 text-amber-300" />
              </div>
            )}
            {activeTemplate === 'agriculture' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Sprout className="w-28 h-28 text-lime-300" />
              </div>
            )}
            {activeTemplate === 'teacher' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <GraduationCap className="w-28 h-28 text-indigo-300" />
              </div>
            )}
            {activeTemplate === 'tailor' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Scissors className="w-28 h-28 text-pink-300" />
              </div>
            )}
            {activeTemplate === 'electrician' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Zap className="w-28 h-28 text-cyan-300" />
              </div>
            )}
            {activeTemplate === 'grocery' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Store className="w-28 h-28 text-amber-300" />
              </div>
            )}
            {activeTemplate === 'salon' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Sparkles className="w-28 h-28 text-rose-300" />
              </div>
            )}
            {activeTemplate === 'driver' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Truck className="w-28 h-28 text-yellow-300" />
              </div>
            )}
            {activeTemplate === 'construction' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <HardHat className="w-28 h-28 text-orange-300" />
              </div>
            )}

            {/* TOP CARD HEADER */}
            <div className="relative z-10 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                {/* Gram Seva Verified Badge */}
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wide border shadow-2xs mb-1.5 bg-emerald-500/20 border-emerald-400 text-emerald-300 backdrop-blur-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>ग्राम सेवा सत्यापित व्यापार</span>
                </div>

                {/* Business / Shop Name */}
                <h2 className={`text-lg sm:text-xl font-black leading-tight tracking-tight ${currentTheme.headerAccent}`}>
                  {shopTitle}
                </h2>

                {/* Category & Badge */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${currentTheme.badgeStyle}`}>
                    <span>{professionBadge.iconEmoji || currentTheme.iconEmoji}</span>
                    <span className="truncate max-w-[180px]">
                      {professionBadge.hindiTitle ? professionBadge.hindiTitle.replace(/^[^\s]+\s/, '') : category}
                    </span>
                  </span>
                  <span className="text-[11px] font-bold opacity-80">
                    • {expYears} वर्ष अनुभव
                  </span>
                </div>
              </div>

              {/* Owner Avatar Photo */}
              <div className="relative shrink-0">
                <img
                  src={worker.avatarUrl}
                  alt={ownerName}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md bg-white"
                />
                <div className="absolute -bottom-1.5 -right-1.5 p-1 bg-amber-400 text-slate-950 rounded-full shadow-xs border border-white">
                  <BadgeCheck className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* ==================== CARD BODY: OWNER, CONTACT, QR CODE ==================== */}
            <div className={`relative z-10 my-3 p-3.5 rounded-2xl flex items-center justify-between gap-3 border shadow-sm ${currentTheme.detailsBg} ${currentTheme.detailsBorder}`}>
              
              {/* Owner Name & High Contrast Contact */}
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                
                {/* Owner Name */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs opacity-75 font-bold">मालिक:</span>
                  <span className="text-sm sm:text-base font-black text-white tracking-wide">
                    {ownerName}
                  </span>
                </div>

                {/* High Contrast Phone Number */}
                <div className="flex items-center gap-1.5">
                  <div className="p-1 bg-amber-400/20 text-amber-300 rounded-lg shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm sm:text-base font-black tracking-wider font-mono ${currentTheme.phoneColor}`}>
                    {phone}
                  </span>
                </div>

                {/* Charges / Rates Badge */}
                <div className="inline-flex items-center gap-1 text-[10px] font-black mt-0.5">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/20 text-white font-bold">
                    💰 रेट: {charges}
                  </span>
                </div>

              </div>

              {/* ==================== 5. QR CODE DEEP LINKING ==================== */}
              <div className="flex flex-col items-center shrink-0 bg-white p-1.5 rounded-2xl shadow-md border-2 border-slate-200">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Shop QR Code"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-[10px] text-slate-400">
                    QR...
                  </div>
                )}
                <span className="text-[8px] font-black text-slate-900 mt-1 uppercase tracking-tighter text-center leading-tight">
                  स्कैन करें 📱<br />दुकान खोलें
                </span>
              </div>

            </div>

            {/* ==================== 3. FULL ADDRESS (NO TRUNCATION) ==================== */}
            <div className="relative z-10 mb-3 px-2 py-1.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1 text-[11px] font-bold leading-snug whitespace-normal break-words text-slate-100">
                <span className="text-amber-300 font-black">पूरा पता: </span>
                <span>गाँव {village}, जिला {district} ({state})</span>
                {mapAddress && (
                  <span className="block text-[10px] text-slate-300 font-normal mt-0.5">
                    📍 लैंडमार्क / गली: {mapAddress}
                  </span>
                )}
              </div>
            </div>

            {/* CARD BOTTOM FOOTER WITH APP DIRECT DEEP LINK */}
            <div className={`relative z-10 flex items-center justify-between text-[10px] font-extrabold border-t pt-2.5 ${currentTheme.footerBorder} ${currentTheme.footerText}`}>
              <div className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>ग्राम सेवा डिजिटल व्यापार नेटवर्क</span>
              </div>
              <span className="font-mono font-bold tracking-tight">gramseva.app</span>
            </div>

          </div>

        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          
          {/* WhatsApp Share Button */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleShareCard}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-emerald-500 disabled:opacity-50 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>📲 WhatsApp पर भेजें (Share Link)</span>
          </button>

          {/* Download Card Button targeting ONLY #visiting-card-container */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleDownloadCard}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-98 text-amber-300 font-black text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all border border-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300 shrink-0" />
            <span>📥 कार्ड डाउनलोड करें (PNG)</span>
          </button>

        </div>

        {/* Informational Tip */}
        <p className="text-[11px] text-slate-500 font-bold text-center">
          💡 यह विजिटिंग कार्ड ग्राहक सीधे व्हाट्सएप पर शेयर कर सकते हैं या दुकान के प्रचार के लिए प्रिंट करवा सकते हैं। क्यूआर कोड स्कैन करने पर यह दुकान सीधे ऐप में खुलेगी।
        </p>

      </div>
    </div>
  );
};

// Supporting Icon helper
function HeartPulse(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
    </svg>
  );
}
