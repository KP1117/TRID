import React from 'react';
import {
  X,
  RotateCcw,
  Sun,
  Contrast,
  Palette,
  Sparkles,
  Gauge,
  Maximize,
  FlipHorizontal,
  FlipVertical,
  Cpu,
} from 'lucide-react';
import { VideoSettings } from '../types';

interface VideoEffectsPanelProps {
  settings: VideoSettings;
  onChange: (settings: VideoSettings) => void;
  onReset: () => void;
  onClose: () => void;
}

export const VideoEffectsPanel: React.FC<VideoEffectsPanelProps> = ({
  settings,
  onChange,
  onReset,
  onClose,
}) => {
  const updateSetting = <K extends keyof VideoSettings>(key: K, value: VideoSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const speedOptions = [0.25, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 3.0, 4.0];
  const aspectRatios: { label: string; value: VideoSettings['aspectRatio'] }[] = [
    { label: 'Original', value: 'original' },
    { label: '16:9', value: '16:9' },
    { label: '4:3', value: '4:3' },
    { label: '21:9 Cinema', value: '21:9' },
    { label: 'Fill / Crop', value: 'fill' },
    { label: 'Stretch', value: 'stretch' },
  ];

  return (
    <div
      id="vlc-video-effects-panel"
      className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 text-zinc-200 select-none w-80 sm:w-96 shadow-2xl z-20 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-800 bg-zinc-950/70 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <h2 className="font-semibold text-sm tracking-wide text-white">Video Adjustments</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
            title="Reset video adjustments to defaults"
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
        {/* 1. Hardware Acceleration Mode */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white">Hardware Acceleration</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.hardwareAcceleration}
                onChange={(e) => updateSetting('hardwareAcceleration', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            Uses GPU composite shaders and async decoding for smooth 4K/60fps playback and dropped frame prevention.
          </p>
        </div>

        {/* 2. Color & Lighting Adjustments */}
        <div className="space-y-3.5">
          <h3 className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
            Color & Picture
          </h3>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
              </span>
              <span className="font-mono text-zinc-400">{settings.brightness}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="150"
              value={settings.brightness}
              onChange={(e) => updateSetting('brightness', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Contrast className="w-3.5 h-3.5 text-zinc-400" /> Contrast
              </span>
              <span className="font-mono text-zinc-400">{settings.contrast}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="200"
              value={settings.contrast}
              onChange={(e) => updateSetting('contrast', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-pink-400" /> Saturation
              </span>
              <span className="font-mono text-zinc-400">{settings.saturation}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              value={settings.saturation}
              onChange={(e) => updateSetting('saturation', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          {/* Hue Rotate */}
          <div className="space-y-1">
            <div className="flex justify-between text-zinc-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Hue Rotation
              </span>
              <span className="font-mono text-zinc-400">{settings.hueRotate}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.hueRotate}
              onChange={(e) => updateSetting('hueRotate', parseInt(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        </div>

        {/* 3. Playback Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
              <Gauge className="w-3.5 h-3.5 text-orange-400" /> Playback Speed
            </span>
            <span className="font-mono text-amber-400 font-bold">{settings.playbackRate}x</span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {speedOptions.map((rate) => (
              <button
                key={rate}
                onClick={() => updateSetting('playbackRate', rate)}
                className={`py-1 rounded font-mono text-[11px] transition ${
                  settings.playbackRate === rate
                    ? 'bg-orange-600 text-white font-bold shadow'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>

        {/* 4. Aspect Ratio & Framing */}
        <div className="space-y-2">
          <span className="flex items-center gap-1.5 font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
            <Maximize className="w-3.5 h-3.5 text-orange-400" /> Aspect Ratio
          </span>

          <div className="grid grid-cols-3 gap-1.5">
            {aspectRatios.map((ar) => (
              <button
                key={ar.value}
                onClick={() => updateSetting('aspectRatio', ar.value)}
                className={`py-1.5 px-2 rounded text-[11px] transition ${
                  settings.aspectRatio === ar.value
                    ? 'bg-orange-600 text-white font-medium'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Geometry & Orientation */}
        <div className="space-y-2">
          <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
            Orientation & Flip
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                updateSetting(
                  'rotate',
                  ((settings.rotate + 90) % 360) as 0 | 90 | 180 | 270
                )
              }
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded transition"
              title="Rotate 90 degrees clockwise"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rotate ({settings.rotate}°)</span>
            </button>

            <button
              onClick={() => updateSetting('flipHorizontal', !settings.flipHorizontal)}
              className={`p-2 rounded transition ${
                settings.flipHorizontal ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-4 h-4" />
            </button>

            <button
              onClick={() => updateSetting('flipVertical', !settings.flipVertical)}
              className={`p-2 rounded transition ${
                settings.flipVertical ? 'bg-orange-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
              title="Flip Vertical"
            >
              <FlipVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
