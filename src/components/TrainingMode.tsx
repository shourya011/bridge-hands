import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { gestureTrainer } from '@/services/gestureTrainer';
import { WebcamCapture, type WebcamCaptureRef, type HandLandmarks } from '@/components/WebcamCapture';
import {
  PlayCircle,
  StopCircle,
  Save,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  Info,
  Camera,
  Video,
  VideoOff,
} from 'lucide-react';

interface TrainingModeProps {
  isWebcamActive: boolean;
  onCameraToggle?: () => void;
}

const PRESET_GESTURES = [
  'Thumbs Up',
  'Thumbs Down',
  'Peace Sign',
  'OK Sign',
  'Number 0',
  'Number 1',
  'Number 2',
  'Number 3',
  'Number 4',
  'Number 5',
  'Rock On',
  'Call Me',
  'Pointing',
  'Fist',
  'Open Hand',
];

export function TrainingMode({ isWebcamActive, onCameraToggle }: TrainingModeProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [currentGesture, setCurrentGesture] = useState('');
  const [customGestureName, setCustomGestureName] = useState('');
  const [samplesCount, setSamplesCount] = useState(0);
  const [message, setMessage] = useState('');
  const [trainedGestures, setTrainedGestures] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    totalGestures: number;
    totalSamples: number;
    averageSamplesPerGesture: number;
    gestureList: Array<{ name: string; samples: number }>;
  } | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentLandmarks, setCurrentLandmarks] = useState<HandLandmarks | null>(null);
  const [handDetected, setHandDetected] = useState(false);
  const webcamRef = useRef<WebcamCaptureRef>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Load trained gestures on mount
  useEffect(() => {
    loadTrainedGestures();
  }, []);

  // Handle hand detection from webcam
  const handleHandsDetected = (hands: HandLandmarks[]) => {
    if (hands.length > 0) {
      setCurrentLandmarks(hands[0]); // Store first hand
      setHandDetected(true);
    } else {
      setCurrentLandmarks(null);
      setHandDetected(false);
    }
  };

  const loadTrainedGestures = async () => {
    const gestures = await gestureTrainer.getTrainedGestures();
    setTrainedGestures(gestures);
    const trainingStats = await gestureTrainer.getTrainingStats();
    setStats(trainingStats);
  };

  const startTraining = () => {
    gestureTrainer.startTrainingSession();
    setIsTraining(true);
    setMessage('✅ Training session started! Select a gesture to train.');
  };

  const endTraining = () => {
    const result = gestureTrainer.endTrainingSession();
    setIsTraining(false);
    setCurrentGesture('');
    setSamplesCount(0);
    setMessage(result.message);
    loadTrainedGestures();
  };

  const selectGesture = (gestureName: string) => {
    setCurrentGesture(gestureName);
    setSamplesCount(0);
    setMessage(`📝 Selected "${gestureName}". Hold the gesture steady and click "Capture Sample".`);
  };

  const captureWithCountdown = () => {
    if (!currentGesture || !isWebcamActive) {
      setMessage('⚠️ Please select a gesture and ensure webcam is active.');
      return;
    }

    // Start 3-second countdown
    let count = 3;
    setCountdown(count);
    
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        captureSample();
      }
    }, 1000);
  };

  const captureSample = () => {
    if (!currentGesture || !currentLandmarks) {
      setMessage('⚠️ Please select a gesture and show it to the camera.');
      return;
    }

    const result = gestureTrainer.addGestureSample(currentGesture, currentLandmarks);
    setSamplesCount(result.samplesCount);
    setMessage(result.message);

    // Auto-advance if enough samples
    if (result.samplesCount >= 5) {
      setTimeout(() => {
        setMessage(`✅ "${currentGesture}" is trained! You can select another gesture or end training.`);
      }, 1500);
    }
  };

  const deleteGesture = async (gestureName: string) => {
    if (confirm(`Delete training data for "${gestureName}"?`)) {
      await gestureTrainer.deleteGestureProfile(gestureName);
      await loadTrainedGestures();
      setMessage(`🗑️ Deleted "${gestureName}"`);
    }
  };

  const clearAllData = async () => {
    if (confirm('Delete ALL training data? This cannot be undone!')) {
      await gestureTrainer.clearAllTrainingData();
      await loadTrainedGestures();
      setMessage('🗑️ All training data cleared');
    }
  };

  const exportData = async () => {
    const data = await gestureTrainer.exportTrainingData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gesture-training-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('📥 Training data exported!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        await gestureTrainer.importTrainingData(jsonData);
        await loadTrainedGestures();
        setMessage('📤 Training data imported successfully!');
      } catch (error) {
        setMessage('❌ Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const progress = currentGesture && samplesCount > 0 ? (samplesCount / 5) * 100 : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Manual Gesture Training
          </CardTitle>
          <CardDescription>
            Train the system to recognize your specific hand gestures with personalized accuracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Training Session Controls */}
          <div className="flex gap-2">
            {!isTraining ? (
              <Button onClick={startTraining} className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4" />
                Start Training Session
              </Button>
            ) : (
              <Button onClick={endTraining} variant="destructive" className="flex items-center gap-2">
                <StopCircle className="w-4 h-4" />
                End Training & Save
              </Button>
            )}
          </div>

          {/* Webcam Status */}
          {!isWebcamActive && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Please enable your webcam first to start training gestures.
              </AlertDescription>
            </Alert>
          )}

          {/* Live Camera Preview */}
          {isWebcamActive && (
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-primary" />
                    Live Camera Feed
                  </span>
                  <Badge variant="default" className="animate-pulse">
                    ● LIVE
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  {/* WebcamCapture with MediaPipe Hand Detection */}
                  <WebcamCapture
                    ref={webcamRef}
                    isActive={isWebcamActive}
                    onHandsDetected={handleHandsDetected}
                    className="w-full h-full"
                  />
                  
                  {/* Countdown Overlay */}
                  {countdown !== null && countdown > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                      <div className="text-white text-9xl font-bold animate-pulse">
                        {countdown}
                      </div>
                    </div>
                  )}
                  
                  {/* Capture Success Overlay */}
                  {countdown === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/50 backdrop-blur-sm z-10">
                      <div className="text-white text-6xl font-bold animate-bounce">
                        <CheckCircle className="w-24 h-24" />
                      </div>
                    </div>
                  )}

                  {/* Hand Detection Indicator */}
                  {handDetected && currentLandmarks && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Hand Detected
                      </Badge>
                    </div>
                  )}

                  {/* Current Gesture Display */}
                  {currentGesture && isTraining && (
                    <div className="absolute bottom-4 left-4 right-4 z-10">
                      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                        <div className="text-sm font-medium">Training:</div>
                        <div className="text-2xl font-bold">{currentGesture}</div>
                        <div className="text-sm mt-1">
                          Samples: {samplesCount}/20 (min: 5)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
                  <Info className="w-4 h-4" />
                  <span>Position your hand in the frame and hold steady while capturing</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Display */}
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {/* Training Interface */}
          {isTraining && (
            <div className="space-y-4">
              {/* Preset Gestures */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Select Gesture to Train:</h3>
                <div className="flex flex-wrap gap-2">
                  {PRESET_GESTURES.map((gesture) => (
                    <Button
                      key={gesture}
                      onClick={() => selectGesture(gesture)}
                      variant={currentGesture === gesture ? 'default' : 'outline'}
                      size="sm"
                    >
                      {gesture}
                      {trainedGestures.includes(gesture) && (
                        <CheckCircle className="w-3 h-3 ml-1 text-green-500" />
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Gesture */}
              <div className="flex gap-2">
                <Input
                  placeholder="Or enter custom gesture name..."
                  value={customGestureName}
                  onChange={(e) => setCustomGestureName(e.target.value)}
                />
                <Button
                  onClick={() => {
                    if (customGestureName.trim()) {
                      selectGesture(customGestureName.trim());
                      setCustomGestureName('');
                    }
                  }}
                  disabled={!customGestureName.trim()}
                >
                  Use Custom
                </Button>
              </div>

              {/* Current Gesture Training */}
              {currentGesture && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">Training: {currentGesture}</h4>
                        <Badge variant={samplesCount >= 5 ? 'default' : 'secondary'}>
                          {samplesCount}/5 samples
                        </Badge>
                      </div>

                      <Progress value={progress} className="h-2" />

                      {countdown !== null && countdown > 0 && (
                        <div className="text-center">
                          <div className="text-4xl font-bold text-primary animate-pulse">
                            {countdown}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Hold the gesture steady...
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={captureWithCountdown}
                          disabled={!isWebcamActive || countdown !== null}
                          className="flex-1"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture Sample {countdown !== null ? `(${countdown})` : '(3s countdown)'}
                        </Button>
                      </div>

                      {samplesCount >= 5 && (
                        <Alert>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <AlertDescription>
                            ✅ Minimum samples collected! You can capture more (up to 20) or train another gesture.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Training Statistics */}
          {stats && stats.totalGestures > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Training Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Gestures:</span>
                    <span className="font-semibold">{stats.totalGestures}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Samples:</span>
                    <span className="font-semibold">{stats.totalSamples}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Samples/Gesture:</span>
                    <span className="font-semibold">{stats.averageSamplesPerGesture.toFixed(1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Trained Gestures List */}
          {trainedGestures.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Trained Gestures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {trainedGestures.map((gesture) => {
                    const gestureInfo = stats?.gestureList.find(g => g.name === gesture);
                    return (
                      <div key={gesture} className="flex items-center justify-between p-2 rounded bg-muted/50">
                        <div>
                          <span className="font-medium">{gesture}</span>
                          {gestureInfo && (
                            <span className="text-xs text-muted-foreground ml-2">
                              ({gestureInfo.samples} samples)
                            </span>
                          )}
                        </div>
                        <Button
                          onClick={() => deleteGesture(gesture)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Management */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={exportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
                id="import-file"
              />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </span>
              </Button>
            </label>
            {trainedGestures.length > 0 && (
              <Button onClick={clearAllData} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Instructions */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>How to train:</strong>
              <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                <li>Start a training session</li>
                <li>Select a gesture to train</li>
                <li>Show the gesture to the camera</li>
                <li>Click "Capture Sample" (3-second countdown)</li>
                <li>Repeat 5 times for each gesture</li>
                <li>End session to save your training data</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
