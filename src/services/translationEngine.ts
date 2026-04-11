// Advanced Multilingual Translation Engine for ISL

export type SupportedLanguage = 
  | 'english' 
  | 'hindi' 
  | 'bengali' 
  | 'tamil' 
  | 'telugu' 
  | 'marathi'
  | 'kannada'
  | 'gujarati'
  | 'malayalam'
  | 'punjabi'
  | 'urdu';

export interface TranslationContext {
  previousSigns: string[];
  category: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  formality?: 'formal' | 'informal';
}

export interface TranslationResult {
  originalSign: string;
  translatedText: string;
  language: SupportedLanguage;
  context: string;
  confidence: number;
  alternatives: string[];
  pronunciation?: string;
}

class MultilingualTranslationEngine {
  // Translation cache to avoid repeated API calls
  private translationCache = new Map<string, string>();
  
  // Comprehensive translation dictionary
  private translations: Record<string, Record<SupportedLanguage, string[]>> = {
    // Numbers
    'Zero (0)': {
      english: ['Zero', '0'],
      hindi: ['शून्य', 'ज़ीरो'],
      bengali: ['শূন্য'],
      tamil: ['பூஜ்யம்'],
      telugu: ['సున్న'],
      marathi: ['शून्य'],
      kannada: ['ಸೊನ್ನೆ'],
      gujarati: ['શૂન્ય'],
      malayalam: ['പൂജ്യം'],
      punjabi: ['ਜ਼ੀਰੋ'],
      urdu: ['صفر'],
    },
    'One (1)': {
      english: ['One', '1'],
      hindi: ['एक'],
      bengali: ['এক'],
      tamil: ['ஒன்று'],
      telugu: ['ఒకటి'],
      marathi: ['एक'],
      kannada: ['ಒಂದು'],
      gujarati: ['એક'],
      malayalam: ['ഒന്ന്'],
      punjabi: ['ਇੱਕ'],
      urdu: ['ایک'],
    },
    'Two (2)': {
      english: ['Two', '2'],
      hindi: ['दो'],
      bengali: ['দুই'],
      tamil: ['இரண்டு'],
      telugu: ['రెండు'],
      marathi: ['दोन'],
      kannada: ['ಎರಡು'],
      gujarati: ['બે'],
      malayalam: ['രണ്ട്'],
      punjabi: ['ਦੋ'],
      urdu: ['دو'],
    },
    'Three (3)': {
      english: ['Three', '3'],
      hindi: ['तीन'],
      bengali: ['তিন'],
      tamil: ['மூன்று'],
      telugu: ['మూడు'],
      marathi: ['तीन'],
      kannada: ['ಮೂರು'],
      gujarati: ['ત્રણ'],
      malayalam: ['മൂന്ന്'],
      punjabi: ['ਤਿੰਨ'],
      urdu: ['تین'],
    },
    'Four (4)': {
      english: ['Four', '4'],
      hindi: ['चार'],
      bengali: ['চার'],
      tamil: ['நான்கு'],
      telugu: ['నాలుగు'],
      marathi: ['चार'],
      kannada: ['ನಾಲ್ಕು'],
      gujarati: ['ચાર'],
      malayalam: ['നാല്'],
      punjabi: ['ਚਾਰ'],
      urdu: ['چار'],
    },
    'Five (5)': {
      english: ['Five', '5'],
      hindi: ['पांच'],
      bengali: ['পাঁচ'],
      tamil: ['ஐந்து'],
      telugu: ['ఐదు'],
      marathi: ['पाच'],
      kannada: ['ಐದು'],
      gujarati: ['પાંચ'],
      malayalam: ['അഞ്ച്'],
      punjabi: ['ਪੰਜ'],
      urdu: ['پانچ'],
    },

    // Greetings
    'Hello / Hi / Greetings': {
      english: ['Hello', 'Hi', 'Greetings'],
      hindi: ['नमस्ते', 'हैलो'],
      bengali: ['নমস্কার', 'হ্যালো'],
      tamil: ['வணக்கம்', 'ஹலோ'],
      telugu: ['నమస్కారం', 'హలో'],
      marathi: ['नमस्कार'],
      kannada: ['ನಮಸ್ಕಾರ'],
      gujarati: ['નમસ્તે'],
      malayalam: ['നമസ്കാരം'],
      punjabi: ['ਸਤ ਸ੍ਰੀ ਅਕਾਲ'],
      urdu: ['السلام علیکم', 'ہیلو'],
    },

    'Good / Yes / Agree': {
      english: ['Good', 'Yes', 'Agree', 'Okay'],
      hindi: ['अच्छा', 'हां', 'सहमत'],
      bengali: ['ভাল', 'হ্যাঁ', 'সম্মত'],
      tamil: ['நல்லது', 'ஆம்', 'ஒப்புக்கொள்'],
      telugu: ['మంచి', 'అవును', 'అంగీకరించు'],
      marathi: ['चांगले', 'होय', 'सहमत'],
      kannada: ['ಒಳ್ಳೆಯದು', 'ಹೌದು'],
      gujarati: ['સારું', 'હા'],
      malayalam: ['നല്ലത്', 'ഉവ്വ്'],
      punjabi: ['ਚੰਗਾ', 'ਹਾਂ'],
      urdu: ['اچھا', 'ہاں'],
    },

    'Bad / No / Disagree': {
      english: ['Bad', 'No', 'Disagree'],
      hindi: ['बुरा', 'नहीं', 'असहमत'],
      bengali: ['খারাপ', 'না', 'অসম্মত'],
      tamil: ['கெட்டது', 'இல்லை', 'மறுதலை'],
      telugu: ['చెడ్డది', 'కాదు', 'అంగీకరించను'],
      marathi: ['वाईट', 'नाही', 'असहमत'],
      kannada: ['ಕೆಟ್ಟದು', 'ಇಲ್ಲ'],
      gujarati: ['ખરાબ', 'ના'],
      malayalam: ['മോശം', 'ഇല്ല'],
      punjabi: ['ਬੁਰਾ', 'ਨਹੀਂ'],
      urdu: ['برا', 'نہیں'],
    },

    'Thank You / Gratitude': {
      english: ['Thank You', 'Thanks', 'Grateful'],
      hindi: ['धन्यवाद', 'शुक्रिया'],
      bengali: ['ধন্যবাদ'],
      tamil: ['நன்றி'],
      telugu: ['ధన్యవాదాలు'],
      marathi: ['धन्यवाद'],
      kannada: ['ಧನ್ಯವಾದ'],
      gujarati: ['આભાર'],
      malayalam: ['നന്ദി'],
      punjabi: ['ਧੰਨਵਾਦ'],
      urdu: ['شکریہ'],
    },

    'Stop / Wait': {
      english: ['Stop', 'Wait', 'Hold on'],
      hindi: ['रुको', 'प्रतीक्षा करो'],
      bengali: ['থামুন', 'অপেক্ষা করুন'],
      tamil: ['நிறுத்து', 'காத்திரு'],
      telugu: ['ఆగు', 'ఆగండి'],
      marathi: ['थांबा', 'प्रतीक्षा करा'],
      kannada: ['ನಿಲ್ಲು', 'ನಿರೀಕ್ಷಿಸಿ'],
      gujarati: ['રોકો', 'રાહ જુઓ'],
      malayalam: ['നിർത്തുക', 'കാത്തിരിക്കുക'],
      punjabi: ['ਰੁਕੋ', 'ਉਡੀਕ ਕਰੋ'],
      urdu: ['رکو', 'انتظار کرو'],
    },

    'OK / Perfect': {
      english: ['OK', 'Perfect', 'Alright'],
      hindi: ['ठीक है', 'परफेक्ट', 'बिल्कुल'],
      bengali: ['ঠিক আছে', 'নিখুঁত'],
      tamil: ['சரி', 'சரியான'],
      telugu: ['సరే', 'పర్ఫెక్ట్'],
      marathi: ['ठीक आहे', 'परिपूर्ण'],
      kannada: ['ಸರಿ', 'ಪರಿಪೂರ್ಣ'],
      gujarati: ['બરાબર', 'સંપૂર્ણ'],
      malayalam: ['ശരി', 'തികഞ്ഞത്'],
      punjabi: ['ਠੀਕ ਹੈ', 'ਪਰਫੈਕਟ'],
      urdu: ['ٹھیک ہے', 'بالکل'],
    },

    'Peace / Victory': {
      english: ['Peace', 'Victory', 'V sign'],
      hindi: ['शांति', 'विजय'],
      bengali: ['শান্তি', 'বিজয়'],
      tamil: ['அமைதி', 'வெற்றி'],
      telugu: ['శాంతి', 'విజయం'],
      marathi: ['शांती', 'विजय'],
      kannada: ['ಶಾಂತಿ', 'ವಿಜಯ'],
      gujarati: ['શાંતિ', 'વિજય'],
      malayalam: ['സമാധാനം', 'വിജയം'],
      punjabi: ['ਸ਼ਾਂਤੀ', 'ਜਿੱਤ'],
      urdu: ['امن', 'فتح'],
    },

    'Point / This / That': {
      english: ['This', 'That', 'Point', 'Indicate'],
      hindi: ['यह', 'वह', 'इशारा'],
      bengali: ['এটি', 'ওটি', 'নির্দেশ করা'],
      tamil: ['இது', 'அது', 'சுட்டிக்காட்ட'],
      telugu: ['ఇది', 'అది', 'సూచించు'],
      marathi: ['हे', 'ते', 'दर्शविणे'],
      kannada: ['ಇದು', 'ಅದು'],
      gujarati: ['આ', 'તે'],
      malayalam: ['ഇത്', 'അത്'],
      punjabi: ['ਇਹ', 'ਉਹ'],
      urdu: ['یہ', 'وہ'],
    },

    'Love / Like': {
      english: ['Love', 'Like', 'Affection'],
      hindi: ['प्यार', 'पसंद'],
      bengali: ['ভালোবাসা', 'পছন্দ'],
      tamil: ['காதல்', 'விருப்பம்'],
      telugu: ['ప్రేమ', 'ఇష్టం'],
      marathi: ['प्रेम', 'आवडणे'],
      kannada: ['ಪ್ರೀತಿ', 'ಇಷ್ಟ'],
      gujarati: ['પ્રેમ', 'પસંદ'],
      malayalam: ['സ്നേഹം', 'ഇഷ്ടം'],
      punjabi: ['ਪਿਆਰ', 'ਪਸੰਦ'],
      urdu: ['محبت', 'پسند'],
    },

    'Phone / Call Me': {
      english: ['Phone', 'Call Me', 'Call'],
      hindi: ['फ़ोन', 'मुझे कॉल करो'],
      bengali: ['ফোন', 'আমাকে কল করুন'],
      tamil: ['தொலைபேசி', 'எனக்கு அழைக்கவும்'],
      telugu: ['ఫోన్', 'నాకు కాల్ చేయండి'],
      marathi: ['फोन', 'मला कॉल करा'],
      kannada: ['ಫೋನ್', 'ನನಗೆ ಕರೆ ಮಾಡಿ'],
      gujarati: ['ફોન', 'મને કૉલ કરો'],
      malayalam: ['ഫോൺ', 'എന്നെ വിളിക്കൂ'],
      punjabi: ['ਫੋਨ', 'ਮੈਨੂੰ ਕਾਲ ਕਰੋ'],
      urdu: ['فون', 'مجھے کال کرو'],
    },

    'Small / Little': {
      english: ['Small', 'Little', 'Tiny'],
      hindi: ['छोटा', 'थोड़ा'],
      bengali: ['ছোট', 'সামান্য'],
      tamil: ['சிறிய', 'குட்டி'],
      telugu: ['చిన్న', 'కొంచెం'],
      marathi: ['लहान', 'थोडे'],
      kannada: ['ಚಿಕ್ಕ', 'ಸ್ವಲ್ಪ'],
      gujarati: ['નાનું', 'થોડું'],
      malayalam: ['ചെറുത്', 'കുറച്ച്'],
      punjabi: ['ਛੋਟਾ', 'ਥੋੜਾ'],
      urdu: ['چھوٹا', 'تھوڑا'],
    },

    'What / Question': {
      english: ['What', 'Question', 'Query'],
      hindi: ['क्या', 'प्रश्न'],
      bengali: ['কি', 'প্রশ্ন'],
      tamil: ['என்ன', 'கேள்வி'],
      telugu: ['ఏమిటి', 'ప్రశ్న'],
      marathi: ['काय', 'प्रश्न'],
      kannada: ['ಏನು', 'ಪ್ರಶ್ನೆ'],
      gujarati: ['શું', 'પ્રશ્ન'],
      malayalam: ['എന്ത്', 'ചോദ്യം'],
      punjabi: ['ਕੀ', 'ਸਵਾਲ'],
      urdu: ['کیا', 'سوال'],
    },

    'Like / Approve': {
      english: ['Like', 'Approve', 'Agree'],
      hindi: ['पसंद', 'स्वीकृत'],
      bengali: ['পছন্দ', 'অনুমোদন'],
      tamil: ['விருப்பம்', 'ஒப்புதல்'],
      telugu: ['ఇష్టం', 'ఆమోదం'],
      marathi: ['आवडणे', 'मंजूर'],
      kannada: ['ಇಷ್ಟ', 'ಅನುಮೋದನೆ'],
      gujarati: ['પસંદ', 'મંજૂર'],
      malayalam: ['ഇഷ്ടം', 'അംഗീകാരം'],
      punjabi: ['ਪਸੰਦ', 'ਮਨਜ਼ੂਰ'],
      urdu: ['پسند', 'منظور'],
    },
  };

