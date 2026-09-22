import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PlatformInfo {
  isMac: boolean;
  isWindows: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isChromium: boolean;
  isSafari: boolean;
  isEdge: boolean;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<PlatformInfo>({
    isMac: false,
    isWindows: false,
    isIOS: false,
    isAndroid: false,
    isChromium: false,
    isSafari: false,
    isEdge: false,
  });

  useEffect(() => {
    // Detect standalone mode (already installed & running in app window)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsInstalled(isStandalone);

    // Detect OS & Browser
    const ua = window.navigator.userAgent.toLowerCase();
    const plat = (window.navigator.platform || '').toLowerCase();

    const isMac = plat.includes('mac') || ua.includes('macintosh') || ua.includes('mac os');
    const isWindows = plat.includes('win') || ua.includes('windows');
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isEdge = ua.includes('edg/');
    const isChromium = (ua.includes('chrome') || ua.includes('chromium') || isEdge) && !ua.includes('opr/');
    const isSafari = ua.includes('safari') && !ua.includes('chrome') && !ua.includes('chromium');

    setPlatform({
      isMac,
      isWindows,
      isIOS,
      isAndroid,
      isChromium,
      isSafari,
      isEdge,
    });

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async (): Promise<'accepted' | 'dismissed' | 'manual'> => {
    if (!deferredPrompt) {
      return 'manual';
    }
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('Install prompt error:', err);
      return 'manual';
    }
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    platform,
    install,
  };
}
