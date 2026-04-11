import { useState, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebcamCapture, WebcamCaptureRef, type HandLandmarks } from "@/components/WebcamCapture";
import { useEnhancedTranslation } from "@/hooks/useEnhancedTranslation";
import { SubtitleOverlay } from "@/components/SubtitleOverlay";
import { TrainingMode } from "@/components/TrainingMode";
import { SupportedLanguage } from "@/services/translationEngine";
import { VoiceEmotion } from "@/services/enhancedVoiceAssistant";
import { 
  Video, 
  Volume2, 
  Settings, 
  Wifi,
  VideoOff,
  VolumeX,
  Trash2,
  RotateCcw,
  Subtitles,
  Download,
  Smile,
  Zap,
  Heart,
  Frown,
  Wind,
  GraduationCap,
  Rocket
} from "lucide-react";

export default function Translate() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentMode, setCurrentMode] = useState<'translate' | 'train'>('translate');
  const [currentLandmarks, setCurrentLandmarks] = useState<HandLandmarks | null>(null);
  const webcamRef = useRef<WebcamCaptureRef>(null);

  const {
    currentGesture,
    currentTranslation,
    currentSentence,
    targetLanguage,
    history,
    metrics,
    isProcessing,
    audioEnabled,
    subtitlesEnabled,
    voiceEmotion,
    processHandLandmarks,
    setTargetLanguage,
    toggleAudio,
    toggleSubtitles,
    setVoiceEmotion,
    clearSentence,
    clearHistory,
    clearSubtitles,
    stopVoice,
    getContext,
    getSuggestions,
    reset,
    supportedLanguages,
    getLanguageName,
  } = useEnhancedTranslation();

  const handleStartStop = () => {
    if (isTranslating) {
      setIsTranslating(false);
      stopVoice();
    } else {
      setIsTranslating(true);
    }
  };

  const handleCameraToggle = () => {
    setIsCameraOn((prev) => !prev);
    if (isTranslating) {
      setIsTranslating(false);
      stopVoice();
    }
  };

  const handleLanguageChange = (value: string) => {
    setTargetLanguage(value as SupportedLanguage);
  };

  const handleEmotionChange = (emotion: VoiceEmotion) => {
    setVoiceEmotion(emotion);
  };

  const handleReset = () => {
    reset();
    clearSentence();
    clearHistory();
    clearSubtitles();
  };

  const currentContext = getContext();
  const suggestions = getSuggestions();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Live Translation</h1>
            <p className="text-muted-foreground">
              Real-time Indian Sign Language to multilingual text and speech with AI-powered subtitles
            </p>
          </div>

          {/* Mode Toggle */}
          <Tabs value={currentMode} onValueChange={(value) => {
            setCurrentMode(value as 'translate' | 'train');
            if (isTranslating) {
              setIsTranslating(false);
              stopVoice();
            }
          }} className="mb-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="translate" className="flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Recognition Mode
              </TabsTrigger>
              <TabsTrigger value="train" className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Training Mode
              </TabsTrigger>
            </TabsList>

            {/* Translation Mode */}
            <TabsContent value="translate">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Feed */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-2 border-primary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-primary" />
                      Camera Feed
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={isTranslating ? "default" : "secondary"} className="flex items-center gap-1">
                        <Wifi className="w-3 h-3" />
                        {isTranslating ? "Live" : "Ready"}
                      </Badge>
                      {isProcessing && (
                        <Badge variant="outline" className="animate-pulse">
                          Processing...
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
                    {!isCameraOn ? (
                      <div className="text-center space-y-2">
                        <VideoOff className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-muted-foreground">Camera is off</p>
                      </div>
                    ) : (
                      <>
                        <WebcamCapture
                          ref={webcamRef}
                          isActive={isCameraOn && (isTranslating || currentMode === 'train')}
                          onHandsDetected={(hands) => {
                            if (hands.length > 0) {
                              setCurrentLandmarks(hands[0]); // Store first hand landmarks
                              if (isTranslating && currentMode === 'translate') {
                                processHandLandmarks(hands, hands.map(() => 'Unknown'));
                              }
                            }
                          }}
                          className="w-full h-full"
                        />
                        {showSubtitles && subtitlesEnabled && (
                          <SubtitleOverlay />
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
                    <Button
                      variant={isCameraOn ? "outline" : "secondary"}
                      size="icon"
                      onClick={handleCameraToggle}
                      title="Toggle Camera"
                    >
                      {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant={audioEnabled ? "outline" : "secondary"}
                      size="icon"
                      onClick={toggleAudio}
                      title="Toggle Audio"
                    >
                      {audioEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </Button>
                    <Button
                      variant={subtitlesEnabled ? "outline" : "secondary"}
                      size="icon"
                      onClick={toggleSubtitles}
                      title="Toggle Subtitles"
                    >
                      <Subtitles className="w-5 h-5" />
                    </Button>
                    <Button 
                      variant="hero" 
                      size="lg"
                      onClick={handleStartStop}
                      disabled={!isCameraOn}
                    >
                      {isTranslating ? "Stop Translation" : "Start Translation"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleReset}
                      title="Reset all"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Translation Output */}
              <Card className="border-2 border-secondary/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      Translation Output
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {metrics.latency.toFixed(0)}ms
                      </Badge>
                      {currentGesture && (
                        <Badge variant="default">
                          {(currentGesture.confidence * 100).toFixed(0)}% confident
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="min-h-[120px] p-4 rounded-lg bg-muted/50 border-2 border-dashed border-border">
                    {isTranslating && currentTranslation ? (
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">Detected Sign:</p>
                            <p className="text-sm font-mono text-primary">{currentGesture?.sign}</p>
                            <Badge variant="outline" className="mt-1 text-xs">
                              {currentGesture?.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Translation ({getLanguageName(targetLanguage)}):</p>
                          <p className="text-lg font-semibold">{currentTranslation.translatedText}</p>
                          {currentTranslation.pronunciation && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Pronunciation: {currentTranslation.pronunciation}
                            </p>
                          )}
                        </div>
                        {currentSentence && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-1">Sentence:</p>
                            <p className="text-base">{currentSentence}</p>
                          </div>
                        )}
                        {suggestions.length > 0 && (
                          <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground mb-1">Suggestions:</p>
                            <div className="flex gap-2 flex-wrap">
                              {suggestions.map((suggestion, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {suggestion}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : isTranslating ? (
                      <p className="text-lg">
                        <span className="text-muted-foreground italic">Waiting for sign language input...</span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic text-center py-8">
                        Start translating to see output here
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <Select value={targetLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {getLanguageName(lang)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {currentSentence && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={clearSentence}
                      >
                        Clear Sentence
                      </Button>
                    )}
                  </div>

                  {/* Translation History */}
                  {history.length > 0 && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Recent Translations ({history.length})</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={clearHistory}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear
                        </Button>
                      </div>
                      <div className="space-y-2 max-h-[200px] overflow-y-auto">
                        {history.slice(-5).reverse().map((item, idx) => (
                          <div 
                            key={idx}
                            className="text-xs p-2 rounded bg-muted/30 border border-border/50"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-primary truncate">{item.gesture}</p>
                                <p className="font-medium truncate">{item.translation}</p>
                                <p className="text-muted-foreground text-xs">
                                  {item.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {(item.confidence * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Settings Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Output Language</label>
                    <Select value={targetLanguage} onValueChange={handleLanguageChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {supportedLanguages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {getLanguageName(lang)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Voice Emotion</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        variant={voiceEmotion === 'neutral' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmotionChange('neutral')}
                        className="text-xs"
                      >
                        <Wind className="w-3 h-3 mr-1" />
                        Neutral
                      </Button>
                      <Button
                        variant={voiceEmotion === 'happy' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmotionChange('happy')}
                        className="text-xs"
                      >
                        <Smile className="w-3 h-3 mr-1" />
                        Happy
                      </Button>
                      <Button
                        variant={voiceEmotion === 'excited' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmotionChange('excited')}
                        className="text-xs"
                      >
                        <Zap className="w-3 h-3 mr-1" />
                        Excited
                      </Button>
                      <Button
                        variant={voiceEmotion === 'calm' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmotionChange('calm')}
                        className="text-xs"
                      >
                        <Heart className="w-3 h-3 mr-1" />
                        Calm
                      </Button>
                      <Button
                        variant={voiceEmotion === 'sad' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmotionChange('sad')}
                        className="text-xs"
                      >
                        <Frown className="w-3 h-3 mr-1" />
                        Sad
                      </Button>
                      <Button
                        variant={voiceEmotion === 'urgent' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleEmotionChange('urgent')}
                        className="text-xs"
                      >
                        Urgent
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Features</label>
                    <div className="space-y-2">
                      <Button 
                        variant={audioEnabled ? "default" : "outline"} 
                        className="w-full justify-start"
                        size="sm"
                        onClick={toggleAudio}
                      >
                        {audioEnabled ? (
                          <>
                            <Volume2 className="w-4 h-4 mr-2" />
                            Audio Enabled
                          </>
                        ) : (
                          <>
                            <VolumeX className="w-4 h-4 mr-2" />
                            Audio Disabled
                          </>
                        )}
                      </Button>
                      <Button 
                        variant={subtitlesEnabled ? "default" : "outline"} 
                        className="w-full justify-start"
                        size="sm"
                        onClick={toggleSubtitles}
                      >
                        <Subtitles className="w-4 h-4 mr-2" />
                        {subtitlesEnabled ? 'Subtitles On' : 'Subtitles Off'}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        size="sm"
                        onClick={clearSubtitles}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Clear Subtitles
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Context: {currentContext}</p>
                    <p className="text-xs text-muted-foreground">
                      AI detects conversation context for better translations
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Translation Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={isTranslating ? "default" : "secondary"}>
                      {isTranslating ? "Active" : "Idle"}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Latency</span>
                    <span className="font-medium">
                      {metrics.latency > 0 ? `${metrics.latency.toFixed(0)}ms` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Accuracy</span>
                    <span className="font-medium">
                      {metrics.accuracy > 0 ? `${metrics.accuracy.toFixed(0)}%` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Gestures Detected</span>
                    <span className="font-medium">{metrics.gesturesDetected}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Avg Confidence</span>
                    <span className="font-medium">
                      {(metrics.averageConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing Time</span>
                    <span className="font-medium">
                      {metrics.processingTime.toFixed(1)}ms
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
            </TabsContent>

            {/* Training Mode */}
            <TabsContent value="train">
              <TrainingMode 
                isWebcamActive={isCameraOn}
                onCameraToggle={handleCameraToggle}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}
