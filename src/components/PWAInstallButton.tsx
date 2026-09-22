import React from 'react';
import { Download, Monitor, Apple } from 'lucide-react';
import { PlatformInfo } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  isInstallable: boolean;
  isInstalled: boolean;
  platform: PlatformInfo;
  onOpenModal: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  isInstallable,
  isInstalled,
  platform,
  onOpenModal,
}) => {
  if (isInstalled) {
    return null;
  }

  return (
    <button
      id="trid-pwa-install-btn"
      onClick={onOpenModal}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition cursor-pointer bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 border border-orange-500/35 hover:border-orange-500/50 shadow-sm"
      title="Install TRID as a standalone desktop player on Mac or Windows"
    >
      {platform.isMac ? (
        <Apple className="w-3.5 h-3.5" />
      ) : platform.isWindows ? (
        <Monitor className="w-3.5 h-3.5" />
      ) : (
        <Download className="w-3.5 h-3.5" />
      )}
      <span className="hidden sm:inline">
        {platform.isMac ? 'Install Mac App' : platform.isWindows ? 'Install Windows App' : 'Install Player'}
      </span>
      <span className="sm:hidden">Install</span>
    </button>
  );
};
