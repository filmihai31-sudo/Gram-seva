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
