import React, { useRef, useState } from 'react';
import {
  X,
  RotateCcw,
  Subtitles,
  Upload,
  FileText,
  Type,
  Clock,
  Sparkles,
  Palette,
  AlignVerticalSpaceAround,
} from 'lucide-react';
import { SubtitleSettings } from '../types';

interface SubtitleSyncPanelProps {
  settings: SubtitleSettings;
  currentSubtitleName: string | null;
  cueCount: number;
  activeSubtitleText: string | null;
  onChangeSettings: (settings: SubtitleSettings) => void;
  onLoadSubtitleFile: (file: File) => void;
  onLoadSubtitleText: (text: string, label: string) => void;
  onLoadSampleSubtitles: () => void;
  onReset: () => void;
  onClose: () => void;
}

export const SubtitleSyncPanel: React.FC<SubtitleSyncPanelProps> = ({
  settings,
  currentSubtitleName,
  cueCount,
  activeSubtitleText,
  onChangeSettings,
  onLoadSubtitleFile,
  onLoadSubtitleText,
  onLoadSampleSubtitles,
  onReset,
  onClose,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pasteModalOpen, setPasteModalOpen] = useState(false);
  const [pastedText, setPastedText] = useState('');

  const updateSettings = <K extends keyof SubtitleSettings>(key: K, value: SubtitleSettings[K]) => {
    onChangeSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadSubtitleFile(file);
      e.target.value = '';
    }
  };

  const handleApplyPasted = () => {
    if (pastedText.trim()) {
      onLoadSubtitleText(pastedText, 'Pasted Subtitles');
      setPastedText('');
      setPasteModalOpen(false);
    }
  };

  // Adjust delay in seconds
  const adjustDelay = (deltaSec: number) => {
    const newDelay = Math.round((settings.delay + deltaSec) * 100) / 100;
    updateSettings('delay', Math.max(-10, Math.min(10, newDelay)));
  };

  const delayMs = Math.round(settings.delay * 1000);

  return (
    <div
      id="vlc-subtitle-sync-panel"
      className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 text-zinc-200 select-none w-80 sm:w-96 shadow-2xl z-20 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-800 bg-zinc-950/70 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <h2 className="font-semibold text-sm tracking-wide text-white">Subtitle Synchronization</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
            title="Reset subtitle sync"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
            title="Close Panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 text-xs">
        {/* Toggle & Status */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Subtitles className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white">Enable Subtitles</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => updateSettings('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/80">
            <span>Track: {currentSubtitleName || 'None Loaded'}</span>
            <span>{cueCount > 0 ? `${cueCount} cues` : 'No cues'}</span>
          </div>

          {activeSubtitleText && (
            <div className="p-2 bg-zinc-900 border border-zinc-800 rounded text-center text-amber-300 font-medium text-[11px] italic">
              "{activeSubtitleText}"
            </div>
          )}
        </div>

        {/* Subtitle Source Actions */}
        <div className="space-y-2">
          <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
            Load Subtitle Track (.SRT / .VTT)
          </span>

          <input
            ref={fileInputRef}
            type="file"
            accept=".srt,.vtt,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-1.5 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded font-medium transition"
              title="Upload .SRT or .VTT file"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload</span>
            </button>

            <button
              onClick={() => setPasteModalOpen(true)}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded transition"
              title="Paste SRT text directly"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>

            <button
              onClick={onLoadSampleSubtitles}
              className="flex items-center justify-center gap-1.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded transition"
              title="Load synced sample subtitle demo"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sample Demo</span>
            </button>
          </div>
        </div>

        {/* Real-Time Timing Delay Offset (VLC Style Sync) */}
        <div className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-white">
              <Clock className="w-4 h-4 text-orange-400" />
              Subtitle Delay Offset
            </span>
            <span className={`font-mono font-bold text-sm ${delayMs !== 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
              {delayMs > 0 ? `+${delayMs}` : delayMs} ms
            </span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Shift subtitle timing forward or backward to achieve lip-sync precision.
          </p>

          {/* Quick Step Buttons */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            <button
              onClick={() => adjustDelay(-0.5)}
              className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono rounded text-[11px] transition"
            >
              -500ms
            </button>
            <button
              onClick={() => adjustDelay(-0.05)}
              className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono rounded text-[11px] transition"
            >
              -50ms (G)
            </button>
            <button
              onClick={() => adjustDelay(0.05)}
              className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono rounded text-[11px] transition"
            >
              +50ms (H)
            </button>
            <button
              onClick={() => adjustDelay(0.5)}
              className="py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono rounded text-[11px] transition"
            >
              +500ms
            </button>
          </div>

          {/* Slider from -10s to +10s */}
          <div className="space-y-1 pt-1">
            <input
              type="range"
              min="-10"
              max="10"
              step="0.05"
              value={settings.delay}
              onChange={(e) => updateSettings('delay', parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>-10.0s</span>
              <button
                onClick={() => updateSettings('delay', 0)}
                className="text-orange-400 hover:underline"
              >
                0.0s (Reset)
              </button>
              <span>+10.0s</span>
            </div>
          </div>

          <div className="p-2 bg-orange-950/20 border border-orange-800/30 rounded text-[11px] text-orange-300">
            <strong>TRID Tip:</strong> Press <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-white font-mono">G</kbd> to speed up or <kbd className="px-1 py-0.5 bg-zinc-800 rounded text-white font-mono">H</kbd> to delay subtitles at any time while watching!
          </div>
        </div>

        {/* Subtitle Appearance */}
        <div className="space-y-3">
          <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
            Appearance & Typography
          </span>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-zinc-400" /> Size
            </span>
            <div className="flex items-center gap-1 bg-zinc-800 p-0.5 rounded">
              {(['small', 'medium', 'large', 'huge'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSettings('fontSize', sz)}
                  className={`px-2 py-1 rounded text-[10px] uppercase font-bold transition ${
                    settings.fontSize === sz ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {sz[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Text Color */}
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-zinc-400" /> Text Color
            </span>
            <div className="flex items-center gap-2">
              {[
                { name: 'White', color: '#ffffff' },
                { name: 'Yellow', color: '#facc15' },
                { name: 'Cyan', color: '#22d3ee' },
                { name: 'Green', color: '#4ade80' },
              ].map((c) => (
                <button
                  key={c.color}
                  onClick={() => updateSettings('color', c.color)}
                  className={`w-5 h-5 rounded-full border-2 transition ${
                    settings.color === c.color ? 'border-orange-500 scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Position (Vertical offset) */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <AlignVerticalSpaceAround className="w-3.5 h-3.5 text-zinc-400" />
                Bottom Distance
              </span>
              <span className="font-mono text-zinc-400">{settings.positionY}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="25"
              value={settings.positionY}
              onChange={(e) => updateSettings('positionY', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Paste Subtitles Modal */}
      {pasteModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-md p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-semibold text-white">Paste Subtitle Content</h3>
              <button
                onClick={() => setPasteModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-zinc-400">
              Paste standard SRT or WebVTT content with timecodes (e.g. 00:00:01,000 --&gt; 00:00:04,000).
            </p>
            <textarea
              rows={8}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`1\n00:00:01,000 --> 00:00:04,000\nHello world!\n\n2\n00:00:05,000 --> 00:00:08,000\nSecond line...`}
              className="w-full p-2 bg-zinc-950 border border-zinc-700 rounded font-mono text-xs text-zinc-200 focus:outline-none focus:border-orange-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPasteModalOpen(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleApplyPasted}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded text-xs font-semibold"
              >
                Apply Subtitles
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
