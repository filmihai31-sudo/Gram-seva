import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Lazy initialize Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getGeminiAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// In-Memory database cache for registered businesses
let inMemoryBusinesses: any[] = [];

// Popular Category mappings for fast robust extraction
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'वकील': ['वकील', 'advocate', 'lawyer', 'vakeel', 'कानून', 'कोर्ट', 'अधिवक्ता', 'नोटरी', 'legal', 'bar council'],
  'मैकेनिक': ['मैकेनिक', 'mechanic', 'गाड़ी रिपेयर', 'गैरेज', 'garage', 'auto repair', 'bike repair', 'कार मिस्त्री', 'मोटर मैकेनिक', 'मिस्त्री'],
  'डॉक्टर': ['डॉक्टर', 'doctor', 'चिकित्सक', 'clinic', 'क्लीनिक', 'अस्पताल', 'hospital', 'वैद्य', 'दवा', 'mbbs', 'bams'],
  'इलेक्ट्रीशियन': ['इलेक्ट्रीशियन', 'electrician', 'बिजली मिस्त्री', 'वायरिंग', 'wiring', 'solar', 'सोलर', 'inverter', 'लाइट फिटिंग'],
  'हलवाई': ['हलवाई', 'halwai', 'मिठाई', 'sweet', 'caterer', 'कैटरिंग', 'खानपान', 'बावर्ची', 'mithai', 'रसोईया'],
  'दर्जी': ['दर्जी', 'tailor', 'सिलाई', 'बुटीक', 'boutique', 'कपड़ा सिलाई', 'silai', 'सूट'],
  'राजमिस्त्री': ['राजमिस्त्री', 'mason', 'मकान ठेकेदार', 'construction', 'बिल्डिंग', 'सीमेंट', 'ठेकेदार', 'प्लंबर', 'नलसाज'],
  'शिक्षक': ['शिक्षक', 'teacher', 'ट्यूशन', 'tuition', 'कोचिंग', 'coaching', 'अध्यापक', 'स्कूल', 'tutor'],
  'किराना': ['किराना', 'kirana', 'grocery', 'जनरल स्टोर', 'general store', 'राशन', 'दुकान'],
  'सैलून': ['सैलून', 'salon', 'ब्यूटी पार्लर', 'parlour', 'नाई', 'hair cut', 'मेकअप', 'कटिंग'],
  'ड्राइवर': ['ड्राइवर', 'driver', 'टैक्सी', 'taxi', 'गाड़ी', 'transport', 'ऑटो', 'लोडर', 'पिकअप'],
  'किसान सेवा': ['किसान', 'farmer', 'खाद', 'बीज', 'agriculture', 'tractor', 'ट्रैक्टर', 'दवा']
};

/**
 * Heuristic fallback NLP extractor for Category & Location
 */
function extractCategoryAndLocationLocally(rawText: string): { category: string | null; location: string | null } {
  const text = (rawText || '').trim().toLowerCase();

  // 1. Extract Category
  let extractedCategory: string | null = null;
  for (const [catName, synonyms] of Object.entries(CATEGORY_KEYWORDS)) {
    if (synonyms.some((syn) => text.includes(syn.toLowerCase()))) {
      extractedCategory = catName;
      break;
    }
  }

  // 2. Extract Location (District / Village / City)
  let extractedLocation: string | null = null;

  // Common Hindi location patterns:
  // "गाजियाबाद में", "गाजियाबाद के", "लखनऊ का", "मेरठ से", "in ghaziabad", "near varanasi"
  const locationRegexes = [
    /(?:in|at|near|from)\s+([a-zA-Z\u0900-\u097F\s]{2,20}?)(?:\s+(?:area|district|city|village|shop|me|ke|ka)|$)/i,
    /([a-zA-Z\u0900-\u097F]{2,25})\s*(?:में|के|का|की|जिला|ग्राम|तहसील|इलाके|शहर|पास)/i,
    /(?:जिला|ग्राम|शहर|कस्बा|तहसील)\s*([a-zA-Z\u0900-\u097F]{2,25})/i
  ];

  for (const regex of locationRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const candidate = match[1].trim();
      // Ensure candidate isn't one of the category words or helper words
      const isNoise = ['मुझे', 'चाहिए', 'ढूंढ', 'सर्च', 'बताओ', 'खोज', 'कोई', 'अच्छा', 'टॉप', 'सर्वश्रेष्ठ', 'vakeel', 'doctor', 'वकील', 'डॉक्टर', 'मैकेनिक'].includes(candidate.toLowerCase());
      if (!isNoise && candidate.length > 1) {
        extractedLocation = candidate.charAt(0).toUpperCase() + candidate.slice(1);
        break;
      }
    }
  }

  return { category: extractedCategory, location: extractedLocation };
}

