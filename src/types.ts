export interface WorkerService {
  id: string;
  name: string; // Owner / Professional Name
  shopName?: string; // Shop / Business / Firm Name
  hindiName: string;
  category: string;
  customCategory?: string;
  phone: string;
  whatsapp: string;
  village: string;
  district: string;
  state: string;
  landmark?: string;
  rating: number;
  jobsDone: number;
  experienceYears: number;
  isVerified: boolean;
  isPaid?: boolean; // Priority 1: Paid PRO Member
  planType?: 'free' | 'pro' | 'vip';
  verificationStatus?: 'approved' | 'pending' | 'rejected';
  idNumber?: string; // Govt ID / Aadhaar ID Number
  documentPhotoUrl?: string; // Shop Board / Certificate / ID photo
  avatarUrl: string;
  charges: string;
  skills: string[];
  mapAddress: string;
  lat?: number;
  lng?: number;
  reviewsCount?: number;
  viewsCount?: number;
  bio?: string;
  userTags?: string[];
  submittedAt?: number;
  password?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface AiSearchQuery {
  query: string;
  currentDistrict?: string;
  currentVillage?: string;
  currentCategory?: string;
  conversationHistory?: { role: 'user' | 'assistant'; text: string }[];
}

export interface AiSearchResult {
  extractedCategory: string | null;
  extractedLocation: string | null;
  isClarificationNeeded: boolean;
  clarificationMessage?: string;
  voiceResponseHindi: string;
  resultsCount: number;
  workers: WorkerService[];
  appliedSorting: 'pro_first_then_rating';
  missingField?: 'category' | 'location' | 'both';
  suggestedDistricts?: string[];
}

export interface AddBusinessFormData {
  name: string;
  shopName: string;
  category: string;
  customCategory?: string;
  district: string;
  village: string;
  landmark: string;
  phone: string;
  whatsapp: string;
  charges: string;
  experienceYears: number;
  bio: string;
  avatarUrl: string;
  documentPhotoUrl?: string;
  isPaid: boolean;
  skills: string[];
}

export interface NativeAdItem {
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

export interface BannerAdRequest {
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

export interface VideoAdItem {
  id: string;
  title: string;
  businessName: string;
  offerText: string;
  category: string;
  videoUrl: string;
  posterUrl: string;
  phone: string;
  whatsapp: string;
  location: string;
  badgeLabel?: string;
  discountTag?: string;
  isSponsoredLive?: boolean;
  expiresInText?: string;
}
