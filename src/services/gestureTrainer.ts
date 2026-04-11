import { HandLandmarks } from '@/components/WebcamCapture';
import { gestureDB } from './gestureDatabase';

// Training data structure
export interface GestureSample {
  gestureName: string;
  landmarks: HandLandmarks[];
  timestamp: number;
  userId?: string;
}

export interface GestureProfile {
  gestureName: string;
  samples: GestureSample[];
  averageDistances: {
    thumbIndexDistance: number;
    indexMiddleDistance: number;
    middleRingDistance: number;
    ringPinkyDistance: number;
    thumbPinkyDistance: number;
    handOpenness: number;
  };
  averageAngles: {
    thumbIndexAngle: number;
    indexMiddleAngle: number;
  };
  confidenceThreshold: number;
  customThresholds?: {
    fingerExtensionThreshold: number;
    fingerSpreadThreshold: number;
  };
}

export interface TrainingSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  gestureProfiles: Map<string, GestureProfile>;
  samplesCollected: number;
}

class GestureTrainer {
  private currentSession: TrainingSession | null = null;
  private readonly minSamplesPerGesture = 5; // Minimum samples needed
  private readonly maxSamplesPerGesture = 20; // Maximum samples to keep
  private readonly storageKey = 'gesture_training_data';
  private readonly backupStorageKey = 'gesture_training_data_backup'; // Backup storage

  constructor() {
    // Auto-load training data on initialization
    this.initializeStorage();
    console.log('💾 Gesture Trainer initialized - Your trained gestures are saved in IndexedDB (permanent database)!');
  }

  // Initialize storage and migrate from localStorage if needed
  private async initializeStorage(): Promise<void> {
    try {
      // Check if we need to migrate from localStorage
      const migrated = localStorage.getItem('gesture_data_migrated');
      if (!migrated) {
        await gestureDB.migrateFromLocalStorage();
      }
      
      // Load existing data
      await this.loadTrainingData();
    } catch (error) {
      console.error('❌ Failed to initialize storage:', error);
    }
  }

  // Start a new training session
  public startTrainingSession(): TrainingSession {
    this.currentSession = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      gestureProfiles: new Map(),
      samplesCollected: 0,
    };
    
