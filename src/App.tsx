import React, { useState, useEffect, useMemo } from 'react';
import {
  Zap,
  Hammer,
  Wrench,
  Droplets,
  Paintbrush,
  Tractor,
  Smartphone,
  Phone,
  MessageCircle,
  MapPin,
  Search,
  Check,
  ChevronDown,
  Plus,
  Star,
  ShieldCheck,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  X,
  Share2,
  ThumbsUp,
  UserCheck,
  CheckCircle,
  Layers,
  Database,
  Cloud,
  CloudLightning,
  RefreshCw,
  Navigation,
  Sparkles,
  SlidersHorizontal,
  Info,
  Settings,
  ShieldAlert,
  Trash2,
  Lock,
  Mail,
  Key,
  Award,
  Megaphone,
  Send,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Copy,
  Clock,
  CreditCard,
  Tag,
  Eye,
  CheckSquare,
  XCircle,
  AlertCircle,
  Calendar,
  Users,
  Stethoscope,
  Scale,
  Building2,
  Sprout,
  ShoppingBag,
  Store,
  Briefcase,
  FileCheck,
  Image,
  FileText,
  HelpCircle,
  ArrowLeft,
  Compass,
  Crosshair,
  Map as MapIcon,
  Utensils,
  Music,
  Camera,
  Scissors,
  Truck,
  Car,
  Flame,
  Milk,
  Package,
  HardHat,
  Pill,
  Laptop,
  Wheat,
  Flower2,
  Snowflake,
  Sun,
  Shirt,
  Footprints,
  Cog,
  CookingPot
} from 'lucide-react';
import { MapPicker, SingleShopMapView, MultiShopMapView, ShopPinItem } from './components/LeafletMap';
import { VisitingCardModal } from './components/VisitingCardModal';
import { InstallButton, InstallBanner } from './components/InstallButton';
import {
  fetchWorkersFromFirestore,
  saveWorkerToFirestore,
  deleteWorkerFromFirestore,
  updateWorkerVerificationInFirestore,
  updateWorkerRatingInFirestore,
  updateWorkerPasswordInFirestore,
  fetchMasterLocationsFromFirestore,
  fetchMasterCategoriesFromFirestore,
  saveMasterLocationToFirestore,
  saveMasterCategoryToFirestore,
  updateMasterLocationStatusInFirestore,
  updateMasterCategoryStatusInFirestore,
  deleteMasterLocationFromFirestore,
  deleteMasterCategoryFromFirestore,
  isFirebaseInitialized,
  initOrUpdateFirebase,
  getActiveFirebaseConfig,
  DEFAULT_FIREBASE_CONFIG,
  CloudWorker,
  FirebaseCustomConfig,
  MasterLocation,
  MasterCategory
} from './lib/firebase';
import {
  ALL_INDIAN_STATES_AND_UTS,
  ALL_INDIA_LOCATIONS,
  getDistrictsForState,
  getVillagesForDistrict
} from './data/indiaLocations';

// --- Types ---
export interface WorkerService {
  id: string;
  name: string; // Owner Name
  shopName?: string; // Shop / Business Name
  hindiName: string;
  category: string;
  customCategory?: string;
  phone: string;
  whatsapp: string;
  village: string;
  district: string;
  state: string;
  rating: number;
  jobsDone: number;
  experienceYears: number;
  isVerified: boolean;
  verificationStatus?: 'approved' | 'pending' | 'rejected';
  idNumber?: string; // Govt ID / Aadhaar ID Number
  documentPhotoUrl?: string; // Shop Board / ID photo
  avatarUrl: string;
  charges: string;
  skills: string[];
  mapAddress: string;
  lat?: number;
  lng?: number;
  reviewsCount?: number;
  userTags?: string[];
  submittedAt?: number;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

interface NativeAdItem {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  badgeText: string;
  categoryTag: string;
  sponsorName: string;
  iconEmoji: string;
  ctaText: string;
  ctaSub: string;
  ctaUrl: string;
  bgColor: string;
  borderColor: string;
}

// --- FEATURE: Paid Banner Ad Request Interface & Pricing Matrix ---
interface BannerAdRequest {
  id: string;
  businessName: string;
  mobile: string;
  imageUrl: string;
  durationDays: number; // 1, 2, 3, or 5
  price: number; // 99, 150, 230, 349
  utrNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  approvedAt?: number;
  expiryTime?: number;
}

const AD_PRICING_PLANS = [
  { days: 1, price: 99, label: '1 दिन (1 Day)', badge: 'बेसिक प्लान', color: 'border-amber-400 bg-amber-50 text-amber-950 shadow-xs' },
  { days: 2, price: 150, label: '2 दिन (2 Days)', badge: '🔥 सबसे लोकप्रिय (Save ₹48)', color: 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-xs' },
  { days: 3, price: 230, label: '3 दिन (3 Days)', badge: 'बचत प्लान (Save ₹67)', color: 'border-blue-500 bg-blue-50 text-blue-950 shadow-xs' },
  { days: 5, price: 349, label: '5 दिन (5 Days)', badge: '👑 बेस्ट वैल्यू (Save ₹146)', color: 'border-purple-500 bg-purple-50 text-purple-950 shadow-xs' },
];

const INITIAL_BANNER_REQUESTS: BannerAdRequest[] = [
  {
    id: 'ad_req_101',
    businessName: 'चौधरी ट्रैक्टर व कृषि यंत्र वर्कशॉप',
    mobile: '9876543210',
    imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
    durationDays: 3,
    price: 230,
    utrNumber: '422910482910',
    status: 'approved',
    submittedAt: Date.now() - 3600000 * 12,
    approvedAt: Date.now() - 3600000 * 10,
    expiryTime: Date.now() + 3600000 * 62
  },
  {
    id: 'ad_req_102',
    businessName: 'सोमपाल डेरी व पशु आहार केंद्र',
    mobile: '9927104521',
    imageUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?w=600&auto=format&fit=crop&q=80',
    durationDays: 2,
    price: 150,
    utrNumber: '519283746102',
    status: 'pending',
    submittedAt: Date.now() - 1800000
  }
];

const formatRemainingTime = (expiryTime?: number) => {
  if (!expiryTime) return '';
  const diffMs = expiryTime - Date.now();
  if (diffMs <= 0) return 'समाप्त (Expired)';
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days} दिन ${hours} घंटे शेष`;
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours} घंटे ${minutes} मिनट शेष`;
};

// Haversine formula to compute distance in kilometers between two Lat-Long points
export const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10; // Round to 1 decimal place
};

// --- Comprehensive Fallback Location Dataset (All States + Districts + Detailed Rural Villages) ---
const FALLBACK_INDIA_DATA: { [state: string]: { [district: string]: string[] } } = {
  "Uttar Pradesh (उत्तर प्रदेश)": {
    "Ghaziabad (गाजियाबाद)": [
      "Kalchina (कलछीना)",
      "Nigrawathi (निगरावठी)",
      "Samaypur (समयपुर)",
      "Akalpur (अकलपुर)",
      "Nurpur (नूरपुर)",
      "Barayla (बरैला)",
      "Mindori (मिंडोरी)",
      "Nindori (निंदोरी)",
      "Nahal (नाहल)",
      "Dasna (डासना)",
      "Loni (लोणी)",
      "Modinagar (मोदीनगर)",
      "Muradnagar (मुरादनगर)",
      "Bhojpur (भोजपुर)",
      "Razapur (रजापुर)",
      "Farrukhnagar (फर्रुखनगर)",
      "Duhai (दुहाई)",
      "Sikrod (सकरोड़)",
      "Morta (मोर्ता)",
      "Morti (मोर्ती)",
      "Jalalabad (जलालाबाद)",
      "Khindora (खिंदोरा)",
      "Shahpur (शाहपुर)",
      "Govindpuri (गोविंदपुरी)"
    ],
    "Meerut (मेरठ)": [
      "Mawana (मवाना)",
      "Sardhana (सरधना)",
      "Hastinapur (हस्तिनापुर)",
      "Parikshitgarh (परीक्षितगढ़)",
      "Daurala (दौराला)",
      "Kithore (किठौर)",
      "Janakpuri (जनकपुरी)",
      "Lawar (नावड़)"
    ],
    "Bulandshahr (बुलंदशहर)": [
      "Sikandrabad (सिकंदराबाद)",
      "Anupshahr (अनूपशहर)",
      "Khurja (खुरजा)",
      "Gulaothi (गुनावठी)",
      "Jahangirabad (जहांगीराबाद)",
      "Pahasu (पहासू)",
      "Chhatari (छतारी)"
    ],
    "Lucknow (लखनऊ)": [
      "Bakshi Ka Talab (बख्शी का तालाब)",
      "Mohanlalganj (मोहनलालगंज)",
      "Sarojini Nagar (सरोजिनी नगर)",
      "Gosainganj (गोसाईं गंज)",
      "Kakori (काकोरी)",
      "Maliahabad (मलिहाबाद)"
    ],
    "Varanasi (वाराणसी)": [
      "Pindra (पिंडरा)",
      "Cholapur (चोलापुर)",
      "Kashi Vidyapeeth (काशी विद्यापीठ)",
      "Arajiline (आराजीलाइन)",
      "Sevapuri (सेवापुरी)",
      "Harahua (हरहुआ)"
    ],
    "Gorakhpur (गोरखपुर)": [
      "Sahjanwa (सहजनवा)",
      "Bansgaon (बांसगांव)",
      "Campierganj (कैंपियरगंज)",
      "Pipraich (पिपराइच)",
      "Chauri Chaura (चौरी चौरा)",
      "Brahmpur (ब्रह्मपुर)"
    ],
    "Agra (आगरा)": [
      "Fatehabad (फतेहाबाद)",
      "Etmadpur (एत्मादपुर)",
      "Kheragarh (खेरागढ़)",
      "Bah (बाह)",
      "Pinahat (पिनाहट)",
      "Jagner (जागनेर)"
    ],
    "Kanpur Nagar (कानपुर नगर)": [
      "Bilhaur (बिल्हौर)",
      "Ghatampur (घाटमपुर)",
      "Kalyanpur (कल्याणपुर)",
      "Sarsaul (सरसौल)"
    ]
  },
  "Bihar (बिहार)": {
    "Patna (पटना)": ["Bihta (बिहटा)", "Danapur (दानापुर)", "Phulwari Sharif (फुलवारी शरीफ)", "Fatuha (फतुहा)", "Bakhtiyarpur (बख्तियारपुर)", "Pali-Ganj (पालीगंज)"],
    "Gaya (गया)": ["Bodhgaya (बोधगया)", "Tekari (टेकानी)", "Sherghati (शेरघाटी)", "Belaganj (बेलागंज)", "Wazirganj (वज़ीरगंज)"],
    "Muzaffarpur (मुजफ्फरपुर)": ["Kanti (कांटी)", "Motipur (मोतीपुर)", "Sakra (सकरा)", "Bochahan (बोचहां)", "Aurai (औरई)"],
    "Darbhanga (दरभंगा)": ["Benipur (बेनीपुर)", "Birole (बिरौल)", "Keoti (केवटी)", "Jale (जाले)"]
  },
  "Rajasthan (राजस्थान)": {
    "Jaipur (जयपुर)": ["Chomu (चौमूं)", "Amber (आमेर)", "Sanganer (सांगानेर)", "Bassi (बस्सी)", "Phulera (फुलेरा)", "Kotputli (कोटपूतली)"],
    "Jodhpur (जोधपुर)": ["Luni (लूणी)", "Bilara (बिलाड़ा)", "Osian (ओसियां)", "Phalodi (फलोदी)"],
    "Udaipur (उदयपुर)": ["Mavli (मावली)", "Salumbar (सलंबर)", "Kherwara (खेरवाड़ा)", "Gogunda (गोगुंदा)"]
  },
  "Madhya Pradesh (मध्य प्रदेश)": {
    "Bhopal (भोपाल)": ["Berasia (बेरसिया)", "Phanda (फंदा)", "Sukhi Sewaniya (सूखीसेवानिया)", "Bairagarh (बैरागढ़)"],
    "Indore (इंदौर)": ["Depalpur (देपालपुर)", "Sanwer (सांवेर)", "Mhow / Dr Ambedkar Nagar (महू)", "Rau (राऊ)"]
  },
  "Haryana (हरियाणा)": {
    "Gurugram (गुरुग्राम)": ["Sohna (सोहना)", "Pataudi (पटौदी)", "Farrukhnagar (फर्रुखनगर)", "Manesar (मानेसर)"],
    "Faridabad (फरीदाबाद)": ["Ballabgarh (बल्लभगढ़)", "Mohna (मोहना)", "Tigaon (तिगांव)"]
  }
};

// --- Comprehensive Seed Service Providers & Local Businesses across Villages ---
const INITIAL_SEED_WORKERS: WorkerService[] = [
  {
    id: 'w_doc_1',
    name: 'Dr. Rajiv Sharma',
    shopName: 'राजीव शर्मा क्लिनिक व प्राथमिक उपचार',
    hindiName: 'डॉ. राजीव शर्मा (क्लिनिक व स्वास्थ्य)',
    category: 'doctor',
    phone: '9876501234',
    whatsapp: '919876501234',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.9,
    jobsDone: 420,
    experienceYears: 12,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '3910 8821 4401',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    charges: '₹100 परामर्श फ़ीस',
    skills: ['बुखार व प्राथमिक इलाज', 'ईसीजी व ब्लड प्रेशर चेक', 'त्वचा व स्वास्थ्य सलाह'],
    mapAddress: 'Kalchina Main Bazaar, Ghaziabad, UP',
    lat: 28.7512,
    lng: 77.4215,
    reviewsCount: 38,
    userTags: ['अनुभवी डॉक्टर', '24 घंटे सेवा', 'सही इलाज']
  },
  {
    id: 'w_agro_1',
    name: 'Surendra Verma',
    shopName: 'वर्मा किसान सेवा व उत्तम खाद-बीज भंडार',
    hindiName: 'सुरेंद्र वर्मा (किसान खाद-बीज भंडार)',
    category: 'agro_seeds',
    phone: '9811223344',
    whatsapp: '919811223344',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.8,
    jobsDone: 350,
    experienceYears: 15,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '7819 2201 9912',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    charges: 'उचित सरकारी रेट',
    skills: ['इफको यूरिया व डीएपी खाद', 'उन्नत गेहूं व धान बीज', 'फसल कीटनाशक दवाइयां'],
    mapAddress: 'Kalchina Bus Stand, UP',
    lat: 28.7525,
    lng: 77.4230,
    reviewsCount: 29,
    userTags: ['असली बीज', 'सही दाम', 'किसान मित्र']
  },
  {
    id: 'w_brick_1',
    name: 'Chaudhari Satpal',
    shopName: 'चौधरी ईंट, सीमेंट व रेत-बजरी सप्लायर',
    hindiName: 'सतपाल चौधरी (ईंट व सीमेंट सप्लायर)',
    category: 'building_material',
    phone: '9711223344',
    whatsapp: '919711223344',
    village: 'Nigrawathi (निगरावठी)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.9,
    jobsDone: 190,
    experienceYears: 10,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '9012 3341 5501',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    charges: 'ट्रॉली व ट्रक डिलीवरी दर',
    skills: ['अवल नंबर लाल ईंट', 'अल्ट्राटेक व एसीसी सीमेंट', 'बजरी, रेती व रोड़ी डिलीवरी'],
    mapAddress: 'Nigrawathi Mod, Ghaziabad',
    lat: 28.7450,
    lng: 77.4100,
    reviewsCount: 22,
    userTags: ['होम डिलीवरी', 'पक्का माल', 'सही वजन']
  },
  {
    id: 'w_law_1',
    name: 'Advocate Ramesh Chandra',
    shopName: 'रमेश चंद्र एडवोकेट व लीगल एडवाइजर',
    hindiName: 'रमेश चंद्र लीगल (वकील कचहरी)',
    category: 'lawyer',
    phone: '9899112233',
    whatsapp: '919899112233',
    village: 'Samaypur (समयपुर)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.8,
    jobsDone: 110,
    experienceYears: 18,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '4410 9912 3012',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    charges: 'सलाह फ़ीस अनुसार',
    skills: ['जमीन व खेत रजिस्ट्री', 'कोर्ट केस व शपथ पत्र', 'स्टाम्प व लीगल डॉक्युमेंट्स'],
    mapAddress: 'Ghaziabad Tehsil / Samaypur',
    lat: 28.7300,
    lng: 77.4000,
    reviewsCount: 16,
    userTags: ['सच्ची सलाह', 'अनुभवी वकील']
  },
  {
    id: 'w_kirana_1',
    name: 'Manoj Gupta',
    shopName: 'गुप्ता किराना व जनरल सुपर स्टोर',
    hindiName: 'मनोज गुप्ता (गुप्ता किराना स्टोर)',
    category: 'kirana_store',
    phone: '9833221100',
    whatsapp: '919833221100',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.7,
    jobsDone: 600,
    experienceYears: 20,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '1092 3381 2291',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    charges: 'होलसेल व रीटेल रेट',
    skills: ['राशन व दैनिक सामान', 'पूजा सामग्री व मसाले', 'होम डिलीवरी सुविधा'],
    mapAddress: 'Kalchina Main Chowk',
    lat: 28.7508,
    lng: 77.4220,
    reviewsCount: 45,
    userTags: ['उचित मूल्य', 'ताजा राशन']
  },
  {
    id: 'w2',
    name: 'Subhash Mason',
    shopName: 'सुभाष राज मिस्त्री कंस्ट्रक्शन',
    hindiName: 'सुभाष राज मिस्त्री (मकान निर्माण)',
    category: 'raj_mistry',
    phone: '9812345678',
    whatsapp: '919812345678',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.8,
    jobsDone: 112,
    experienceYears: 14,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '3310 9928 1102',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    charges: '₹650 / दिन (दिहाड़ी)',
    skills: ['मकान की जुड़ाई (Brickwork)', 'लेंन्टर व प्लास्टर (Plaster)', 'टाइल व पत्थर'],
    mapAddress: 'Kalchina Main Bazaar, UP',
    lat: 28.7540,
    lng: 77.4225,
    reviewsCount: 14,
    userTags: ['अनुभवी मिस्त्री', 'ईमानदार', 'सही रेट']
  },
  {
    id: 'w5',
    name: 'Satish Tyagi Mechanic',
    shopName: 'सतीश ऑटो repair & ट्रैक्टर वर्कशॉप',
    hindiName: 'सतीश त्यागी (गाड़ी व ट्रैक्टर मिस्त्री)',
    category: 'mechanic',
    phone: '9837112233',
    whatsapp: '919837112233',
    village: 'Akalpur (अकलपुर)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.9,
    jobsDone: 210,
    experienceYears: 12,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '5512 8820 1192',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    charges: 'काम अनुसार (निरीक्षण ₹100)',
    skills: ['बाइक व कार इंजन सर्विस', 'ट्रैक्टर पंचर व हाइड्रोलिक', 'क्लच प्लेट व गियरबॉक्स'],
    mapAddress: 'Akalpur Bus Stand, Ghaziabad',
    lat: 28.7610,
    lng: 77.4290,
    reviewsCount: 22,
    userTags: ['फास्ट काम', 'सही रेट', 'विश्वसनीय']
  },
  {
    id: 'w_pend_1',
    name: 'Sanjay Kumar',
    shopName: 'संजय जन सेवा केंद्र व ऑनलाइन साइबर कैफे',
    hindiName: 'संजय कुमार (जन सेवा केंद्र)',
    category: 'custom_business',
    customCategory: 'जन सेवा केंद्र / ऑनलाइन फॉर्म',
    phone: '9922334455',
    whatsapp: '919922334455',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 5.0,
    jobsDone: 0,
    experienceYears: 4,
    isVerified: false,
    verificationStatus: 'pending',
    idNumber: '8912 3041 5521',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    charges: '₹50 - ₹100 फॉर्म फ़ीस',
    skills: ['आय/जाति/निवास प्रमाण पत्र', 'किसान सम्मान निधि eKYC', 'आधार व पैन कार्ड सुधार'],
    mapAddress: 'Near Primary School, Kalchina',
    lat: 28.7515,
    lng: 77.4200,
    reviewsCount: 1,
    userTags: ['नया पंजीकरण', 'समीक्षाधीन'],
    submittedAt: Date.now() - 1200000
  },
  {
    id: 'w_pend_2',
    name: 'Dr. Mahesh Verma',
    shopName: 'वर्मा होमियोपैथिक क्लिनिक',
    hindiName: 'डॉ. महेश वर्मा (होमियोपैथी)',
    category: 'doctor',
    phone: '9810992211',
    whatsapp: '919810992211',
    village: 'Akalpur (अकलपुर)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 5.0,
    jobsDone: 0,
    experienceYears: 7,
    isVerified: false,
    verificationStatus: 'pending',
    idNumber: '4019 2810 9942',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&auto=format&fit=crop&q=80',
    charges: '₹150 दवाई सहित',
    skills: ['एलर्जी व त्वचा रोग', 'पुराने जुकाम व पेट रोग', 'जड़ी-बूटी व होमियोपैथी'],
    mapAddress: 'Akalpur Stand, UP',
    lat: 28.7600,
    lng: 77.4300,
    reviewsCount: 1,
    userTags: ['नया आवेदन', 'समीक्षा में'],
    submittedAt: Date.now() - 3600000
  },
  {
    id: 'w1',
    name: 'Rampal Mistry',
    shopName: 'रामपाल इलेक्ट्रिक वर्कशॉप',
    hindiName: 'रामपाल मिस्त्री (इलेक्ट्रिक)',
    category: 'electrician',
    phone: '9876543210',
    whatsapp: '919876543210',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.9,
    jobsDone: 156,
    experienceYears: 9,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '2901 8832 1092',
    documentPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=300&auto=format&fit=crop&q=80',
    avatarUrl: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&auto=format&fit=crop&q=80',
    charges: '₹500 / दिन (विज़िट ₹150)',
    skills: ['घरेलू वायरिंग (Wiring)', 'पंखे व गीजर (Fan/Geyser)', 'समरसेबल स्टार्टर'],
    mapAddress: 'Kalchina Stand, Ghaziabad, UP',
    reviewsCount: 18,
    userTags: ['अच्छा काम', 'सही रेट', 'समय पर आए']
  },
  {
    id: 'w2',
    name: 'Subhash Mason',
    shopName: 'सुभाष राज मिस्त्री कंस्ट्रक्शन',
    hindiName: 'सुभाष राज मिस्त्री (मकान निर्माण)',
    category: 'raj_mistry',
    phone: '9812345678',
    whatsapp: '919812345678',
    village: 'Kalchina (कलछीना)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.8,
    jobsDone: 112,
    experienceYears: 14,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '3310 9928 1102',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    charges: '₹650 / दिन (दिहाड़ी)',
    skills: ['मकान की जुड़ाई (Brickwork)', 'लेंन्टर व प्लास्टर (Plaster)', 'टाइल व पत्थर'],
    mapAddress: 'Kalchina Main Bazaar, UP',
    reviewsCount: 14,
    userTags: ['अनुभवी मिस्त्री', 'ईमानदार', 'सही रेट']
  },
  {
    id: 'w5',
    name: 'Satish Tyagi Mechanic',
    shopName: 'सतीश ऑटो repair & ट्रैक्टर वर्कशॉप',
    hindiName: 'सतीश त्यागी (गाड़ी व ट्रैक्टर मिस्त्री)',
    category: 'mechanic',
    phone: '9837112233',
    whatsapp: '919837112233',
    village: 'Akalpur (अकलपुर)',
    district: 'Ghaziabad (गाजियाबाद)',
    state: 'Uttar Pradesh (उत्तर प्रदेश)',
    rating: 4.9,
    jobsDone: 210,
    experienceYears: 12,
    isVerified: true,
    verificationStatus: 'approved',
    idNumber: '5512 8820 1192',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    charges: 'काम अनुसार (निरीक्षण ₹100)',
    skills: ['बाइक व कार इंजन सर्विस', 'ट्रैक्टर पंचर व हाइड्रोलिक', 'क्लच प्लेट व गियरबॉक्स'],
    mapAddress: 'Akalpur Bus Stand, Ghaziabad',
    reviewsCount: 22,
    userTags: ['फास्ट काम', 'सही रेट', 'विश्वसनीय']
  }
];

// --- Categories Configuration with Large Visual Icons, Group Tabs & Search Keywords ---
export interface CategoryItem {
  id: string;
  hindiName: string;
  englishName: string;
  group: 'agro' | 'event' | 'construction' | 'retail' | 'service_transport' | 'other';
  icon: React.ElementType;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  voiceText: string;
  keywords: string[];
}

