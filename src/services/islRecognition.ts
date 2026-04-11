import { HandLandmarks } from '@/components/WebcamCapture';

export interface ISLGesture {
  sign: string;
  confidence: number;
  timestamp: number;
}

export interface RecognitionResult {
  gesture: ISLGesture | null;
  phrase: string;
  confidence: number;
}

// Hand gesture feature extraction
class HandGestureRecognizer {
  private gestureBuffer: ISLGesture[] = [];
  private readonly bufferSize = 30; // ~1 second at 30fps
  private readonly confidenceThreshold = 0.6;

  // Calculate angle between three points
  private calculateAngle(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ): number {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  }

  // Calculate distance between two points
  private calculateDistance(
    a: { x: number; y: number },
    b: { x: number; y: number }
  ): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  // Check if finger is extended
  private isFingerExtended(landmarks: HandLandmarks, fingerIndices: number[]): boolean {
    const tip = landmarks[fingerIndices[3]];
    const pip = landmarks[fingerIndices[1]];
    const mcp = landmarks[fingerIndices[0]];
    const wrist = landmarks[0];

    const tipToWrist = this.calculateDistance(tip, wrist);
    const mcpToWrist = this.calculateDistance(mcp, wrist);

    return tipToWrist > mcpToWrist * 0.9;
  }

  // Recognize basic hand gestures
  private recognizeStaticGesture(landmarks: HandLandmarks): ISLGesture | null {
    if (landmarks.length !== 21) return null;

    // Finger landmark indices
    const thumbIndices = [1, 2, 3, 4];
    const indexIndices = [5, 6, 7, 8];
    const middleIndices = [9, 10, 11, 12];
    const ringIndices = [13, 14, 15, 16];
    const pinkyIndices = [17, 18, 19, 20];

    // Check which fingers are extended
    const thumbExtended = this.isFingerExtended(landmarks, thumbIndices);
    const indexExtended = this.isFingerExtended(landmarks, indexIndices);
    const middleExtended = this.isFingerExtended(landmarks, middleIndices);
    const ringExtended = this.isFingerExtended(landmarks, ringIndices);
    const pinkyExtended = this.isFingerExtended(landmarks, pinkyIndices);

    const extendedCount = [
      indexExtended,
      middleExtended,
      ringExtended,
      pinkyExtended,
    ].filter(Boolean).length;

    let sign = '';
    let confidence = 0.7;

    // Number recognition (1-5)
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
      sign = 'One (1)';
      confidence = 0.85;
    } else if (indexExtended && middleExtended && !ringExtended && !pinkyExtended && !thumbExtended) {
      const indexTip = landmarks[8];
      const middleTip = landmarks[12];
      const distance = this.calculateDistance(indexTip, middleTip);
      
      // Close together = number two, far apart = peace sign
      if (distance < 0.08) {
        sign = 'Two (2)';
        confidence = 0.85;
      } else {
        sign = 'Peace / Victory';
        confidence = 0.82;
      }
    } else if (indexExtended && middleExtended && ringExtended && !pinkyExtended && !thumbExtended) {
      sign = 'Three (3)';
      confidence = 0.85;
    } else if (indexExtended && middleExtended && ringExtended && pinkyExtended && !thumbExtended) {
      sign = 'Four (4)';
      confidence = 0.85;
    } else if (
      thumbExtended &&
      indexExtended &&
      middleExtended &&
      ringExtended &&
      pinkyExtended
    ) {
      sign = 'Five (5)';
      confidence = 0.9;
    }
    // Thumbs up
    else if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      sign = 'Good / Yes / Thumbs Up';
      confidence = 0.8;
    }
    // Fist (all fingers closed)
    else if (!thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      sign = 'Stop / Fist';
      confidence = 0.75;
    }
    // Point
    else if (indexExtended && extendedCount === 1 && !thumbExtended) {
      sign = 'Point / Indicate';
      confidence = 0.75;
    }
    // Open palm (Hello/Stop)
    else if (extendedCount === 4 && thumbExtended) {
      // Check if thumb and index are close (OK sign)
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const distance = this.calculateDistance(thumbTip, indexTip);
      
      if (distance < 0.05) {
        sign = 'OK / Perfect';
        confidence = 0.8;
      } else {
        sign = 'Hello / Stop / Open Hand';
        confidence = 0.8;
      }
    }

    if (sign && confidence >= this.confidenceThreshold) {
      return {
        sign,
        confidence,
        timestamp: Date.now(),
      };
    }

    return null;
  }

  // Process hand landmarks and recognize gesture
  public processLandmarks(handsLandmarks: HandLandmarks[]): RecognitionResult {
    if (handsLandmarks.length === 0) {
      return {
        gesture: null,
        phrase: '',
        confidence: 0,
      };
    }

    // Process first hand (can be extended to handle two hands)
    const gesture = this.recognizeStaticGesture(handsLandmarks[0]);

    if (gesture) {
      // Add to buffer
      this.gestureBuffer.push(gesture);
      if (this.gestureBuffer.length > this.bufferSize) {
        this.gestureBuffer.shift();
      }

      // Get most common gesture in buffer
      const stableGesture = this.getMostFrequentGesture();

      return {
        gesture: stableGesture,
        phrase: stableGesture.sign,
        confidence: stableGesture.confidence,
      };
    }

    return {
      gesture: null,
      phrase: '',
      confidence: 0,
    };
  }

  // Get the most frequent gesture in the buffer (for stability)
  private getMostFrequentGesture(): ISLGesture {
    const gestureCounts = new Map<string, { count: number; gesture: ISLGesture }>();

    this.gestureBuffer.forEach((gesture) => {
      const current = gestureCounts.get(gesture.sign);
      if (current) {
        current.count++;
      } else {
        gestureCounts.set(gesture.sign, { count: 1, gesture });
      }
    });

    let maxCount = 0;
    let mostFrequent: ISLGesture = this.gestureBuffer[this.gestureBuffer.length - 1];

    gestureCounts.forEach((value) => {
      if (value.count > maxCount) {
        maxCount = value.count;
        mostFrequent = value.gesture;
      }
    });

    return mostFrequent;
  }

  // Clear gesture buffer
  public clearBuffer(): void {
    this.gestureBuffer = [];
  }

  // Get gesture history
  public getGestureHistory(): ISLGesture[] {
    return [...this.gestureBuffer];
  }
}

