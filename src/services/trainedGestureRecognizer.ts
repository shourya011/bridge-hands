import { HandLandmarks } from '@/components/WebcamCapture';
import { gestureTrainer, GestureProfile } from './gestureTrainer';

// Enhanced gesture types
export interface EnhancedISLGesture {
  sign: string;
  category: 'number' | 'alphabet' | 'word' | 'phrase' | 'action';
  confidence: number;
  timestamp: number;
  duration: number;
  handUsed: 'left' | 'right' | 'both';
  complexity: 'simple' | 'moderate' | 'complex';
}

export interface GestureSequence {
  gestures: EnhancedISLGesture[];
  sentence: string;
  context: string;
  startTime: number;
  endTime: number;
}

export interface RecognitionResult {
  gesture: EnhancedISLGesture | null;
  sentence: string;
  confidence: number;
  suggestions: string[];
}

/**
 * Trained Gesture Recognizer
 * 
 * This recognizer ONLY uses gestures you've trained with the camera.
 * No hardcoded gestures - completely customizable!
 */
export class TrainedGestureRecognizer {
  private gestureBuffer: EnhancedISLGesture[] = [];
  private sequenceBuffer: GestureSequence[] = [];
  private readonly bufferSize = 20; // Balanced buffer size
  private readonly sequenceTimeout = 1500; // Balanced timeout
  private readonly confidenceThreshold = 0.68; // Increased to 68% for HIGH accuracy (no false positives)
  private readonly minimumGestureHoldTime = 400; // Optimized to 400ms (balanced: fast + accurate)
  private readonly gestureChangeDebounce = 800; // Optimized to 800ms (smooth transitions without repetition)
  private lastGestureTime = 0;
  private gestureStartTime = 0;
  private lastRecognizedSign: string = '';
  private lastRecognizedTime = 0;
  private gestureStabilityCounter = 0;
  private readonly stabilityThreshold = 4; // Optimized to 4 frames (balanced: fast + stable recognition)

  constructor() {
    console.log('🎯 Trained Gesture Recognizer initialized - Using ONLY your custom trained gestures!');
  }

  /**
   * Process hand landmarks and recognize trained gestures
   */
  public async processLandmarks(hands: HandLandmarks[]): Promise<RecognitionResult> {
    if (hands.length === 0) {
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: [],
      };
    }

    const currentTime = Date.now();
    const primaryHand = hands[0];

    // Get all trained gestures
    const trainedProfiles = await gestureTrainer.loadTrainingData();