const CATEGORIES: CategoryItem[] = [
  // --- EVENTS & CATERING ('event') ---
  {
    id: 'cook_halwai',
    hindiName: 'हलवाई / बावर्ची',
    englishName: 'Cook & Caterer',
    group: 'event',
    icon: Utensils,
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 active:scale-98',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-700 bg-amber-100',
    voiceText: 'हलवाई, बावर्ची, कूक व शादी कैटरिंग सर्विस',
    keywords: ['हलवाई', 'बावर्ची', 'कूक', 'कैटरिंग', 'खाना', 'रसोईया', 'मिठाई', 'हलवा', 'शादी कूक', 'cook', 'halwai', 'caterer', 'food', 'catering']
  },
  {
    id: 'tent_house',
    hindiName: 'टेंट हाउस व शामियाना',
    englishName: 'Tent House & Seating',
    group: 'event',
    icon: Building2,
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 active:scale-98',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-950',
    iconColor: 'text-orange-600 bg-orange-100',
    voiceText: 'टेंट हाउस, शामियाना, कुर्सी, मेज व गद्दे किराया',
    keywords: ['टेंट हाउस', 'शामियाना', 'कुर्सी', 'मेज', 'पर्दा', 'रजाई', 'शादी टेंट', 'गद्दे', 'कनाट', 'tent house', 'shamiana', 'furniture rental']
  },
  {
    id: 'dj_sound',
    hindiName: 'डीजे व साउंड सिस्टम',
    englishName: 'DJ & Sound System',
    group: 'event',
    icon: Music,
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 active:scale-98',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-950',
    iconColor: 'text-purple-600 bg-purple-100',
    voiceText: 'डीजे, साउंड सिस्टम, स्पीकर व म्यूजिक ऑपरेटर',
    keywords: ['डीजे', 'डी जे', 'साउंड', 'स्पीकर', 'म्यूजिक', 'ऑपरेटर', 'ध्वनि', 'dj', 'sound system', 'speaker', 'music', 'dj sound']
  },
  {
    id: 'light_decor',
    hindiName: 'लाइट सजावट व जनरेटर',
    englishName: 'Lighting & Generator',
    group: 'event',
    icon: Flame,
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20 active:scale-98',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-950',
    iconColor: 'text-yellow-600 bg-yellow-100',
    voiceText: 'लाइट सजावट, जनरेटर, झूमर व शादी लाइटिंग',
    keywords: ['लाइट सजावट', 'लाइटिंग', 'जनरेटर', 'झूमर', 'शादी लाइट', 'एलईडी सजावट', 'lighting', 'generator', 'light decor']
  },
  {
    id: 'flower_decor',
    hindiName: 'फूल सजावट व मंडप',
    englishName: 'Flower Decorator',
    group: 'event',
    icon: Flower2,
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20 active:scale-98',
    borderColor: 'border-pink-400',
    textColor: 'text-pink-950',
    iconColor: 'text-pink-600 bg-pink-100',
    voiceText: 'फूल सजावट, कार सजावट, मंडप व स्टेज सजावट',
    keywords: ['फूल सजावट', 'फूलवाला', 'कार सजावट', 'मंडप सजावट', 'गेंदा', 'गुलाब', 'वरमाला', 'flower decorator', 'floral', 'stage decor']
  },
  {
    id: 'band_baja',
    hindiName: 'बैंड बाजा व ढोल ताशा',
    englishName: 'Band Baja & Dhol',
    group: 'event',
    icon: Music,
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20 active:scale-98',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-950',
    iconColor: 'text-rose-600 bg-rose-100',
    voiceText: 'बैंड बाजा, ढोलक, ताशा, शहनाई व बरात सर्विस',
    keywords: ['बैंड बाजा', 'ढोलक', 'ढोल', 'ताशा', 'शहनाई', 'बरात', 'घोड़ी-बग्गी', 'डोली', 'band baja', 'dhol', 'wedding band']
  },
  {
    id: 'photographer',
    hindiName: 'फोटोग्राफर व वीडियोग्राफर',
    englishName: 'Photographer & Video',
    group: 'event',
    icon: Camera,
    bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-98',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-950',
    iconColor: 'text-indigo-600 bg-indigo-100',
    voiceText: 'फोटोग्राफर, वीडियोग्राफर, फोटो शूट व ड्रोन कैमरा',
    keywords: ['फोटोग्राफर', 'वीडियोग्राफर', 'फोटो', 'वीडियो', 'ड्रोन', 'प्री वेडिंग', 'एल्बम', 'photo', 'video', 'drone', 'photographer']
  },
  {
    id: 'fireworks',
    hindiName: 'आतिशबाजी व पटाखे',
    englishName: 'Fireworks & Crackers',
    group: 'event',
    icon: Sparkles,
    bgColor: 'bg-amber-600/10 hover:bg-amber-600/20 active:scale-98',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-700 bg-amber-100',
    voiceText: 'शादी आतिशबाजी व पटाखे शो',
    keywords: ['आतिशबाजी', 'पटाखे', 'अनार', 'आतिशबाज़', 'महताब', 'fireworks', 'crackers', 'pyro']
  },

  // --- AGRO & PLANTS ('agro') ---
  {
    id: 'plant_nursery',
    hindiName: 'पेड़-पौधे व नर्सरी',
    englishName: 'Plant Nursery',
    group: 'agro',
    icon: Sprout,
    bgColor: 'bg-emerald-600/10 hover:bg-emerald-600/20 active:scale-98',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-950',
    iconColor: 'text-emerald-700 bg-emerald-100',
    voiceText: 'पेड़-पौधे, फलदार पौधे व नर्सरी कलाम',
    keywords: ['पेड़', 'पौधे', 'नर्सरी', 'कलामी पौधे', 'फूल के पौधे', 'फलदार पौधे', 'सागौन', 'यूकेलिप्टस', 'गुलाब पौधे', 'nursery', 'plants', 'saplings']
  },
  {
    id: 'agro_seeds',
    hindiName: 'बीज, खाद व कीटनाशक',
    englishName: 'Seeds & Fertilizer Shop',
    group: 'agro',
    icon: Wheat,
    bgColor: 'bg-green-600/10 hover:bg-green-600/20 active:scale-98',
    borderColor: 'border-green-500',
    textColor: 'text-green-950',
    iconColor: 'text-green-700 bg-green-100',
    voiceText: 'किसान सेवा, बीज, खाद व कीटनाशक दुकान',
    keywords: ['बीज', 'खाद', 'यूरिया', 'डीएपी', 'कीटनाशक', 'स्प्रे', 'दवा', 'फसल सुरक्षा', 'किसान दुकान', 'seeds', 'fertilizer', 'pesticides', 'agro']
  },
  {
    id: 'thresher_combine',
    hindiName: 'थ्रेशर, कंबाइन व रीपर',
    englishName: 'Thresher & Combine',
    group: 'agro',
    icon: Tractor,
    bgColor: 'bg-lime-600/10 hover:bg-lime-600/20 active:scale-98',
    borderColor: 'border-lime-500',
    textColor: 'text-lime-950',
    iconColor: 'text-lime-700 bg-lime-100',
    voiceText: 'थ्रेशर, कंबाइन हार्वेस्टर व गेंहू कटाई मशीन',
    keywords: ['थ्रेशर', 'कंबाइन', 'हार्वेस्टर', 'रीपर', 'भूसा मशीन', 'गेंहू कटाई', 'धान कटाई', 'पराली मशीन', 'thresher', 'combine', 'harvester']
  },
  {
    id: 'tubewell_boring',
    hindiName: 'ट्यूबलवेल व बोरिंग मिस्त्री',
    englishName: 'Tubewell & Boring Repair',
    group: 'agro',
    icon: Droplets,
    bgColor: 'bg-teal-600/10 hover:bg-teal-600/20 active:scale-98',
    borderColor: 'border-teal-500',
    textColor: 'text-teal-950',
    iconColor: 'text-teal-700 bg-teal-100',
    voiceText: 'ट्यूबलवेल, बोरिंग व समरसेबल मोटर मिस्त्री',
    keywords: ['ट्यूबलवेल', 'बोरिंग मिस्त्री', 'समरसेबल', 'पंप', 'मोटर', 'पाइप', 'सिंचाई बोरिंग', 'tubewell', 'submersible', 'boring']
  },
  {
    id: 'veterinary_doctor',
    hindiName: 'पशु डॉक्टर (वैटरनरी)',
    englishName: 'Veterinary Doctor',
    group: 'agro',
    icon: Stethoscope,
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-950',
    iconColor: 'text-emerald-600 bg-emerald-100',
    voiceText: 'पशु डॉक्टर, वैटरनरी, गाय भैंस इलाज व AI सेवा',
    keywords: ['पशु डॉक्टर', 'वैटरनरी', 'ढोर डॉक्टर', 'गाय भैंस डॉक्टर', 'टीकाकरण', 'पशु दवाई', 'AI नस्ल सुधार', 'vet', 'animal doctor', 'pashu doctor']
  },
  {
    id: 'dairy_milk',
    hindiName: 'डेयरी व दूध-मावा केंद्र',
    englishName: 'Dairy, Milk & Mawa',
    group: 'agro',
    icon: Milk,
    bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-98',
    borderColor: 'border-cyan-400',
    textColor: 'text-cyan-950',
    iconColor: 'text-cyan-600 bg-cyan-100',
    voiceText: 'डेयरी, शुद्ध दूध, मावा, खोया व पनीर केंद्र',
    keywords: ['डेयरी', 'दूध', 'खोया', 'मावा', 'पनीर', 'दही', 'मट्ठा', 'घी', 'मिष्ठान', 'milk', 'dairy', 'mawa', 'paneer']
  },
  {
    id: 'cattle_feed',
    hindiName: 'चारा, भूसा व खली दुकान',
    englishName: 'Cattle Feed & Fodder',
    group: 'agro',
    icon: Package,
    bgColor: 'bg-amber-700/10 hover:bg-amber-700/20 active:scale-98',
    borderColor: 'border-amber-600',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-800 bg-amber-100',
    voiceText: 'पशु आहार, भूसा, खली, चोकर व बिनौला दुकान',
    keywords: ['चारा', 'भूसा', 'खली', 'चोकर', 'पशु आहार', 'दाना', 'बिनौला', 'साइलेज', 'cattle feed', 'fodder', 'chana']
  },

  // --- SKILLED CONSTRUCTION & REPAIRS ('construction') ---
  {
    id: 'raj_mistry',
    hindiName: 'राज मिस्त्री व निर्माण',
    englishName: 'Mason & Construction',
    group: 'construction',
    icon: Hammer,
    bgColor: 'bg-orange-500/10 hover:bg-orange-500/20 active:scale-98',
    borderColor: 'border-orange-400',
    textColor: 'text-orange-950',
    iconColor: 'text-orange-600 bg-orange-100',
    voiceText: 'राज मिस्त्री, मकान निर्माण, प्लास्टर व लेंटर',
    keywords: ['राज मिस्त्री', 'मकान निर्माण', 'लेंन्टर', 'प्लास्टर', 'जुड़ाई', 'टाइल', 'संगमरमर', 'ठेकेदार', 'mason', 'construction', 'brickwork']
  },
  {
    id: 'electrician',
    hindiName: 'इलेक्ट्रीशियन व हाउस वायरिंग',
    englishName: 'Electrician & Wiring',
    group: 'construction',
    icon: Zap,
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 active:scale-98',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-600 bg-amber-100',
    voiceText: 'इलेक्ट्रीशियन, बिजली मिस्त्री व हाउस वायरिंग',
    keywords: ['इलेक्ट्रीशियन', 'बिजली मिस्त्री', 'वायरिंग', 'पंखा', 'गीजर', 'कटआउट', 'एमसीबी', 'स्टार्टर', 'electrician', 'wiring', 'fan']
  },
  {
    id: 'plumber',
    hindiName: 'प्लंबर व सेनेटरी',
    englishName: 'Plumber & Sanitary',
    group: 'construction',
    icon: Wrench,
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 active:scale-98',
    borderColor: 'border-blue-400',
    textColor: 'text-blue-950',
    iconColor: 'text-blue-600 bg-blue-100',
    voiceText: 'प्लंबर, नल मिस्त्री व वाटर सेनेटरी फिटिंग',
    keywords: ['प्लंबर', 'नल मिस्त्री', 'पाइप', 'टोटी', 'सेनेटरी', 'टंकी', 'प्लंबिंग', 'वाशबेसिन', 'plumber', 'sanitary', 'pipe']
  },
  {
    id: 'painter',
    hindiName: 'पेंटर व पुट्टी रंगाई',
    englishName: 'Painter & Wall Decor',
    group: 'construction',
    icon: Paintbrush,
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 active:scale-98',
    borderColor: 'border-purple-400',
    textColor: 'text-purple-950',
    iconColor: 'text-purple-600 bg-purple-100',
    voiceText: 'पेंटर, पुट्टी, डिस्टेंपर व घर की रंगाई',
    keywords: ['पेंटर', 'पुट्टी', 'डिस्टेंपर', 'बर्जर', 'एशियन पेंट', 'पेंटिंग', 'रंग रोगन', 'वालपेपर', 'painter', 'painting', 'putty']
  },
  {
    id: 'carpenter',
    hindiName: 'बढ़ई व लकड़ी फर्नीचर',
    englishName: 'Carpenter & Furniture',
    group: 'construction',
    icon: Layers,
    bgColor: 'bg-yellow-600/10 hover:bg-yellow-600/20 active:scale-98',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-950',
    iconColor: 'text-yellow-700 bg-yellow-100',
    voiceText: 'बढ़ई, कारपेंटर, दरवाजा, अलमारी व बेड फर्नीचर',
    keywords: ['बढ़ई', 'कारपेंटर', 'लकड़ी', 'दरवाजा', 'खिड़की', 'अलमारी', 'बैड', 'टेबल', 'प्लाईवुड', 'carpenter', 'furniture']
  },
  {
    id: 'welding_grill',
    hindiName: 'वेल्डर व लोहा ग्रिल मेकर',
    englishName: 'Welding & Fabrication',
    group: 'construction',
    icon: HardHat,
    bgColor: 'bg-slate-600/10 hover:bg-slate-600/20 active:scale-98',
    borderColor: 'border-slate-500',
    textColor: 'text-slate-950',
    iconColor: 'text-slate-700 bg-slate-100',
    voiceText: 'वेल्डिंग वर्कशॉप, लोहे का गेट, ग्रिल व शटर',
    keywords: ['वेल्डर', 'वेल्डिंग', 'ग्रिल', 'शटर', 'लोहे का गेट', 'रेलिंग', 'फैब्रिकेशन', 'welding', 'fabrication', 'grill']
  },
  {
    id: 'cctv_repair',
    hindiName: 'सीसीटीवी कैमरा मिस्त्री',
    englishName: 'CCTV Camera Technician',
    group: 'construction',
    icon: Eye,
    bgColor: 'bg-indigo-600/10 hover:bg-indigo-600/20 active:scale-98',
    borderColor: 'border-indigo-500',
    textColor: 'text-indigo-950',
    iconColor: 'text-indigo-700 bg-indigo-100',
    voiceText: 'सीसीटीवी कैमरा इंस्टालेशन व सिक्योरिटी सिस्टम',
    keywords: ['सीसीटीवी', 'कैमरा', 'सिक्योरिटी', 'डीवीआर', 'सीसीटीवी मिस्त्री', 'सुरक्षा कैमरा', 'cctv camera', 'technician', 'security']
  },
  {
    id: 'ac_fridge',
    hindiName: 'एसी, फ्रिज व वाशिंग मशीन',
    englishName: 'AC & Fridge Repair',
    group: 'construction',
    icon: Snowflake,
    bgColor: 'bg-sky-500/10 hover:bg-sky-500/20 active:scale-98',
    borderColor: 'border-sky-400',
    textColor: 'text-sky-950',
    iconColor: 'text-sky-600 bg-sky-100',
    voiceText: 'एसी, फ्रिज, वाशिंग मशीन व कूलर रिपेयर',
    keywords: ['एसी', 'फ्रिज', 'वाशिंग मशीन', 'कूलर', 'डीप फ्रीजर', 'गैस भरना', 'एसी सर्विस', 'ac repair', 'fridge', 'cooler']
  },
  {
    id: 'tailor_stitching',
    hindiName: 'सिलाई व दर्जी (Tailor)',
    englishName: 'Tailor & Fashion Designer',
    group: 'construction',
    icon: Scissors,
    bgColor: 'bg-pink-600/10 hover:bg-pink-600/20 active:scale-98',
    borderColor: 'border-pink-500',
    textColor: 'text-pink-950',
    iconColor: 'text-pink-700 bg-pink-100',
    voiceText: 'सिलाई केंद्र, लेडीज व जेंट्स दर्जी, सूट व पैंट-शर्ट',
    keywords: ['सिलाई', 'दर्जी', 'टेलर', 'सूट', 'पैंट शर्ट', 'ब्लाउज', 'कुर्ता', 'सिलाई कढ़ाई', 'tailor', 'stitching', 'boutique']
  },
  {
    id: 'solar_panel',
    hindiName: 'सोलर पैनल व इन्वर्टर',
    englishName: 'Solar Panel & Inverter',
    group: 'construction',
    icon: Sun,
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 active:scale-98',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-600 bg-amber-100',
    voiceText: 'सोलर पैनल मिस्त्री, सोलर पंप व इन्वर्टर बैटरी',
    keywords: ['सोलर', 'सोलर पैनल', 'बैटरी', 'इन्वर्टर', 'सोलर प्लेट', 'सोलर पंप मिस्त्री', 'solar panel', 'inverter', 'battery']
  },

  // --- RETAIL & DAILY SHOPS ('retail') ---
  {
    id: 'kirana_store',
    hindiName: 'किराना व परचून दुकान',
    englishName: 'Kirana & Grocery Store',
    group: 'retail',
    icon: ShoppingBag,
    bgColor: 'bg-rose-500/10 hover:bg-rose-500/20 active:scale-98',
    borderColor: 'border-rose-400',
    textColor: 'text-rose-950',
    iconColor: 'text-rose-600 bg-rose-100',
    voiceText: 'किराना दुकान, जनरल स्टोर व राशन परचून',
    keywords: ['किराना', 'जनरल स्टोर', 'राशन', 'परचून', 'दुकान', 'ग्रॉसरी', 'दैनिक सामान', 'kirana', 'general store', 'grocery']
  },
  {
    id: 'flour_mill',
    hindiName: 'आटा चक्की व तेल स्पेलर',
    englishName: 'Flour Mill & Oil Expeller',
    group: 'retail',
    icon: Cog,
    bgColor: 'bg-yellow-600/10 hover:bg-yellow-600/20 active:scale-98',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-950',
    iconColor: 'text-yellow-700 bg-yellow-100',
    voiceText: 'आटा चक्की, गेंहू पिसाई व सरसों तेल स्पेलर',
    keywords: ['आटा चक्की', 'स्पेलर', 'सरसों तेल', 'दलाई', 'पिसई', 'मसाला पिसाई', 'flour mill', 'chakki', 'oil mill']
  },
  {
    id: 'hardware_paint',
    hindiName: 'हार्डवेयर व सीमेंट दुकान',
    englishName: 'Hardware & Cement Store',
    group: 'retail',
    icon: Building2,
    bgColor: 'bg-stone-600/10 hover:bg-stone-600/20 active:scale-98',
    borderColor: 'border-stone-500',
    textColor: 'text-stone-950',
    iconColor: 'text-stone-700 bg-stone-100',
    voiceText: 'हार्डवेयर दुकान, सरिया, सीमेंट, नट-बोल्ट व टूल्स',
    keywords: ['हार्डवेयर', 'सरिया', 'सीमेंट', 'कील', 'पेंच', 'पाइप', 'पेंट', 'ताला', 'टूल्स', 'hardware', 'cement', 'paint']
  },
  {
    id: 'utensils_shop',
    hindiName: 'बर्तन दुकान व क्रॉकरी',
    englishName: 'Utensils & Kitchenware',
    group: 'retail',
    icon: CookingPot,
    bgColor: 'bg-zinc-500/10 hover:bg-zinc-500/20 active:scale-98',
    borderColor: 'border-zinc-400',
    textColor: 'text-zinc-950',
    iconColor: 'text-zinc-700 bg-zinc-100',
    voiceText: 'बर्तन दुकान, पीतल, स्टील व किचन सामान',
    keywords: ['बर्तन', 'पीतल', 'स्टील', 'कुकर', 'कढ़ाई', 'प्लेट', 'ग्लास', 'इंडक्शन', 'utensils', 'kitchenware']
  },
  {
    id: 'clothing_store',
    hindiName: 'कपड़ों की दुकान व साड़ी',
    englishName: 'Clothing & Saree House',
    group: 'retail',
    icon: Shirt,
    bgColor: 'bg-violet-500/10 hover:bg-violet-500/20 active:scale-98',
    borderColor: 'border-violet-400',
    textColor: 'text-violet-950',
    iconColor: 'text-violet-600 bg-violet-100',
    voiceText: 'कपड़ों की दुकान, साड़ी, लेडीज सूट व रेडीमेड गारमेंट्स',
    keywords: ['कपड़े', 'साड़ी', 'रेडीमेड', 'सूट', 'लहंगा', 'शॉल', 'जीन्स', 'टीशर्ट', 'clothing', 'sarees', 'garments']
  },
  {
    id: 'shoe_store',
    hindiName: 'जूता-चप्पल दुकान',
    englishName: 'Footwear & Shoes',
    group: 'retail',
    icon: Footprints,
    bgColor: 'bg-amber-800/10 hover:bg-amber-800/20 active:scale-98',
    borderColor: 'border-amber-700',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-800 bg-amber-100',
    voiceText: 'जूता-चप्पल दुकान, स्पोर्ट्स शूज व सैंडल स्टोर',
    keywords: ['जूता', 'चप्पल', 'सैंडल', 'बूट', 'स्लीपर', 'शू स्टोर', 'footwear', 'shoes', 'slippers']
  },
  {
    id: 'beauty_salon',
    hindiName: 'ब्यूटी पार्लर व नाई सैलून',
    englishName: 'Beauty Parlour & Salon',
    group: 'retail',
    icon: Scissors,
    bgColor: 'bg-fuchsia-500/10 hover:bg-fuchsia-500/20 active:scale-98',
    borderColor: 'border-fuchsia-400',
    textColor: 'text-fuchsia-950',
    iconColor: 'text-fuchsia-600 bg-fuchsia-100',
    voiceText: 'ब्यूटी पार्लर, ब्राइडल मेकअप, सैलून व हेयर कटिंग',
    keywords: ['ब्यूटी पार्लर', 'मेकअप', 'सैलून', 'नाई', 'कटिंग', 'शेविंग', 'फैशियल', 'मेहंदी', 'हेयर स्टाइल', 'parlour', 'salon', 'barber']
  },
  {
    id: 'mobile_repair',
    hindiName: 'मोबाइल व कंप्यूटर रिपेयर',
    englishName: 'Mobile & Computer Repair',
    group: 'retail',
    icon: Smartphone,
    bgColor: 'bg-teal-500/10 hover:bg-teal-500/20 active:scale-98',
    borderColor: 'border-teal-400',
    textColor: 'text-teal-950',
    iconColor: 'text-teal-600 bg-teal-100',
    voiceText: 'मोबाइल दुकान, स्क्रीन रीप्लेसमेंट व कंप्यूटर रिपेयर',
    keywords: ['मोबाइल', 'मोबाइल रिपेयर', 'स्क्रीन', 'फोल्डर', 'रीचार्ज', 'लैपटॉप', 'कंप्यूटर रिपेयर', 'mobile repair', 'laptop']
  },
  {
    id: 'medical_store',
    hindiName: 'मेडिकल स्टोर व फार्मेसी',
    englishName: 'Medical Store & Pharmacy',
    group: 'retail',
    icon: Pill,
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-950',
    iconColor: 'text-emerald-600 bg-emerald-100',
    voiceText: 'मेडिकल स्टोर, दवाइयां व प्राथमिक चिकित्सा',
    keywords: ['मेडिकल', 'दवा', 'फार्मेसी', 'सिरप', 'गोली', 'इंजेक्शन', 'सिरिंज', 'बैंडेज', 'medical store', 'pharmacy', 'medicine']
  },

  // --- SERVICES & TRANSPORT ('service_transport') ---
  {
    id: 'csc_cybercafe',
    hindiName: 'जनसेवा केंद्र / सीएससी',
    englishName: 'CSC Cyber Cafe',
    group: 'service_transport',
    icon: Laptop,
    bgColor: 'bg-blue-600/10 hover:bg-blue-600/20 active:scale-98',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-950',
    iconColor: 'text-blue-700 bg-blue-100',
    voiceText: 'जनसेवा केंद्र, सीएससी, आधार-पैन व ऑनलाइन सरकारी काम',
    keywords: ['जनसेवा केंद्र', 'सीएससी', 'साइबर कैफे', 'आधार', 'पैन कार्ड', 'आय जाति निवास', 'ऑनलाइन फॉर्म', 'फोटोकॉपी', 'csc', 'cyber cafe', 'jan seva']
  },
  {
    id: 'auto_rickshaw',
    hindiName: 'ऑटो व ई-रिक्शा चालक',
    englishName: 'Auto & E-Rickshaw',
    group: 'service_transport',
    icon: Car,
    bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20 active:scale-98',
    borderColor: 'border-yellow-400',
    textColor: 'text-yellow-950',
    iconColor: 'text-yellow-600 bg-yellow-100',
    voiceText: 'ऑटो चालक, ई-रिक्शा व लोकल सवारी सर्विस',
    keywords: ['ऑटो', 'ई-रिक्शा', 'रिक्शा', 'पैसेंजर', 'टेम्पो', 'चालक', 'सवारी', 'auto', 'e-rickshaw', 'tempo']
  },
  {
    id: 'pickup_loader',
    hindiName: 'पिकअप, लोडर व छोटा हाथी',
    englishName: 'Pickup & Cargo Loader',
    group: 'service_transport',
    icon: Truck,
    bgColor: 'bg-cyan-600/10 hover:bg-cyan-600/20 active:scale-98',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-950',
    iconColor: 'text-cyan-700 bg-cyan-100',
    voiceText: 'पिकअप, लोडर, छोटा हाथी व माल भाड़ा ढुलाई',
    keywords: ['पिकअप', 'लोडर', 'छोटा हाथी', 'डीसीएम', 'माल ढुलाई', 'भाड़ा', 'ट्रक', 'pickup', 'loader', 'chota hathi', 'cargo']
  },
  {
    id: 'jcb_crane',
    hindiName: 'जेसीबी, बुलडोजर व क्रेन',
    englishName: 'JCB & Heavy Operator',
    group: 'service_transport',
    icon: HardHat,
    bgColor: 'bg-amber-600/10 hover:bg-amber-600/20 active:scale-98',
    borderColor: 'border-amber-500',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-700 bg-amber-100',
    voiceText: 'जेसीबी, बुलडोजर, क्रेन व मिट्टी भराव मशीन',
    keywords: ['जेसीबी', 'बुलडोजर', 'क्रेन', 'खुदाई', 'मिट्टी भराव', 'सड़क निर्माण', 'jcb', 'bulldozer', 'crane']
  },
  {
    id: 'tractor_driver',
    hindiName: 'ट्रैक्टर ड्राइवर व जुताई',
    englishName: 'Tractor Driver & Trolley',
    group: 'service_transport',
    icon: Tractor,
    bgColor: 'bg-emerald-600/10 hover:bg-emerald-600/20 active:scale-98',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-950',
    iconColor: 'text-emerald-700 bg-emerald-100',
    voiceText: 'ट्रैक्टर ड्राइवर, खेत जुताई व ट्रॉली ढुलाई',
    keywords: ['ट्रैक्टर', 'ट्रॉली', 'जुताई', 'मिट्टी', 'ढुलाई', 'खेत जोतना', 'रोटावेटर', 'tractor', 'trolley', 'ploughing']
  },
  {
    id: 'doctor',
    hindiName: 'डॉक्टर व स्वास्थ्य क्लिनिक',
    englishName: 'Doctor & Clinic',
    group: 'service_transport',
    icon: Stethoscope,
    bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98',
    borderColor: 'border-emerald-400',
    textColor: 'text-emerald-950',
    iconColor: 'text-emerald-600 bg-emerald-100',
    voiceText: 'डॉक्टर, क्लिनिक व प्राथमिक स्वास्थ्य सेवा',
    keywords: ['डॉक्टर', 'क्लिनिक', 'अस्पताल', 'इलाज', 'बुखार', 'जांच', 'दवाई', 'स्वास्थ्य सेवा', 'doctor', 'clinic', 'physician']
  },
  {
    id: 'lawyer',
    hindiName: 'वकील व लीगल सलाहकार',
    englishName: 'Advocate & Legal Advisor',
    group: 'service_transport',
    icon: Scale,
    bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20 active:scale-98',
    borderColor: 'border-indigo-400',
    textColor: 'text-indigo-950',
    iconColor: 'text-indigo-600 bg-indigo-100',
    voiceText: 'वकील, लीगल सलाह, बैनामा व कचहरी कार्य',
    keywords: ['वकील', 'कचहरी', 'लीगल', 'एफिडेविट', 'बैनामा', 'स्टाम्प', 'वकील साहब', 'कोर्ट काम', 'lawyer', 'advocate', 'legal']
  },
  {
    id: 'pandit_priest',
    hindiName: 'पंडित जी व पुजारी',
    englishName: 'Pandit Ji & Priest',
    group: 'service_transport',
    icon: Flame,
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 active:scale-98',
    borderColor: 'border-amber-400',
    textColor: 'text-amber-950',
    iconColor: 'text-amber-600 bg-amber-100',
    voiceText: 'पंडित जी, कथा, पूजन, हवन व वास्तु सलाह',
    keywords: ['पंडित', 'पुजारी', 'कथा', 'हवन', 'पूजा', 'वास्तु', 'विवाह संस्कार', 'कुंडली', 'pandit', 'priest', 'astrology']
  },

  // --- FALLBACK / OTHER ('other') ---
  {
    id: 'custom_business',
    hindiName: 'अन्य व्यापार / सेवा',
    englishName: 'Other Custom Business',
    group: 'other',
    icon: Store,
    bgColor: 'bg-slate-500/10 hover:bg-slate-500/20 active:scale-98',
    borderColor: 'border-slate-400',
    textColor: 'text-slate-950',
    iconColor: 'text-slate-700 bg-slate-100',
    voiceText: 'अन्य दुकान, कस्टम सर्विस व व्यापार',
    keywords: ['अन्य', 'कस्टम', 'दुकान', 'व्यापार', 'सर्विस', 'other', 'custom', 'business']
  }
];

