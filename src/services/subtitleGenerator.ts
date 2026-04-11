// Advanced Subtitle Generation System

export interface SubtitleEntry {
  id: number;
  startTime: number; // milliseconds
  endTime: number; // milliseconds
  text: string;
  language: string;
  confidence: number;
  speaker?: string;
}

export interface SubtitleStyle {
  fontSize: number; // pixels
  fontFamily: string;
  color: string;
  backgroundColor: string;
  opacity: number; // 0-1
  position: 'top' | 'middle' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  outlineColor?: string;
  outlineWidth?: number;
}

export interface SubtitleExportOptions {
  format: 'srt' | 'vtt' | 'json' | 'txt';
  includeTimestamps: boolean;
  includeConfidence?: boolean;
}

class SubtitleGenerator {
  private subtitles: SubtitleEntry[] = [];
  private currentSubtitleId = 0;
  private defaultDuration = 3000; // 3 seconds default display time
  private minDuration = 1000; // 1 second minimum
  private maxDuration = 5000; // 5 seconds maximum
  private minConfidenceThreshold = 0.65; // Lowered to 65% to match gesture recognition

  // Default styling
  public defaultStyle: SubtitleStyle = {
    fontSize: 24,
    fontFamily: 'Arial, sans-serif',
    color: '#FFFFFF',
    backgroundColor: '#000000',
    opacity: 0.8,
    position: 'bottom',
    alignment: 'center',
    outlineColor: '#000000',
    outlineWidth: 2,
  };

  // Add a new subtitle entry
  public addSubtitle(
    text: string,
    language: string,
    confidence: number = 1.0,
    duration?: number
  ): SubtitleEntry | null {
    // Filter out low confidence subtitles
    if (confidence < this.minConfidenceThreshold) {
      console.log(`Subtitle rejected: confidence ${confidence} < ${this.minConfidenceThreshold}`);
      return null;
    }

    // Don't add empty or invalid text
    if (!text || text.trim().length === 0) {
      return null;
    }

    const now = Date.now();
    const trimmedText = text.trim();

    // ANTI-REPETITION: Check if the same text was recently added (within 5 seconds)
    const recentSubtitles = this.subtitles.slice(-5); // Check last 5 subtitles
    const isDuplicate = recentSubtitles.some(sub => 
      sub.text === trimmedText && 
      sub.language === language &&
      (now - sub.startTime) < 5000 // Same text within 5 seconds
    );

    if (isDuplicate) {
      console.log(`🚫 Subtitle blocked (duplicate): "${trimmedText}" (already shown recently)`);
      return null;
    }

    const subtitleDuration = this.calculateDuration(trimmedText, duration);

    const subtitle: SubtitleEntry = {
      id: this.currentSubtitleId++,
      startTime: now,
      endTime: now + subtitleDuration,
      text: trimmedText,
      language,
      confidence,
    };

    this.subtitles.push(subtitle);
    console.log(`✅ Subtitle added: "${trimmedText}" (${language})`);

    // Keep only last 100 subtitles to prevent memory issues
    if (this.subtitles.length > 100) {
      this.subtitles.shift();
    }

    return subtitle;
  }

  // Get current active subtitle
  public getCurrentSubtitle(timestamp?: number): SubtitleEntry | null {
    const now = timestamp || Date.now();
    
    // Find the most recent subtitle that should be displayed
    for (let i = this.subtitles.length - 1; i >= 0; i--) {
      const subtitle = this.subtitles[i];
      if (now >= subtitle.startTime && now <= subtitle.endTime) {
        return subtitle;
      }
    }

    return null;
  }

  // Get all subtitles within a time range
  public getSubtitlesInRange(startTime: number, endTime: number): SubtitleEntry[] {
    return this.subtitles.filter(
      subtitle =>
        (subtitle.startTime >= startTime && subtitle.startTime <= endTime) ||
        (subtitle.endTime >= startTime && subtitle.endTime <= endTime) ||
        (subtitle.startTime <= startTime && subtitle.endTime >= endTime)
    );
  }

  // Export subtitles in various formats
  public export(options: SubtitleExportOptions): string {
    switch (options.format) {
      case 'srt':
        return this.exportToSRT();
      case 'vtt':
        return this.exportToVTT();
      case 'json':
        return this.exportToJSON(options.includeConfidence);
      case 'txt':
        return this.exportToTXT(options.includeTimestamps);
      default:
        return this.exportToSRT();
    }
  }

  // SRT format export
  private exportToSRT(): string {
    const srtEntries = this.subtitles.map((subtitle, index) => {
      const startTime = this.formatSRTTime(subtitle.startTime);
      const endTime = this.formatSRTTime(subtitle.endTime);
      
      return `${index + 1}\n${startTime} --> ${endTime}\n${subtitle.text}\n`;
    });

    return srtEntries.join('\n');
  }

  // VTT format export (WebVTT)
  private exportToVTT(): string {
    let vtt = 'WEBVTT\n\n';
    
    this.subtitles.forEach((subtitle, index) => {
      const startTime = this.formatVTTTime(subtitle.startTime);
      const endTime = this.formatVTTTime(subtitle.endTime);
      
      vtt += `${index + 1}\n`;
      vtt += `${startTime} --> ${endTime}\n`;
      vtt += `${subtitle.text}\n\n`;
    });

    return vtt;
  }