// Singleton instance
export const islRecognizer = new HandGestureRecognizer();

// ISL phrase mapping (for context and common phrases)
export const islPhraseMapping: Record<string, string[]> = {
  greeting: ['Hello / Stop / Open Hand', 'Good / Yes / Thumbs Up'],
  numbers: ['One (1)', 'Two (2)', 'Three (3)', 'Four (4)', 'Five (5)'],
  affirmation: ['Good / Yes / Thumbs Up', 'OK / Perfect'],
  negation: ['Stop / Fist'],
};

// Translate ISL to multiple languages
export function translateISL(
  phrase: string,
  targetLanguage: string
): string {
  const translations: Record<string, Record<string, string>> = {
    'Hello / Stop / Open Hand': {
      english: 'Hello',
      hindi: 'नमस्ते',
      bengali: 'হ্যালো',
      tamil: 'வணக்கம்',
      telugu: 'హలో',
      marathi: 'नमस्कार',
    },
    'Good / Yes / Thumbs Up': {
      english: 'Good / Yes',
      hindi: 'अच्छा / हाँ',
      bengali: 'ভাল / হ্যাঁ',
      tamil: 'நல்லது / ஆம்',
      telugu: 'మంచి / అవును',
      marathi: 'चांगले / होय',
    },
    'Stop / Fist': {
      english: 'Stop',
      hindi: 'रुको',
      bengali: 'থামুন',
      tamil: 'நிறுத்து',
      telugu: 'ఆగు',
      marathi: 'थांबा',
    },
    'OK / Perfect': {
      english: 'OK / Perfect',
      hindi: 'ठीक है / परफेक्ट',
      bengali: 'ঠিক আছে / নিখুঁত',
      tamil: 'சரி / சரியான',
      telugu: 'సరే / పర్ఫెక్ట్',
      marathi: 'ठीक आहे / परिपूर्ण',
    },
    'Peace / Victory / Two': {
      english: 'Peace / Victory',
      hindi: 'शांति / विजय',
      bengali: 'শান্তি / বিজয়',
      tamil: 'அமைதி / வெற்றி',
      telugu: 'శాంతి / విజయం',
      marathi: 'शांती / विजय',
    },
    'Point / Indicate': {
      english: 'Point / Indicate',
      hindi: 'इशारा करना',
      bengali: 'নির্দেশ করা',
      tamil: 'சுட்டிக்காட்ட',
      telugu: 'సూచించు',
      marathi: 'दर्शविणे',
    },
  };

  // Handle numbers
  const numberMatch = phrase.match(/^(One|Two|Three|Four|Five) \((\d)\)$/);
  if (numberMatch) {
    const number = numberMatch[2];
    const numberTranslations: Record<string, string[]> = {
      english: ['One', 'Two', 'Three', 'Four', 'Five'],
      hindi: ['एक', 'दो', 'तीन', 'चार', 'पाँच'],
      bengali: ['এক', 'দুই', 'তিন', 'চার', 'পাঁচ'],
      tamil: ['ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து'],
      telugu: ['ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు'],
      marathi: ['एक', 'दोन', 'तीन', 'चार', 'पाच'],
    };
    
    const numIndex = parseInt(number) - 1;
    return numberTranslations[targetLanguage]?.[numIndex] || number;
  }

  const phraseTranslations = translations[phrase];
  if (phraseTranslations) {
    return phraseTranslations[targetLanguage] || phraseTranslations.english || phrase;
  }

  return phrase;
}
