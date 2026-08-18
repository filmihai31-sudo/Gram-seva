import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Tv,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Phone,
  MessageCircle,
  Sparkles,
  Megaphone,
  Radio,
  MapPin,
  Flame,
  ShieldCheck,
  Plus,
  Info,
  Maximize2
} from 'lucide-react';
import { BannerAdRequest, VideoAdItem } from '../types';

// High-definition, royalty-free background MP4 video clips optimized for fast mobile streaming
export const DEFAULT_TV_ADS: VideoAdItem[] = [
  {
    id: 'tv-ad-tractor-1',
    title: 'महिंद्रा व स्वराज ट्रैक्टर पर ₹50,000 छूट व 0% ब्याज फाइनेंस!',
    businessName: 'चौधरी ट्रैक्टर्स & एग्री मशीनरी',
    offerText: 'पुराने ट्रैक्टर का सर्वश्रेष्ठ एक्सचेंज मूल्य + 3 साल फ्री सर्विस वारंटी',
    category: 'कृषि यंत्र & ट्रैक्टर',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80',
    phone: '9829012345',
    whatsapp: '9829012345',
    location: 'कृषि मंडी रोड, सांगानेर (जयपुर)',
    badgeLabel: '🔴 LIVE SPECIAL',
    discountTag: '⚡ ₹50,000 छूट',
    expiresInText: 'ऑफर समाप्त: 3 दिन शेष'
  },
  {
    id: 'tv-ad-solar-2',
    title: 'सरकारी सब्सिडी पर 5 HP व 7.5 HP सोलर ट्यूबवेल पंप लगवाएं!',
    businessName: 'सूर्य शक्ति सोलर सॉल्यूशंस',
    offerText: '80% तक कुसुम सरकारी सब्सिडी • 25 साल वारंटी वाले टियर-1 सोलर पैनल्स',
    category: 'सोलर पावर & ट्यूबवेल',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
    phone: '9414098765',
    whatsapp: '9414098765',
    location: 'हाईवे चौराहा, कुचामन सिटी (डीडवाना)',
    badgeLabel: '⚡ GOVT SUBSIDY',
    discountTag: '☀️ 80% सब्सिडी',
    expiresInText: 'लिमिटेड कोटा शेष'
  },
  {
    id: 'tv-ad-poshak-3',
    title: 'शाही राजपूती पोशाक, ब्राइडल लहंगा व जोधपुरी साड़ियां फ्लैट 30% ऑफ!',
    businessName: 'श्री श्याम वस्त्र भंडार & बुटीक',
    offerText: 'शुद्ध जरदोजी व गोटा-पत्ती वर्क • दूल्हा शेरवानी व साफा मैचिंग उपलब्ध',
    category: 'वस्त्र & साड़ियां',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    phone: '9166011223',
    whatsapp: '9166011223',
    location: 'मुख्य बाजार, रींगस (सीकर)',
    badgeLabel: '✨ FESTIVE DEALS',
    discountTag: '💎 30% ऑफ',
    expiresInText: 'विवाह स्पेशल सेल'
  },
  {
    id: 'tv-ad-sweets-4',
    title: 'शुद्ध देशी घी घेवर, मावा मिष्ठान व शादी-पार्टी कैटरिंग बुकिंग चालू!',
    businessName: 'कन्हैया स्वीट्स & बैंक्वेट',
    offerText: '100% शुद्धता की गारंटी • 500+ लोगों के भोजन का भव्य कैटरिंग व हलवाई सेटअप',
    category: 'मिष्ठान व कैटरिंग',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=1200&q=80',
    phone: '9828054321',
    whatsapp: '9828054321',
    location: 'बस स्टैंड के पास, फुलेरा (जयपुर)',
    badgeLabel: '⭐ 100% शुद्ध देशी घी',
    discountTag: '🍲 शादी कैटरिंग',
    expiresInText: 'बुकिंग पर 10% छूट'
  },
  {
    id: 'tv-ad-garage-5',
    title: '24x7 ऑन-रोड कार व ट्रैक्टर सर्विस, व्हील अलाइनमेंट & MRF टायर',
    businessName: 'राज ऑटोकेयर & टायर प्लाजा',
    offerText: 'कंप्यूटराइज्ड व्हील बैलेंसिंग • हर टायर पर फ्री ट्यूब व 5 साल अनकंडीशनल वारंटी',
    category: 'ऑटो गैराज व टायर',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    posterUrl: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=1200&q=80',
    phone: '9928123456',
    whatsapp: '9928123456',
    location: 'NH-52 बाईपास, चौमूं (जयपुर)',
    badgeLabel: '🛠️ 24x7 ऑन-रोड सर्विस',
    discountTag: '🚗 फ्री चेकअप',
    expiresInText: 'इमरजेंसी हेल्पलाइन'
  }
];

