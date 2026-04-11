import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Settings, X } from 'lucide-react';
import {
  subtitleGenerator,
  SubtitleEntry,
  SubtitleStyle,
  SubtitleExportOptions,
} from '@/services/subtitleGenerator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SubtitleOverlayProps {
  containerRef?: React.RefObject<HTMLDivElement>;
  onClose?: () => void;
}

export function SubtitleOverlay({ containerRef, onClose }: SubtitleOverlayProps) {
  const [currentSubtitle, setCurrentSubtitle] = useState<SubtitleEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [style, setStyle] = useState<SubtitleStyle>(subtitleGenerator.defaultStyle);
  const subtitleElementRef = useRef<HTMLDivElement>(null);

  // Update current subtitle every 100ms
  useEffect(() => {
    const interval = setInterval(() => {
      const subtitle = subtitleGenerator.getCurrentSubtitle();
      setCurrentSubtitle(subtitle);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Export subtitles
  const handleExport = (format: 'srt' | 'vtt' | 'json' | 'txt') => {
    const options: SubtitleExportOptions = {
      format,
      includeTimestamps: true,
      includeConfidence: format === 'json',
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    subtitleGenerator.download(`subtitles_${timestamp}`, options);
  };

  // Update style
  const updateStyle = (updates: Partial<SubtitleStyle>) => {
    const newStyle = { ...style, ...updates };
    setStyle(newStyle);
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Subtitle Display */}
      {currentSubtitle && (
        <div
          ref={subtitleElementRef}
          className="pointer-events-auto"
          style={{
            position: 'absolute',
            left: '50%',
            transform: style.position === 'middle' 
              ? 'translate(-50%, -50%)' 
              : 'translateX(-50%)',
            fontSize: `${style.fontSize}px`,
            fontFamily: style.fontFamily,
            color: style.color,
            backgroundColor: style.backgroundColor,
            opacity: style.opacity,
            padding: '8px 16px',
            borderRadius: '4px',
            textAlign: style.alignment,
            maxWidth: '80%',
            wordWrap: 'break-word',
            zIndex: 1000,
            textShadow: style.outlineWidth && style.outlineColor
              ? `
                -${style.outlineWidth}px -${style.outlineWidth}px 0 ${style.outlineColor},
                ${style.outlineWidth}px -${style.outlineWidth}px 0 ${style.outlineColor},
                -${style.outlineWidth}px ${style.outlineWidth}px 0 ${style.outlineColor},
                ${style.outlineWidth}px ${style.outlineWidth}px 0 ${style.outlineColor}
              `
              : undefined,
            ...(style.position === 'top' && { top: '10%' }),
            ...(style.position === 'middle' && { top: '50%' }),
            ...(style.position === 'bottom' && { bottom: '10%' }),
          }}
        >
          {currentSubtitle.text}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <Card className="absolute top-4 right-4 p-4 pointer-events-auto w-80 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Subtitle Settings</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Font Size */}
            <div>
              <Label>Font Size: {style.fontSize}px</Label>
              <Slider
                value={[style.fontSize]}
                onValueChange={([value]) => updateStyle({ fontSize: value })}
                min={12}
                max={48}
                step={1}
              />
            </div>

            {/* Position */}
            <div>
              <Label>Position</Label>
              <Select
                value={style.position}
                onValueChange={(value: 'top' | 'middle' | 'bottom') =>
                  updateStyle({ position: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="middle">Middle</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Alignment */}
            <div>
              <Label>Alignment</Label>
              <Select
                value={style.alignment}
                onValueChange={(value: 'left' | 'center' | 'right') =>
                  updateStyle({ alignment: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Text Color */}
            <div>
              <Label>Text Color</Label>
              <input
                type="color"
                value={style.color}
                onChange={(e) => updateStyle({ color: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            {/* Background Color */}
            <div>
              <Label>Background Color</Label>
              <input
                type="color"
                value={style.backgroundColor}
                onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            {/* Opacity */}
            <div>
              <Label>Opacity: {Math.round(style.opacity * 100)}%</Label>
              <Slider
                value={[style.opacity * 100]}
                onValueChange={([value]) => updateStyle({ opacity: value / 100 })}
                min={0}
                max={100}
                step={5}
              />
            </div>

            {/* Export Options */}
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Export Subtitles</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('srt')}
                >
                  SRT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('vtt')}
                >
                  VTT
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('json')}
                >
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport('txt')}
                >
                  TXT
                </Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Control Buttons */}
      <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          title="Subtitle Settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleExport('srt')}
          title="Download Subtitles"
        >
          <Download className="h-4 w-4" />
        </Button>
        {onClose && (
          <Button variant="outline" size="icon" onClick={onClose} title="Close Subtitles">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
