# Technical Architecture - ISL Translation System

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser Environment                       │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    React Application                        │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │          Translate.tsx (Main Page)                   │  │ │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │  │ │
│  │  │  │ Camera   │  │Translation│  │ Stats & Settings│  │  │ │
│  │  │  │ Controls │  │  Output   │  │     Panel       │  │  │ │
│  │  │  └────┬─────┘  └─────▲────┘  └────────▲────────┘  │  │ │
│  │  │       │              │                │            │  │ │
│  │  └───────┼──────────────┼────────────────┼────────────┘  │ │
│  │          │              │                │               │ │
│  │  ┌───────▼──────────────┴────────────────┴────────────┐  │ │
│  │  │       useTranslation Hook (State Manager)          │  │ │
│  │  │  • Translation state   • Metrics tracking          │  │ │
│  │  │  • History management  • Audio control             │  │ │
│  │  │  • Language selection  • Performance monitoring    │  │ │
│  │  └──┬─────────────┬─────────────────┬─────────────────┘  │ │
│  │     │             │                 │                    │ │
│  │  ┌──▼────┐  ┌─────▼──────┐  ┌──────▼─────────┐          │ │
│  │  │Webcam │  │    ISL     │  │      TTS       │          │ │
│  │  │Capture│  │Recognition │  │    Service     │          │ │
│  │  └──┬────┘  └─────┬──────┘  └────────────────┘          │ │
│  └─────┼─────────────┼──────────────────────────────────────┘ │
│        │             │                                         │
│  ┌─────▼─────┐  ┌────▼─────────────────────────┐              │
│  │ MediaPipe │  │  Gesture Pattern Matching    │              │
│  │   Hand    │  │  • Finger detection          │              │
│  │Landmarker │  │  • Angle calculation         │              │
│  │  (WebGL)  │  │  • Temporal smoothing        │              │
│  └───────────┘  └──────────────────────────────┘              │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │              Web APIs                                     │ │
│  │  • WebRTC (Camera)  • WebGL (GPU)  • Web Speech API     │ │
│  └──────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Camera Capture → Hand Detection

```
User Camera
    │
    ▼
WebRTC API (getUserMedia)
    │
    ▼
<Webcam> Component (react-webcam)
    │
    ▼
Video Frame (1280x720 @ 30fps)
    │
    ▼
Canvas Element
    │
    ▼
MediaPipe Hand Landmarker
    │
    ▼
Hand Landmarks (21 points × N hands)
    │
    ▼
Callback: onHandsDetected()
```

### 2. Gesture Recognition → Translation

```
Hand Landmarks Array
    │
    ▼
islRecognizer.processLandmarks()
    │
    ├─► isFingerExtended() × 5 fingers
    │       │
    │       ▼
    │   Finger States (true/false)
    │       │
    │       ▼
    ├─► recognizeStaticGesture()
    │       │
    │       ▼
    │   Pattern Matching
    │       │
    │       ▼
    │   ISLGesture { sign, confidence }
    │       │
    │       ▼
    ├─► Gesture Buffer (30 frames)
    │       │
    │       ▼
    │   getMostFrequentGesture()
    │       │
    │       ▼
    └─► Stable Gesture
            │
            ▼
        translateISL(gesture, language)
            │
            ▼
        Translated Text
```

### 3. Audio Output

```
Translated Text
    │
    ▼
ttsService.speak()
    │
    ├─► findBestVoice(language)
    │       │
    │       ▼
    │   SpeechSynthesisVoice
    │
    ├─► new SpeechSynthesisUtterance(text)
    │       │
    │       ▼
    │   Configure: voice, rate, pitch, volume
    │
    └─► speechSynthesis.speak(utterance)
            │
            ▼
        Audio Output (Speakers)
```

## Component Architecture

### WebcamCapture Component

