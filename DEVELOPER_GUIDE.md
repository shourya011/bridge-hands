# Developer Quick Reference - Enhanced ISL Translation System

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📚 Service API Reference

### 1. Advanced ISL Recognition

```typescript
import { AdvancedHandGestureRecognizer } from '@/services/advancedISLRecognition';

const recognizer = new AdvancedHandGestureRecognizer();

// Process hand landmarks
const result = recognizer.processLandmarks(handsLandmarks);

// Result contains:
result.gesture        // Detected gesture with metadata
result.sentence       // Built sentence from sequence
result.confidence     // Detection confidence (0-1)
result.suggestions    // Next gesture suggestions

// Manage buffers
recognizer.clearBuffer();
recognizer.getGestureHistory();
recognizer.getSequenceHistory();
```

### 2. Translation Engine

```typescript
import { translationEngine, SupportedLanguage } from '@/services/translationEngine';

// Translate single sign
const translation = translationEngine.translate(
  'Hello',
  'hindi',
  { previousSigns: [], category: 'greeting' }
);

// Translation contains:
translation.translatedText    // "नमस्ते"
translation.language          // "hindi"
translation.confidence        // 0.95
translation.alternatives      // ["हैलो"]
translation.pronunciation     // "namaste"

// Translate sentence
const sentence = translationEngine.translateSentence(
  ['Hello', 'Thank You'],
  'tamil'
);

// Get supported languages
const languages = translationEngine.getSupportedLanguages();
// ['english', 'hindi', 'bengali', 'tamil', 'telugu', 'marathi', ...]

// Get language display name
const name = translationEngine.getLanguageName('hindi');
// "हिंदी (Hindi)"
```

### 3. Subtitle Generator

```typescript
import { subtitleGenerator, SubtitleExportOptions } from '@/services/subtitleGenerator';

// Add subtitle
const subtitle = subtitleGenerator.addSubtitle(
  'Hello, how are you?',
  'english',
  0.95,
  3000  // Optional duration in ms
);

// Get current subtitle
const current = subtitleGenerator.getCurrentSubtitle();

// Export subtitles
const srtContent = subtitleGenerator.export({
  format: 'srt',
  includeTimestamps: true,
  includeConfidence: false
});

// Download subtitle file
subtitleGenerator.download('my-subtitles', {
  format: 'vtt',
  includeTimestamps: true
});

// Get statistics
const stats = subtitleGenerator.getStatistics();
// {
//   totalSubtitles: 42,
//   averageConfidence: 0.92,
//   totalDuration: 126000,
//   languages: ['english', 'hindi']
// }

// Clear all subtitles
subtitleGenerator.clear();

// Customize styling
subtitleGenerator.defaultStyle = {
  fontSize: 28,
  fontFamily: 'Arial, sans-serif',
  color: '#FFFFFF',
  backgroundColor: '#000000',
  opacity: 0.9,
  position: 'bottom',
  alignment: 'center',
  outlineColor: '#000000',
  outlineWidth: 2
};
```

### 4. Enhanced Voice Assistant

```typescript
import { voiceAssistant, VoiceEmotion } from '@/services/enhancedVoiceAssistant';

// Speak with default settings
await voiceAssistant.speak('Hello, how are you?', {
  language: 'english'
});

// Speak with emotion
await voiceAssistant.speakWithEmotion(
  'I am so happy!',
  'english',
  'happy'  // neutral | happy | sad | excited | calm | urgent
);

// Speak with custom settings
await voiceAssistant.speak('नमस्ते', {
  language: 'hindi',
  rate: 1.0,      // 0.1 - 10
  pitch: 1.0,     // 0 - 2
  volume: 1.0,    // 0 - 1
  emotion: 'calm'
}, 5);  // Priority (higher = more urgent)

// Control playback
voiceAssistant.pause();
voiceAssistant.resume();
voiceAssistant.stop();
voiceAssistant.clearQueue();

// Enable/disable
voiceAssistant.setEnabled(true);

// Check status
const status = voiceAssistant.getQueueStatus();
// {
//   queueLength: 3,
//   isSpeaking: true,
//   isEnabled: true,
//   currentText: 'Hello world'
// }

// Get available voices
const voices = voiceAssistant.getAvailableVoices('hindi');

// Test speech
await voiceAssistant.test('tamil');
```

