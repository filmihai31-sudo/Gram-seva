import React, { useState } from 'react';
import {
  X,
  Store,
  User,
  Phone,
  MapPin,
  Camera,
  Upload,
  Crown,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  Award,
  Clock,
  IndianRupee,
  Navigation
} from 'lucide-react';
import { WorkerService, AddBusinessFormData } from '../types';
import { compressImageFile } from '../utils/imageCompression';

interface AddBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBusinessAdded: (worker: WorkerService) => void;
  initialDistrict?: string;
  initialVillage?: string;
  initialCategory?: string;
}

const POPULAR_PROFESSIONS = [
  { id: 'वकील', label: 'वकील / Advocate', icon: '⚖️', desc: 'कानूनी सलाह, कोर्ट व नोटरी' },
  { id: 'मैकेनिक', label: 'मैकेनिक / Garage', icon: '🔧', desc: 'बाइक, कार, ट्रैक्टर रिपेयर' },
  { id: 'डॉक्टर', label: 'डॉक्टर / Clinic', icon: '🩺', desc: 'प्राथमिक उपचार, क्लीनिक व दवा' },
  { id: 'इलेक्ट्रीशियन', label: 'इलेक्ट्रीशियन / Electrician', icon: '⚡', desc: 'वायरिंग, सोलर व इन्वर्टर' },
  { id: 'हलवाई', label: 'हलवाई / Sweets & Caterers', icon: '🍯', desc: 'मिठाई, शादी पार्टी कैटरिंग' },
  { id: 'दर्जी', label: 'दर्जी / Tailor Boutique', icon: '✂️', desc: 'सूट, कुर्ता व लेडीज सिलाई' },
  { id: 'राजमिस्त्री', label: 'राजमिस्त्री / Mason', icon: '🏗️', desc: 'मकान निर्माण व ठेकेदारी' },
  { id: 'शिक्षक', label: 'शिक्षक / Tutor', icon: '📚', desc: 'कोचिंग, होम ट्यूशन व स्कूल' },
  { id: 'किराना', label: 'किराना / Grocery', icon: '🛒', desc: 'दैनिक सामान व राशन स्टोर' },
  { id: 'सैलून', label: 'सैलून / Beauty Parlour', icon: '💇', desc: 'हेयर कटिंग, मेकअप व ब्यूटी' },
  { id: 'ड्राइवर', label: 'ड्राइवर / Taxi & Transport', icon: '🚗', desc: '24x7 टैक्सी व माल ढुलाई' },
  { id: 'किसान सेवा', label: 'किसान सेवा / Agriculture', icon: '🌾', desc: 'खाद, बीज, बोरिंग व दवा' }
];

const SUGGESTED_DISTRICTS = [
  'गाजियाबाद',
  'लखनऊ',
  'मेरठ',
  'वाराणसी',
  'कानपुर नगर',
  'आगरा',
  'प्रयागराज',
  'अलीगढ़',
  'गोरखपुर',
  'बरेली',
  'मुरादाबाद',
  'सहारनपुर',
  'बुलंदशहर',
  'हापुड़',
  'गौतम बुद्ध नगर (नोएडा)',
  'मथुरा',
  'अयोध्या',
  'झांसी'
];