interface VideoAdTvBannerProps {
  activeApprovedAds?: BannerAdRequest[];
  customVideoAds?: VideoAdItem[];
  onOpenAdvertiseModal: () => void;
  onOpenVideoAdGenerator?: () => void;
  formatRemainingTime?: (time?: number) => string;
}

export const VideoAdTvBanner: React.FC<VideoAdTvBannerProps> = ({
  activeApprovedAds = [],
  customVideoAds = [],
  onOpenAdvertiseModal,
  onOpenVideoAdGenerator,
  formatRemainingTime
}) => {
  // Combine custom-generated user ads, user-submitted approved banner ads, and rich broadcast video ads
  const adList: VideoAdItem[] = React.useMemo(() => {
    const customUserAds: VideoAdItem[] = activeApprovedAds.map((ad) => ({
      id: `user-approved-${ad.id}`,
      title: `${ad.businessName} — लाइव प्रायोजित टीवी विज्ञापन`,
      businessName: ad.businessName,
      offerText: `मो: ${ad.mobile} • ${ad.durationDays} दिन का एक्टिव प्लान (₹${ad.price})`,
      category: 'प्रायोजित बिज़नेस',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: ad.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      phone: ad.mobile,
      whatsapp: ad.mobile,
      location: 'आपके स्थानीय ब्लॉक व जिले में',
      badgeLabel: '🔴 LIVE PAID AD',
      discountTag: '⭐ वेरिफाइड बिज़नेस',
      isSponsoredLive: true,
      expiresInText: formatRemainingTime ? formatRemainingTime(ad.expiryTime) : 'सक्रिय विज्ञापन'
    }));

    return [...customVideoAds, ...customUserAds, ...DEFAULT_TV_ADS];
  }, [customVideoAds, activeApprovedAds, formatRemainingTime]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [isInViewport, setIsInViewport] = useState<boolean>(true);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentAd = adList[currentIndex] || adList[0];

  // Auto slide duration: 7 seconds per slide
  const SLIDE_DURATION_MS = 7500;

  // Handle Next and Previous slide transitions
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % adList.length);
    setProgressPercent(0);
  }, [adList.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + adList.length) % adList.length);
    setProgressPercent(0);
  }, [adList.length]);

  // 1. Intersection Observer for Smart Bandwidth & Battery Saving
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  // 2. Play/Pause based on Viewport & Play state
  useEffect(() => {
    const activeVideo = videoRefs.current[currentAd.id];
    if (!activeVideo) return;

    if (isInViewport && isPlaying) {
      activeVideo.play().catch((err) => {
        console.log('Autoplay muted playback allowed, waiting for user gesture:', err);
      });
    } else {
      activeVideo.pause();
    }
  }, [isInViewport, isPlaying, currentIndex, currentAd.id]);

  // 3. Carousel Timer with smooth progress tick
  useEffect(() => {
    if (!isPlaying || !isInViewport || isHovered) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      return;
    }

    const intervalStep = 100;
    const increment = (intervalStep / SLIDE_DURATION_MS) * 100;

    progressTimerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, intervalStep);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [isPlaying, isInViewport, isHovered, handleNext]);

  // Handle sound toggle
  const toggleSound = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    const activeVideo = videoRefs.current[currentAd.id];
    if (activeVideo) {
      activeVideo.muted = newMuted;
    }
  };

  // Handle play/pause toggle
  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      id="video-ad-tv-banner-container"
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full relative group rounded-3xl overflow-hidden shadow-2xl bg-slate-950 border-2 sm:border-[3px] border-amber-400/80 ring-2 ring-amber-400/20 transition-all duration-300"
      style={{
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 158, 11, 0.18)'
      }}
    >
      {/* ==================== 1. LED TV TOP BEZEL & METADATA BAR ==================== */}
      <div className="relative z-30 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-b from-slate-950 via-slate-950/90 to-transparent flex items-center justify-between gap-2 border-b border-amber-400/20">
        
        {/* Left: TV Channel Watermark + Live Status */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full shadow-md tracking-wider shrink-0 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <Tv className="w-3 h-3 stroke-[2.5]" />
            <span>{currentAd.badgeLabel || '🔴 LIVE TV AD'}</span>
          </div>

          <div className="hidden xs:flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-200/90 tracking-wide truncate">
            <Radio className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
            <span className="truncate">ग्राम सेवा डिजिटल टीवी • 4K HD</span>
          </div>
        </div>

        {/* Right: Quick CTA & TV Hardware Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* AI Video Generator Button */}
          {onOpenVideoAdGenerator && (
            <button
              id="btn-tv-banner-create-video"
              type="button"
              onClick={onOpenVideoAdGenerator}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md border border-amber-500 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
              title="100% फ्री वीडियो विज्ञापन जनरेटर खोलें"
            >
              <Sparkles className="w-3 h-3 text-slate-950 fill-amber-300" />
              <span className="hidden xs:inline">🎬 फ्री वीडियो बनाएं</span>
              <span className="xs:hidden">वीडियो बनाएं</span>
            </button>
          )}

          {/* Advertise Button on TV Header */}
          <button
            id="btn-tv-banner-advertise"
            type="button"
            onClick={onOpenAdvertiseModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-xl shadow-md border border-emerald-400/60 flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
            title="ग्राम सेवा टीवी पर अपना वीडियो विज्ञापन चलाएं"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            <span className="hidden sm:inline">टीवी एड (₹99)</span>
            <span className="sm:hidden">₹99 एड</span>
          </button>

          {/* Audio Unmute / Mute Toggle Button */}
          <button
            id="btn-tv-banner-audio-toggle"
            type="button"
            onClick={toggleSound}
            className={`p-1.5 sm:p-2 rounded-xl text-white font-bold text-xs flex items-center justify-center transition-all border ${
              isMuted
                ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-300'
                : 'bg-amber-500 hover:bg-amber-400 border-amber-300 text-slate-950 shadow-md animate-pulse'
            }`}
            title={isMuted ? 'आवाज़ चालू करें (Unmute)' : 'आवाज़ बंद करें (Mute)'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>

          {/* Play / Pause Toggle Button */}
          <button
            id="btn-tv-banner-play-toggle"
            type="button"
            onClick={togglePlayPause}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center transition-all"
            title={isPlaying ? 'वीडियो रोकें' : 'वीडियो चलाएं'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            )}
          </button>
        </div>

      </div>

      {/* ==================== 2. TV SCREEN / VIDEO AD CAROUSEL STAGE ==================== */}
      <div className="relative w-full aspect-16/9 sm:aspect-21/9 min-h-[220px] sm:min-h-[250px] bg-slate-950 overflow-hidden">
        
        {/* Render Videos / Slides */}
        {adList.map((ad, index) => {
          const isActive = index === currentIndex;

          return (
            <div
              key={ad.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* HTML5 Auto-playing TV Video Element */}
              <video
                ref={(el) => {
                  videoRefs.current[ad.id] = el;
                }}
                src={ad.videoUrl}
                poster={ad.posterUrl}
                autoPlay
                loop
                muted={isMuted}
                playsInline
                disablePictureInPicture
                preload="metadata"
                onWaiting={() => isActive && setIsBuffering(true)}
                onPlaying={() => isActive && setIsBuffering(false)}
                onCanPlay={() => isActive && setIsBuffering(false)}
                className="w-full h-full object-cover transform scale-102 filter brightness-90 contrast-105"
              />

              {/* Poster fallback image for low network or initial buffer */}
              <div
                className="absolute inset-0 bg-cover bg-center -z-10"
                style={{ backgroundImage: `url(${ad.posterUrl})` }}
              />
            </div>
          );
        })}

        {/* Buffering Spinner Animation */}
        {isBuffering && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/40 backdrop-blur-2xs">
            <div className="flex flex-col items-center gap-2 text-amber-300">
              <div className="w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[11px] font-bold tracking-wider">लाइव वीडियो बफरिंग...</span>
            </div>
          </div>
        )}

        {/* TV Ambient Scanline & Subtle Vignette Grid */}
        <div className="absolute inset-0 pointer-events-none z-15 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>

        {/* Left & Right Slide Navigation Arrows */}
        <button
          id="btn-tv-banner-prev"
          type="button"
          onClick={handlePrev}
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-25 p-2 sm:p-2.5 rounded-2xl bg-slate-950/70 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/20 backdrop-blur-md shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Previous Ad"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        <button
          id="btn-tv-banner-next"
          type="button"
          onClick={handleNext}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-25 p-2 sm:p-2.5 rounded-2xl bg-slate-950/70 hover:bg-amber-500 hover:text-slate-950 text-white border border-white/20 backdrop-blur-md shadow-lg transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
          aria-label="Next Ad"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>

        {/* ==================== 3. SLEEK GRADIENT OVERLAY & AD DETAILS ==================== */}
        <div className="absolute inset-x-0 bottom-0 z-20 pt-16 pb-3 sm:pb-4 px-3 sm:px-5 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent flex flex-col justify-end text-left">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-2.5 sm:gap-3">
            
            {/* Left Column: Badges, Title, Business Name, Location */}
            <div className="flex-1 overflow-hidden">
              
              {/* Badges Row */}
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {currentAd.discountTag && (
                  <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm border border-red-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 fill-amber-300" />
                    <span>{currentAd.discountTag}</span>
                  </span>
                )}

                <span className="bg-slate-800/90 text-amber-300 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md border border-amber-400/30">
                  {currentAd.category}
                </span>

                {currentAd.expiresInText && (
                  <span className="text-[10px] text-amber-200/80 font-medium">
                    • {currentAd.expiresInText}
                  </span>
                )}
              </div>

              {/* Main Ad Headline */}
              <h3 className="text-sm sm:text-base md:text-lg font-black text-white leading-tight drop-shadow-md line-clamp-2">
                {currentAd.title}
              </h3>

              {/* Business Name & Offer Subtitle */}
              <div className="flex items-center gap-2 text-xs text-slate-200 font-semibold mt-0.5 flex-wrap">
                <span className="text-amber-400 font-black flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  {currentAd.businessName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 text-[11px] font-normal truncate">
                  {currentAd.offerText}
                </span>
              </div>

              {/* Location */}
              <p className="text-[10px] sm:text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{currentAd.location}</span>
              </p>

            </div>

            {/* Right Column: Direct Interactive CTA Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
              
              {/* Direct Phone Call Button */}
              <a
                id={`btn-tv-call-${currentAd.id}`}
                href={`tel:${currentAd.phone}`}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-lg border border-emerald-400 flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
              >
                <Phone className="w-3.5 h-3.5 fill-current" />
                <span>अभी कॉल करें</span>
              </a>

              {/* WhatsApp Chat Button */}
              <a
                id={`btn-tv-whatsapp-${currentAd.id}`}
                href={`https://wa.me/91${currentAd.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                  `नमस्ते ${currentAd.businessName}, मैंने ग्राम सेवा टीवी पर आपका विज्ञापन देखा है। कृपया अधिक जानकारी व रेट लिस्ट भेजें।`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-green-300 flex items-center justify-center gap-1.5 active:scale-95 transition-all text-center"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-slate-950" />
                <span>WhatsApp</span>
              </a>

            </div>

          </div>

        </div>

      </div>

      {/* ==================== 4. TV BOTTOM CAROUSEL PROGRESS & SLIDE SELECTOR ==================== */}
      <div className="relative z-30 px-3 sm:px-4 py-2 bg-slate-950/95 border-t border-amber-400/20 flex items-center justify-between gap-2">
        
        {/* Slide Counter */}
        <div className="text-[10px] sm:text-[11px] font-extrabold text-amber-400/90 tracking-wide flex items-center gap-1">
          <span>चैनल विज्ञापन: {currentIndex + 1} / {adList.length}</span>
        </div>

        {/* Dynamic Multi-Slide Interactive Progress Bars */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-1 max-w-xs sm:max-w-md mx-2">
          {adList.map((ad, idx) => {
            const isSlideActive = idx === currentIndex;
            const isPassed = idx < currentIndex;

            return (
              <button
                key={ad.id}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setProgressPercent(0);
                }}
                className="flex-1 h-1.5 sm:h-2 rounded-full overflow-hidden bg-slate-800 transition-all cursor-pointer hover:bg-slate-700"
                title={`${ad.businessName} विज्ञापन देखें`}
              >
                <div
                  className="h-full rounded-full transition-all duration-100"
                  style={{
                    width: isSlideActive ? `${progressPercent}%` : isPassed ? '100%' : '0%',
                    backgroundColor: isSlideActive ? '#f59e0b' : isPassed ? '#10b981' : 'transparent'
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Mute/Sound Quick Indicator Notice */}
        <div className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
          {isMuted ? '🔇 म्यूट है (🔊 दबाएं)' : '🔊 आवाज़ ऑन'}
        </div>

      </div>

    </div>
  );
};
