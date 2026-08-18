// Client-side Web Audio API synthesizer, Natural Indian Speech synthesis & Audio Ducking engine

class VideoAudioEngine {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private isMusicPlaying: boolean = false;
  private musicIntervalId: any = null;
  private streamDestination: MediaStreamAudioDestinationNode | null = null;

  // Normal vs Ducked Music Gains
  private readonly NORMAL_MUSIC_GAIN = 0.28;
  private readonly DUCKED_MUSIC_GAIN = 0.055; // 20% volume during voiceover

  // Speech synthesis state
  private isVoiceoverEnabled: boolean = true;
  private ttsVoices: SpeechSynthesisVoice[] = [];
  private lastSpokenScene: number = 0;
  private isSpeakingNow: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        this.ttsVoices = window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
        this.musicGainNode = this.audioCtx.createGain();
        this.sfxGainNode = this.audioCtx.createGain();

        this.musicGainNode.gain.value = this.NORMAL_MUSIC_GAIN;
        this.sfxGainNode.gain.value = 0.45;

        this.streamDestination = this.audioCtx.createMediaStreamDestination();

        // Connect to speaker output & destination stream
        this.musicGainNode.connect(this.audioCtx.destination);
        this.musicGainNode.connect(this.streamDestination);

        this.sfxGainNode.connect(this.audioCtx.destination);
        this.sfxGainNode.connect(this.streamDestination);
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getAudioStreamTrack(): MediaStreamTrack | null {
    if (!this.streamDestination) {
      this.init();
    }
    return this.streamDestination?.stream.getAudioTracks()[0] || null;
  }

  // --- AUTOMATIC AUDIO DUCKING (Smooth Volume Ramp) ---
  private duckMusicVolume() {
    if (!this.audioCtx || !this.musicGainNode || this.isMuted) return;
    try {
      const now = this.audioCtx.currentTime;
      this.musicGainNode.gain.cancelScheduledValues(now);
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
      this.musicGainNode.gain.linearRampToValueAtTime(this.DUCKED_MUSIC_GAIN, now + 0.15); // Duck to 20% in 150ms
    } catch (e) {}
  }

