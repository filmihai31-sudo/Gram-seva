import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Video,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Download,
  Tv,
  CheckCircle2,
  Phone,
  MessageCircle,
  MapPin,
  Flame,
  Tag,
  Palette,
  Clock,
  Layers,
  X,
  Share2,
  Volume2,
  VolumeX,
  ShieldCheck,
  AlertCircle,
  Crown,
  Radio,
  Zap,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Check,
  Maximize2,
  Upload,
  Image as ImageIcon,
  Mic,
  MicOff,
  ShoppingBag,
  Sliders,
  Sparkle
} from 'lucide-react';
import { VideoAdItem } from '../types';
import { videoAudioEngine } from '../utils/videoAudioEngine';

export interface VideoAdGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated?: (newAd: VideoAdItem) => void;
  initialBusinessName?: string;
  initialPhone?: string;
  initialLocation?: string;
  initialCategory?: string;
}

export type TemplateStyleKey = 'royal_gold' | 'tv_broadcast' | 'apple_glass' | 'ipl_kinetic' | 'festive_blast';

export interface TemplateDefinition {
  id: TemplateStyleKey;
  name: string;
  hindiName: string;
  description: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  themeColor: string;
  agencyStyle: string;
}

export const TEMPLATE_STYLES: TemplateDefinition[] = [
  {
    id: 'royal_gold',
    name: '3D Luxury Royal Gold',
    hindiName: '3D लक्ज़री रॉयल गोल्ड',
    description: 'मेटैलिक गोल्ड टेक्सचर्स, फ्लोटिंग बोकेह पार्टिकल्स व प्रीमियम 3D एंबियंट स्टूडियो लाइटिंग',
    badge: '👑 3D रॉयल गोल्ड',
    badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black',
    icon: <Crown className="w-4 h-4" />,
    themeColor: '#d97706',
    agencyStyle: '3D Luxury Royal Gold Masterpiece'
  },
  {
    id: 'tv_broadcast',
    name: 'TV Broadcast Bulletin',
    hindiName: 'टीवी ब्रॉडकास्ट बुलेटिन',
    description: 'असली HD न्यूज़ चैनल लोअर-थर्ड, एनिमेटेड टिकर टेप बैनर व शार्प स्टूडियो लेआउट',
    badge: '🔴 नेशनल न्यूज़ बुलेटिन',
    badgeColor: 'bg-red-600 text-white font-black',
    icon: <Radio className="w-4 h-4" />,
    themeColor: '#dc2626',
    agencyStyle: 'Prime-Time National TV Broadcast'
  },
  {
    id: 'apple_glass',
    name: 'Apple-Style Minimalist Glass',
    hindiName: 'एप्पल-स्टाइल मिनिमलिस्ट ग्लास',
    description: 'क्लीन फ्रॉस्टेड ग्लास कार्ड्स, एलिगेंट टाइपोग्राफी, स्मूथ सिनेमैटिक ज़ूम व स्पेक्युलर शीन',
    badge: '✨ मिनिमलिस्ट फ्रॉस्टेड ग्लास',
    badgeColor: 'bg-slate-800 text-cyan-300 border border-cyan-400/40 font-black',
    icon: <Sparkle className="w-4 h-4" />,
    themeColor: '#0ea5e9',
    agencyStyle: 'Apple Cinematic Minimalist Glass'
  },
  {
    id: 'ipl_kinetic',
    name: 'IPL High-Energy Kinetic',
    hindiName: 'IPL हाई-एनर्जी काइनेटिक',
    description: 'फास्ट काइनेटिक टेक्स्ट, एनर्जेटिक ग्रेडिएंट स्ट्रीक्स, हाई-इम्पैक्ट स्पीड ब्लर व डील पॉपअप',
    badge: '⚡ IPL काइनेटिक एनर्जी',
    badgeColor: 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black',
    icon: <Zap className="w-4 h-4" />,
    themeColor: '#06b6d4',
    agencyStyle: 'IPL High-Velocity Sports Kinetic'
  },
  {
    id: 'festive_blast',
    name: 'Festive Grand Commerce Blast',
    hindiName: 'फेस्टिव ग्रैंड कॉमर्स ब्लास्ट',
    description: '3D रिबन हेडर्स, कंफ़ेटी एक्सप्लोजन, मेगा सेल धमाका व हाई-कन्वर्जन कॉल-टू-एक्शन बैज',
    badge: '🔥 महा सेल कार्निवल',
    badgeColor: 'bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black',
    icon: <Flame className="w-4 h-4" />,
    themeColor: '#ea580c',
    agencyStyle: 'Festive Mega Carnival Sale'
  }
];

export type ProfessionCategoryKey =
  | 'tractor'
  | 'solar'
  | 'sweets'
  | 'lawyer'
  | 'doctor'
  | 'clothes'
  | 'grocery'
  | 'mechanic'
  | 'salon'
  | 'builder';

interface ProfessionPreset {
  key: ProfessionCategoryKey;
  label: string;
  emoji: string;
  defaultBusiness: string;
  defaultOffer: string;
  defaultPrice: string;
  defaultTagline: string;
  defaultImage: string;
  defaultServices: string[];
}

