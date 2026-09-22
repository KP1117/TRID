import React, { useState, useRef } from 'react';
import {
  X,
  Plus,
  Trash2,
  Shuffle,
  Repeat,
  Repeat1,
  Download,
  Upload,
  Search,
  ArrowUp,
  ArrowDown,
  Film,
  Music2,
  Radio,
  Play,
  Pause,
  FilePlus,
  Library,
} from 'lucide-react';
import { PlaylistItem } from '../types';
import { SAMPLE_PLAYLIST } from '../data/sampleMedia';

interface PlaylistPanelProps {
  playlist: PlaylistItem[];
  currentIndex: number;
  isPlaying: boolean;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  onSelectTrack: (index: number) => void;
  onTogglePlayPause: () => void;
  onAddFiles: (files: FileList | File[]) => void;
  onAddUrl: (item: PlaylistItem) => void;
  onRemoveTrack: (index: number) => void;
  onClearPlaylist: () => void;
  onMoveTrack: (fromIndex: number, toIndex: number) => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
  onRestoreSamples: () => void;
  onClose: () => void;
}

export const PlaylistPanel: React.FC<PlaylistPanelProps> = ({
  playlist,
  currentIndex,
  isPlaying,
  isShuffle,
  repeatMode,
  onSelectTrack,
  onTogglePlayPause,
  onAddFiles,
  onAddUrl,
  onRemoveTrack,
  onClearPlaylist,
  onMoveTrack,
  onToggleShuffle,
  onCycleRepeat,
  onRestoreSamples,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const filteredPlaylist = playlist.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.author && item.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.format.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleExportM3U = () => {
    let content = '#EXTM3U\n';
    playlist.forEach((item) => {
      content += `#EXTINF:${item.duration || -1},${item.title}\n${item.src}\n`;
    });
    const blob = new Blob([content], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trid-playlist.m3u';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPlaylist = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      if (file.name.endsWith('.m3u') || file.name.endsWith('.m3u8')) {
        const lines = text.split('\n');
        let pendingTitle = '';
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith('#EXTINF:')) {
            const commaIndex = trimmed.indexOf(',');
            if (commaIndex !== -1) {
              pendingTitle = trimmed.substring(commaIndex + 1);
            }
          } else if (trimmed && !trimmed.startsWith('#')) {
            // URL line
            const title = pendingTitle || trimmed.split('/').pop() || 'Imported Stream';
            const isStream = trimmed.includes('.m3u8');
            onAddUrl({
              id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              title,
              src: trimmed,
              type: isStream ? 'stream' : 'video',
              format: isStream ? 'HLS Stream' : 'Media File',
            });
            pendingTitle = '';
          }
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'audio':
        return <Music2 className="w-4 h-4 text-emerald-400" />;
      case 'stream':
        return <Radio className="w-4 h-4 text-amber-400" />;
      default:
        return <Film className="w-4 h-4 text-orange-400" />;
    }
  };

  const formatDuration = (secs?: number) => {
    if (!secs || isNaN(secs) || secs <= 0) return '';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="vlc-playlist-panel"
      className="flex flex-col h-full bg-zinc-900 border-l border-zinc-800 text-zinc-200 select-none w-80 sm:w-96 shadow-2xl z-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-zinc-800 bg-zinc-950/70">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <h2 className="font-semibold text-sm tracking-wide text-white">Playlist Manager</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
            {playlist.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
          title="Close Playlist"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Toolbar */}
      <div className="p-3 border-b border-zinc-800 bg-zinc-900/90 flex flex-col gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-zinc-500" />
          <input
            id="vlc-playlist-search-input"
            type="text"
            placeholder="Search playlist tracks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-700/80 rounded-md text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-2 text-zinc-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between gap-1 flex-wrap text-xs">
          <div className="flex items-center gap-1">
            {/* Play / Pause Toggle Button */}
            <button
              id="trid-playlist-toolbar-play-btn"
              onClick={onTogglePlayPause}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-medium transition shadow-sm ${
                isPlaying
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-orange-400 border border-orange-500/40'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
              }`}
              title={isPlaying ? 'Pause Playback' : 'Start Playback'}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play</span>
                </>
              )}
            </button>

            {/* Add File button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*,audio/*,.mkv,.m4v,.flac,.ogg,.mp3,.mp4,.webm"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              id="trid-playlist-add-file-btn"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded font-medium transition shadow-sm border border-zinc-700/60"
              title="Add Local Audio/Video Files"
            >
              <FilePlus className="w-3.5 h-3.5 text-orange-400" />
              <span>Add Files</span>
            </button>

            {/* Load Samples */}
            <button
              id="trid-playlist-samples-btn"
              onClick={onRestoreSamples}
              className="flex items-center gap-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded transition"
              title="Load Sample Media Library (BBB 720p, Tears of Steel, HLS Stream)"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Samples</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Shuffle */}
            <button
              id="trid-playlist-shuffle-btn"
              onClick={onToggleShuffle}
              className={`p-1.5 rounded transition ${
                isShuffle ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>

            {/* Repeat Mode */}
            <button
              id="trid-playlist-repeat-btn"
              onClick={onCycleRepeat}
              className={`p-1.5 rounded transition ${
                repeatMode !== 'off'
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
              title={`Repeat Mode: ${repeatMode}`}
            >
              {repeatMode === 'one' ? (
                <Repeat1 className="w-3.5 h-3.5" />
              ) : (
                <Repeat className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Export M3U */}
            <button
              id="trid-playlist-export-btn"
              onClick={handleExportM3U}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
              title="Export Playlist as M3U"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Import M3U */}
            <input
              ref={importInputRef}
              type="file"
              accept=".m3u,.m3u8,.txt"
              onChange={handleImportPlaylist}
              className="hidden"
            />
            <button
              id="trid-playlist-import-btn"
              onClick={() => importInputRef.current?.click()}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition"
              title="Import M3U Playlist"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>

            {/* Clear all */}
            <button
              onClick={onClearPlaylist}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded transition"
              title="Clear Playlist"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Tracks List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-zinc-800/40">
        {filteredPlaylist.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-4 text-zinc-500">
            <Film className="w-8 h-8 mb-2 opacity-40 text-orange-500" />
            <p className="text-xs">No media tracks found.</p>
            <button
              onClick={onRestoreSamples}
              className="mt-3 text-xs text-orange-400 hover:underline"
            >
              Load Sample 4K & HLS Streams
            </button>
          </div>
        ) : (
          filteredPlaylist.map((item, index) => {
            const originalIndex = playlist.indexOf(item);
            const isCurrent = originalIndex === currentIndex;

            return (
              <div
                key={item.id}
                id={`trid-playlist-row-${originalIndex}`}
                className={`group flex items-center justify-between p-2 rounded-md transition text-xs ${
                  isCurrent
                    ? 'bg-orange-500/15 border border-orange-500/30 text-white font-medium'
                    : 'hover:bg-zinc-800/60 text-zinc-300'
                }`}
              >
                {/* Play / Pause button and track metadata */}
                <div
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectTrack(originalIndex)}
                >
                  {/* Interactive Play/Pause button */}
                  <button
                    id={`trid-playlist-play-btn-${originalIndex}`}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTrack(originalIndex);
                    }}
                    className={`flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition cursor-pointer shadow-sm ${
                      isCurrent
                        ? isPlaying
                          ? 'bg-orange-500 text-white shadow-orange-950/40 ring-1 ring-orange-400'
                          : 'bg-orange-500/25 text-orange-400 border border-orange-500/60 hover:bg-orange-500 hover:text-white'
                        : 'bg-zinc-800/90 text-zinc-300 hover:bg-orange-600 hover:text-white group-hover:border-zinc-600'
                    }`}
                    title={isCurrent ? (isPlaying ? 'Pause' : 'Play') : `Play "${item.title}"`}
                  >
                    {isCurrent ? (
                      isPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                      )
                    ) : (
                      <div className="relative flex items-center justify-center">
                        <span className="group-hover:hidden">{getItemIcon(item.type)}</span>
                        <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current translate-x-0.5" />
                      </div>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs leading-tight font-medium flex items-center gap-1.5">
                      <span>{item.title}</span>
                      {isCurrent && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                      <span className="uppercase tracking-wider">{item.format}</span>
                      {item.author && <span>• {item.author}</span>}
                      {item.isLive && (
                        <span className="px-1 py-0.2 bg-red-600/30 text-red-400 font-bold rounded">
                          LIVE
                        </span>
                      )}
                    </div>
                  </div>

                  {item.duration && (
                    <div className="text-[11px] font-mono text-zinc-400 flex-shrink-0">
                      {formatDuration(item.duration)}
                    </div>
                  )}
                </div>

                {/* Track Actions (Reorder / Remove) */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition ml-2">
                  <button
                    disabled={originalIndex === 0}
                    onClick={() => onMoveTrack(originalIndex, originalIndex - 1)}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    disabled={originalIndex === playlist.length - 1}
                    onClick={() => onMoveTrack(originalIndex, originalIndex + 1)}
                    className="p-1 text-zinc-400 hover:text-white disabled:opacity-20 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onRemoveTrack(originalIndex)}
                    className="p-1 text-zinc-400 hover:text-red-400 transition"
                    title="Remove from playlist"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 border-t border-zinc-800/80 bg-zinc-950/80 text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Total Tracks: {playlist.length}</span>
        <span>Drag & drop media anywhere</span>
      </div>
    </div>
  );
};
