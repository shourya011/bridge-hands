// IndexedDB wrapper for persistent gesture storage
import { GestureProfile } from './gestureTrainer';

class GestureDatabase {
  private dbName = 'GestureSignLanguageDB';
  private dbVersion = 1;
  private storeName = 'gestures';
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  // Initialize IndexedDB
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Failed to open database:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const objectStore = db.createObjectStore(this.storeName, { keyPath: 'gestureName' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('✅ Object store created');
        }
      };
    });
  }

  // Ensure database is ready
  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.initDatabase();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  // Save a gesture profile
  async saveGesture(profile: GestureProfile): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      // Add timestamp for tracking
      const dataToSave = {
        ...profile,
        timestamp: Date.now(),
        lastUpdated: new Date().toISOString(),
      };
      
      const request = objectStore.put(dataToSave);

      request.onsuccess = () => {
        console.log('💾 Gesture saved to database:', profile.gestureName);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to save gesture:', request.error);
        reject(request.error);
      };
    });
  }

  // Save multiple gestures
  async saveGestures(profiles: GestureProfile[]): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      
      let completed = 0;
      const total = profiles.length;

      profiles.forEach((profile) => {
        const dataToSave = {
          ...profile,
          timestamp: Date.now(),
          lastUpdated: new Date().toISOString(),
        };
        
        const request = objectStore.put(dataToSave);

        request.onsuccess = () => {
          completed++;
          console.log(`💾 Saved ${completed}/${total}: ${profile.gestureName}`);
          
          if (completed === total) {
            resolve();
          }
        };

        request.onerror = () => {
          console.error('❌ Failed to save gesture:', profile.gestureName, request.error);
          reject(request.error);
        };
      });
    });
  }

  // Load all gestures
  async loadAllGestures(): Promise<GestureProfile[]> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const gestures = request.result as GestureProfile[];
        console.log('📂 Loaded gestures from database:', gestures.length);
        console.log('🎯 Gestures:', gestures.map(g => g.gestureName).join(', '));
        resolve(gestures);
      };

      request.onerror = () => {
        console.error('❌ Failed to load gestures:', request.error);
        reject(request.error);
      };
    });
  }

  // Load a single gesture
  async loadGesture(gestureName: string): Promise<GestureProfile | null> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.get(gestureName);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('❌ Failed to load gesture:', request.error);
        reject(request.error);
      };
    });
  }

  // Delete a gesture
  async deleteGesture(gestureName: string): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.delete(gestureName);

      request.onsuccess = () => {
        console.log('🗑️ Gesture deleted from database:', gestureName);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to delete gesture:', request.error);
        reject(request.error);
      };
    });
  }

  // Clear all gestures
  async clearAllGestures(): Promise<void> {
    const db = await this.ensureDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite');
      const objectStore = transaction.objectStore(this.storeName);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('🗑️ All gestures cleared from database');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to clear gestures:', request.error);
        reject(request.error);
      };
    });
  }

  // Get database statistics
  async getStats(): Promise<{
    totalGestures: number;
    totalSamples: number;
    databaseSize: number;
    gestures: string[];
    oldestGesture: string | null;
    newestGesture: string | null;
  }> {
    const gestures = await this.loadAllGestures();
    const totalSamples = gestures.reduce((sum, g) => sum + g.samples.length, 0);
    
    // Sort by timestamp to find oldest and newest
    const sorted = [...gestures].sort((a, b) => {
      const aTime = (a as GestureProfile & { timestamp?: number }).timestamp || 0;
      const bTime = (b as GestureProfile & { timestamp?: number }).timestamp || 0;
      return aTime - bTime;
    });

    return {
      totalGestures: gestures.length,
      totalSamples,
      databaseSize: JSON.stringify(gestures).length,
      gestures: gestures.map(g => g.gestureName),
      oldestGesture: sorted[0]?.gestureName || null,
      newestGesture: sorted[sorted.length - 1]?.gestureName || null,
    };
  }

  // Export all gestures as JSON
  async exportToJSON(): Promise<string> {
    const gestures = await this.loadAllGestures();
    return JSON.stringify(gestures, null, 2);
  }

  // Import gestures from JSON
  async importFromJSON(jsonString: string): Promise<number> {
    try {
      const gestures = JSON.parse(jsonString) as GestureProfile[];
      await this.saveGestures(gestures);
      console.log('✅ Imported', gestures.length, 'gestures');
      return gestures.length;
    } catch (error) {
      console.error('❌ Failed to import gestures:', error);
      throw error;
    }
  }

  // Migrate from localStorage to IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    const localStorageKey = 'gesture_training_data';
    const data = localStorage.getItem(localStorageKey);
    
    if (data) {
      try {
        const profiles = JSON.parse(data) as GestureProfile[];
        await this.saveGestures(profiles);
        console.log('✅ Migrated', profiles.length, 'gestures from localStorage to IndexedDB');
        
        // Keep localStorage as backup but mark as migrated
        localStorage.setItem('gesture_data_migrated', 'true');
      } catch (error) {
        console.error('❌ Failed to migrate from localStorage:', error);
      }
    }
  }

  // Check if database exists and has data
  async hasData(): Promise<boolean> {
    try {
      const gestures = await this.loadAllGestures();
      return gestures.length > 0;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const gestureDB = new GestureDatabase();