export const PROFESSION_PRESETS: Record<ProfessionCategoryKey, ProfessionPreset> = {
  tractor: {
    key: 'tractor',
    label: 'ट्रैक्टर व कृषि यंत्र (Tractor & Agri)',
    emoji: '🚜',
    defaultBusiness: 'चौधरी ट्रैक्टर्स & एग्री मशीनरी',
    defaultOffer: 'पुराने ट्रैक्टर पर ₹50,000 तक एक्सचेंज छूट!',
    defaultPrice: '0% डाउनपेमेंट फाइनेंस उपलब्ध',
    defaultTagline: 'महिंद्रा, स्वराज, सोनालिका अधिकृत डीलर',
    defaultImage: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'सभी कंपनियों के नए व पुराने ट्रैक्टर',
      'रोटावेटर, कल्टीवेटर व सीड ड्रिल मशीन',
      'जेनुइन पार्ट्स व 3 साल फ्री सर्विस',
      'आसान 0% ब्याज सरकारी सब्सिडी लोन'
    ]
  },
  solar: {
    key: 'solar',
    label: 'सोलर पैनल व ट्यूबवेल (Solar & Tubewell)',
    emoji: '☀️',
    defaultBusiness: 'सूर्य शक्ति सोलर सिस्टम्स',
    defaultOffer: '80% सरकारी सब्सिडी के साथ सोलर पंप लगवाएं!',
    defaultPrice: '5 HP व 7.5 HP ट्यूबवेल सेटअप',
    defaultTagline: '25 साल वारंटी वाले टियर-1 पैनल्स',
    defaultImage: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'कुसुम योजना 80% सरकारी सब्सिडी',
      '5 HP, 7.5 HP व 10 HP AC/DC पंप',
      '25 साल सोलर पैनल परफॉर्मेंस वारंटी',
      'मुफ्त इंस्टॉलेशन व 5 साल ऑन-साइट सर्विस'
    ]
  },
  sweets: {
    key: 'sweets',
    label: 'मिष्ठान, मावा व हलवाई (Sweets & Catering)',
    emoji: '🍲',
    defaultBusiness: 'कन्हैया स्वीट्स & कैटरर्स',
    defaultOffer: 'शुद्ध देशी घी घेवर, मावा व शादी कैटरिंग बुकिंग!',
    defaultPrice: '100% शुद्धता की गारंटी',
    defaultTagline: '500+ लोगों के भोजन का भव्य हलवाई सेटअप',
    defaultImage: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'शुद्ध देशी घी घेवर, रसगुल्ला व काजू कतली',
      'शादी-ब्याह व पार्टी के लिए कैटरिंग बुकिंग',
      'ऑर्डर पर ताज़ा मावा, पनीर व क्रीम',
      'होम डिलीवरी व आकर्षक पैकिंग सुविधा'
    ]
  },
  lawyer: {
    key: 'lawyer',
    label: 'वकील व कानूनी सलाहकार (Advocate & Legal)',
    emoji: '⚖️',
    defaultBusiness: 'शर्मा & एसोसिएट्स एडवोकेट',
    defaultOffer: 'जमीन रजिस्ट्री, कोर्ट केस व कानूनी सलाह!',
    defaultPrice: 'सटीक व गोपनीय परामर्श',
    defaultTagline: '20+ वर्षों का विश्वसनीय कोर्ट अनुभव',
    defaultImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'जमीन-जायदाद रजिस्ट्री व नामांतरण',
      'दीवानी, फौजदारी व राजस्व कोर्ट केस',
      'एग्रीमेंट, वसीयत व शपथ पत्र ड्राफ्टिंग',
      'गोपनीय व निष्पक्ष कानूनी मार्गदर्शन'
    ]
  },
  doctor: {
    key: 'doctor',
    label: 'डॉक्टर, क्लिनिक व मेडिकल (Doctor & Clinic)',
    emoji: '🏥',
    defaultBusiness: 'संजीवनी हॉस्पिटल & क्लिनिक',
    defaultOffer: '24 घंटे इमरजेंसी स्वास्थ्य सेवा व मुफ्त चेकअप!',
    defaultPrice: 'जन औषधि दवाएं उपलब्ध',
    defaultTagline: 'अनुभवी फिजिशियन व आधुनिक जांच सुविधा',
    defaultImage: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      '24 घंटे इमरजेंसी व एम्बुलेंस सुविधा',
      'डिजिटल एक्स-रे, ईसीजी व ब्लड टेस्ट',
      'अनुभवी शिशु, महिला व सामान्य रोग विशेषज्ञ',
      'उचित दर पर भर्ती व ऑपरेशन सुविधा'
    ]
  },
  clothes: {
    key: 'clothes',
    label: 'वस्त्र भंडार व बुटीक (Boutique & Sarees)',
    emoji: '👗',
    defaultBusiness: 'श्री श्याम वस्त्र भंडार & बुटीक',
    defaultOffer: 'राजपूती पोशाक, शेरवानी व साड़ियों पर 30% ऑफ!',
    defaultPrice: 'होलसेल रेट पर उपलब्ध',
    defaultTagline: 'विवाह व त्योहारों का स्पेशल कलेक्शन',
    defaultImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'शाही राजपूती पोशाक व गोटा-पत्ती वर्क',
      'ब्राइडल लहंगा-चोली व दूल्हा शेरवानी',
      'होलसेल रेट पर कॉटन व सिल्क साड़ियां',
      'कस्टम टेलरिंग व परफेक्ट फिटिंग गारंटी'
    ]
  },
  grocery: {
    key: 'grocery',
    label: 'किराना व जनरल स्टोर (Kirana & Supermarket)',
    emoji: '🛒',
    defaultBusiness: 'बालाजी सुपरमार्ट & किराना',
    defaultOffer: 'महीने के राशन पर 15% छूट + फ्री डिलीवरी!',
    defaultPrice: 'ताज़ा व शुद्ध सामान',
    defaultTagline: 'गांव व आसपास 1 घंटे में डिलीवरी',
    defaultImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'ब्रांडेड आटा, तेल, दालें व शुद्ध मसाले',
      'ताज़ा डेयरी उत्पाद, घी, दूध व पनीर',
      'घर-घर 1 घंटे में फ्री होम डिलीवरी',
      'थोक भाव पर शादी-समारोह का राशन'
    ]
  },
  mechanic: {
    key: 'mechanic',
    label: 'गैराज व ऑटो रिपेयर (Mechanic & Auto Service)',
    emoji: '🛠️',
    defaultBusiness: 'राज ऑटोकेयर & सर्विस स्टेशन',
    defaultOffer: '24x7 ऑन-रोड सर्विस, व्हील अलाइनमेंट & टायर 10% ऑफ',
    defaultPrice: 'ओरिजिनल पार्ट्स गारंटी',
    defaultTagline: 'कंप्यूटराइज्ड व्हील अलाइनमेंट व MRF टायर',
    defaultImage: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      '24x7 ऑन-रोड ब्रेकडाउन व टोइंग सेवा',
      'कंप्यूटराइज्ड 3D व्हील अलाइनमेंट',
      'सभी कारों व ट्रैक्टरों की जनरल सर्विस',
      'MRF, अपोलो व CEAT टायरों का अधिकृत डीलर'
    ]
  },
  salon: {
    key: 'salon',
    label: 'ब्यूटी पार्लर व सैलून (Salon & Grooming)',
    emoji: '✂️',
    defaultBusiness: 'रॉयल ब्यूटी लाउंज & सैलून',
    defaultOffer: 'ब्राइडल मेकअप, हेयर स्पा व फेशियल पर 25% ऑफ!',
    defaultPrice: 'एडवांस बुकिंग चालू',
    defaultTagline: 'अनुभवी ब्यूटीशियन व प्रीमियम प्रोडक्ट्स',
    defaultImage: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'एचडी ब्राइडल व पार्टी मेकअप',
      'हेयर कटिंग, स्पा, स्मूथनिंग व केराटिन',
      'गोल्ड व डायमंड फेशियल ट्रीटमेंट',
      'प्री-वेडिंग ग्रूमिंग व स्किन केयर'
    ]
  },
  builder: {
    key: 'builder',
    label: 'भवन निर्माण व सामग्री (Building Materials)',
    emoji: '🏗️',
    defaultBusiness: 'श्री राम बिल्डिंग मैटेरियल्स',
    defaultOffer: 'अल्ट्राटेक सीमेंट, सरिया व बजरी पर भारी छूट!',
    defaultPrice: 'सीधे फैक्ट्री रेट पर उपलब्ध',
    defaultTagline: 'घर बैठे डिलीवरी व माप की सुविधा',
    defaultImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    defaultServices: [
      'अल्ट्राटेक, अंबुजा व जेके सुपर सीमेंट',
      'टाटा टिस्कॉन व जिंदल पैंथन टीएमटी सरिया',
      'धुली हुई बजरी, रोड़ी व ईंटें',
      'ट्रैक्टर ट्रॉली द्वारा साइट पर तुरंत डिलीवरी'
    ]
  }
};

