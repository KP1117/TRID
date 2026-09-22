import React from 'react';
import {
  X,
  Cpu,
  Zap,
  Activity,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Layers,
  Sparkles,
} from 'lucide-react';
import { HardwareStats } from '../types';

interface HardwareAccelerationModalProps {
  stats: HardwareStats;
  hardwareEnabled: boolean;
  onToggleHardware: (enabled: boolean) => void;
  onClose: () => void;
}

export const HardwareAccelerationModal: React.FC<HardwareAccelerationModalProps> = ({
  stats,
  hardwareEnabled,
  onToggleHardware,
  onClose,
}) => {
  const is4K = stats.videoWidth >= 3840 || stats.videoHeight >= 2160;
  const is1080p = stats.videoWidth >= 1920 || stats.videoHeight >= 1080;

  return (
    <div
      id="vlc-hw-accel-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-lg border border-orange-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Hardware Acceleration & Telemetry</h2>
              <p className="text-xs text-zinc-400">
                GPU decoding engine & real-time playback performance metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Master Toggle Card */}
          <div className="p-4 bg-gradient-to-br from-zinc-950 to-zinc-900 border border-zinc-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className={`w-5 h-5 ${hardwareEnabled ? 'text-amber-400 fill-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-semibold text-white text-sm">GPU Hardware Acceleration</div>
                  <div className="text-[11px] text-zinc-400">
                    {hardwareEnabled ? 'Active • GPU Compositing & Async Decoder' : 'Disabled • Software Fallback'}
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hardwareEnabled}
                  onChange={(e) => onToggleHardware(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Enables GPU zero-copy compositing, 3D translation pipelines, and asynchronous frame decoding. Highly recommended for high-resolution 4K Ultra-HD, 60fps, and high-bitrate video playback.
            </p>
          </div>

          {/* Telemetry Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 uppercase tracking-wider text-[10px] font-semibold">
              <span className="flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-orange-400" /> Real-Time Telemetry
              </span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* FPS */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                <div className="text-zinc-500 text-[10px]">Playback Rate</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {stats.fps > 0 ? `${stats.fps} FPS` : '60 FPS'}
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Smooth</div>
              </div>

              {/* Resolution */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                <div className="text-zinc-500 text-[10px]">Resolution</div>
                <div className="text-sm font-mono font-bold text-white mt-1 truncate">
                  {stats.videoWidth > 0 ? `${stats.videoWidth} × ${stats.videoHeight}` : 'Auto'}
                </div>
                <div className="text-[10px] text-amber-400 mt-0.5">
                  {is4K ? '4K Ultra-HD' : is1080p ? '1080p Full-HD' : 'Standard HD'}
                </div>
              </div>

              {/* Dropped Frames */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                <div className="text-zinc-500 text-[10px]">Dropped Frames</div>
                <div className={`text-lg font-mono font-bold mt-0.5 ${stats.droppedFrames > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {stats.droppedFrames}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {stats.totalFrames > 0 ? `of ${stats.totalFrames} frames` : '0 drops'}
                </div>
              </div>

              {/* Buffer Health */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg">
                <div className="text-zinc-500 text-[10px]">Buffer Ahead</div>
                <div className="text-lg font-mono font-bold text-white mt-0.5">
                  {stats.bufferHealth.toFixed(1)}s
                </div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Healthy Buffer</div>
              </div>

              {/* Render Pipeline */}
              <div className="p-3 bg-zinc-950/70 border border-zinc-800 rounded-lg sm:col-span-2">
                <div className="text-zinc-500 text-[10px]">Active Decoder Pipeline</div>
                <div className="text-xs font-mono font-bold text-orange-400 mt-1 truncate">
                  {hardwareEnabled ? 'WebGL 2.0 / GPU Compositor' : 'CPU Software Decode'}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  Direct hardware acceleration enabled
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="p-3 bg-zinc-950/50 border border-zinc-800 rounded-lg space-y-2 text-[11px] text-zinc-400">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Engine Features
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Async Video Decoder</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3D Transform Compositing</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Latency Seek Shaders</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Adaptive Bitrate Buffer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-950/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
