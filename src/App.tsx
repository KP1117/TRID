/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import {
  PlaylistItem,
  VideoSettings,
  AudioSettings,
  SubtitleSettings,
  HardwareStats,
  SubtitleCue,
} from './types';
import { SAMPLE_PLAYLIST, SAMPLE_SUBTITLES_SRT } from './data/sampleMedia';
import { parseSubtitleText, getActiveCue } from './utils/subtitleParser';
import { audioEngine, EQ_PRESETS } from './utils/audioEngine';
import { PlayerControls } from './components/PlayerControls';
import { PlaylistPanel } from './components/PlaylistPanel';
import { VideoEffectsPanel } from './components/VideoEffectsPanel';
import { AudioEqualizerPanel } from './components/AudioEqualizerPanel';
import { SubtitleSyncPanel } from './components/SubtitleSyncPanel';
import { NetworkStreamModal } from './components/NetworkStreamModal';
import { HardwareAccelerationModal } from './components/HardwareAccelerationModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { InstallDesktopModal } from './components/InstallDesktopModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import {
  FolderOpen,
  Globe,
  HelpCircle,
  Upload,
  Cpu,
  Subtitles,
  Music2,
  Tv,
  AlertCircle,
  Play,
  Apple,
  Monitor,
  Download,
} from 'lucide-react';