```typescript
┌─────────────────────────────────────────┐
│         WebcamCapture.tsx               │
├─────────────────────────────────────────┤
│ Props:                                  │
│  • isActive: boolean                    │
│  • onHandsDetected: callback            │
│  • onFrame: callback                    │
├─────────────────────────────────────────┤
│ State:                                  │
│  • handLandmarker: HandLandmarker       │
│  • isModelLoading: boolean              │
│  • error: string                        │
├─────────────────────────────────────────┤
│ Effects:                                │
│  1. Initialize MediaPipe                │
│  2. Process video frames                │
│  3. Draw hand landmarks                 │
├─────────────────────────────────────────┤
│ Refs:                                   │
│  • webcamRef: Webcam                    │
│  • canvasRef: Canvas                    │
│  • animationRef: number                 │
│  • lastDetectionRef: landmarks          │
├─────────────────────────────────────────┤
│ Methods (via ref):                      │
│  • captureFrame() → ImageData           │
│  • getHandLandmarks() → landmarks       │
└─────────────────────────────────────────┘
```

### ISL Recognition Service

```typescript
┌─────────────────────────────────────────┐
│     HandGestureRecognizer Class         │
├─────────────────────────────────────────┤
│ Private Properties:                     │
│  • gestureBuffer: ISLGesture[]          │
│  • bufferSize: 30                       │
│  • confidenceThreshold: 0.6             │
├─────────────────────────────────────────┤
│ Public Methods:                         │
│  • processLandmarks(hands)              │
│    └─► RecognitionResult                │
│                                         │
│  • clearBuffer()                        │
│  • getGestureHistory()                  │
├─────────────────────────────────────────┤
│ Private Methods:                        │
│  • recognizeStaticGesture(landmarks)    │
│  • isFingerExtended(landmarks, indices) │
│  • calculateAngle(a, b, c)              │
│  • calculateDistance(a, b)              │
│  • getMostFrequentGesture()             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│     Helper Functions                    │
├─────────────────────────────────────────┤
│ • translateISL(phrase, language)        │
│   └─► Translated text                   │
│                                         │
│ • islPhraseMapping                      │
│   └─► Categorized gestures              │
└─────────────────────────────────────────┘
```

### Text-to-Speech Service

```typescript
┌─────────────────────────────────────────┐
│     TextToSpeechService Class           │
├─────────────────────────────────────────┤
│ Private Properties:                     │
│  • synthesis: SpeechSynthesis           │
│  • voices: SpeechSynthesisVoice[]       │
│  • isInitialized: boolean               │
│  • languageVoiceMap: Record<...>        │
├─────────────────────────────────────────┤
│ Public Methods:                         │
│  • speak(text, options) → Promise       │
│  • stop()                               │
│  • pause()                              │
│  • resume()                             │
│  • isSpeaking() → boolean               │
│  • isPaused() → boolean                 │
│  • isSupported() → boolean              │
│  • getAvailableVoices()                 │
│  • getAvailableLanguages()              │
├─────────────────────────────────────────┤
│ Private Methods:                        │
│  • loadVoices()                         │
│  • findBestVoice(language)              │
└─────────────────────────────────────────┘
```

### useTranslation Hook

```typescript
┌─────────────────────────────────────────┐
│         useTranslation Hook             │
├─────────────────────────────────────────┤
│ State:                                  │
│  • isTranslating: boolean               │
│  • currentGesture: ISLGesture           │
│  • currentTranslation: string           │
│  • targetLanguage: SupportedLanguage    │
│  • history: TranslationHistory[]        │
│  • metrics: PerformanceMetrics          │
│  • isAudioEnabled: boolean              │
├─────────────────────────────────────────┤
│ Refs:                                   │
│  • lastGestureRef: string               │
│  • detectionStartTimeRef: number        │
│  • latencyHistoryRef: number[]          │
├─────────────────────────────────────────┤
│ Actions:                                │
│  • processHandLandmarks(hands)          │
│  • startTranslation()                   │
│  • stopTranslation()                    │
│  • toggleAudio()                        │
│  • changeLanguage(lang)                 │
│  • clearHistory()                       │
│  • resetMetrics()                       │
│  • speakCurrentTranslation()            │
│  • stopSpeaking()                       │
└─────────────────────────────────────────┘
```

## Performance Optimization

### 1. GPU Acceleration
```
MediaPipe Hand Landmarker
    │
    ▼
WebGL Backend
    │
    ▼
GPU Processing
    │
    └─► 20-30ms per frame
```