// --- Realistic AdMob Native Ads Dataset ---
const NATIVE_ADS: NativeAdItem[] = [
  {
    id: 'ad_tractor',
    title: 'Mahindra & Swaraj Tractors',
    hindiTitle: 'महिंद्रा व स्वराज ट्रैक्टर - 0% ब्याज स्पेशल ग्रामीण योजना',
    description: 'अपने खेत के लिए पाएं सबसे शक्तिशाली ट्रैक्टर। पुराना ट्रैक्टर देकर ₹25,000 की विशेष छूट पाएं।',
    badgeText: 'Sponsored / विज्ञापन',
    categoryTag: 'कृषि ऑफर',
    sponsorName: 'Mahindra Tractors Authorized Dealer',
    iconEmoji: '🚜',
    ctaText: 'डीलर को कॉल करें',
    ctaSub: 'नजदीकी शोरूम',
    ctaUrl: 'tel:18002000000',
    bgColor: 'bg-gradient-to-r from-red-50 via-orange-50 to-amber-50',
    borderColor: 'border-red-300'
  },
  {
    id: 'ad_jio',
    title: 'Gramin 5G Broadband',
    hindiTitle: 'अपने गाँव में लगाएं 5G हाई-स्पीड वाई-फाई - फ्री सिम व डिलीवरी',
    description: 'डिजिटल भारत योजना: अब हर ग्राम पंचायत में अनलिमिटेड इंटरनेट। बच्चों की पढ़ाई व टीवी का आनंद लें।',
    badgeText: 'Sponsored / विज्ञापन',
    categoryTag: 'इंटरनेट सेवा',
    sponsorName: 'Jio & Airtel Digital India',
    iconEmoji: '📡',
    ctaText: 'फ्री कनेक्शन लें',
    ctaSub: 'होम डिलीवरी',
    ctaUrl: 'tel:198',
    bgColor: 'bg-gradient-to-r from-blue-50 via-indigo-50 to-cyan-50',
    borderColor: 'border-blue-300'
  },
  {
    id: 'ad_cement',
    title: 'UltraTech Cement',
    hindiTitle: 'अल्ट्राटेक सीमेंट - भारत का नंबर 1 सीमेंट (पक्का निर्माण)',
    description: 'मजबूत मकान निर्माण के लिए सबसे भरोसेमंद सीमेंट। सीलन और दरारों से पाएं 100% सुरक्षा।',
    badgeText: 'Sponsored / विज्ञापन',
    categoryTag: 'मकान निर्माण',
    sponsorName: 'UltraTech Authorized Stockist',
    iconEmoji: '🏗️',
    ctaText: 'ताजा रेट जानें',
    ctaSub: 'फ्री डिलीवरी',
    ctaUrl: 'tel:1800112233',
    bgColor: 'bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50',
    borderColor: 'border-amber-300'
  },
  {
    id: 'ad_solar',
    title: 'PM Kusum Solar Pump Scheme',
    hindiTitle: 'सरकारी पीएम-कुसुम योजना: 80% सब्सिडी पर सोलर पंप लगवाएं',
    description: 'बिजली व डीजल के महंगे खर्च से पाएं हमेशा के लिए मुक्ति। दिन में तेज धूप से करें मुफ्त सिंचाई।',
    badgeText: 'Sponsored / विज्ञापन',
    categoryTag: 'सरकारी योजना',
    sponsorName: 'PM Kusum Solar Agricultural Scheme',
    iconEmoji: '☀️',
    ctaText: 'सब्सिडी फॉर्म भरें',
    ctaSub: 'सरकारी पोर्टल',
    ctaUrl: 'https://pmkusum.mnre.gov.in',
    bgColor: 'bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50',
    borderColor: 'border-emerald-300'
  }
];

// Helper function to clean village strings for matching
const cleanVillage = (str: string) => {
  return str.split('(')[0].trim().toLowerCase();
};

// Deterministic distance calculation between villages for smooth proximity demo
const calculateVillageDistance = (userVil: string, workerVil: string): number => {
  const u = cleanVillage(userVil);
  const w = cleanVillage(workerVil);
  if (u === w) return 0;

  const knownDistances: { [pair: string]: number } = {
    'kalchina_nigrawathi': 2.0,
    'kalchina_samaypur': 3.2,
    'kalchina_akalpur': 4.5,
    'kalchina_nurpur': 5.1,
    'kalchina_barayla': 5.8,
    'kalchina_mindori': 6.2,
    'kalchina_nindori': 6.5,
    'kalchina_nahal': 7.8,
    'kalchina_dasna': 9.5
  };

  const key1 = `${u}_${w}`;
  const key2 = `${w}_${u}`;
  if (knownDistances[key1]) return knownDistances[key1];
  if (knownDistances[key2]) return knownDistances[key2];

  let sum = 0;
  for (let i = 0; i < u.length; i++) sum += u.charCodeAt(i);
  for (let i = 0; i < w.length; i++) sum += w.charCodeAt(i);
  const offset = ((sum % 85) / 10) + 1.8;
  return parseFloat(offset.toFixed(1));
};

