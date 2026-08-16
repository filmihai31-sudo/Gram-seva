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
  BadgeCheck,
  Heart,
  Briefcase,
  Flame,
  Wheat,
  PenTool,
  Clock,
  Compass,
  Building2
} from 'lucide-react';
import { WorkerService } from '../types';
import { getProfessionBadge } from '../utils/professionBadges';

export type ProfessionGroupId =
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
  | 'construction'
  | 'general';

export interface ProfessionThemeConfig {
  id: string;
  groupId: ProfessionGroupId;
  name: string;
  hindiName: string;
  subTitle: string;
  iconEmoji: string;
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

interface VisitingCardModalProps {
  worker: WorkerService;
  isOpen: boolean;
  onClose: () => void;
}

// 1. Detect Profession Group based on worker category and custom category
export function getProfessionGroup(category?: string, customCategory?: string): ProfessionGroupId {
  const text = `${category || ''} ${customCategory || ''}`.toLowerCase();

  if (/lawyer|advocate|vakeel|वकील|अधिवक्ता|कचहरी|कानून|न्यायालय|नोटरी|bar council/i.test(text)) {
    return 'lawyer';
  }
  if (/doctor|clinic|medical|health|hospital|डॉक्टर|क्लीनिक|वैद्य|अस्पताल|दवा|स्वास्थ्य|चिकित्सक|mbbs|bams/i.test(text)) {
    return 'doctor';
  }
  if (/halwai|sweet|cook|cater|mithai|हलवाई|मिठाई|बावर्ची|स्वीट्स|मावा|रसोई|कैटरिंग|खानपान/i.test(text)) {
    return 'halwai';
  }
  if (/mechanic|technician|garage|motor|auto repair|bike|car repair|मैकेनिक|गैरेज|मोटर मिस्त्री|टायर|सर्विसिंग/i.test(text)) {
    return 'technician';
  }
  if (/farmer|agriculture|kisan|tractor|seed|fertilizer|खाद|बीज|किसान|कृषि|बोरिंग|हार्वेस्टर|कीटनाशक|खेत/i.test(text)) {
    return 'agriculture';
  }
  if (/teacher|coaching|school|tuition|tutor|education|शिक्षक|अध्यापक|कोचिंग|ट्यूशन|स्कूल|क्लासेस|शिक्षा/i.test(text)) {
    return 'teacher';
  }
  if (/tailor|boutique|cloth|fashion|silai|matching|दर्जी|सिलाई|बुटीक|कपड़ा|मैचिंग|लेडीज टेलर|सूट/i.test(text)) {
    return 'tailor';
  }
  if (/electrician|plumber|solar|wiring|light|inverter|इलेक्ट्रीशियन|प्लंबर|वायरिंग|सोलर|बिजली|नलसाज|पाइप/i.test(text)) {
    return 'electrician';
  }
  if (/kirana|grocery|general store|shop|ration|provision|किराना|जनरल स्टोर|दुकान|राशन|प्रोविजन|मार्ट|स्टोर/i.test(text)) {
    return 'grocery';
  }
  if (/salon|beauty parlour|makeup|barber|hair|कटिंग|सैलून|ब्यूटी पार्लर|मेकअप|नाई|हेयर ड्रेसर|फेशियल/i.test(text)) {
    return 'salon';
  }
  if (/driver|transport|auto|taxi|cab|vehicle|pickup|गाड़ी|ड्राइवर|ऑटो|टैक्सी|पिकअप|लोडर|ट्रैवल|बस/i.test(text)) {
    return 'driver';
  }
  if (/mason|construction|carpenter|paint|contractor|building|cement|राजमिस्त्री|बढ़ई|पेंटर|ठेकेदार|सरिया|सीमेंट|भवन/i.test(text)) {
    return 'construction';
  }

  return 'general';
}

// 2. Curated Profession-Specific Themes (4 distinct professional variations per profession)
export const ALL_PROFESSION_THEMES: Record<ProfessionGroupId, ProfessionThemeConfig[]> = {
  lawyer: [
    {
      id: 'lawyer-black-gold',
      groupId: 'lawyer',
      name: 'Royal Black & Gold',
      hindiName: '1. ⚖️ रॉयल ब्लैक गोल्ड',
      subTitle: 'बार काउंसिल पंजीकृत',
      iconEmoji: '⚖️',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-950 to-neutral-900',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-amber-100/90',
      detailsBg: 'bg-slate-900/95',
      detailsBorder: 'border-amber-400/50',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'lawyer-highcourt-navy',
      groupId: 'lawyer',
      name: 'Classic High Court Navy',
      hindiName: '2. 🏛️ क्लासिक नेवी लीगल',
      subTitle: 'विधिक सलाहकार व अधिवक्ता',
      iconEmoji: '🏛️',
      cardBg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900',
      textColor: 'text-white',
      accentBorder: 'border-sky-400',
      headerAccent: 'text-sky-300',
      badgeStyle: 'bg-sky-400 text-slate-950 border-sky-300',
      phoneColor: 'text-sky-300',
      subtextColor: 'text-sky-100/90',
      detailsBg: 'bg-blue-950/80',
      detailsBorder: 'border-sky-400/50',
      footerBorder: 'border-sky-400/40',
      footerText: 'text-sky-300'
    },
    {
      id: 'lawyer-supreme-slate',
      groupId: 'lawyer',
      name: 'Supreme Slate Silver',
      hindiName: '3. 📜 सुप्रीम स्लेट सिल्वर',
      subTitle: 'वरिष्ठ अधिवक्ता एवं नोटरी',
      iconEmoji: '📜',
      cardBg: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-stone-900',
      textColor: 'text-white',
      accentBorder: 'border-slate-300',
      headerAccent: 'text-slate-200',
      badgeStyle: 'bg-slate-200 text-slate-950 border-slate-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-slate-200/90',
      detailsBg: 'bg-zinc-900/90',
      detailsBorder: 'border-slate-400/50',
      footerBorder: 'border-slate-400/40',
      footerText: 'text-slate-300'
    },
    {
      id: 'lawyer-executive-wine',
      groupId: 'lawyer',
      name: 'Executive Maroon Wine',
      hindiName: '4. 💼 एग्जीक्यूटिव वाइन',
      subTitle: 'सिविल व क्रिमिनल एक्सपर्ट',
      iconEmoji: '💼',
      cardBg: 'bg-gradient-to-br from-red-950 via-rose-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-red-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-rose-100/90',
      detailsBg: 'bg-red-950/90',
      detailsBorder: 'border-amber-400/50',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    }
  ],
  doctor: [
    {
      id: 'doctor-clinical-teal',
      groupId: 'doctor',
      name: 'Clinical Teal & Emerald',
      hindiName: '1. 🩺 क्लीनिकल टील',
      subTitle: 'प्रमाणित प्राथमिक स्वास्थ्य उपचार',
      iconEmoji: '🩺',
      cardBg: 'bg-gradient-to-br from-teal-950 via-emerald-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-teal-400',
      headerAccent: 'text-teal-300',
      badgeStyle: 'bg-teal-400 text-teal-950 border-teal-300',
      phoneColor: 'text-teal-300',
      subtextColor: 'text-teal-100/90',
      detailsBg: 'bg-teal-950/90',
      detailsBorder: 'border-teal-400/40',
      footerBorder: 'border-teal-400/40',
      footerText: 'text-teal-300'
    },
    {
      id: 'doctor-emergency-red',
      groupId: 'doctor',
      name: 'Emergency Cross Red',
      hindiName: '2. 🚑 इमर्जेंसी केयर रेड',
      subTitle: '24x7 आपातकालीन परामर्श व दवा',
      iconEmoji: '🚑',
      cardBg: 'bg-gradient-to-br from-rose-950 via-red-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-rose-400',
      headerAccent: 'text-rose-300',
      badgeStyle: 'bg-rose-400 text-rose-950 border-rose-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-rose-100',
      detailsBg: 'bg-rose-950/90',
      detailsBorder: 'border-rose-400/40',
      footerBorder: 'border-rose-400/40',
      footerText: 'text-rose-300'
    },
    {
      id: 'doctor-specialist-navy',
      groupId: 'doctor',
      name: 'Specialist Clinic Navy',
      hindiName: '3. 🏥 स्पेशलिस्ट क्लीनिक नेवी',
      subTitle: 'अनुभवी चिकित्सक व जांच केंद्र',
      iconEmoji: '🏥',
      cardBg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950',
      textColor: 'text-white',
      accentBorder: 'border-cyan-400',
      headerAccent: 'text-cyan-300',
      badgeStyle: 'bg-cyan-400 text-slate-950 border-cyan-300',
      phoneColor: 'text-cyan-300',
      subtextColor: 'text-cyan-100',
      detailsBg: 'bg-blue-950/80',
      detailsBorder: 'border-cyan-400/40',
      footerBorder: 'border-cyan-400/40',
      footerText: 'text-cyan-300'
    },
    {
      id: 'doctor-ayurveda-green',
      groupId: 'doctor',
      name: 'Ayush & Herbal Green',
      hindiName: '4. 🌿 आयुष व प्राकृतिक चिकित्सा',
      subTitle: 'शुद्ध आयुर्वेदिक व हर्बल समाधान',
      iconEmoji: '🌿',
      cardBg: 'bg-gradient-to-br from-emerald-950 via-green-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-emerald-400',
      headerAccent: 'text-emerald-300',
      badgeStyle: 'bg-emerald-400 text-emerald-950 border-emerald-300',
      phoneColor: 'text-lime-300',
      subtextColor: 'text-emerald-100',
      detailsBg: 'bg-emerald-950/90',
      detailsBorder: 'border-emerald-400/40',
      footerBorder: 'border-emerald-400/40',
      footerText: 'text-emerald-300'
    }
  ],
  halwai: [
    {
      id: 'halwai-royal-saffron',
      groupId: 'halwai',
      name: 'Royal Saffron Kesariya',
      hindiName: '1. 🍯 शाही केसरिया',
      subTitle: 'शुद्ध देशी घी मिष्ठान भंडार',
      iconEmoji: '🍯',
      cardBg: 'bg-gradient-to-br from-amber-800 via-orange-800 to-yellow-950',
      textColor: 'text-white',
      accentBorder: 'border-yellow-300',
      headerAccent: 'text-yellow-200',
      badgeStyle: 'bg-yellow-300 text-amber-950 border-yellow-200 font-black',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-yellow-100',
      detailsBg: 'bg-amber-950/90',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-300/40',
      footerText: 'text-yellow-200'
    },
    {
      id: 'halwai-marigold-yellow',
      groupId: 'halwai',
      name: 'Festive Marigold Yellow',
      hindiName: '2. 🌼 गेंदा पीला उत्सव',
      subTitle: 'शादी-पार्टी हलवाई व कैटरिंग',
      iconEmoji: '🌼',
      cardBg: 'bg-gradient-to-br from-yellow-700 via-amber-700 to-red-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-300',
      headerAccent: 'text-amber-200',
      badgeStyle: 'bg-amber-300 text-amber-950 border-amber-200',
      phoneColor: 'text-yellow-200',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-amber-900/80',
      detailsBorder: 'border-amber-300/40',
      footerBorder: 'border-amber-300/40',
      footerText: 'text-amber-200'
    },
    {
      id: 'halwai-jalebi-orange',
      groupId: 'halwai',
      name: 'Traditional Jalebi Orange',
      hindiName: '3. 🍬 पारंपरिक संतरी मिष्ठान',
      subTitle: 'ताजा नमकीन व देशी मिठाई',
      iconEmoji: '🍬',
      cardBg: 'bg-gradient-to-br from-orange-700 via-red-800 to-amber-950',
      textColor: 'text-white',
      accentBorder: 'border-orange-300',
      headerAccent: 'text-orange-200',
      badgeStyle: 'bg-orange-300 text-red-950 border-orange-200',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-orange-100',
      detailsBg: 'bg-orange-950/90',
      detailsBorder: 'border-orange-400/40',
      footerBorder: 'border-orange-300/40',
      footerText: 'text-orange-200'
    },
    {
      id: 'halwai-cardamom-brown',
      groupId: 'halwai',
      name: 'Cardamom Gold Brown',
      hindiName: '4. 🫖 इलायची गोल्डन ब्राउन',
      subTitle: 'प्रीमियम बेकरी व मावा मिठाई',
      iconEmoji: '🫖',
      cardBg: 'bg-gradient-to-br from-stone-900 via-amber-950 to-zinc-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-stone-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-stone-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    }
  ],
  technician: [
    {
      id: 'technician-industrial-cobalt',
      groupId: 'technician',
      name: 'Industrial Cobalt & Gold',
      hindiName: '1. 🔧 इंडस्ट्रियल कोबाल्ट',
      subTitle: 'आधुनिक गैरेज व ऑटो मिस्त्री',
      iconEmoji: '🔧',
      cardBg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-blue-100',
      detailsBg: 'bg-slate-900/95',
      detailsBorder: 'border-blue-400/40',
      footerBorder: 'border-blue-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'technician-highvis-yellow',
      groupId: 'technician',
      name: 'High-Vis Safety Yellow',
      hindiName: '2. ⚡ हाई-विज़ येलो',
      subTitle: '24 घंटे फास्ट रिपेयरिंग',
      iconEmoji: '⚡',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-yellow-400',
      headerAccent: 'text-yellow-300',
      badgeStyle: 'bg-yellow-400 text-slate-950 border-yellow-300 font-black',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-zinc-100',
      detailsBg: 'bg-zinc-900/90',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-400/40',
      footerText: 'text-yellow-300'
    },
    {
      id: 'technician-steel-carbon',
      groupId: 'technician',
      name: 'Steel Carbon Gray',
      hindiName: '3. ⚙️ स्टील कार्बन ग्रे',
      subTitle: 'ऑटो, ट्रैक्टर व मोटर मिस्त्री',
      iconEmoji: '⚙️',
      cardBg: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-stone-900',
      textColor: 'text-white',
      accentBorder: 'border-cyan-400',
      headerAccent: 'text-cyan-300',
      badgeStyle: 'bg-cyan-400 text-zinc-950 border-cyan-300',
      phoneColor: 'text-cyan-300',
      subtextColor: 'text-slate-200',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-cyan-400/40',
      footerBorder: 'border-cyan-400/40',
      footerText: 'text-cyan-300'
    },
    {
      id: 'technician-electric-blue',
      groupId: 'technician',
      name: 'Tech Electric Diagnostic',
      hindiName: '4. 🔋 टेक इलेक्ट्रिक ब्लू',
      subTitle: 'इलेक्ट्रॉनिक व मोटर डायग्नोस्टिक',
      iconEmoji: '🔋',
      cardBg: 'bg-gradient-to-br from-sky-950 via-slate-950 to-blue-950',
      textColor: 'text-white',
      accentBorder: 'border-sky-400',
      headerAccent: 'text-sky-300',
      badgeStyle: 'bg-sky-400 text-sky-950 border-sky-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-sky-100',
      detailsBg: 'bg-sky-950/90',
      detailsBorder: 'border-sky-400/40',
      footerBorder: 'border-sky-400/40',
      footerText: 'text-sky-300'
    }
  ],
  agriculture: [
    {
      id: 'agriculture-golden-wheat',
      groupId: 'agriculture',
      name: 'Golden Harvest Wheat',
      hindiName: '1. 🌾 सुनहरी गेहूं बाली',
      subTitle: 'उन्नत बीज, खाद व कीटनाशक',
      iconEmoji: '🌾',
      cardBg: 'bg-gradient-to-br from-emerald-950 via-green-900 to-yellow-950',
      textColor: 'text-white',
      accentBorder: 'border-lime-400',
      headerAccent: 'text-lime-300',
      badgeStyle: 'bg-lime-400 text-emerald-950 border-lime-300',
      phoneColor: 'text-lime-300',
      subtextColor: 'text-lime-100',
      detailsBg: 'bg-emerald-950/90',
      detailsBorder: 'border-lime-400/40',
      footerBorder: 'border-lime-400/40',
      footerText: 'text-lime-300'
    },
    {
      id: 'agriculture-fertile-green',
      groupId: 'agriculture',
      name: 'Lush Fertile Green',
      hindiName: '2. 🌱 उर्वरक किसान केंद्र',
      subTitle: 'कृषि सेवा केंद्र, बोरिंग व दवा',
      iconEmoji: '🌱',
      cardBg: 'bg-gradient-to-br from-green-950 via-emerald-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-emerald-400',
      headerAccent: 'text-emerald-300',
      badgeStyle: 'bg-emerald-400 text-green-950 border-emerald-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-emerald-100',
      detailsBg: 'bg-green-950/90',
      detailsBorder: 'border-emerald-400/40',
      footerBorder: 'border-emerald-400/40',
      footerText: 'text-emerald-300'
    },
    {
      id: 'agriculture-organic-earth',
      groupId: 'agriculture',
      name: 'Organic Farm Earth',
      hindiName: '3. 🚜 जैविक फार्म अर्थ',
      subTitle: 'ट्रैक्टर, जुताई व हार्वेस्टर सेवा',
      iconEmoji: '🚜',
      cardBg: 'bg-gradient-to-br from-stone-900 via-amber-950 to-yellow-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-stone-950 border-amber-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-stone-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'agriculture-modern-agro',
      groupId: 'agriculture',
      name: 'Solar Irrigation Emerald',
      hindiName: '4. 💧 आधुनिक एग्रो सोलर',
      subTitle: 'ड्रिप व सोलर सिंचाई उपकरण',
      iconEmoji: '💧',
      cardBg: 'bg-gradient-to-br from-teal-950 via-emerald-950 to-cyan-950',
      textColor: 'text-white',
      accentBorder: 'border-teal-300',
      headerAccent: 'text-teal-200',
      badgeStyle: 'bg-teal-300 text-teal-950 border-teal-200',
      phoneColor: 'text-teal-200',
      subtextColor: 'text-teal-100',
      detailsBg: 'bg-teal-950/90',
      detailsBorder: 'border-teal-300/40',
      footerBorder: 'border-teal-300/40',
      footerText: 'text-teal-200'
    }
  ],
  teacher: [
    {
      id: 'teacher-sapphire',
      groupId: 'teacher',
      name: 'Academic Sapphire Blue',
      hindiName: '1. 📚 एकेडेमिक नीलम',
      subTitle: 'टॉप कोचिंग व होम ट्यूशन',
      iconEmoji: '📚',
      cardBg: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950',
      textColor: 'text-white',
      accentBorder: 'border-indigo-400',
      headerAccent: 'text-indigo-300',
      badgeStyle: 'bg-indigo-400 text-indigo-950 border-indigo-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-indigo-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-indigo-400/40',
      footerBorder: 'border-indigo-400/40',
      footerText: 'text-indigo-300'
    },
    {
      id: 'teacher-wisdom-gold',
      groupId: 'teacher',
      name: 'Wisdom Lamp Gold',
      hindiName: '2. 🎓 ज्ञान दीप गोल्ड',
      subTitle: 'प्रतियोगी परीक्षा व बोर्ड तैयारी',
      iconEmoji: '🎓',
      cardBg: 'bg-gradient-to-br from-slate-950 via-amber-950 to-zinc-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-zinc-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'teacher-slate-black',
      groupId: 'teacher',
      name: 'Modern Slate Black',
      hindiName: '3. ✏️ मॉडर्न स्लेट ब्लैक',
      subTitle: '100% उत्कृष्ट परिणाम गारंटी',
      iconEmoji: '✏️',
      cardBg: 'bg-gradient-to-br from-zinc-950 via-slate-900 to-neutral-900',
      textColor: 'text-white',
      accentBorder: 'border-emerald-400',
      headerAccent: 'text-emerald-300',
      badgeStyle: 'bg-emerald-400 text-slate-950 border-emerald-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-zinc-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-emerald-400/40',
      footerBorder: 'border-emerald-400/40',
      footerText: 'text-emerald-300'
    },
    {
      id: 'teacher-noble-emerald',
      groupId: 'teacher',
      name: 'Noble School Emerald',
      hindiName: '4. 🏫 नोबल शिक्षा ग्रीन',
      subTitle: 'प्राथमिक व माध्यमिक शिक्षण संस्थान',
      iconEmoji: '🏫',
      cardBg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-teal-400',
      headerAccent: 'text-teal-300',
      badgeStyle: 'bg-teal-400 text-emerald-950 border-teal-300',
      phoneColor: 'text-lime-300',
      subtextColor: 'text-teal-100',
      detailsBg: 'bg-emerald-950/90',
      detailsBorder: 'border-teal-400/40',
      footerBorder: 'border-teal-400/40',
      footerText: 'text-teal-300'
    }
  ],
  tailor: [
    {
      id: 'tailor-royal-magenta',
      groupId: 'tailor',
      name: 'Royal Velvet Magenta',
      hindiName: '1. ✂️ रॉयल मखमली बुटीक',
      subTitle: 'लेडीज बुटीक, सूट व मैचिंग सेंटर',
      iconEmoji: '✂️',
      cardBg: 'bg-gradient-to-br from-fuchsia-950 via-pink-900 to-purple-950',
      textColor: 'text-white',
      accentBorder: 'border-pink-400',
      headerAccent: 'text-pink-300',
      badgeStyle: 'bg-pink-400 text-pink-950 border-pink-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-pink-100',
      detailsBg: 'bg-pink-950/90',
      detailsBorder: 'border-pink-400/40',
      footerBorder: 'border-pink-400/40',
      footerText: 'text-pink-300'
    },
    {
      id: 'tailor-golden-stitch',
      groupId: 'tailor',
      name: 'Golden Thread Plum',
      hindiName: '2. 🧵 गोल्डन सिलाई मास्टर',
      subTitle: 'जेंट्स व लेडीज परफेक्ट फिटिंग',
      iconEmoji: '🧵',
      cardBg: 'bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-purple-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-purple-100',
      detailsBg: 'bg-purple-950/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'tailor-designer-rose',
      groupId: 'tailor',
      name: 'Designer Rose Gold',
      hindiName: '3. 🪡 डिजाइनर रोज फैशन',
      subTitle: 'आधुनिक फैशन व लहंगा-चोली सिलाई',
      iconEmoji: '🪡',
      cardBg: 'bg-gradient-to-br from-rose-950 via-stone-900 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-rose-300',
      headerAccent: 'text-rose-200',
      badgeStyle: 'bg-rose-300 text-rose-950 border-rose-200',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-rose-100',
      detailsBg: 'bg-rose-950/90',
      detailsBorder: 'border-rose-300/40',
      footerBorder: 'border-rose-300/40',
      footerText: 'text-rose-200'
    },
    {
      id: 'tailor-silk-navy',
      groupId: 'tailor',
      name: 'Classic Silk Navy',
      hindiName: '4. 👔 क्लासिक सिल्क नेवी',
      subTitle: 'सूट, शेरवानी, कोट व सफारी',
      iconEmoji: '👔',
      cardBg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900',
      textColor: 'text-white',
      accentBorder: 'border-sky-300',
      headerAccent: 'text-sky-200',
      badgeStyle: 'bg-sky-300 text-slate-950 border-sky-200',
      phoneColor: 'text-sky-300',
      subtextColor: 'text-sky-100',
      detailsBg: 'bg-blue-950/80',
      detailsBorder: 'border-sky-300/40',
      footerBorder: 'border-sky-300/40',
      footerText: 'text-sky-200'
    }
  ],
  electrician: [
    {
      id: 'electrician-high-voltage-navy',
      groupId: 'electrician',
      name: 'High-Voltage Navy & Neon',
      hindiName: '1. ⚡ हाई वोल्टेज नेवी',
      subTitle: 'घर, दुकान वायरिंग व इन्वर्टर रिपेयर',
      iconEmoji: '⚡',
      cardBg: 'bg-gradient-to-br from-slate-950 via-blue-950 to-teal-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-blue-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'electrician-solar-amber',
      groupId: 'electrician',
      name: 'Solar Energy Gold',
      hindiName: '2. ☀️ सोलर ऊर्जा गोल्ड',
      subTitle: 'सोलर पैनल, बैटरी व मोटर फिटिंग',
      iconEmoji: '☀️',
      cardBg: 'bg-gradient-to-br from-amber-950 via-slate-900 to-yellow-950',
      textColor: 'text-white',
      accentBorder: 'border-yellow-400',
      headerAccent: 'text-yellow-300',
      badgeStyle: 'bg-yellow-400 text-amber-950 border-yellow-300 font-black',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-amber-950/90',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-400/40',
      footerText: 'text-yellow-300'
    },
    {
      id: 'electrician-plumbing-aqua',
      groupId: 'electrician',
      name: 'Aqua Plumbing Marine',
      hindiName: '3. 🚰 एक्वा प्लंबिंग व नलसाज',
      subTitle: 'पाइपलाइन, समर्सिबल व नल रिपेयरिंग',
      iconEmoji: '🚰',
      cardBg: 'bg-gradient-to-br from-cyan-950 via-sky-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-cyan-400',
      headerAccent: 'text-cyan-300',
      badgeStyle: 'bg-cyan-400 text-cyan-950 border-cyan-300',
      phoneColor: 'text-cyan-300',
      subtextColor: 'text-cyan-100',
      detailsBg: 'bg-cyan-950/90',
      detailsBorder: 'border-cyan-400/40',
      footerBorder: 'border-cyan-400/40',
      footerText: 'text-cyan-300'
    },
    {
      id: 'electrician-power-circuit',
      groupId: 'electrician',
      name: 'Power Circuit Carbon',
      hindiName: '4. 🔌 पावर सर्किट स्लेट',
      subTitle: '24 घंटे आपातकालीन बिजली सेवा',
      iconEmoji: '🔌',
      cardBg: 'bg-gradient-to-br from-zinc-950 via-stone-900 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-emerald-400',
      headerAccent: 'text-emerald-300',
      badgeStyle: 'bg-emerald-400 text-slate-950 border-emerald-300',
      phoneColor: 'text-emerald-300',
      subtextColor: 'text-zinc-100',
      detailsBg: 'bg-zinc-900/90',
      detailsBorder: 'border-emerald-400/40',
      footerBorder: 'border-emerald-400/40',
      footerText: 'text-emerald-300'
    }
  ],
  grocery: [
    {
      id: 'grocery-traditional-red',
      groupId: 'grocery',
      name: 'Traditional Indian Store Red',
      hindiName: '1. 🛒 पारंपरिक लाल किराना',
      subTitle: 'शुद्ध किराना, जनरल स्टोर व दैनिक सामान',
      iconEmoji: '🛒',
      cardBg: 'bg-gradient-to-br from-red-900 via-rose-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-red-950 border-amber-300 font-black',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-rose-100',
      detailsBg: 'bg-red-950/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'grocery-fresh-mart-green',
      groupId: 'grocery',
      name: 'Fresh Mart Green',
      hindiName: '2. 🥬 फ्रेश मार्ट ग्रीन',
      subTitle: 'ताजा राशन, आटा, तेल व मसाले',
      iconEmoji: '🥬',
      cardBg: 'bg-gradient-to-br from-emerald-950 via-green-900 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-emerald-400',
      headerAccent: 'text-emerald-300',
      badgeStyle: 'bg-emerald-400 text-emerald-950 border-emerald-300',
      phoneColor: 'text-lime-300',
      subtextColor: 'text-emerald-100',
      detailsBg: 'bg-emerald-950/90',
      detailsBorder: 'border-emerald-400/40',
      footerBorder: 'border-emerald-400/40',
      footerText: 'text-emerald-300'
    },
    {
      id: 'grocery-royal-gold-provision',
      groupId: 'grocery',
      name: 'Royal Gold Wholesale Provision',
      hindiName: '3. 🌾 रॉयल प्रोविजन गोल्ड',
      subTitle: 'थोक व फुटकर गल्ला व किराना',
      iconEmoji: '🌾',
      cardBg: 'bg-gradient-to-br from-amber-950 via-yellow-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-yellow-400',
      headerAccent: 'text-yellow-300',
      badgeStyle: 'bg-yellow-400 text-amber-950 border-yellow-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-amber-950/90',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-400/40',
      footerText: 'text-yellow-300'
    },
    {
      id: 'grocery-superstore-slate',
      groupId: 'grocery',
      name: 'Modern Superstore Slate',
      hindiName: '4. 🏪 सुपरस्टोर होम डिलीवरी',
      subTitle: 'गाँव में फ्री होम डिलीवरी उपलब्ध',
      iconEmoji: '🏪',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-blue-950',
      textColor: 'text-white',
      accentBorder: 'border-sky-400',
      headerAccent: 'text-sky-300',
      badgeStyle: 'bg-sky-400 text-slate-950 border-sky-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-slate-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-sky-400/40',
      footerBorder: 'border-sky-400/40',
      footerText: 'text-sky-300'
    }
  ],
  salon: [
    {
      id: 'salon-glamour-rosegold',
      groupId: 'salon',
      name: 'Glamour Rose Gold',
      hindiName: '1. 💇 ग्लैमर रोज गोल्ड',
      subTitle: 'ब्राइडल मेकअप, फेशियल व ब्यूटी पार्लर',
      iconEmoji: '💇',
      cardBg: 'bg-gradient-to-br from-rose-950 via-pink-900 to-purple-950',
      textColor: 'text-white',
      accentBorder: 'border-rose-300',
      headerAccent: 'text-rose-200',
      badgeStyle: 'bg-rose-300 text-rose-950 border-rose-200',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-rose-100',
      detailsBg: 'bg-rose-950/90',
      detailsBorder: 'border-rose-300/40',
      footerBorder: 'border-rose-300/40',
      footerText: 'text-rose-200'
    },
    {
      id: 'salon-midnight-plum',
      groupId: 'salon',
      name: 'Royal Midnight Plum',
      hindiName: '2. ✨ रॉयल प्लम ग्रूमिंग',
      subTitle: 'हेयर स्टाइल, स्पा व स्किन केयर',
      iconEmoji: '✨',
      cardBg: 'bg-gradient-to-br from-purple-950 via-slate-950 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-purple-300',
      headerAccent: 'text-purple-200',
      badgeStyle: 'bg-purple-300 text-purple-950 border-purple-200',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-purple-100',
      detailsBg: 'bg-purple-950/90',
      detailsBorder: 'border-purple-300/40',
      footerBorder: 'border-purple-300/40',
      footerText: 'text-purple-200'
    },
    {
      id: 'salon-velvet-pink',
      groupId: 'salon',
      name: 'Velvet Blush Pink',
      hindiName: '3. 🌸 मखमली ब्लश पिंक',
      subTitle: 'लेडीज ब्यूटी पार्लर व मेहंदी आर्ट',
      iconEmoji: '🌸',
      cardBg: 'bg-gradient-to-br from-pink-950 via-rose-900 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-pink-300',
      headerAccent: 'text-pink-200',
      badgeStyle: 'bg-pink-300 text-pink-950 border-pink-200',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-pink-100',
      detailsBg: 'bg-pink-950/90',
      detailsBorder: 'border-pink-300/40',
      footerBorder: 'border-pink-300/40',
      footerText: 'text-pink-200'
    },
    {
      id: 'salon-modern-barber',
      groupId: 'salon',
      name: 'Modern Barber Slate',
      hindiName: '4. 💈 मॉडर्न मेन्स सैलून',
      subTitle: 'जेंट्स हेयर कटिंग, शेव व मसाज',
      iconEmoji: '💈',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-cyan-400',
      headerAccent: 'text-cyan-300',
      badgeStyle: 'bg-cyan-400 text-slate-950 border-cyan-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-slate-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-cyan-400/40',
      footerBorder: 'border-cyan-400/40',
      footerText: 'text-cyan-300'
    }
  ],
  driver: [
    {
      id: 'driver-highway-black',
      groupId: 'driver',
      name: 'Highway Asphalt & Yellow',
      hindiName: '1. 🚗 हाईवे 24x7 टैक्सी',
      subTitle: 'लोकल व ऑल इंडिया टूरिस्ट टैक्सी',
      iconEmoji: '🚗',
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
      id: 'driver-pickup-speed',
      groupId: 'driver',
      name: 'Speed Pickup Carrier',
      hindiName: '2. 🚛 लोडर व माल ढुलाई',
      subTitle: 'पिकअप, छोटा हाथी व सामान ट्रांसपोर्ट',
      iconEmoji: '🚛',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-950 to-stone-900',
      textColor: 'text-white',
      accentBorder: 'border-orange-400',
      headerAccent: 'text-orange-300',
      badgeStyle: 'bg-orange-400 text-slate-950 border-orange-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-slate-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-orange-400/40',
      footerBorder: 'border-orange-400/40',
      footerText: 'text-orange-300'
    },
    {
      id: 'driver-royal-cab',
      groupId: 'driver',
      name: 'Royal Navy Family Cab',
      hindiName: '3. 🚖 रॉयल नेवी कैब',
      subTitle: 'सुरक्षित व आरामदायक पारिवारिक यात्रा',
      iconEmoji: '🚖',
      cardBg: 'bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-sky-400',
      headerAccent: 'text-sky-300',
      badgeStyle: 'bg-sky-400 text-blue-950 border-sky-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-blue-100',
      detailsBg: 'bg-blue-950/90',
      detailsBorder: 'border-sky-400/40',
      footerBorder: 'border-sky-400/40',
      footerText: 'text-sky-300'
    },
    {
      id: 'driver-express-orange',
      groupId: 'driver',
      name: 'Express Auto & Tour',
      hindiName: '4. 🏁 एक्सप्रेस ऑटो व ट्रेवल्स',
      subTitle: 'स्टेशन, अस्पताल व बुकिंग सेवा',
      iconEmoji: '🏁',
      cardBg: 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-amber-950 border-amber-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-amber-100',
      detailsBg: 'bg-amber-950/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    }
  ],
  construction: [
    {
      id: 'construction-brick-red',
      groupId: 'construction',
      name: 'Terracotta Brick Red',
      hindiName: '1. 🏗️ अनुभवी राजमिस्त्री',
      subTitle: 'मकान, दुकान व छत ढलाई विशेषज्ञ',
      iconEmoji: '🏗️',
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
    },
    {
      id: 'construction-blueprint-navy',
      groupId: 'construction',
      name: 'Blueprint Architect Navy',
      hindiName: '2. 📐 नक्शा व भवन निर्माण',
      subTitle: 'मकान नक्शा, डिजाइन व कंस्ट्रक्शन',
      iconEmoji: '📐',
      cardBg: 'bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-cyan-400',
      headerAccent: 'text-cyan-300',
      badgeStyle: 'bg-cyan-400 text-slate-950 border-cyan-300',
      phoneColor: 'text-cyan-300',
      subtextColor: 'text-blue-100',
      detailsBg: 'bg-blue-950/90',
      detailsBorder: 'border-cyan-400/40',
      footerBorder: 'border-cyan-400/40',
      footerText: 'text-cyan-300'
    },
    {
      id: 'construction-builder-orange',
      groupId: 'construction',
      name: 'Heavy Builder Contractor',
      hindiName: '3. 👷 ठेकेदार व मटेरियल',
      subTitle: 'सरिया, सीमेंट, गिट्टी व भवन ठेका',
      iconEmoji: '👷',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-slate-100',
      detailsBg: 'bg-zinc-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'construction-hardwood-carpenter',
      groupId: 'construction',
      name: 'Hardwood Carpenter Stone',
      hindiName: '4. 🪚 मॉडर्न बढ़ई व फर्नीचर',
      subTitle: 'दरवाजा, खिड़की, अलमारी व बेड वर्क',
      iconEmoji: '🪚',
      cardBg: 'bg-gradient-to-br from-stone-950 via-amber-950 to-neutral-950',
      textColor: 'text-white',
      accentBorder: 'border-yellow-400',
      headerAccent: 'text-yellow-300',
      badgeStyle: 'bg-yellow-400 text-stone-950 border-yellow-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-stone-100',
      detailsBg: 'bg-stone-900/90',
      detailsBorder: 'border-yellow-400/40',
      footerBorder: 'border-yellow-400/40',
      footerText: 'text-yellow-300'
    }
  ],
  general: [
    {
      id: 'general-gramseva-emerald',
      groupId: 'general',
      name: 'Gram Seva Emerald',
      hindiName: '1. 🌟 ग्राम सेवा एमरैल्ड',
      subTitle: 'विश्वसनीय स्थानीय सेवा प्रदाता',
      iconEmoji: '🌟',
      cardBg: 'bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-emerald-400',
      headerAccent: 'text-emerald-300',
      badgeStyle: 'bg-emerald-400 text-emerald-950 border-emerald-300 font-bold',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-emerald-100',
      detailsBg: 'bg-emerald-950/90',
      detailsBorder: 'border-emerald-400/40',
      footerBorder: 'border-emerald-400/40',
      footerText: 'text-emerald-300'
    },
    {
      id: 'general-royal-gold',
      groupId: 'general',
      name: 'Royal Blue & Gold',
      hindiName: '2. 👑 रॉयल गोल्ड प्रीमियम',
      subTitle: 'प्रीमियम ग्राम व्यापार नेटवर्क',
      iconEmoji: '👑',
      cardBg: 'bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950',
      textColor: 'text-white',
      accentBorder: 'border-amber-400',
      headerAccent: 'text-amber-300',
      badgeStyle: 'bg-amber-400 text-slate-950 border-amber-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-blue-100',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-amber-400/40',
      footerBorder: 'border-amber-400/40',
      footerText: 'text-amber-300'
    },
    {
      id: 'general-classic-slate',
      groupId: 'general',
      name: 'Classic Dark Slate',
      hindiName: '3. 🛡️ क्लासिक स्लेट',
      subTitle: 'सत्यापित डिजिटल बिजनेस प्रोफाइल',
      iconEmoji: '🛡️',
      cardBg: 'bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-900',
      textColor: 'text-white',
      accentBorder: 'border-slate-300',
      headerAccent: 'text-slate-200',
      badgeStyle: 'bg-slate-200 text-slate-950 border-slate-300',
      phoneColor: 'text-amber-300',
      subtextColor: 'text-slate-200',
      detailsBg: 'bg-slate-900/90',
      detailsBorder: 'border-slate-400/40',
      footerBorder: 'border-slate-400/40',
      footerText: 'text-slate-300'
    },
    {
      id: 'general-festive-orange',
      groupId: 'general',
      name: 'Festive Vibrant Orange',
      hindiName: '4. ⚡ देशी ऑरेंज',
      subTitle: 'त्वरित व भरोसेमंद स्थानीय सेवा',
      iconEmoji: '⚡',
      cardBg: 'bg-gradient-to-br from-amber-950 via-orange-950 to-slate-950',
      textColor: 'text-white',
      accentBorder: 'border-orange-400',
      headerAccent: 'text-orange-300',
      badgeStyle: 'bg-orange-400 text-amber-950 border-orange-300',
      phoneColor: 'text-yellow-300',
      subtextColor: 'text-orange-100',
      detailsBg: 'bg-amber-950/90',
      detailsBorder: 'border-orange-400/40',
      footerBorder: 'border-orange-400/40',
      footerText: 'text-orange-300'
    }
  ]
};

export const VisitingCardModal: React.FC<VisitingCardModalProps> = ({ worker, isOpen, onClose }) => {
  // Determine matching profession group
  const professionGroup = getProfessionGroup(worker?.category, worker?.customCategory);
  
  // Available themes strictly limited to the user's specific profession group
  const professionThemes = ALL_PROFESSION_THEMES[professionGroup] || ALL_PROFESSION_THEMES.general;

  const [activeThemeId, setActiveThemeId] = useState<string>(professionThemes[0]?.id || 'general-gramseva-emerald');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [safeAvatarUrl, setSafeAvatarUrl] = useState<string>(worker?.avatarUrl || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const shopTitle = worker?.shopName || worker?.hindiName || worker?.name || 'ग्राम सेवा';
  const ownerName = worker?.name || 'सेवा प्रदाता';
  const phone = worker?.phone || '';
  const village = worker?.village || 'ग्राम';
  const district = worker?.district || 'जिला';
  const state = worker?.state || 'उत्तर प्रदेश';
  const mapAddress = worker?.mapAddress || '';
  const category = worker?.customCategory || worker?.category || 'सेवा प्रदाता';
  const charges = worker?.charges || 'उचित रेट';
  const expYears = worker?.experienceYears || 1;
  const professionBadge = getProfessionBadge(worker?.category, worker?.customCategory);

  // Standard direct deep link for this shop
  const shopDeepLink = `https://gramseva.app/?shopId=${worker?.id || ''}`;

  // Reset active theme when worker/profession group changes
  useEffect(() => {
    if (professionThemes.length > 0) {
      // Find if activeTheme is in current professionThemes; if not, reset to first
      const exists = professionThemes.some((t) => t.id === activeThemeId);
      if (!exists) {
        setActiveThemeId(professionThemes[0].id);
      }
    }
  }, [professionGroup, professionThemes, activeThemeId]);

  // Preload and convert avatar to safe Base64 canvas data URL to avoid tainted canvas in html2canvas
  useEffect(() => {
    let isMounted = true;
    if (!worker?.avatarUrl) return;

    if (worker.avatarUrl.startsWith('data:image')) {
      setSafeAvatarUrl(worker.avatarUrl);
      return;
    }

    // Attempt to safely fetch / draw to canvas with anonymous CORS
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 160;
        canvas.height = img.naturalHeight || 160;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL('image/png');
          if (isMounted) setSafeAvatarUrl(base64);
        }
      } catch (e) {
        console.warn('Canvas conversion restricted by CORS, keeping original URL:', e);
        if (isMounted) setSafeAvatarUrl(worker.avatarUrl);
      }
    };
    img.onerror = () => {
      // Fallback clean SVG avatar with owner initial
      const initial = (ownerName || 'G')[0].toUpperCase();
      const svgFallback = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="28" fill="%23047857"/><text x="50%" y="54%" font-family="sans-serif" font-size="56" font-weight="900" fill="%23ffffff" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(initial)}</text></svg>`;
      if (isMounted) setSafeAvatarUrl(svgFallback);
    };
    img.src = worker.avatarUrl;

    return () => {
      isMounted = false;
    };
  }, [worker?.avatarUrl, ownerName]);

  // Generate QR Code with shop deep link
  useEffect(() => {
    if (worker) {
      QRCode.toDataURL(
        shopDeepLink,
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

  if (!isOpen || !worker) return null;

  const currentTheme = professionThemes.find((t) => t.id === activeThemeId) || professionThemes[0] || ALL_PROFESSION_THEMES.general[0];

  // ==================== 1. BULLETPROOF PNG CARD EXPORT (NO TAINTED CANVAS ERRORS) ====================
  const handleDownloadCard = async () => {
    const cardElement = document.getElementById('visiting-card-container') || cardRef.current;
    if (!cardElement) return;

    setIsGenerating(true);
    setStatusToast('एचडी कार्ड तैयार हो रहा है... 📥');

    try {
      // html2canvas configured with scale: 2, useCORS: true, allowTaint: false (critical to prevent security error on toDataURL)
      const canvas = await html2canvas(cardElement, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
        logging: false,
        imageTimeout: 6000,
        ignoreElements: (el) => el.tagName === 'IFRAME' || el.classList.contains('no-export')
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanFileName = (shopTitle || 'Visiting_Card').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
      link.download = `${cleanFileName}_GramSeva_Card.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setStatusToast('गैलरी में सफलतापूर्वक डाउनलोड हो गया! 🖼️');
    } catch (err) {
      console.error('Card export primary failed, attempting fallback export:', err);
      
      // Fallback attempt with cloned element handling
      try {
        const canvas = await html2canvas(cardElement, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#0f172a',
          logging: false
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        const cleanFileName = (shopTitle || 'Visiting_Card').replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_');
        link.download = `${cleanFileName}_GramSeva_Card.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setStatusToast('गैलरी में सफलतापूर्वक डाउनलोड हो गया! 🖼️');
      } catch (retryErr) {
        console.error('All export attempts failed:', retryErr);
        setStatusToast('डाउनलोड में त्रुटि हुई, पुनः प्रयास करें!');
      }
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
          allowTaint: false,
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
                  {professionBadge.hindiTitle ? professionBadge.hindiTitle.replace(/^[^\s]+\s/, '') : category}
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

        {/* ==================== 2. PROFESSION-SPECIFIC THEME SELECTOR ==================== */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-emerald-700" />
              <span>{professionBadge.hindiTitle || 'व्यवसाय'} के लिए विशेष कार्ड थीम:</span>
            </label>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {currentTheme.name}
            </span>
          </div>

          {/* Dynamically filters to ONLY show designs matching user's specific profession */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {professionThemes.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveThemeId(tpl.id)}
                className={`p-2.5 rounded-2xl text-xs font-black transition-all border flex flex-col items-start gap-1 cursor-pointer text-left ${
                  activeThemeId === tpl.id
                    ? 'bg-slate-950 text-amber-300 border-amber-400 shadow-md ring-2 ring-emerald-400 scale-[1.02]'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <span className="text-xs sm:text-sm">{tpl.hindiName}</span>
                <span className="text-[10px] font-medium opacity-75 truncate w-full">
                  {tpl.subTitle}
                </span>
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
            {professionGroup === 'lawyer' && (
              <div className="absolute right-4 top-14 opacity-10 pointer-events-none">
                <Scale className="w-28 h-28 text-amber-300" />
              </div>
            )}
            {professionGroup === 'doctor' && (
              <div className="absolute right-2 top-14 opacity-10 pointer-events-none">
                <HeartPulse className="w-28 h-28 text-teal-300" />
              </div>
            )}
            {professionGroup === 'halwai' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <CookingPot className="w-28 h-28 text-yellow-300" />
              </div>
            )}
            {professionGroup === 'technician' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Wrench className="w-28 h-28 text-amber-300" />
              </div>
            )}
            {professionGroup === 'agriculture' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Sprout className="w-28 h-28 text-lime-300" />
              </div>
            )}
            {professionGroup === 'teacher' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <GraduationCap className="w-28 h-28 text-indigo-300" />
              </div>
            )}
            {professionGroup === 'tailor' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Scissors className="w-28 h-28 text-pink-300" />
              </div>
            )}
            {professionGroup === 'electrician' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Zap className="w-28 h-28 text-cyan-300" />
              </div>
            )}
            {professionGroup === 'grocery' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Store className="w-28 h-28 text-amber-300" />
              </div>
            )}
            {professionGroup === 'salon' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Sparkles className="w-28 h-28 text-rose-300" />
              </div>
            )}
            {professionGroup === 'driver' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Truck className="w-28 h-28 text-yellow-300" />
              </div>
            )}
            {professionGroup === 'construction' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <HardHat className="w-28 h-28 text-orange-300" />
              </div>
            )}
            {professionGroup === 'general' && (
              <div className="absolute right-3 top-14 opacity-10 pointer-events-none">
                <Building2 className="w-28 h-28 text-emerald-300" />
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

              {/* Owner Avatar Photo (Safe CORS Base64) */}
              <div className="relative shrink-0">
                <img
                  src={safeAvatarUrl || worker.avatarUrl}
                  crossOrigin="anonymous"
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

              {/* ==================== QR CODE DEEP LINKING ==================== */}
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

            {/* ==================== FULL ADDRESS (NO TRUNCATION) ==================== */}
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