  // JSON format export
  private exportToJSON(includeConfidence?: boolean): string {
    const data = this.subtitles.map(subtitle => {
      const entry: Record<string, string | number> = {
        id: subtitle.id,
        startTime: subtitle.startTime,
        endTime: subtitle.endTime,
        text: subtitle.text,
        language: subtitle.language,
      };

      if (includeConfidence) {
        entry.confidence = subtitle.confidence;
      }

      return entry;
    });

    return JSON.stringify(data, null, 2);
  }

  // Plain text export
  private exportToTXT(includeTimestamps: boolean): string {
    return this.subtitles.map(subtitle => {
      if (includeTimestamps) {
        const time = this.formatReadableTime(subtitle.startTime);
        return `[${time}] ${subtitle.text}`;
      }
      return subtitle.text;
    }).join('\n');
  }

  // Format time for SRT (HH:MM:SS,mmm)
  private formatSRTTime(milliseconds: number): string {
    const date = new Date(milliseconds);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    
    return `${hours}:${minutes}:${seconds},${ms}`;
  }

  // Format time for VTT (HH:MM:SS.mmm)
  private formatVTTTime(milliseconds: number): string {
    const date = new Date(milliseconds);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(date.getUTCMilliseconds()).padStart(3, '0');
    
    return `${hours}:${minutes}:${seconds}.${ms}`;
  }

  // Format readable time (HH:MM:SS)
  private formatReadableTime(milliseconds: number): string {
    const date = new Date(milliseconds);
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${hours}:${minutes}:${seconds}`;
  }

  // Calculate appropriate duration based on text length
  private calculateDuration(text: string, customDuration?: number): number {
    if (customDuration) {
      return Math.max(this.minDuration, Math.min(customDuration, this.maxDuration));
    }

    // Calculate based on reading speed (average 200 words per minute)
    const words = text.split(/\s+/).length;
    const calculatedDuration = (words / 200) * 60 * 1000; // Convert to milliseconds

    return Math.max(
      this.minDuration,
      Math.min(calculatedDuration + 500, this.maxDuration)
    );
  }

  // Get subtitle statistics
  public getStatistics() {
    return {
      totalSubtitles: this.subtitles.length,
      averageConfidence: 
        this.subtitles.reduce((sum, s) => sum + s.confidence, 0) / 
        (this.subtitles.length || 1),
      totalDuration: this.subtitles.reduce(
        (sum, s) => sum + (s.endTime - s.startTime),
        0
      ),
      languages: Array.from(new Set(this.subtitles.map(s => s.language))),
    };
  }

  // Clear all subtitles
  public clear(): void {
    this.subtitles = [];
    this.currentSubtitleId = 0;
  }

  // Get all subtitles
  public getAllSubtitles(): SubtitleEntry[] {
    return [...this.subtitles];
  }

  // Download subtitle file
  public download(filename: string, options: SubtitleExportOptions): void {
    const content = this.export(options);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.${options.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Create styled subtitle HTML element
  public createSubtitleElement(
    subtitle: SubtitleEntry,
    style: Partial<SubtitleStyle> = {}
  ): HTMLDivElement {
    const mergedStyle = { ...this.defaultStyle, ...style };
    const element = document.createElement('div');
    
    element.className = 'subtitle-element';
    element.textContent = subtitle.text;
    
    // Apply styles
    element.style.position = 'absolute';
    element.style.left = '50%';
    element.style.transform = 'translateX(-50%)';
    element.style.fontSize = `${mergedStyle.fontSize}px`;
    element.style.fontFamily = mergedStyle.fontFamily;
    element.style.color = mergedStyle.color;
    element.style.backgroundColor = mergedStyle.backgroundColor;
    element.style.opacity = String(mergedStyle.opacity);
    element.style.padding = '8px 16px';
    element.style.borderRadius = '4px';
    element.style.textAlign = mergedStyle.alignment;
    element.style.maxWidth = '80%';
    element.style.wordWrap = 'break-word';
    element.style.zIndex = '1000';
    
    // Position
    switch (mergedStyle.position) {
      case 'top':
        element.style.top = '10%';
        break;
      case 'middle':
        element.style.top = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        break;
      case 'bottom':
        element.style.bottom = '10%';
        break;
    }

    // Text outline
    if (mergedStyle.outlineWidth && mergedStyle.outlineColor) {
      element.style.textShadow = `
        -${mergedStyle.outlineWidth}px -${mergedStyle.outlineWidth}px 0 ${mergedStyle.outlineColor},
        ${mergedStyle.outlineWidth}px -${mergedStyle.outlineWidth}px 0 ${mergedStyle.outlineColor},
        -${mergedStyle.outlineWidth}px ${mergedStyle.outlineWidth}px 0 ${mergedStyle.outlineColor},
        ${mergedStyle.outlineWidth}px ${mergedStyle.outlineWidth}px 0 ${mergedStyle.outlineColor}
      `;
    }

    return element;
  }
}

// Singleton instance
export const subtitleGenerator = new SubtitleGenerator();
