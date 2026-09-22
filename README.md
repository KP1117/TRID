# TRID Media Player

A minimalist, high-performance multimedia player with audio/video equalizer, network streaming (HLS, DASH, MP4, WebM), subtitle synchronization, hardware acceleration, and native desktop app packaging for **macOS** and **Windows**.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🖥️ Standalone Desktop Packaging (Mac & Windows)

TRID comes pre-configured with **Electron v34** and **electron-builder** to compile native desktop binaries:

### Build for macOS (.dmg / .app)
Generates universal Apple Silicon (M1/M2/M3/M4) & Intel binary:
```bash
npm run package:mac
```
Output files will be located in: `release/TRID Media Player-1.0.0.dmg` and `release/mac/`

### Build for Windows (.exe / portable)
Generates standard NSIS installer and portable `.exe`:
```bash
npm run package:win
```
Output files will be located in: `release/TRID Media Player Setup 1.0.0.exe` and `release/`

### Build for both platforms
```bash
npm run package:all
```

---

## ⚡ Direct Browser Installation (No Compiling Required)

You can also run TRID as an installable desktop PWA:
- **macOS (Safari):** Open the player, click **File > Add to Dock...**.
- **Windows / macOS (Chrome or Edge):** Click the **Install** button in the URL address bar.
