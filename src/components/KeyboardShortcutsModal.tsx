import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Space', desc: 'Play / Pause playback' },
  { key: 'F', desc: 'Toggle Fullscreen' },
  { key: 'M', desc: 'Mute / Unmute audio' },
  { key: '← / →', desc: 'Seek backward / forward 5 seconds' },
  { key: 'Shift + ← / →', desc: 'Seek backward / forward 10 seconds' },
  { key: '↑ / ↓', desc: 'Volume up / down by 5% (up to 200%)' },
  { key: 'G / H', desc: 'Subtitle sync offset: -50ms / +50ms' },
  { key: 'J / K', desc: 'Audio sync offset: -50ms / +50ms' },
  { key: '[ / ]', desc: 'Decrease / increase playback speed' },
  { key: 'S', desc: 'Take frame snapshot (PNG screenshot)' },
  { key: 'P', desc: 'Toggle Picture-in-Picture mode' },
  { key: '?', desc: 'Toggle this keyboard shortcut guide' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  return (
    <div
      id="vlc-shortcuts-modal"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-600/20 text-orange-400 rounded-lg border border-orange-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">TRID Keyboard Shortcuts</h2>
              <p className="text-xs text-zinc-400">Quick hotkey controls for seamless playback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 space-y-2 overflow-y-auto text-xs divide-y divide-zinc-800/60">
          {SHORTCUTS.map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2 text-zinc-300">
              <span className="text-zinc-400">{item.desc}</span>
              <kbd className="px-2 py-1 bg-zinc-950 border border-zinc-700 rounded font-mono text-amber-400 text-xs shadow-sm">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-zinc-800 bg-zinc-950/90">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