### 5. Enhanced Translation Hook

```typescript
import { useEnhancedTranslation } from '@/hooks/useEnhancedTranslation';

function MyComponent() {
  const {
    // State
    currentGesture,        // Current detected gesture
    currentTranslation,    // Translation result
    currentSentence,       // Built sentence
    targetLanguage,        // Selected language
    history,               // Translation history array
    metrics,               // Performance metrics
    isProcessing,          // Is currently processing
    audioEnabled,          // Audio toggle state
    subtitlesEnabled,      // Subtitles toggle state
    voiceEmotion,          // Current emotion
    
    // Methods
    processHandLandmarks,  // (landmarks, handedness) => void
    setTargetLanguage,     // (lang: SupportedLanguage) => void
    toggleAudio,           // () => void
    toggleSubtitles,       // () => void
    setVoiceEmotion,       // (emotion: VoiceEmotion) => void
    clearSentence,         // () => void
    clearHistory,          // () => void
    clearSubtitles,        // () => void
    stopVoice,             // () => void
    getContext,            // () => string
    getSuggestions,        // () => string[]
    reset,                 // () => void
    
    // Utilities
    supportedLanguages,    // SupportedLanguage[]
    getLanguageName,       // (lang) => string
  } = useEnhancedTranslation('english');
  
  return (
    <div>
      <p>Detected: {currentGesture?.sign}</p>
      <p>Translation: {currentTranslation?.translatedText}</p>
      <p>Accuracy: {metrics.accuracy}%</p>
    </div>
  );
}
```

---

## 🎯 Common Patterns

### Pattern 1: Basic Translation Flow

```typescript
// 1. Setup
const {
  processHandLandmarks,
  currentTranslation,
  setTargetLanguage
} = useEnhancedTranslation();

// 2. Set language
setTargetLanguage('hindi');

// 3. Process camera input
<WebcamCapture
  onHandsDetected={(hands) => {
    processHandLandmarks(hands, hands.map(() => 'Unknown'));
  }}
/>

// 4. Display result
{currentTranslation && (
  <p>{currentTranslation.translatedText}</p>
)}
```

### Pattern 2: With Subtitles

```typescript
// 1. Enable subtitles
const { toggleSubtitles, subtitlesEnabled } = useEnhancedTranslation();

// 2. Show overlay
{subtitlesEnabled && (
  <SubtitleOverlay />
)}

// 3. Subtitles auto-generate on each translation
```

### Pattern 3: With Voice

```typescript
// 1. Enable audio
const { toggleAudio, audioEnabled, setVoiceEmotion } = useEnhancedTranslation();

// 2. Set emotion
setVoiceEmotion('happy');

// 3. Voice auto-speaks on each translation
// Or manually:
voiceAssistant.speak('Hello', { language: 'english', emotion: 'happy' });
```

### Pattern 4: Export Subtitles

```typescript
// Automatic download
subtitleGenerator.download('session-2024-11-07', {
  format: 'srt',
  includeTimestamps: true
});

// Or get content for custom handling
const content = subtitleGenerator.export({
  format: 'vtt',
  includeTimestamps: true,
  includeConfidence: true
});

// Send to server
await fetch('/api/save-subtitles', {
  method: 'POST',
  body: JSON.stringify({ content }),
  headers: { 'Content-Type': 'application/json' }
});
```

---

## 🔍 Type Definitions

### EnhancedISLGesture

```typescript
interface EnhancedISLGesture {
  sign: string;                    // e.g., "Hello / Hi / Greetings"
  category: 'number' | 'alphabet' | 'word' | 'phrase' | 'action';
  confidence: number;              // 0-1
  timestamp: number;               // Date.now()
  duration: number;                // milliseconds
  handUsed: 'left' | 'right' | 'both';
  complexity: 'simple' | 'moderate' | 'complex';
}
```

### TranslationResult

```typescript
interface TranslationResult {
  originalSign: string;            // "Hello"
  translatedText: string;          // "नमस्ते"
  language: SupportedLanguage;     // "hindi"
  context: string;                 // "greeting"
  confidence: number;              // 0.95
  alternatives: string[];          // ["हैलो"]
  pronunciation?: string;          // "namaste"
}
```

### SubtitleEntry

