// Text-to-Speech Service for multilingual audio output

export type SupportedLanguage = 'english' | 'hindi' | 'bengali' | 'tamil' | 'telugu' | 'marathi';

interface TTSOptions {
  language: SupportedLanguage;
  rate?: number; // 0.1 to 10, default 1
  pitch?: number; // 0 to 2, default 1
  volume?: number; // 0 to 1, default 1
}

class TextToSpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;

  // Language to voice mapping
  private languageVoiceMap: Record<SupportedLanguage, string[]> = {
    english: ['en-US', 'en-GB', 'en-IN', 'en'],
    hindi: ['hi-IN', 'hi'],
    bengali: ['bn-IN', 'bn'],
    tamil: ['ta-IN', 'ta'],
    telugu: ['te-IN', 'te'],
    marathi: ['mr-IN', 'mr'],
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();

    // Load voices when they become available
    if (typeof speechSynthesis !== 'undefined' && speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.loadVoices();
      };
    }
  }

  private loadVoices(): void {
    this.voices = this.synthesis.getVoices();
    if (this.voices.length > 0) {
      this.isInitialized = true;
    }
  }

  private findBestVoice(language: SupportedLanguage): SpeechSynthesisVoice | null {
    if (this.voices.length === 0) {
      this.loadVoices();
    }

    const langCodes = this.languageVoiceMap[language];
    
    // Try to find exact match
    for (const code of langCodes) {
      const voice = this.voices.find((v) => v.lang.startsWith(code));
      if (voice) return voice;
    }

    // Fallback to English for unsupported languages
    const englishVoice = this.voices.find((v) => v.lang.startsWith('en'));
    return englishVoice || this.voices[0] || null;
  }

  public speak(text: string, options: TTSOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!text) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.findBestVoice(options.language);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        // Fallback to default language codes
        const langCodes = this.languageVoiceMap[options.language];
        utterance.lang = langCodes[0];
      }

      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume !== undefined ? options.volume : 1;

      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error(`Speech synthesis failed: ${event.error}`));
      };

      try {
        this.synthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  public stop(): void {
    this.synthesis.cancel();
  }

  public pause(): void {
    this.synthesis.pause();
  }

  public resume(): void {
    this.synthesis.resume();
  }

  public isSpeaking(): boolean {
    return this.synthesis.speaking;
  }

  public isPaused(): boolean {
    return this.synthesis.paused;
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getAvailableLanguages(): SupportedLanguage[] {
    return Object.keys(this.languageVoiceMap) as SupportedLanguage[];
  }
}

// Singleton instance
export const ttsService = new TextToSpeechService();

// Helper function for quick speech
export async function speakText(
  text: string,
  language: SupportedLanguage = 'english',
  options?: Partial<Omit<TTSOptions, 'language'>>
): Promise<void> {
  return ttsService.speak(text, {
    language,
    ...options,
  });
}
