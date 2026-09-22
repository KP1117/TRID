export type MediaType = 'video' | 'audio' | 'stream';

export interface PlaylistItem {
  id: string;
  title: string;
  src: string;
  type: MediaType;
  format: string;
  duration?: number;
  author?: string;
  thumbnail?: string;
  subtitlesUrl?: string;
  subtitleLabel?: string;
  isLive?: boolean;
}

export interface SubtitleCue {
  id: number;
  startTime: number; // in seconds
  endTime: number;   // in seconds
  text: string;
}

export interface VideoSettings {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 200 (default 100)
  saturation: number; // 0 to 200 (default 100)
  hueRotate: number;  // 0 to 360 deg
  aspectRatio: 'original' | '16:9' | '4:3' | '21:9' | 'fill' | 'stretch';
  playbackRate: number; // 0.25 to 4.0
  rotate: 0 | 90 | 180 | 270;
  flipHorizontal: boolean;
  flipVertical: boolean;
  hardwareAcceleration: boolean;
}

export interface AudioSettings {
  volume: number; // 0 to 200 (100 is nominal, up to 200 is VLC boost)
  muted: boolean;
  pan: number;    // -1.0 to 1.0
  delay: number;  // audio delay in ms (-5000 to +5000)
  equalizerEnabled: boolean;
  activePreset: string;
  bands: number[]; // 10 band gains in dB (-12 to +12)
}

export interface SubtitleSettings {
  enabled: boolean;
  delay: number; // in seconds (-10 to +10)
  fontSize: 'small' | 'medium' | 'large' | 'huge';
  color: string;
  backgroundColor: string;
  positionY: number; // percentage from bottom (e.g. 8%)
}

export interface HardwareStats {
  fps: number;
  droppedFrames: number;
  totalFrames: number;
  videoWidth: number;
  videoHeight: number;
  bufferHealth: number; // seconds buffered ahead
  engine: 'GPU-Accelerated (WebGL/CSS3D)' | 'Software Fallback';
  codec: string;
}