  // Contextual phrase templates
  private phraseTemplates: Record<string, Record<SupportedLanguage, string>> = {
    greeting_morning: {
      english: 'Good morning',
      hindi: 'सुप्रभात',
      bengali: 'সুপ্রভাত',
      tamil: 'காலை வணக்கம்',
      telugu: 'శుభోదయం',
      marathi: 'सुप्रभात',
      kannada: 'ಶುಭೋದಯ',
      gujarati: 'સુપ્રભાત',
      malayalam: 'സുപ്രഭാതം',
      punjabi: 'ਸ਼ੁਭ ਸਵੇਰ',
      urdu: 'صبح بخیر',
    },
    greeting_evening: {
      english: 'Good evening',
      hindi: 'शुभ संध्या',
      bengali: 'শুভ সন্ধ্যা',
      tamil: 'மாலை வணக்கம்',
      telugu: 'శుభ సాయంకాలం',
      marathi: 'शुभ संध्याकाळ',
      kannada: 'ಶುಭ ಸಂಜೆ',
      gujarati: 'શુભ સાંજ',
      malayalam: 'ശുഭ സായാഹ്നം',
      punjabi: 'ਸ਼ੁਭ ਸ਼ਾਮ',
      urdu: 'شام بخیر',
    },
    politeness_formal: {
      english: 'please',
      hindi: 'कृपया',
      bengali: 'অনুগ্রহ করে',
      tamil: 'தயவு செய்து',
      telugu: 'దయచేసి',
      marathi: 'कृपया',
      kannada: 'ದಯವಿಟ್ಟು',
      gujarati: 'કૃપા કરીને',
      malayalam: 'ദയവായി',
      punjabi: 'ਕਿਰਪਾ ਕਰਕੇ',
      urdu: 'براہ کرم',
    },
  };

