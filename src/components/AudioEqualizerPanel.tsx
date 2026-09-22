import React from 'react';
import {
  X,
  RotateCcw,
  Volume2,
  Sliders,
  Sparkles,
  Layers,
} from 'lucide-react';
import { AudioSettings } from '../types';
import { EQ_FREQUENCIES, EQ_PRESETS } from '../utils/audioEngine';

interface AudioEqualizerPanelProps {
  settings: AudioSettings;
  onChange: (settings: AudioSettings) => void;
  onReset: () => void;
  onClose: () => void;
}

export const AudioEqualizerPanel: React.FC<AudioEqualizerPanelProps> = ({
  settings,
  onChange,
  onReset,
  onClose,
}) => {
  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    onChange({
      ...settings,
      [key]: value,
    });
  };

  const handleBandChange = (index: number, val: number) => {
    const newBands = [...settings.bands];
    newBands[index] = val;
    onChange({
      ...settings,
      activePreset: 'Custom',
      bands: newBands,
    });
  };

  const handlePresetSelect = (presetName: string) => {
    if (EQ_PRESETS[presetName]) {
      onChange({
        ...settings,
        activePreset: presetName,
        bands: [...EQ_PRESETS[presetName]],
      });
    }
  };

  const formatFreq = (freq: number) => {
    return freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
  };

  return (
    <div
      id="vlc-audio-eq-panel"
      className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 text-zinc-200 select-none w-80 sm:w-96 shadow-2xl z-20 overflow-y-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-800 bg-zinc-950/70 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <h2 className="font-semibold text-sm tracking-wide text-white">Audio Equalizer & FX</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
            title="Reset audio settings"
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
        {/* Equalizer Toggle & Presets */}
        <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-400" />
              <span className="font-semibold text-white">10-Band Graphic Equalizer</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.equalizerEnabled}
                onChange={(e) => updateSetting('equalizerEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {/* Presets dropdown */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-[11px]">Preset:</span>
            <select
              disabled={!settings.equalizerEnabled}
              value={settings.activePreset}
              onChange={(e) => handlePresetSelect(e.target.value)}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-200 focus:outline-none focus:border-orange-500 disabled:opacity-40"
            >
              <option value="Custom">Custom</option>
              {Object.keys(EQ_PRESETS).map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 10 Vertical Equalizer Sliders */}
        <div className={`space-y-2 transition-opacity ${settings.equalizerEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex justify-between items-center text-[10px] text-zinc-400 px-1 font-mono">
            <span>+12 dB</span>
            <span>0 dB</span>
            <span>-12 dB</span>
          </div>

          <div className="flex items-end justify-between gap-1 bg-zinc-950/40 p-3 rounded-lg border border-zinc-800/80 h-44">
            {EQ_FREQUENCIES.map((freq, idx) => {
              const gain = settings.bands[idx] ?? 0;
              return (
                <div key={freq} className="flex flex-col items-center h-full justify-between w-full">
                  <span className="text-[9px] font-mono text-zinc-400">
                    {gain > 0 ? `+${gain.toFixed(0)}` : gain.toFixed(0)}
                  </span>

                  <div className="relative flex-1 flex items-center justify-center my-1 w-full">
                    <input
                      type="range"
                      min="-12"
                      max="12"
                      step="0.5"
                      value={gain}
                      onChange={(e) => handleBandChange(idx, parseFloat(e.target.value))}
                      className="h-28 w-2 appearance-none bg-zinc-800 rounded-lg cursor-pointer accent-orange-500 [writing-mode:vertical-lr] [direction:rtl]"
                    />
                  </div>

                  <span className="text-[10px] font-mono font-medium text-zinc-300">
                    {formatFreq(freq)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume Boost Control */}
        <div className="space-y-2 p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg">
          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Volume2 className="w-4 h-4 text-orange-400" />
              Master Volume & Boost
            </span>
            <span className={`font-mono font-bold ${settings.volume > 100 ? 'text-amber-400' : 'text-zinc-300'}`}>
              {Math.round(settings.volume)}% {settings.volume > 100 && '(Boosted)'}
            </span>
          </div>

          <input
            type="range"
            min="0"
            max="200"
            step="1"
            value={settings.volume}
            onChange={(e) => updateSetting('volume', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />

          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>0%</span>
            <span>100% (Standard)</span>
            <span className="text-amber-400">200% (TRID Boost)</span>
          </div>
        </div>

        {/* Stereo Panning (Balance) */}
        <div className="space-y-2 p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg">
          <div className="flex justify-between items-center text-zinc-300">
            <span className="flex items-center gap-1.5 font-medium">
              <Layers className="w-4 h-4 text-orange-400" />
              Stereo Balance (Pan)
            </span>
            <span className="font-mono text-zinc-400">
              {settings.pan === 0
                ? 'Center'
                : settings.pan < 0
                ? `L ${(Math.abs(settings.pan) * 100).toFixed(0)}%`
                : `R ${(settings.pan * 100).toFixed(0)}%`}
            </span>
          </div>

          <input
            type="range"
            min="-1"
            max="1"
            step="0.05"
            value={settings.pan}
            onChange={(e) => updateSetting('pan', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
          />

          <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
            <span>Left</span>
            <span>Center</span>
            <span>Right</span>
          </div>
        </div>

        {/* Audio Delay Offset Sync */}
        <div className="space-y-2 p-3 bg-zinc-950/40 border border-zinc-800/80 rounded-lg">
          <div className="flex justify-between items-center text-zinc-300">
            <span className="font-medium">Audio Synchronization Delay</span>
            <span className="font-mono text-amber-400 font-bold">
              {settings.delay > 0 ? `+${settings.delay}` : settings.delay} ms
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1 pt-1">
            {[-250, -50, 0, 50, 250].map((val) => (
              <button
                key={val}
                onClick={() =>
                  updateSetting(
                    'delay',
                    val === 0 ? 0 : Math.max(-5000, Math.min(5000, settings.delay + val))
                  )
                }
                className="py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono rounded transition"
              >
                {val === 0 ? '0 ms' : val > 0 ? `+${val}` : `${val}`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
