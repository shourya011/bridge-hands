import { HandLandmarks } from '@/components/WebcamCapture';

// Enhanced gesture types with more details
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

// Enhanced Hand Gesture Recognizer with ML-like features
export class AdvancedHandGestureRecognizer {
  private gestureBuffer: EnhancedISLGesture[] = [];
  private sequenceBuffer: GestureSequence[] = [];
  private readonly bufferSize = 45; // 1.5 seconds at 30fps
  private readonly sequenceTimeout = 3000; // 3 seconds
  private readonly confidenceThreshold = 0.65; // Lowered for better detection
  private readonly minimumGestureHoldTime = 600; // Reduced to 600ms for faster response
  private readonly gestureChangeDebounce = 1200; // 1.2s cooldown between different gestures
  private lastGestureTime = 0;
  private gestureStartTime = 0;
  private lastRecognizedSign: string = '';
  private lastRecognizedTime = 0;
  private gestureStabilityCounter = 0;
  private readonly stabilityThreshold = 8; // Reduced to 8 frames (~270ms at 30fps) for faster recognition

  // Expanded ISL vocabulary with full alphabet and gestures
  private readonly vocabulary = {
    // Numbers 0-100
    numbers: ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
              'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
              'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety', 'Hundred'],
    
    // Full A-Z alphabet (ASL/ISL/BSL universal)
    alphabet: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
               'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    
    // Common gestures (ASL/ISL/BSL)
    commonGestures: ['Bye', 'Call Me', 'Dislike', 'Like', 'Good Job', 'Good Luck', 'Peace', 'Praying', 
                     'Rock On', 'I Love You', 'Okay', 'Victory', 'Stop'],
    
    // Greetings & farewells
    greetings: ['Hello', 'Hi', 'Goodbye', 'Good Morning', 'Good Afternoon', 'Good Evening', 'Good Night', 
                'Welcome', 'Nice to Meet You', 'How Are You', 'See You Later'],
    
    // Courtesy & politeness
    courtesy: ['Please', 'Thank You', 'Thanks', 'Sorry', 'Excuse Me', 'Pardon', 'You\'re Welcome', 
               'No Problem', 'My Pleasure'],
    
    // Affirmation & negation
    affirmation: ['Yes', 'No', 'OK', 'Okay', 'Alright', 'Sure', 'Good', 'Bad', 'Great', 'Excellent', 
                  'Maybe', 'Perhaps', 'Correct', 'Wrong', 'Right', 'Agree', 'Disagree'],
    
    // Questions
    questions: ['What', 'Where', 'When', 'Who', 'Why', 'How', 'Which', 'Whose', 'Can', 'Could', 
                'Would', 'Should', 'Do', 'Does', 'Did', 'Is', 'Are', 'Am'],
    
    // Actions & verbs
    actions: ['Go', 'Come', 'Stop', 'Wait', 'Help', 'Eat', 'Drink', 'Sleep', 'Wake Up', 'Sit', 
              'Stand', 'Walk', 'Run', 'Give', 'Take', 'Open', 'Close', 'Read', 'Write', 'Listen', 
              'Look', 'See', 'Hear', 'Think', 'Know', 'Understand', 'Learn', 'Teach', 'Work', 'Play'],
    
    // Family & relationships
    family: ['Mother', 'Mom', 'Father', 'Dad', 'Brother', 'Sister', 'Son', 'Daughter', 'Grandmother', 
             'Grandfather', 'Uncle', 'Aunt', 'Cousin', 'Husband', 'Wife', 'Family', 'Friend', 'Baby', 
             'Child', 'Children'],
    
    // Daily life & objects
    daily: ['Water', 'Food', 'Milk', 'Tea', 'Coffee', 'Bread', 'Rice', 'Home', 'House', 'School', 
            'College', 'University', 'Work', 'Office', 'Money', 'Book', 'Pen', 'Phone', 'Computer', 
            'Car', 'Bus', 'Train', 'Bathroom', 'Bedroom', 'Kitchen', 'Door', 'Window', 'Table', 'Chair'],
    
    // Time & dates
    time: ['Now', 'Today', 'Tomorrow', 'Yesterday', 'Morning', 'Afternoon', 'Evening', 'Night', 
           'Day', 'Week', 'Month', 'Year', 'Time', 'Hour', 'Minute', 'Second', 'Late', 'Early', 'On Time'],
    
