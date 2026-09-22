import React, { useState } from 'react';
import {
  X,
  Globe,
  Radio,
  Play,
  ListPlus,
  CheckCircle2,
  Tv,
  Film,
  Music,
} from 'lucide-react';
import { PlaylistItem } from '../types';

interface NetworkStreamModalProps {
  onPlayStream: (item: PlaylistItem) => void;
  onAddToPlaylist: (item: PlaylistItem) => void;
  onClose: () => void;
}

const PRESET_STREAMS = [
  {
    title: 'HLS Live Adaptive Bitrate Stream',
    url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    format: 'HLS (.m3u8)',
    type: 'stream' as const,
    category: 'Live Video',
    icon: Radio,
    description: 'Multi-resolution HTTP Live Streaming test stream',
  },
  {
    title: 'Tears of Steel (Akamai HLS Live Stream)',
    url: 'https://cph-p2p-msl.akamaized.net/hls/live/2000341/test/master.m3u8',
    format: 'HLS (.m3u8)',
    type: 'stream' as const,
    category: 'Live Stream',
    icon: Radio,
    description: 'Akamai multi-bitrate live HLS broadcast stream',
  },
  {
    title: 'Big Buck Bunny (720p WebM)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/c0/Big_Buck_Bunny_4K.webm/Big_Buck_Bunny_4K.webm.720p.vp9.webm',
    format: 'WebM / 720p',
    type: 'video' as const,
    category: 'HD Video',
    icon: Film,
    description: 'Blender Foundation open-movie test file',
  },
  {
    title: 'Tears of Steel (480p WebM)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cb/Tears_of_Steel_1080p.webm/Tears_of_Steel_1080p.webm.480p.vp9.webm',
    format: 'WebM / 480p',
    type: 'video' as const,
    category: 'HD Video',
    icon: Film,
    description: 'VFX open-source movie clip with dialogue and sound',
  },
  {
    title: 'Blooming Flowers (MDN CC0 MP4)',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    format: 'MP4 / H.264',
    type: 'video' as const,
    category: 'MP4 Video',
    icon: Film,
    description: 'MDN standard CC0 MP4 video clip',
  },
  {
    title: 'Chill Lo-Fi Internet Radio',
    url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/race1.ogg',
    format: 'OGG Stream',
    type: 'audio' as const,
    category: 'Audio Stream',
    icon: Music,
    description: 'Continuous relaxing ambient music stream',
  },
];

export const NetworkStreamModal: React.FC<NetworkStreamModalProps> = ({
  onPlayStream,
  onAddToPlaylist,
  onClose,
}) => {
  const [streamUrl, setStreamUrl] = useState('');
  const [streamTitle, setStreamTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const detectFormat = (url: string) => {
    const cleanUrl = url.trim().toLowerCase();
    if (cleanUrl.includes('.m3u8')) return { format: 'HLS (.m3u8)', type: 'stream' as const };
    if (cleanUrl.endsWith('.mp3')) return { format: 'MP3 Audio', type: 'audio' as const };
    if (cleanUrl.endsWith('.ogg') || cleanUrl.endsWith('.oga')) return { format: 'OGG Audio', type: 'audio' as const };
    if (cleanUrl.endsWith('.wav')) return { format: 'WAV Audio', type: 'audio' as const };
    if (cleanUrl.endsWith('.flac')) return { format: 'FLAC Audio', type: 'audio' as const };
    if (cleanUrl.endsWith('.webm')) return { format: 'WebM Video', type: 'video' as const };
    return { format: 'Network Stream', type: 'video' as const };
  };

  const handleSelectPreset = (preset: typeof PRESET_STREAMS[0]) => {
    setStreamUrl(preset.url);
    setStreamTitle(preset.title);
    setErrorMessage('');
  };

  const buildPlaylistItem = (): PlaylistItem | null => {
    if (!streamUrl.trim()) {
      setErrorMessage('Please enter a valid network stream URL');
      return null;
    }

    try {
      new URL(streamUrl);
    } catch {
      setErrorMessage('Please enter a valid URL (e.g. https://domain.com/stream.m3u8)');
      return null;
    }

    const { format, type } = detectFormat(streamUrl);
    const title = streamTitle.trim() || streamUrl.split('/').pop()?.split('?')[0] || 'Network Stream';

    return {
      id: `stream-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title,
      src: streamUrl.trim(),
      type,
      format,
      isLive: format.includes('HLS'),
      author: 'Network Source',
    };
  };

  const handlePlayNow = () => {
    const item = buildPlaylistItem();
    if (item) {
      onPlayStream(item);
      onClose();
    }
  };

  const handleAdd = () => {
    const item = buildPlaylistItem();
    if (item) {
      onAddToPlaylist(item);
      onClose();
    }
  };

  return (
    <div
      id="vlc-network-stream-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-lg border border-orange-500/30">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Open Network Stream</h2>
              <p className="text-xs text-zinc-400">
                Stream HTTP, HTTPS, HLS (.m3u8), and online media files
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
        <div className="p-5 space-y-5 overflow-y-auto text-xs">
          {/* URL Input */}
          <div className="space-y-2">
            <label className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>Network URL (URL Protocol: HTTP/HTTPS)</span>
              {streamUrl && (
                <span className="text-orange-400 text-[11px] font-mono">
                  {detectFormat(streamUrl).format}
                </span>
              )}
            </label>
            <input
              id="vlc-stream-url-input"
              type="url"
              placeholder="https://example.com/live/stream.m3u8 or .mp4"
              value={streamUrl}
              onChange={(e) => {
                setStreamUrl(e.target.value);
                setErrorMessage('');
              }}
              className="w-full p-2.5 bg-zinc-950 border border-zinc-700 rounded-lg font-mono text-xs text-zinc-200 focus:outline-none focus:border-orange-500 transition"
            />
            {errorMessage && (
              <p className="text-red-400 text-xs font-medium">{errorMessage}</p>
            )}
          </div>

          {/* Optional Custom Title */}
          <div className="space-y-1.5">
            <label className="text-zinc-400">Stream Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. My Live Camera / Radio Feed"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full p-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-orange-500 transition"
            />
          </div>

          {/* Quick Presets */}
          <div className="space-y-2.5">
            <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
              Or Select Verified Network Streams
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_STREAMS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = streamUrl === preset.url;
                return (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500 text-white'
                        : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? 'text-orange-400' : 'text-zinc-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-xs truncate flex items-center justify-between">
                        <span>{preset.title}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 ml-1" />}
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                        {preset.format} • {preset.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-zinc-800 bg-zinc-950/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-medium transition"
          >
            <ListPlus className="w-4 h-4" />
            <span>Add to Playlist</span>
          </button>
          <button
            id="vlc-stream-play-now-btn"
            onClick={handlePlayNow}
            className="flex items-center gap-1.5 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-orange-900/30 transition"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Play Stream</span>
          </button>
        </div>
      </div>
    </div>
  );
};