```typescript
interface SubtitleEntry {
  id: number;
  startTime: number;               // milliseconds
  endTime: number;                 // milliseconds
  text: string;
  language: string;
  confidence: number;
  speaker?: string;
}
```

### VoiceSettings

```typescript
interface VoiceSettings {
  language: string;
  rate: number;                    // 0.1 - 10 (1 = normal)
  pitch: number;                   // 0 - 2 (1 = normal)
  volume: number;                  // 0 - 1
  emotion?: VoiceEmotion;
}

type VoiceEmotion = 'neutral' | 'happy' | 'sad' | 'excited' | 'calm' | 'urgent';
```

### TranslationMetrics

```typescript
interface TranslationMetrics {
  gesturesDetected: number;        // Total count
  averageConfidence: number;       // 0-1
  processingTime: number;          // milliseconds
  accuracy: number;                // 0-100
  latency: number;                 // milliseconds
}
```

---

## 🎨 UI Components

### SubtitleOverlay

```tsx
import { SubtitleOverlay } from '@/components/SubtitleOverlay';

<SubtitleOverlay
  containerRef={videoContainerRef}
  onClose={() => setShowSubtitles(false)}
/>
```

Features:
- Auto-updates every 100ms
- Built-in settings panel
- Export buttons (SRT, VTT, JSON, TXT)
- Customizable styling

---

## 🐛 Debugging

### Enable Verbose Logging

```typescript
// In browser console
localStorage.setItem('DEBUG_ISL', 'true');

// Check recognition details
console.log(recognizer.getGestureHistory());
console.log(recognizer.getSequenceHistory());

// Check translation engine
console.log(translationEngine.getSupportedLanguages());

// Check subtitle stats
console.log(subtitleGenerator.getStatistics());

// Check voice queue
console.log(voiceAssistant.getQueueStatus());
```

### Common Issues

**Problem**: No gesture detected
```typescript
// Check if hand landmarks are valid
console.log('Hands detected:', hands.length);
console.log('Landmarks:', hands[0]?.length); // Should be 21
```

**Problem**: No audio
```typescript
// Check if voices are loaded
console.log('Voices available:', voiceAssistant.getAvailableVoices('english'));

// Test speech
await voiceAssistant.test('english');
```

**Problem**: Subtitles not showing
```typescript
// Check subtitle buffer
console.log('Current subtitle:', subtitleGenerator.getCurrentSubtitle());
console.log('All subtitles:', subtitleGenerator.getAllSubtitles());
```

---

## 📊 Performance Optimization

### Best Practices

1. **Use memoization for expensive operations**
```typescript
const context = useMemo(() => getContext(), [currentGesture]);
```

2. **Debounce rapid state updates**
```typescript
const debouncedProcess = useMemo(
  () => debounce(processHandLandmarks, 100),
  []
);
```

3. **Clear buffers periodically**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    if (history.length > 50) clearHistory();
  }, 60000); // Every minute
  return () => clearInterval(interval);
}, [history]);
```

4. **Optimize MediaPipe settings**
```typescript
// In WebcamCapture
const handLandmarker = await HandLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: 'hand_landmarker.task',
    delegate: 'GPU'  // Use GPU acceleration
  },
  runningMode: 'VIDEO',
  numHands: 2,
  minHandDetectionConfidence: 0.5,
  minHandPresenceConfidence: 0.5,
  minTrackingConfidence: 0.5
});
```

---

## 🔐 Security Notes

- All processing happens client-side (no data sent to servers)
- Camera permissions required
- Microphone NOT required
- No cookies or tracking
- No external API calls
- Privacy-first design

---

## 📱 Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Edge | 90+ | ✅ Full support |
| Mobile Chrome | Latest | ✅ Full support |
| Mobile Safari | Latest | ✅ Full support |

---

## 🤝 Contributing

When adding new features:

1. Add TypeScript types
2. Document public APIs
3. Add error handling
4. Test with all 11 languages
5. Optimize for performance
6. Update this guide

---

## 📞 Support

For issues or questions:
- Check `BACKEND_FEATURES.md` for detailed documentation
- Review `ARCHITECTURE.md` for system design
- See `QUICKSTART.md` for basic usage

---

**Last Updated**: November 7, 2025
**Maintained by**: ISL Translation Team
