import { useState, useCallback, useRef, useEffect } from 'react';
import { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { TrainedGestureRecognizer, EnhancedISLGesture } from '@/services/trainedGestureRecognizer';
import { translationEngine, SupportedLanguage, TranslationResult } from '@/services/translationEngine';
import { subtitleGenerator } from '@/services/subtitleGenerator';
import { voiceAssistant, VoiceEmotion } from '@/services/enhancedVoiceAssistant';

export interface TranslationMetrics {
  gesturesDetected: number;
  averageConfidence: number;
  processingTime: number;
  accuracy: number;
  latency: number;
}

export interface TranslationHistory {
  timestamp: Date;
  gesture: string;
  translation: string;
  language: SupportedLanguage;
  confidence: number;
}

export interface EnhancedTranslationState {
  currentGesture: EnhancedISLGesture | null;
  currentTranslation: TranslationResult | null;
  currentSentence: string;
  targetLanguage: SupportedLanguage;
  metrics: TranslationMetrics;
  history: TranslationHistory[];
  isProcessing: boolean;
  audioEnabled: boolean;
  subtitlesEnabled: boolean;
  voiceEmotion: VoiceEmotion;
}

export function useEnhancedTranslation(initialLanguage: SupportedLanguage = 'english') {
  const recognizerRef = useRef<TrainedGestureRecognizer | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  const lastSpokenTextRef = useRef<string>('');
  const lastSpokenTimeRef = useRef<number>(0);
  const speechCooldownRef = useRef<number>(1000); // Optimized to 1 second (faster voice response)
  const processingIntervalRef = useRef<number | null>(null);

  const [state, setState] = useState<EnhancedTranslationState>({
    currentGesture: null,
    currentTranslation: null,
    currentSentence: '',
    targetLanguage: initialLanguage,
    metrics: {
      gesturesDetected: 0,
      averageConfidence: 0,
      processingTime: 0,
      accuracy: 0,
      latency: 0,
    },
    history: [],
    isProcessing: false,
    audioEnabled: true,
    subtitlesEnabled: true,
    voiceEmotion: 'neutral',
  });

  // Initialize recognizer
  useEffect(() => {
    recognizerRef.current = new TrainedGestureRecognizer();
    console.log('🎯 Using Trained Gesture Recognizer - Only your custom gestures will be recognized!');
  }, []);

  // Process hand landmarks
  const processHandLandmarks = useCallback(
    async (landmarks: NormalizedLandmark[][], handedness: string[]) => {
      if (!recognizerRef.current || landmarks.length === 0) return;

      const startTime = performance.now();

      // Process with advanced recognizer (HandLandmarks[] is NormalizedLandmark[][])
      const result = await recognizerRef.current.processLandmarks(landmarks);

      if (result.gesture) {
        const processingTime = performance.now() - startTime;
        const now = Date.now();

        // Translate the gesture (await the promise)
        const translation = await translationEngine.translate(
          result.gesture.sign,
          state.targetLanguage,
          {
            previousSigns: state.history.slice(-5).map(h => h.gesture),
            category: result.gesture.category,
          }
        );

        // Debug logging
        console.log('🌐 Translation:', {
          gesture: result.gesture.sign,
          language: state.targetLanguage,
          translatedText: translation.translatedText,
          originalSign: translation.originalSign
        });

        setState(prev => {
          // Check if this is truly a NEW gesture (different sign OR enough time passed)
          const isDifferentGesture = 
            !prev.currentGesture || 
            prev.currentGesture.sign !== result.gesture!.sign;
          
          const enoughTimePassed = 
            !prev.currentGesture ||
            now - prev.currentGesture.timestamp > 2500; // Optimized to 2.5 seconds (balanced: prevents repetition + responsive)

          const isNewGesture = isDifferentGesture || enoughTimePassed;

          let newSentence = result.sentence || prev.currentSentence;
          if (isNewGesture && translation.translatedText && !result.sentence) {
            newSentence = prev.currentSentence 
              ? `${prev.currentSentence} ${translation.translatedText}`
              : translation.translatedText;
          }

          // Generate subtitle ONLY for NEW gestures
          if (prev.subtitlesEnabled && isNewGesture && translation.translatedText) {
            subtitleGenerator.addSubtitle(
              translation.translatedText,
              prev.targetLanguage,
              translation.confidence
            );
          }

          // Speak translation ONLY for NEW gestures with cooldown check
          const shouldSpeak = 
            prev.audioEnabled && 
            isNewGesture && 
            translation.translatedText &&
            (now - lastSpokenTimeRef.current > speechCooldownRef.current) &&
            (lastSpokenTextRef.current !== translation.translatedText || 
             now - lastSpokenTimeRef.current > 10000); // Re-speak same word only after 10 seconds (prevents repetition while staying responsive)

          if (shouldSpeak) {
            // Speak asynchronously without blocking
            voiceAssistant.speak(translation.translatedText, {
              language: prev.targetLanguage,
              emotion: prev.voiceEmotion,
            }).catch(err => console.error('Voice error:', err));
            lastSpokenTextRef.current = translation.translatedText;
            lastSpokenTimeRef.current = now;
          }

          // Update metrics
          const newMetrics: TranslationMetrics = {
            gesturesDetected: prev.metrics.gesturesDetected + (isNewGesture ? 1 : 0),
            averageConfidence:
              isNewGesture
                ? (prev.metrics.averageConfidence * prev.metrics.gesturesDetected + result.gesture!.confidence) /
                  (prev.metrics.gesturesDetected + 1)
                : prev.metrics.averageConfidence,
            processingTime: processingTime,
            accuracy: result.gesture!.confidence * 100,
            latency: processingTime,
          };

          // Add to history ONLY for NEW gestures
          const newHistory = isNewGesture
            ? [
                ...prev.history.slice(-49),
                {
                  timestamp: new Date(),
                  gesture: result.gesture!.sign,
                  translation: translation.translatedText,
                  language: prev.targetLanguage,
                  confidence: result.gesture!.confidence,
                },
              ]
            : prev.history;

          lastProcessedTimeRef.current = Date.now();

          return {
            ...prev,
            currentGesture: result.gesture,
            currentTranslation: translation,
            currentSentence: newSentence,
            metrics: newMetrics,
            history: newHistory,
            isProcessing: true,
          };
        });
      }
    },
    [state.targetLanguage, state.history] // Include dependencies
  );

  // Auto-reset processing state
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastProcessedTimeRef.current > 0) {
        const timeSinceLastProcess = Date.now() - lastProcessedTimeRef.current;
        if (timeSinceLastProcess > 1000) {
          setState(prev => ({ ...prev, isProcessing: false }));
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Set target language
  const setTargetLanguage = useCallback((language: SupportedLanguage) => {
    setState(prev => ({ ...prev, targetLanguage: language }));
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    setState(prev => {
      const newAudioEnabled = !prev.audioEnabled;
      voiceAssistant.setEnabled(newAudioEnabled);
      return { ...prev, audioEnabled: newAudioEnabled };
    });
  }, []);

  // Toggle subtitles
  const toggleSubtitles = useCallback(() => {
    setState(prev => ({ ...prev, subtitlesEnabled: !prev.subtitlesEnabled }));
  }, []);

  // Set voice emotion
  const setVoiceEmotion = useCallback((emotion: VoiceEmotion) => {
    setState(prev => ({ ...prev, voiceEmotion: emotion }));
  }, []);

  // Clear sentence
  const clearSentence = useCallback(() => {
    setState(prev => ({ ...prev, currentSentence: '' }));
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  // Clear all subtitles
  const clearSubtitles = useCallback(() => {
    subtitleGenerator.clear();
  }, []);

  // Stop voice
  const stopVoice = useCallback(() => {
    voiceAssistant.stop();
  }, []);

  // Get gesture sequence
  const getGestureSequence = useCallback(() => {
    return recognizerRef.current?.getSequenceHistory() || [];
  }, []);

  // Get context
  const getContext = useCallback(() => {
    const history = recognizerRef.current?.getGestureHistory() || [];
    if (history.length === 0) return 'general';
    
    // Determine context based on recent gestures
    const recentCategories = history.slice(-5).map(g => g.category);
    const mostCommon = recentCategories.reduce((a, b, _, arr) =>
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b
    );
    
    return mostCommon || 'general';
  }, []);

  // Get suggestions
  const getSuggestions = useCallback(() => {
    if (!state.currentGesture) return [];
    
    const suggestions: string[] = [];
    if (state.currentGesture.category === 'number') {
      const num = parseInt(state.currentGesture.sign.match(/\d+/)?.[0] || '0');
      if (num < 10) suggestions.push(`${num + 1}`, `${num - 1}`);
    } else if (state.currentGesture.category === 'action') {
      suggestions.push('Stop', 'Go', 'Wait', 'Help');
    }
    return suggestions.slice(0, 3);
  }, [state.currentGesture]);

  // Reset all
  const reset = useCallback(() => {
    setState({
      currentGesture: null,
      currentTranslation: null,
      currentSentence: '',
      targetLanguage: state.targetLanguage,
      metrics: {
        gesturesDetected: 0,
        averageConfidence: 0,
        processingTime: 0,
        accuracy: 0,
        latency: 0,
      },
      history: [],
      isProcessing: false,
      audioEnabled: state.audioEnabled,
      subtitlesEnabled: state.subtitlesEnabled,
      voiceEmotion: state.voiceEmotion,
    });
    subtitleGenerator.clear();
    voiceAssistant.clearQueue();
    recognizerRef.current?.clearBuffer();
    
    // Reset speech tracking
    lastSpokenTextRef.current = '';
    lastSpokenTimeRef.current = 0;
    lastProcessedTimeRef.current = 0;
  }, [state.targetLanguage, state.audioEnabled, state.subtitlesEnabled, state.voiceEmotion]);

  return {
    // State
    currentGesture: state.currentGesture,
    currentTranslation: state.currentTranslation,
    currentSentence: state.currentSentence,
    targetLanguage: state.targetLanguage,
    metrics: state.metrics,
    history: state.history,
    isProcessing: state.isProcessing,
    audioEnabled: state.audioEnabled,
    subtitlesEnabled: state.subtitlesEnabled,
    voiceEmotion: state.voiceEmotion,

    // Methods
    processHandLandmarks,
    setTargetLanguage,
    toggleAudio,
    toggleSubtitles,
    setVoiceEmotion,
    clearSentence,
    clearHistory,
    clearSubtitles,
    stopVoice,
    getGestureSequence,
    getContext,
    getSuggestions,
    reset,

    // Utilities
    supportedLanguages: translationEngine.getSupportedLanguages(),
    getLanguageName: translationEngine.getLanguageName.bind(translationEngine),
  };
}