    console.log('✅ Training session started:', this.currentSession.sessionId);
    return this.currentSession;
  }

  // Add a sample for a specific gesture
  public addGestureSample(
    gestureName: string,
    landmarks: HandLandmarks
  ): { success: boolean; samplesCount: number; message: string } {
    if (!this.currentSession) {
      return {
        success: false,
        samplesCount: 0,
        message: 'No active training session. Please start a session first.',
      };
    }

    // Create sample
    const sample: GestureSample = {
      gestureName,
      landmarks: [landmarks],
      timestamp: Date.now(),
    };

    // Get or create profile
    let profile = this.currentSession.gestureProfiles.get(gestureName);
    
    if (!profile) {
      profile = {
        gestureName,
        samples: [],
        averageDistances: {
          thumbIndexDistance: 0,
          indexMiddleDistance: 0,
          middleRingDistance: 0,
          ringPinkyDistance: 0,
          thumbPinkyDistance: 0,
          handOpenness: 0,
        },
        averageAngles: {
          thumbIndexAngle: 0,
          indexMiddleAngle: 0,
        },
        confidenceThreshold: 0.75,
      };
      this.currentSession.gestureProfiles.set(gestureName, profile);
    }

    // Add sample (limit to max samples)
    profile.samples.push(sample);
    if (profile.samples.length > this.maxSamplesPerGesture) {
      profile.samples.shift(); // Remove oldest
    }

    this.currentSession.samplesCollected++;

    // Recalculate averages
    this.calculateAverages(profile);

    const samplesCount = profile.samples.length;
    const isComplete = samplesCount >= this.minSamplesPerGesture;

    // Auto-save after each sample (in case browser closes)
    if (samplesCount >= this.minSamplesPerGesture) {
      this.autoSaveCurrentGesture(gestureName);
    }

    return {
      success: true,
      samplesCount,
      message: isComplete
        ? `✅ Gesture "${gestureName}" trained! (${samplesCount} samples) - Auto-saved!`
        : `📝 Sample ${samplesCount}/${this.minSamplesPerGesture} recorded for "${gestureName}"`,
    };
  }

  // Auto-save current gesture (called after each sample)
  private autoSaveCurrentGesture(gestureName: string): void {
    if (!this.currentSession) return;
    
    const profile = this.currentSession.gestureProfiles.get(gestureName);
    if (profile && profile.samples.length >= this.minSamplesPerGesture) {
      try {
        this.saveTrainingData([profile]);
        console.log('💾 Auto-saved gesture:', gestureName);
      } catch (error) {
        console.error('❌ Auto-save failed:', error);
      }
    }
  }

  // Calculate average measurements from samples
  private calculateAverages(profile: GestureProfile): void {
    const samples = profile.samples;
    if (samples.length === 0) return;

    let totalThumbIndex = 0;
    let totalIndexMiddle = 0;
    let totalMiddleRing = 0;
    let totalRingPinky = 0;
    let totalThumbPinky = 0;
    let totalOpenness = 0;
    let totalThumbIndexAngle = 0;
    let totalIndexMiddleAngle = 0;

    samples.forEach(sample => {
      const landmarks = sample.landmarks[0];
      
      // Calculate distances
      totalThumbIndex += this.calculateDistance(landmarks[4], landmarks[8]);
      totalIndexMiddle += this.calculateDistance(landmarks[8], landmarks[12]);
      totalMiddleRing += this.calculateDistance(landmarks[12], landmarks[16]);
      totalRingPinky += this.calculateDistance(landmarks[16], landmarks[20]);
      totalThumbPinky += this.calculateDistance(landmarks[4], landmarks[20]);
      totalOpenness += this.calculateHandOpenness(landmarks);
      
      // Calculate angles
      totalThumbIndexAngle += this.calculateAngle(landmarks[4], landmarks[0], landmarks[8]);
      totalIndexMiddleAngle += this.calculateAngle(landmarks[8], landmarks[5], landmarks[12]);
    });

    const count = samples.length;
    profile.averageDistances = {
      thumbIndexDistance: totalThumbIndex / count,
      indexMiddleDistance: totalIndexMiddle / count,
      middleRingDistance: totalMiddleRing / count,
      ringPinkyDistance: totalRingPinky / count,
      thumbPinkyDistance: totalThumbPinky / count,
      handOpenness: totalOpenness / count,
    };

    profile.averageAngles = {
      thumbIndexAngle: totalThumbIndexAngle / count,
      indexMiddleAngle: totalIndexMiddleAngle / count,
    };

    console.log(`📊 Updated averages for "${profile.gestureName}":`, profile.averageDistances);
  }

  // End training session and save
  public endTrainingSession(): {
    success: boolean;
    profilesCreated: number;
    message: string;
  } {
    if (!this.currentSession) {
      return {
        success: false,
        profilesCreated: 0,
        message: 'No active training session.',
      };
    }

    this.currentSession.endTime = Date.now();

    // Filter out incomplete profiles
    const completeProfiles = Array.from(this.currentSession.gestureProfiles.values()).filter(
      profile => profile.samples.length >= this.minSamplesPerGesture
    );

    // Save to localStorage
    this.saveTrainingData(completeProfiles);

    const profilesCreated = completeProfiles.length;
    const session = this.currentSession;
    this.currentSession = null;

    return {
      success: true,
      profilesCreated,
      message: `✅ Training session completed! Created ${profilesCreated} gesture profiles with ${session.samplesCollected} total samples.`,
    };
  }

  // Save training data to IndexedDB (with automatic backup)
  private async saveTrainingData(profiles: GestureProfile[]): Promise<void> {
    try {
      // Also backup to localStorage as secondary storage
      try {
        localStorage.setItem(this.backupStorageKey, JSON.stringify(profiles));
        console.log('💾 LocalStorage backup created:', profiles.length, 'profiles');
      } catch (backupError) {
        console.warn('⚠️ LocalStorage backup failed, but continuing with IndexedDB save:', backupError);
      }
      
      // Save each profile to IndexedDB
      await gestureDB.saveGestures(profiles);
      
      console.log('💾 Training data saved to IndexedDB successfully:', profiles.length, 'profiles');
      console.log('📝 Saved gestures:', profiles.map(p => p.gestureName).join(', '));
      
      // Verify save was successful
      const verification = await gestureDB.hasData();
      if (!verification) {
        throw new Error('Save verification failed - data not found in database');
      }
    } catch (error) {
      console.error('❌ Failed to save training data to IndexedDB:', error);
      alert('⚠️ Failed to save training data. Please check your browser settings.');
    }
  }

  // Load training data from IndexedDB (with automatic fallback to backup)
  public async loadTrainingData(): Promise<GestureProfile[]> {
    try {
      const profiles = await gestureDB.loadAllGestures();
      if (profiles.length > 0) {
        console.log('✅ Training data loaded from IndexedDB:', profiles.length, 'profiles');
        console.log('🎯 Loaded gestures:', profiles.map(p => p.gestureName).join(', '));
        
        // Additional validation
        profiles.forEach((profile, index) => {
          if (!profile.gestureName || !profile.samples || profile.samples.length === 0) {
            console.warn(`⚠️ Invalid profile at index ${index}:`, profile);
          }
        });
        
        return profiles;
      } else {
        console.log('ℹ️ No training data found in IndexedDB, checking backup...');
        return this.restoreFromBackup();
      }
    } catch (error) {
      console.error('❌ Failed to load training data from IndexedDB:', error);
      console.log('🔄 Attempting to restore from backup...');
      return this.restoreFromBackup();
    }
  }

  // Restore training data from backup
  private restoreFromBackup(): GestureProfile[] {
    try {
      const backupData = localStorage.getItem(this.backupStorageKey);
      if (backupData) {
        const profiles = JSON.parse(backupData);
        // Restore to main storage
        localStorage.setItem(this.storageKey, backupData);
        console.log('✅ Restored from backup:', profiles.length, 'gestures');
        alert('✅ Training data restored from backup!');
        return profiles;
      }
    } catch (error) {
      console.error('❌ Failed to restore from backup:', error);
    }
    console.log('❌ No backup available');
    return [];
  }

  // Manually restore from backup (exposed for UI)
  public manualRestoreFromBackup(): boolean {
    const restored = this.restoreFromBackup();
    return restored.length > 0;
  }

  // Get profile for a specific gesture
  public async getGestureProfile(gestureName: string): Promise<GestureProfile | null> {
    const profiles = await this.loadTrainingData();
    return profiles.find(p => p.gestureName === gestureName) || null;
  }

  // Check if current gesture matches a trained profile
  public async matchGestureProfile(
    landmarks: HandLandmarks,
    gestureName: string,
    tolerance: number = 0.15 // 15% tolerance
  ): Promise<{ matches: boolean; similarity: number; profile: GestureProfile | null }> {
    const profile = await this.getGestureProfile(gestureName);
    
    if (!profile) {
      return { matches: false, similarity: 0, profile: null };
    }

    // Calculate current measurements
    const currentDistances = {
      thumbIndexDistance: this.calculateDistance(landmarks[4], landmarks[8]),
      indexMiddleDistance: this.calculateDistance(landmarks[8], landmarks[12]),
      middleRingDistance: this.calculateDistance(landmarks[12], landmarks[16]),
      ringPinkyDistance: this.calculateDistance(landmarks[16], landmarks[20]),
      thumbPinkyDistance: this.calculateDistance(landmarks[4], landmarks[20]),
      handOpenness: this.calculateHandOpenness(landmarks),
    };

    // Calculate similarity (0-1)
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
    const matches = averageDifference <= tolerance;

    return { matches, similarity, profile };
  }

  // Get all trained gestures
  public async getTrainedGestures(): Promise<string[]> {
    const profiles = await this.loadTrainingData();
    return profiles.map(p => p.gestureName);
  }

  // Delete a trained gesture
  public async deleteGestureProfile(gestureName: string): Promise<boolean> {
    try {
      await gestureDB.deleteGesture(gestureName);
      console.log(`🗑️ Deleted profile from IndexedDB: ${gestureName}`);
      
      // Also remove from localStorage backup
      try {
        const profiles = await this.loadTrainingData();
        const filtered = profiles.filter(p => p.gestureName !== gestureName);
        localStorage.setItem(this.backupStorageKey, JSON.stringify(filtered));
      } catch (backupError) {
        console.warn('⚠️ Failed to update backup after delete:', backupError);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to delete profile:', error);
      return false;
    }
  }

  // Clear all training data (with confirmation and backup)
  public async clearAllTrainingData(): Promise<boolean> {
    try {
      // Create backup before clearing
      const existingData = await this.loadTrainingData();
      if (existingData.length > 0) {
        localStorage.setItem(this.backupStorageKey, JSON.stringify(existingData));
        console.log('💾 Backup created before clearing');
      }
      
      // Clear IndexedDB
      await gestureDB.clearAllGestures();
      console.log('🗑️ All training data cleared from IndexedDB (backup available)');
      return true;
    } catch (error) {
      console.error('❌ Failed to clear training data:', error);
      return false;
    }
  }

  // Get storage information
  public async getStorageInfo(): Promise<{
    totalGestures: number;
    totalSamples: number;
    storageSize: number;
    hasBackup: boolean;
    gestures: string[];
  }> {
    const profiles = await this.loadTrainingData();
    const totalSamples = profiles.reduce((sum, p) => sum + p.samples.length, 0);
    const stats = await gestureDB.getStats();
    const backupData = localStorage.getItem(this.backupStorageKey);
    
    return {
      totalGestures: profiles.length,
      totalSamples,
      storageSize: stats.databaseSize,
      hasBackup: !!backupData,
      gestures: profiles.map(p => p.gestureName),
    };
  }

  // Export training data as JSON
  public async exportTrainingData(): Promise<string> {
    const jsonData = await gestureDB.exportToJSON();
    return jsonData;
  }

  // Import training data from JSON
  public async importTrainingData(jsonData: string): Promise<boolean> {
    try {
      const success = await gestureDB.importFromJSON(jsonData);
      if (success) {
        // Also update localStorage backup
        const profiles = JSON.parse(jsonData) as GestureProfile[];
        localStorage.setItem(this.backupStorageKey, jsonData);
        console.log('📥 Training data imported to IndexedDB:', profiles.length, 'profiles');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Failed to import training data:', error);
      return false;
    }
  }

  // Get training statistics
  public async getTrainingStats(): Promise<{
    totalGestures: number;
    totalSamples: number;
    averageSamplesPerGesture: number;
    gestureList: Array<{ name: string; samples: number }>;
  }> {
    const profiles = await this.loadTrainingData();
    const totalSamples = profiles.reduce((sum, p) => sum + p.samples.length, 0);
    
    return {
      totalGestures: profiles.length,
      totalSamples,
      averageSamplesPerGesture: profiles.length > 0 ? totalSamples / profiles.length : 0,
      gestureList: profiles.map(p => ({
        name: p.gestureName,
        samples: p.samples.length,
      })),
    };
  }

  // Utility: Calculate distance between two points
  private calculateDistance(
    a: { x: number; y: number; z?: number },
    b: { x: number; y: number; z?: number }
  ): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z || 0) - (b.z || 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // Utility: Calculate hand openness
  private calculateHandOpenness(landmarks: HandLandmarks): number {
    let totalDistance = 0;
    const fingerTips = [4, 8, 12, 16, 20];
    const palm = landmarks[0];

    fingerTips.forEach(tipIndex => {
      totalDistance += this.calculateDistance(landmarks[tipIndex], palm);
    });

    return totalDistance / fingerTips.length;
  }

  // Utility: Calculate angle between three points
  private calculateAngle(
    a: { x: number; y: number },
    b: { x: number; y: number },
    c: { x: number; y: number }
  ): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }

  // Utility: Generate unique session ID
  private generateSessionId(): string {
    return `training_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current session info
  public getCurrentSession(): TrainingSession | null {
    return this.currentSession;
  }

  // Check if training session is active
  public isTrainingActive(): boolean {
    return this.currentSession !== null;
  }
}

// Singleton instance
export const gestureTrainer = new GestureTrainer();
