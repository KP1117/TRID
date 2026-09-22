import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="trid-offline-indicator"
      className="fixed bottom-16 left-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/95 border border-amber-500/50 text-amber-300 text-xs font-medium shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — Local files and cached media active</span>
    </div>
  );
};