  // Translate a single sign with context
  public async translate(
    sign: string,
    language: SupportedLanguage,
    context?: TranslationContext
  ): Promise<TranslationResult> {
    console.log('📝 Translation request:', { sign, language });
    
    // Remove parentheses and extra info for matching
    const baseSign = this.normalizeSign(sign);
    
    // Get translations from dictionary
    const translationOptions = this.getTranslationOptions(baseSign, language);
    console.log('📚 Translation options:', translationOptions);
    
    // If not found in dictionary and not English, use translation API
    let selectedTranslation: string;
    if (translationOptions.length === 1 && translationOptions[0] === sign && language !== 'english') {
      // Check cache first
      const cacheKey = `${sign}:${language}`;
      const cached = this.translationCache.get(cacheKey);
      
      if (cached) {
        console.log('💾 Using cached translation:', cached);
        selectedTranslation = cached;
      } else {
        console.log('🌐 Fetching translation from API...');
        // Custom gesture - use translation API (with timeout to prevent lag)
        selectedTranslation = await Promise.race([
          this.translateWithAPI(sign, language),
          new Promise<string>((resolve) => setTimeout(() => resolve(sign), 500)) // 500ms timeout
        ]);
        
        console.log('✅ API translation result:', selectedTranslation);
        
        // Cache the result
        if (selectedTranslation !== sign) {
          this.translationCache.set(cacheKey, selectedTranslation);
        }
      }
    } else {
      // Found in dictionary - use context-based selection
      selectedTranslation = this.selectBestTranslation(translationOptions, context);
      console.log('📖 Dictionary translation:', selectedTranslation);
    }

    // Get alternatives
    const alternatives = translationOptions.filter(t => t !== selectedTranslation);

    // Get pronunciation (romanization for non-Latin scripts)
    const pronunciation = this.getPronunciation(selectedTranslation, language);

    return {
      originalSign: sign,
      translatedText: selectedTranslation,
      language,
      context: context?.category || 'general',
      confidence: 0.95,
      alternatives: alternatives.slice(0, 2),
      pronunciation,
    };
  }

