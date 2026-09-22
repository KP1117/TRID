import React, { useState } from 'react';
import {
  X,
  Download,
  Apple,
  Monitor,
  CheckCircle2,
  HardDrive,
  Cpu,
  WifiOff,
  Keyboard,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { PlatformInfo } from '../hooks/usePWAInstall';

interface InstallDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  platform: PlatformInfo;
  onInstall: () => Promise<'accepted' | 'dismissed' | 'manual'>;
  showToast: (msg: string) => void;
}

export const InstallDesktopModal: React.FC<InstallDesktopModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  platform,
  onInstall,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'mac' | 'win' | 'electron'>('mac');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(label);
    showToast(`Copied ${label} command!`);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleInstallClick = async () => {
    const outcome = await onInstall();
    if (outcome === 'accepted') {
      showToast('TRID Player installed successfully!');
      onClose();
    } else if (outcome === 'manual') {
      showToast('Follow the steps below to complete desktop installation');
    }
  };

  return (
    <div
      id="trid-install-desktop-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="trid-install-desktop-modal"
        className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-zinc-800/90 to-zinc-900 border-b border-zinc-800">
          <button
            id="trid-install-modal-close"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 p-0.5 shadow-lg shadow-orange-950/50 flex items-center justify-center">
              <img
                src="/icon.svg"
                alt="TRID App Icon"
                className="w-11 h-11 rounded-[10px] object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Install TRID Media Player
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full">
                  v1.0 Desktop
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Run as a standalone native app on macOS and Windows with hardware acceleration
              </p>
            </div>
          </div>

          {/* Platform Tabs */}
          <div className="flex items-center gap-2 mt-5">
            <button
              id="trid-tab-mac"
              onClick={() => setActiveTab('mac')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'mac'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950/30'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Apple className="w-4 h-4" />
              macOS
              {platform.isMac && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              id="trid-tab-win"
              onClick={() => setActiveTab('win')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'win'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950/30'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <Monitor className="w-4 h-4" />
              Windows 10 / 11
              {platform.isWindows && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              )}
            </button>

            <button
              id="trid-tab-electron"
              onClick={() => setActiveTab('electron')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                activeTab === 'electron'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950/30'
                  : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              Native DMG / EXE Package
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* Status Banner */}
          {isInstalled ? (
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
              <div className="text-xs">
                <span className="font-semibold text-emerald-200">Installed and Active</span>
                <p className="text-emerald-400/80 mt-0.5">
                  TRID Player is running in standalone desktop window mode.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  Instant Desktop App Installation
                </h4>
                <p className="text-xs text-zinc-400 mt-1 max-w-md">
                  Adds TRID to your Dock or Start Menu with a dedicated frameless player window, offline caching, and media hotkeys.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
                <a
                  id="trid-top-zip-download"
                  href="/trid-media-player.zip"
                  download="trid-media-player.zip"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs rounded-xl border border-zinc-700 transition"
                  title="Download complete source & desktop packaging archive (ZIP)"
                >
                  <Download className="w-4 h-4 text-orange-400" />
                  Download ZIP
                </a>

                <a
                  id="trid-open-standalone-link"
                  href={window.location.origin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-medium text-xs rounded-xl border border-zinc-700 transition"
                  title="Open player in full standalone browser tab for native installation"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                  Open in New Tab
                </a>

                <button
                  id="trid-install-modal-primary-btn"
                  onClick={handleInstallClick}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold text-xs rounded-xl shadow-lg shadow-orange-950/50 transition cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isInstallable ? 'Install to Desktop' : 'Install Instructions'}
                </button>
              </div>
            </div>
          )}

          {/* TAB 1: macOS Details */}
          {activeTab === 'mac' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  macOS Installation Guide
                </span>
                <span className="text-[11px] text-zinc-400">Compatible with macOS Sonoma, Ventura, Monterey</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Chrome / Edge / Brave on Mac
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Click the <strong>Install</strong> icon in the address bar (or click the button above). TRID will be added to <code className="text-zinc-200 bg-zinc-800 px-1 py-0.5 rounded">~/Applications</code> and appear in Launchpad &amp; the Dock.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Safari (macOS Sonoma 14+)
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    In Safari menu bar, click <strong>File &gt; Add to Dock...</strong>. Set the name to <strong>TRID</strong> and click <strong>Add</strong> to turn it into an isolated native Mac application!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-800/30 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                <span className="font-semibold text-zinc-200">Mac Desktop Advantages:</span>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Runs in an independent App Switcher (<kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">Cmd + Tab</kbd>) slot</li>
                  <li>Supports macOS picture-in-picture and standard window traffic lights</li>
                  <li>Retains audio and equalizer settings persistently across sessions</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: Windows Details */}
          {activeTab === 'win' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Windows 10 &amp; 11 Installation Guide
                </span>
                <span className="text-[11px] text-zinc-400">Windows 11 / 10 (64-bit &amp; ARM64)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    Microsoft Edge (Native Windows)
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Click the <strong>App Available</strong> icon in the Edge address bar or open <kbd className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">...</kbd> &gt; <strong>Apps &gt; Install this site as an app</strong>. Choose &ldquo;Pin to Taskbar&rdquo; and &ldquo;Pin to Start&rdquo;.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-800/40 border border-zinc-700/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    Google Chrome on Windows
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Click the <strong>Install TRID</strong> button in Chrome URL bar (computer monitor with downward arrow). A desktop shortcut and Start Menu entry are automatically generated.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-800/30 border border-zinc-800 text-xs text-zinc-400 space-y-1.5">
                <span className="font-semibold text-zinc-200">Windows Desktop Features:</span>
                <ul className="list-disc list-inside space-y-1 pl-1">
                  <li>Pinned directly to the Windows Taskbar with high-res icon</li>
                  <li>Full DirectX / GPU hardware acceleration for smooth 4K 60fps playback</li>
                  <li>Windows media transport overlay integration</li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 3: Electron DMG / EXE */}
          {activeTab === 'electron' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">
                  Compile Native DMG &amp; EXE Binaries
                </span>
                <span className="text-[11px] text-zinc-400">Includes Electron v34+ Packaging Scripts</span>
              </div>

              <div className="p-4 rounded-xl bg-orange-950/30 border border-orange-500/40 text-xs text-zinc-300 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-orange-400 flex items-center gap-2 text-sm">
                    <Download className="w-4 h-4 text-orange-400" />
                    Direct Source &amp; Packaging ZIP Download
                  </div>
                  <a
                    id="trid-direct-zip-download"
                    href="/trid-media-player.zip"
                    download="trid-media-player.zip"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs rounded-lg shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download trid-media-player.zip
                  </a>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Click the button above to directly download the entire complete project ZIP (including Electron scripts, React components, audio/video equalizers, and icons). You can also find the export option in Google AI Studio by clicking the <strong>Share</strong> button or the <strong>Three-Dots menu (⋯)</strong> in the top-right toolbar.
                </p>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Once downloaded, extract the ZIP on your computer, open your terminal inside the folder, and run:
              </p>

              {/* Mac Command */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Apple className="w-3.5 h-3.5 text-zinc-400" />
                    Build macOS Installer (.dmg / .app)
                  </span>
                  <button
                    onClick={() => handleCopy('npm run package:mac', 'Mac')}
                    className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition"
                  >
                    {copiedCmd === 'Mac' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'Mac' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-zinc-300 bg-zinc-900 p-2.5 rounded-lg overflow-x-auto border border-zinc-800/80">
                  npm run package:mac
                </pre>
                <p className="text-[11px] text-zinc-500">
                  Outputs to <code className="text-zinc-400">release/TRID Media Player-1.0.0.dmg</code> (universal Apple Silicon &amp; Intel).
                </p>
              </div>

              {/* Windows Command */}
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                  <span className="flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-zinc-400" />
                    Build Windows Installer (.exe / portable)
                  </span>
                  <button
                    onClick={() => handleCopy('npm run package:win', 'Windows')}
                    className="flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 transition"
                  >
                    {copiedCmd === 'Windows' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedCmd === 'Windows' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="text-xs font-mono text-zinc-300 bg-zinc-900 p-2.5 rounded-lg overflow-x-auto border border-zinc-800/80">
                  npm run package:win
                </pre>
                <p className="text-[11px] text-zinc-500">
                  Outputs to <code className="text-zinc-400">release/TRID Media Player Setup 1.0.0.exe</code> (NSIS Installer) and portable executable.
                </p>
              </div>
            </div>
          )}

          {/* Desktop Features Bento Grid */}
          <div className="pt-2">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-orange-400" />
              Desktop Player Capabilities
            </h5>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 flex flex-col items-center">
                <Cpu className="w-5 h-5 text-orange-400 mb-1.5" />
                <span className="text-xs font-semibold text-white">GPU Accelerated</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Low CPU overhead</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 flex flex-col items-center">
                <WifiOff className="w-5 h-5 text-emerald-400 mb-1.5" />
                <span className="text-xs font-semibold text-white">Offline Ready</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Works without network</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 flex flex-col items-center">
                <HardDrive className="w-5 h-5 text-blue-400 mb-1.5" />
                <span className="text-xs font-semibold text-white">Local Drag &amp; Drop</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Play any local file</span>
              </div>

              <div className="p-3 rounded-xl bg-zinc-800/40 border border-zinc-800 flex flex-col items-center">
                <Keyboard className="w-5 h-5 text-amber-400 mb-1.5" />
                <span className="text-xs font-semibold text-white">Media Hotkeys</span>
                <span className="text-[10px] text-zinc-400 mt-0.5">Space, F, M, Arrows</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800/90 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified for macOS &amp; Windows
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-500 rounded-lg shadow-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              Install Player
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