const VIDEO_TOTAL_DURATION_SEC = 30; // 30.0 Seconds
const SCENE_1_END = 6;  // 0s - 6s: Hook & 3D Intro
const SCENE_2_END = 15; // 6s - 15s: Kinetic Services Grid
const SCENE_3_END = 23; // 15s - 23s: 3D Product Spotlight & Deal
const SCENE_4_END = 30; // 23s - 30s: Urgent Call to Action

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export const ClientVideoAdGenerator: React.FC<VideoAdGeneratorProps> = ({
  isOpen,
  onClose,
  onAdCreated,
  initialBusinessName = '',
  initialPhone = '',
  initialLocation = '',
  initialCategory = 'tractor'
}) => {
  // Navigation: 'form' -> 'gallery'
  const [currentStep, setCurrentStep] = useState<'form' | 'gallery'>('form');

  // Business Information State
  const [selectedProfession, setSelectedProfession] = useState<ProfessionCategoryKey>('tractor');
  const [businessName, setBusinessName] = useState<string>(
    initialBusinessName || PROFESSION_PRESETS.tractor.defaultBusiness
  );
  const [offerHeadline, setOfferHeadline] = useState<string>(
    PROFESSION_PRESETS.tractor.defaultOffer
  );
  const [priceTag, setPriceTag] = useState<string>(
    PROFESSION_PRESETS.tractor.defaultPrice
  );
  const [tagline, setTagline] = useState<string>(
    PROFESSION_PRESETS.tractor.defaultTagline
  );
  const [servicesList, setServicesList] = useState<string[]>(
    PROFESSION_PRESETS.tractor.defaultServices
  );
  const [phone, setPhone] = useState<string>(initialPhone || '9829012345');
  const [location, setLocation] = useState<string>(initialLocation || 'सांगानेर, जयपुर');

  // Product Image State
  const [customProductImageBlobUrl, setCustomProductImageBlobUrl] = useState<string | null>(null);
  const [isCompressingImage, setIsCompressingImage] = useState<boolean>(false);
  const loadedProductImgRef = useRef<HTMLImageElement | null>(null);

  // Audio & Voiceover Control
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceoverEnabled, setIsVoiceoverEnabled] = useState<boolean>(true);

  // Active Template & Preview
  const [activeGalleryTemplate, setActiveGalleryTemplate] = useState<TemplateStyleKey>('royal_gold');
  const [activeSceneTab, setActiveSceneTab] = useState<number>(1);
  const [previewTimeSec, setPreviewTimeSec] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Export & Recording
  const [recordedVideos, setRecordedVideos] = useState<Record<TemplateStyleKey, string>>({} as any);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTemplateKey, setRecordingTemplateKey] = useState<TemplateStyleKey | null>(null);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [exportSuccessMsg, setExportSuccessMsg] = useState<string | null>(null);

  // Canvas Refs
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timelineStartTimeRef = useRef<number>(0);
  const lastSceneRef = useRef<number>(0);

  // Sync initial props
  useEffect(() => {
    if (initialBusinessName) setBusinessName(initialBusinessName);
    if (initialPhone) setPhone(initialPhone);
    if (initialLocation) setLocation(initialLocation);
  }, [initialBusinessName, initialPhone, initialLocation]);

  // Load and cache product image for canvas
  useEffect(() => {
    const targetUrl = customProductImageBlobUrl || PROFESSION_PRESETS[selectedProfession].defaultImage;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedProductImgRef.current = img;
    };
    img.src = targetUrl;
  }, [customProductImageBlobUrl, selectedProfession]);

  // Clean up Blob URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(recordedVideos).forEach((url) => {
        if (typeof url === 'string' && url) URL.revokeObjectURL(url);
      });
      if (customProductImageBlobUrl) {
        URL.revokeObjectURL(customProductImageBlobUrl);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      videoAudioEngine.destroy();
    };
  }, [recordedVideos, customProductImageBlobUrl]);

  // Audio start/stop on open
  useEffect(() => {
    if (isOpen && currentStep === 'gallery' && isPlaying && !isAudioMuted) {
      videoAudioEngine.startBackgroundMusic(activeGalleryTemplate);
    } else {
      videoAudioEngine.stopBackgroundMusic();
      videoAudioEngine.resetVoiceoverSync();
    }
  }, [isOpen, currentStep, isPlaying, isAudioMuted, activeGalleryTemplate]);

  // Handle Profession Switch
  const handleProfessionChange = (profKey: ProfessionCategoryKey) => {
    setSelectedProfession(profKey);
    const preset = PROFESSION_PRESETS[profKey];
    setBusinessName(preset.defaultBusiness);
    setOfferHeadline(preset.defaultOffer);
    setPriceTag(preset.defaultPrice);
    setTagline(preset.defaultTagline);
    setServicesList(preset.defaultServices);
  };

  // --- CLIENT-SIDE ULTRA IMAGE COMPRESSION (Max 800x800 WebP <80KB) ---
  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressingImage(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                if (customProductImageBlobUrl) {
                  URL.revokeObjectURL(customProductImageBlobUrl);
                }
                const newUrl = URL.createObjectURL(blob);
                setCustomProductImageBlobUrl(newUrl);
              }
              setIsCompressingImage(false);
            },
            'image/webp',
            0.82
          );
        } else {
          setIsCompressingImage(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // ==================== ULTRA-HIGH STUDIO GRAPHICS & CANVAS MOTION SHADERS ====================
  const drawUltraCommercialFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      timeSec: number,
      template: TemplateStyleKey,
      width: number,
      height: number
    ) => {
      const preset = PROFESSION_PRESETS[selectedProfession];
      const normalizedTime = timeSec % VIDEO_TOTAL_DURATION_SEC;
      const progress = normalizedTime / VIDEO_TOTAL_DURATION_SEC;

      // Identify Current Scene (1 to 4)
      let currentScene = 1;
      if (normalizedTime >= SCENE_3_END) currentScene = 4;
      else if (normalizedTime >= SCENE_2_END) currentScene = 3;
      else if (normalizedTime >= SCENE_1_END) currentScene = 2;

      // Trigger SFX, Indian Neural Voiceover & Audio Ducking on Scene Change
      if (lastSceneRef.current !== currentScene) {
        lastSceneRef.current = currentScene;
        videoAudioEngine.playWhooshSFX();

        if (currentScene === 3) {
          videoAudioEngine.playPopChimeSFX();
        } else if (currentScene === 4) {
          videoAudioEngine.playGrandChimeSFX();
        }

        videoAudioEngine.speakSceneVoiceover(currentScene, {
          businessName,
          services: servicesList,
          offer: offerHeadline,
          price: priceTag,
          phone,
          location
        });
      }

      ctx.clearRect(0, 0, width, height);

      // ----------------------------------------------------
      // 1. TEMPLATE-SPECIFIC 3D GRAPHICS & AMBIENT SHADERS
      // ----------------------------------------------------
      if (template === 'royal_gold') {
        // 3D Luxury Royal Gold Mesh & Ambient Studio Lighting
        const grad = ctx.createRadialGradient(
          width / 2 + Math.sin(normalizedTime * 0.4) * 120,
          height / 2,
          40,
          width / 2,
          height / 2,
          width * 0.8
        );
        grad.addColorStop(0, '#2b1b04'); // Dark Gold Core
        grad.addColorStop(0.5, '#120d03');
        grad.addColorStop(1, '#000000');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Floating Golden Dust Particles
        ctx.fillStyle = '#fde047';
        for (let i = 0; i < 45; i++) {
          const px = (Math.sin(i * 37 + normalizedTime * 0.5) * 0.5 + 0.5) * width;
          const py = (Math.cos(i * 19 + normalizedTime * 0.35) * 0.5 + 0.5) * height;
          const pRadius = (Math.sin(i + normalizedTime * 2) * 0.5 + 0.5) * 2.8 + 1;
          const pAlpha = (Math.sin(i * 2 + normalizedTime * 1.5) * 0.5 + 0.5) * 0.45 + 0.1;
          ctx.globalAlpha = pAlpha;
          ctx.beginPath();
          ctx.arc(px, py, pRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      } else if (template === 'tv_broadcast') {
        // Real Prime-Time HD TV News Studio
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#660b0b');
        grad.addColorStop(0.5, '#18181b');
        grad.addColorStop(1, '#09090b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Studio Hex Grid Dots
        ctx.fillStyle = 'rgba(239, 68, 68, 0.09)';
        for (let x = 25; x < width; x += 45) {
          for (let y = 60; y < height - 70; y += 45) {
            ctx.beginPath();
            ctx.arc(x, y, 2.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      } else if (template === 'apple_glass') {
        // Apple-Style Minimalist Frosted Glass & Obsidian Depth
        const grad = ctx.createRadialGradient(width / 2, height / 2, 60, width / 2, height / 2, width * 0.75);
        grad.addColorStop(0, '#0c1a2e');
        grad.addColorStop(0.6, '#070d18');
        grad.addColorStop(1, '#020408');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Ambient Cyan Light Flare
        const flareGrad = ctx.createRadialGradient(width * 0.8, 120, 10, width * 0.8, 120, 260);
        flareGrad.addColorStop(0, 'rgba(14, 165, 233, 0.15)');
        flareGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = flareGrad;
        ctx.fillRect(0, 0, width, height);
      } else if (template === 'ipl_kinetic') {
        // IPL High-Velocity Kinetic Gradient & Speed Streaks
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#031b38');
        grad.addColorStop(0.5, '#1e1b4b');
        grad.addColorStop(1, '#022c22');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Animated High-Speed Kinetic Streaks
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
        ctx.lineWidth = 3;
        const streakShift = (normalizedTime * 340) % (width + 400);
        for (let i = 0; i < 6; i++) {
          const sx = streakShift - i * 150;
          ctx.beginPath();
          ctx.moveTo(sx, 0);
          ctx.lineTo(sx + 320, height);
          ctx.stroke();
        }
      } else {
        // Festive Grand Commerce Blast (Confetti & Golden Ribbons)
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#7c2d12');
        grad.addColorStop(0.5, '#431407');
        grad.addColorStop(1, '#18181b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        const confettiColors = ['#fbbf24', '#f87171', '#34d399', '#60a5fa', '#e879f9'];
        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = confettiColors[i % confettiColors.length];
          const cx = (Math.sin(i * 73 + normalizedTime * 1.2) * 0.5 + 0.5) * width;
          const cy = (Math.cos(i * 41 + normalizedTime * 0.9) * 0.5 + 0.5) * height;
          const cRot = normalizedTime * 3.5 + i;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(cRot);
          ctx.fillRect(-6, -3, 12, 6);
          ctx.restore();
        }
      }

      // ----------------------------------------------------
      // 2. BROADCAST TV TOP BAR & 30s TIMELINE SCENE DIVIDERS
      // ----------------------------------------------------
      ctx.fillStyle = 'rgba(2, 6, 23, 0.94)';
      ctx.fillRect(0, 0, width, 52);

      // LIVE HD Badge
      const isRedBlink = Math.floor(normalizedTime * 2) % 2 === 0;
      ctx.fillStyle = isRedBlink ? '#ef4444' : '#dc2626';
      ctx.beginPath();
      ctx.arc(28, 26, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('LIVE HD AD', 42, 31);

      // Scene Indicator
      ctx.fillStyle = template === 'royal_gold' ? '#fbbf24' : '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`SCENE ${currentScene}/4 • ${Math.floor(normalizedTime)}s`, 175, 31);

      // Watermark
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('📺 ग्राम सेवा टीवी • 1080P HD', width - 20, 31);
      ctx.textAlign = 'left';

      // 30s Progress Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fillRect(0, 52, width, 5);

      ctx.fillStyle = template === 'royal_gold' ? '#fbbf24' : template === 'ipl_kinetic' ? '#06b6d4' : '#22c55e';
      ctx.fillRect(0, 52, width * progress, 5);

      [SCENE_1_END / 30, SCENE_2_END / 30, SCENE_3_END / 30].forEach((m) => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(width * m - 1, 50, 2, 9);
      });

      // ----------------------------------------------------
      // 3. BROADCAST LOWER-THIRD / LIVE TICKER TAPE
      // ----------------------------------------------------
      ctx.fillStyle = template === 'tv_broadcast' ? '#991b1b' : 'rgba(2, 6, 23, 0.96)';
      ctx.fillRect(0, height - 70, width, 70);

      if (template === 'tv_broadcast') {
        const tickerX = width - ((normalizedTime * 140) % (width + 850));
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 17px sans-serif';
        ctx.fillText(
          `🔴 लाइव बुलेटिन: ${businessName} — ${offerHeadline} • ⚡ ${priceTag} • 📞 ${phone} • 📍 ${location}`,
          tickerX,
          height - 27
        );
      } else {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`📞 कॉल / WhatsApp: ${phone}`, 24, height - 39);

        ctx.fillStyle = '#38bdf8';
        ctx.font = '15px sans-serif';
        ctx.fillText(`📍 ${location}`, 24, height - 16);

        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('⭐ ग्राम सेवा 100% प्रमाणित', width - 24, height - 39);

        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText('विश्वसनीय व वेरिफाइड लोकल बिज़नेस', width - 24, height - 16);
        ctx.textAlign = 'left';
      }

      // ----------------------------------------------------
      // 4. 4-SCENE CHOREOGRAPHY & 3D PRODUCT SHOWCASE
      // ----------------------------------------------------

      // ==================== SCENE 1: 3D HOOK & BUSINESS INTRO (0s - 6s) ====================
      if (normalizedTime < SCENE_1_END) {
        const scenePhase = normalizedTime / SCENE_1_END;
        const enterProgress = easeOutCubic(Math.min(1, scenePhase * 1.6));
        const alpha = normalizedTime > SCENE_1_END - 0.5 ? (SCENE_1_END - normalizedTime) / 0.5 : 1;
        ctx.globalAlpha = Math.max(0, alpha);

        const leftCenterX = width * 0.35;
        const rightCenterX = width * 0.75;
        const centerY = 240;

        ctx.textAlign = 'center';

        // Profession Emoji Logo with Pulse
        const emojiBounce = Math.sin(normalizedTime * 5) * 6;
        ctx.font = '56px sans-serif';
        ctx.fillText(preset.emoji, leftCenterX, 130 + emojiBounce);

        // Shop Name Typography with 3D Drop Shadows
        if (template === 'royal_gold') {
          ctx.fillStyle = '#fde047';
          ctx.font = `bold ${Math.round(34 * enterProgress)}px serif`;
          ctx.shadowColor = '#d97706';
          ctx.shadowBlur = 22;
          ctx.fillText(businessName, leftCenterX, 185);
          ctx.shadowBlur = 0;
        } else if (template === 'ipl_kinetic') {
          ctx.fillStyle = '#38bdf8';
          ctx.font = `bold ${Math.round(36 * enterProgress)}px sans-serif`;
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 24;
          ctx.fillText(businessName, leftCenterX, 185);
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(34 * enterProgress)}px sans-serif`;
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 14;
          ctx.fillText(businessName, leftCenterX, 185);
          ctx.shadowBlur = 0;
        }

        // Category Tag Pill
        const pillW = 240;
        ctx.fillStyle = template === 'tv_broadcast' ? '#dc2626' : template === 'apple_glass' ? '#0284c7' : '#d97706';
        ctx.beginPath();
        ctx.roundRect(leftCenterX - pillW / 2, 210, pillW, 36, 18);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(preset.label, leftCenterX, 234);

        // Tagline
        ctx.fillStyle = '#cbd5e1';
        ctx.font = '16px sans-serif';
        ctx.fillText(tagline, leftCenterX, 285);

        // RIGHT SIDE: 3D ROTATING GLASS FRAME PRODUCT HIGHLIGHT (Scene 1)
        if (loadedProductImgRef.current) {
          const imgSize = 210;
          const imgX = rightCenterX - imgSize / 2;
          const imgY = 110;

          ctx.save();
          // 3D Tilt Angle & Glass Specular Highlights
          const tilt = Math.sin(normalizedTime * 2.5) * 0.06;
          ctx.translate(rightCenterX, centerY - 20);
          ctx.rotate(tilt);

          // 3D Glassmorphism Frame
          ctx.fillStyle = template === 'apple_glass' ? 'rgba(14, 165, 233, 0.15)' : 'rgba(251, 191, 36, 0.16)';
          ctx.strokeStyle = template === 'apple_glass' ? '#38bdf8' : '#fbbf24';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.roundRect(-imgSize / 2 - 10, -imgSize / 2 - 10, imgSize + 20, imgSize + 20, 24);
          ctx.fill();
          ctx.stroke();

          // Clip and Draw Product Photo
          ctx.beginPath();
          ctx.roundRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize, 20);
          ctx.clip();
          ctx.drawImage(loadedProductImgRef.current, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

          // Specular Light Sheen Sweep
          const sheenX = -imgSize / 2 + ((normalizedTime * 190) % (imgSize * 2.2));
          const sheenGrad = ctx.createLinearGradient(sheenX, -imgSize / 2, sheenX + 60, imgSize / 2);
          sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.45)');
          sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = sheenGrad;
          ctx.fillRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize);

          ctx.restore();
        }

        ctx.textAlign = 'left';
      }

      // ==================== SCENE 2: KINETIC SERVICES GRID (6s - 15s) ====================
      else if (normalizedTime >= SCENE_1_END && normalizedTime < SCENE_2_END) {
        const sceneTime = normalizedTime - SCENE_1_END;
        const alpha = normalizedTime > SCENE_2_END - 0.5 ? (SCENE_2_END - normalizedTime) / 0.5 : 1;
        ctx.globalAlpha = Math.max(0, alpha);

        ctx.textAlign = 'center';
        ctx.fillStyle = template === 'royal_gold' ? '#fbbf24' : '#38bdf8';
        ctx.font = 'bold 25px sans-serif';
        ctx.fillText('⭐ हमारी मुख्य सेवाएं व विशेषताएं ⭐', width / 2, 95);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(businessName, width / 2, 125);
        ctx.textAlign = 'left';

        // 4 Service Cards Grid
        const validServices = servicesList.length > 0 ? servicesList.slice(0, 4) : preset.defaultServices;
        validServices.forEach((service, index) => {
          const itemTriggerTime = index * 1.4;
          if (sceneTime < itemTriggerTime) return;

          const itemEased = easeOutCubic(Math.min(1, (sceneTime - itemTriggerTime) * 2));
          const col = index % 2;
          const row = Math.floor(index / 2);

          const cardW = (width - 70) / 2;
          const cardH = 72;
          const cardX = 25 + col * (cardW + 20);
          const cardY = 150 + row * (cardH + 16);

          ctx.fillStyle =
            template === 'ipl_kinetic'
              ? 'rgba(6, 182, 212, 0.25)'
              : template === 'royal_gold'
              ? 'rgba(217, 119, 6, 0.25)'
              : 'rgba(30, 41, 59, 0.85)';
          ctx.strokeStyle = template === 'royal_gold' ? '#d97706' : template === 'ipl_kinetic' ? '#38bdf8' : '#475569';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(cardX, cardY, cardW * itemEased, cardH, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#10b981';
          ctx.font = 'bold 20px sans-serif';
          ctx.fillText('✓', cardX + 16, cardY + 44);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText(service, cardX + 42, cardY + 44, cardW - 55);
        });
      }

      // ==================== SCENE 3: 3D PRODUCT SPOTLIGHT & SPECIAL OFFERS (15s - 23s) ====================
      else if (normalizedTime >= SCENE_2_END && normalizedTime < SCENE_3_END) {
        const sceneTime = normalizedTime - SCENE_2_END;
        const alpha = normalizedTime > SCENE_3_END - 0.5 ? (SCENE_3_END - normalizedTime) / 0.5 : 1;
        ctx.globalAlpha = Math.max(0, alpha);

        const leftX = width * 0.28;
        const rightX = width * 0.65;

        // LEFT: 3D PRODUCT SPOTLIGHT ZOOM & CALLOUT BADGE
        if (loadedProductImgRef.current) {
          const imgSize = 220;
          const imgY = 105;

          ctx.save();
          const pulse = Math.sin(sceneTime * 6) * 0.05 + 1.0;
          ctx.translate(leftX, imgY + imgSize / 2);
          ctx.scale(pulse, pulse);

          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = template === 'apple_glass' ? '#38bdf8' : '#fbbf24';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.roundRect(-imgSize / 2 - 6, -imgSize / 2 - 6, imgSize + 12, imgSize + 12, 22);
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.roundRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize, 18);
          ctx.clip();
          ctx.drawImage(loadedProductImgRef.current, -imgSize / 2, -imgSize / 2, imgSize, imgSize);
          ctx.restore();

          // Pinned "धमाका ऑफर" callout badge
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.roundRect(leftX - 70, imgY + imgSize - 20, 140, 32, 16);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('🔥 स्पेशल ऑफर', leftX, imgY + imgSize + 2);
        }

        // RIGHT: BIG PRICING & OFFER CALLOUTS
        ctx.textAlign = 'center';

        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(rightX - 190, 95, 380, 48, 24);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 21px sans-serif';
        ctx.fillText('⚡ लिमिटेड टाइम ऑफर ⚡', rightX, 127);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px sans-serif';
        ctx.shadowColor = '#000000';
        ctx.shadowBlur = 12;
        ctx.fillText(offerHeadline, rightX, 185);
        ctx.shadowBlur = 0;

        // Pricing Box
        const priceW = 360;
        ctx.fillStyle = template === 'royal_gold' ? '#fbbf24' : '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(rightX - priceW / 2, 215, priceW, 58, 20);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText(`⚡ ${priceTag} ⚡`, rightX, 252);

        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText(`✓ ${tagline} • तुरंत बुकिंग पर उपहार`, rightX, 310);

        ctx.textAlign = 'left';
      }

      // ==================== SCENE 4: CALL TO ACTION & CONTACT INFO (23s - 30s) ====================
      else {
        const sceneTime = normalizedTime - SCENE_3_END;
        ctx.globalAlpha = 1.0;

        ctx.textAlign = 'center';

        const ctaPulse = Math.sin(sceneTime * 8) * 0.05 + 1.0;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.roundRect(width / 2 - 240 * ctaPulse, 80, 480 * ctaPulse, 54 * ctaPulse, 27);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(25 * ctaPulse)}px sans-serif`;
        ctx.fillText('📢 देर न करें, आज ही संपर्क करें!', width / 2, 115);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.fillText(businessName, width / 2, 175);

        // Huge Phone Dialer Card
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = template === 'royal_gold' ? '#fbbf24' : '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(width / 2 - 220, 205, 440, 72, 20);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 34px monospace';
        ctx.fillText(`📱 ${phone}`, width / 2, 252);

        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(`💬 WhatsApp: ${phone} • 📍 ${location}`, width / 2, 318);

        ctx.textAlign = 'left';
      }

      ctx.globalAlpha = 1.0;
    },
    [selectedProfession, businessName, offerHeadline, priceTag, tagline, servicesList, phone, location]
  );

  // Live Canvas 60FPS Animation Loop
  useEffect(() => {
    if (!isOpen) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;
    timelineStartTimeRef.current = performance.now();

    const loop = (timestamp: number) => {
      if (!isSubscribed) return;

      const elapsedSec = (timestamp - timelineStartTimeRef.current) / 1000;
      const normalized = elapsedSec % VIDEO_TOTAL_DURATION_SEC;
      setPreviewTimeSec(normalized);

      if (normalized < SCENE_1_END) setActiveSceneTab(1);
      else if (normalized < SCENE_2_END) setActiveSceneTab(2);
      else if (normalized < SCENE_3_END) setActiveSceneTab(3);
      else setActiveSceneTab(4);

      drawUltraCommercialFrame(ctx, elapsedSec, activeGalleryTemplate, canvas.width, canvas.height);

      if (isPlaying || isRecording) {
        animationFrameRef.current = requestAnimationFrame(loop);
      }
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      isSubscribed = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isOpen, activeGalleryTemplate, isPlaying, isRecording, drawUltraCommercialFrame]);

  // Jump to specific scene
  const handleJumpToScene = (sceneNum: number) => {
    let targetSec = 0;
    if (sceneNum === 1) targetSec = 0;
    else if (sceneNum === 2) targetSec = 6.2;
    else if (sceneNum === 3) targetSec = 15.2;
    else if (sceneNum === 4) targetSec = 23.2;

    timelineStartTimeRef.current = performance.now() - targetSec * 1000;
    setActiveSceneTab(sceneNum);
    lastSceneRef.current = 0;
  };

  // ==================== 1080P 60FPS CLIENT-SIDE EXPORT WITH AUDIO TRACK ====================
  const handleRecordTemplateVideo = async (targetTemplate: TemplateStyleKey): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = previewCanvasRef.current;
      if (!canvas) {
        reject(new Error('Canvas not found'));
        return;
      }

      try {
        setIsRecording(true);
        setRecordingTemplateKey(targetTemplate);
        setRecordingProgress(0);
        setActiveGalleryTemplate(targetTemplate);

        const chunks: Blob[] = [];
        timelineStartTimeRef.current = performance.now();
        lastSceneRef.current = 0;

        // 1. Capture 60 FPS Video Stream from Canvas
        const stream = canvas.captureStream(60);

        // 2. Mix in Synthesized Audio Track
        const audioTrack = videoAudioEngine.getAudioStreamTrack();
        if (audioTrack) {
          try {
            stream.addTrack(audioTrack);
          } catch (e) {
            console.warn('Audio track add warning', e);
          }
        }

        let mimeType = 'video/webm;codecs=vp9,opus';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8,opus';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: 6000000 // 6.0 Mbps crisp 1080p broadcast quality
        });

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: recorder.mimeType || 'video/webm' });
          const blobUrl = URL.createObjectURL(blob);

          setRecordedVideos((prev) => ({
            ...prev,
            [targetTemplate]: blobUrl
          }));

          setIsRecording(false);
          setRecordingTemplateKey(null);
          setRecordingProgress(100);
          resolve(blobUrl);
        };

        recorder.start(100);

        const recStart = Date.now();
        const totalRecMs = 30000;

        const interval = setInterval(() => {
          const elapsed = Date.now() - recStart;
          const p = Math.min(99, Math.round((elapsed / totalRecMs) * 100));
          setRecordingProgress(p);

          if (elapsed >= totalRecMs) {
            clearInterval(interval);
            if (recorder.state === 'recording') {
              recorder.stop();
            }
          }
        }, 100);
      } catch (err) {
        setIsRecording(false);
        setRecordingTemplateKey(null);
        reject(err);
      }
    });
  };

  // Download Video to user device
  const handleDownloadVideo = async (templateKey: TemplateStyleKey) => {
    let videoUrl = recordedVideos[templateKey];
    if (!videoUrl) {
      try {
        videoUrl = await handleRecordTemplateVideo(templateKey);
      } catch (err) {
        alert('वीडियो रिकॉर्डिंग में समस्या आई।');
        return;
      }
    }

    const a = document.createElement('a');
    a.href = videoUrl;
    a.download = `${businessName.replace(/\s+/g, '_')}_${templateKey}_30s_Commercial.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Publish to top TV Banner
  const handleSelectAndPublishAd = (templateKey: TemplateStyleKey) => {
    const canvas = previewCanvasRef.current;
    const posterDataUrl = canvas
      ? canvas.toDataURL('image/jpeg', 0.85)
      : 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80';

    const videoUrl =
      recordedVideos[templateKey] ||
      'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

    const selectedStyle = TEMPLATE_STYLES.find((t) => t.id === templateKey);

    const newAd: VideoAdItem = {
      id: `custom-commercial-30s-${templateKey}-${Date.now()}`,
      title: `${businessName} — 30s ${selectedStyle?.hindiName || 'स्पेशल'} टीवी कमर्शियल`,
      businessName: businessName,
      offerText: `${offerHeadline} • ${priceTag}`,
      category: PROFESSION_PRESETS[selectedProfession].label,
      videoUrl: videoUrl,
      posterUrl: posterDataUrl,
      phone: phone,
      whatsapp: phone,
      location: location,
      badgeLabel: '🔴 30s TV COMMERCIAL',
      discountTag: '⚡ स्पेशल कमर्शियल',
      expiresInText: 'आपका 30-सेकंड लाइव टीवी कमर्शियल'
    };

    if (onAdCreated) {
      onAdCreated(newAd);
    }

    setExportSuccessMsg(`🎉 "${selectedStyle?.hindiName}" 30-सेकंड टीवी कमर्शियल मुख्य टीवी बैनर में लाइव हो गया!`);
    setTimeout(() => {
      onClose();
    }, 1300);
  };

  if (!isOpen) return null;

  return (
    <div
      id="modal-commercial-video-generator"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-3xl w-full max-w-5xl border-3 border-amber-400 shadow-2xl my-auto flex flex-col max-h-[96vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* ==================== 1. MODAL HEADER ==================== */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white flex items-center justify-between border-b border-amber-400/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-md">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white">
                  🎬 30-सेकंड टीवी कमर्शियल वीडियो जनरेटर
                </h3>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  5 STUDIO TEMPLATES
                </span>
                <span className="bg-cyan-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  NATURAL INDIAN VOICE & DUCKING
                </span>
              </div>
              <p className="text-xs text-amber-300 font-medium mt-0.5">
                3D ग्लासमोर्फिज्म, नेचुरल हिंदी वॉयसओवर, ऑटो ऑडियो डकिंग व 1080P एचडी एक्सपोर्ट
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ==================== 2. WORKSPACE ==================== */}
        {currentStep === 'form' ? (
          // ==================== STEP 1: CONFIG & PRODUCT PHOTO UPLOAD ====================
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-5">
            
            {/* Notification Banner */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl flex items-center gap-3 text-xs text-slate-900 font-bold">
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                अपनी दुकान / प्रोडक्ट की फ़ोटो अपलोड करें। सिस्टम इसे ब्राउज़र में कंप्रेस करेगा और <b>5 अलग-अलग स्टूडियो-ग्रेड 30s विज्ञापनों</b> में 3D ग्लास इफ़ेक्ट्स व नेचुरल हिंदी वॉयसओवर के साथ तैयार करेगा!
              </span>
            </div>

            {/* Profession / Category Selector */}
            <div>
              <label className="block text-xs font-black text-slate-900 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-amber-600" />
                  <span>1. बिज़नेस कैटेगरी चुनें (Select Category) *</span>
                </span>
                <span className="text-[11px] text-emerald-700 font-bold">10+ रेडीमेड प्रोफेशन्स</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                {(Object.keys(PROFESSION_PRESETS) as ProfessionCategoryKey[]).map((key) => {
                  const preset = PROFESSION_PRESETS[key];
                  const isSelected = selectedProfession === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleProfessionChange(key)}
                      className={`p-2.5 rounded-xl text-left text-xs font-bold transition-all flex flex-col gap-1 border ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm font-black ring-2 ring-amber-400/40'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span className="text-2xl">{preset.emoji}</span>
                      <span className="truncate">{preset.label.split('(')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product / Shop Photo Upload (Client-Side Compression) */}
            <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-200 border-2 border-amber-400 shrink-0 shadow-sm relative">
                  <img
                    src={customProductImageBlobUrl || PROFESSION_PRESETS[selectedProfession].defaultImage}
                    alt="Product Preview"
                    className="w-full h-full object-cover"
                  />
                  {customProductImageBlobUrl && (
                    <span className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[8px] font-black text-center py-0.5">
                      CUSTOM
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span>2. दुकान / सामान की फोटो अपलोड करें (Product Photo)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    30s वीडियो में 3D फ्लोटिंग फ्रेम व स्पॉटलाइट में दिखेगी (Auto WebP Compressed)
                  </p>
                </div>
              </div>

              <label className="w-full sm:w-auto py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 border-2 border-slate-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-95 transition-all">
                <Upload className="w-4 h-4 text-amber-600" />
                <span>{isCompressingImage ? 'कंप्रेस हो रहा है...' : 'फोटो चुनें / बदलें'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Business Name */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  दुकान / फर्म का नाम (Business Name) *
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="उदा: चौधरी ट्रैक्टर्स & एग्री वर्क्स"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Tagline */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  विशेषता / टैगलाइन (Tagline)
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="उदा: महिंद्रा, स्वराज अधिकृत डीलर"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Offer Headline */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  ऑफर / डिस्काउंट (Big Offer Headline) *
                </label>
                <input
                  type="text"
                  required
                  value={offerHeadline}
                  onChange={(e) => setOfferHeadline(e.target.value)}
                  placeholder="उदा: पुराने ट्रैक्टर पर ₹50,000 तक छूट!"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Price / Rate Highlight */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  रेट / फाइनेंस ऑफर (Price Tag / Lower-Third)
                </label>
                <input
                  type="text"
                  value={priceTag}
                  onChange={(e) => setPriceTag(e.target.value)}
                  placeholder="उदा: 0% डाउनपेमेंट फाइनेंस उपलब्ध"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  मोबाइल / WhatsApp नंबर *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-अंकों का नंबर"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  दुकान का पता / स्थान (Location)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="उदा: सांगानेर, जयपुर"
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            {/* Services List (Scene 2) */}
            <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl flex flex-col gap-2.5">
              <label className="block text-xs font-black text-slate-900 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>3. मुख्य सेवाएं (Scene 2 Services - 4 बुलेट्स) *</span>
                </span>
                <span className="text-[10px] text-slate-500">30s वीडियो के 6s-15s में दिखेंगे</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {servicesList.map((srv, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-black text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={srv}
                      onChange={(e) => {
                        const copy = [...servicesList];
                        copy[idx] = e.target.value;
                        setServicesList(copy);
                      }}
                      placeholder={`सेवा #${idx + 1}`}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Next Button: Generate 5 Variations */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep('gallery')}
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg border border-amber-500 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 fill-slate-950" />
                <span>🎬 5 स्टूडियो टीवी कमर्शियल तैयार करें (Preview 5 Studio Variations)</span>
                <ChevronRight className="w-5 h-5 stroke-[3]" />
              </button>
            </div>

          </div>
        ) : (
          // ==================== STEP 2: 5-OPTION GALLERY & AUDIO STAGE ====================
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4">
            
            {/* Gallery Top Navigation Bar */}
            <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-slate-200">
              <button
                type="button"
                onClick={() => setCurrentStep('form')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>फॉर्म व फोटो बदलें</span>
              </button>

              <div className="flex items-center gap-3 text-xs font-extrabold text-slate-900">
                {/* Audio Controls */}
                <button
                  type="button"
                  onClick={() => {
                    const newMute = !isAudioMuted;
                    setIsAudioMuted(newMute);
                    videoAudioEngine.setMuted(newMute);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                    !isAudioMuted
                      ? 'bg-amber-100 text-amber-950 border-amber-400'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title={isAudioMuted ? 'म्यूज़िक चालू करें' : 'म्यूट करें'}
                >
                  {!isAudioMuted ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>{!isAudioMuted ? 'म्यूज़िक ऑन' : 'म्यूट'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const newTTS = !isVoiceoverEnabled;
                    setIsVoiceoverEnabled(newTTS);
                    videoAudioEngine.setVoiceoverEnabled(newTTS);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all ${
                    isVoiceoverEnabled
                      ? 'bg-cyan-100 text-cyan-950 border-cyan-400'
                      : 'bg-slate-100 text-slate-600 border-slate-300'
                  }`}
                  title={isVoiceoverEnabled ? 'हिंदी वॉयसओवर बंद करें' : 'हिंदी वॉयसओवर चालू करें'}
                >
                  {isVoiceoverEnabled ? <Mic className="w-3.5 h-3.5 text-cyan-600" /> : <MicOff className="w-3.5 h-3.5" />}
                  <span>{isVoiceoverEnabled ? 'वॉयसओवर + डकिंग ऑन' : 'वॉयस बंद'}</span>
                </button>
              </div>
            </div>

            {/* Notification message */}
            {exportSuccessMsg && (
              <div className="p-3 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs font-bold text-emerald-950 flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{exportSuccessMsg}</span>
              </div>
            )}

            {/* 30-Second Multi-Scene Live Canvas Stage */}
            <div className="bg-slate-950 rounded-2xl p-2.5 sm:p-3 border-2 border-amber-400 shadow-xl flex flex-col gap-2">
              
              {/* Canvas Header */}
              <div className="flex items-center justify-between gap-2 text-white text-xs px-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-amber-300 flex items-center gap-1">
                    <Tv className="w-4 h-4" />
                    <span>30s कमर्शियल: {TEMPLATE_STYLES.find((t) => t.id === activeGalleryTemplate)?.hindiName}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Timeline Scene Jump Buttons */}
                  <div className="hidden sm:flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleJumpToScene(1)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        activeSceneTab === 1 ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Scene 1 (3D Intro)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToScene(2)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        activeSceneTab === 2 ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Scene 2 (Services)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToScene(3)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        activeSceneTab === 3 ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Scene 3 (Product & Offer)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleJumpToScene(4)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                        activeSceneTab === 4 ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      Scene 4 (CTA)
                    </button>
                  </div>

                  <span className="font-mono font-bold text-amber-300 bg-slate-800 px-2 py-0.5 rounded-md text-[11px]">
                    {previewTimeSec.toFixed(1)}s / 30.0s
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold text-xs"
                    title={isPlaying ? 'रोकें' : 'चलाएं'}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  </button>
                </div>
              </div>

              {/* Main Canvas Viewport */}
              <div className="relative w-full aspect-16/9 bg-black rounded-xl overflow-hidden shadow-inner">
                <canvas
                  ref={previewCanvasRef}
                  width={854}
                  height={480}
                  className="w-full h-full object-contain"
                />

                {/* Recording Progress Overlay */}
                {isRecording && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-20">
                    <div className="relative flex h-8 w-8">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-8 w-8 bg-red-600 items-center justify-center font-black text-xs">
                        REC
                      </span>
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-black text-amber-300">
                        1080P HD स्टूडियो कमर्शियल रिकॉर्ड हो रहा है ({recordingTemplateKey})...
                      </p>
                      <p className="text-xs text-slate-300 mt-0.5">
                        MediaRecorder + वॉयसओवर डकिंग ({recordingProgress}%)
                      </p>
                    </div>

                    <div className="w-56 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                      <div
                        className="h-full bg-amber-400 transition-all duration-100"
                        style={{ width: `${recordingProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* ==================== 5 DYNAMIC TEMPLATE CARDS ==================== */}
            <div className="flex flex-col gap-2 pt-2">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide flex items-center justify-between">
                <span>5 स्टूडियो-ग्रेड 30s कमर्शियल टेम्पलेट्स (Choose Brand Style)</span>
                <span className="text-[10px] text-emerald-700 font-bold">1-क्लिक से लागू करें</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {TEMPLATE_STYLES.map((tmpl) => {
                  const isSelected = activeGalleryTemplate === tmpl.id;
                  const isRecorded = Boolean(recordedVideos[tmpl.id]);

                  return (
                    <div
                      key={tmpl.id}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col justify-between gap-2.5 ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-400/30'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Card Header */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${tmpl.badgeColor}`}>
                            {tmpl.badge}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveGalleryTemplate(tmpl.id);
                              timelineStartTimeRef.current = performance.now();
                              lastSceneRef.current = 0;
                            }}
                            className="text-[10px] text-blue-600 font-bold hover:underline"
                          >
                            प्रीव्यू
                          </button>
                        </div>

                        <h5 className="text-xs font-black text-slate-900">{tmpl.hindiName}</h5>
                        <p className="text-[10px] text-slate-600 font-medium leading-tight mt-0.5 line-clamp-2">
                          {tmpl.description}
                        </p>
                      </div>

                      {/* Card Actions */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        
                        {/* Primary Button: Select & Publish Ad */}
                        <button
                          type="button"
                          onClick={() => handleSelectAndPublishAd(tmpl.id)}
                          className="w-full py-2 px-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs rounded-xl shadow-xs border border-emerald-400 flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Tv className="w-3.5 h-3.5" />
                          <span>यह एड चलाएं</span>
                        </button>

                        {/* Download Video Button */}
                        <button
                          type="button"
                          disabled={isRecording}
                          onClick={() => handleDownloadVideo(tmpl.id)}
                          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] rounded-xl border border-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-all cursor-pointer"
                        >
                          <Download className="w-3 h-3 text-amber-600" />
                          <span>{isRecorded ? 'डाउनलोड' : 'रिकॉर्ड & डाउनलोड'}</span>
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Zero Cost & Storage Protection Badge */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <b>100% क्लाइंट-साइड मेमोरी व शून्य फायरबेस लोड:</b> नेचुरल इंडियन वॉइस, ऑटो ऑडियो डकिंग, इमेज कंप्रेसन व 60FPS एचडी वीडियो रेंडरिंग आपके डिवाइस पर होती है। फायरबेस पर 0 बाइट्स का भार पड़ता है!
              </span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