  // Synchronous version for backward compatibility (uses cached translations only)
  public translateSync(
    sign: string,
    language: SupportedLanguage,
    context?: TranslationContext
  ): TranslationResult {
    const baseSign = this.normalizeSign(sign);
    const translationOptions = this.getTranslationOptions(baseSign, language);
    const selectedTranslation = this.selectBestTranslation(translationOptions, context);
    const alternatives = translationOptions.filter(t => t !== selectedTranslation);
    const pronunciation = this.getPronunciation(selectedTranslation, language);

    return {
      originalSign: sign,
      translatedText: selectedTranslation,
      language,
      context: context?.category || 'general',
      confidence: 0.95,
      alternatives: alternatives.slice(0, 2),
      pronunciation,
    };
  }

  // Translate a sentence (multiple signs)
  public async translateSentence(
    signs: string[],
    language: SupportedLanguage,
    context?: TranslationContext
  ): Promise<string> {
    if (signs.length === 0) return '';

    const translations = await Promise.all(
      signs.map(async (sign) => {
        const result = await this.translate(sign, language, context);
        return result.translatedText;
      })
    );

    return this.formatSentence(translations, language);
  }

  private normalizeSign(sign: string): string {
    // Remove parentheses, slashes, and extra whitespace
    return sign.split('/')[0].replace(/\([^)]*\)/g, '').trim();
  }

  private getTranslationOptions(sign: string, language: SupportedLanguage): string[] {
    // Try exact match first
    for (const [key, translations] of Object.entries(this.translations)) {
      if (key.includes(sign) || sign.includes(key.split('/')[0].trim())) {
        return translations[language] || translations.english;
      }
    }

    // For custom gestures not in dictionary, use browser translation API
    // Return the sign as-is for now (it will be handled by external translation)
    return [sign];
  }

  // Use Google Translate API or MyMemory Translation API for custom gestures
  private async translateWithAPI(text: string, targetLang: SupportedLanguage): Promise<string> {
    try {
      // Using MyMemory Translation API (free, no API key required)
      const langCode = this.getLanguageCode(targetLang);
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`
      );
      const data = await response.json();
      
      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
    } catch (error) {
      console.error('Translation API error:', error);
    }
    
    // Fallback to original text
    return text;
  }

  // Get ISO language codes for translation API
  private getLanguageCode(language: SupportedLanguage): string {
    const codes: Record<SupportedLanguage, string> = {
      english: 'en',
      hindi: 'hi',
      bengali: 'bn',
      tamil: 'ta',
      telugu: 'te',
      marathi: 'mr',
      kannada: 'kn',
      gujarati: 'gu',
      malayalam: 'ml',
      punjabi: 'pa',
      urdu: 'ur',
    };
    return codes[language] || 'en';
  }

  private selectBestTranslation(
    options: string[],
    context?: TranslationContext
  ): string {
    if (options.length === 0) return '';
    if (options.length === 1) return options[0];

    // Use context to select appropriate translation
    if (context?.formality === 'formal' && options.length > 1) {
      return options[1] || options[0]; // Often more formal option is second
    }

    return options[0]; // Default to first option
  }

  private formatSentence(words: string[], language: SupportedLanguage): string {
    if (words.length === 0) return '';

    // Basic sentence formation (can be enhanced with grammar rules)
    let sentence = words.join(' ');

    // Capitalize first letter for Latin scripts
    if (['english'].includes(language)) {
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }

    return sentence;
  }

  private getPronunciation(text: string, language: SupportedLanguage): string | undefined {
    // Provide romanization for non-Latin scripts
    const romanizations: Partial<Record<SupportedLanguage, Record<string, string>>> = {
      hindi: {
        'नमस्ते': 'namaste',
        'धन्यवाद': 'dhanyavaad',
        'हां': 'haan',
        'नहीं': 'nahin',
        'अच्छा': 'achha',
      },
      bengali: {
        'নমস্কার': 'nomoshkar',
        'ধন্যবাদ': 'dhonnobad',
        'হ্যাঁ': 'hyan',
        'না': 'na',
      },
      tamil: {
        'வணக்கம்': 'vanakkam',
        'நன்றி': 'nandri',
        'ஆம்': 'aam',
        'இல்லை': 'illai',
      },
      telugu: {
        'నమస్కారం': 'namaskaram',
        'ధన్యవాదాలు': 'dhanyavadalu',
        'అవును': 'avunu',
        'కాదు': 'kaadu',
      },
    };

    return romanizations[language]?.[text];
  }

  // Get all supported languages
  public getSupportedLanguages(): SupportedLanguage[] {
    return [
      'english',
      'hindi',
      'bengali',
      'tamil',
      'telugu',
      'marathi',
      'kannada',
      'gujarati',
      'malayalam',
      'punjabi',
      'urdu',
    ];
  }

  // Get language name in native script
  public getLanguageName(language: SupportedLanguage): string {
    const names: Record<SupportedLanguage, string> = {
      english: 'English',
      hindi: 'हिंदी (Hindi)',
      bengali: 'বাংলা (Bengali)',
      tamil: 'தமிழ் (Tamil)',
      telugu: 'తెలుగు (Telugu)',
      marathi: 'मराठी (Marathi)',
      kannada: 'ಕನ್ನಡ (Kannada)',
      gujarati: 'ગુજરાતી (Gujarati)',
      malayalam: 'മലയാളം (Malayalam)',
      punjabi: 'ਪੰਜਾਬੀ (Punjabi)',
      urdu: 'اردو (Urdu)',
    };

    return names[language];
  }
}

// Singleton instance
export const translationEngine = new MultilingualTranslationEngine();
