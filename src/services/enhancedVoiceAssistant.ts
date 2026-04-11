// Enhanced Voice Assistant Service with Emotion and Natural Speech

export type VoiceEmotion = 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'urgent';

export interface VoiceSettings {
  language: string;
  rate: number; // 0.1 to 10 (1 = normal)
  pitch: number; // 0 to 2 (1 = normal)
  volume: number; // 0 to 1
  emotion?: VoiceEmotion;
}

export interface SpeechQueueItem {
  id: number;
  text: string;
  settings: VoiceSettings;
  priority: number; // Higher = more urgent
  timestamp: number;
}

class EnhancedVoiceAssistant {
  private synth: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private speechQueue: SpeechQueueItem[] = [];
  private queueId = 0;
  private isSpeaking = false;
  private isEnabled = true;

  // Voice preferences for each language (best quality voices)
  private preferredVoices: Record<string, string[]> = {
    english: ['Samantha', 'Alex', 'Google US English', 'Microsoft David', 'English'],
    hindi: ['Google हिन्दी', 'Microsoft Hemant', 'Lekha'],
    bengali: ['Google বাংলা', 'Microsoft Tanishka'],
    tamil: ['Google தமிழ்', 'Microsoft Valluvar'],
    telugu: ['Google తెలుగు', 'Microsoft Shruti'],
    marathi: ['Google मराठी', 'Microsoft Abhishek'],
    kannada: ['Google ಕನ್ನಡ'],
    gujarati: ['Google ગુજરાતી'],
    malayalam: ['Google മലയാളം'],
    punjabi: ['Google ਪੰਜਾਬੀ'],
    urdu: ['Google اردو', 'Microsoft Asad'],
  };

  // Emotion-based voice modulation
  private emotionSettings: Record<VoiceEmotion, Partial<VoiceSettings>> = {
    neutral: { rate: 1.0, pitch: 1.0, volume: 1.0 },
    happy: { rate: 1.1, pitch: 1.2, volume: 1.0 },
    sad: { rate: 0.9, pitch: 0.8, volume: 0.8 },
    excited: { rate: 1.2, pitch: 1.3, volume: 1.0 },
    calm: { rate: 0.85, pitch: 0.95, volume: 0.9 },
    urgent: { rate: 1.3, pitch: 1.1, volume: 1.0 },
  };

  constructor() {
    this.synth = window.speechSynthesis;
    this.loadVoices();

    // Reload voices when they change (async loading in some browsers)
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  // Load available voices
  private loadVoices(): void {
    this.voices = this.synth.getVoices();
  }

  // Get best voice for a language
  private getBestVoice(language: string): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const preferredNames = this.preferredVoices[language.toLowerCase()] || [];

    // Try to find preferred voice
    for (const preferredName of preferredNames) {
      const voice = this.voices.find(v =>
        v.name.includes(preferredName) || v.lang.toLowerCase().includes(language.toLowerCase())
      );
      if (voice) return voice;
    }

    // Fallback to any voice matching the language
    return (
      this.voices.find(v => v.lang.toLowerCase().startsWith(language.toLowerCase())) ||
      this.voices[0] ||
      null
    );
  }

  // Speak text with enhanced settings
  public async speak(
    text: string,
    settings: Partial<VoiceSettings> = {},
    priority: number = 0
  ): Promise<void> {
    if (!this.isEnabled || !text.trim()) {
      return Promise.resolve();
    }

    // Add to queue
    const queueItem: SpeechQueueItem = {
      id: this.queueId++,
      text: text.trim(),
      settings: this.mergeSettings(settings),
      priority,
      timestamp: Date.now(),
    };

    this.speechQueue.push(queueItem);
    this.speechQueue.sort((a, b) => b.priority - a.priority);

    // Process queue if not already speaking
    if (!this.isSpeaking) {
      await this.processQueue();
    }

    return Promise.resolve();
  }

  // Process the speech queue
  private async processQueue(): Promise<void> {
    if (this.speechQueue.length === 0) {
      this.isSpeaking = false;
      return;
    }

    this.isSpeaking = true;
    const item = this.speechQueue.shift();

    if (!item) {
      this.isSpeaking = false;
      return;
    }

    await this.speakItem(item);
    await this.processQueue(); // Continue with next item
  }

