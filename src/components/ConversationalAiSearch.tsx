import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Search,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  MessageSquare,
  Award,
  Crown,
  CornerDownRight,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  Briefcase,
  AlertTriangle,
  Compass,
  CheckCircle2,
  X
} from 'lucide-react';
import { WorkerService, AiSearchResult } from '../types';
import { sortWorkersBySmartPriority } from '../utils/sortingAlgorithm';
import { getProfessionBadge } from '../utils/professionBadges';

interface ConversationalAiSearchProps {
  workers: WorkerService[];
  onSelectWorker: (worker: WorkerService) => void;
  onOpenAddBusiness: (district?: string, category?: string) => void;
  onOpenVisitingCard: (worker: WorkerService) => void;
}

const POPULAR_VOICE_QUERIES = [
  'गाजियाबाद में वकील चाहिए',
  'लखनऊ में टॉप डॉक्टर',
  'मेरठ में कार मैकेनिक',
  'वाराणसी में हलवाई कैटरिंग',
  'गाजियाबाद में इलेक्ट्रीशियन',
  'कानपुर में लेडीज बुटीक दर्जी'
];

const SUGGESTED_QUICK_DISTRICTS = [
  'गाजियाबाद',
  'लखनऊ',
  'मेरठ',
  'वाराणसी',
  'कानपुर नगर',
  'आगरा',
  'प्रयागराज',
  'अलीगढ़'
];

const POPULAR_QUICK_CATEGORIES = [
  'वकील',
  'मैकेनिक',
  'डॉक्टर',
  'इलेक्ट्रीशियन',
  'हलवाई',
  'दर्जी',
  'राजमिस्त्री',
  'शिक्षक'
];