### 2. Frame Processing Pipeline
```
Video Frame (60fps available)
    │
    ▼
requestAnimationFrame (30fps throttle)
    │
    ▼
Process every other frame
    │
    └─► Reduced CPU usage
```

### 3. Gesture Smoothing
```
Raw Gestures (noisy)
    │
    ▼
Gesture Buffer (30 frames)
    │
    ▼
Frequency Analysis
    │
    ▼
Most Common Gesture
    │
    └─► Stable, accurate output
```

### 4. Lazy Loading
```
Page Load
    │
    ├─► Components load immediately
    │
    └─► MediaPipe models load on-demand
            │
            └─► CDN cached after first load
```

## Error Handling

### Camera Errors
```
getUserMedia()
    │
    ├─► Success → Video stream
    │
    └─► Error
        ├─► NotAllowedError → "Permission denied"
        ├─► NotFoundError → "No camera found"
        ├─► NotReadableError → "Camera in use"
        └─► OverconstrainedError → "Constraints not met"
```

### MediaPipe Errors
```
HandLandmarker.createFromOptions()
    │
    ├─► Success → Landmarker instance
    │
    └─► Error
        ├─► Network error → "Model download failed"
        ├─► WASM error → "WebAssembly not supported"
        └─► GPU error → Fallback to CPU
```

### TTS Errors
```
speechSynthesis.speak()
    │
    ├─► Success → Audio output
    │
    └─► Error
        ├─► "not-allowed" → Autoplay blocked
        ├─► "network" → Voice download failed
        └─► "synthesis-failed" → Generic error
```

## State Management Flow

```
┌─────────────────────────────────────────────────┐
│              User Interactions                   │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  Camera Toggle      Language Change
        │                   │
        │                   │
        ▼                   ▼
┌─────────────────────────────────────────────────┐
│           useTranslation Hook                    │
│                                                  │
│  State Updates → Re-render → UI Updates         │
└─────────────────┬───────────────────────────────┘
                  │
        ┌─────────┼─────────┐
        │         │         │
        ▼         ▼         ▼
    Webcam    Recognition  TTS
   Controls    Service    Service
```

## Memory Management

### Buffer Limits
- **Gesture Buffer**: 30 frames (1 second)
- **Translation History**: 50 items max
- **Latency History**: 100 measurements

### Cleanup on Unmount
```typescript
useEffect(() => {
  return () => {
    ttsService.stop();          // Cancel speech
    islRecognizer.clearBuffer(); // Clear buffer
    handLandmarker.close();      // Release GPU
    cancelAnimationFrame(id);    // Stop loop
  };
}, []);
```

## Browser Compatibility Matrix

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| MediaPipe | ✅ | ✅ | ⚠️ | ⚠️ |
| WebRTC | ✅ | ✅ | ✅ | ✅ |
| WebGL | ✅ | ✅ | ✅ | ✅ |
| Web Speech | ✅ | ✅ | ⚠️ | ⚠️ |
| Performance | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐ |

**Legend**: ✅ Full support | ⚠️ Partial support | ❌ Not supported

## Security Considerations

### Content Security Policy
```
default-src 'self';
script-src 'self' 'unsafe-eval';  // TensorFlow.js WASM
connect-src 'self' https://cdn.jsdelivr.net;  // MediaPipe CDN
media-src 'self' mediastream:;  // Camera access
worker-src 'self' blob:;  // Web Workers
```

### Permissions Required
```
{
  "camera": {
    "required": true,
    "justification": "Hand gesture detection"
  },
  "microphone": {
    "required": false
  }
}
```

---

## Architecture Decisions

### Why MediaPipe?
- ✅ Industry-standard hand tracking
- ✅ High accuracy (>95%)
- ✅ GPU accelerated
- ✅ Open source
- ✅ Active development

### Why Web Speech API?
- ✅ Native browser support
- ✅ Multi-language support
- ✅ No external dependencies
- ✅ Free to use
- ✅ Offline capable (some browsers)

### Why Client-Side Processing?
- ✅ Privacy (no data sent to server)
- ✅ Low latency (no network round-trip)
- ✅ Scalable (no server costs)
- ✅ Works offline (after initial load)
- ✅ No API rate limits

---

*This architecture enables real-time, accurate, and privacy-focused ISL translation* 🚀
