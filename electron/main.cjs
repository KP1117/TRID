// Electron Main Process for TRID Media Player (macOS & Windows)
const { app, BrowserWindow, Menu, shell, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let mainWindow = null;

const isMac = process.platform === 'darwin';

// Hardware acceleration configuration
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 550,
    title: 'TRID Media Player',
    backgroundColor: '#09090b',
    // Mac: elegant rounded translucent title bar style
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: isMac ? { x: 16, y: 16 } : undefined,
    icon: path.join(__dirname, '..', 'public', isMac ? 'icon.svg' : 'pwa-512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      backgroundThrottling: false, // Keep playing audio/video when minimized
    },
  });

  const devUrl = 'http://localhost:3000';
  const prodPath = path.join(__dirname, '..', 'dist', 'index.html');

  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    mainWindow.loadURL(devUrl).catch(() => {
      mainWindow.loadFile(prodPath);
    });
  } else {
    mainWindow.loadFile(prodPath);
  }

  // Open external links in default OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  createMenu();
}

function createMenu() {
  const template = [
    ...(isMac
      ? [
          {
            label: 'TRID Player',
            submenu: [
              { role: 'about', label: 'About TRID Player' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    {
      label: 'Media',
      submenu: [
        {
          label: 'Open File...',
          accelerator: isMac ? 'Cmd+O' : 'Ctrl+O',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'open-file'),
        },
        {
          label: 'Open Network Stream...',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'open-network'),
        },
        { type: 'separator' },
        {
          label: 'Toggle Play / Pause',
          accelerator: 'Space',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'toggle-play'),
        },
        {
          label: 'Mute Audio',
          accelerator: 'M',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'toggle-mute'),
        },
        { type: 'separator' },
        { role: isMac ? 'close' : 'quit' },
      ],
    },
    {
      label: 'Playback',
      submenu: [
        {
          label: 'Toggle Fullscreen',
          accelerator: 'F',
          click: () => mainWindow?.setFullScreen(!mainWindow.isFullScreen()),
        },
        {
          label: 'Audio Equalizer',
          accelerator: isMac ? 'Cmd+E' : 'Ctrl+E',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'toggle-equalizer'),
        },
        {
          label: 'Video Adjustments',
          accelerator: isMac ? 'Cmd+V' : 'Ctrl+V',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'toggle-video-effects'),
        },
        {
          label: 'Playlist',
          accelerator: isMac ? 'Cmd+L' : 'Ctrl+L',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'toggle-playlist'),
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
          : [{ role: 'close' }]),
      ],
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More & Shortcuts',
          click: () => mainWindow?.webContents.send('trid-menu-action', 'show-shortcuts'),
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();

  // Register Global Media Play/Pause key if available
  try {
    globalShortcut.register('MediaPlayPause', () => {
      mainWindow?.webContents.send('trid-menu-action', 'toggle-play');
    });
  } catch (err) {
    // Ignore if media keys are not available
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});