export const ConversationalAiSearch: React.FC<ConversationalAiSearchProps> = ({
  workers,
  onSelectWorker,
  onOpenAddBusiness,
  onOpenVisitingCard
}) => {
  const [query, setQuery] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiSearchResult | null>(null);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [currentAssistantVoiceMsg, setCurrentAssistantVoiceMsg] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Web Speech API for Hindi
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechTranscript('सुन रहे हैं... बोलिए (Listening...)');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((r: any) => r[0].transcript)
          .join('');
        setSpeechTranscript(transcript);
        setQuery(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        setSpeechTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
        // If we captured a query, trigger AI search automatically
        if (query.trim()) {
          executeAiSearch(query.trim());
        }
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [query]);

  // Voice synthesis helper
  const speakTextInHindi = (text: string) => {
    if (isVoiceMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Try to find a Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang.includes('hi') || v.name.includes('Hindi') || v.lang.includes('IN'));
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  const toggleListening = () => {
    if (!speechSupported) {
      alert('आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है। कृपया टेक्स्ट बॉक्स में लिखें।');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setSpeechTranscript('');
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Speech recognition start failed:', e);
      }
    }
  };

  // Perform conversational AI search
  const executeAiSearch = async (
    searchQuery: string,
    overrideCategory?: string,
    overrideLocation?: string
  ) => {
    if (!searchQuery.trim() && !overrideCategory && !overrideLocation) return;

    setIsSearching(true);
    setCurrentAssistantVoiceMsg(null);

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          currentCategory: overrideCategory || aiResult?.extractedCategory,
          currentDistrict: overrideLocation || aiResult?.extractedLocation,
          allWorkers: workers
        })
      });

      if (response.ok) {
        const data: AiSearchResult = await response.json();
        
        // Ensure Smart Sorting is strictly applied:
        // Priority 1: isPaid: true with highest rating
        // Priority 2: isPaid: false with highest rating
        if (data.workers && Array.isArray(data.workers)) {
          data.workers = sortWorkersBySmartPriority(data.workers);
        }

        setAiResult(data);
        setCurrentAssistantVoiceMsg(data.voiceResponseHindi);
        speakTextInHindi(data.voiceResponseHindi);
      } else {
        throw new Error('API request failed');
      }
    } catch (err) {
      console.warn('Backend search failed, executing client-side intelligent fallback:', err);
      // Client-side AI fallback parser
      const fallbackResult = executeClientAiFallback(searchQuery, overrideCategory, overrideLocation);
      setAiResult(fallbackResult);
      setCurrentAssistantVoiceMsg(fallbackResult.voiceResponseHindi);
      speakTextInHindi(fallbackResult.voiceResponseHindi);
    } finally {
      setIsSearching(false);
    }
  };

  // Client-Side Intelligent Parser Fallback
  const executeClientAiFallback = (
    textQuery: string,
    overrideCat?: string,
    overrideLoc?: string
  ): AiSearchResult => {
    const text = (textQuery || '').toLowerCase();

    // 1. Detect Category
    let detectedCat: string | null = overrideCat || null;
    const catMap: Record<string, string[]> = {
      'वकील': ['वकील', 'advocate', 'lawyer', 'vakeel', 'कोर्ट', 'कानून'],
      'मैकेनिक': ['मैकेनिक', 'mechanic', 'गाड़ी', 'कार', 'बाइक', 'गैरेज', 'मिस्त्री'],
      'डॉक्टर': ['डॉक्टर', 'doctor', 'चिकित्सक', 'क्लीनिक', 'अस्पताल', 'clinic'],
      'इलेक्ट्रीशियन': ['इलेक्ट्रीशियन', 'electrician', 'बिजली', 'वायरिंग', 'सोलर'],
      'हलवाई': ['हलवाई', 'halwai', 'मिठाई', 'कैटरिंग', 'sweet', 'बावर्ची'],
      'दर्जी': ['दर्जी', 'tailor', 'सिलाई', 'बुटीक', 'सूट'],
      'राजमिस्त्री': ['राजमिस्त्री', 'mason', 'मकान', 'ठेकेदार', 'कंस्ट्रक्शन'],
      'शिक्षक': ['शिक्षक', 'teacher', 'ट्यूशन', 'कोचिंग', 'tuition'],
      'किराना': ['किराना', 'kirana', 'grocery', 'जनरल स्टोर', 'दुकान'],
      'सैलून': ['सैलून', 'salon', 'पार्लर', 'ब्यूटी', 'नाई'],
      'ड्राइवर': ['ड्राइवर', 'driver', 'टैक्सी', 'गाड़ी']
    };

    if (!detectedCat) {
      for (const [catName, keywords] of Object.entries(catMap)) {
        if (keywords.some((k) => text.includes(k))) {
          detectedCat = catName;
          break;
        }
      }
    }

    // 2. Detect Location (Any dynamic District or Village)
    let detectedLoc: string | null = overrideLoc || null;
    const commonDistricts = [
      'गाजियाबाद', 'ghaziabad',
      'लखनऊ', 'lucknow',
      'मेरठ', 'meerut',
      'वाराणसी', 'varanasi',
      'कानपुर', 'kanpur',
      'आगरा', 'agra',
      'प्रयागराज', 'prayagraj', 'allahabad',
      'अलीगढ़', 'aligarh',
      'गोरखपुर', 'gorakhpur',
      'बरेली', 'bareilly',
      'नोएडा', 'noida',
      'हापुड़', 'hapur',
      'बुलंदशहर', 'bulandshahr'
    ];

    if (!detectedLoc) {
      for (const d of commonDistricts) {
        if (text.includes(d.toLowerCase())) {
          detectedLoc = d.charAt(0).toUpperCase() + d.slice(1);
          break;
        }
      }

      // Regex heuristic for any other unlisted dynamic location
      if (!detectedLoc) {
        const locRegex = /([a-zA-Z\u0900-\u097F]{2,20})\s*(?:में|के|का|की|जिला|ग्राम|इलाके|शहर|पास)/i;
        const match = text.match(locRegex);
        if (match && match[1]) {
          const word = match[1].trim();
          if (!['मुझे', 'चाहिए', 'ढूंढ', 'सर्च', 'बताओ', 'खोज', 'कोई', 'अच्छा', 'वकील', 'डॉक्टर', 'मैकेनिक'].includes(word.toLowerCase())) {
            detectedLoc = word;
          }
        }
      }
    }

    // Missing clarification rules
    if (!detectedCat && !detectedLoc) {
      return {
        extractedCategory: null,
        extractedLocation: null,
        isClarificationNeeded: true,
        missingField: 'both',
        clarificationMessage: 'जी, आप किस जिले में और कौन सी सेवा ढूंढ रहे हैं?',
        voiceResponseHindi: 'जी, आप किस जिले में और कौन सी सेवा ढूंढ रहे हैं?',
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      };
    }

    if (detectedCat && !detectedLoc) {
      const msg = `आप किस जिले के ${detectedCat} को ढूंढ रहे हैं?`;
      return {
        extractedCategory: detectedCat,
        extractedLocation: null,
        isClarificationNeeded: true,
        missingField: 'location',
        clarificationMessage: msg,
        voiceResponseHindi: msg,
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      };
    }

    if (!detectedCat && detectedLoc) {
      const msg = `आप ${detectedLoc} में किस प्रकार की सेवा या कारीगर को ढूंढ रहे हैं?`;
      return {
        extractedCategory: null,
        extractedLocation: detectedLoc,
        isClarificationNeeded: true,
        missingField: 'category',
        clarificationMessage: msg,
        voiceResponseHindi: msg,
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      };
    }

    // Filter from workers pool
    const matched = workers.filter((w) => {
      const fullCat = `${w.category || ''} ${w.customCategory || ''} ${w.hindiName || ''}`.toLowerCase();
      const fullLoc = `${w.district || ''} ${w.village || ''} ${w.state || ''} ${w.mapAddress || ''}`.toLowerCase();

      const catMatches = fullCat.includes(detectedCat!.toLowerCase()) || (catMap[detectedCat!] || []).some(k => fullCat.includes(k));
      const locMatches = fullLoc.includes(detectedLoc!.toLowerCase());
      return catMatches && locMatches;
    });

    // Apply Smart Sorting
    const sorted = sortWorkersBySmartPriority(matched);

    if (sorted.length === 0) {
      const emptyMsg = `क्षमा करें, इस इलाके में अभी कोई ${detectedCat} रजिस्टर्ड नहीं है।`;
      return {
        extractedCategory: detectedCat,
        extractedLocation: detectedLoc,
        isClarificationNeeded: false,
        clarificationMessage: emptyMsg,
        voiceResponseHindi: emptyMsg,
        resultsCount: 0,
        workers: [],
        appliedSorting: 'pro_first_then_rating'
      };
    }

    const foundMsg = `जी, ${detectedLoc} के टॉप ${detectedCat} ये रहे:`;
    return {
      extractedCategory: detectedCat,
      extractedLocation: detectedLoc,
      isClarificationNeeded: false,
      clarificationMessage: `${sorted.length} सत्यापित ${detectedCat} उपलब्ध`,
      voiceResponseHindi: foundMsg,
      resultsCount: sorted.length,
      workers: sorted,
      appliedSorting: 'pro_first_then_rating'
    };
  };

  const handleClarificationDistrictClick = (districtName: string) => {
    executeAiSearch(query, aiResult?.extractedCategory || undefined, districtName);
  };

  const handleClarificationCategoryClick = (categoryName: string) => {
    executeAiSearch(query, categoryName, aiResult?.extractedLocation || undefined);
  };

  return (
    <div className="w-full space-y-4">
      {/* 1. Main Search Bar & Voice Microphone */}
      <div className="relative bg-white rounded-2xl shadow-lg border-2 border-emerald-500/30 p-2 sm:p-3 transition-all hover:border-emerald-500">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeAiSearch(query);
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-emerald-600 ml-2 mr-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="बोलकर या लिखकर खोजें (उदा. गाजियाबाद में वकील, मेरठ में मैकेनिक)"
              className="w-full py-2.5 text-sm sm:text-base text-slate-800 placeholder:text-slate-400 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setAiResult(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Voice Microphone Button with Pulsing Wave Aura */}
          <div className="relative shrink-0">
            {isListening && (
              <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping"></span>
            )}
            <button
              type="button"
              onClick={toggleListening}
              className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold transition-all shadow-md cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white shadow-rose-500/50 scale-105 animate-pulse'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-700/30 hover:scale-105'
              }`}
              title={isListening ? 'माइक बंद करें' : 'माइक से बोलें'}
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>

          {/* Submit Search Button */}
          <button
            type="submit"
            disabled={isSearching}
            className="hidden sm:flex px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm items-center gap-1.5 transition-colors cursor-pointer"
          >
            {isSearching ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400" />
            )}
            <span>AI सर्च</span>
          </button>
        </form>

        {/* Live Speech Recognition Feedback Bar */}
        {isListening && (
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs px-2">
            <div className="flex items-center gap-2 text-rose-600 font-semibold animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span>{speechTranscript || 'आपकी आवाज़ सुनी जा रही है... (Speak now in Hindi)'}</span>
            </div>
            <span className="text-[11px] text-slate-400">हिंदी / English सपोर्ट</span>
          </div>
        )}
      </div>

      {/* 2. Quick Popular Voice Prompt Chips */}
      {!aiResult && !isSearching && (
        <div className="space-y-1.5 px-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>लोकप्रिय बोलकर खोजें (Try asking):</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_VOICE_QUERIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuery(q);
                  executeAiSearch(q);
                }}
                className="text-xs bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>🎙️</span>
                <span>"{q}"</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Conversational AI Assistant Response Bubble */}
      {currentAssistantVoiceMsg && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-emerald-500/30 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                <Sparkles className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                    Gram Seva AI Assistant
                  </span>
                  <span className="text-[10px] bg-emerald-700/60 text-emerald-200 px-1.5 py-0.5 rounded font-mono">
                    Live
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                  {currentAssistantVoiceMsg}
                </h3>
              </div>
            </div>

            {/* Voice Audio Toggle Button */}
            <button
              type="button"
              onClick={() => {
                if (!isVoiceMuted) {
                  window.speechSynthesis?.cancel();
                } else {
                  speakTextInHindi(currentAssistantVoiceMsg);
                }
                setIsVoiceMuted(!isVoiceMuted);
              }}
              className={`p-2 rounded-xl border transition-colors ${
                isVoiceMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-emerald-800/80 border-emerald-500/50 text-amber-300 shadow-sm'
              }`}
              title={isVoiceMuted ? 'आवाज़ चालू करें' : 'आवाज़ म्यूट करें'}
            >
              {isVoiceMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 animate-bounce" />}
            </button>
          </div>

          {/* Clarification Chips if Location or Category is missing */}
          {aiResult?.isClarificationNeeded && (
            <div className="pt-2 border-t border-white/10 space-y-2">
              {aiResult.missingField === 'location' && (
                <div>
                  <p className="text-xs text-emerald-200 font-semibold mb-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>कृपया जिला चुनें (या बोलें):</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_QUICK_DISTRICTS.map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => handleClarificationDistrictClick(d)}
                        className="text-xs bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                      >
                        📍 {d}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {aiResult.missingField === 'category' && (
                <div>
                  <p className="text-xs text-emerald-200 font-semibold mb-2 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                    <span>कृपया सेवा / पेशा चुनें:</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_QUICK_CATEGORIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleClarificationCategoryClick(c)}
                        className="text-xs bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white border border-white/20 px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer"
                      >
                        ⚡ {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Search Results Display with Smart Sorting Priority Rule */}
      {aiResult && !aiResult.isClarificationNeeded && (
        <div className="space-y-4">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-800">
                सत्यापित परिणाम ({aiResult.workers.length})
              </span>
              <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600" />
                <span>Smart PRO Sorted</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => onOpenAddBusiness(aiResult.extractedLocation || undefined, aiResult.extractedCategory || undefined)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>व्यवसाय जोड़ें</span>
            </button>
          </div>

          {/* Results List */}
          {aiResult.workers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {aiResult.workers.map((worker, index) => {
                const isPro = Boolean(worker.isPaid);
                const badge = getProfessionBadge(worker.category, worker.customCategory);

                return (
                  <div
                    key={worker.id}
                    className={`relative rounded-2xl p-4 transition-all duration-200 border text-slate-800 shadow-md hover:shadow-lg flex flex-col justify-between ${
                      isPro
                        ? 'bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-amber-500/15 border-amber-400 ring-1 ring-amber-400/40'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Rank & Pro Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="flex items-center gap-2">
                        {isPro ? (
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                            <Crown className="w-3.5 h-3.5 fill-current" />
                            <span>PRIORITY PRO</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                            #{index + 1}
                          </span>
                        )}
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {worker.customCategory || worker.category}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-black text-xs shadow-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{worker.rating ? worker.rating.toFixed(1) : '5.0'}</span>
                      </div>
                    </div>

                    {/* Middle Info Row */}
                    <div className="flex items-start gap-3.5 my-1">
                      <img
                        src={worker.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=80'}
                        alt={worker.name}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shadow-sm shrink-0 bg-slate-100"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-base font-bold text-slate-900 leading-tight truncate">
                          {worker.shopName || worker.hindiName || worker.name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                          {worker.name}
                        </p>

                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {worker.village}, {worker.district}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-3 mt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenVisitingCard(worker)}
                        className="text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>🪪 विजिटिंग कार्ड</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={`https://wa.me/91${worker.whatsapp || worker.phone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-xs transition-colors"
                          title="व्हाट्सएप करें"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>

                        <a
                          href={`tel:${worker.phone}`}
                          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          <span>कॉल करें</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Graceful Empty State handling requested in prompt */
            <div className="bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-6 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-1.5">
                <h4 className="text-base font-bold text-amber-950">
                  {aiResult.voiceResponseHindi}
                </h4>
                <p className="text-xs text-amber-800">
                  क्या आप या आपका कोई परिचित {aiResult.extractedLocation} में यह सेवा प्रदान करते हैं?
                  ग्राम सेवा पर तुरंत अपना व्यवसाय रजिस्टर करें।
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAddBusiness(aiResult.extractedLocation || undefined, aiResult.extractedCategory || undefined)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>यहां {aiResult.extractedCategory || 'व्यवसाय'} रजिस्टर करें</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // Search state wide
                    executeAiSearch(query, aiResult.extractedCategory || undefined, 'उत्तर प्रदेश');
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <span>🌐 अन्य जिलों में देखें</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