export default function App() {
  // Playlist State
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(SAMPLE_PLAYLIST);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('all');

  // Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isPiP, setIsPiP] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Active Panel State
  const [activePanel, setActivePanel] = useState<
    'playlist' | 'video' | 'audio' | 'subtitle' | 'stream' | 'hw' | 'shortcuts' | 'install' | null
  >(null);

  // Desktop App Installation & Platform detection
  const { isInstallable, isInstalled, platform, install } = usePWAInstall();

  // Settings State
  const [videoSettings, setVideoSettings] = useState<VideoSettings>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    aspectRatio: 'original',
    playbackRate: 1.0,
    rotate: 0,
    flipHorizontal: false,
    flipVertical: false,
    hardwareAcceleration: true,
  });

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    volume: 100,
    muted: false,
    pan: 0,
    delay: 0,
    equalizerEnabled: true,
    activePreset: 'Flat',
    bands: [...EQ_PRESETS['Flat']],
  });

  const [subtitleSettings, setSubtitleSettings] = useState<SubtitleSettings>({
    enabled: true,
    delay: 0,
    fontSize: 'large',
    color: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    positionY: 8,
  });

  // Subtitles content
  const [subtitles, setSubtitles] = useState<SubtitleCue[]>([]);
  const [currentSubtitleName, setCurrentSubtitleName] = useState<string | null>(null);
  const [activeSubtitleCue, setActiveSubtitleCue] = useState<SubtitleCue | null>(null);

  // Hardware telemetry stats
  const [hwStats, setHwStats] = useState<HardwareStats>({
    fps: 60,
    droppedFrames: 0,
    totalFrames: 0,
    videoWidth: 0,
    videoHeight: 0,
    bufferHealth: 0,
    engine: 'GPU-Accelerated (WebGL/CSS3D)',
    codec: 'H.264 / AVC1 (Hardware Accelerated)',
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevFrameCountRef = useRef<number>(0);
  const lastFpsTimeRef = useRef<number>(performance.now());

  const currentTrack = playlist[currentIndex] || null;

  const showToast = useCallback((msg: string) => {
    setNotificationToast(msg);
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = window.setTimeout(() => {
      setNotificationToast(null);
    }, 2500);
  }, []);

  // Load sample subtitles by default for demo
  useEffect(() => {
    const defaultCues = parseSubtitleText(SAMPLE_SUBTITLES_SRT);
    setSubtitles(defaultCues);
    setCurrentSubtitleName('English Demo (Synced)');
  }, []);

  // Initialize Web Audio API on first user interaction or play
  const ensureAudioEngineInit = useCallback(() => {
    if (videoRef.current) {
      audioEngine.init(videoRef.current);
      audioEngine.resume();
      audioEngine.setVolume(audioSettings.volume, audioSettings.muted);
      audioEngine.setPan(audioSettings.pan);
      audioEngine.setEqualizerBands(audioSettings.bands, audioSettings.equalizerEnabled);
    }
  }, [audioSettings]);

  // Handle track source loading (HLS vs native)
  const isFirstMountRef = useRef(true);

  const loadMediaTrack = useCallback((track: PlaylistItem, autoPlay: boolean) => {
    const video = videoRef.current;
    if (!video || !track) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isHlsUrl =
      track.src.includes('.m3u8') || track.type === 'stream';

    if (isHlsUrl && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;
      hls.loadSource(track.src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().then(() => setIsPlaying(true)).catch((e) => {
            console.warn('HLS play error:', e);
            setIsPlaying(false);
          });
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          showToast(`Stream notice: ${data.details}`);
        }
      });
    } else {
      video.src = track.src;
      video.load();
      if (autoPlay) {
        video.play().then(() => setIsPlaying(true)).catch((e) => {
          console.warn('Video play error:', e);
          setIsPlaying(false);
        });
      }
    }
  }, [showToast]);

  useEffect(() => {
    if (!currentTrack) return;

    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      // Preload the media source on mount without forcing unmuted play
      loadMediaTrack(currentTrack, false);
    } else {
      // Whenever track changes subsequently, load and immediately play
      loadMediaTrack(currentTrack, true);
      showToast(`Now Playing: ${currentTrack.title}`);
    }
  }, [currentIndex, currentTrack, loadMediaTrack, showToast]);

  // Sync Video Settings to Video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = videoSettings.playbackRate;
    }
  }, [videoSettings.playbackRate]);

  // Sync Audio Settings to AudioEngine
  useEffect(() => {
    audioEngine.setVolume(audioSettings.volume, audioSettings.muted);
  }, [audioSettings.volume, audioSettings.muted]);

  useEffect(() => {
    audioEngine.setPan(audioSettings.pan);
  }, [audioSettings.pan]);

  useEffect(() => {
    audioEngine.setEqualizerBands(audioSettings.bands, audioSettings.equalizerEnabled);
  }, [audioSettings.bands, audioSettings.equalizerEnabled]);

  // Sync Subtitle active cue
  useEffect(() => {
    if (!subtitleSettings.enabled || subtitles.length === 0) {
      setActiveSubtitleCue(null);
      return;
    }
    const cue = getActiveCue(subtitles, currentTime, subtitleSettings.delay);
    setActiveSubtitleCue(cue);
  }, [currentTime, subtitleSettings.delay, subtitleSettings.enabled, subtitles]);

  // Telemetry loop for FPS, dropped frames, buffer
  useEffect(() => {
    let animId: number;

    const measureStats = () => {
      const video = videoRef.current;
      if (video) {
        // Measure buffer ahead
        let bufferAhead = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          if (
            video.buffered.start(i) <= video.currentTime &&
            video.buffered.end(i) >= video.currentTime
          ) {
            bufferAhead = Math.max(0, video.buffered.end(i) - video.currentTime);
            break;
          }
        }

        // Measure quality and dropped frames
        let dropped = 0;
        let total = 0;
        if ('getVideoPlaybackQuality' in video) {
          const quality = (video as HTMLVideoElement & { getVideoPlaybackQuality: () => { droppedVideoFrames: number; totalVideoFrames: number } }).getVideoPlaybackQuality();
          dropped = quality.droppedVideoFrames;
          total = quality.totalVideoFrames;
        }

        // Approximate FPS
        const now = performance.now();
        const delta = (now - lastFpsTimeRef.current) / 1000;
        let currentFps = 60;
        if (delta >= 0.5 && total > 0) {
          const framesPassed = total - prevFrameCountRef.current;
          currentFps = Math.max(1, Math.min(120, Math.round(framesPassed / delta)));
          prevFrameCountRef.current = total;
          lastFpsTimeRef.current = now;
        }

        setHwStats({
          fps: currentFps || 60,
          droppedFrames: dropped,
          totalFrames: total,
          videoWidth: video.videoWidth || 1920,
          videoHeight: video.videoHeight || 1080,
          bufferHealth: bufferAhead,
          engine: videoSettings.hardwareAcceleration
            ? 'GPU-Accelerated (WebGL/CSS3D)'
            : 'Software Fallback',
          codec: 'H.264 / AVC1 (Hardware Accelerated)',
        });
      }
      animId = requestAnimationFrame(measureStats);
    };

    animId = requestAnimationFrame(measureStats);
    return () => cancelAnimationFrame(animId);
  }, [videoSettings.hardwareAcceleration]);

  // Mouse idle detection to auto-hide controls in video
  const handleMouseMoveStage = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  // Playback handlers
  const handlePlayPause = useCallback(() => {
    ensureAudioEngineInit();
    const video = videoRef.current;
    if (!video || !currentTrack) return;

    if (video.paused) {
      if (!video.src && !hlsRef.current) {
        loadMediaTrack(currentTrack, true);
      } else {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((err) => {
              console.warn('Playback error:', err);
              setIsPlaying(false);
              showToast('Press Play or select track to begin');
            });
        }
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [currentTrack, ensureAudioEngineInit, loadMediaTrack, showToast]);

  const handleSelectTrack = useCallback((index: number) => {
    ensureAudioEngineInit();
    const video = videoRef.current;
    if (!video || index < 0 || index >= playlist.length) return;

    if (index === currentIndex) {
      if (video.paused) {
        if (!video.src && !hlsRef.current && currentTrack) {
          loadMediaTrack(currentTrack, true);
        } else {
          video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }
      } else {
        video.pause();
        setIsPlaying(false);
      }
    } else {
      setCurrentIndex(index);
      loadMediaTrack(playlist[index], true);
      showToast(`Now Playing: ${playlist[index].title}`);
    }
  }, [currentIndex, playlist, currentTrack, ensureAudioEngineInit, loadMediaTrack, showToast]);

  const handleStop = () => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    video.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
    showToast('Playback stopped');
  };

  const handleSeek = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, time));
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSkipBack = () => {
    if (videoRef.current) {
      handleSeek(videoRef.current.currentTime - 10);
      showToast('Rewind 10s');
    }
  };

  const handleSkipForward = () => {
    if (videoRef.current) {
      handleSeek(videoRef.current.currentTime + 10);
      showToast('Forward 10s');
    }
  };

  const handlePrevTrack = () => {
    if (playlist.length === 0) return;
    let newIndex = currentIndex - 1;
    if (newIndex < 0) newIndex = playlist.length - 1;
    setCurrentIndex(newIndex);
  };

  const handleNextTrack = useCallback(() => {
    if (playlist.length === 0) return;
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * playlist.length);
      setCurrentIndex(randomIndex);
    } else {
      let newIndex = currentIndex + 1;
      if (newIndex >= playlist.length) {
        if (repeatMode === 'all') {
          newIndex = 0;
        } else {
          setIsPlaying(false);
          return;
        }
      }
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, isShuffle, playlist.length, repeatMode]);

  const handleEnded = () => {
    if (repeatMode === 'one') {
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    } else {
      handleNextTrack();
    }
  };

  const handleVolumeChange = (newVol: number) => {
    ensureAudioEngineInit();
    setAudioSettings((prev) => ({
      ...prev,
      volume: newVol,
      muted: false,
    }));
  };

  const handleToggleMute = () => {
    ensureAudioEngineInit();
    setAudioSettings((prev) => ({
      ...prev,
      muted: !prev.muted,
    }));
    showToast(audioSettings.muted ? 'Unmuted' : 'Muted');
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleTogglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch {
      showToast('Picture-in-Picture not available');
    }
  };

  // Snapshot frame capture (Classic VLC feature)
  const handleTakeSnapshot = () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 1920;
      canvas.height = video.videoHeight || 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Apply flip/rotation if needed
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `trid-snapshot-${Date.now()}.png`;
        a.click();
        showToast('Snapshot captured and saved!');
      }
    } catch {
      showToast('Snapshot restricted by CORS for this stream');
    }
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          handleToggleFullscreen();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          handleToggleMute();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            handleSeek(currentTime - 10);
            showToast('Seek -10s');
          } else {
            handleSeek(currentTime - 5);
            showToast('Seek -5s');
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            handleSeek(currentTime + 10);
            showToast('Seek +10s');
          } else {
            handleSeek(currentTime + 5);
            showToast('Seek +5s');
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          handleVolumeChange(Math.min(200, audioSettings.volume + 5));
          showToast(`Volume: ${Math.round(Math.min(200, audioSettings.volume + 5))}%`);
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleVolumeChange(Math.max(0, audioSettings.volume - 5));
          showToast(`Volume: ${Math.round(Math.max(0, audioSettings.volume - 5))}%`);
          break;
        case 'g':
        case 'G':
          e.preventDefault();
          // Subtitle sync delay -50ms
          setSubtitleSettings((prev) => {
            const nextDelay = Math.round((prev.delay - 0.05) * 100) / 100;
            showToast(`Subtitle Delay: ${Math.round(nextDelay * 1000)} ms`);
            return { ...prev, delay: nextDelay };
          });
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          // Subtitle sync delay +50ms
          setSubtitleSettings((prev) => {
            const nextDelay = Math.round((prev.delay + 0.05) * 100) / 100;
            showToast(`Subtitle Delay: ${Math.round(nextDelay * 1000)} ms`);
            return { ...prev, delay: nextDelay };
          });
          break;
        case 'j':
        case 'J':
          e.preventDefault();
          setAudioSettings((prev) => {
            const nextDelay = prev.delay - 50;
            showToast(`Audio Delay: ${nextDelay} ms`);
            return { ...prev, delay: nextDelay };
          });
          break;
        case 'k':
        case 'K':
          e.preventDefault();
          setAudioSettings((prev) => {
            const nextDelay = prev.delay + 50;
            showToast(`Audio Delay: ${nextDelay} ms`);
            return { ...prev, delay: nextDelay };
          });
          break;
        case '[':
          e.preventDefault();
          setVideoSettings((prev) => {
            const newRate = Math.max(0.25, Math.round((prev.playbackRate - 0.25) * 100) / 100);
            showToast(`Speed: ${newRate}x`);
            return { ...prev, playbackRate: newRate };
          });
          break;
        case ']':
          e.preventDefault();
          setVideoSettings((prev) => {
            const newRate = Math.min(4.0, Math.round((prev.playbackRate + 0.25) * 100) / 100);
            showToast(`Speed: ${newRate}x`);
            return { ...prev, playbackRate: newRate };
          });
          break;
        case 's':
        case 'S':
          e.preventDefault();
          handleTakeSnapshot();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          handleTogglePiP();
          break;
        case '?':
          e.preventDefault();
          setActivePanel((curr) => (curr === 'shortcuts' ? null : 'shortcuts'));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    audioSettings.volume,
    currentTime,
    handleToggleFullscreen,
    handleToggleMute,
    handleSeek,
    handlePlayPause,
    handleVolumeChange,
    handleTogglePiP,
    handleTakeSnapshot,
    showToast,
  ]);

  // Electron Native Menu integration (macOS & Windows desktop)
  useEffect(() => {
    const win = window as unknown as {
      electronAPI?: { onMenuAction: (cb: (action: string) => void) => () => void };
    };
    if (win.electronAPI?.onMenuAction) {
      const cleanup = win.electronAPI.onMenuAction((action: string) => {
        if (action === 'toggle-play') handlePlayPause();
        else if (action === 'toggle-mute') handleToggleMute();
        else if (action === 'open-file') fileInputRef.current?.click();
        else if (action === 'open-network') setActivePanel('stream');
        else if (action === 'toggle-equalizer') setActivePanel((c) => (c === 'audio' ? null : 'audio'));
        else if (action === 'toggle-video-effects') setActivePanel((c) => (c === 'video' ? null : 'video'));
        else if (action === 'toggle-playlist') setActivePanel((c) => (c === 'playlist' ? null : 'playlist'));
        else if (action === 'show-shortcuts') setActivePanel('shortcuts');
      });
      return cleanup;
    }
  }, [handlePlayPause, handleToggleMute]);

  // Drag and drop files listener (Drop videos, audios, or subtitles)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      // Check if subtitle file dropped
      const subFile = files.find(
        (f) => f.name.endsWith('.srt') || f.name.endsWith('.vtt') || f.name.endsWith('.txt')
      );
      if (subFile) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const content = ev.target?.result as string;
          if (content) {
            const cues = parseSubtitleText(content);
            setSubtitles(cues);
            setCurrentSubtitleName(subFile.name);
            setSubtitleSettings((prev) => ({ ...prev, enabled: true }));
            showToast(`Loaded Subtitles: ${subFile.name} (${cues.length} cues)`);
          }
        };
        reader.readAsText(subFile);
      }

      // Check for media files
      const mediaFiles = files.filter(
        (f) => !f.name.endsWith('.srt') && !f.name.endsWith('.vtt')
      );
      if (mediaFiles.length > 0) {
        handleAddFiles(mediaFiles);
      }
    }
  };

  // Add Local Files
  const handleAddFiles = (files: FileList | File[]) => {
    const newItems: PlaylistItem[] = Array.from(files).map((file) => {
      const objectUrl = URL.createObjectURL(file);
      const isAudio = file.type.startsWith('audio') || file.name.endsWith('.mp3') || file.name.endsWith('.flac') || file.name.endsWith('.ogg');
      const ext = file.name.split('.').pop()?.toUpperCase() || 'MEDIA';

      return {
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        src: objectUrl,
        type: isAudio ? 'audio' : 'video',
        format: `${ext} File`,
        author: 'Local File',
      };
    });

    setPlaylist((prev) => [...prev, ...newItems]);
    showToast(`Added ${newItems.length} file(s) to playlist`);
  };

  // Add URL / Stream
  const handleAddUrl = (item: PlaylistItem) => {
    setPlaylist((prev) => [...prev, item]);
    showToast(`Added to playlist: ${item.title}`);
  };

  const handlePlayStreamNow = (item: PlaylistItem) => {
    ensureAudioEngineInit();
    setPlaylist((prev) => [item, ...prev]);
    setCurrentIndex(0);
    loadMediaTrack(item, true);
    showToast(`Streaming: ${item.title}`);
  };

  // Subtitle Handlers
  const handleLoadSubtitleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        const cues = parseSubtitleText(content);
        setSubtitles(cues);
        setCurrentSubtitleName(file.name);
        setSubtitleSettings((prev) => ({ ...prev, enabled: true }));
        showToast(`Subtitles Loaded: ${file.name} (${cues.length} cues)`);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadSubtitleText = (text: string, label: string) => {
    const cues = parseSubtitleText(text);
    setSubtitles(cues);
    setCurrentSubtitleName(label);
    setSubtitleSettings((prev) => ({ ...prev, enabled: true }));
    showToast(`Applied ${cues.length} subtitle cues`);
  };

  const handleLoadSampleSubtitles = () => {
    const cues = parseSubtitleText(SAMPLE_SUBTITLES_SRT);
    setSubtitles(cues);
    setCurrentSubtitleName('English Demo (Synced)');
    setSubtitleSettings((prev) => ({ ...prev, enabled: true, delay: 0 }));
    showToast('Loaded demo synced subtitles');
  };

  // Video aspect ratio styles
  const getAspectRatioClasses = () => {
    switch (videoSettings.aspectRatio) {
      case '16:9':
        return 'aspect-video w-full h-auto max-h-full object-contain';
      case '4:3':
        return 'aspect-4/3 w-auto h-full max-w-full object-contain';
      case '21:9':
        return 'aspect-21/9 w-full h-auto max-h-full object-contain';
      case 'fill':
        return 'w-full h-full object-cover';
      case 'stretch':
        return 'w-full h-full object-fill';
      default:
        return 'w-full h-full object-contain';
    }
  };

  // Hardware-accelerated CSS transforms and filters
  const videoStyle: React.CSSProperties = {
    filter: `brightness(${videoSettings.brightness}%) contrast(${videoSettings.contrast}%) saturate(${videoSettings.saturation}%) hue-rotate(${videoSettings.hueRotate}deg)`,
    transform: `translate3d(0, 0, 0) rotate(${videoSettings.rotate}deg) scaleX(${videoSettings.flipHorizontal ? -1 : 1}) scaleY(${videoSettings.flipVertical ? -1 : 1})`,
    willChange: videoSettings.hardwareAcceleration ? 'transform, filter' : 'auto',
    backfaceVisibility: 'hidden',
  };

  // Subtitle font size mapping
  const getSubtitleSizeClass = () => {
    switch (subtitleSettings.fontSize) {
      case 'small':
        return 'text-sm sm:text-base';
      case 'medium':
        return 'text-base sm:text-xl';
      case 'huge':
        return 'text-2xl sm:text-4xl';
      default:
        return 'text-lg sm:text-2xl';
    }
  };

  return (
    <div
      id="vlc-main-app-container"
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="flex flex-col h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none"
    >
      {/* 1. TRID Top Minimalist Header */}
      <header
        id="trid-header"
        className="flex items-center justify-between px-4 py-2 bg-zinc-950/90 border-b border-zinc-800/80 z-30"
      >
        {/* Left: Brand logo & Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          {/* TRID Player Emblem */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 shadow-md shadow-orange-950/50 flex-shrink-0">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 fill-white text-zinc-950"
              strokeWidth="0"
            >
              <polygon points="12,3 21,19 3,19" fill="#ffffff" />
              <polygon points="12,7 18.5,18 5.5,18" fill="#f97316" />
              <polygon points="12,11 16,17.5 8,17.5" fill="#ea580c" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm tracking-wide text-white">
                TRID
              </span>
              {currentTrack && (
                <span className="hidden sm:inline-block px-1.5 py-0.2 bg-zinc-800 text-zinc-400 font-mono text-[10px] rounded uppercase border border-zinc-700/60">
                  {currentTrack.format}
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-400 truncate max-w-xs sm:max-w-md">
              {currentTrack?.title || 'No Media Loaded'}
            </div>
          </div>
        </div>

        {/* Center/Right: Quick Status Badges */}
        <div className="flex items-center gap-2">
          {/* HW Accel Indicator Pill */}
          <button
            onClick={() => setActivePanel('hw')}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border transition ${
              videoSettings.hardwareAcceleration
                ? 'bg-emerald-950/30 text-emerald-400 border-emerald-600/30 hover:border-emerald-500'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
            }`}
            title="Hardware Acceleration Status"
          >
            <span
              className={`w-2 h-2 rounded-full ${videoSettings.hardwareAcceleration ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'}`}
            />
            <span>{videoSettings.hardwareAcceleration ? 'GPU 4K' : 'CPU'}</span>
            <span className="text-zinc-500 text-[10px]">({hwStats.fps} FPS)</span>
          </button>

          {/* Subtitles Status Pill */}
          {subtitleSettings.enabled && (
            <button
              onClick={() => setActivePanel('subtitle')}
              className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-950/30 text-orange-400 border border-orange-500/30 text-[11px] font-mono"
              title="Subtitle Delay Offset"
            >
              <Subtitles className="w-3 h-3" />
              <span>
                {Math.round(subtitleSettings.delay * 1000) === 0
                  ? 'SYNC 0ms'
                  : `${Math.round(subtitleSettings.delay * 1000)}ms`}
              </span>
            </button>
          )}

          {/* Action: Open Local File */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*,audio/*,.mkv,.m4v,.flac,.ogg,.mp3,.mp4,.webm"
            onChange={(e) => {
              if (e.target.files) handleAddFiles(e.target.files);
              e.target.value = '';
            }}
            className="hidden"
          />
          <button
            id="vlc-header-open-file-btn"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-xs font-medium transition"
            title="Open Local Media File"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Open File</span>
          </button>

          {/* Action: Open Network Stream */}
          <button
            id="vlc-header-open-stream-btn"
            onClick={() => setActivePanel('stream')}
            className="flex items-center gap-1 px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-md text-xs font-medium transition shadow-sm"
            title="Open Network Stream (HLS, RTSP, URL)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Stream</span>
          </button>

          {/* Action: Desktop App Package (Mac & Windows) */}
          <PWAInstallButton
            isInstallable={isInstallable}
            isInstalled={isInstalled}
            platform={platform}
            onOpenModal={() => setActivePanel('install')}
          />

          <button
            id="trid-header-desktop-btn"
            onClick={() => setActivePanel('install')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition shadow-sm border ${
              isInstalled
                ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
                : 'bg-zinc-800/90 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80 hover:border-zinc-600'
            }`}
            title="Desktop Player for Mac and Windows"
          >
            {platform.isMac ? (
              <Apple className="w-3.5 h-3.5 text-zinc-300" />
            ) : platform.isWindows ? (
              <Monitor className="w-3.5 h-3.5 text-zinc-300" />
            ) : (
              <Download className="w-3.5 h-3.5 text-zinc-300" />
            )}
            <span className="hidden md:inline">
              {platform.isMac ? 'Mac App' : platform.isWindows ? 'Windows App' : 'Desktop App'}
            </span>
          </button>

          {/* Action: Shortcuts Help */}
          <button
            onClick={() => setActivePanel('shortcuts')}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-md transition"
            title="Keyboard Shortcuts"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Stage with Video Screen & Side Panels */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video / Audio Stage Container */}
        <div
          id="trid-stage-container"
          onMouseMove={handleMouseMoveStage}
          onClick={() => {
            if (activePanel) setActivePanel(null);
          }}
          className="flex-1 relative flex items-center justify-center bg-black overflow-hidden group cursor-pointer"
        >
          {/* Dedicated Media Element */}
          <video
            ref={videoRef}
            id="trid-media-element"
            playsInline
            crossOrigin={currentTrack?.src.startsWith('blob:') ? undefined : 'anonymous'}
            preload="auto"
            style={videoStyle}
            className={`${getAspectRatioClasses()} transition-all`}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
                if (videoRef.current.buffered.length > 0) {
                  setBufferedEnd(
                    videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
                  );
                }
              }
            }}
            onDurationChange={() => {
              if (videoRef.current) setDuration(videoRef.current.duration || 0);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={handleEnded}
            onError={() => {
              console.warn('Playback notice: Media element encountered error');
              setIsPlaying(false);
              showToast('Media notice: Unable to stream current media source');
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
          />

          {/* Audio mode background visualizer when playing pure audio track */}
          {currentTrack?.type === 'audio' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/90 pointer-events-none z-10 space-y-4">
              <div className="w-24 h-24 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl">
                <Music2 className="w-12 h-12 text-orange-400" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-lg text-white">{currentTrack.title}</h3>
                <p className="text-xs text-zinc-400 mt-1">{currentTrack.author || 'Audio Stream'}</p>
              </div>
            </div>
          )}

          {/* Subtitles Overlay */}
          {subtitleSettings.enabled && activeSubtitleCue && (
            <div
              id="trid-subtitle-overlay"
              className="absolute left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-20 max-w-3xl px-4 transition-all"
              style={{ bottom: `${subtitleSettings.positionY}%` }}
            >
              <div
                className={`inline-block px-3 py-1.5 rounded font-sans font-semibold tracking-wide shadow-lg ${getSubtitleSizeClass()}`}
                style={{
                  color: subtitleSettings.color,
                  backgroundColor: subtitleSettings.backgroundColor,
                  textShadow:
                    '0 1px 2px rgba(0,0,0,0.9), 0 0 4px rgba(0,0,0,0.8), -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                  lineHeight: '1.4',
                }}
              >
                {activeSubtitleCue.text}
              </div>
            </div>
          )}

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && (
            <button
              id="trid-big-play-btn"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="absolute inset-auto p-5 rounded-full bg-zinc-950/70 hover:bg-orange-600/90 border border-zinc-700/80 hover:border-orange-500 text-white shadow-2xl transition transform hover:scale-110 active:scale-95 z-20"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </button>
          )}

          {/* On-screen Flash Toast Notification */}
          {notificationToast && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-zinc-900/95 border border-zinc-700 text-amber-400 font-mono text-xs rounded-full shadow-2xl z-30 animate-fadeIn pointer-events-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span>{notificationToast}</span>
            </div>
          )}

          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 bg-orange-950/80 border-4 border-dashed border-orange-500 flex flex-col items-center justify-center text-white z-40 backdrop-blur-sm pointer-events-none animate-pulse">
              <Upload className="w-16 h-16 text-orange-400 mb-3" />
              <h3 className="text-xl font-bold">Drop files to play</h3>
              <p className="text-xs text-orange-200 mt-1">
                Supports MP4, MKV, WebM, MP3, FLAC, OGG & .SRT subtitle files
              </p>
            </div>
          )}
        </div>

        {/* Slide-over Side Panels */}
        {activePanel === 'playlist' && (
          <PlaylistPanel
            playlist={playlist}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            isShuffle={isShuffle}
            repeatMode={repeatMode}
            onSelectTrack={handleSelectTrack}
            onTogglePlayPause={handlePlayPause}
            onAddFiles={handleAddFiles}
            onAddUrl={handleAddUrl}
            onRemoveTrack={(idx) => {
              const updated = playlist.filter((_, i) => i !== idx);
              setPlaylist(updated);
              if (currentIndex >= updated.length) {
                setCurrentIndex(Math.max(0, updated.length - 1));
              }
            }}
            onClearPlaylist={() => {
              setPlaylist([]);
              handleStop();
            }}
            onMoveTrack={(from, to) => {
              const updated = [...playlist];
              const [moved] = updated.splice(from, 1);
              updated.splice(to, 0, moved);
              setPlaylist(updated);
              if (currentIndex === from) setCurrentIndex(to);
            }}
            onToggleShuffle={() => {
              setIsShuffle(!isShuffle);
              showToast(!isShuffle ? 'Shuffle enabled' : 'Shuffle disabled');
            }}
            onCycleRepeat={() => {
              const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
              const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
              setRepeatMode(next);
              showToast(`Repeat: ${next}`);
            }}
            onRestoreSamples={() => {
              setPlaylist(SAMPLE_PLAYLIST);
              setCurrentIndex(0);
              loadMediaTrack(SAMPLE_PLAYLIST[0], true);
              showToast('Restored sample 4K & HLS library');
            }}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'video' && (
          <VideoEffectsPanel
            settings={videoSettings}
            onChange={(newSettings) => setVideoSettings(newSettings)}
            onReset={() => {
              setVideoSettings({
                brightness: 100,
                contrast: 100,
                saturation: 100,
                hueRotate: 0,
                aspectRatio: 'original',
                playbackRate: 1.0,
                rotate: 0,
                flipHorizontal: false,
                flipVertical: false,
                hardwareAcceleration: true,
              });
              showToast('Reset video adjustments');
            }}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'audio' && (
          <AudioEqualizerPanel
            settings={audioSettings}
            onChange={(newSettings) => setAudioSettings(newSettings)}
            onReset={() => {
              setAudioSettings({
                volume: 100,
                muted: false,
                pan: 0,
                delay: 0,
                equalizerEnabled: true,
                activePreset: 'Flat',
                bands: [...EQ_PRESETS['Flat']],
              });
              showToast('Reset audio equalizer');
            }}
            onClose={() => setActivePanel(null)}
          />
        )}

        {activePanel === 'subtitle' && (
          <SubtitleSyncPanel
            settings={subtitleSettings}
            currentSubtitleName={currentSubtitleName}
            cueCount={subtitles.length}
            activeSubtitleText={activeSubtitleCue?.text || null}
            onChangeSettings={(newSettings) => setSubtitleSettings(newSettings)}
            onLoadSubtitleFile={handleLoadSubtitleFile}
            onLoadSubtitleText={handleLoadSubtitleText}
            onLoadSampleSubtitles={handleLoadSampleSubtitles}
            onReset={() => {
              setSubtitleSettings({
                enabled: true,
                delay: 0,
                fontSize: 'large',
                color: '#ffffff',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                positionY: 8,
              });
              showToast('Reset subtitle sync delay to 0ms');
            }}
            onClose={() => setActivePanel(null)}
          />
        )}
      </div>

      {/* 3. Bottom Player Controls Bar */}
      <div
        className={`transition-all duration-300 z-30 ${
          showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <PlayerControls
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          bufferedEnd={bufferedEnd}
          volume={audioSettings.volume}
          isMuted={audioSettings.muted}
          isFullscreen={isFullscreen}
          isPiP={isPiP}
          activePanel={activePanel}
          hasSubtitles={subtitleSettings.enabled && subtitles.length > 0}
          playlistCount={playlist.length}
          playbackRate={videoSettings.playbackRate}
          onPlayPause={handlePlayPause}
          onStop={handleStop}
          onSeek={handleSeek}
          onSkipBack={handleSkipBack}
          onSkipForward={handleSkipForward}
          onPrevTrack={handlePrevTrack}
          onNextTrack={handleNextTrack}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          onToggleFullscreen={handleToggleFullscreen}
          onTogglePiP={handleTogglePiP}
          onTakeSnapshot={handleTakeSnapshot}
          onTogglePanel={(panel) => {
            setActivePanel((curr) => (curr === panel ? null : panel));
          }}
        />
      </div>

      {/* 4. Modals */}
      {activePanel === 'stream' && (
        <NetworkStreamModal
          onPlayStream={handlePlayStreamNow}
          onAddToPlaylist={handleAddUrl}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'hw' && (
        <HardwareAccelerationModal
          stats={hwStats}
          hardwareEnabled={videoSettings.hardwareAcceleration}
          onToggleHardware={(enabled) => {
            setVideoSettings((prev) => ({
              ...prev,
              hardwareAcceleration: enabled,
            }));
            showToast(enabled ? 'Hardware acceleration enabled' : 'Hardware acceleration disabled');
          }}
          onClose={() => setActivePanel(null)}
        />
      )}

      {activePanel === 'shortcuts' && (
        <KeyboardShortcutsModal onClose={() => setActivePanel(null)} />
      )}

      {/* Desktop App Installer Modal (Mac & Windows) */}
      <InstallDesktopModal
        isOpen={activePanel === 'install'}
        onClose={() => setActivePanel(null)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        platform={platform}
        onInstall={install}
        showToast={showToast}
      />

      {/* Offline Status Connectivity Banner */}
      <OfflineIndicator />
    </div>
  );
}