    if (trainedProfiles.length === 0) {
      // No trained gestures yet
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: ['No trained gestures found. Please use Training Mode to add custom gestures.'],
      };
    }

    // Match against all trained gestures
    const matches = trainedProfiles.map(profile => {
      const result = this.matchGestureAgainstProfile(primaryHand, profile);
      return {
        gestureName: profile.gestureName,
        similarity: result.similarity,
        profile: profile,
      };
    });

    // Sort by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    const bestMatch = matches[0];
    const confidence = bestMatch.similarity;

    // Check if confidence is above threshold
    if (confidence < this.confidenceThreshold) {
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: matches.slice(0, 3).map(m => `${m.gestureName} (${(m.similarity * 100).toFixed(0)}%)`),
      };
    }

    // Check gesture stability
    const isSameGesture = this.lastRecognizedSign === bestMatch.gestureName;
    
    if (isSameGesture) {
      this.gestureStabilityCounter++;
    } else {
      this.gestureStabilityCounter = 1;
      this.gestureStartTime = currentTime;
      this.lastRecognizedSign = bestMatch.gestureName;
    }

    // Require stable detection
    if (this.gestureStabilityCounter < this.stabilityThreshold) {
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: [`Detecting: ${bestMatch.gestureName} (${this.gestureStabilityCounter}/${this.stabilityThreshold})`],
      };
    }

    // Check minimum hold time
    const holdTime = currentTime - this.gestureStartTime;
    if (holdTime < this.minimumGestureHoldTime) {
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: [`Hold steady: ${bestMatch.gestureName} (${((holdTime / this.minimumGestureHoldTime) * 100).toFixed(0)}%)`],
      };
    }

    // Check debounce (prevent repeated detection)
    const timeSinceLastRecognition = currentTime - this.lastRecognizedTime;
    if (timeSinceLastRecognition < this.gestureChangeDebounce) {
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: [],
      };
    }

    // GESTURE RECOGNIZED!
    this.lastRecognizedTime = currentTime;

    const recognizedGesture: EnhancedISLGesture = {
      sign: bestMatch.gestureName,
      category: this.categorizeGesture(bestMatch.gestureName),
      confidence: confidence,
      timestamp: currentTime,
      duration: holdTime,
      handUsed: 'right', // Default, can be enhanced later
      complexity: 'simple',
    };

    // Add to buffer
    this.gestureBuffer.push(recognizedGesture);
    if (this.gestureBuffer.length > this.bufferSize) {
      this.gestureBuffer.shift();
    }

    // Build sentence from recent gestures
    const sentence = this.buildSentence();

    // Get suggestions (next 2 best matches)
    const suggestions = matches.slice(1, 3).map(m => m.gestureName);

    return {
      gesture: recognizedGesture,
      sentence: sentence,
      confidence: confidence,
      suggestions: suggestions,
    };
  }

  /**
   * Match current hand landmarks against a trained profile
   */
  private matchGestureAgainstProfile(
    landmarks: HandLandmarks,
    profile: GestureProfile
  ): { similarity: number } {
    // Calculate current measurements
    const currentDistances = {
      thumbIndexDistance: this.calculateDistance(landmarks[4], landmarks[8]),
      indexMiddleDistance: this.calculateDistance(landmarks[8], landmarks[12]),
      middleRingDistance: this.calculateDistance(landmarks[12], landmarks[16]),
      ringPinkyDistance: this.calculateDistance(landmarks[16], landmarks[20]),
      thumbPinkyDistance: this.calculateDistance(landmarks[4], landmarks[20]),
      handOpenness: this.calculateHandOpenness(landmarks),
    };

    // Compare with profile's average
    let totalDifference = 0;
    let measurementCount = 0;

    Object.keys(currentDistances).forEach(key => {
      const current = currentDistances[key as keyof typeof currentDistances];
      const average = profile.averageDistances[key as keyof typeof profile.averageDistances];
      
      if (average > 0) {
        const difference = Math.abs(current - average) / average;
        totalDifference += difference;
        measurementCount++;
      }
    });

    const averageDifference = totalDifference / measurementCount;
    const similarity = Math.max(0, 1 - averageDifference);

    return { similarity };
  }

  /**
   * Build sentence from recent gestures
   */
  private buildSentence(): string {
    const recentGestures = this.gestureBuffer.slice(-10);
    if (recentGestures.length === 0) return '';

    // Simple sentence building - join recent unique gestures
    const uniqueGestures = [...new Set(recentGestures.map(g => g.sign))];
    return uniqueGestures.join(' ');
  }

  /**
   * Categorize gesture based on name (simple heuristic)
   */
  private categorizeGesture(gestureName: string): 'number' | 'alphabet' | 'word' | 'phrase' | 'action' {
    const name = gestureName.toLowerCase();
    
    if (/^[0-9]+$/.test(name) || ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'].includes(name)) {
      return 'number';
    }
    
    if (name.length === 1 && /^[a-z]$/.test(name)) {
      return 'alphabet';
    }
    
    if (name.split(' ').length > 2) {
      return 'phrase';
    }
    
    if (['hello', 'goodbye', 'please', 'thanks', 'yes', 'no'].includes(name)) {
      return 'word';
    }
    
    return 'action';
  }

  /**
   * Utility: Calculate distance between two 3D points
   */
  private calculateDistance(
    a: { x: number; y: number; z?: number },
    b: { x: number; y: number; z?: number }
  ): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z || 0) - (b.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Utility: Calculate hand openness (average distance from palm to fingertips)
   */
  private calculateHandOpenness(landmarks: HandLandmarks): number {
    let totalDistance = 0;
    const fingerTips = [4, 8, 12, 16, 20];
    const palm = landmarks[0];

    fingerTips.forEach(tipIndex => {
      totalDistance += this.calculateDistance(landmarks[tipIndex], palm);
    });

    return totalDistance / fingerTips.length;
  }

  /**
   * Reset recognition state
   */
  public reset(): void {
    this.gestureBuffer = [];
    this.sequenceBuffer = [];
    this.lastRecognizedSign = '';
    this.lastRecognizedTime = 0;
    this.gestureStabilityCounter = 0;
    console.log('🔄 Trained gesture recognizer reset');
  }

  /**
   * Clear gesture buffer
   */
  public clearBuffer(): void {
    this.gestureBuffer = [];
    this.sequenceBuffer = [];
    this.gestureStabilityCounter = 0;
  }

  /**
   * Get gesture history (recent gestures)
   */
  public getGestureHistory(): EnhancedISLGesture[] {
    return [...this.gestureBuffer];
  }

  /**
   * Get sequence history
   */
  public getSequenceHistory(): GestureSequence[] {
    return [...this.sequenceBuffer];
  }

  /**
   * Get statistics
   */
  public async getStats() {
    const trainedGestures = await gestureTrainer.getTrainedGestures();
    const trainingStats = await gestureTrainer.getTrainingStats();

    return {
      trainedGesturesCount: trainedGestures.length,
      recentGesturesCount: this.gestureBuffer.length,
      lastRecognizedSign: this.lastRecognizedSign,
      trainingStats: trainingStats,
    };
  }
}