  // Speak a single queue item
  private speakItem(item: SpeechQueueItem): Promise<void> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(item.text);
      const voice = this.getBestVoice(item.settings.language);

      if (voice) {
        utterance.voice = voice;
      }

      // Apply settings with emotion modulation
      utterance.rate = item.settings.rate;
      utterance.pitch = item.settings.pitch;
      utterance.volume = item.settings.volume;
      utterance.lang = this.getLanguageCode(item.settings.language);

      // Event handlers
      utterance.onend = () => {
        this.currentUtterance = null;
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        this.currentUtterance = null;
        reject(event);
      };

      // Store current utterance
      this.currentUtterance = utterance;

      // Speak
      this.synth.speak(utterance);
    });
  }

  // Merge default and custom settings
  private mergeSettings(custom: Partial<VoiceSettings>): VoiceSettings {
    const defaults: VoiceSettings = {
      language: 'english',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      emotion: 'neutral',
    };

    const merged = { ...defaults, ...custom };

    // Apply emotion modulation
    if (merged.emotion && merged.emotion !== 'neutral') {
      const emotionMods = this.emotionSettings[merged.emotion];
      return {
        ...merged,
        rate: emotionMods.rate || merged.rate,
        pitch: emotionMods.pitch || merged.pitch,
        volume: emotionMods.volume || merged.volume,
      };
    }

    return merged;
  }

  // Get language code for Web Speech API
  private getLanguageCode(language: string): string {
    const codes: Record<string, string> = {
      english: 'en-US',
      hindi: 'hi-IN',
      bengali: 'bn-IN',
      tamil: 'ta-IN',
      telugu: 'te-IN',
      marathi: 'mr-IN',
      kannada: 'kn-IN',
      gujarati: 'gu-IN',
      malayalam: 'ml-IN',
      punjabi: 'pa-IN',
      urdu: 'ur-PK',
    };

    return codes[language.toLowerCase()] || 'en-US';
  }

  // Stop current speech
  public stop(): void {
    this.synth.cancel();
    this.currentUtterance = null;
    this.isSpeaking = false;
  }

  // Pause speech
  public pause(): void {
    if (this.synth.speaking) {
      this.synth.pause();
    }
  }

  // Resume speech
  public resume(): void {
    if (this.synth.paused) {
      this.synth.resume();
    }
  }

  // Clear speech queue
  public clearQueue(): void {
    this.speechQueue = [];
    this.stop();
  }

  // Enable/disable voice assistant
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
      this.clearQueue();
    }
  }

  // Check if currently speaking
  public get speaking(): boolean {
    return this.synth.speaking;
  }

  // Get available voices for a language
  public getAvailableVoices(language: string): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    return this.voices.filter(v =>
      v.lang.toLowerCase().startsWith(language.toLowerCase())
    );
  }

  // Get queue status
  public getQueueStatus() {
    return {
      queueLength: this.speechQueue.length,
      isSpeaking: this.isSpeaking,
      isEnabled: this.isEnabled,
      currentText: this.currentUtterance?.text || null,
    };
  }

  // Test speech (useful for debugging)
  public async test(language: string = 'english'): Promise<void> {
    const testPhrases: Record<string, string> = {
      english: 'Hello! I am your voice assistant.',
      hindi: 'नमस्ते! मैं आपका आवाज सहायक हूं।',
      bengali: 'নমস্কার! আমি আপনার ভয়েস সহকারী।',
      tamil: 'வணக்கம்! நான் உங்கள் குரல் உதவியாளர்.',
      telugu: 'నమస్కారం! నేను మీ వాయిస్ అసిస్టెంట్.',
      marathi: 'नमस्कार! मी तुमचा आवाज सहाय्यक आहे.',
    };

    const testPhrase = testPhrases[language] || testPhrases.english;
    await this.speak(testPhrase, { language });
  }

  // Speak with emotion
  public async speakWithEmotion(
    text: string,
    language: string,
    emotion: VoiceEmotion
  ): Promise<void> {
    return this.speak(text, { language, emotion });
  }

  // Get supported languages
  public getSupportedLanguages(): string[] {
    return Object.keys(this.preferredVoices);
  }
}

// Singleton instance
export const voiceAssistant = new EnhancedVoiceAssistant();