// -------------------------------------------------------------
// 1. API: Health Check
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// -------------------------------------------------------------
// 2. API: Conversational AI Voice/Text Search Handler
// -------------------------------------------------------------
app.post('/api/ai-search', async (req, res) => {
  try {
    const { query, currentDistrict, currentCategory, conversationHistory, allWorkers } = req.body;
    const userQuery = (query || '').trim();

    if (!userQuery && !currentCategory && !currentDistrict) {
      return res.json({
        extractedCategory: null,
        extractedLocation: null,
        isClarificationNeeded: true,
        clarificationMessage: 'जी, आप किस जिले में और कौन सी सेवा ढूंढ रहे हैं? (जैसे: "गाजियाबाद में वकील" या "लखनऊ में मैकेनिक")',
        voiceResponseHindi: 'जी, आप किस जिले में और कौन सी सेवा ढूंढ रहे हैं?',
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      });
    }

    let detectedCategory: string | null = currentCategory || null;
    let detectedLocation: string | null = currentDistrict || null;

    // Use Gemini 3.7 Flash on Server if available
    const ai = getGeminiAi();
    if (ai) {
      try {
        const prompt = `You are the AI brain of "Gram Seva" (a rural local business directory in India).
Analyze the user's voice search or query: "${userQuery}".
Context history: ${JSON.stringify(conversationHistory || [])}
Pre-existing context: Category="${currentCategory || ''}", Location="${currentDistrict || ''}".

Extract:
1. "category": Profession or service (e.g., वकील, डॉक्टर, मैकेनिक, इलेक्ट्रीशियन, हलवाई, दर्जी, राजमिस्त्री, शिक्षक, किराना, ड्राइवर, किसान सेवा). Normalize to standard Hindi profession or English if ambiguous. Return null if none detected.
2. "location": District, city, village, town, or area mentioned dynamically by the user (e.g. गाजियाबाद, Ghaziabad, लखनऊ, मेरठ, वाराणसी, गोरखपुर, etc.). Return null if none detected.

Output strictly as a JSON object with keys:
{
  "category": string or null,
  "location": string or null
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const textOutput = response.text || '{}';
        const parsed = JSON.parse(textOutput);
        if (parsed.category) detectedCategory = parsed.category;
        if (parsed.location) detectedLocation = parsed.location;
      } catch (geminiErr) {
        console.warn('Gemini extraction fallback:', geminiErr);
        const fallback = extractCategoryAndLocationLocally(userQuery);
        if (!detectedCategory && fallback.category) detectedCategory = fallback.category;
        if (!detectedLocation && fallback.location) detectedLocation = fallback.location;
      }
    } else {
      // Local Heuristic Fallback
      const fallback = extractCategoryAndLocationLocally(userQuery);
      if (!detectedCategory && fallback.category) detectedCategory = fallback.category;
      if (!detectedLocation && fallback.location) detectedLocation = fallback.location;
    }

    // ---------------------------------------------------------
    // Conversational Missing Intent Rules:
    // Rule a: If Category is missing -> Ask polite human clarification
    // Rule b: If Location is missing -> "आप किस जिले के [Category] को ढूंढ रहे हैं?"
    // ---------------------------------------------------------
    if (!detectedCategory && !detectedLocation) {
      return res.json({
        extractedCategory: null,
        extractedLocation: null,
        isClarificationNeeded: true,
        missingField: 'both',
        clarificationMessage: 'जी, आप किस जिले में और कौन सी सेवा या कारीगर को ढूंढ रहे हैं? (जैसे: "गाजियाबाद में वकील")',
        voiceResponseHindi: 'जी, आप किस जिले में और कौन सी सेवा या कारीगर को ढूंढ रहे हैं?',
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      });
    }

    if (detectedCategory && !detectedLocation) {
      const askLocationMessage = `आप किस जिले के ${detectedCategory} को ढूंढ रहे हैं?`;
      return res.json({
        extractedCategory: detectedCategory,
        extractedLocation: null,
        isClarificationNeeded: true,
        missingField: 'location',
        clarificationMessage: askLocationMessage,
        voiceResponseHindi: askLocationMessage,
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      });
    }

    if (!detectedCategory && detectedLocation) {
      const askCategoryMessage = `आप ${detectedLocation} में किस प्रकार की सेवा या कारीगर को ढूंढ रहे हैं?`;
      return res.json({
        extractedCategory: null,
        extractedLocation: detectedLocation,
        isClarificationNeeded: true,
        missingField: 'category',
        clarificationMessage: askCategoryMessage,
        voiceResponseHindi: askCategoryMessage,
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      });
    }

    // Both Category and Location are present! Query database
    const workerPool = (Array.isArray(allWorkers) && allWorkers.length > 0)
      ? allWorkers
      : inMemoryBusinesses;

    const targetCat = (detectedCategory || '').toLowerCase();
    const targetLoc = (detectedLocation || '').toLowerCase();

    // Filter matching workers
    const matched = workerPool.filter((w: any) => {
      const catText = `${w.category || ''} ${w.customCategory || ''} ${w.hindiName || ''} ${(w.skills || []).join(' ')}`.toLowerCase();
      const locText = `${w.district || ''} ${w.village || ''} ${w.state || ''} ${w.landmark || ''} ${w.mapAddress || ''}`.toLowerCase();

      // Check category match
      const isCatMatch = catText.includes(targetCat) || (CATEGORY_KEYWORDS[detectedCategory!] || []).some(k => catText.includes(k.toLowerCase()));
      // Check location match dynamically
      const isLocMatch = locText.includes(targetLoc) || targetLoc.includes((w.district || '').toLowerCase()) || targetLoc.includes((w.village || '').toLowerCase());

      return isCatMatch && isLocMatch;
    });

    // ---------------------------------------------------------
    // Smart Sorting:
    // Priority 1: Paid PRO members (isPaid: true) sorted by Highest Rating
    // Priority 2: Free members (isPaid: false) sorted by Highest Rating
    // Priority 3: All other listings
    // ---------------------------------------------------------
    const paidPros = matched.filter((w: any) => Boolean(w.isPaid));
    const freeMembers = matched.filter((w: any) => !w.isPaid);

    paidPros.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0) || (b.jobsDone || 0) - (a.jobsDone || 0));
    freeMembers.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0) || (b.jobsDone || 0) - (a.jobsDone || 0));

    const sortedResults = [...paidPros, ...freeMembers];

    // Handle Empty Results Gracefully
    if (sortedResults.length === 0) {
      const emptyMsg = `क्षमा करें, इस इलाके में अभी कोई ${detectedCategory} रजिस्टर्ड नहीं है।`;
      return res.json({
        extractedCategory: detectedCategory,
        extractedLocation: detectedLocation,
        isClarificationNeeded: false,
        clarificationMessage: emptyMsg,
        voiceResponseHindi: emptyMsg,
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      });
    }

    // Natural Human-like Voice Response String
    const voiceMsg = `जी, ${detectedLocation} के टॉप ${detectedCategory} ये रहे:`;

    return res.json({
      extractedCategory: detectedCategory,
      extractedLocation: detectedLocation,
      isClarificationNeeded: false,
      clarificationMessage: `${sortedResults.length} सत्यापित ${detectedCategory} मिले`,
      voiceResponseHindi: voiceMsg,
      resultsCount: sortedResults.length,
      workers: sortedResults,
      appliedSorting: 'pro_first_then_rating'
    });

  } catch (error) {
    console.error('Error in /api/ai-search:', error);
    return res.status(500).json({
      error: 'Internal server error in conversational AI search',
      details: String(error)
    });
  }
});

// -------------------------------------------------------------
// 3. API: Self-Service Business Registration
// -------------------------------------------------------------
app.post('/api/register-business', (req, res) => {
  try {
    const data = req.body;

    // Required field validation
    if (!data.name || !data.name.trim()) {
      return res.status(400).json({ error: 'मालिक का नाम अनिवार्य है (Name is required)' });
    }
    if (!data.category || !data.category.trim()) {
      return res.status(400).json({ error: 'व्यवसाय श्रेणी अनिवार्य है (Category is required)' });
    }
    if (!data.district || !data.district.trim()) {
      return res.status(400).json({ error: 'जिला अनिवार्य है (District is required)' });
    }
    if (!data.village || !data.village.trim()) {
      return res.status(400).json({ error: 'ग्राम/कस्बा अनिवार्य है (Village is required)' });
    }
    if (!data.phone || !/^\d{10}$/.test(data.phone.trim().replace(/\D/g, ''))) {
      return res.status(400).json({ error: '10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Valid 10-digit phone required)' });
    }

    const cleanPhone = data.phone.trim().replace(/\D/g, '');
    const cleanWhatsapp = (data.whatsapp || cleanPhone).trim().replace(/\D/g, '');

    const newWorker = {
      id: `business_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name.trim(),
      shopName: (data.shopName || data.name).trim(),
      hindiName: (data.shopName || data.name).trim(),
      category: data.category.trim(),
      customCategory: (data.customCategory || data.category).trim(),
      phone: cleanPhone,
      whatsapp: cleanWhatsapp,
      district: data.district.trim(),
      village: data.village.trim(),
      landmark: (data.landmark || '').trim(),
      state: (data.state || 'उत्तर प्रदेश').trim(),
      mapAddress: `${data.village.trim()}, ${data.landmark ? data.landmark.trim() + ', ' : ''}${data.district.trim()}, ${data.state || 'उत्तर प्रदेश'}`,
      avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80',
      documentPhotoUrl: data.documentPhotoUrl || '',
      charges: (data.charges || 'उचित रेट').trim(),
      rating: 5.0,
      jobsDone: 1,
      experienceYears: Number(data.experienceYears) || 3,
      isVerified: true,
      verificationStatus: 'approved',
      isPaid: Boolean(data.isPaid),
      planType: data.isPaid ? 'pro' : 'free',
      skills: Array.isArray(data.skills) ? data.skills : ['विश्वसनीय सेवा', 'समय पर काम', 'सत्यापित कारीगर'],
      bio: (data.bio || 'ग्राम सेवा प्रमाणित व्यवसाय').trim(),
      reviewsCount: 1,
      viewsCount: 12,
      submittedAt: Date.now()
    };

    // Store in memory
    inMemoryBusinesses = [newWorker, ...inMemoryBusinesses];

    return res.json({
      success: true,
      message: 'व्यवसाय सफलतापूर्वक पंजीकृत हो गया है!',
      worker: newWorker
    });
  } catch (error) {
    console.error('Error in /api/register-business:', error);
    return res.status(500).json({ error: 'पंजीकरण में त्रुटि हुई', details: String(error) });
  }
});

// -------------------------------------------------------------
// 4. API: Get all businesses
// -------------------------------------------------------------
app.get('/api/businesses', (req, res) => {
  res.json({ count: inMemoryBusinesses.length, businesses: inMemoryBusinesses });
});

// -------------------------------------------------------------
// 5. Vite & Static Asset Handling
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Gram Seva Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