export default function App() {
  // --- Location States ---
  const [statesList, setStatesList] = useState<string[]>(ALL_INDIAN_STATES_AND_UTS);
  const [districtsMap, setDistrictsMap] = useState<{ [state: string]: string[] }>({});
  const [villagesMap, setVillagesMap] = useState<{ [district: string]: string[] }>({});

  const [selectedState, setSelectedState] = useState<string>(() => {
    const saved = localStorage.getItem('gramseva_state');
    if (saved && saved !== 'states' && (ALL_INDIAN_STATES_AND_UTS.includes(saved) || ALL_INDIA_LOCATIONS[saved])) {
      return saved;
    }
    return 'Uttar Pradesh';
  });
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    return localStorage.getItem('gramseva_district') || 'Ghaziabad (गाजियाबाद)';
  });
  const [selectedVillage, setSelectedVillage] = useState<string>(() => {
    return localStorage.getItem('gramseva_village') || 'Kalchina (कलछीना)';
  });

  // Manual Village Input Toggle ("Mera Gaon List me nahi hai")
  const [isManualVillage, setIsManualVillage] = useState<boolean>(() => {
    return localStorage.getItem('gramseva_is_manual_village') === 'true';
  });
  const [manualVillageName, setManualVillageName] = useState<string>(() => {
    return localStorage.getItem('gramseva_manual_village_name') || '';
  });

  // Dropdown search query filters
  const [stateSearch, setStateSearch] = useState<string>('');
  const [districtSearch, setDistrictSearch] = useState<string>('');
  const [villageSearch, setVillageSearch] = useState<string>('');

  // Dropdown flags
  const [isStateOpen, setIsStateOpen] = useState<boolean>(false);
  const [isDistrictOpen, setIsDistrictOpen] = useState<boolean>(false);
  const [isVillageOpen, setIsVillageOpen] = useState<boolean>(false);

  // Selected Service Category & Real-Time Search / Group Filter States
  const [selectedCategory, setSelectedCategory] = useState<string | null>('electrician');
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');
  const [categoryGroupFilter, setCategoryGroupFilter] = useState<string>('all');

  // Firebase DB vs LocalStorage Mode Toggle (Default: Cloud DB active in production)
  const [useCloudDb, setUseCloudDb] = useState<boolean>(true);

  // Workers List State
  const [workers, setWorkers] = useState<WorkerService[]>(() => {
    const saved = localStorage.getItem('gramseva_workers');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_SEED_WORKERS;
      }
    }
    return INITIAL_SEED_WORKERS;
  });

  // Loading indicator for Cloud Sync
  const [isCloudLoading, setIsCloudLoading] = useState<boolean>(false);
  const [cloudStatusMsg, setCloudStatusMsg] = useState<string | null>(null);

  // Modal State for Adding New Worker
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState<boolean>(false);
  const [newWorker, setNewWorker] = useState({
    name: '',
    shopName: '',
    category: 'doctor',
    customCategory: '',
    phone: '',
    whatsapp: '',
    state: selectedState,
    district: selectedDistrict,
    village: selectedVillage,
    idNumber: '',
    documentPhotoUrl: '',
    charges: 'उचित दर / सलाह फ़ीस',
    experienceYears: 5,
    skills: '',
    password: '',
    securityQuestion: '4-अंकों का सीक्रेट पिन / 4-Digit Security PIN',
    securityAnswer: ''
  });

  // User Favorites State (array of worker IDs)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gramseva_favorites');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved favorites', e);
    }
    return [];
  });

  const handleToggleFavorite = (workerId: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(workerId);
      const updated = exists ? prev.filter((id) => id !== workerId) : [...prev, workerId];
      localStorage.setItem('gramseva_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  // Voice Assistant Speech & Toggle State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('gramseva_voice_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [voiceToast, setVoiceToast] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);

  // --- FEATURE: Paid Banner Ads & UPI Payment State ---
  const [isAdvertiseModalOpen, setIsAdvertiseModalOpen] = useState<boolean>(false);
  const [bannerAdRequests, setBannerAdRequests] = useState<BannerAdRequest[]>(() => {
    try {
      const saved = localStorage.getItem('gramseva_banner_requests');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved banner requests', e);
    }
    return INITIAL_BANNER_REQUESTS;
  });

  const [adForm, setAdForm] = useState({
    businessName: '',
    mobile: '',
    imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
    durationDays: 2,
    price: 150,
    utrNumber: ''
  });

  const [adminTab, setAdminTab] = useState<'pending_verifications' | 'workers' | 'banner_ads' | 'content_requests'>('pending_verifications');
  const [adminBannerFilter, setAdminBannerFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  // --- FEATURE: Crowd-Sourced Dynamic Locations & Categories State ---
  const [masterLocations, setMasterLocations] = useState<MasterLocation[]>(() => {
    try {
      const saved = localStorage.getItem('gramseva_master_locations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved master locations', e);
    }
    return [
      { id: 'loc_seed_1', state: 'Uttar Pradesh (उत्तर प्रदेश)', district: 'Ghaziabad (गाजियाबाद)', village: 'Kalchina (कलछीना)', status: 'approved' },
      { id: 'loc_seed_2', state: 'Uttar Pradesh (उत्तर प्रदेश)', district: 'Ghaziabad (गाजियाबाद)', village: 'Nigrawathi (निगरावठी)', status: 'approved' }
    ];
  });

  const [masterCategories, setMasterCategories] = useState<MasterCategory[]>(() => {
    try {
      const saved = localStorage.getItem('gramseva_master_categories');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved master categories', e);
    }
    return [
      { id: 'cat_seed_1', categoryName: 'Solar Pump Mechanic', hindiName: 'सोलर पंप मिस्त्री', status: 'approved' },
      { id: 'cat_seed_2', categoryName: 'Cattle Feed Store', hindiName: 'पशु आहार व खली की दुकान', status: 'approved' }
    ];
  });

  // "Other / अन्य" Selection Inputs for Registration Form
  const [addShopState, setAddShopState] = useState<string>(selectedState);
  const [addShopDistrict, setAddShopDistrict] = useState<string>(selectedDistrict);
  const [addShopVillage, setAddShopVillage] = useState<string>(selectedVillage);
  const [addShopCategory, setAddShopCategory] = useState<string>('doctor');

  const [customStateInput, setCustomStateInput] = useState<string>('');
  const [customDistrictInput, setCustomDistrictInput] = useState<string>('');
  const [customVillageInput, setCustomVillageInput] = useState<string>('');
  const [customCategoryInput, setCustomCategoryInput] = useState<string>('');

  // --- FEATURE: Firebase Settings GUI Modal States ---
  const [isFirebaseSettingsOpen, setIsFirebaseSettingsOpen] = useState<boolean>(false);
  const [firebaseForm, setFirebaseForm] = useState<FirebaseCustomConfig>(() => getActiveFirebaseConfig());

  // --- FEATURE: 3-Layer Owner Admin Portal States ---
  const [logoClickTimestamps, setLogoClickTimestamps] = useState<number[]>([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('gramseva_admin_logged_in') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [adminLoginStep, setAdminLoginStep] = useState<number>(1); // 1 = Credentials, 2 = OTP
  const [adminEmailInput, setAdminEmailInput] = useState<string>(''); // SECURITY FIX: Remove pre-filled email
  const [adminPasswordInput, setAdminPasswordInput] = useState<string>('');
  const [adminOtpInput, setAdminOtpInput] = useState<string>('');
  const [expectedOtp, setExpectedOtp] = useState<string>('');
  const [otpTimer, setOtpTimer] = useState<number>(60);
  const [adminErrorMessage, setAdminErrorMessage] = useState<string | null>(null);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [adminWorkerSearch, setAdminWorkerSearch] = useState<string>('');

  // --- FEATURE: Merchant Login, Forgot Password & Merchant Dashboard States ---
  const [isMerchantLoginOpen, setIsMerchantLoginOpen] = useState<boolean>(false);
  const [merchantMobileInput, setMerchantMobileInput] = useState<string>('');
  const [merchantPasswordInput, setMerchantPasswordInput] = useState<string>('');
  const [merchantLoginError, setMerchantLoginError] = useState<string | null>(null);

  const [loggedInWorkerId, setLoggedInWorkerId] = useState<string | null>(() => {
    return localStorage.getItem('gramseva_logged_in_merchant');
  });

  const [isMerchantDashboardOpen, setIsMerchantDashboardOpen] = useState<boolean>(false);
  const [isMerchantCardOpen, setIsMerchantCardOpen] = useState<boolean>(false);
  const [changeCurrentPassword, setChangeCurrentPassword] = useState<string>('');
  const [changeNewPassword, setChangeNewPassword] = useState<string>('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState<string>('');
  const [passwordChangeMsg, setPasswordChangeMsg] = useState<string | null>(null);

  // Forgot Password Security Question & Zero-Cost Reset States
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState<boolean>(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotMobileNumber, setForgotMobileNumber] = useState<string>('');
  const [forgotFoundWorker, setForgotFoundWorker] = useState<WorkerService | null>(null);
  const [forgotAnswerInput, setForgotAnswerInput] = useState<string>('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotNewPassword, setForgotNewPassword] = useState<string>('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState<string>('');
  const [forgotMerchantName, setForgotMerchantName] = useState<string>('');

  // Admin Password Reset Modal State
  const [adminResetWorkerId, setAdminResetWorkerId] = useState<string | null>(null);
  const [adminTempPasswordInput, setAdminTempPasswordInput] = useState<string>('123456');

  // --- FEATURE: Interactive Leaflet Map Modal States & GPS Location ---
  const [isMapPickerOpen, setIsMapPickerOpen] = useState<boolean>(false);
  const [pickerLat, setPickerLat] = useState<number>(28.7512);
  const [pickerLng, setPickerLng] = useState<number>(77.4215);

  const [isSingleShopMapOpen, setIsSingleShopMapOpen] = useState<boolean>(false);
  const [selectedShopForMap, setSelectedShopForMap] = useState<WorkerService | null>(null);

  const [isNearbyMapOpen, setIsNearbyMapOpen] = useState<boolean>(false);
  const [userGpsLat, setUserGpsLat] = useState<number>(28.7512);
  const [userGpsLng, setUserGpsLng] = useState<number>(77.4215);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [nearbyRadiusKm, setNearbyRadiusKm] = useState<number>(25);

  const handleGetCustomerLocation = () => {
    if (!navigator.geolocation) {
      setUserGpsLat(28.7512);
      setUserGpsLng(77.4215);
      setIsNearbyMapOpen(true);
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserGpsLat(pos.coords.latitude);
        setUserGpsLng(pos.coords.longitude);
        setIsDetectingGps(false);
        setIsNearbyMapOpen(true);
      },
      (err) => {
        console.warn('GPS Error:', err);
        setIsDetectingGps(false);
        setUserGpsLat(28.7512);
        setUserGpsLng(77.4215);
        setIsNearbyMapOpen(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Computed Logged In Merchant Worker Object
  const loggedInWorker = useMemo(() => {
    if (!loggedInWorkerId) return null;
    return workers.find((w) => w.id === loggedInWorkerId) || null;
  }, [workers, loggedInWorkerId]);

  // Sync masterLocations & masterCategories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gramseva_master_locations', JSON.stringify(masterLocations));
    } catch (e) {
      console.warn('Could not sync masterLocations to localStorage', e);
    }
  }, [masterLocations]);

  useEffect(() => {
    try {
      localStorage.setItem('gramseva_master_categories', JSON.stringify(masterCategories));
    } catch (e) {
      console.warn('Could not sync masterCategories to localStorage', e);
    }
  }, [masterCategories]);

  // Persist workers to local storage
  useEffect(() => {
    try {
      localStorage.setItem('gramseva_workers', JSON.stringify(workers));
    } catch (e) {
      console.warn("Could not sync workers to localStorage:", e);
    }
  }, [workers]);

  // Location dataset is loaded from ALL_INDIAN_STATES_AND_UTS and ALL_INDIA_LOCATIONS
  useEffect(() => {
    setStatesList(ALL_INDIAN_STATES_AND_UTS);
  }, []);

  // OTP Countdown Timer Effect
  useEffect(() => {
    let interval: any;
    if (isAdminLoginOpen && adminLoginStep === 2 && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isAdminLoginOpen, adminLoginStep, otpTimer]);

  // Sync to Firestore on Cloud Mode Toggle or Initial Mount
  useEffect(() => {
    if (useCloudDb && isFirebaseInitialized) {
      setIsCloudLoading(true);
      setCloudStatusMsg('Cloud से कनेक्ट हो रहा है...');
      
      // Fetch Workers
      fetchWorkersFromFirestore()
        .then((cloudData) => {
          if (cloudData && cloudData.length > 0) {
            setWorkers(cloudData);
            setCloudStatusMsg('✅ Cloud Live Sync Active');
          } else {
            setCloudStatusMsg('✅ Cloud Connected (Fallback Initial Data)');
          }
        })
        .catch((err) => {
          console.warn('Error reading workers from Firestore:', err);
          setCloudStatusMsg('⚠️ Offline Mode (Cloud Read Fallback)');
        })
        .finally(() => {
          setIsCloudLoading(false);
        });

      // Fetch Master Locations
      fetchMasterLocationsFromFirestore()
        .then((locs) => {
          if (locs && locs.length > 0) {
            setMasterLocations(locs);
          }
        })
        .catch((err) => console.warn('Error reading master locations from Firestore:', err));

      // Fetch Master Categories
      fetchMasterCategoriesFromFirestore()
        .then((cats) => {
          if (cats && cats.length > 0) {
            setMasterCategories(cats);
          }
        })
        .catch((err) => console.warn('Error reading master categories from Firestore:', err));
    }
  }, [useCloudDb]);

  // Persist location selection changes
  useEffect(() => {
    localStorage.setItem('gramseva_state', selectedState);
    localStorage.setItem('gramseva_district', selectedDistrict);
    localStorage.setItem('gramseva_village', selectedVillage);
    localStorage.setItem('gramseva_is_manual_village', String(isManualVillage));
    localStorage.setItem('gramseva_manual_village_name', manualVillageName);
    localStorage.setItem('gramseva_use_cloud', String(useCloudDb));
    localStorage.setItem('gramseva_voice_enabled', String(isVoiceEnabled));
  }, [selectedState, selectedDistrict, selectedVillage, isManualVillage, manualVillageName, useCloudDb, isVoiceEnabled]);

  // Handle Deep Link to Shop Profile (?shop=WORKER_ID or ?id=WORKER_ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetShopId = params.get('shop') || params.get('id');

    if (targetShopId && workers.length > 0) {
      const matchedWorker = workers.find((w) => w.id === targetShopId);
      if (matchedWorker) {
        if (matchedWorker.state) setSelectedState(matchedWorker.state);
        if (matchedWorker.district) setSelectedDistrict(matchedWorker.district);
        if (matchedWorker.village) setSelectedVillage(matchedWorker.village);
        if (matchedWorker.category) setSelectedCategory(matchedWorker.category);

        // Reset search query and group filter so targeted card is visible
        setCategorySearchQuery('');
        setCategoryGroupFilter('all');

        // Smooth scroll & highlight targeted shop card
        setTimeout(() => {
          const el = document.getElementById(`worker-${matchedWorker.id}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add('ring-4', 'ring-amber-400');
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-amber-400');
            }, 3500);
          }
        }, 700);
      }
    }
  }, [workers]);

  // Voice Text-to-Speech Assistant
  const speakText = (text: string, force: boolean = false) => {
    if (!('speechSynthesis' in window)) {
      alert('आवाज़ सुविधा इस ब्राउज़र में उपलब्ध नहीं है।');
      return;
    }

    // Respect user's voice mute toggle state unless forced
    if (!isVoiceEnabled && !force) {
      return;
    }

    if (isSpeaking && activeSpeechText === text) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setActiveSpeechText(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.88;

    utterance.onend = () => {
      setIsSpeaking(false);
      setActiveSpeechText(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setActiveSpeechText(null);
    };

    setIsSpeaking(true);
    setActiveSpeechText(text);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle Voice Guidance (Mute / Unmute Control)
  const handleToggleVoice = () => {
    const nextState = !isVoiceEnabled;
    setIsVoiceEnabled(nextState);
    localStorage.setItem('gramseva_voice_enabled', String(nextState));

    if (!nextState) {
      // User turned off voice (Muted)
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      setActiveSpeechText(null);
      setVoiceToast('आवाज़ बंद कर दी गई है 🔇');
    } else {
      // User turned on voice (Enabled)
      setVoiceToast('आवाज़ चालू है 🔊');
      speakText(`ग्राम सेवा आवाज़ सेवा चालू कर दी गई है। वर्तमान गाँव ${activeVillageDisplay}`, true);
    }

    // Auto-clear feedback toast after 2.5 seconds
    setTimeout(() => {
      setVoiceToast(null);
    }, 2500);
  };

  // --- WEB SPEECH API: CATEGORY VOICE SEARCH FOR RURAL USERS ---
  const [isListening, setIsListening] = useState<boolean>(false);

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceToast('आवाज़ खोज (Voice Search) आपके ब्राउज़र में उपलब्ध नहीं है। 🎙️');
      setTimeout(() => setVoiceToast(null), 3000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'hi-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceToast('सुन रहे हैं... काम या दुकान का नाम बोलिए 🎙️');
      };

      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            const cleaned = transcript.trim().replace(/[.।]/g, '');
            setCategorySearchQuery(cleaned);
            setVoiceToast(`खोजा गया: "${cleaned}" 🔍`);
            if (isVoiceEnabled) {
              speakText(`खोजा गया ${cleaned}`);
            }
          }
        }
        setIsListening(false);
        setTimeout(() => setVoiceToast(null), 3000);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setVoiceToast('कोई आवाज़ नहीं सुनाई दी। फिर से बोलें। 🎙️');
        } else if (event.error === 'not-allowed') {
          setVoiceToast('माइक्रोफोन की अनुमति दें। 🚫');
        } else {
          setVoiceToast('आवाज़ पहचानने में समस्या हुई। 🎙️');
        }
        setTimeout(() => setVoiceToast(null), 3000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
      setVoiceToast('आवाज़ खोज शुरू नहीं हो सकी। 🎙️');
      setTimeout(() => setVoiceToast(null), 3000);
    }
  };

  // --- SMART SHARE APP FUNCTIONALITY FOR VIRAL GROWTH ---
  const handleShareApp = async () => {
    const appUrl = window.location.origin + window.location.pathname;
    const shareTitle = 'ग्राम सेवा - डिजिटल गाँव';
    const shareMessage = `गांव की हर छोटी-बड़ी सेवा, डॉक्टर, मिस्त्री और दुकान अब 'ग्राम सेवा' ऐप पर! 📍 अपने गाँव को डिजिटल बनाएँ। यहाँ से इंस्टॉल करें:\n${appUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareMessage,
          url: appUrl,
        });
        setVoiceToast('ऐप सफलतापूर्वक शेयर किया गया! 📲');
        setTimeout(() => setVoiceToast(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return; // User canceled native share sheet
        }
      }
    }

    // Fallback: Clipboard Copy
    try {
      await navigator.clipboard.writeText(shareMessage);
      setVoiceToast('लिंक कॉपी किया गया! (Link Copied) 📋');
    } catch (copyErr) {
      setVoiceToast('लिंक कॉपी किया गया! (Link Copied)');
    }
    setTimeout(() => setVoiceToast(null), 3000);
  };

  // --- SECRET LOGO GESTURE HANDLER (5 rapid taps within 3 seconds) ---
  const handleHeaderLogoClick = () => {
    const now = Date.now();
    const recentClicks = logoClickTimestamps.filter((t) => now - t < 3000);
    const updated = [...recentClicks, now];
    setLogoClickTimestamps(updated);

    if (updated.length >= 5) {
      setLogoClickTimestamps([]);
      if (isAdminLoggedIn) {
        setIsAdminDashboardOpen(true);
      } else {
        setIsAdminLoginOpen(true);
        setAdminLoginStep(1);
        setAdminErrorMessage(null);
        setAdminEmailInput(''); // Clear email for security fix
        setAdminPasswordInput('');
      }
    }
  };

  // --- ADMIN LOGIN LAYER 1 HANDLER ---
  const handleAdminLayer1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = adminEmailInput.trim().toLowerCase();
    if (trimmedEmail === 'mohinkhan7055450913@gmail.com' && adminPasswordInput === 'Muskmohinkhan') {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setExpectedOtp(otp);
      setAdminLoginStep(2);
      setOtpTimer(60);
      setAdminErrorMessage(null);
      setAdminOtpInput('');
    } else {
      setAdminErrorMessage('❌ गलत ईमेल या पासवर्ड! (Invalid Admin Credentials)');
    }
  };

  // --- ADMIN LOGIN LAYER 2 HANDLER (OTP) ---
  const handleAdminLayer2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminOtpInput.trim() === expectedOtp) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('gramseva_admin_logged_in', 'true');
      setIsAdminLoginOpen(false);
      setIsAdminDashboardOpen(true);
      setAdminErrorMessage(null);
      alert('👑 स्वागत है मालिक! एडमिन लॉगिन सफल हुआ। (Admin Login Successful)');
    } else {
      setAdminErrorMessage('❌ अमान्य OTP कोड! कृपया दोबारा जांचें।');
    }
  };

  // Pending verification list filter
  const pendingWorkers = useMemo(() => {
    return workers.filter((w) => w.verificationStatus === 'pending' || (!w.isVerified && w.verificationStatus !== 'rejected'));
  }, [workers]);

  // --- ADMIN WORKER VERIFICATION STATUS UPDATE (APPROVE / REJECT) ---
  const handleAdminUpdateStatus = async (workerId: string, status: 'approved' | 'rejected') => {
    const isVerified = status === 'approved';
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          if (useCloudDb && isFirebaseInitialized) {
            updateWorkerVerificationInFirestore(workerId, isVerified, status);
          }
          return {
            ...w,
            verificationStatus: status,
            isVerified,
            userTags: status === 'approved' ? ['सत्यापित', 'आधार लिंक्ड'] : ['अस्वीकृत']
          };
        }
        return w;
      })
    );

    if (status === 'approved') {
      alert('✅ सत्यापन स्वीकृत! सार्वजनिक रूप से "Aadhaar Verified" बैज लागू हो गया।');
    } else {
      alert('❌ प्रोफाइल अस्वीकृत (Rejected)।');
    }
  };

  // --- ADMIN WORKER VERIFICATION TOGGLE ---
  const handleAdminToggleVerify = async (workerId: string) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const nextVal = !w.isVerified;
          const status = nextVal ? 'approved' : 'pending';
          if (useCloudDb && isFirebaseInitialized) {
            updateWorkerVerificationInFirestore(workerId, nextVal, status);
          }
          return { ...w, isVerified: nextVal, verificationStatus: status };
        }
        return w;
      })
    );
  };

  // --- ADMIN WORKER DELETE ---
  const handleAdminDeleteWorker = async (workerId: string, workerName: string) => {
    if (window.confirm(`क्या आप वाकई ${workerName} का प्रोफाइल हटाना चाहते हैं?`)) {
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      if (useCloudDb && isFirebaseInitialized) {
        await deleteWorkerFromFirestore(workerId);
      }
    }
  };

  // --- ADMIN LOGOUT ---
  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('gramseva_admin_logged_in');
    setIsAdminDashboardOpen(false);
    alert('लॉग आउट पूरा हो गया!');
  };

  // --- MERCHANT LOGIN HANDLER ---
  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantLoginError(null);
    const cleanMobile = merchantMobileInput.trim().replace(/[^0-9]/g, '');

    if (!cleanMobile) {
      setMerchantLoginError('कृपया रजिस्टर्ड 10-अंकों का मोबाइल नंबर दर्ज करें!');
      return;
    }

    const worker = workers.find(
      (w) => w.phone.replace(/[^0-9]/g, '') === cleanMobile || w.whatsapp.replace(/[^0-9]/g, '') === cleanMobile
    );

    if (!worker) {
      setMerchantLoginError('❌ इस नंबर से कोई दुकान या सेवा पंजीकृत नहीं है।');
      return;
    }

    const expectedPassword = worker.password || '123456';
    if (merchantPasswordInput.trim() !== expectedPassword) {
      setMerchantLoginError('❌ गलत पासवर्ड! (यदि पासवर्ड भूल गए हैं तो "पासवर्ड भूल गए?" का उपयोग करें)');
      return;
    }

    setLoggedInWorkerId(worker.id);
    localStorage.setItem('gramseva_logged_in_merchant', worker.id);
    setIsMerchantLoginOpen(false);
    setIsMerchantDashboardOpen(true);
    setMerchantMobileInput('');
    setMerchantPasswordInput('');
  };

  // --- FORGOT PASSWORD MULTI-STEP WORKFLOW HANDLERS ---
  const handleForgotStep1Search = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const cleanNum = forgotMobileNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 10) {
      setForgotError('कृपया 10-अंकों का मान्य रजिस्टर्ड मोबाइल नंबर दर्ज करें!');
      return;
    }

    const matchedWorker = workers.find(
      (w) => w.phone.replace(/[^0-9]/g, '') === cleanNum || w.whatsapp.replace(/[^0-9]/g, '') === cleanNum
    );

    if (!matchedWorker) {
      setForgotError('❌ इस मोबाइल नंबर से कोई दुकान या व्यापारी पंजीकृत नहीं है।');
      return;
    }

    setForgotFoundWorker(matchedWorker);
    setForgotMerchantName(matchedWorker.name);
    setForgotStep(2);
    setForgotAnswerInput('');
    setForgotError(null);
  };

  const handleForgotStep2VerifyAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotFoundWorker) return;

    const inputClean = forgotAnswerInput.trim().toLowerCase();
    const targetAnswer = (forgotFoundWorker.securityAnswer || '').trim().toLowerCase();
    const currentPass = (forgotFoundWorker.password || '123456').trim().toLowerCase();

    // Valid check: match security answer OR current password OR default '1234'
    const isCorrect =
      (targetAnswer && inputClean === targetAnswer) ||
      (currentPass && inputClean === currentPass) ||
      inputClean === '1234' ||
      inputClean === '123456';

    if (isCorrect) {
      setForgotStep(3);
      setForgotError(null);
      setForgotNewPassword('');
      setForgotConfirmPassword('');
    } else {
      setForgotError('❌ सुरक्षा प्रश्न का उत्तर या सीक्रेट PIN गलत है!');
    }
  };

  const handleForgotStep3SubmitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotFoundWorker) return;

    if (forgotNewPassword.trim().length < 4) {
      setForgotError('❌ नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए!');
      return;
    }

    if (forgotNewPassword.trim() !== forgotConfirmPassword.trim()) {
      setForgotError('❌ नया पासवर्ड और पासवर्ड पुष्टि आपस में मेल नहीं खा रहे!');
      return;
    }

    const newPass = forgotNewPassword.trim();

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === forgotFoundWorker.id) {
          if (useCloudDb && isFirebaseInitialized) {
            updateWorkerPasswordInFirestore(w.id, newPass);
          }
          return { ...w, password: newPass };
        }
        return w;
      })
    );

    // Automatically log in the merchant
    setLoggedInWorkerId(forgotFoundWorker.id);
    localStorage.setItem('gramseva_logged_in_merchant', forgotFoundWorker.id);

    setIsForgotPasswordOpen(false);
    setIsMerchantDashboardOpen(true);
    alert(`🎉 नया पासवर्ड सफलतापूर्वक सेव हो गया!\n\nआपकी दुकान "${forgotFoundWorker.shopName || forgotFoundWorker.name}" में लॉगिन कर दिया गया है।`);
  };

  const getAdminWhatsAppResetUrl = () => {
    const adminPhone = '919876543210';
    const name = forgotFoundWorker ? forgotFoundWorker.name : forgotMerchantName || 'व्यापारी';
    const shop = forgotFoundWorker && forgotFoundWorker.shopName ? forgotFoundWorker.shopName : '—';
    const phone = forgotFoundWorker ? forgotFoundWorker.phone : forgotMobileNumber || '—';

    const msg = `नमस्ते एडमिन,\n\nमैं Gram Seva ऐप में अपनी दुकान का पासवर्ड भूल गया हूँ और रिसेट सहायता चाहिए।\n\n👤 व्यापारी का नाम: ${name}\n🏪 दुकान का नाम: ${shop}\n📱 रजिस्टर्ड मोबाइल: ${phone}\n\nकृपया मेरा पासवर्ड रिसेट करने में मदद करें।`;

    return `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
  };

  // --- DIRECT MAILTO EMAIL DEEP-LINK FOR FORGOT PASSWORD ---
  const handleSendForgotPasswordEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotMerchantName.trim() || !forgotMobileNumber.trim()) {
      alert('कृपया व्यापारी का नाम और रजिस्टर्ड मोबाइल नंबर दर्ज करें!');
      return;
    }

    const subject = encodeURIComponent('Gram Seva - Admin Password Reset Request');
    const body = encodeURIComponent(
      `नमस्ते एडमिन,\n\nमैं अपनी दुकान का पासवर्ड भूल गया हूँ। कृपया नया पासवर्ड सेट करें।\n\nव्यापारी का नाम: ${forgotMerchantName.trim()}\nरजिस्टर्ड मोबाइल नंबर: ${forgotMobileNumber.trim()}`
    );

    const mailtoUrl = `mailto:emberchatofficial@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    alert('📧 आपका ईमेल ऐप (Gmail / Mail Client) खुल रहा है!\n\nएडमिन (emberchatofficial@gmail.com) को रिसेट अनुरोध भेजें।');
  };

  // --- MERCHANT DASHBOARD PASSWORD CHANGE ---
  const handleMerchantPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeMsg(null);

    if (!loggedInWorker) return;

    const currentPass = loggedInWorker.password || '123456';

    if (changeCurrentPassword.trim() !== currentPass) {
      setPasswordChangeMsg('❌ वर्तमान पासवर्ड गलत दर्ज किया गया है!');
      return;
    }

    if (changeNewPassword.trim().length < 4) {
      setPasswordChangeMsg('❌ नया पासवर्ड कम से कम 4 अक्षरों का होना चाहिए!');
      return;
    }

    if (changeNewPassword.trim() !== changeConfirmPassword.trim()) {
      setPasswordChangeMsg('❌ नया पासवर्ड और पासवर्ड पुष्टि आपस में मेल नहीं खा रहे!');
      return;
    }

    const newPass = changeNewPassword.trim();

    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === loggedInWorker.id) {
          if (useCloudDb && isFirebaseInitialized) {
            updateWorkerPasswordInFirestore(w.id, newPass);
          }
          return { ...w, password: newPass };
        }
        return w;
      })
    );

    setChangeCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    setPasswordChangeMsg('🎉 पासवर्ड सफलतापूर्वक बदल गया! अगले लॉगिन के लिए इसका उपयोग करें।');
    alert('🎉 आपका नया पासवर्ड सफलतापूर्वक सेव हो गया है!');
  };

  // --- MERCHANT LOGOUT ---
  const handleMerchantLogout = () => {
    setLoggedInWorkerId(null);
    localStorage.removeItem('gramseva_logged_in_merchant');
    setIsMerchantDashboardOpen(false);
    alert('व्यापारी खाते से लॉग आउट पूरा हो गया!');
  };

  // --- ADMIN PASSWORD RESET FOR WORKER/MERCHANT ---
  const handleAdminSaveResetPassword = async (workerId: string, tempPassword: string) => {
    if (!tempPassword.trim()) {
      alert('कृपया अस्थायी पासवर्ड दर्ज करें!');
      return;
    }
    const cleanPass = tempPassword.trim();
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          if (useCloudDb && isFirebaseInitialized) {
            updateWorkerPasswordInFirestore(workerId, cleanPass);
          }
          return { ...w, password: cleanPass };
        }
        return w;
      })
    );
    setAdminResetWorkerId(null);
    alert(`✅ पासवर्ड रिसेट सफल!\n\nव्यापारी का नया अस्थायी पासवर्ड: ${cleanPass}`);
  };

  // --- ADMIN MASTER LOCATION & CATEGORY HANDLERS ---
  const handleApproveMasterLocation = async (id: string) => {
    setMasterLocations((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: 'approved' as const } : l))
    );
    if (useCloudDb && isFirebaseInitialized) {
      await updateMasterLocationStatusInFirestore(id, 'approved');
    }
    alert('✅ नई लोकेशन (गांव/जिला) स्वीकृत व सार्वजनिक कर दी गई है!');
  };

  const handleDeleteMasterLocation = async (id: string) => {
    if (!confirm('क्या आप इस लोकेशन अनुरोध को हटाना चाहते हैं?')) return;
    setMasterLocations((prev) => prev.filter((l) => l.id !== id));
    if (useCloudDb && isFirebaseInitialized) {
      await deleteMasterLocationFromFirestore(id);
    }
    alert('❌ लोकेशन अनुरोध हटा दिया गया!');
  };

  const handleApproveMasterCategory = async (id: string) => {
    setMasterCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'approved' as const } : c))
    );
    if (useCloudDb && isFirebaseInitialized) {
      await updateMasterCategoryStatusInFirestore(id, 'approved');
    }
    alert('✅ नई व्यावसायिक श्रेणी स्वीकृत व सार्वजनिक ऐप में लाइव कर दी गई!');
  };

  const handleDeleteMasterCategory = async (id: string) => {
    if (!confirm('क्या आप इस श्रेणी अनुरोध को हटाना चाहते हैं?')) return;
    setMasterCategories((prev) => prev.filter((c) => c.id !== id));
    if (useCloudDb && isFirebaseInitialized) {
      await deleteMasterCategoryFromFirestore(id);
    }
    alert('❌ श्रेणी अनुरोध हटा दिया गया!');
  };

  // --- FEATURE: BANNER AD SUBMISSION & APPROVAL HANDLERS ---
  const handleBannerAdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adForm.businessName.trim() || !adForm.mobile.trim() || !adForm.utrNumber.trim()) {
      alert('कृपया बिज़नेस का नाम, मोबाइल नंबर और 12-अंकों का UTR नंबर भरें!');
      return;
    }

    if (adForm.utrNumber.trim().length < 6) {
      alert('कृपया सही 12-अंकों का UPI UTR / Transaction Reference नंबर दर्ज करें!');
      return;
    }

    const newReq: BannerAdRequest = {
      id: `ad_req_${Date.now()}`,
      businessName: adForm.businessName.trim(),
      mobile: adForm.mobile.trim(),
      imageUrl: adForm.imageUrl.trim() || 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
      durationDays: adForm.durationDays,
      price: adForm.price,
      utrNumber: adForm.utrNumber.trim(),
      status: 'pending',
      submittedAt: Date.now()
    };

    const updated = [newReq, ...bannerAdRequests];
    setBannerAdRequests(updated);
    localStorage.setItem('gramseva_banner_requests', JSON.stringify(updated));

    setIsAdvertiseModalOpen(false);
    setAdForm({
      businessName: '',
      mobile: '',
      imageUrl: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=80',
      durationDays: 2,
      price: 150,
      utrNumber: ''
    });

    alert(`🎉 आपका विज्ञापन अनुरोध सफलतापूर्वक दर्ज हो गया है!\n\nUTR नंबर: ${newReq.utrNumber}\nचयनित प्लान: ${newReq.durationDays} दिन (₹${newReq.price})\n\nएडमिन सत्यापन के बाद 1 घंटे में आपका बैनर ऐप में लाइव कर दिया जाएगा!`);
  };

  const handleApproveBannerAd = (reqId: string) => {
    const updated = bannerAdRequests.map((r) => {
      if (r.id === reqId) {
        const approvedAt = Date.now();
        const expiryTime = approvedAt + r.durationDays * 24 * 60 * 60 * 1000;
        return {
          ...r,
          status: 'approved' as const,
          approvedAt,
          expiryTime
        };
      }
      return r;
    });
    setBannerAdRequests(updated);
    localStorage.setItem('gramseva_banner_requests', JSON.stringify(updated));
    alert('✅ विज्ञापन को सफलतापूर्वक अप्रूव (लाइव) कर दिया गया है!');
  };

  const handleRejectBannerAd = (reqId: string) => {
    const updated = bannerAdRequests.map((r) => {
      if (r.id === reqId) {
        return {
          ...r,
          status: 'rejected' as const
        };
      }
      return r;
    });
    setBannerAdRequests(updated);
    localStorage.setItem('gramseva_banner_requests', JSON.stringify(updated));
    alert('❌ विज्ञापन अनुरोध को निरस्त (रद्द) कर दिया गया है!');
  };

  const handleDeleteBannerAd = (reqId: string) => {
    if (window.confirm('क्या आप इस विज्ञापन अनुरोध को हटाना चाहते हैं?')) {
      const updated = bannerAdRequests.filter((r) => r.id !== reqId);
      setBannerAdRequests(updated);
      localStorage.setItem('gramseva_banner_requests', JSON.stringify(updated));
    }
  };

  // Compute Active Approved Banner Ads for Live Top Slot Display
  const activeApprovedAds = useMemo(() => {
    return bannerAdRequests.filter(
      (r) => r.status === 'approved' && r.expiryTime && r.expiryTime > Date.now()
    );
  }, [bannerAdRequests]);

  // --- FIREBASE GUI SETTINGS SAVE HANDLER ---
  const handleSaveFirebaseSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gramseva_custom_firebase_config', JSON.stringify(firebaseForm));
    const result = initOrUpdateFirebase(firebaseForm);
    if (result.success) {
      setUseCloudDb(true);
      setCloudStatusMsg('✅ Firebase Cloud Connection Active');
      setIsFirebaseSettingsOpen(false);
      alert('🎉 फायरबेस एपीआई की (Firebase Credentials) सफलतापूर्वक सेव व कनेक्ट हो गई!');
    } else {
      alert('⚠️ फायरबेस कनेक्शन में समस्या: ' + result.error);
    }
  };

  // --- FIREBASE GUI RESET HANDLER ---
  const handleResetFirebaseSettings = () => {
    localStorage.removeItem('gramseva_custom_firebase_config');
    setFirebaseForm(DEFAULT_FIREBASE_CONFIG);
    initOrUpdateFirebase(DEFAULT_FIREBASE_CONFIG);
    alert('डिफ़ॉल्ट फायरबेस कॉन्फ़िगरेशन रीसेट हो गया!');
  };

  // --- INTERACTIVE WORKER RATING & REVIEW SUBMIT HANDLER ---
  const handleRateWorker = async (workerId: string, ratingStars: number, selectedTags: string[]) => {
    setWorkers((prev) =>
      prev.map((w) => {
        if (w.id === workerId) {
          const currentCount = w.reviewsCount || 10;
          const currentRating = w.rating || 4.8;
          const newCount = currentCount + 1;
          const newRating = parseFloat((((currentRating * currentCount) + ratingStars) / newCount).toFixed(1));
          const existingTags = w.userTags || [];
          const updatedTags = Array.from(new Set([...existingTags, ...selectedTags]));

          const updated = {
            ...w,
            rating: Math.min(5.0, newRating),
            reviewsCount: newCount,
            userTags: updatedTags
          };

          if (useCloudDb && isFirebaseInitialized) {
            updateWorkerRatingInFirestore(workerId, updated.rating, newCount, updatedTags);
          }

          return updated;
        }
        return w;
      })
    );
  };

  // Compute All Categories (Base CATEGORIES + Approved Custom Master Categories)
  const allCategories = useMemo(() => {
    const approvedCustom: CategoryItem[] = masterCategories
      .filter((c) => c.status === 'approved')
      .map((c) => ({
        id: `custom_${c.id}`,
        hindiName: c.hindiName || c.categoryName,
        englishName: c.categoryName,
        group: 'other' as const,
        icon: Store,
        bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-98',
        borderColor: 'border-emerald-400',
        textColor: 'text-emerald-950',
        iconColor: 'text-emerald-600 bg-emerald-100',
        voiceText: c.hindiName || c.categoryName,
        keywords: [c.hindiName || '', c.categoryName || '']
      }));

    return [...CATEGORIES, ...approvedCustom];
  }, [masterCategories]);

  // Filtered Categories based on Search Query and Group Filter Tab
  const filteredCategories = useMemo(() => {
    let result = allCategories;

    // 1. Group Filter Tab
    if (categoryGroupFilter === 'favorites') {
      const favCatIds = new Set(
        workers.filter((w) => favorites.includes(w.id)).map((w) => w.category)
      );
      if (favCatIds.size > 0) {
        result = result.filter((cat) => favCatIds.has(cat.id));
      }
    } else if (categoryGroupFilter !== 'all') {
      result = result.filter((cat) => cat.group === categoryGroupFilter);
    }

    // 2. Search Bar Query (Hindi / English / Keywords)
    if (categorySearchQuery.trim()) {
      const q = categorySearchQuery.toLowerCase().trim();
      result = result.filter((cat) => {
        const hName = (cat.hindiName || '').toLowerCase();
        const eName = (cat.englishName || '').toLowerCase();
        const kWords = (cat.keywords || []).map((k) => k.toLowerCase());

        return hName.includes(q) || eName.includes(q) || kWords.some((kw) => kw.includes(q));
      });
    }

    return result;
  }, [allCategories, categoryGroupFilter, categorySearchQuery, workers, favorites]);

  // Approved master locations list
  const approvedMasterLocations = useMemo(() => {
    return masterLocations.filter((l) => l.status === 'approved');
  }, [masterLocations]);

  // Filtered dropdown options with dynamic approved locations
  const allStatesList = useMemo(() => {
    const set = new Set(statesList);
    approvedMasterLocations.forEach((l) => {
      if (l.state) set.add(l.state);
    });
    return Array.from(set);
  }, [statesList, approvedMasterLocations]);

  const filteredStates = useMemo(() => {
    if (!stateSearch.trim()) return allStatesList;
    const q = stateSearch.toLowerCase().trim();
    return allStatesList.filter((s) => s.toLowerCase().includes(q));
  }, [allStatesList, stateSearch]);

  const currentDistricts = useMemo(() => {
    if (!selectedState) return [];
    const base = getDistrictsForState(selectedState);
    const set = new Set(base);
    approvedMasterLocations.forEach((l) => {
      if (l.state === selectedState && l.district) set.add(l.district);
    });
    return Array.from(set);
  }, [selectedState, approvedMasterLocations]);

  const filteredDistricts = useMemo(() => {
    if (!districtSearch.trim()) return currentDistricts;
    const q = districtSearch.toLowerCase().trim();
    return currentDistricts.filter((d) => d.toLowerCase().includes(q));
  }, [currentDistricts, districtSearch]);

  const currentVillages = useMemo(() => {
    if (!selectedDistrict) return [];
    const base = getVillagesForDistrict(selectedState, selectedDistrict);
    const set = new Set(base);
    approvedMasterLocations.forEach((l) => {
      if (l.district === selectedDistrict && l.village) set.add(l.village);
    });
    return Array.from(set);
  }, [selectedState, selectedDistrict, approvedMasterLocations]);

  const filteredVillages = useMemo(() => {
    if (!villageSearch.trim()) return currentVillages;
    const q = villageSearch.toLowerCase().trim();
    return currentVillages.filter((v) => v.toLowerCase().includes(q));
  }, [currentVillages, villageSearch]);

  const addShopDistricts = useMemo(() => {
    if (!addShopState || addShopState === 'other') return currentDistricts;
    const base = getDistrictsForState(addShopState);
    const set = new Set(base);
    approvedMasterLocations.forEach((l) => {
      if (l.state === addShopState && l.district) set.add(l.district);
    });
    return Array.from(set);
  }, [addShopState, currentDistricts, approvedMasterLocations]);

  const addShopVillages = useMemo(() => {
    if (!addShopDistrict || addShopDistrict === 'other') return currentVillages;
    const base = getVillagesForDistrict(addShopState, addShopDistrict);
    const set = new Set(base);
    approvedMasterLocations.forEach((l) => {
      if (l.district === addShopDistrict && l.village) set.add(l.village);
    });
    return Array.from(set);
  }, [addShopState, addShopDistrict, currentVillages, approvedMasterLocations]);

  const activeVillageDisplay = isManualVillage ? (manualVillageName.trim() || 'आपका गाँव (Your Village)') : selectedVillage;

  // WORKERS PROXIMITY SORTING ENGINE
  const sortedWorkersWithDistance = useMemo(() => {
    let candidateWorkers: WorkerService[] = [];

    if (categoryGroupFilter === 'favorites') {
      const favWorkers = workers.filter((w) => favorites.includes(w.id));
      if (selectedCategory) {
        const matchingCat = favWorkers.filter((w) => w.category === selectedCategory);
        if (matchingCat.length > 0) {
          candidateWorkers = matchingCat;
        } else {
          candidateWorkers = favWorkers;
        }
      } else {
        candidateWorkers = favWorkers;
      }
    } else {
      if (!selectedCategory) return [];
      candidateWorkers = workers.filter((w) => w.category === selectedCategory);
    }

    const mapped = candidateWorkers.map((worker) => {
      const dist = calculateVillageDistance(activeVillageDisplay, worker.village);
      return {
        ...worker,
        distanceKm: dist,
        isExactVillage: dist === 0
      };
    });

    mapped.sort((a, b) => a.distanceKm - b.distanceKm);
    return mapped;
  }, [workers, selectedCategory, categoryGroupFilter, favorites, activeVillageDisplay]);

  // Grouped workers by distance bucket
  const exactVillageWorkers = useMemo(() => {
    return sortedWorkersWithDistance.filter((w) => w.isExactVillage);
  }, [sortedWorkersWithDistance]);

  const nearbyVillageWorkers = useMemo(() => {
    return sortedWorkersWithDistance.filter((w) => !w.isExactVillage);
  }, [sortedWorkersWithDistance]);

  const activeCategoryObj = allCategories.find((c) => c.id === selectedCategory);

  // Add Worker / Shop Submit Handler with Document Verification & Dynamic Crowd-Sourcing
  const handleAddWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorker.name.trim() || !newWorker.phone.trim()) {
      alert('कृपया मालिक का नाम और मोबाइल नंबर भरें (Please enter Owner Name & Phone Number)');
      return;
    }

    // Resolve State, District, Village
    const finalState = addShopState === 'other' ? customStateInput.trim() : (newWorker.state || selectedState);
    const finalDistrict = addShopDistrict === 'other' ? customDistrictInput.trim() : (newWorker.district || selectedDistrict);
    const finalVillage = addShopVillage === 'other' ? customVillageInput.trim() : (newWorker.village || activeVillageDisplay);

    // Resolve Category
    const isOtherCategory = addShopCategory === 'other' || addShopCategory === 'custom_business';
    const finalCategory = isOtherCategory ? 'custom_business' : addShopCategory;
    const finalCustomCatName = isOtherCategory ? (customCategoryInput.trim() || newWorker.customCategory.trim() || 'अन्य व्यवसाय') : undefined;

    const catObj = allCategories.find((c) => c.id === finalCategory);
    const categoryLabel = finalCustomCatName || (catObj?.hindiName || 'स्थानीय व्यवसाय');

    const created: WorkerService = {
      id: 'w_' + Date.now(),
      name: newWorker.name.trim(),
      shopName: newWorker.shopName.trim() || undefined,
      hindiName: newWorker.shopName.trim()
        ? `${newWorker.shopName.trim()} (${newWorker.name.trim()})`
        : `${newWorker.name.trim()} (${categoryLabel})`,
      category: finalCategory,
      customCategory: finalCustomCatName,
      phone: newWorker.phone.trim(),
      whatsapp: newWorker.whatsapp.trim() || '91' + newWorker.phone.trim(),
      village: finalVillage,
      district: finalDistrict,
      state: finalState,
      rating: 5.0,
      jobsDone: 0,
      experienceYears: Number(newWorker.experienceYears) || 3,
      isVerified: false, // Default verification status
      verificationStatus: 'pending', // Default pending until admin approves
      idNumber: newWorker.idNumber.trim() || '12-अंक आधार दर्ज',
      documentPhotoUrl: newWorker.documentPhotoUrl.trim() || 'https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?w=300&auto=format&fit=crop&q=80',
      avatarUrl: newWorker.documentPhotoUrl.trim() || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newWorker.name.trim())}`,
      charges: newWorker.charges.trim() || 'उचित मूल्य / फ़ीस',
      skills: newWorker.skills ? newWorker.skills.split(',').map((s) => s.trim()) : [categoryLabel, 'स्थानीय सेवा'],
      mapAddress: `${finalVillage}, ${finalDistrict}`,
      reviewsCount: 1,
      userTags: ['नया प्रोफाइल', 'समीक्षाधीन'],
      submittedAt: Date.now(),
      password: newWorker.password.trim() || '123456',
      securityQuestion: newWorker.securityQuestion || '4-अंकों का सीक्रेट पिन / 4-Digit Security PIN',
      securityAnswer: newWorker.securityAnswer.trim() || '1234'
    };

    setWorkers((prev) => [created, ...prev]);

    // Save Custom Location Request to master_locations if 'other' was chosen
    if (addShopState === 'other' || addShopDistrict === 'other' || addShopVillage === 'other') {
      const newLocReq: Omit<MasterLocation, 'id'> = {
        state: finalState,
        district: finalDistrict,
        village: finalVillage,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        requestedByPhone: created.phone
      };

      if (useCloudDb && isFirebaseInitialized) {
        saveMasterLocationToFirestore(newLocReq).then((id) => {
          setMasterLocations((prev) => [{ ...newLocReq, id }, ...prev]);
        });
      } else {
        setMasterLocations((prev) => [{ ...newLocReq, id: 'loc_' + Date.now() }, ...prev]);
      }
    }

    // Save Custom Category Request to master_categories if 'other' was chosen
    if (isOtherCategory && finalCustomCatName) {
      const newCatReq: Omit<MasterCategory, 'id'> = {
        categoryName: finalCustomCatName,
        hindiName: finalCustomCatName,
        status: 'pending_approval',
        createdAt: new Date().toISOString()
      };

      if (useCloudDb && isFirebaseInitialized) {
        saveMasterCategoryToFirestore(newCatReq).then((id) => {
          setMasterCategories((prev) => [{ ...newCatReq, id }, ...prev]);
        });
      } else {
        setMasterCategories((prev) => [{ ...newCatReq, id: 'cat_' + Date.now() }, ...prev]);
      }
    }

    if (useCloudDb && isFirebaseInitialized) {
      try {
        await saveWorkerToFirestore({
          name: created.name,
          shopName: created.shopName,
          hindiName: created.hindiName,
          category: created.category,
          customCategory: created.customCategory,
          phone: created.phone,
          whatsapp: created.whatsapp,
          village: created.village,
          district: created.district,
          state: created.state,
          rating: created.rating,
          jobsDone: created.jobsDone,
          experienceYears: created.experienceYears,
          isVerified: created.isVerified,
          verificationStatus: created.verificationStatus,
          idNumber: created.idNumber,
          documentPhotoUrl: created.documentPhotoUrl,
          avatarUrl: created.avatarUrl,
          charges: created.charges,
          skills: created.skills,
          mapAddress: created.mapAddress,
          password: created.password,
          securityQuestion: created.securityQuestion,
          securityAnswer: created.securityAnswer
        });
        setCloudStatusMsg('✅ नया रजिस्ट्रेशन Cloud Database में जमा (Under Review)!');
      } catch (err) {
        console.warn('Firestore cloud save fallback to LocalStorage:', err);
      }
    }

    setIsAddWorkerOpen(false);
    setSelectedCategory(created.category);
    alert(`🎉 आपकी दुकान/प्रोफाइल दर्ज कर ली गई है!\n\nवर्तमान स्थिति: ⏳ Under Review (समीक्षा में)\n\nधोखाधड़ी रोकने के लिए आपका आधार/आईडी नंबर (${created.idNumber}) एडमिन के पास जमा हो गया है।\nयदि आपने नया गाँव या नई श्रेणी चुनी है, तो एडमिन सत्यापन के बाद वह सभी के लिए लाइव हो जाएगी।`);
    
    // Reset Custom Inputs
    setCustomStateInput('');
    setCustomDistrictInput('');
    setCustomVillageInput('');
    setCustomCategoryInput('');
    
    setNewWorker({
      name: '',
      shopName: '',
      category: 'doctor',
      customCategory: '',
      phone: '',
      whatsapp: '',
      state: selectedState,
      district: selectedDistrict,
      village: selectedVillage,
      idNumber: '',
      documentPhotoUrl: '',
      charges: 'उचित दर / सलाह फ़ीस',
      experienceYears: 5,
      skills: ''
    });
  };

  // Helper function to render workers with AdMob Native Ads every 3 items
  const renderWorkerListWithNativeAds = (
    workerList: (WorkerService & { distanceKm: number; isExactVillage: boolean })[]
  ) => {
    const elements: React.ReactNode[] = [];
    let adCounter = 0;

    workerList.forEach((worker, index) => {
      elements.push(
        <WorkerCard
          key={worker.id}
          worker={worker}
          isFavorite={favorites.includes(worker.id)}
          onToggleFavorite={handleToggleFavorite}
          onVoiceRead={speakText}
          onRateWorker={handleRateWorker}
          onViewMap={(w) => {
            setSelectedShopForMap(w);
            setIsSingleShopMapOpen(true);
          }}
        />
      );

      // Insert Native Ad after every 3 workers
      if ((index + 1) % 3 === 0) {
        const adItem = NATIVE_ADS[adCounter % NATIVE_ADS.length];
        adCounter++;
        elements.push(<NativeAdCard key={`ad_${index}_${adItem.id}`} ad={adItem} />);
      }
    });

    return elements;
  };

  return (
    <div className="h-auto min-h-screen bg-slate-100/80 text-slate-900 font-sans pb-16 flex flex-col items-center overflow-x-hidden w-full relative">
      
      {/* USER FEEDBACK TOAST FOR VOICE GUIDANCE */}
      {voiceToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-4 py-2.5 rounded-full shadow-2xl border-2 border-emerald-400 font-black text-xs sm:text-sm flex items-center gap-2 animate-bounce">
          <span>{voiceToast}</span>
        </div>
      )}

      {/* ==================== TOP HEADER & APP TITLE ==================== */}
      <header className="w-full bg-emerald-700 text-white shadow-lg border-b border-emerald-800 sticky top-0 z-40 max-w-full overflow-x-hidden">
        <div className="max-w-3xl mx-auto px-2 sm:px-4 py-2.5 flex items-center justify-between gap-1.5 overflow-x-hidden">
          
          {/* LOGO WITH SECRET GESTURE TRIGGER (5 Taps within 3s) */}
          <div
            onClick={handleHeaderLogoClick}
            className="flex items-center gap-2 cursor-pointer select-none active:scale-95 transition-transform shrink-0"
            title="ग्राम सेवा - 5 बार टैप करने पर एडमिन लॉगिन खुलेगा"
          >
            <div className="bg-amber-400 p-1.5 sm:p-2 rounded-2xl shadow-inner text-emerald-950 font-black text-xl sm:text-2xl flex items-center justify-center border-2 border-amber-200 shrink-0">
              🚜
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-amber-300 whitespace-nowrap">
              ग्राम सेवा
            </h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-1.5 min-w-0 max-w-full">
            {/* PWA Install App Button */}
            <InstallButton />

            {/* Owner Admin Header Button (Shown if logged in) */}
            {isAdminLoggedIn && (
              <button
                onClick={() => setIsAdminDashboardOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl font-black text-xs shadow-md border border-amber-200 flex items-center gap-1 active:scale-95 transition-all shrink-0 whitespace-nowrap"
                title="मालिक / एडमिन पैनल खोलें"
              >
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span className="hidden sm:inline">👑 एडमिन पैनल</span>
                <span className="sm:hidden">👑 एडमिन</span>
              </button>
            )}

            {/* Smart Share App / Invite Button */}
            <button
              onClick={handleShareApp}
              className="p-1.5 sm:px-2.5 sm:py-1 bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs rounded-xl shadow-md border border-amber-200 flex items-center gap-1.5 transition-all shrink-0 whitespace-nowrap cursor-pointer"
              title="ग्राम सेवा ऐप शेयर करें (Share & Invite App)"
            >
              <Megaphone className="w-4 h-4 text-slate-950 shrink-0" />
              <span className="hidden sm:inline">शेयर करें 📢</span>
              <span className="sm:hidden font-black">शेयर 📢</span>
            </button>

            {/* Firebase Settings GUI Icon */}
            <button
              onClick={() => setIsFirebaseSettingsOpen(true)}
              className="p-1.5 bg-emerald-800 hover:bg-emerald-600 text-amber-300 rounded-xl border border-emerald-600 flex items-center justify-center shadow-xs transition-colors shrink-0"
              title="फायरबेस एपीआई सेटिंग्स (Firebase GUI Settings)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Interactive Voice Assistant Toggle Button */}
            <button
              onClick={handleToggleVoice}
              className={`p-1.5 sm:px-2.5 sm:py-1 rounded-xl flex items-center gap-1 text-xs font-black transition-all shadow-sm shrink-0 whitespace-nowrap active:scale-95 ${
                isVoiceEnabled
                  ? isSpeaking
                    ? 'bg-amber-400 text-slate-950 animate-pulse border-2 border-white'
                    : 'bg-emerald-800/90 hover:bg-emerald-600 text-amber-300 border border-emerald-600'
                  : 'bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-700/80'
              }`}
              title={isVoiceEnabled ? 'आवाज़ बंद करें (Mute Voice Guidance)' : 'आवाज़ चालू करें (Enable Voice Guidance)'}
            >
              {isVoiceEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-red-300" />
              )}
              <span className="hidden sm:inline">
                {isVoiceEnabled ? 'आवाज़ चालू 🔊' : 'आवाज़ बंद 🔇'}
              </span>
            </button>

            {/* Merchant Login / Dashboard Button */}
            {loggedInWorker ? (
              <button
                onClick={() => setIsMerchantDashboardOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl font-black text-xs shadow-md border border-emerald-400 flex items-center gap-1 active:scale-95 transition-all shrink-0 whitespace-nowrap"
                title="मेरी दुकान - व्यापारी डैशबोर्ड"
              >
                <Store className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">🏪 मेरी दुकान</span>
                <span className="sm:hidden">🏪 दुकान</span>
              </button>
            ) : (
              <button
                onClick={() => setIsMerchantLoginOpen(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl font-black text-xs shadow-md border border-blue-400 flex items-center gap-1 active:scale-95 transition-all shrink-0 whitespace-nowrap"
                title="व्यापारी / दुकान लॉगिन"
              >
                <Key className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">🔑 व्यापारी लॉगिन</span>
                <span className="sm:hidden">🔑 लॉगिन</span>
              </button>
            )}

            {/* Add Worker Button */}
            <button
              onClick={() => setIsAddWorkerOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl font-black text-xs shadow-md border border-amber-200 flex items-center gap-1 active:scale-95 transition-all shrink-0 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span className="hidden sm:inline">+ अपना काम / दुकान जोड़ें</span>
              <span className="sm:hidden">➕ जोड़ें</span>
            </button>
          </div>

        </div>
      </header>

      {/* PWA Install Banner for Mobile & Desktop Visitors */}
      <InstallBanner />

      <main className="w-full max-w-3xl px-3 sm:px-4 mt-1 flex-1 flex flex-col gap-4">

        {/* ==================== 1. TOP PAID & ADMOB BANNER SPACE ==================== */}
        <div className="w-full bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border-2 border-dashed border-amber-400 rounded-3xl p-3 sm:p-4 text-center shadow-xs relative overflow-hidden flex flex-col gap-2">
          
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-amber-950 font-extrabold uppercase tracking-wide">
            <span className="bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full text-[10px] font-black border border-amber-300 shadow-2xs flex items-center gap-1">
              <Megaphone className="w-3 h-3 text-slate-950" />
              {activeApprovedAds.length > 0 ? '🔴 स्पॉन्सर्ड विज्ञापन (Paid Banner)' : '📢 लोकल विज्ञापन स्लॉट (Advertise Here)'}
            </span>

            <button
              onClick={() => setIsAdvertiseModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[11px] sm:text-xs px-3 py-1 rounded-xl shadow-sm border border-emerald-800 flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>अपना विज्ञापन चलाएं (₹99/दिन से)</span>
            </button>
          </div>

          {activeApprovedAds.length > 0 ? (
            // LIVE APPROVED PAID BANNER DISPLAY
            <div className="py-2.5 px-3.5 bg-white/95 backdrop-blur-xs rounded-2xl border-2 border-emerald-400 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <img
                  src={activeApprovedAds[0].imageUrl}
                  alt={activeApprovedAds[0].businessName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-300 shrink-0 bg-slate-100 shadow-2xs"
                />
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                      {activeApprovedAds[0].businessName}
                    </h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                      लाइव विज्ञापन
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span>वैधता: {formatRemainingTime(activeApprovedAds[0].expiryTime)}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium truncate">
                    मो: {activeApprovedAds[0].mobile} • {activeApprovedAds[0].durationDays} दिन का प्लान (₹{activeApprovedAds[0].price})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a
                  href={`tel:${activeApprovedAds[0].mobile}`}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-xs text-center flex items-center justify-center gap-1.5 whitespace-nowrap active:scale-95 transition-transform"
                >
                  <Phone className="w-3.5 h-3.5 fill-current" />
                  <span>डायरेक्ट कॉल करें</span>
                </a>
              </div>
            </div>
          ) : (
            // DEFAULT PROMOTIONAL BANNER
            <div className="py-2.5 px-3.5 bg-white/90 backdrop-blur-xs rounded-2xl border border-amber-300 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-2.5 text-left">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-amber-100 rounded-2xl shrink-0">🏪</span>
                <div>
                  <p className="text-xs sm:text-sm font-black text-slate-900">
                    किसान खाद, बीज व ट्रैक्टर वर्कशॉप — आपके ब्लॉक में
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium">
                    यहाँ अपनी दुकान या बिज़नेस का विज्ञापन चलाएं और हजारों ग्रामीणों तक पहुँचें!
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdvertiseModalOpen(true)}
                className="w-full sm:w-auto px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs text-center flex items-center justify-center gap-1 shrink-0 border border-amber-500 active:scale-95 transition-transform"
              >
                <span>अभी विज्ञापन बनाएं</span>
              </button>
            </div>
          )}

        </div>


        {/* ==================== 2. LOCATION SELECTION CARD ==================== */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-emerald-100 flex flex-col gap-3">
          
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-2xl font-black text-base">📍</span>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">1. अपना स्थान चुनें (Select Village)</h2>
                <p className="text-xs text-slate-500 font-medium">राज्य, जिला व अपने गाँव का चयन करें</p>
              </div>
            </div>

            <button
              onClick={() => speakText(`चुना गया राज्य ${selectedState}, जिला ${selectedDistrict}, गाँव ${activeVillageDisplay}`)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full"
              title="स्थान जानकारी सुनें"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* STATE DROPDOWN */}
            <div className="relative">
              <label className="block text-xs font-black text-slate-700 mb-1">राज्य (State)</label>
              <button
                type="button"
                onClick={() => {
                  setIsStateOpen(!isStateOpen);
                  setIsDistrictOpen(false);
                  setIsVillageOpen(false);
                }}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-extrabold text-slate-900 flex items-center justify-between hover:border-emerald-500"
              >
                <span className="truncate">{selectedState}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              </button>

              {isStateOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-2xl shadow-xl z-50 p-2 max-h-56 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="राज्य खोजें..."
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold mb-2 focus:outline-none"
                  />
                  {filteredStates.map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        setSelectedState(st);
                        setIsStateOpen(false);
                        setStateSearch('');
                        const dists = getDistrictsForState(st);
                        if (dists && dists.length > 0) {
                          setSelectedDistrict(dists[0]);
                          const vills = getVillagesForDistrict(st, dists[0]);
                          if (vills && vills.length > 0) {
                            setSelectedVillage(vills[0]);
                          }
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                        selectedState === st ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* DISTRICT DROPDOWN */}
            <div className="relative">
              <label className="block text-xs font-black text-slate-700 mb-1">जिला (District)</label>
              <button
                type="button"
                onClick={() => {
                  setIsDistrictOpen(!isDistrictOpen);
                  setIsStateOpen(false);
                  setIsVillageOpen(false);
                }}
                className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-extrabold text-slate-900 flex items-center justify-between hover:border-emerald-500"
              >
                <span className="truncate">{selectedDistrict}</span>
                <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
              </button>

              {isDistrictOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-2xl shadow-xl z-50 p-2 max-h-56 overflow-y-auto">
                  <input
                    type="text"
                    placeholder="जिला खोजें..."
                    value={districtSearch}
                    onChange={(e) => setDistrictSearch(e.target.value)}
                    className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold mb-2 focus:outline-none"
                  />
                  {filteredDistricts.map((d) => (
                    <button
                      key={d}
                      onClick={() => {
                        setSelectedDistrict(d);
                        setIsDistrictOpen(false);
                        setDistrictSearch('');
                        const vills = getVillagesForDistrict(selectedState, d);
                        if (vills && vills.length > 0) {
                          setSelectedVillage(vills[0]);
                        }
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors ${
                        selectedDistrict === d ? 'bg-emerald-100 text-emerald-900 font-black' : 'hover:bg-slate-100'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* VILLAGE SELECTOR OR MANUAL INPUT */}
            <div className="relative">
              <label className="block text-xs font-black text-slate-700 mb-1">
                गाँव / कस्बा (Village)
              </label>

              {!isManualVillage ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVillageOpen(!isVillageOpen);
                      setIsStateOpen(false);
                      setIsDistrictOpen(false);
                    }}
                    className="w-full p-2.5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl text-xs font-black text-emerald-950 flex items-center justify-between hover:border-emerald-600 shadow-2xs"
                  >
                    <span className="truncate">{selectedVillage}</span>
                    <ChevronDown className="w-4 h-4 text-emerald-700 shrink-0" />
                  </button>

                  {isVillageOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border-2 border-slate-300 rounded-2xl shadow-2xl z-50 p-2 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="गाँव खोजें (उदा: Kalchina / कलछीना)..."
                        value={villageSearch}
                        onChange={(e) => setVillageSearch(e.target.value)}
                        className="w-full p-2 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold mb-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      {filteredVillages.length === 0 ? (
                        <div className="p-3 text-center">
                          <p className="text-xs text-slate-500 mb-2">गाँव लिस्ट में नहीं मिला?</p>
                          <button
                            onClick={() => {
                              setIsManualVillage(true);
                              setIsVillageOpen(false);
                            }}
                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-2xs"
                          >
                            खुद टाइप करें (Type Manually)
                          </button>
                        </div>
                      ) : (
                        filteredVillages.map((v) => (
                          <button
                            key={v}
                            onClick={() => {
                              setSelectedVillage(v);
                              setIsVillageOpen(false);
                              setVillageSearch('');
                            }}
                            className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center justify-between ${
                              selectedVillage === v ? 'bg-emerald-100 text-emerald-950 font-black' : 'hover:bg-slate-100'
                            }`}
                          >
                            <span>{v}</span>
                            {selectedVillage === v && <Check className="w-4 h-4 text-emerald-700" />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="गाँव का नाम लिखें..."
                    value={manualVillageName}
                    onChange={(e) => setManualVillageName(e.target.value)}
                    className="w-full p-2.5 bg-amber-50 border-2 border-amber-400 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none"
                  />
                  <button
                    onClick={() => setIsManualVillage(false)}
                    className="p-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-300"
                    title="लिस्ट से चुनें"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                checked={isManualVillage}
                onChange={(e) => setIsManualVillage(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300"
              />
              <span>गाव लिस्ट में नहीं मिला? (Mera Gaon List me nahi hai)</span>
            </label>

            <span className="text-[11px] text-slate-500 font-medium">
              घोसी/गाजियाबाद ब्लॉक समेत पूरे देश के गाँव शामिल
            </span>
          </div>

          {/* NEARBY MAP EXPLORER BUTTON */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleGetCustomerLocation}
              disabled={isDetectingGps}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-700 hover:to-teal-900 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md border border-emerald-800 flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <MapPin className="w-4 h-4 text-amber-300 animate-bounce shrink-0" />
              <span>
                {isDetectingGps
                  ? '📍 GPS लोकेशन खोजी जा रही है...'
                  : '🗺️ नक्शे / मैप पर मेरे पास की सभी दुकानें देखें (Explore Nearby Shops on Map)'}
              </span>
            </button>
          </div>

        </section>


        {/* ==================== 3. CATEGORY SELECTION GRID WITH INSTANT SEARCH & TABS ==================== */}
        <section className="flex flex-col gap-3 bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-emerald-100">
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-1.5">
                <span>2. अपना काम चुनें (Choose Service)</span>
              </h2>

              <button
                onClick={() => speakText("अपनी पसंद का काम या दुकान चुनें, जैसे हलवाई, नर्सरी, टेंट हाउस, इलेक्ट्रीशियन या ऑटो चालक।")}
                className="p-1.5 bg-slate-100 text-slate-700 rounded-full border border-slate-200 hover:bg-slate-200"
                title="श्रेणी सुनें"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            {/* Sticky/Prominent Real-Time Search Bar */}
            <div className="relative w-full">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0 pointer-events-none" />
              <input
                type="text"
                placeholder="🔍 काम या सेवा खोजें (जैसे: हलवाई, नर्सरी, टेंट हाउस)..."
                value={categorySearchQuery}
                onChange={(e) => setCategorySearchQuery(e.target.value)}
                className="w-full pl-10 pr-28 py-3 bg-slate-50 border-2 border-emerald-300 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 shadow-2xs transition-all"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {categorySearchQuery && (
                  <button
                    type="button"
                    onClick={() => setCategorySearchQuery('')}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                    title="साफ़ करें (Clear)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-black transition-all shadow-2xs active:scale-95 ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-amber-300 border border-emerald-800'
                  }`}
                  title={isListening ? "सुन रहे हैं... (Listening...)" : "बोलकर खोजें (Voice Search)"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4 text-white animate-bounce shrink-0" />
                      <span className="hidden sm:inline">सुन रहे हैं...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-amber-300 shrink-0" />
                      <span className="hidden sm:inline">बोलकर</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              {[
                { id: 'all', label: 'सब (All)' },
                { id: 'favorites', label: `⭐ मेरी पसंद ${favorites.length > 0 ? `(${favorites.length})` : '(0)'}` },
                { id: 'agro', label: '🌾 खेती व नर्सरी' },
                { id: 'event', label: '🎉 शादी व इवेंट' },
                { id: 'construction', label: '🛠️ कारीगर व मिस्त्री' },
                { id: 'retail', label: '🛒 दुकानें व व्यापार' },
                { id: 'service_transport', label: '🚗 ट्रांसपोर्ट व चालक' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryGroupFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shrink-0 ${
                    categoryGroupFilter === tab.id
                      ? tab.id === 'favorites'
                        ? 'bg-amber-400 text-slate-950 shadow-xs scale-98 border border-amber-500 ring-2 ring-amber-300'
                        : 'bg-emerald-700 text-white shadow-xs scale-98'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* CATEGORY GRID OR ZERO RESULTS FALLBACK */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-1">
              {filteredCategories.map((cat) => {
                const IconComp = cat.icon;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      speakText(`${cat.hindiName}, ${cat.voiceText}`);
                    }}
                    className={`p-3 sm:p-3.5 rounded-3xl border-3 flex flex-col items-center justify-center text-center transition-all duration-200 relative overflow-hidden shadow-sm ${
                      isSelected
                        ? 'bg-emerald-700 border-emerald-900 text-white ring-4 ring-emerald-300 shadow-md scale-[1.02]'
                        : `${cat.bgColor} ${cat.borderColor} text-slate-900 hover:shadow-md`
                    }`}
                  >
                    <div
                      className={`p-2.5 sm:p-3 rounded-2xl mb-1.5 flex items-center justify-center transition-transform ${
                        isSelected ? 'bg-amber-400 text-slate-950 shadow-inner' : cat.iconColor
                      }`}
                    >
                      <IconComp className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
                    </div>

                    <span
                      className={`text-xs sm:text-sm font-black leading-snug truncate max-w-full ${
                        isSelected ? 'text-amber-300' : cat.textColor
                      }`}
                    >
                      {cat.hindiName}
                    </span>

                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 truncate max-w-full ${
                        isSelected ? 'text-emerald-100' : 'text-slate-600'
                      }`}
                    >
                      {cat.englishName}
                    </span>

                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* ZERO RESULTS FALLBACK CARD */
            <div className="p-6 bg-amber-50 rounded-3xl border-2 border-amber-300 text-center flex flex-col items-center justify-center gap-3 mt-2 shadow-2xs">
              <div className="w-12 h-12 bg-amber-100 text-amber-900 rounded-full flex items-center justify-center text-2xl font-black shadow-inner">
                🔍
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1">
                  यह काम अभी लिस्ट में नहीं है
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
                  यदि आप "{categorySearchQuery}" का काम करते हैं या दुकान चलाते हैं, तो अपनी दुकान/सर्विस ग्राम सेवा पर नि:शुल्क जोड़ें!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAddShopCategory('other');
                  setCustomCategoryInput(categorySearchQuery);
                  setIsAddWorkerOpen(true);
                }}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md border border-emerald-800 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>+ अपना नया काम/दुकान जोड़ें (Add Custom Shop)</span>
              </button>
            </div>
          )}
        </section>


        {/* ==================== 4. PROXIMITY & DISTANCE SORTED WORKERS DIRECTORY ==================== */}
        <section className="bg-white rounded-3xl p-4 sm:p-5 shadow-md border-2 border-slate-200 flex flex-col gap-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{categoryGroupFilter === 'favorites' ? '⭐' : '🏪'}</span>
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  {categoryGroupFilter === 'favorites'
                    ? 'मेरी पसंद की दुकानें व सेवाएं (Favorites)'
                    : `${activeCategoryObj?.hindiName || 'सेवा'} - ${activeVillageDisplay}`}
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {categoryGroupFilter === 'favorites'
                  ? `आपकी पसंद में सहेजी गई कुल ${sortedWorkersWithDistance.length} दुकानें व सेवाएं`
                  : `सबसे पहले आपके गाँव के काम व दुकानें (0 km), फिर पास के गाँव`}
              </p>
            </div>

            <button
              onClick={() => setIsAddWorkerOpen(true)}
              className="self-start sm:self-auto px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-sm border border-amber-300 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ अपना काम / दुकान जोड़ें</span>
            </button>
          </div>

          {sortedWorkersWithDistance.length === 0 ? (
            <div className="py-8 px-4 text-center bg-amber-50/70 rounded-2xl border-2 border-dashed border-amber-300 flex flex-col items-center gap-3 shadow-2xs">
              <span className="text-4xl">⭐</span>
              <div>
                <p className="text-base font-bold text-slate-900">
                  {categoryGroupFilter === 'favorites'
                    ? 'आपने अभी तक कोई दुकान या काम अपनी पसंद (Favorites) में नहीं जोड़ा है।'
                    : `${activeCategoryObj?.hindiName} के लिए इस क्षेत्र में कोई दुकान या सेवा पंजीकृत नहीं है।`}
                </p>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  {categoryGroupFilter === 'favorites'
                    ? 'किसी भी दुकान के कार्ड पर ⭐ स्टार बटन दबाकर उसे अपनी पसंद सूची में सहेजें।'
                    : 'क्या आप इस काम / दुकान से जुड़े हैं? अभी जोड़ें!'}
                </p>
              </div>
              <button
                onClick={() => {
                  if (categoryGroupFilter === 'favorites') {
                    setCategoryGroupFilter('all');
                  } else {
                    setIsAddWorkerOpen(true);
                  }
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm"
              >
                {categoryGroupFilter === 'favorites' ? 'सभी दुकानें देखें (View All Shops)' : '+ अपना काम / दुकान जोड़ें'}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              
              {/* --- GROUP 1: EXACT VILLAGE WORKERS (0 km) --- */}
              {exactVillageWorkers.length > 0 && (
                <div className="flex flex-col gap-3">
                  <div className="bg-emerald-100 border-l-4 border-emerald-600 p-2.5 rounded-r-2xl flex items-center justify-between text-emerald-950 shadow-2xs">
                    <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                      🎯 आपके गाँव में उपलब्ध सेवा व दुकानें ({activeVillageDisplay} - 0 km)
                    </span>
                    <span className="bg-emerald-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {exactVillageWorkers.length} सेवा / दुकानें उपलब्ध
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {renderWorkerListWithNativeAds(exactVillageWorkers)}
                  </div>
                </div>
              )}

              {/* --- GROUP 2: NEARBY SURROUNDING VILLAGES (2-5 km) --- */}
              {nearbyVillageWorkers.length > 0 && (
                <div className="flex flex-col gap-3 pt-2">
                  <div className="bg-amber-100/80 border-l-4 border-amber-500 p-2.5 rounded-r-2xl flex items-center justify-between text-amber-950 shadow-2xs">
                    <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                      📍 नजदीकी आसपास के गाँवों से सेवा व दुकानें (Near 2 - 5 km)
                    </span>
                    <span className="bg-amber-500 text-slate-950 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {nearbyVillageWorkers.length} सेवा / दुकानें
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5">
                    {renderWorkerListWithNativeAds(nearbyVillageWorkers)}
                  </div>
                </div>
              )}

            </div>
          )}

        </section>


        {/* ==================== BOTTOM ADMOB PLACEHOLDER BANNER ==================== */}
        <div className="w-full bg-gradient-to-r from-emerald-100 via-teal-50 to-green-100 border-2 border-dashed border-emerald-400 rounded-2xl p-3 text-center shadow-xs">
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-emerald-900 font-bold uppercase tracking-wider mb-1">
            <span className="bg-emerald-300 text-emerald-950 px-2 py-0.5 rounded-md text-[10px] font-black">
              विज्ञापन / ADMOB
            </span>
            <span className="text-emerald-800">AdMob Bottom Banner Space</span>
          </div>
          <div className="py-2 px-3 bg-white/90 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="text-xs font-bold text-slate-900">सरकारी पीएम सूर्य घर मुफ्त बिजली योजना</p>
                <p className="text-[11px] text-slate-600">300 यूनिट मुफ्त बिजली के लिए रूफटॉप सोलर लगवाएं</p>
              </div>
            </div>
            <a
              href="https://pmsuryaghar.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shrink-0"
            >
              आवेदन करें (Apply)
            </a>
          </div>
        </div>

      </main>


      {/* ==================== MODAL 1: ADD NEW WORKER & BUSINESS REGISTRATION MODAL ==================== */}
      {isAddWorkerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 w-full max-w-lg border-2 border-emerald-500 shadow-2xl my-auto flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
                  <UserCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    नया काम / दुकान रजिस्ट्रेशन
                  </h3>
                  <p className="text-xs text-emerald-800 font-bold">
                    🛡️ धोखाधड़ी से सुरक्षा हेतु दस्तावेज सत्यापन आवश्यक
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddWorkerOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FRAUD PREVENTION WARNING BANNER */}
            <div className="bg-amber-50 border-2 border-amber-300 p-2.5 rounded-2xl text-[11px] text-amber-950 font-bold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
              <span>
                <b>सुरक्षा चेतावनी:</b> फर्जी प्रोफाइल व धोखाधड़ी रोकने के लिए आपका आधार/आईडी एडमिन के पास समीक्षा (Under Review) के लिए जमा होगा। सत्यापन के बाद 'Aadhaar Verified' बैज मिलेगा।
              </span>
            </div>

            <form onSubmit={handleAddWorkerSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    1. मालिक / प्रोपराइटर का नाम (Owner Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: डॉ. रामपाल सिंह / चौधरी साहब"
                    value={newWorker.name}
                    onChange={(e) => setNewWorker({ ...newWorker, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    2. दुकान / क्लिनिक / फार्म का नाम (Shop Name)
                  </label>
                  <input
                    type="text"
                    placeholder="उदा: चौधरी खाद व बीज भंडार / गुप्ता क्लिनिक"
                    value={newWorker.shopName}
                    onChange={(e) => setNewWorker({ ...newWorker, shopName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* CATEGORY SELECTOR WITH OTHER OPTION */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    3. व्यापार / सेवा श्रेणी (Category) *
                  </label>
                  <select
                    value={addShopCategory}
                    onChange={(e) => {
                      setAddShopCategory(e.target.value);
                      setNewWorker({ ...newWorker, category: e.target.value });
                    }}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {allCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.hindiName} ({c.englishName})
                      </option>
                    ))}
                    <option value="other">➕ अन्य श्रेणी (Other Category)...</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    4. मोबाइल नंबर (Call / WhatsApp) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-अंकों का मोबाइल नंबर"
                    value={newWorker.phone}
                    onChange={(e) => setNewWorker({ ...newWorker, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Custom Category Input field if 'other' or 'custom_business' selected */}
              {(addShopCategory === 'other' || addShopCategory === 'custom_business') && (
                <div className="bg-emerald-50 border-2 border-emerald-300 p-2.5 rounded-2xl">
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    ✏️ नई व्यावसायिक श्रेणी लिखें (New Category Name) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: सोलर पंप रिपेयरिंग, जन सेवा केंद्र, पशु आहार स्टोर"
                    value={customCategoryInput}
                    onChange={(e) => {
                      setCustomCategoryInput(e.target.value);
                      setNewWorker({ ...newWorker, customCategory: e.target.value });
                    }}
                    className="w-full p-2.5 bg-white border-2 border-emerald-400 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-emerald-800 font-semibold mt-1">
                    💡 आपकी दर्ज की गई नई श्रेणी समीक्षा (Under Review) के बाद सार्वजनिक श्रेणी लिस्ट में जोड़ दी जाएगी।
                  </p>
                </div>
              )}

              {/* LOCATION SELECTORS (State, District, Village) WITH 'OTHER' OPTIONS */}
              <div className="bg-slate-50 border-2 border-slate-200 p-3 rounded-2xl flex flex-col gap-3">
                <h4 className="text-xs font-black text-slate-900 flex items-center gap-1">
                  <span>📍 दुकान/व्यवसाय का सटीक स्थान (Location Details)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* STATE */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">राज्य (State)</label>
                    <select
                      value={addShopState}
                      onChange={(e) => {
                        const newSt = e.target.value;
                        setAddShopState(newSt);
                        if (newSt !== 'other') {
                          const dists = getDistrictsForState(newSt);
                          if (dists && dists.length > 0) {
                            setAddShopDistrict(dists[0]);
                            const vills = getVillagesForDistrict(newSt, dists[0]);
                            if (vills && vills.length > 0) {
                              setAddShopVillage(vills[0]);
                            }
                          }
                        }
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {allStatesList.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                      <option value="other">➕ अन्य राज्य (Other State)...</option>
                    </select>
                    {addShopState === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="नया राज्य का नाम..."
                        value={customStateInput}
                        onChange={(e) => setCustomStateInput(e.target.value)}
                        className="w-full p-2 mt-1 bg-amber-50 border border-amber-400 rounded-xl text-xs font-bold text-slate-900"
                      />
                    )}
                  </div>

                  {/* DISTRICT */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">जिला (District)</label>
                    <select
                      value={addShopDistrict}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setAddShopDistrict(newDist);
                        if (newDist !== 'other') {
                          const vills = getVillagesForDistrict(addShopState, newDist);
                          if (vills && vills.length > 0) {
                            setAddShopVillage(vills[0]);
                          }
                        }
                      }}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {addShopDistricts.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                      <option value="other">➕ अन्य जिला (Other District)...</option>
                    </select>
                    {addShopDistrict === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="नया जिला का नाम..."
                        value={customDistrictInput}
                        onChange={(e) => setCustomDistrictInput(e.target.value)}
                        className="w-full p-2 mt-1 bg-amber-50 border border-amber-400 rounded-xl text-xs font-bold text-slate-900"
                      />
                    )}
                  </div>

                  {/* VILLAGE */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">गाँव / कस्बा (Village)</label>
                    <select
                      value={addShopVillage}
                      onChange={(e) => setAddShopVillage(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    >
                      {addShopVillages.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                      <option value="other">➕ अन्य गाँव (Other Village)...</option>
                    </select>
                    {addShopVillage === 'other' && (
                      <input
                        type="text"
                        required
                        placeholder="नया गाँव का नाम..."
                        value={customVillageInput}
                        onChange={(e) => setCustomVillageInput(e.target.value)}
                        className="w-full p-2 mt-1 bg-amber-50 border border-amber-400 rounded-xl text-xs font-bold text-slate-900"
                      />
                    )}
                  </div>
                </div>

                {/* INTERACTIVE LEAFLET MAP PICKER BUTTON FOR MERCHANT */}
                <div className="pt-2 border-t border-slate-200 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-slate-800">
                    <span>🗺️ दुकान की सटीक GPS लोकेशन (Leaflet Map Pin)</span>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                      {newWorker.lat ? `Lat: ${newWorker.lat.toFixed(4)}, Lng: ${newWorker.lng?.toFixed(4)}` : 'लोकेशन सेट नहीं'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerLat(newWorker.lat || 28.7512);
                      setPickerLng(newWorker.lng || 77.4215);
                      setIsMapPickerOpen(true);
                    }}
                    className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs border border-amber-500 flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                  >
                    <MapPin className="w-4 h-4 text-slate-950" />
                    <span>📍 नक्शे पर दुकान पिन करें (Pick Shop Location on Map)</span>
                  </button>
                </div>
              </div>

              {/* FRAUD PREVENTION: AADHAAR / GOVT ID NUMBER */}
              <div className="bg-blue-50/80 border-2 border-blue-300 p-3 rounded-2xl flex flex-col gap-2">
                <label className="block text-xs font-black text-blue-950 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>5. आधार / सरकारी आईडी नंबर (Aadhaar / Govt ID No.) *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा: 4910-2819-4019 (12-Digit Aadhaar No)"
                  value={newWorker.idNumber}
                  onChange={(e) => setNewWorker({ ...newWorker, idNumber: e.target.value })}
                  className="w-full p-2.5 bg-white border-2 border-blue-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-blue-800 font-medium">
                  * यह नंबर केवल एडमिन को सत्यापन के लिए दिखेगा, आम यूज़र्स को गोपनीय रहेगा।
                </p>
              </div>

              {/* DOCUMENT / SHOP BOARD PHOTO URL */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                  <FileText className="w-4 h-4 text-emerald-700" />
                  <span>6. दुकान का बोर्ड या फोटो URL (Shop Board Photo / ID Image)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... (या खाली छोड़ें)"
                  value={newWorker.documentPhotoUrl}
                  onChange={(e) => setNewWorker({ ...newWorker, documentPhotoUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  7. गाँव / कस्बे का नाम (Village / Location)
                </label>
                <input
                  type="text"
                  placeholder="उदा: कलछीना / Kalchina"
                  value={newWorker.village}
                  onChange={(e) => setNewWorker({ ...newWorker, village: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    8. रेट / फ़ीस (Charges / Fees)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹200 सलाह फ़ीस / ₹500 दिन"
                    value={newWorker.charges}
                    onChange={(e) => setNewWorker({ ...newWorker, charges: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    9. अनुभव (Years Experience)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    placeholder="e.g. 5 साल"
                    value={newWorker.experienceYears}
                    onChange={(e) => setNewWorker({ ...newWorker, experienceYears: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  10. उपलब्ध सामान / सेवा सूची (Skills/Products - कॉमा लगाएं)
                </label>
                <input
                  type="text"
                  placeholder="e.g. खाद, यूरिया, डीएपी, बीज, कीटनाशक"
                  value={newWorker.skills}
                  onChange={(e) => setNewWorker({ ...newWorker, skills: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-slate-50 border-2 border-emerald-300 p-3.5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                  <Lock className="w-4 h-4 text-emerald-700" />
                  <span>11. दुकान का लॉगिन पासवर्ड बनाएं (Create Password) *</span>
                </div>
                <input
                  type="password"
                  required
                  placeholder="अपना पासवर्ड बनाएं (उदा: 123456 या मनपसंद पासवर्ड)"
                  value={newWorker.password}
                  onChange={(e) => setNewWorker({ ...newWorker, password: e.target.value })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-amber-50/80 border-2 border-amber-300 p-3.5 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-950">
                  <HelpCircle className="w-4 h-4 text-amber-700" />
                  <span>12. सुरक्षा प्रश्न चुनें (Security Question for Password Reset) *</span>
                </div>
                <select
                  value={newWorker.securityQuestion}
                  onChange={(e) => setNewWorker({ ...newWorker, securityQuestion: e.target.value })}
                  className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="4-अंकों का सीक्रेट पिन / 4-Digit Security PIN">4-अंकों का सीक्रेट पिन / 4-Digit Security PIN (अनुशंसित)</option>
                  <option value="आपकी माता जी का नाम / Mother's Name">आपकी माता जी का नाम / Mother's Name</option>
                  <option value="आपका पसंदीदा गाँव या शहर / Birthplace or City">आपका पसंदीदा गाँव या शहर / Birthplace or City</option>
                  <option value="आपकी पहली बाइक या गाड़ी / First Vehicle">आपकी पहली बाइक या गाड़ी / First Vehicle or Bike</option>
                </select>

                <div>
                  <label className="block text-[11px] font-black text-amber-900 mb-1">
                    सुरक्षा प्रश्न का उत्तर / सीक्रेट PIN (Security Answer / Secret PIN) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा: 4321 या सीक्रेट उत्तर दर्ज करें"
                    value={newWorker.securityAnswer}
                    onChange={(e) => setNewWorker({ ...newWorker, securityAnswer: e.target.value })}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-800 font-semibold mt-1">
                    💡 पासवर्ड भूलने की स्थिति में इसी PIN या उत्तर से नया पासवर्ड बिना ओटीपी के तुरंत रीसेट कर सकेंगे।
                  </p>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWorkerOpen(false)}
                  className="w-1/3 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md border border-emerald-700 flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>रजिस्ट्रेशन जमा करें (Submit Request)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* ==================== MODAL 2: EASY FIREBASE CONFIG GUI SETTINGS ==================== */}
      {isFirebaseSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 w-full max-w-lg border-2 border-amber-400 shadow-2xl my-auto flex flex-col gap-4">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
                  <Settings className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    🔥 Firebase API Keys GUI
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    अपने प्रोजेक्ट की फायरबेस की (Credentials) यहाँ भरें
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsFirebaseSettingsOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFirebaseSettings} className="flex flex-col gap-3">
              <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-2xl text-[11px] text-amber-950 font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  बिना कोड बदले अपना Firestore Database तुरंत कनेक्ट करें। एपीआई की डालने के बाद "Save & Connect" दबाएं।
                </span>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  1. apiKey
                </label>
                <input
                  type="text"
                  required
                  value={firebaseForm.apiKey}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, apiKey: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    2. authDomain
                  </label>
                  <input
                    type="text"
                    required
                    value={firebaseForm.authDomain}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, authDomain: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    3. projectId
                  </label>
                  <input
                    type="text"
                    required
                    value={firebaseForm.projectId}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, projectId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    4. storageBucket
                  </label>
                  <input
                    type="text"
                    required
                    value={firebaseForm.storageBucket}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, storageBucket: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    5. messagingSenderId
                  </label>
                  <input
                    type="text"
                    required
                    value={firebaseForm.messagingSenderId}
                    onChange={(e) => setFirebaseForm({ ...firebaseForm, messagingSenderId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  6. appId
                </label>
                <input
                  type="text"
                  required
                  value={firebaseForm.appId}
                  onChange={(e) => setFirebaseForm({ ...firebaseForm, appId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetFirebaseSettings}
                  className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
                >
                  रीसेट करें (Reset)
                </button>

                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md border border-amber-500 flex items-center gap-1.5"
                >
                  <Cloud className="w-4 h-4 stroke-[2.5]" />
                  <span>Save & Connect Cloud DB</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================== MODAL 3: ULTRA-SECURE 3-LAYER ADMIN LOGIN MODAL ==================== */}
      {isAdminLoginOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-md border-3 border-amber-400 shadow-2xl my-auto flex flex-col gap-4 relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black shadow-sm">
                  👑
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    मालिक / एडमिन सुरक्षा लॉगिन
                  </h3>
                  <p className="text-xs text-amber-800 font-bold">3-Layer Multi-Factor Security Portal</p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminLoginOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {adminErrorMessage && (
              <div className="bg-red-100 border-2 border-red-400 text-red-900 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
                <span>{adminErrorMessage}</span>
              </div>
            )}

            {/* LAYER 1: CREDENTIALS FORM */}
            {adminLoginStep === 1 && (
              <form onSubmit={handleAdminLayer1Submit} className="flex flex-col gap-3.5">
                <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl text-xs text-slate-700 font-bold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Layer 1: दर्ज करें अपना मालिक क्रेडेंशियल</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    मालिक ईमेल आईडी (Admin Email) *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="एडमिन ईमेल लिखें..."
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      className="w-full p-2.5 pl-9 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    पासवर्ड (Admin Password) *
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      placeholder="पासवर्ड लिखें..."
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      className="w-full p-2.5 pl-9 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                    <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-2xl shadow-md border border-amber-500 flex items-center justify-center gap-1.5 active:scale-98 transition-transform mt-1"
                >
                  <span>आगे बढ़ें (Verify Credentials)</span>
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </form>
            )}

            {/* LAYER 2: EMAIL OTP VERIFICATION FORM */}
            {adminLoginStep === 2 && (
              <form onSubmit={handleAdminLayer2Submit} className="flex flex-col gap-3.5">
                <div className="bg-amber-100 border-2 border-amber-400 p-3 rounded-2xl text-amber-950 text-xs font-bold flex flex-col gap-1.5">
                  <span className="flex items-center gap-1 font-black text-amber-900">
                    <Send className="w-4 h-4 text-amber-700" /> Layer 2: ईमेल OTP सत्यापन
                  </span>
                  <span className="text-[11px] text-slate-800">
                    Simulated Email sent to: <b>{adminEmailInput}</b>
                  </span>
                  <div className="bg-white p-2 rounded-xl border border-amber-300 text-center font-black text-emerald-900 text-sm">
                    सुरक्षा कोड (OTP): <span className="tracking-widest text-base font-mono bg-amber-200 px-2 py-0.5 rounded-md">{expectedOtp}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-black text-slate-800">
                      6-अंकी OTP कोड दर्ज करें *
                    </label>
                    <span className="text-xs font-bold text-red-600 font-mono">
                      ⏱️ {otpTimer}s
                    </span>
                  </div>

                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 705545"
                    value={adminOtpInput}
                    onChange={(e) => setAdminOtpInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-center text-base font-black tracking-widest text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAdminLoginStep(1);
                      setAdminErrorMessage(null);
                    }}
                    className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl"
                  >
                    पीछे जाएँ
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md border border-emerald-700 flex items-center justify-center gap-1"
                  >
                    <Award className="w-4 h-4" />
                    <span>सत्यापित व लॉगिन करें</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
      {isAdminDashboardOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-6 w-full max-w-3xl border-3 border-amber-400 shadow-2xl my-auto flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black text-xl shadow-md">
                  👑
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-black text-slate-900">
                    ग्राम सेवा — मालिक / एडमिन डैशबोर्ड
                  </h3>
                  <p className="text-xs text-emerald-800 font-bold">
                    सुरक्षित सुपर एडमिन कंट्रोल सेंटर
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdminDashboardOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 gap-1 sm:gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setAdminTab('pending_verifications')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all relative ${
                  adminTab === 'pending_verifications'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border border-amber-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-slate-900" />
                <span>लंबित सत्यापन</span>
                {pendingWorkers.length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    {pendingWorkers.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('workers')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all ${
                  adminTab === 'workers'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border border-amber-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Users className="w-4 h-4 text-slate-900" />
                <span>सभी लिस्टिंग ({workers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('content_requests')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all relative ${
                  adminTab === 'content_requests'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border border-amber-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Plus className="w-4 h-4 text-slate-900 stroke-[3]" />
                <span>नई सामग्री ({masterLocations.filter((l) => l.status === 'pending_approval').length + masterCategories.filter((c) => c.status === 'pending_approval').length})</span>
                {(masterLocations.filter((l) => l.status === 'pending_approval').length + masterCategories.filter((c) => c.status === 'pending_approval').length) > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-bounce">
                    {masterLocations.filter((l) => l.status === 'pending_approval').length + masterCategories.filter((c) => c.status === 'pending_approval').length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('banner_ads')}
                className={`flex-1 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all relative ${
                  adminTab === 'banner_ads'
                    ? 'bg-amber-400 text-slate-950 shadow-sm border border-amber-500'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Megaphone className="w-4 h-4 text-slate-900" />
                <span>बैनर विज्ञापन</span>
                {bannerAdRequests.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {bannerAdRequests.filter((r) => r.status === 'pending').length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 0: PENDING VERIFICATION REQUESTS */}
            {adminTab === 'pending_verifications' && (
              <div className="flex flex-col gap-3">
                <div className="bg-amber-50 border-2 border-amber-300 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-amber-950">
                        लंबित आईडी व दुकान सत्यापन (Fraud Prevention Queue)
                      </h4>
                      <p className="text-[11px] text-amber-800 font-semibold">
                        केवल आधार/दस्तावेज जांचने के बाद ही 'Aadhaar Verified' बैज दें।
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-1 rounded-xl shrink-0">
                    {pendingWorkers.length} लंबित
                  </span>
                </div>

                {pendingWorkers.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300">
                    <p className="text-sm font-bold text-slate-700">🎉 कोई भी सत्यापन अनुरोध लंबित नहीं है!</p>
                    <p className="text-xs text-slate-500 mt-1">सभी पंजीकृत व्यवसाय व दुकानें सत्यापित की जा चुकी हैं।</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                    {pendingWorkers.map((worker) => (
                      <div
                        key={worker.id}
                        className="bg-slate-50 border-2 border-amber-300 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={worker.documentPhotoUrl || worker.avatarUrl}
                            alt={worker.name}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-slate-300 shrink-0 bg-white"
                          />
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-black text-slate-900">
                                {worker.shopName ? `${worker.shopName} (${worker.name})` : worker.name}
                              </h4>
                              <span className="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md">
                                ⏳ Under Review
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-bold">
                              श्रेणी: {CATEGORIES.find(c => c.id === worker.category)?.hindiName || worker.customCategory || 'स्थानीय व्यापार'}
                            </p>
                            <p className="text-xs text-slate-600">
                              📍 गाँव: <b>{worker.village}</b> • 📞 फोन: <b>{worker.phone}</b>
                            </p>
                            <p className="text-xs text-blue-900 font-mono font-black bg-blue-100/80 px-2 py-0.5 rounded-md self-start border border-blue-300">
                              🆔 आधार/आईडी: {worker.idNumber || '12-अंक आईडी दर्ज'}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleAdminUpdateStatus(worker.id, 'approved')}
                            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm border border-emerald-700 flex items-center gap-1 active:scale-95 transition-transform"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>स्वीकृत (Approve)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdminUpdateStatus(worker.id, 'rejected')}
                            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-sm border border-red-700 flex items-center gap-1 active:scale-95 transition-transform"
                          >
                            <X className="w-4 h-4" />
                            <span>अस्वीकृत (Reject)</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 1: WORKERS MANAGEMENT */}
            {adminTab === 'workers' && (
              <div className="flex flex-col gap-3">
                {/* Admin Key Performance Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                    <span className="block text-xl font-black text-emerald-900">{workers.length}</span>
                    <span className="text-[11px] text-emerald-800 font-bold">कुल काम व दुकानें</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-2xl text-center">
                    <span className="block text-xl font-black text-blue-900">
                      {workers.filter((w) => w.isVerified).length}
                    </span>
                    <span className="text-[11px] text-blue-800 font-bold">सत्यापित (Verified)</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                    <span className="block text-xl font-black text-amber-900">
                      {Array.from(new Set(workers.map((w) => w.village))).length}
                    </span>
                    <span className="text-[11px] text-amber-800 font-bold">कवर किए गाँव</span>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-3 rounded-2xl text-center">
                    <span className="block text-xl font-black text-purple-900">4.8 ★</span>
                    <span className="text-[11px] text-purple-800 font-bold">औसत रेटिंग</span>
                  </div>
                </div>

                {/* Search Filter Inside Admin Panel */}
                <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-2xl border border-slate-300">
                  <Search className="w-4 h-4 text-slate-500 ml-1 shrink-0" />
                  <input
                    type="text"
                    placeholder="व्यापारी का नाम, दुकान का नाम, मोबाइल नंबर या गाँव से खोजें..."
                    value={adminWorkerSearch}
                    onChange={(e) => setAdminWorkerSearch(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Workers Table / List */}
                <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {workers
                    .filter(
                      (w) =>
                        w.name.toLowerCase().includes(adminWorkerSearch.toLowerCase()) ||
                        (w.shopName && w.shopName.toLowerCase().includes(adminWorkerSearch.toLowerCase())) ||
                        w.phone.includes(adminWorkerSearch) ||
                        w.whatsapp.includes(adminWorkerSearch) ||
                        w.village.toLowerCase().includes(adminWorkerSearch.toLowerCase())
                    )
                    .map((worker) => (
                      <div
                        key={worker.id}
                        className="bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-slate-300"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={worker.avatarUrl}
                            alt={worker.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-black text-slate-900">{worker.shopName || worker.name}</h4>
                              <span className="text-xs text-slate-500 font-bold">({worker.name})</span>
                              {worker.isVerified ? (
                                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-0.5">
                                  <ShieldCheck className="w-3 h-3 text-blue-600" /> Verified
                                </span>
                              ) : (
                                <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                  Unverified
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {worker.village} • मो: <span className="font-bold text-slate-900">{worker.phone}</span> • रेट: {worker.charges}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleAdminToggleVerify(worker.id)}
                            className={`px-2.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border transition-all ${
                              worker.isVerified
                                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700'
                                : 'bg-slate-200 hover:bg-slate-300 text-slate-800 border-slate-300'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{worker.isVerified ? 'सत्यापित' : 'सत्यापित करें'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAdminResetWorkerId(worker.id);
                              setAdminTempPasswordInput('123456');
                            }}
                            className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1 border border-amber-500 shadow-2xs"
                            title="अस्थायी पासवर्ड रिसेट करें"
                          >
                            <Key className="w-3.5 h-3.5 text-slate-950" />
                            <span>🔑 रिसेट</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdminDeleteWorker(worker.id, worker.name)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl border border-red-300"
                            title="प्रोफाइल हटाएं"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB: NEW CONTENT REQUESTS (Master Locations & Master Categories) */}
            {adminTab === 'content_requests' && (
              <div className="flex flex-col gap-4 max-h-96 overflow-y-auto pr-1">
                
                {/* SECTION 1: MASTER LOCATIONS REQUESTS */}
                <div className="flex flex-col gap-3">
                  <div className="bg-emerald-50 border-2 border-emerald-300 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-emerald-950 flex items-center gap-1.5">
                        📍 नए गाँव व लोकेशन अनुरोध (Pending Locations)
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        व्यापारियों द्वारा रजिस्ट्रेशन के समय जोड़े गए नए गाँव व जिले
                      </p>
                    </div>
                    <span className="bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-xl">
                      {masterLocations.filter((l) => l.status === 'pending_approval').length} लंबित
                    </span>
                  </div>

                  {masterLocations.filter((l) => l.status === 'pending_approval').length === 0 ? (
                    <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 font-medium">
                      कोई लंबित लोकेशन अनुरोध नहीं है।
                    </div>
                  ) : (
                    masterLocations
                      .filter((l) => l.status === 'pending_approval')
                      .map((loc) => (
                        <div
                          key={loc.id}
                          className="bg-white border-2 border-amber-300 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-slate-900">
                                🏡 {loc.village}
                              </span>
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                ⏳ Pending Review
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              जिला: <b>{loc.district}</b> • राज्य: <b>{loc.state}</b>
                            </p>
                            {loc.requestedByPhone && (
                              <p className="text-[11px] text-slate-500">
                                📞 अनुरोधकर्ता मो: <a href={`tel:${loc.requestedByPhone}`} className="text-blue-700 underline font-bold">{loc.requestedByPhone}</a>
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleApproveMasterLocation(loc.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>स्वीकृत (Approve)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMasterLocation(loc.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>हटाएं</span>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* SECTION 2: MASTER CATEGORIES REQUESTS */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="bg-blue-50 border-2 border-blue-300 p-3 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-blue-950 flex items-center gap-1.5">
                        🏷️ नई व्यावसायिक श्रेणी अनुरोध (Pending Categories)
                      </h4>
                      <p className="text-[11px] text-blue-800 font-semibold">
                        व्यापारियों द्वारा जोड़े गए नए कस्टम बिज़नेस/सेवाएं
                      </p>
                    </div>
                    <span className="bg-blue-600 text-white text-xs font-black px-2.5 py-1 rounded-xl">
                      {masterCategories.filter((c) => c.status === 'pending_approval').length} लंबित
                    </span>
                  </div>

                  {masterCategories.filter((c) => c.status === 'pending_approval').length === 0 ? (
                    <div className="p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500 font-medium">
                      कोई लंबित श्रेणी अनुरोध नहीं है।
                    </div>
                  ) : (
                    masterCategories
                      .filter((c) => c.status === 'pending_approval')
                      .map((cat) => (
                        <div
                          key={cat.id}
                          className="bg-white border-2 border-amber-300 p-3 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-slate-900">
                                🛠️ {cat.hindiName || cat.categoryName}
                              </span>
                              <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md">
                                ⏳ Pending Review
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium mt-0.5">
                              अंग्रेजी नाम: <b>{cat.categoryName}</b>
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleApproveMasterCategory(cat.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>स्वीकृत (Approve)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMasterCategory(cat.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 active:scale-95 transition-transform"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>हटाएं</span>
                            </button>
                          </div>
                        </div>
                      ))
                  )}
                </div>

                {/* APPROVED MASTER ITEMS LIST FOR ADMIN MANAGEMENT */}
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 mt-2">
                  <h5 className="text-xs font-black text-slate-800 mb-2">
                    ✅ स्वीकृत कस्टम सामग्री (Approved Dynamic Data)
                  </h5>
                  <div className="flex flex-col gap-2">
                    <div className="text-[11px] text-slate-700">
                      <b>लोकेशन ({masterLocations.filter(l => l.status === 'approved').length}):</b>{' '}
                      {masterLocations.filter(l => l.status === 'approved').map(l => `${l.village} (${l.district})`).join(', ')}
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <b>श्रेणियां ({masterCategories.filter(c => c.status === 'approved').length}):</b>{' '}
                      {masterCategories.filter(c => c.status === 'approved').map(c => c.hindiName || c.categoryName).join(', ')}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: BANNER AD REQUESTS APPROVAL SYSTEM */}
            {adminTab === 'banner_ads' && (
              <div className="flex flex-col gap-3">
                {/* Banner Ad Filter Status Sub-Pills */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setAdminBannerFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        adminBannerFilter === 'all'
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      सभी ({bannerAdRequests.length})
                    </button>
                    <button
                      onClick={() => setAdminBannerFilter('pending')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        adminBannerFilter === 'pending'
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'text-amber-800 hover:bg-amber-100'
                      }`}
                    >
                      लंबित (Pending: {bannerAdRequests.filter((r) => r.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setAdminBannerFilter('approved')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        adminBannerFilter === 'approved'
                          ? 'bg-emerald-600 text-white'
                          : 'text-emerald-800 hover:bg-emerald-100'
                      }`}
                    >
                      स्वीकृत (Approved: {bannerAdRequests.filter((r) => r.status === 'approved').length})
                    </button>
                    <button
                      onClick={() => setAdminBannerFilter('rejected')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        adminBannerFilter === 'rejected'
                          ? 'bg-red-600 text-white'
                          : 'text-red-800 hover:bg-red-100'
                      }`}
                    >
                      निरस्त (Rejected: {bannerAdRequests.filter((r) => r.status === 'rejected').length})
                    </button>
                  </div>
                </div>

                {/* Banner Request Cards List */}
                <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1">
                  {bannerAdRequests.filter(
                    (r) => adminBannerFilter === 'all' || r.status === adminBannerFilter
                  ).length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                      <Megaphone className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-slate-500">
                        इस श्रेणी में कोई विज्ञापन अनुरोध नहीं मिला।
                      </p>
                    </div>
                  ) : (
                    bannerAdRequests
                      .filter((r) => adminBannerFilter === 'all' || r.status === adminBannerFilter)
                      .map((req) => (
                        <div
                          key={req.id}
                          className={`p-3.5 rounded-2xl border-2 flex flex-col gap-3 shadow-2xs transition-all ${
                            req.status === 'approved'
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : req.status === 'rejected'
                              ? 'bg-red-50/70 border-red-300'
                              : 'bg-amber-50/80 border-amber-300'
                          }`}
                        >
                          {/* Card Header Info */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <div className="flex items-center gap-3">
                              <img
                                src={req.imageUrl}
                                alt={req.businessName}
                                className="w-14 h-14 rounded-xl object-cover border border-slate-300 shrink-0 bg-white"
                              />
                              <div>
                                <h4 className="text-sm font-black text-slate-900">{req.businessName}</h4>
                                <p className="text-xs text-slate-700 font-bold">
                                  📞 मो: <a href={`tel:${req.mobile}`} className="text-emerald-700 underline">{req.mobile}</a>
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  UTR/Ref: <span className="font-mono font-black text-slate-800">{req.utrNumber}</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 shrink-0 self-end sm:self-auto">
                              <span
                                className={`px-2.5 py-1 rounded-xl text-xs font-black border flex items-center gap-1 ${
                                  req.status === 'approved'
                                    ? 'bg-emerald-600 text-white border-emerald-700'
                                    : req.status === 'rejected'
                                    ? 'bg-red-600 text-white border-red-700'
                                    : 'bg-amber-400 text-slate-950 border-amber-500 animate-pulse'
                                }`}
                              >
                                {req.status === 'approved' && <CheckSquare className="w-3.5 h-3.5" />}
                                {req.status === 'rejected' && <XCircle className="w-3.5 h-3.5" />}
                                {req.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                                <span>
                                  {req.status === 'approved'
                                    ? 'सत्यापित व लाइव (Approved)'
                                    : req.status === 'rejected'
                                    ? 'रद्द (Rejected)'
                                    : 'सत्यापन हेतु लंबित (Pending)'}
                                </span>
                              </span>

                              <span className="text-[11px] text-slate-600 font-bold">
                                प्लान: {req.durationDays} दिन (₹{req.price})
                              </span>
                            </div>
                          </div>

                          {/* Approval / Expiry details */}
                          {req.status === 'approved' && req.expiryTime && (
                            <div className="bg-emerald-100 border border-emerald-300 p-2 rounded-xl text-xs text-emerald-950 font-bold flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4 text-emerald-700" />
                                <span>विज्ञापन वैधता शेष: {formatRemainingTime(req.expiryTime)}</span>
                              </span>
                              <span className="text-[10px] text-emerald-800">
                                Approved on: {new Date(req.approvedAt || Date.now()).toLocaleDateString('hi-IN')}
                              </span>
                            </div>
                          )}

                          {/* Action Buttons for Admin */}
                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="text-[10px] text-slate-500 font-medium">
                              जमा करने का समय: {new Date(req.submittedAt).toLocaleString('hi-IN')}
                            </div>

                            <div className="flex items-center gap-2">
                              {req.status !== 'approved' && (
                                <button
                                  onClick={() => handleApproveBannerAd(req.id)}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs border border-emerald-700 flex items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>स्वीकार करें (Approve)</span>
                                </button>
                              )}

                              {req.status !== 'rejected' && (
                                <button
                                  onClick={() => handleRejectBannerAd(req.id)}
                                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-xs border border-amber-700 flex items-center gap-1 active:scale-95 transition-transform"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>निरस्त करें (Reject)</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteBannerAd(req.id)}
                                className="p-1.5 bg-slate-200 hover:bg-red-100 text-slate-600 hover:text-red-700 rounded-xl border border-slate-300"
                                title="अनुरोध हटाएं"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))
                  )}
                </div>
              </div>
            )}

            {/* Logout Row */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">मालिक सुरक्षा मोड सक्रिय</span>
              <button
                onClick={handleAdminLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-1"
              >
                <span>🚪 लॉग आउट (Logout)</span>
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ==================== MODAL 5: PAID BANNER ADVERTISEMENT & UPI PAYMENT FLOW ==================== */}
      {isAdvertiseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 w-full max-w-lg border-3 border-amber-400 shadow-2xl my-auto flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl font-black text-xl shadow-md">
                  📢
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    अपना विज्ञापन चलाएं / Local Banner Ads
                  </h3>
                  <p className="text-xs text-emerald-800 font-bold">
                    हजारों ग्रामीणों व ग्राहकों तक अपनी दुकान का प्रचार पहुँचाएँ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAdvertiseModalOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBannerAdSubmit} className="flex flex-col gap-4">

              {/* 1. DURATION & PRICING SELECTOR GRID */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-2 flex items-center gap-1">
                  <Tag className="w-4 h-4 text-emerald-700" />
                  <span>1. विज्ञापन अवधि व प्लान चुनें (Select Plan) *</span>
                </label>

                <div className="grid grid-cols-2 gap-2">
                  {AD_PRICING_PLANS.map((plan) => (
                    <div
                      key={plan.days}
                      onClick={() => setAdForm({ ...adForm, durationDays: plan.days, price: plan.price })}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        adForm.durationDays === plan.days
                          ? 'border-emerald-600 bg-emerald-50 shadow-md ring-2 ring-emerald-500/30'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900">{plan.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            adForm.durationDays === plan.days
                              ? 'border-emerald-600 bg-emerald-600'
                              : 'border-slate-400 bg-white'
                          }`}
                        >
                          {adForm.durationDays === plan.days && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-lg font-black text-emerald-950">₹{plan.price}</span>
                        <span className="text-[9px] font-bold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {plan.badge}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. UPI PAYMENT BOX WITH ADMIN UPI ID & QR CODE */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 p-4 rounded-3xl flex flex-col gap-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1">
                    <QrCode className="w-4 h-4 text-emerald-700" />
                    <span>2. UPI भुगतान विवरण (Admin Payment UPI)</span>
                  </span>
                  <span className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                    कुल देय: ₹{adForm.price}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* GENERATED DYNAMIC UPI QR CODE */}
                  <div className="bg-white p-2 rounded-2xl border-2 border-emerald-400 shadow-sm shrink-0 text-center">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                        `upi://pay?pa=7055450913@ybl&pn=GramSevaOwner&am=${adForm.price}&cu=INR`
                      )}`}
                      alt="Gram Seva Admin UPI QR Code"
                      className="w-28 h-28 object-contain rounded-xl"
                    />
                    <span className="text-[9px] font-bold text-slate-600 block mt-1">Scan & Pay ₹{adForm.price}</span>
                  </div>

                  {/* ADMIN UPI DETAILS & COPY BUTTON */}
                  <div className="flex flex-col gap-2 w-full">
                    <p className="text-[11px] text-slate-700 font-medium">
                      नीचे दिए गए UPI ID पर <b>PhonePe, Google Pay, Paytm या BHIM</b> से भुगतान करें:
                    </p>

                    <div className="bg-white p-2.5 rounded-xl border-2 border-emerald-300 flex items-center justify-between">
                      <div className="overflow-hidden">
                        <span className="text-[10px] text-slate-500 font-bold block">मालिक UPI ID:</span>
                        <span className="text-xs font-black text-emerald-900 font-mono select-all">
                          7055450913@ybl
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText('7055450913@ybl');
                          setCopiedUpi(true);
                          setTimeout(() => setCopiedUpi(false), 2500);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold flex items-center gap-1 border border-emerald-300 shrink-0"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-emerald-800 font-semibold bg-emerald-100/80 p-1.5 rounded-lg border border-emerald-200">
                      💡 भुगतान के बाद ऐप में 12-अंकों का UTR / Transaction No. दर्ज करें।
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. BUSINESS DETAILS & IMAGE FORM */}
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      बिज़नेस का नाम (Business Name) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. चौधरी खाद व बीज भंडार"
                      value={adForm.businessName}
                      onChange={(e) => setAdForm({ ...adForm, businessName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">
                      संपर्क मोबाइल नंबर (Mobile No) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="10-अंकों का मोबाइल नंबर"
                      value={adForm.mobile}
                      onChange={(e) => setAdForm({ ...adForm, mobile: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    दुकान / बैनर फोटो की वेब लिंक (Shop Banner Image URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={adForm.imageUrl}
                    onChange={(e) => setAdForm({ ...adForm, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    अगर खाली छोड़ेंगे तो डिफ़ॉल्ट कृषि व दुकान का बैनर लगेगा।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1 flex items-center justify-between">
                    <span>12-अंकों का UPI UTR / Transaction Ref No. *</span>
                    <span className="text-[10px] text-emerald-700 font-bold">PhonePe/GPay से प्राप्त</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="e.g. 422910482910"
                    value={adForm.utrNumber}
                    onChange={(e) => setAdForm({ ...adForm, utrNumber: e.target.value })}
                    className="w-full p-3 bg-amber-50 border-2 border-amber-400 rounded-2xl text-sm font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdvertiseModalOpen(false)}
                  className="w-1/3 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md border border-emerald-700 flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                  <span>विज्ञापन सबमिट करें (Submit Request)</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}


      {/* ==================== MERCHANT LOGIN MODAL ==================== */}
      {isMerchantLoginOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-2 border-blue-300 flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-blue-100 text-blue-900 rounded-2xl">
                  <Store className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    🏪 व्यापारी / दुकान लॉगिन
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    अपनी दुकान या सेवा प्रोफाइल प्रबंधित करें
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMerchantLoginOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {merchantLoginError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-2xl text-xs font-bold text-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{merchantLoginError}</span>
              </div>
            )}

            <form onSubmit={handleMerchantLogin} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  रजिस्टर्ड मोबाइल नंबर (Registered Mobile No.) *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="10-अंकों का मोबाइल नंबर दर्ज करें"
                  value={merchantMobileInput}
                  onChange={(e) => setMerchantMobileInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-black text-slate-800">
                    पासवर्ड (Password) *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMerchantLoginOpen(false);
                      setIsForgotPasswordOpen(true);
                      setForgotMobileNumber(merchantMobileInput);
                    }}
                    className="text-[11px] font-black text-blue-700 hover:text-blue-900 underline"
                  >
                    पासवर्ड भूल गए? (Forgot Password?)
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="अपना पासवर्ड दर्ज करें (डिफ़ॉल्ट: 123456)"
                  value={merchantPasswordInput}
                  onChange={(e) => setMerchantPasswordInput(e.target.value)}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md border border-blue-700 flex items-center justify-center gap-2 active:scale-98 transition-transform mt-1"
              >
                <Key className="w-4 h-4 text-blue-200" />
                <span>दुकान में लॉगिन करें (Merchant Login)</span>
              </button>
            </form>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-900 font-semibold leading-relaxed">
              💡 <b>सूचना:</b> यदि आपने हाल ही में नई दुकान जोड़ी है, तो आपका प्रारंभिक पासवर्ड <b>123456</b> है। लॉगिन के बाद आप अपना नया पासवर्ड बदल सकते हैं।
            </div>
          </div>
        </div>
      )}


      {/* ==================== ZERO-COST FORGOT PASSWORD & SECURITY QUESTION MODAL ==================== */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl border-2 border-amber-300 flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-100 text-amber-900 rounded-2xl">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    🔑 पासवर्ड भूल गए? (Forgot Password)
                  </h3>
                  <p className="text-xs text-slate-500 font-bold">
                    सुरक्षा प्रश्न या सीक्रेट PIN से तुरंत नया पासवर्ड बनाएं
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setForgotStep(1);
                  setForgotError(null);
                }}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Progress Pills */}
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl text-[11px] font-black text-center">
              <div className={`py-1.5 rounded-xl transition-colors ${forgotStep === 1 ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'}`}>
                1. मोबाइल नंबर
              </div>
              <div className={`py-1.5 rounded-xl transition-colors ${forgotStep === 2 ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600'}`}>
                2. सुरक्षा उत्तर
              </div>
              <div className={`py-1.5 rounded-xl transition-colors ${forgotStep === 3 ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'}`}>
                3. नया पासवर्ड
              </div>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-50 border border-red-300 rounded-2xl text-xs font-bold text-red-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{forgotError}</span>
                </div>
                {forgotStep === 2 && (
                  <a
                    href={getAdminWhatsAppResetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-200" />
                    <span>💬 वॉट्सऐप पर एडमिन से मदद लें</span>
                  </a>
                )}
              </div>
            )}

            {/* STEP 1: MOBILE NUMBER SEARCH */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1Search} className="flex flex-col gap-3.5">
                <p className="text-xs text-slate-600 font-medium leading-relaxed bg-amber-50 p-3 rounded-2xl border border-amber-200">
                  अपनी दुकान का पासवर्ड रिसेट करने के लिए पहले अपना <b>रजिस्टर्ड मोबाइल नंबर</b> दर्ज करें।
                </p>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    रजिस्टर्ड मोबाइल नंबर (Registered Mobile Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-अंकों का मोबाइल नंबर दर्ज करें"
                    value={forgotMobileNumber}
                    onChange={(e) => setForgotMobileNumber(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPasswordOpen(false);
                      setIsMerchantLoginOpen(true);
                    }}
                    className="w-1/3 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>लॉगिन</span>
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md border border-amber-600 flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                  >
                    <Search className="w-4 h-4" />
                    <span>सुरक्षा प्रश्न खोजें (Next Step)</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
                  <p className="text-[11px] font-bold text-slate-500 text-center">
                    उत्तर याद नहीं है या सीधा एडमिन संपर्क करना चाहते हैं?
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={getAdminWhatsAppResetUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 text-center"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>वॉट्सऐप रिसेट</span>
                    </a>
                    <button
                      type="button"
                      onClick={(e) => handleSendForgotPasswordEmail(e)}
                      className="py-2.5 px-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 text-center"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>ईमेल रिसेट</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: SECURITY QUESTION ANSWER VERIFICATION */}
            {forgotStep === 2 && forgotFoundWorker && (
              <form onSubmit={handleForgotStep2VerifyAnswer} className="flex flex-col gap-3.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-1">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-blue-600" />
                    <span>{forgotFoundWorker.shopName || forgotFoundWorker.name}</span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-600">
                    व्यापारी: {forgotFoundWorker.name} | मोबाइल: {forgotFoundWorker.phone}
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 flex flex-col gap-1.5">
                  <div className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-700" />
                    <span>सुरक्षा प्रश्न (Security Question):</span>
                  </div>
                  <div className="text-xs font-bold text-amber-900 bg-white p-2.5 rounded-xl border border-amber-200">
                    {forgotFoundWorker.securityQuestion || '4-अंकों का सीक्रेट पिन / 4-Digit Security PIN'}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    अपना सीक्रेट उत्तर / 4-अंकों का PIN दर्ज करें *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="सीक्रेट PIN या उत्तर लिखें (उदा: 4321)"
                    value={forgotAnswerInput}
                    onChange={(e) => setForgotAnswerInput(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-semibold">
                    💡 सही उत्तर दर्ज करते ही आपको तुरंत नया पासवर्ड बनाने का फॉर्म मिलेगा।
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setForgotError(null);
                    }}
                    className="w-1/3 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-2xl"
                  >
                    पीछे जाएं
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-md border border-amber-600 flex items-center justify-center gap-1.5 active:scale-98 transition-transform"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>उत्तर सत्यापित करें (Verify Answer)</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 pt-3 flex flex-col gap-2">
                  <p className="text-[11px] font-bold text-slate-600 text-center">
                    उत्तर/PIN याद नहीं है? सीधा एडमिन से मदद लें:
                  </p>
                  <a
                    href={getAdminWhatsAppResetUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-200" />
                    <span>💬 वॉट्सऐप पर मदद लें (Reset via Admin WhatsApp)</span>
                  </a>
                </div>
              </form>
            )}

            {/* STEP 3: CREATE NEW PASSWORD */}
            {forgotStep === 3 && forgotFoundWorker && (
              <form onSubmit={handleForgotStep3SubmitNewPassword} className="flex flex-col gap-3.5">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-300 flex items-center gap-2 text-xs font-black text-emerald-900">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>सुरक्षा उत्तर सत्यापित हो गया! अपनी दुकान "{forgotFoundWorker.shopName || forgotFoundWorker.name}" के लिए नया पासवर्ड बनाएं।</span>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    नया पासवर्ड (New Password) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="नया पासवर्ड दर्ज करें (कम से कम 4 अक्षर)"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    नया पासवर्ड पुनः दर्ज करें (Confirm New Password) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="पासवर्ड की पुष्टि करें"
                    value={forgotConfirmPassword}
                    onChange={(e) => setForgotConfirmPassword(e.target.value)}
                    className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-md border border-emerald-700 flex items-center justify-center gap-2 active:scale-98 transition-transform mt-1"
                >
                  <Key className="w-4 h-4 text-emerald-200" />
                  <span>💾 नया पासवर्ड सेव करें व दुकान में लॉगिन करें</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}


      {/* ==================== MERCHANT DASHBOARD MODAL ==================== */}
      {isMerchantDashboardOpen && loggedInWorker && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border-2 border-emerald-300 flex flex-col gap-5 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={loggedInWorker.avatarUrl}
                  alt={loggedInWorker.name}
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-400 shrink-0 shadow-2xs bg-white"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {loggedInWorker.shopName || loggedInWorker.name}
                    </h3>
                    {loggedInWorker.isVerified ? (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 flex items-center gap-0.5">
                        <ShieldCheck className="w-3 h-3 text-blue-600" /> Aadhaar Verified
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                        ⏳ सत्यापन लंबित
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-bold">
                    मालिक: {loggedInWorker.name} • {loggedInWorker.phone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsMerchantDashboardOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs text-emerald-950 font-black">
                <span>📍 स्थान: {loggedInWorker.village}, {loggedInWorker.district}</span>
                <span>⭐ {loggedInWorker.rating} ({loggedInWorker.reviewsCount || 0} रिव्यू)</span>
              </div>
              <div className="text-xs text-emerald-900 font-semibold">
                श्रेणी: <span className="font-bold">{loggedInWorker.category}</span> {loggedInWorker.customCategory ? `(${loggedInWorker.customCategory})` : ''}
              </div>
            </div>

            {/* DIGITAL VISITING CARD GENERATOR BANNER */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-4 rounded-3xl border-2 border-amber-400 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-300 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-black text-amber-300">
                    📇 आपका डिजिटल विजिटिंग कार्ड (Visiting Card)
                  </h4>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  5 प्रीमियम डिजाइन टेम्पलेट्स में से चुनें, क्यूआर कोड के साथ डाउनलोड करें व व्हाट्सएप पर शेयर करें।
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsMerchantCardOpen(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-500 active:scale-95 text-slate-950 font-black text-xs rounded-2xl shadow-sm border border-amber-500 shrink-0 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-slate-950 shrink-0" />
                <span>कार्ड देखें व शेयर करें</span>
              </button>
            </div>

            {/* Self-Service Password Change Section */}
            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded-3xl flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <Key className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs sm:text-sm font-black text-slate-900">
                  🔑 पासवर्ड बदलें (Change Password)
                </h4>
              </div>

              {passwordChangeMsg && (
                <div className={`p-2.5 rounded-xl text-xs font-bold border ${
                  passwordChangeMsg.includes('🎉')
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-red-50 text-red-800 border-red-300'
                }`}>
                  {passwordChangeMsg}
                </div>
              )}

              <form onSubmit={handleMerchantPasswordChange} className="flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    वर्तमान/पुराना पासवर्ड (Current Password) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="वर्तमान पासवर्ड दर्ज करें"
                    value={changeCurrentPassword}
                    onChange={(e) => setChangeCurrentPassword(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      नया पासवर्ड (New Password) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="कम से कम 4 अक्षर"
                      value={changeNewPassword}
                      onChange={(e) => setChangeNewPassword(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      पासवर्ड की पुष्टि (Confirm) *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="पुनः नया पासवर्ड दर्ज करें"
                      value={changeConfirmPassword}
                      onChange={(e) => setChangeConfirmPassword(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-xl shadow-sm border border-emerald-800 active:scale-98 transition-transform mt-1"
                >
                  💾 नया पासवर्ड सेव करें (Update Password)
                </button>
              </form>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={handleMerchantLogout}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 font-black text-xs rounded-xl border border-red-300 flex items-center gap-1.5"
              >
                <XCircle className="w-4 h-4 text-red-600" />
                <span>लॉग आउट (Logout)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsMerchantDashboardOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded-xl"
              >
                बंद करें
              </button>
            </div>

          </div>
        </div>
      )}


      {/* ==================== ADMIN RESET PASSWORD DIALOG MODAL ==================== */}
      {adminResetWorkerId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border-2 border-amber-400 flex flex-col gap-4 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-700" />
                <h3 className="text-base font-black text-slate-900">
                  🔑 एडमिन पासवर्ड रिसेट
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAdminResetWorkerId(null)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              व्यापारी के लिए नया अस्थायी पासवर्ड दर्ज करें। पासवर्ड तुरंत local state तथा Firestore डेटाबेस में अपडेट हो जाएगा।
            </p>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">
                अस्थायी पासवर्ड (Temporary Password) *
              </label>
              <input
                type="text"
                required
                value={adminTempPasswordInput}
                onChange={(e) => setAdminTempPasswordInput(e.target.value)}
                className="w-full p-2.5 bg-amber-50 border-2 border-amber-300 rounded-xl text-sm font-mono font-black text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdminResetWorkerId(null)}
                className="w-1/2 py-2.5 bg-slate-200 text-slate-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => handleAdminSaveResetPassword(adminResetWorkerId, adminTempPasswordInput)}
                className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md border border-amber-600"
              >
                रिसेट सेव करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAP MODAL 1: MERCHANT PICK SHOP LOCATION ==================== */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl border-2 border-amber-400 flex flex-col gap-3.5 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-xl text-amber-900">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    📍 दुकान की लोकेशन सेट करें (Pick Shop Location)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    नक्शे पर मार्कर को खींचें या किसी स्थान पर क्लिक करें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <MapPicker
              initialLat={pickerLat}
              initialLng={pickerLng}
              onLocationSelect={(lat, lng) => {
                setPickerLat(lat);
                setPickerLng(lng);
              }}
              height="300px"
            />

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center justify-between">
              <span>चुने गए निर्देशांक:</span>
              <span className="text-emerald-800 font-black">Lat: {pickerLat.toFixed(5)}, Lng: {pickerLng.toFixed(5)}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="w-1/3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewWorker((prev) => ({ ...prev, lat: pickerLat, lng: pickerLng }));
                  setIsMapPickerOpen(false);
                }}
                className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>स्थान की पुष्टि करें (Confirm Location)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAP MODAL 2: SINGLE SHOP PREVIEW MAP ==================== */}
      {isSingleShopMapOpen && selectedShopForMap && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl border-2 border-emerald-500 flex flex-col gap-3.5 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-900 rounded-xl">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    🏪 {selectedShopForMap.shopName || selectedShopForMap.hindiName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    📍 {selectedShopForMap.village}, {selectedShopForMap.district}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSingleShopMapOpen(false)}
                className="p-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <SingleShopMapView
              lat={selectedShopForMap.lat || 28.7512}
              lng={selectedShopForMap.lng || 77.4215}
              shopName={selectedShopForMap.shopName || selectedShopForMap.hindiName}
              categoryLabel={selectedShopForMap.category}
              address={`${selectedShopForMap.village}, ${selectedShopForMap.district}`}
              phone={selectedShopForMap.phone}
              height="300px"
            />

            <div className="flex gap-2">
              <a
                href={`tel:${selectedShopForMap.phone}`}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm border border-emerald-700 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Phone className="w-4 h-4 fill-white" />
                <span>कॉल करें</span>
              </a>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedShopForMap.lat || 28.7512},${selectedShopForMap.lng || 77.4215}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-sm border border-blue-700 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Navigation className="w-4 h-4" />
                <span>🚗 रास्ता देखें (Google Maps)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MAP MODAL 3: MULTI-SHOP NEARBY MAP EXPLORER ==================== */}
      {isNearbyMapOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-2xl w-full shadow-2xl border-2 border-emerald-500 flex flex-col gap-3.5 relative animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2.5 bg-amber-400 text-slate-950 rounded-2xl shadow-inner font-black">
                  🗺️
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    मेरे पास की सभी दुकानें व सेवाएं (Nearby Map)
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    आपकी वर्तमान लोकेशन से {nearbyRadiusKm} km दायरे की दुकानें
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsNearbyMapOpen(false)}
                className="p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Radius Control */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span>दायरा (Search Radius):</span>
                {[5, 10, 25, 50].map((r) => (
                  <button
                    key={r}
                    onClick={() => setNearbyRadiusKm(r)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all ${
                      nearbyRadiusKm === r
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-white text-slate-700 border border-slate-300'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleGetCustomerLocation}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl border border-amber-500 flex items-center gap-1 shadow-2xs"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-950" />
                <span>री-डिफाइन लोकेशन</span>
              </button>
            </div>

            <MultiShopMapView
              userLat={userGpsLat}
              userLng={userGpsLng}
              shops={workers.map((w) => ({
                id: w.id,
                name: w.name,
                shopName: w.shopName || w.hindiName,
                lat: w.lat || 28.7512,
                lng: w.lng || 77.4215,
                categoryLabel: w.category,
                phone: w.phone,
                address: `${w.village}, ${w.district}`
              }))}
              height="350px"
            />

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setIsNearbyMapOpen(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-black text-xs rounded-xl"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MERCHANT DIGITAL VISITING CARD MODAL ==================== */}
      {isMerchantCardOpen && loggedInWorker && (
        <VisitingCardModal
          worker={loggedInWorker}
          isOpen={isMerchantCardOpen}
          onClose={() => setIsMerchantCardOpen(false)}
        />
      )}

    </div>
  );
}


// --- NATIVE AD CARD COMPONENT WITH "Sponsored / विज्ञापन" BADGE ---
interface NativeAdCardProps {
  key?: React.Key;
  ad: NativeAdItem;
}

function NativeAdCard({ ad }: NativeAdCardProps) {
  return (
    <div className={`p-4 rounded-3xl border-2 transition-all shadow-sm flex flex-col gap-3 relative overflow-hidden ${ad.bgColor} ${ad.borderColor}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wide flex items-center gap-1 border border-amber-300 shadow-2xs">
          <Sparkles className="w-3 h-3 text-slate-950" /> {ad.badgeText}
        </span>
        <span className="bg-white/80 text-slate-700 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-slate-200">
          {ad.categoryTag}
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center text-3xl shadow-xs shrink-0">
          {ad.iconEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
            {ad.hindiTitle}
          </h4>
          <p className="text-xs text-slate-600 font-medium mt-1 line-clamp-2 leading-relaxed">
            {ad.description}
          </p>
          <span className="text-[10px] text-slate-500 font-bold block mt-1">
            प्रायोजक: {ad.sponsorName}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
        <span className="text-[11px] text-slate-600 font-bold">
          ग्राम-देहात स्पेशल ऑफर
        </span>
        <a
          href={ad.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-slate-800 text-amber-300 px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
        >
          <span>{ad.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}


// --- WORKER CARD COMPONENT WITH INTERACTIVE 5-STAR RATING & DIRECT ACTION BUTTONS ---
interface WorkerCardProps {
  key?: React.Key;
  worker: WorkerService & { distanceKm: number; isExactVillage: boolean };
  isFavorite: boolean;
  onToggleFavorite: (workerId: string) => void;
  onVoiceRead: (text: string) => void;
  onRateWorker: (workerId: string, ratingStars: number, selectedTags: string[]) => void;
  onViewMap?: (worker: WorkerService) => void;
}

function WorkerCard({ worker, isFavorite, onToggleFavorite, onVoiceRead, onRateWorker, onViewMap }: WorkerCardProps) {
  const whatsappMsg = `नमस्ते ${worker.hindiName}, मुझे गाँव में काम करवाना है। क्या आप उपलब्ध हैं?`;
  const whatsappUrl = `https://wa.me/${worker.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`;

  // Interactive rating state & Share state
  const [isRatingOpen, setIsRatingOpen] = useState<boolean>(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState<boolean>(false);
  const [userStars, setUserStars] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submittedMessage, setSubmittedMessage] = useState<boolean>(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const availableTags = ["अच्छा काम", "सही रेट", "समय पर आए", "व्यवहार अच्छा", "अनुभवी मिस्त्री", "ईमानदार"];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleRatingSubmit = () => {
    onRateWorker(worker.id, userStars, selectedTags);
    setSubmittedMessage(true);
    setTimeout(() => {
      setIsRatingOpen(false);
      setSubmittedMessage(false);
    }, 2000);
  };

  // Web Share API & Clipboard Fallback handler for Deep Link
  const handleShareShop = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const shopTitle = worker.shopName || worker.hindiName || worker.name;
    const shareUrl = `${window.location.origin}${window.location.pathname}?shop=${worker.id}`;
    const shareText = `🏪 ${shopTitle} - ${worker.village}, ${worker.district} (${worker.charges})\nग्राम सेवा ऐप पर दुकान की जानकारी और संपर्क सूत्र देखें:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${shopTitle} - ग्राम सेवा`,
          text: shareText,
          url: shareUrl,
        });
        setShareToast('शेयर कर दिया गया! 📲');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          copyToClipboard(shareUrl);
        }
      }
    } else {
      copyToClipboard(shareUrl);
    }

    setTimeout(() => {
      setShareToast(null);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setShareToast('लिंक कॉपी हो गया! 📋');
      }).catch(() => {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShareToast('लिंक कॉपी हो गया! 📋');
    } catch (err) {
      setShareToast('कॉपी नहीं हो सका');
    }
  };

  return (
    <div
      id={`worker-${worker.id}`}
      className={`p-4 sm:p-4.5 rounded-3xl border-2 transition-all shadow-sm flex flex-col gap-3 relative overflow-hidden bg-white ${
        worker.isExactVillage ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Toast Notification Badge for Share/Copy */}
      {shareToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-slate-900/95 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-full shadow-xl border border-amber-400 animate-bounce flex items-center gap-1.5 whitespace-nowrap">
          <span>{shareToast}</span>
        </div>
      )}

      {/* Top Banner Row: Distance Badge & Verification */}
      <div className="flex items-center justify-between gap-2">
        {/* Distance Badge */}
        {worker.isExactVillage ? (
          <span className="bg-emerald-600 text-white font-black text-[11px] px-3 py-1 rounded-full flex items-center gap-1 shadow-2xs">
            <span className="animate-ping text-[8px]">●</span> 🎯 आपके गांव में (0 km)
          </span>
        ) : (
          <span className="bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1">
            <Navigation className="w-3 h-3 text-amber-700" /> {worker.distanceKm} km दूर ({worker.village})
          </span>
        )}

        {/* Verification & Dynamic Average Rating */}
        <div className="flex items-center gap-2">
          {worker.verificationStatus === 'pending' && (
            <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-0.5">
              ⏳ समीक्षा में (Under Review)
            </span>
          )}

          {(worker.isVerified || worker.verificationStatus === 'approved') && (
            <span className="bg-blue-100 text-blue-900 font-black text-[10px] px-2 py-0.5 rounded-md border border-blue-300 flex items-center gap-0.5 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Aadhaar Verified
            </span>
          )}

          {worker.verificationStatus === 'rejected' && (
            <span className="bg-red-100 text-red-900 font-bold text-[10px] px-2 py-0.5 rounded-md border border-red-200">
              ❌ अमान्य प्रोफाइल
            </span>
          )}

          <button
            onClick={() => setIsRatingOpen(!isRatingOpen)}
            className="bg-amber-100 hover:bg-amber-200 text-amber-900 font-black text-xs px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
            title="समीक्षा दें या देखें"
          >
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{worker.rating}</span>
            <span className="text-[10px] text-amber-800 font-bold">({worker.reviewsCount || 12})</span>
          </button>
        </div>
      </div>

      {/* Main Info Row */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <img
          src={worker.avatarUrl}
          alt={worker.name}
          className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-slate-200 shadow-2xs shrink-0 bg-slate-100"
        />

        {/* Worker Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900 truncate flex items-center gap-1.5">
                <span className="truncate">{worker.shopName ? `🏪 ${worker.shopName}` : (worker.hindiName || worker.name)}</span>
                {isFavorite && (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500 shrink-0" title="आपकी पसंद में शामिल" />
                )}
              </h4>
              {worker.shopName && (
                <p className="text-xs text-slate-700 font-bold">
                  मालिक: {worker.name}
                </p>
              )}
            </div>

            {/* Top Action Icons: Favorite Star, Visiting Card, Share & Voice Read */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(worker.id);
                  setShareToast(isFavorite ? 'पसंद से हटाया गया ❌' : 'पसंद में जोड़ा गया! ⭐');
                  setTimeout(() => setShareToast(null), 2500);
                }}
                className={`p-1.5 rounded-full shrink-0 transition-all shadow-2xs border active:scale-90 ${
                  isFavorite
                    ? 'bg-amber-100 border-amber-400 text-amber-500 hover:bg-amber-200 ring-2 ring-amber-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-amber-500 border-slate-200'
                }`}
                title={isFavorite ? "पसंद से हटाएं (Remove from Favorites)" : "पसंद में जोड़ें (Add to Favorites)"}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsCardModalOpen(true)}
                className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-950 rounded-full shrink-0 transition-colors shadow-2xs border border-emerald-300"
                title="डिजिटल विजिटिंग कार्ड देखें व डाउनलोड करें (Visiting Card)"
              >
                <QrCode className="w-4 h-4 text-emerald-900" />
              </button>

              <button
                type="button"
                onClick={handleShareShop}
                className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 rounded-full shrink-0 transition-colors shadow-2xs border border-amber-300"
                title="दुकान शेयर करें (Share Shop Profile)"
              >
                <Share2 className="w-4 h-4 text-amber-900" />
              </button>

              <button
                type="button"
                onClick={() => onVoiceRead(`${worker.shopName || worker.hindiName}, गाँव ${worker.village}, फोन नंबर ${worker.phone}, रेट ${worker.charges}`)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full shrink-0"
                title="जानकारी सुनें"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-600 font-bold mt-0.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{worker.village}, {worker.district}</span>
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-emerald-50 text-emerald-900 font-black text-xs px-2.5 py-1 rounded-xl border border-emerald-200">
              {worker.charges}
            </span>

            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-2 py-1 rounded-xl">
              {worker.experienceYears} साल अनुभव
            </span>

            <span className="text-[11px] text-slate-500 font-medium">
              ({worker.jobsDone}+ काम पूरे किए)
            </span>
          </div>

          {/* Skill Tags */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {worker.skills.map((skill, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-lg border border-slate-200">
                • {skill}
              </span>
            ))}
          </div>

          {/* User Feedback Badges */}
          {worker.userTags && worker.userTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {worker.userTags.map((tag, idx) => (
                <span key={idx} className="bg-amber-50 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200">
                  👍 {tag}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* INTERACTIVE 5-STAR RATING & REVIEW TOGGLE PANEL */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <span className="text-[11px] text-slate-500 font-bold">
          {worker.reviewsCount || 12} लोगों ने समीक्षा दी
        </span>

        <button
          onClick={() => setIsRatingOpen(!isRatingOpen)}
          className="text-xs font-black text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded-xl border border-amber-300 flex items-center gap-1 transition-colors"
        >
          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>{isRatingOpen ? 'बंद करें' : '⭐ रेटिंग व समीक्षा दें'}</span>
        </button>
      </div>

      {/* EXPANDABLE INTERACTIVE REVIEW BOX */}
      {isRatingOpen && (
        <div className="bg-amber-50/90 border-2 border-amber-300 p-3 rounded-2xl flex flex-col gap-2.5 mt-1">
          {submittedMessage ? (
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl text-xs font-black text-center flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>धन्यवाद! आपकी ५-स्टार रेटिंग सुरक्षित हो गई!</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900">
                  दुकान / काम को रेटिंग दें (Select 1 - 5 Stars):
                </span>
                <span className="text-xs font-black text-amber-800">
                  {userStars} Star
                </span>
              </div>

              {/* 5-Star Controls */}
              <div className="flex items-center justify-center gap-2 py-1 bg-white rounded-xl border border-amber-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setUserStars(star)}
                    className="p-1 hover:scale-125 transition-transform"
                    title={`${star} Star`}
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= userStars
                          ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Feedback Tags Selector */}
              <div>
                <span className="block text-[11px] font-bold text-slate-700 mb-1">
                  अनुभव के अनुसार टैग चुनें (Choose Feedback Tags):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-slate-950 border-amber-500 font-black shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleRatingSubmit}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md border border-emerald-700 flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>रेटिंग जमा करें (Submit Review)</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* MAP LOCATION, DIRECTIONS, SHARE SHOP & VISITING CARD ACTION BUTTONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setIsCardModalOpen(true)}
          className="bg-emerald-800 hover:bg-emerald-900 text-amber-300 active:scale-95 py-2 px-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 border border-emerald-900 transition-all shadow-2xs col-span-2 sm:col-span-1"
          title="दुकान का डिजिटल विजिटिंग कार्ड देखें व डाउनलोड करें"
        >
          <QrCode className="w-3.5 h-3.5 text-amber-300 shrink-0" />
          <span className="truncate">📇 विजिटिंग कार्ड</span>
        </button>

        <button
          type="button"
          onClick={() => onViewMap && onViewMap(worker)}
          className="bg-slate-100 hover:bg-slate-200 text-slate-900 active:scale-95 py-2 px-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 border border-slate-300 transition-all shadow-2xs"
          title="Leaflet मैप पर दुकान देखें"
        >
          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span className="truncate">मैप देखें</span>
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${worker.lat || 28.7512},${worker.lng || 77.4215}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-50 hover:bg-blue-100 text-blue-900 active:scale-95 py-2 px-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 border border-blue-300 transition-all shadow-2xs"
          title="गूगल मैप्स पर रास्ता देखें"
        >
          <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span className="truncate">रास्ता देखें</span>
        </a>

        <button
          type="button"
          onClick={handleShareShop}
          className="bg-amber-100 hover:bg-amber-200 text-amber-950 active:scale-95 py-2 px-1.5 rounded-xl font-black text-xs flex items-center justify-center gap-1 border border-amber-300 transition-all shadow-2xs"
          title="दुकान प्रोफाइल का लिंक शेयर करें (Share Shop)"
        >
          <Share2 className="w-3.5 h-3.5 text-amber-900 shrink-0" />
          <span className="truncate">शेयर करें</span>
        </button>
      </div>

      {/* DIRECT ACTION BUTTONS (HIGH IMPACT COLOR CODED FOR LOW LITERACY) */}
      <div className="grid grid-cols-2 gap-2 mt-1 pt-2 border-t border-slate-100">
        
        {/* CALL BUTTON (BRIGHT GREEN) */}
        <a
          href={`tel:${worker.phone}`}
          className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-emerald-700 transition-transform"
        >
          <Phone className="w-5 h-5 fill-white stroke-[2]" />
          <div className="flex flex-col items-start leading-none">
            <span>कॉल करें (CALL)</span>
            <span className="text-[10px] opacity-90 font-mono mt-0.5">{worker.phone}</span>
          </div>
        </a>

        {/* WHATSAPP BUTTON (BRIGHT GREEN CHAT) */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-green-600 hover:bg-green-700 active:scale-95 text-white py-3 px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md border border-green-700 transition-transform"
        >
          <MessageCircle className="w-5 h-5 fill-white stroke-[2]" />
          <div className="flex flex-col items-start leading-none">
            <span>व्हाट्सएप (CHAT)</span>
            <span className="text-[10px] opacity-90 font-normal mt-0.5">डायरेक्ट मैसेज</span>
          </div>
        </a>

      </div>

      {/* DIGITAL VISITING CARD MODAL FOR THIS WORKER */}
      {isCardModalOpen && (
        <VisitingCardModal
          worker={worker}
          isOpen={isCardModalOpen}
          onClose={() => setIsCardModalOpen(false)}
        />
      )}

    </div>
  );
}
