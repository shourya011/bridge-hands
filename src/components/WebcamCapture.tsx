import { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, HandLandmarker, NormalizedLandmark } from '@mediapipe/tasks-vision';

export type HandLandmarks = NormalizedLandmark[];

export interface WebcamCaptureRef {
  captureFrame: () => ImageData | null;
  getHandLandmarks: () => HandLandmarks[] | null;
}

interface WebcamCaptureProps {
  isActive: boolean;
  onHandsDetected?: (hands: HandLandmarks[]) => void;
  onFrame?: (imageData: ImageData) => void;
  className?: string;
}

export const WebcamCapture = forwardRef<WebcamCaptureRef, WebcamCaptureProps>(
  ({ isActive, onHandsDetected, onFrame, className = '' }, ref) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const [handLandmarker, setHandLandmarker] = useState<HandLandmarker | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const lastDetectionRef = useRef<HandLandmarks[] | null>(null);

    // Initialize MediaPipe Hand Landmarker
    useEffect(() => {
      const initializeHandLandmarker = async () => {
        try {
          setIsModelLoading(true);
          const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
          );

          const landmarker = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });

          setHandLandmarker(landmarker);
          setIsModelLoading(false);
        } catch (err) {
          console.error('Error initializing hand landmarker:', err);
          setError('Failed to load hand detection model');
          setIsModelLoading(false);
        }
      };

      initializeHandLandmarker();

      return () => {
        if (handLandmarker) {
          handLandmarker.close();
        }
      };
      // Intentionally only run once on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Process video frames
    useEffect(() => {
      if (!isActive || !handLandmarker || isModelLoading) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }

      const processFrame = () => {
        if (
          webcamRef.current?.video &&
          webcamRef.current.video.readyState === 4 &&
          canvasRef.current
        ) {
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');

          if (!ctx) return;

          // Set canvas dimensions to match video
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;

          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          
          if (onFrame) {
            onFrame(imageData);
          }

          // Detect hands using MediaPipe
          try {
            const startTimeMs = performance.now();
            const results = handLandmarker.detectForVideo(video, startTimeMs);

            if (results.landmarks && results.landmarks.length > 0) {
              lastDetectionRef.current = results.landmarks;
              
              if (onHandsDetected) {
                onHandsDetected(results.landmarks);
              }

              // Draw hand landmarks on canvas
              drawHandLandmarks(ctx, results.landmarks, canvas.width, canvas.height);
            } else {
              lastDetectionRef.current = null;
            }
          } catch (err) {
            console.error('Error detecting hands:', err);
          }
        }

        animationRef.current = requestAnimationFrame(processFrame);
      };

      animationRef.current = requestAnimationFrame(processFrame);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [isActive, handLandmarker, isModelLoading, onHandsDetected, onFrame]);

    // Draw hand landmarks on canvas
    const drawHandLandmarks = (
      ctx: CanvasRenderingContext2D,
      landmarks: HandLandmarks[],
      width: number,
      height: number
    ) => {
      landmarks.forEach((handLandmarks) => {
        // Draw connections
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
          [0, 5], [5, 6], [6, 7], [7, 8], // Index
          [0, 9], [9, 10], [10, 11], [11, 12], // Middle
          [0, 13], [13, 14], [14, 15], [15, 16], // Ring
          [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
          [5, 9], [9, 13], [13, 17], // Palm
        ];

        ctx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.lineWidth = 2;

        connections.forEach(([start, end]) => {
          const startPoint = handLandmarks[start];
          const endPoint = handLandmarks[end];

          ctx.beginPath();
          ctx.moveTo(startPoint.x * width, startPoint.y * height);
          ctx.lineTo(endPoint.x * width, endPoint.y * height);
          ctx.stroke();
        });

        // Draw landmarks
        handLandmarks.forEach((landmark: NormalizedLandmark) => {
          ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
          ctx.fill();
        });
      });
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      captureFrame: () => {
        if (canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          if (ctx) {
            return ctx.getImageData(
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          }
        }
        return null;
      },
      getHandLandmarks: () => {
        return lastDetectionRef.current;
      },
    }));

    return (
      <div className={`relative ${className}`}>
        {/* Webcam */}
        <Webcam
          ref={webcamRef}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 1280,
            height: 720,
            facingMode: 'user',
          }}
          className="w-full h-full object-cover"
          style={{ display: isActive ? 'block' : 'none' }}
        />

        {/* Canvas overlay for drawing landmarks */}
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ display: isActive ? 'block' : 'none' }}
        />

        {/* Loading indicator */}
        {isModelLoading && isActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading hand detection model...</p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center bg-red-600/90 p-4 rounded-lg">
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

WebcamCapture.displayName = 'WebcamCapture';