  private unduckMusicVolume() {
    if (!this.audioCtx || !this.musicGainNode || this.isMuted) return;
    try {
      const now = this.audioCtx.currentTime;
      this.musicGainNode.gain.cancelScheduledValues(now);
      this.musicGainNode.gain.setValueAtTime(this.musicGainNode.gain.value, now);
      this.musicGainNode.gain.linearRampToValueAtTime(this.NORMAL_MUSIC_GAIN, now + 0.35); // Restore to 100% in 350ms
    } catch (e) {}
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = muted ? 0 : this.isSpeakingNow ? this.DUCKED_MUSIC_GAIN : this.NORMAL_MUSIC_GAIN;
    }
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = muted ? 0 : 0.45;
    }
    if (muted && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeakingNow = false;
    }
  }

  public setVoiceoverEnabled(enabled: boolean) {
    this.isVoiceoverEnabled = enabled;
    if (!enabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeakingNow = false;
      this.unduckMusicVolume();
    }
  }

  // --- SOUND EFFECTS (SFX) SYNTHESIZER ---

  // 1. Cinematic Whoosh Transition (Scene Wipe / Change)
  public playWhooshSFX() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx || !this.sfxGainNode) return;

    try {
      const now = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 0.38;
      const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(3400, now + 0.18);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.38);
      filter.Q.value = 3.2;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.38, now + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGainNode);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.4);
    } catch (e) {}
  }

  // 2. High-Impact Pop / Chime (Price / Offer Badge Reveal)
  public playPopChimeSFX() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx || !this.sfxGainNode) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.12); // C6

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGainNode);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) {}
  }

  // 3. Grand Celebration Chime (Scene 4 Call to Action)
  public playGrandChimeSFX() {
    if (this.isMuted) return;
    this.init();
    if (!this.audioCtx || !this.sfxGainNode) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C - E - G - C Major Arpeggio
      freqs.forEach((freq, idx) => {
        const now = this.audioCtx!.currentTime + idx * 0.08;
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGainNode!);

        osc.start(now);
        osc.stop(now + 0.65);
      });
    } catch (e) {}
  }

  // --- BACKGROUND COMMERCIAL MUSIC SYNTHESIZER ---
  public startBackgroundMusic(template: string = 'apple_rolex') {
    if (this.isMusicPlaying) return;
    this.init();
    if (!this.audioCtx || !this.musicGainNode) return;

    this.isMusicPlaying = true;

    // Upbeat Commercial Progression in C Major / A Minor
    const chords = [
      [261.63, 329.63, 392.0], // C Maj
      [220.0, 261.63, 329.63], // A Min
      [349.23, 440.0, 523.25], // F Maj
      [392.0, 493.88, 587.33]  // G Maj
    ];

    let chordIdx = 0;
    const playNextBar = () => {
      if (!this.isMusicPlaying || !this.audioCtx || !this.musicGainNode) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const chord = chords[chordIdx % chords.length];
      chordIdx++;
      const now = this.audioCtx.currentTime;

      // Soft Warm Pad Chord
      chord.forEach((freq) => {
        try {
          const osc = this.audioCtx!.createOscillator();
          const gain = this.audioCtx!.createGain();

          osc.type = template === 'ipl_kinetic' ? 'sawtooth' : template === 'apple_glass' ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          osc.connect(gain);
          gain.connect(this.musicGainNode!);

          osc.start(now);
          osc.stop(now + 1.85);
        } catch (e) {}
      });

      // Energetic Rhythmic Bassline
      try {
        const bassOsc = this.audioCtx.createOscillator();
        const bassGain = this.audioCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(chord[0] / 2, now);

        bassGain.gain.setValueAtTime(0.18, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        bassOsc.connect(bassGain);
        bassGain.connect(this.musicGainNode);

        bassOsc.start(now);
        bassOsc.stop(now + 0.55);
      } catch (e) {}
    };

    playNextBar();
    this.musicIntervalId = setInterval(playNextBar, 1800);
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }

  // --- NATURAL INDIAN HUMAN VOICE SYNTHESIS & DUCKING ---
  private findBestIndianVoice(): SpeechSynthesisVoice | null {
    if (this.ttsVoices.length === 0 && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.ttsVoices = window.speechSynthesis.getVoices();
    }

    // Priority 1: Natural Neural Hindi Voices (Swara, Madhur, Google हिन्दी)
    const naturalHindiVoice = this.ttsVoices.find(
      (v) =>
        (v.lang.includes('hi') || v.lang.includes('HI')) &&
        (v.name.includes('Natural') ||
          v.name.includes('Swara') ||
          v.name.includes('Madhur') ||
          v.name.includes('Google'))
    );
    if (naturalHindiVoice) return naturalHindiVoice;

    // Priority 2: Any Hindi voice
    const anyHindiVoice = this.ttsVoices.find((v) => v.lang.includes('hi') || v.lang.includes('HI'));
    if (anyHindiVoice) return anyHindiVoice;

    // Priority 3: Indian English Neural Voice (e.g. Neerja, Prabhat, Google Indian English)
    const indianEngVoice = this.ttsVoices.find(
      (v) =>
        (v.lang.includes('en-IN') || v.lang.includes('en_IN')) &&
        (v.name.includes('Natural') || v.name.includes('Neerja') || v.name.includes('Prabhat'))
    );
    if (indianEngVoice) return indianEngVoice;

    return this.ttsVoices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en_IN')) || null;
  }

  public speakSceneVoiceover(sceneNumber: number, data: {
    businessName: string;
    services: string[];
    offer: string;
    price: string;
    phone: string;
    location: string;
  }) {
    if (this.isMuted || !this.isVoiceoverEnabled) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (this.lastSpokenScene === sceneNumber) return;
    this.lastSpokenScene = sceneNumber;

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    if (sceneNumber === 1) {
      // Natural cadence with micro-pause punctuation
      textToSpeak = `नमस्कार! प्रस्तुत है, ${data.businessName}।`;
    } else if (sceneNumber === 2) {
      const topServices = data.services.slice(0, 2).join('... और ...');
      textToSpeak = `हमारी मुख्य सेवाएं:... ${topServices}।`;
    } else if (sceneNumber === 3) {
      textToSpeak = `स्पेशल धमाका ऑफर!... ${data.offer}!... ${data.price}।`;
    } else if (sceneNumber === 4) {
      textToSpeak = `देर न करें, आज ही संपर्क करें!... कॉल करें मोबाइल नंबर... ${data.phone} पर।`;
    }

    if (!textToSpeak) return;

    try {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.92; // Natural clear Indian cadence
      utterance.pitch = 1.0;
      utterance.lang = 'hi-IN';

      const bestVoice = this.findBestIndianVoice();
      if (bestVoice) {
        utterance.voice = bestVoice;
      }

      // Dynamic Audio Ducking on Speech Start & End
      utterance.onstart = () => {
        this.isSpeakingNow = true;
        this.duckMusicVolume();
      };

      utterance.onend = () => {
        this.isSpeakingNow = false;
        this.unduckMusicVolume();
      };

      utterance.onerror = () => {
        this.isSpeakingNow = false;
        this.unduckMusicVolume();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      this.isSpeakingNow = false;
      this.unduckMusicVolume();
    }
  }

  public resetVoiceoverSync() {
    this.lastSpokenScene = 0;
    this.isSpeakingNow = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.unduckMusicVolume();
  }

  public destroy() {
    this.stopBackgroundMusic();
    this.resetVoiceoverSync();
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
    }
  }
}

export const videoAudioEngine = new VideoAudioEngine();
