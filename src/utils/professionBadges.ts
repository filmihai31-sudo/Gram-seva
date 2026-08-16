export interface ProfessionBadge {
  id: string;
  hindiTitle: string;
  englishTitle: string;
  badgeClass: string;
  borderClass: string;
  iconEmoji: string;
  iconType: 'scale' | 'stethoscope' | 'sweets' | 'wrench' | 'hammer' | 'scissors' | 'store' | 'sparkles' | 'building';
  tagline: string;
  description: string;
}

export function getProfessionBadge(category: string, customCategory?: string): ProfessionBadge {
  const cat = (category || '').toLowerCase();
  const custom = (customCategory || '').toLowerCase();
  const combined = `${cat} ${custom}`;

  // 1. Lawyer / Advocate
  if (
    combined.includes('law') ||
    combined.includes('advocate') ||
    combined.includes('vakeel') ||
    combined.includes('वकील') ||
    combined.includes('कचहरी') ||
    combined.includes('लीगल') ||
    combined.includes('court')
  ) {
    return {
      id: 'lawyer',
      hindiTitle: '⚖️ अधिवक्ता / लीगल एडवाइज़र',
      englishTitle: 'Advocate & Legal Advisor (Bar Council)',
      badgeClass: 'bg-slate-900 text-amber-300 border-amber-400 shadow-sm',
      borderClass: 'border-amber-400',
      iconEmoji: '⚖️',
      iconType: 'scale',
      tagline: 'न्यायालय, वकालत व विधिक परामर्श विशेषज्ञ',
      description: 'बार काउंसिल पंजीकृत अधिवक्ता • न्यायालय कार्य, शपथ पत्र, अनुबंध व कानूनी सलाह'
    };
  }

  // 2. Doctor / Clinic / Healthcare
  if (
    combined.includes('doctor') ||
    combined.includes('clinic') ||
    combined.includes('medical') ||
    combined.includes('health') ||
    combined.includes('डॉक्टर') ||
    combined.includes('क्लीनिक') ||
    combined.includes('वैद्य') ||
    combined.includes('अस्पताल') ||
    combined.includes('दवा')
  ) {
    return {
      id: 'doctor',
      hindiTitle: '🩺 प्रमाणित चिकित्सक / मेडिकल केयर',
      englishTitle: 'Certified Medical Care & Clinic',
      badgeClass: 'bg-emerald-900 text-emerald-100 border-emerald-400 shadow-sm',
      borderClass: 'border-emerald-400',
      iconEmoji: '🩺',
      iconType: 'stethoscope',
      tagline: 'प्राथमिक उपचार, परामर्श व स्वास्थ्य सेवाएं',
      description: 'अनुभवी चिकित्सक • सामान्य रोग निदान, प्राथमिक चिकित्सा व आपातकालीन स्वास्थ्य सेवा'
    };
  }

  // 3. Halwai / Sweets / Cook / Catering
  if (
    combined.includes('halwai') ||
    combined.includes('sweet') ||
    combined.includes('cook') ||
    combined.includes('cater') ||
    combined.includes('हलवाई') ||
    combined.includes('मिठाई') ||
    combined.includes('बावर्ची') ||
    combined.includes('स्वीट्स') ||
    combined.includes('मावा') ||
    combined.includes('रसोई')
  ) {
    return {
      id: 'halwai',
      hindiTitle: '🍯 शुद्ध देशी घी व मिष्ठान निर्माता',
      englishTitle: 'Master Halwai & Traditional Sweets',
      badgeClass: 'bg-amber-600 text-amber-50 border-amber-300 shadow-sm',
      borderClass: 'border-amber-300',
      iconEmoji: '🍯',
      iconType: 'sweets',
      tagline: 'शुद्ध पारंपरिक मिठाई व शादी-उत्सव कैटरिंग',
      description: 'शुद्ध देशी घी मिष्ठान, नमकीन, शादी-ब्याह व उत्सवों के लिए विशेष कैटरिंग व हलवाई सेवाएं'
    };
  }

  // 4. Mechanics / Electricians / Plumbers / Solar Pump / Technical
  if (
    combined.includes('mechanic') ||
    combined.includes('electrician') ||
    combined.includes('plumber') ||
    combined.includes('solar') ||
    combined.includes('मिस्त्री') ||
    combined.includes('इलेक्ट्रीशियन') ||
    combined.includes('प्लंबर') ||
    combined.includes('पंप') ||
    combined.includes('मोटर') ||
    combined.includes('वायरिंग') ||
    combined.includes('रिपेयर')
  ) {
    return {
      id: 'mechanic',
      hindiTitle: '🔧 कुशल व अनुभवी तकनीकी विशेषज्ञ',
      englishTitle: 'Master Technical Specialist (Tools & Repair)',
      badgeClass: 'bg-blue-900 text-blue-100 border-blue-300 shadow-sm',
      borderClass: 'border-blue-300',
      iconEmoji: '🔧',
      iconType: 'wrench',
      tagline: 'फास्ट फॉल्ट रिपेयर, वायरिंग व तकनीकी फिटिंग',
      description: 'अनुभवी मिस्त्री • मोटर, स्टार्टर, हाउस वायरिंग, पाइपलाइन फिटिंग व त्वरित तकनीकी समाधान'
    };
  }

  // 5. Carpenter / Woodcraft / Furniture
  if (
    combined.includes('carpenter') ||
    combined.includes('furniture') ||
    combined.includes('wood') ||
    combined.includes('बढ़ई') ||
    combined.includes('फर्नीचर') ||
    combined.includes('लकड़ी')
  ) {
    return {
      id: 'carpenter',
      hindiTitle: '🪚 काष्ठशिल्प व फर्नीचर विशेषज्ञ',
      englishTitle: 'Master Woodcraft & Custom Furniture',
      badgeClass: 'bg-amber-800 text-amber-100 border-amber-400 shadow-sm',
      borderClass: 'border-amber-400',
      iconEmoji: '🪚',
      iconType: 'hammer',
      tagline: 'मजबूत लकड़ी फर्नीचर व गृह निर्माण काष्ठ कार्य',
      description: 'कस्टम फर्नीचर, दरवाजे, खिड़की, मॉड्यूलर किचन व काष्ठ शिल्प का उत्तम निर्माण'
    };
  }

  // 6. Tailor / Designer
  if (
    combined.includes('tailor') ||
    combined.includes('cloth') ||
    combined.includes('dress') ||
    combined.includes('दर्जी') ||
    combined.includes('टेलर') ||
    combined.includes('सिलाई') ||
    combined.includes('कपड़ा')
  ) {
    return {
      id: 'tailor',
      hindiTitle: '✂️ मास्टर टेलर व वस्त्र डिज़ाइनर',
      englishTitle: 'Master Tailor & Boutique Designer',
      badgeClass: 'bg-purple-900 text-purple-100 border-purple-300 shadow-sm',
      borderClass: 'border-purple-300',
      iconEmoji: '✂️',
      iconType: 'scissors',
      tagline: 'परफेक्ट फिटिंग, आधुनिक व पारंपरिक परिधान',
      description: 'लेडीज व जेंट्स परिधान सिलाई, सूट, कुर्ता, लहंगा व आधुनिक डिजाइनिंग'
    };
  }

  // 7. Building Material / Construction / Brick
  if (
    combined.includes('building') ||
    combined.includes('brick') ||
    combined.includes('cement') ||
    combined.includes('ईंट') ||
    combined.includes('सीमेंट') ||
    combined.includes('रेत') ||
    combined.includes('बजरी')
  ) {
    return {
      id: 'building_material',
      hindiTitle: '🧱 उत्तम भवन निर्माण सामग्री सप्लायर',
      englishTitle: 'Building Materials & Hardware Supplier',
      badgeClass: 'bg-stone-800 text-amber-200 border-stone-500 shadow-sm',
      borderClass: 'border-stone-500',
      iconEmoji: '🧱',
      iconType: 'building',
      tagline: 'अवल ईंट, सीमेंट, रोड़ी, बजरी व सरिया सप्लाई',
      description: 'मकान निर्माण की समस्त सामग्री, उचित सरकारी नाप-तौल व सुरक्षित होम डिलीवरी'
    };
  }

  // 8. Kirana / Super Store / Grocery
  if (
    combined.includes('kirana') ||
    combined.includes('store') ||
    combined.includes('grocery') ||
    combined.includes('किराना') ||
    combined.includes('जनरल') ||
    combined.includes('दुकान')
  ) {
    return {
      id: 'kirana',
      hindiTitle: '🌾 शुद्ध किराना व दैनिक सामग्री भंडार',
      englishTitle: 'Daily Essentials & Quality Grocery',
      badgeClass: 'bg-emerald-800 text-emerald-100 border-emerald-300 shadow-sm',
      borderClass: 'border-emerald-300',
      iconEmoji: '🌾',
      iconType: 'store',
      tagline: 'उच्च गुणवत्ता दैनिक राशन व घरेलू सामग्री',
      description: 'ताजा व शुद्ध किराना सामग्री, पैकेज्ड फूड्स, तेल, मसाले व रोजमर्रा की जरूरतें'
    };
  }

  // Default / Generic Verified Business
  return {
    id: 'general',
    hindiTitle: '⭐ प्रमाणित ग्राम सेवा प्रतिष्ठान',
    englishTitle: 'Verified Village Service Establishment',
    badgeClass: 'bg-slate-800 text-slate-100 border-slate-400 shadow-sm',
    borderClass: 'border-slate-400',
    iconEmoji: '⭐',
    iconType: 'sparkles',
    tagline: 'विश्वसनीय ग्रामीण सेवा व उत्कृष्ट ग्राहक अनुभव',
    description: 'गाँव में विश्वसनीय सेवा, उचित दर व कुशल अनुभव'
  };
}
