import { useState, useCallback, useRef, useEffect } from 'react';
import { HandLandmarks } from '@/components/WebcamCapture';
import { islRecognizer, translateISL, ISLGesture } from '@/services/islRecognition';
import { ttsService, SupportedLanguage } from '@/services/textToSpeech';

export interface TranslationHistory {
  id: string;
  gesture: string;
  translation: string;
  language: string;
  timestamp: number;
  confidence: number;
}

export interface PerformanceMetrics {
  averageLatency: number;
  accuracy: number;
  signsDetected: number;
  successfulTranslations: number;
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [currentGesture, setCurrentGesture] = useState<ISLGesture | null>(null);
  const [currentTranslation, setCurrentTranslation] = useState<string>('');
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('english');
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    averageLatency: 0,
    accuracy: 0,
    signsDetected: 0,
    successfulTranslations: 0,
  });
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const lastGestureRef = useRef<string>('');
  const detectionStartTimeRef = useRef<number>(0);
  const latencyHistoryRef = useRef<number[]>([]);

  // Process hand landmarks and recognize gestures
  const processHandLandmarks = useCallback(
    (handsLandmarks: HandLandmarks[]) => {
      if (!isTranslating || handsLandmarks.length === 0) {
        setCurrentGesture(null);
        setCurrentTranslation('');
        return;
      }

      const startTime = performance.now();
      if (detectionStartTimeRef.current === 0) {
        detectionStartTimeRef.current = startTime;
      }

      const result = islRecognizer.processLandmarks(handsLandmarks);

      if (result.gesture && result.phrase) {
        const endTime = performance.now();
        const latency = endTime - detectionStartTimeRef.current;

        // Update metrics
        latencyHistoryRef.current.push(latency);
        if (latencyHistoryRef.current.length > 100) {
          latencyHistoryRef.current.shift();
        }

        const avgLatency =
          latencyHistoryRef.current.reduce((a, b) => a + b, 0) /
          latencyHistoryRef.current.length;

        setCurrentGesture(result.gesture);

        // Translate to target language
        const translated = translateISL(result.phrase, targetLanguage);
        setCurrentTranslation(translated);

        // Only add to history and speak if it's a new gesture
        if (result.gesture.sign !== lastGestureRef.current) {
          lastGestureRef.current = result.gesture.sign;

          const historyEntry: TranslationHistory = {
            id: `${Date.now()}-${Math.random()}`,
            gesture: result.gesture.sign,
            translation: translated,
            language: targetLanguage,
            timestamp: Date.now(),
            confidence: result.confidence,
          };

          setHistory((prev) => [historyEntry, ...prev].slice(0, 50)); // Keep last 50

          // Speak translation if audio is enabled
          if (isAudioEnabled) {
            ttsService.speak(translated, {
              language: targetLanguage,
              rate: 1.0,
              pitch: 1.0,
              volume: 1.0,
            }).catch((error) => {
              console.error('TTS error:', error);
            });
          }

          // Update metrics
          setMetrics((prev) => ({
            averageLatency: avgLatency / 1000, // Convert to seconds
            accuracy: result.confidence * 100,
            signsDetected: prev.signsDetected + 1,
            successfulTranslations: prev.successfulTranslations + 1,
          }));

          detectionStartTimeRef.current = 0;
        }
      } else {
        // Reset if no gesture detected for a while
        if (lastGestureRef.current) {
          const timeSinceLastGesture = Date.now() - (currentGesture?.timestamp || 0);
          if (timeSinceLastGesture > 2000) {
            // 2 seconds
            lastGestureRef.current = '';
            setCurrentGesture(null);
            setCurrentTranslation('');
          }
        }
      }
    },
    [isTranslating, targetLanguage, isAudioEnabled, currentGesture?.timestamp]
  );

  // Start translation
  const startTranslation = useCallback(() => {
    setIsTranslating(true);
    detectionStartTimeRef.current = 0;
    lastGestureRef.current = '';
    islRecognizer.clearBuffer();
  }, []);

  // Stop translation
  const stopTranslation = useCallback(() => {
    setIsTranslating(false);
    setCurrentGesture(null);
    setCurrentTranslation('');
    lastGestureRef.current = '';
    detectionStartTimeRef.current = 0;
    ttsService.stop();
    islRecognizer.clearBuffer();
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setIsAudioEnabled((prev) => !prev);
    if (isAudioEnabled) {
      ttsService.stop();
    }
  }, [isAudioEnabled]);

  // Change target language
  const changeLanguage = useCallback((language: SupportedLanguage) => {
    setTargetLanguage(language);
    ttsService.stop();
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    setMetrics({
      averageLatency: 0,
      accuracy: 0,
      signsDetected: 0,
      successfulTranslations: 0,
    });
    latencyHistoryRef.current = [];
  }, []);

  // Speak current translation
  const speakCurrentTranslation = useCallback(() => {
    if (currentTranslation) {
      ttsService.speak(currentTranslation, {
        language: targetLanguage,
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0,
      }).catch((error) => {
        console.error('TTS error:', error);
      });
    }
  }, [currentTranslation, targetLanguage]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    ttsService.stop();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
      islRecognizer.clearBuffer();
    };
  }, []);

  return {
    // State
    isTranslating,
    currentGesture,
    currentTranslation,
    targetLanguage,
    history,
    metrics,
    isAudioEnabled,
    isSpeaking: ttsService.isSpeaking(),

    // Actions
    processHandLandmarks,
    startTranslation,
    stopTranslation,
    toggleAudio,
    changeLanguage,
    clearHistory,
    resetMetrics,
    speakCurrentTranslation,
    stopSpeaking,
  };
}