    // Emotions & feelings
    emotions: ['Happy', 'Sad', 'Angry', 'Scared', 'Tired', 'Excited', 'Bored', 'Worried', 'Calm', 
               'Nervous', 'Love', 'Hate', 'Like', 'Dislike', 'Feel', 'Hurt', 'Pain', 'Sick', 'Healthy'],
    
    // Colors
    colors: ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Orange', 'Purple', 'Pink', 'Brown', 
             'Gray', 'Color'],
    
    // Pronouns
    pronouns: ['I', 'You', 'He', 'She', 'It', 'We', 'They', 'Me', 'Him', 'Her', 'Us', 'Them', 
               'My', 'Your', 'His', 'Her', 'Our', 'Their', 'Mine', 'Yours', 'This', 'That', 'These', 'Those'],
    
    // Common adjectives
    adjectives: ['Big', 'Small', 'Hot', 'Cold', 'New', 'Old', 'Young', 'Fast', 'Slow', 'Easy', 
                 'Difficult', 'Hard', 'Soft', 'Clean', 'Dirty', 'Beautiful', 'Ugly', 'Good', 'Bad', 
                 'Happy', 'Sad', 'Rich', 'Poor', 'Strong', 'Weak', 'Full', 'Empty'],
    
    // Places
    places: ['Home', 'School', 'Hospital', 'Restaurant', 'Store', 'Shop', 'Bank', 'Post Office', 
             'Police Station', 'Airport', 'Station', 'Park', 'Garden', 'Beach', 'Mountain', 'City', 
             'Village', 'Country', 'World'],
    
    // Emergency & medical
    emergency: ['Help', 'Emergency', 'Doctor', 'Nurse', 'Medicine', 'Hospital', 'Ambulance', 'Police', 
                'Fire', 'Danger', 'Safe', 'Hurt', 'Pain', 'Sick', 'Accident', 'Call'],
    
    // Numbers in phrases
    numberPhrases: ['First', 'Second', 'Third', 'Last', 'Next', 'All', 'Some', 'Many', 'Few', 'More', 
                    'Less', 'Most', 'Least', 'Half', 'Quarter', 'Whole', 'Double', 'Triple'],
  };

  // Calculate hand shape features
  private extractHandFeatures(landmarks: HandLandmarks): {
    fingersExtended: boolean[];
    palmOrientation: 'up' | 'down' | 'left' | 'right' | 'forward' | 'back';
    handOpenness: number;
    thumbPosition: 'up' | 'down' | 'side' | 'crossed';
  } {
    const fingers = this.getFingerStates(landmarks);
    const palm = this.getPalmOrientation(landmarks);
    const openness = this.calculateHandOpenness(landmarks);
    const thumb = this.getThumbPosition(landmarks);

    return {
      fingersExtended: fingers,
      palmOrientation: palm,
      handOpenness: openness,
      thumbPosition: thumb,
    };
  }

  private getFingerStates(landmarks: HandLandmarks): boolean[] {
    const fingerIndices = [
      [1, 2, 3, 4],   // Thumb
      [5, 6, 7, 8],   // Index
      [9, 10, 11, 12], // Middle
      [13, 14, 15, 16], // Ring
      [17, 18, 19, 20], // Pinky
    ];

    return fingerIndices.map(indices => this.isFingerExtended(landmarks, indices));
  }

  private isFingerExtended(landmarks: HandLandmarks, fingerIndices: number[]): boolean {
    const tip = landmarks[fingerIndices[3]];
    const dip = landmarks[fingerIndices[2]];
    const pip = landmarks[fingerIndices[1]];
    const mcp = landmarks[fingerIndices[0]];
    const wrist = landmarks[0];

    // Multiple checks for maximum accuracy
    const tipToWrist = this.calculateDistance(tip, wrist);
    const mcpToWrist = this.calculateDistance(mcp, wrist);
    const tipToMcp = this.calculateDistance(tip, mcp);
    const pipToMcp = this.calculateDistance(pip, mcp);
    const dipToMcp = this.calculateDistance(dip, mcp);
    
    // For thumb (special case)
    if (fingerIndices[0] === 1) {
      // Thumb is extended if tip is far from palm center
      const palmCenter = landmarks[9]; // Middle finger MCP
      const thumbToPalm = this.calculateDistance(tip, palmCenter);
      const thumbBase = landmarks[2];
      const thumbExtension = this.calculateDistance(tip, thumbBase);
      
      // Thumb must be both far from palm AND extended from base
      return thumbToPalm > 0.12 && thumbExtension > 0.08;
    }
    
    // For other fingers: multiple criteria for accuracy
    const tipFarFromWrist = tipToWrist > mcpToWrist * 0.95; // Very strict
    const fingerStraight = tipToMcp > pipToMcp * 0.80; // Straightness check
    const progressiveExtension = dipToMcp > pipToMcp * 0.60; // DIP should be farther than PIP
    
    // Finger is extended only if ALL criteria met
    return tipFarFromWrist && fingerStraight && progressiveExtension;
  }

  private getPalmOrientation(landmarks: HandLandmarks): 'up' | 'down' | 'left' | 'right' | 'forward' | 'back' {
    const wrist = landmarks[0];
    const middleMCP = landmarks[9];
    
    const dy = middleMCP.y - wrist.y;
    const dx = middleMCP.x - wrist.x;
    
    if (Math.abs(dy) > Math.abs(dx)) {
      return dy < 0 ? 'up' : 'down';
    } else {
      return dx < 0 ? 'left' : 'right';
    }
  }

  private calculateHandOpenness(landmarks: HandLandmarks): number {
    let totalDistance = 0;
    const fingerTips = [4, 8, 12, 16, 20];
    const palm = landmarks[0];

    fingerTips.forEach(tipIndex => {
      totalDistance += this.calculateDistance(landmarks[tipIndex], palm);
    });

    return totalDistance / fingerTips.length;
  }

  private getThumbPosition(landmarks: HandLandmarks): 'up' | 'down' | 'side' | 'crossed' {
    const thumbTip = landmarks[4];
    const thumbBase = landmarks[2];
    const wrist = landmarks[0];
    const indexBase = landmarks[5];

    const thumbToIndex = this.calculateDistance(thumbTip, indexBase);
    const dy = thumbTip.y - thumbBase.y;
    const dx = thumbTip.x - wrist.x;

    if (thumbToIndex < 0.05) return 'crossed';
    if (dy < -0.1) return 'up';
    if (dy > 0.1) return 'down';
    return 'side';
  }

  private calculateDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
    return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
  }

  private calculateAngle(a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }

  // Enhanced gesture recognition with comprehensive sign vocabulary (A-Z + Numbers + Gestures)
  private recognizeAdvancedGesture(landmarks: HandLandmarks, handsCount: number): EnhancedISLGesture | null {
    if (landmarks.length !== 21) return null;

    const features = this.extractHandFeatures(landmarks);
    const [thumb, index, middle, ring, pinky] = features.fingersExtended;
    const extendedCount = features.fingersExtended.filter(Boolean).length;

    let sign = '';
    let confidence = 0.75;
    let category: EnhancedISLGesture['category'] = 'word';
    let complexity: EnhancedISLGesture['complexity'] = 'simple';

    // Calculate additional metrics for precision
    const thumbTip = landmarks[4];
    const thumbIP = landmarks[3];
    const indexTip = landmarks[8];
    const indexMCP = landmarks[5];
    const middleTip = landmarks[12];
    const middleMCP = landmarks[9];
    const ringTip = landmarks[16];
    const ringMCP = landmarks[13];
    const pinkyTip = landmarks[20];
    const pinkyMCP = landmarks[17];
    const wrist = landmarks[0];
    
    const thumbIndexDistance = this.calculateDistance(thumbTip, indexTip);
    const indexMiddleDistance = this.calculateDistance(indexTip, middleTip);
    const thumbMiddleDistance = this.calculateDistance(thumbTip, middleTip);
    const indexRingDistance = this.calculateDistance(indexTip, ringTip);
    const middlePinkyDistance = this.calculateDistance(middleTip, pinkyTip);
    
    // Calculate finger heights relative to wrist (positive = above wrist)
    const thumbHeight = wrist.y - thumbTip.y;
    const indexHeight = wrist.y - indexTip.y;
    const middleHeight = wrist.y - middleTip.y;
    const ringHeight = wrist.y - ringTip.y;
    const pinkyHeight = wrist.y - pinkyTip.y;
    
    // Calculate finger angles for better precision
    const indexAngle = this.calculateAngle(indexMCP, landmarks[6], indexTip);
    const middleAngle = this.calculateAngle(middleMCP, landmarks[10], middleTip);
    
    // Check if thumb is clearly separated from other fingers
    const thumbSeparated = thumbIndexDistance > 0.08;

    // ============ PRIORITY 1: CLOSED FIST GESTURES (0, A, E, S, M, N, T) ============
    if (extendedCount === 0) {
      // All fingers closed
      const thumbPos = features.thumbPosition;
      
      if (thumbPos === 'side' && thumbSeparated) {
        sign = 'A';
        category = 'alphabet';
        confidence = 0.90;
      } else if (thumbPos === 'crossed' || thumbIndexDistance < 0.05) {
        sign = 'S';
        category = 'alphabet';
        confidence = 0.88;
      } else if (features.palmOrientation === 'down') {
        sign = 'M / N / T';
        category = 'alphabet';
        confidence = 0.82;
      } else {
        sign = 'Zero (0)';
        category = 'number';
        confidence = 0.86;
      }
    }

    // ============ PRIORITY 2: THUMB ONLY (Thumbs Up/Down) ============
    else if (extendedCount === 1 && thumb && !index && !middle && !ring && !pinky) {
      // ONLY thumb extended = definitely thumbs up/down
      if (thumbHeight > 0.20) {
        // Thumb is clearly above wrist
        sign = 'Thumbs Up / Like / Good';
        category = 'word';
        confidence = 0.95;
        complexity = 'simple';
      } else if (thumbHeight < -0.20) {
        // Thumb is clearly below wrist
        sign = 'Thumbs Down / Dislike / Bad';
        category = 'word';
        confidence = 0.93;
        complexity = 'simple';
      } else {
        // Thumb is horizontal
        sign = 'Ten (10)';
        category = 'number';
        confidence = 0.82;
      }
    }

    // ============ PRIORITY 3: INDEX ONLY (Number 1) ============
    else if (extendedCount === 1 && index && !thumb && !middle && !ring && !pinky) {
      // ONLY index finger extended
      if (features.palmOrientation === 'forward' || indexHeight > 0.15) {
        sign = 'One (1)';
        category = 'number';
        confidence = 0.94;
      } else {
        sign = 'One (1) / Point';
        category = 'number';
        confidence = 0.88;
      }
    }

    // ============ PRIORITY 4: PINKY ONLY (Letter I) ============
    else if (extendedCount === 1 && pinky && !thumb && !index && !middle && !ring) {
      sign = 'I';
      category = 'alphabet';
      confidence = 0.90;
    }

    // ============ PRIORITY 5: INDEX + MIDDLE (Number 2 / Peace) ============
    else if (extendedCount === 2 && index && middle && !thumb && !ring && !pinky) {
      const spread = indexMiddleDistance;
      
      // Check if fingers are crossed (for letter R)
      const indexDIP = landmarks[7];
      const middleDIP = landmarks[11];
      const crossDistance = this.calculateDistance(indexDIP, middleDIP);
      const areCrossed = crossDistance < 0.03; // Very close = crossed
      
      if (areCrossed && spread < 0.05) {
        // Fingers crossed = Letter R
        sign = 'R / Good Luck';
        category = 'alphabet';
        confidence = 0.88;
      } else if (spread < 0.04) {
        // Fingers very close together = U
        sign = 'U / Two (2)';
        category = 'alphabet';
        confidence = 0.92;
      } else if (spread >= 0.08) {
        // Fingers clearly spread apart = Peace/Victory sign
        sign = 'Peace / Victory / V';
        category = 'word';
        confidence = 0.96;
        complexity = 'simple';
      } else if (spread >= 0.04 && spread < 0.08) {
        // Medium spread = likely Two or beginning of Peace
        if (features.palmOrientation === 'forward') {
          sign = 'Two (2)';
          category = 'number';
          confidence = 0.90;
        } else {
          // Default to Peace if palm not clearly forward
          sign = 'Peace / Victory / V';
          category = 'word';
          confidence = 0.85;
        }
      } else {
        // Fallback
        sign = 'Two (2) / V';
        category = 'number';
        confidence = 0.80;
      }
    }

    // ============ PRIORITY 6: THUMB + INDEX (L shape / Gun / Point) ============
    else if (extendedCount === 2 && thumb && index && !middle && !ring && !pinky) {
      // Calculate the angle between thumb and index
      const thumbIndexAngle = Math.abs(Math.atan2(indexTip.y - thumbTip.y, indexTip.x - thumbTip.x) * 180 / Math.PI);
      const isLShape = thumbIndexAngle > 70 && thumbIndexAngle < 110; // Approximately 90 degrees
      
      if (thumbIndexDistance < 0.06) {
        // Fingers very close = C shape
        sign = 'C';
        category = 'alphabet';
        confidence = 0.86;
      } else if (isLShape && thumbSeparated && features.palmOrientation === 'forward') {
        // Clear L shape with palm forward
        sign = 'L';
        category = 'alphabet';
        confidence = 0.90;
      } else if (!isLShape && thumbHeight > indexHeight) {
        // Thumb higher than index = not a gun
        sign = 'L';
        category = 'alphabet';
        confidence = 0.82;
      } else if (Math.abs(thumbHeight - indexHeight) < 0.10 && features.palmOrientation !== 'forward') {
        // Thumb and index at similar height, palm sideways = Gun
        sign = 'Gun / Point';
        category = 'action';
        confidence = 0.85;
      } else {
        // Default to L
        sign = 'L';
        category = 'alphabet';
        confidence = 0.78;
      }
    }

    // ============ PRIORITY 7: THUMB + PINKY (Y / Call Me) ============
    else if (extendedCount === 2 && thumb && pinky && !index && !middle && !ring) {
      sign = 'Y / Call Me / Six (6)';
      category = 'alphabet';
      confidence = 0.90;
      complexity = 'simple';
    }

    // ============ PRIORITY 8: INDEX + PINKY (Rock On / ILY) ============
    else if (extendedCount === 2 && index && pinky && !thumb && !middle && !ring) {
      if (thumb) {
        sign = 'I Love You / ILY';
        category = 'word';
        confidence = 0.90;
      } else {
        sign = 'Rock On / Metal';
        category = 'word';
        confidence = 0.88;
      }
      complexity = 'moderate';
    }

    // ============ PRIORITY 9: THREE FINGERS - INDEX + MIDDLE + RING (Number 3 / W) ============
    else if (extendedCount === 3 && index && middle && ring && !thumb && !pinky) {
      const indexMiddleSpread = indexMiddleDistance;
      const middleRingSpread = this.calculateDistance(middleTip, ringTip);
      const totalSpread = indexMiddleSpread + middleRingSpread;
      
      // W has wider spread between all fingers
      if (indexMiddleSpread > 0.09 && middleRingSpread > 0.09 && features.palmOrientation === 'forward') {
        sign = 'W';
        category = 'alphabet';
        confidence = 0.90;
      } else if (totalSpread > 0.15) {
        // Moderately spread
        sign = 'W / Three (3)';
        category = 'alphabet';
        confidence = 0.85;
      } else {
        // Fingers together = Number 3
        sign = 'Three (3)';
        category = 'number';
        confidence = 0.94;
      }
    }

    // ============ PRIORITY 10: THREE FINGERS - THUMB + INDEX + MIDDLE ============
    else if (extendedCount === 3 && thumb && index && middle && !ring && !pinky) {
      if (thumbMiddleDistance < 0.07) {
        // Thumb touching middle finger
        sign = 'D';
        category = 'alphabet';
        confidence = 0.86;
      } else if (features.handOpenness > 0.25) {
        sign = 'Seven (7)';
        category = 'number';
        confidence = 0.84;
      } else {
        sign = 'Nine (9)';
        category = 'number';
        confidence = 0.82;
      }
    }

    // ============ PRIORITY 11: FOUR FINGERS - NO THUMB (Number 4 / B) ============
    else if (extendedCount === 4 && index && middle && ring && pinky && !thumb) {
      if (features.palmOrientation === 'forward') {
        sign = 'Four (4) / B';
        category = 'number';
        confidence = 0.94;
      } else {
        sign = 'B';
        category = 'alphabet';
        confidence = 0.90;
      }
    }

    // ============ PRIORITY 12: FOUR FINGERS - WITH THUMB ============
    else if (extendedCount === 4 && thumb) {
      if (index && middle && ring && !pinky) {
        sign = 'Eight (8)';
        category = 'number';
        confidence = 0.86;
      } else {
        sign = 'Four (4)';
        category = 'number';
        confidence = 0.82;
      }
    }

    // ============ PRIORITY 13: FIVE FINGERS (5 / Hello / Stop / OK) ============
    else if (extendedCount === 5) {
      const allFingersSpread = features.handOpenness > 0.30;
      
      // Check for OK sign (thumb + index forming circle)
      const thumbIndexTouching = thumbIndexDistance < 0.05;
      const otherFingersExtended = middle && ring && pinky;
      
      if (thumbIndexTouching && otherFingersExtended) {
        // Clear OK sign = thumb and index forming tight circle
        sign = 'OK / Okay / F';
        category = 'word';
        confidence = 0.95;
        complexity = 'simple';
      } else if (thumbIndexDistance < 0.08 && features.handOpenness < 0.25) {
        // Moderate circle shape
        sign = 'OK / Okay';
        category = 'word';
        confidence = 0.88;
        complexity = 'simple';
      } else if (allFingersSpread && features.palmOrientation === 'forward') {
        // All fingers widely spread, palm forward = 5 / Hello
        sign = 'Five (5) / Hello / Hi';
        category = 'number';
        confidence = 0.98;
      } else if (features.palmOrientation === 'up') {
        // Palm facing up = Stop
        sign = 'Stop / Wait';
        category = 'action';
        confidence = 0.94;
      } else if (features.handOpenness > 0.20 && features.handOpenness < 0.30) {
        // Curved fingers = O shape
        sign = 'O';
        category = 'alphabet';
        confidence = 0.86;
      } else {
        // Default to 5
        sign = 'Five (5)';
        category = 'number';
        confidence = 0.92;
      }
    }

    // ============ PRIORITY 14: TWO HAND GESTURES ============
    else if (handsCount === 2) {
      if (extendedCount === 5) {
        sign = 'Ten (10)';
        category = 'number';
        confidence = 0.90;
      } else if (features.handOpenness > 0.15) {
        sign = 'Praying / Namaste / Thank You';
        category = 'phrase';
        confidence = 0.88;
        complexity = 'complex';
      } else {
        sign = 'Twenty (20)';
        category = 'number';
        confidence = 0.82;
      }
    }

    // ============ ENHANCED GESTURE VALIDATION WITH STABILITY CHECK ============
    if (sign && confidence >= this.confidenceThreshold) {
      // Check if this is the same gesture as before
      if (sign === this.lastRecognizedSign) {
        this.gestureStabilityCounter++;
      } else {
        // Different gesture detected
        this.gestureStabilityCounter = 1;
        this.lastRecognizedSign = sign;
      }

      // Only return gesture if it's been stable for enough frames
      if (this.gestureStabilityCounter >= this.stabilityThreshold) {
        const now = Date.now();
        
        // Check if enough time has passed since last recognition
        if (now - this.lastRecognizedTime < this.gestureChangeDebounce) {
          return null; // Too soon, prevent spam
        }
        
        const duration = this.gestureStartTime > 0 ? now - this.gestureStartTime : 0;
        
        // Ensure minimum hold time
        if (duration < this.minimumGestureHoldTime && this.gestureStartTime > 0) {
          return null; // Gesture not held long enough
        }
        
        this.lastRecognizedTime = now;
        
        return {
          sign,
          category,
          confidence,
          timestamp: now,
          duration,
          handUsed: handsCount === 2 ? 'both' : 'right',
          complexity,
        };
      }
    }

    return null;
  }

  // Process landmarks and build sequences
  public processLandmarks(handsLandmarks: HandLandmarks[]): RecognitionResult {
    if (handsLandmarks.length === 0) {
      this.resetGestureTimer();
      return {
        gesture: null,
        sentence: '',
        confidence: 0,
        suggestions: [],
      };
    }

    const now = Date.now();
    if (this.gestureStartTime === 0) {
      this.gestureStartTime = now;
    }

    const gesture = this.recognizeAdvancedGesture(handsLandmarks[0], handsLandmarks.length);

    if (gesture) {
      this.gestureBuffer.push(gesture);
      if (this.gestureBuffer.length > this.bufferSize) {
        this.gestureBuffer.shift();
      }

      const stableGesture = this.getMostFrequentGesture();
      const sentence = this.buildSentenceFromSequence();
      const suggestions = this.generateSuggestions(stableGesture);

      this.lastGestureTime = now;

      return {
        gesture: stableGesture,
        sentence,
        confidence: stableGesture.confidence,
        suggestions,
      };
    }

    // Check for sequence timeout
    if (now - this.lastGestureTime > this.sequenceTimeout && this.gestureBuffer.length > 0) {
      this.finalizeSequence();
    }

    return {
      gesture: null,
      sentence: this.buildSentenceFromSequence(),
      confidence: 0,
      suggestions: [],
    };
  }

  private getMostFrequentGesture(): EnhancedISLGesture {
    const gestureCounts = new Map<string, { count: number; gesture: EnhancedISLGesture }>();

    this.gestureBuffer.forEach((gesture) => {
      const current = gestureCounts.get(gesture.sign);
      if (current) {
        current.count++;
      } else {
        gestureCounts.set(gesture.sign, { count: 1, gesture });
      }
    });

    let maxCount = 0;
    let mostFrequent: EnhancedISLGesture = this.gestureBuffer[this.gestureBuffer.length - 1];

    gestureCounts.forEach((value) => {
      if (value.count > maxCount) {
        maxCount = value.count;
        mostFrequent = value.gesture;
      }
    });

    return mostFrequent;
  }

  private buildSentenceFromSequence(): string {
    if (this.sequenceBuffer.length === 0) return '';
    
    const latestSequence = this.sequenceBuffer[this.sequenceBuffer.length - 1];
    return latestSequence.sentence;
  }

  private finalizeSequence(): void {
    if (this.gestureBuffer.length === 0) return;

    const uniqueGestures = this.getUniqueGestures();
    const sentence = uniqueGestures.map(g => g.sign.split('/')[0].trim()).join(' ');
    
    const sequence: GestureSequence = {
      gestures: [...uniqueGestures],
      sentence,
      context: this.determineContext(uniqueGestures),
      startTime: uniqueGestures[0].timestamp,
      endTime: uniqueGestures[uniqueGestures.length - 1].timestamp,
    };

    this.sequenceBuffer.push(sequence);
    if (this.sequenceBuffer.length > 10) {
      this.sequenceBuffer.shift();
    }

    this.gestureBuffer = [];
    this.gestureStartTime = 0;
  }

  private getUniqueGestures(): EnhancedISLGesture[] {
    const unique: EnhancedISLGesture[] = [];
    let lastSign = '';

    this.gestureBuffer.forEach(gesture => {
      if (gesture.sign !== lastSign) {
        unique.push(gesture);
        lastSign = gesture.sign;
      }
    });

    return unique;
  }

  private determineContext(gestures: EnhancedISLGesture[]): string {
    const categories = gestures.map(g => g.category);
    
    if (categories.every(c => c === 'number')) return 'counting';
    if (categories.includes('phrase')) return 'conversation';
    if (categories.includes('action')) return 'instruction';
    if (categories.includes('word')) return 'statement';
    
    return 'general';
  }

  private generateSuggestions(gesture: EnhancedISLGesture): string[] {
    const suggestions: string[] = [];
    
    // Suggest next likely signs based on category
    if (gesture.category === 'word') {
      suggestions.push('Thank You', 'Please', 'Yes', 'No');
    } else if (gesture.category === 'number') {
      const num = parseInt(gesture.sign.match(/\d+/)?.[0] || '0');
      if (num < 10) suggestions.push(`${num + 1}`, `${num - 1}`);
    } else if (gesture.category === 'action') {
      suggestions.push('Stop', 'Go', 'Wait', 'Help');
    }

    return suggestions.slice(0, 3);
  }

  private resetGestureTimer(): void {
    const now = Date.now();
    if (this.lastGestureTime > 0 && now - this.lastGestureTime > this.sequenceTimeout) {
      this.finalizeSequence();
    }
  }

  public clearBuffer(): void {
    this.gestureBuffer = [];
    this.sequenceBuffer = [];
    this.gestureStartTime = 0;
    this.lastGestureTime = 0;
    this.lastRecognizedSign = '';
    this.lastRecognizedTime = 0;
    this.gestureStabilityCounter = 0;
  }

  public getGestureHistory(): EnhancedISLGesture[] {
    return [...this.gestureBuffer];
  }

  public getSequenceHistory(): GestureSequence[] {
    return [...this.sequenceBuffer];
  }
}

// Singleton instance
export const advancedISLRecognizer = new AdvancedHandGestureRecognizer();