export const AddBusinessModal: React.FC<AddBusinessModalProps> = ({
  isOpen,
  onClose,
  onBusinessAdded,
  initialDistrict = '',
  initialVillage = '',
  initialCategory = ''
}) => {
  const [formData, setFormData] = useState<AddBusinessFormData>({
    name: '',
    shopName: '',
    category: initialCategory || 'वकील',
    customCategory: '',
    district: initialDistrict || 'गाजियाबाद',
    village: initialVillage || '',
    landmark: '',
    phone: '',
    whatsapp: '',
    charges: 'उचित रेट (परामर्श शुल्क लागू)',
    experienceYears: 5,
    bio: '',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
    documentPhotoUrl: '',
    isPaid: true, // Default to PRO with highest ranking benefits
    skills: []
  });

  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string>(formData.avatarUrl);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await compressImageFile(file, 600, 0.8);
      setPhotoPreview(result.dataUrl);
      setFormData((prev) => ({ ...prev, avatarUrl: result.dataUrl }));
    } catch (err) {
      console.warn('Image compression error, using direct FileReader:', err);
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const res = loadEvt.target?.result as string;
        setPhotoPreview(res);
        setFormData((prev) => ({ ...prev, avatarUrl: res }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMsg('कृपया मालिक / पेशेवर का नाम दर्ज करें (Name is required)');
      return;
    }
    const finalCategory = isCustomCategory && formData.customCategory?.trim()
      ? formData.customCategory.trim()
      : formData.category;

    if (!finalCategory) {
      setErrorMsg('कृपया व्यवसाय श्रेणी चुनें या दर्ज करें (Category is required)');
      return;
    }
    if (!formData.district.trim()) {
      setErrorMsg('कृपया जिला दर्ज करें (District is required)');
      return;
    }
    if (!formData.village.trim()) {
      setErrorMsg('कृपया ग्राम / कस्बा / क्षेत्र दर्ज करें (Village/Area is required)');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setErrorMsg('कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें (Valid 10-digit mobile number required)');
      return;
    }

    setIsSubmitting(true);

    const newWorker: WorkerService = {
      id: `worker_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: formData.name.trim(),
      shopName: formData.shopName.trim() || formData.name.trim(),
      hindiName: formData.shopName.trim() || formData.name.trim(),
      category: finalCategory,
      customCategory: isCustomCategory ? formData.customCategory : finalCategory,
      phone: cleanPhone,
      whatsapp: formData.whatsapp.trim().replace(/\D/g, '') || cleanPhone,
      district: formData.district.trim(),
      village: formData.village.trim(),
      landmark: formData.landmark.trim(),
      state: 'उत्तर प्रदेश',
      rating: 5.0,
      jobsDone: formData.isPaid ? 18 : 6,
      experienceYears: Number(formData.experienceYears) || 3,
      isVerified: true,
      isPaid: Boolean(formData.isPaid),
      planType: formData.isPaid ? 'pro' : 'free',
      verificationStatus: 'approved',
      avatarUrl: photoPreview,
      charges: formData.charges.trim() || 'उचित रेट',
      skills: [
        'सत्यापित स्थानीय सेवा',
        'त्वरित सहायता',
        finalCategory
      ],
      mapAddress: `${formData.village.trim()}, ${formData.landmark ? formData.landmark.trim() + ', ' : ''}${formData.district.trim()}, उत्तर प्रदेश`,
      bio: formData.bio.trim() || `${formData.name} - ग्राम सेवा पर सत्यापित ${finalCategory}`,
      reviewsCount: formData.isPaid ? 12 : 3,
      viewsCount: 45,
      submittedAt: Date.now()
    };

    // 1. Submit to Backend API
    try {
      await fetch('/api/register-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newWorker,
          category: finalCategory
        })
      });
    } catch (apiErr) {
      console.warn('Backend API submission fallback:', apiErr);
    }

    // 2. Add to frontend state and storage
    onBusinessAdded(newWorker);

    setSuccessMsg('🎉 बधाई! आपका व्यवसाय ग्राम सेवा पर सफलतापूर्वक रजिस्टर हो गया है।');
    setIsSubmitting(false);

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-md">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                नया व्यवसाय / सेवा जोड़ें
                <span className="text-xs bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Self-Service
                </span>
              </h2>
              <p className="text-xs text-emerald-100">
                वकील, मैकेनिक, डॉक्टर, इलेक्ट्रीशियन या कोई भी सेवा कुछ ही सेकंड में रजिस्टर करें
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900/50 hover:bg-emerald-900 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-800 text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-700 flex items-center gap-2.5 text-xs sm:text-sm animate-shake">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Business Identity & Photo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-600 shadow-md bg-slate-200">
                <img
                  src={photoPreview}
                  alt="Business Preview"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/40 hover:bg-black/55 text-white flex flex-col items-center justify-center cursor-pointer transition-colors">
                  <Camera className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">फोटो बदलें</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 font-medium">दुकान / प्रोफाइल फोटो</span>
            </div>

            <div className="sm:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  मालिक / पेशेवर का नाम <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="उदा. एडवोकेट राहुल शर्मा / डॉ. सुनील वर्मा"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  दुकान / फर्म / चेम्बर का नाम
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="उदा. राहुल लॉ चेम्बर्स / शर्मा ऑटो गैरेज"
                    value={formData.shopName}
                    onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Profession Category Selection with Auto-Suggestion */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>व्यवसाय श्रेणी (Profession Category) <span className="text-rose-500">*</span></span>
              <button
                type="button"
                onClick={() => setIsCustomCategory(!isCustomCategory)}
                className="text-xs text-emerald-700 font-semibold underline hover:text-emerald-900"
              >
                {isCustomCategory ? 'लोकप्रिय सूची से चुनें' : '+ अन्य श्रेणी लिखें'}
              </button>
            </label>

            {!isCustomCategory ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {POPULAR_PROFESSIONS.map((prof) => {
                  const isSelected = formData.category === prof.id;
                  return (
                    <button
                      key={prof.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: prof.id })}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-900 font-bold'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">{prof.icon}</span>
                      <span className="text-xs leading-tight truncate">{prof.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="उदा. वकील, होम्योपैथिक डॉक्टर, ट्रैक्टर मिस्त्री, फोटोग्राफर"
                  value={formData.customCategory}
                  onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                />
              </div>
            )}
          </div>

          {/* Section 3: Location (District, Village, Landmark) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-700" /> कार्य क्षेत्र व पता (Work Location)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  जिला (District) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  list="district-suggestions"
                  placeholder="उदा. गाजियाबाद, लखनऊ, मेरठ"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600"
                />
                <datalist id="district-suggestions">
                  {SUGGESTED_DISTRICTS.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  ग्राम / कस्बा / मोहल्ला (Village / Area) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. गोविंदपुरम / सदर बाजार / मोदीनगर"
                  value={formData.village}
                  onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                लैंडमार्क / कार्यस्थल का पता (Landmark / Street)
              </label>
              <input
                type="text"
                placeholder="उदा. तहसील गेट के पास, मुख्य चौराहा, जिला कोर्ट रोड"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Section 4: Contact & Professional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                मोबाइल नंबर (10 Digit Phone) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-xs font-bold text-slate-500">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: clean });
                  }}
                  className="w-full pl-12 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                अनुभव (Experience in Years)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Plan Selection (Smart Sorting Priority Benefit) */}
          <div className="p-4 rounded-xl border-2 transition-all bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-yellow-500/10 border-amber-400">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Crown className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    PRO Verified Member (Priority 1 Listing)
                    <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
                      TOP RANKING
                    </span>
                  </h4>
                  <p className="text-xs text-amber-900/90 mt-0.5">
                    AI सर्च और जिला खोज में सबसे ऊपर दिखें + गोल्ड रेटिंग बैज + तुरंत अधिक ग्राहक कॉल
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={formData.isPaid}
                  onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 px-4 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition-all disabled:opacity-75 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>रजिस्टर हो रहा है...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>अभी रजिस्टर करें (Submit)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
