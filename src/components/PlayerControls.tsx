import React, { useState, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Volume1,
  Maximize2,
  Minimize2,
  Sliders,
  Music,
  Subtitles,
  ListVideo,
  Globe,
  Cpu,
  Camera,
  PictureInPicture2,
  HelpCircle,
  Download,
} from 'lucide-react';
import { AudioVisualizer } from './AudioVisualizer';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bufferedEnd: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isPiP: boolean;
  activePanel: 'playlist' | 'video' | 'audio' | 'subtitle' | 'stream' | 'hw' | 'shortcuts' | 'install' | null;
  hasSubtitles: boolean;
  playlistCount: number;
  playbackRate: number;
  onPlayPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleFullscreen: () => void;
  onTogglePiP: () => void;
  onTakeSnapshot: () => void;
  onTogglePanel: (panel: 'playlist' | 'video' | 'audio' | 'subtitle' | 'stream' | 'hw' | 'shortcuts' | 'install') => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (h > 0) {
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  }
  return `${pad(m)}:${pad(s)}`;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  currentTime,
  duration,
  bufferedEnd,
  volume,
  isMuted,
  isFullscreen,
  isPiP,
  activePanel,
  hasSubtitles,
  playlistCount,
  playbackRate,
  onPlayPause,
  onStop,
  onSeek,
  onSkipBack,
  onSkipForward,
  onPrevTrack,
  onNextTrack,
  onVolumeChange,
  onToggleMute,
  onToggleFullscreen,
  onTogglePiP,
  onTakeSnapshot,
  onTogglePanel,
}) => {
  const [hoverPosition, setHoverPosition] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const progressRef = useRef<HTMLDivElement | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverPosition(pos * 100);
    setHoverTime(pos * duration);
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
    setHoverTime(null);
  };

  const handleClickSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration <= 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return <VolumeX className="w-5 h-5 text-red-400" />;
    if (volume > 100) return <Volume2 className="w-5 h-5 text-amber-400" />;
    if (volume < 50) return <Volume1 className="w-5 h-5 text-zinc-300" />;
    return <Volume2 className="w-5 h-5 text-zinc-300" />;
  };

  return (
    <div
      id="vlc-player-controls-container"
      className="w-full bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800/80 px-4 py-3 select-none text-zinc-200 transition-all"
    >
      {/* 1. Progress Scrubbing Bar */}
      <div className="relative mb-3 group">
        <div
          id="vlc-progress-track"
          ref={progressRef}
          onClick={handleClickSeek}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-2 group-hover:h-3 bg-zinc-800 rounded-full cursor-pointer transition-all overflow-hidden"
        >
          {/* Buffered track */}
          <div
            className="absolute top-0 left-0 h-full bg-zinc-700/60 transition-all pointer-events-none"
            style={{ width: `${Math.min(100, bufferedPercent)}%` }}
          />

          {/* Current progress track */}
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-600 via-orange-500 to-amber-400 rounded-full transition-all pointer-events-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Hover scrub tooltip */}
        {hoverPosition !== null && hoverTime !== null && (
          <div
            className="absolute -top-8 px-2 py-0.5 bg-zinc-900 border border-zinc-700 text-amber-400 text-xs font-mono rounded shadow-lg pointer-events-none transform -translate-x-1/2 whitespace-nowrap z-30"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      {/* 2. Control Buttons & Status */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        {/* Left: Playback transport */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous Track */}
          <button
            id="vlc-btn-prev"
            onClick={onPrevTrack}
            title="Previous Track (P)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Step Back 10s */}
          <button
            id="vlc-btn-rewind"
            onClick={onSkipBack}
            title="Rewind 10s (Left Arrow)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Play / Pause Main Button */}
          <button
            id="vlc-btn-play-pause"
            onClick={onPlayPause}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="p-2 sm:p-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-full transition-all shadow-md shadow-orange-950/40 active:scale-95"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-white" />
            ) : (
              <Play className="w-5 h-5 fill-white ml-0.5" />
            )}
          </button>

          {/* Stop */}
          <button
            id="vlc-btn-stop"
            onClick={onStop}
            title="Stop (S)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <Square className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Step Forward 10s */}
          <button
            id="vlc-btn-forward"
            onClick={onSkipForward}
            title="Forward 10s (Right Arrow)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Next Track */}
          <button
            id="vlc-btn-next"
            onClick={onNextTrack}
            title="Next Track (N)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Time Display */}
          <div className="ml-2 font-mono text-xs sm:text-sm text-zinc-300 tracking-wider">
            <span className="text-white font-medium">{formatTime(currentTime)}</span>
            <span className="text-zinc-500 mx-1">/</span>
            <span className="text-zinc-400">{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>

          {playbackRate !== 1.0 && (
            <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded border border-amber-500/30 font-mono">
              {playbackRate}x
            </span>
          )}
        </div>

        {/* Center: Audio visualizer (responsive, hidden on tiny screens) */}
        <div className="hidden lg:flex items-center justify-center px-2">
          <AudioVisualizer isPlaying={isPlaying} />
        </div>

        {/* Right: Volume & Feature Panels Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* VLC Volume Controller with 200% boost */}
          <div
            className="relative flex items-center"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              id="vlc-btn-volume-toggle"
              onClick={onToggleMute}
              title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-zinc-800/80 rounded transition"
            >
              {getVolumeIcon()}
            </button>

            {/* Slider dropdown or inline */}
            <div className={`flex items-center gap-2 transition-all ${showVolumeSlider ? 'w-28 sm:w-32 opacity-100 pl-1' : 'w-0 opacity-0 overflow-hidden'}`}>
              <input
                id="vlc-volume-slider"
                type="range"
                min="0"
                max="200"
                step="1"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
              <span className={`text-xs font-mono min-w-[2.5rem] text-right font-medium ${volume > 100 ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>
                {isMuted ? '0%' : `${Math.round(volume)}%`}
              </span>
            </div>
          </div>

          {/* Subtitles Sync Toggle */}
          <button
            id="vlc-btn-subtitles"
            onClick={() => onTogglePanel('subtitle')}
            title="Subtitles & Timing Sync"
            className={`p-1.5 rounded transition relative ${
              activePanel === 'subtitle'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Subtitles className="w-4 h-4 sm:w-5 sm:h-5" />
            {hasSubtitles && (
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          {/* Audio Equalizer */}
          <button
            id="vlc-btn-audio-eq"
            onClick={() => onTogglePanel('audio')}
            title="Audio Equalizer & Spatial Pan"
            className={`p-1.5 rounded transition ${
              activePanel === 'audio'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Music className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Video Effects */}
          <button
            id="vlc-btn-video-fx"
            onClick={() => onTogglePanel('video')}
            title="Video Effects & Aspect Ratio"
            className={`p-1.5 rounded transition ${
              activePanel === 'video'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Open Network Stream */}
          <button
            id="vlc-btn-network-stream"
            onClick={() => onTogglePanel('stream')}
            title="Open Network Stream (HLS, RTSP, URL)"
            className={`p-1.5 rounded transition ${
              activePanel === 'stream'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Playlist Toggle */}
          <button
            id="vlc-btn-playlist"
            onClick={() => onTogglePanel('playlist')}
            title="Playlist Manager"
            className={`p-1.5 rounded transition relative ${
              activePanel === 'playlist'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <ListVideo className="w-4 h-4 sm:w-5 sm:h-5" />
            {playlistCount > 0 && (
              <span className="absolute -top-1 -right-1 px-1 bg-orange-600 text-white text-[10px] font-bold rounded-full">
                {playlistCount}
              </span>
            )}
          </button>

          {/* Hardware Acceleration Stats */}
          <button
            id="vlc-btn-hw-accel"
            onClick={() => onTogglePanel('hw')}
            title="Hardware Acceleration & Media Info"
            className={`p-1.5 rounded transition ${
              activePanel === 'hw'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Snapshot Camera */}
          <button
            id="vlc-btn-snapshot"
            onClick={onTakeSnapshot}
            title="Take Frame Snapshot (PNG)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Picture-in-Picture */}
          <button
            id="vlc-btn-pip"
            onClick={onTogglePiP}
            title="Picture in Picture (PiP)"
            className={`p-1.5 rounded transition ${
              isPiP ? 'text-orange-400 bg-zinc-800' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <PictureInPicture2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Keyboard Shortcuts Help */}
          <button
            id="vlc-btn-shortcuts-help"
            onClick={() => onTogglePanel('shortcuts')}
            title="Keyboard Shortcuts (?)"
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Install Desktop App (Mac & Windows) */}
          <button
            id="vlc-btn-install-desktop"
            onClick={() => onTogglePanel('install')}
            title="Install Desktop Player for Mac & Windows"
            className={`p-1.5 rounded transition ${
              activePanel === 'install'
                ? 'bg-orange-600/30 text-orange-400 border border-orange-500/40'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Fullscreen */}
          <button
            id="vlc-btn-fullscreen"
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded transition"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
