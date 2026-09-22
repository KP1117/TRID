const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(8 + len + 4);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  const crc = crc32(typeAndData);
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height, drawPixelFn) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw image data with 0 filter byte per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

// Draw icon: TRID Player (Sleek dark squircle with vibrant orange traffic cone & play emblem)
function drawTridIcon(x, y, size, isMaskable = false) {
  // Normalize coordinates to 0..1
  const u = x / (size - 1);
  const v = y / (size - 1);
  const cx = 0.5;
  const cy = 0.5;

  const dx = u - cx;
  const dy = v - cy;

  // Maskable icons fill entire background with safe zone in center
  if (isMaskable) {
    // Background gradient from dark charcoal #18181b to #09090b
    let bgR = Math.round(24 + (1 - v) * 12);
    let bgG = Math.round(24 + (1 - v) * 12);
    let bgB = Math.round(27 + (1 - v) * 12);

    // Subtle orange radial glow at center
    const distToCenter = Math.sqrt(dx * dx + dy * dy);
    if (distToCenter < 0.45) {
      const glow = (1 - distToCenter / 0.45) * 0.35;
      bgR = Math.round(bgR * (1 - glow) + 249 * glow);
      bgG = Math.round(bgG * (1 - glow) + 115 * glow);
      bgB = Math.round(bgB * (1 - glow) + 22 * glow);
    }

    // Cone shape (in safe zone 0.25 to 0.75)
    // Cone triangle top: (0.5, 0.22), bottom left: (0.30, 0.74), bottom right: (0.70, 0.74)
    if (v >= 0.24 && v <= 0.74) {
      const progress = (v - 0.24) / 0.50; // 0 at top, 1 at bottom
      const halfWidth = 0.04 + progress * 0.18; // width expands downward
      if (Math.abs(u - 0.5) <= halfWidth) {
        // Cone color bands (VLC style orange & white/cream bands)
        if (progress > 0.32 && progress < 0.48) {
          // White reflective band
          return [245, 245, 247, 255];
        } else if (progress > 0.62 && progress < 0.78) {
          // Second white reflective band
          return [245, 245, 247, 255];
        } else {
          // Vibrant safety orange
          const coneOrange = Math.round(234 + progress * 20);
          return [coneOrange, 88, 12, 255];
        }
      }
    }

    // Base of cone (rounded pedestal)
    if (v >= 0.73 && v <= 0.78 && Math.abs(u - 0.5) <= 0.26) {
      return [217, 72, 8, 255];
    }

    // Play emblem inside cone or overlay
    // Triangle pointing right in center (0.46 to 0.56, centered)
    if (u >= 0.46 && u <= 0.56 && v >= 0.46 && v <= 0.54) {
      const playProg = (u - 0.46) / 0.10;
      const playHalfH = 0.04 * (1 - playProg);
      if (Math.abs(v - 0.50) <= playHalfH) {
        return [255, 255, 255, 255];
      }
    }

    return [bgR, bgG, bgB, 255];
  }

  // Non-maskable (standard app icon with rounded squircle shape)
  // Distance from center with squircle exponent ~ 4
  const radius = 0.44;
  const squircleDist = Math.pow(Math.abs(dx) / radius, 3.8) + Math.pow(Math.abs(dy) / radius, 3.8);

  if (squircleDist > 1.05) {
    // Transparent outside icon boundary
    return [0, 0, 0, 0];
  }

  // Anti-aliased border
  let alpha = 255;
  if (squircleDist > 0.98) {
    alpha = Math.round(255 * (1 - (squircleDist - 0.98) / 0.07));
    if (alpha < 0) alpha = 0;
  }

  // Icon surface gradient: Deep zinc / modern dark titanium (#18181b -> #09090b)
  let surfR = Math.round(28 + (1 - v) * 16);
  let surfG = Math.round(28 + (1 - v) * 16);
  let surfB = Math.round(32 + (1 - v) * 16);

  // Outer border rim highlight (sleek zinc border)
  if (squircleDist > 0.92 && squircleDist <= 0.98) {
    surfR = Math.round(surfR * 0.4 + 251 * 0.6); // subtle orange-gold tint on rim
    surfG = Math.round(surfG * 0.4 + 146 * 0.6);
    surfB = Math.round(surfB * 0.4 + 60 * 0.6);
  }

  // Radial highlight
  const centerDist = Math.sqrt(dx * dx + dy * dy);
  if (centerDist < 0.38) {
    const glow = (1 - centerDist / 0.38) * 0.4;
    surfR = Math.round(surfR * (1 - glow) + 249 * glow);
    surfG = Math.round(surfG * (1 - glow) + 115 * glow);
    surfB = Math.round(surfB * (1 - glow) + 22 * glow);
  }

  // Cone geometry
  if (v >= 0.20 && v <= 0.72) {
    const progress = (v - 0.20) / 0.52; // 0 at tip, 1 at base
    const halfWidth = 0.045 + progress * 0.22;
    if (Math.abs(u - 0.5) <= halfWidth) {
      if (progress > 0.30 && progress < 0.46) {
        // Reflective white band with 3D gradient
        const shine = Math.cos((u - 0.5) / halfWidth * (Math.PI / 2));
        const whiteVal = Math.round(220 + 35 * shine);
        return [whiteVal, whiteVal, whiteVal, alpha];
      } else if (progress > 0.60 && progress < 0.76) {
        // Second reflective white band
        const shine = Math.cos((u - 0.5) / halfWidth * (Math.PI / 2));
        const whiteVal = Math.round(220 + 35 * shine);
        return [whiteVal, whiteVal, whiteVal, alpha];
      } else {
        // Vibrant orange with cylindrical shading
        const shade = Math.cos((u - 0.5) / halfWidth * (Math.PI / 2));
        const rVal = Math.min(255, Math.round(210 + 45 * shade));
        const gVal = Math.min(255, Math.round(70 + 40 * shade));
        const bVal = Math.min(255, Math.round(10 + 20 * shade));
        return [rVal, gVal, bVal, alpha];
      }
    }
  }

  // Base platform
  if (v >= 0.71 && v <= 0.77 && Math.abs(u - 0.5) <= 0.29) {
    const baseShade = Math.cos((u - 0.5) / 0.29 * (Math.PI / 2));
    const rVal = Math.round(200 + 45 * baseShade);
    const gVal = Math.round(65 + 30 * baseShade);
    const bVal = 8;
    return [rVal, gVal, bVal, alpha];
  }

  // Centered white Play icon cut-out in center
  if (u >= 0.46 && u <= 0.56 && v >= 0.44 && v <= 0.56) {
    const playProg = (u - 0.46) / 0.10;
    const playHalfH = 0.05 * (1 - playProg);
    if (Math.abs(v - 0.50) <= playHalfH) {
      return [255, 255, 255, alpha];
    }
  }

  return [surfR, surfG, surfB, alpha];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PWA icons
console.log('Generating PWA icons...');
const pwa192 = createPng(192, 192, (x, y, s) => drawTridIcon(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

const pwa512 = createPng(512, 512, (x, y, s) => drawTridIcon(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

const pwaMaskable = createPng(512, 512, (x, y, s) => drawTridIcon(x, y, s, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);

const appleTouch = createPng(180, 180, (x, y, s) => drawTridIcon(x, y, s, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

// Also generate high-quality SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#27272a"/>
      <stop offset="100%" stop-color="#09090b"/>
    </linearGradient>
    <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#c2410c"/>
    </linearGradient>
    <linearGradient id="stripeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#e4e4e7"/>
      <stop offset="50%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#d4d4d8"/>
    </linearGradient>
    <filter id="coneGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#ea580c" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- App Icon Background Container with Squircle -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect width="508" height="508" x="2" y="2" rx="110" fill="none" stroke="#f97316" stroke-width="2.5" stroke-opacity="0.4"/>

  <!-- Radial Glow behind cone -->
  <circle cx="256" cy="270" r="140" fill="#ea580c" opacity="0.16"/>

  <!-- Group with Drop Shadow -->
  <g filter="url(#coneGlow)">
    <!-- Base Platform -->
    <rect x="100" y="370" width="312" height="32" rx="16" fill="#c2410c"/>
    <rect x="110" y="366" width="292" height="12" rx="6" fill="#f97316"/>

    <!-- Traffic Cone Main Body (Triangle) -->
    <polygon points="256,104 128,370 384,370" fill="url(#coneGrad)"/>

    <!-- Top White Stripe -->
    <polygon points="256,190 208,260 304,260" fill="url(#stripeGrad)"/>

    <!-- Bottom White Stripe -->
    <polygon points="196,280 156,340 356,340 316,280" fill="url(#stripeGrad)"/>

    <!-- Top Cap -->
    <ellipse cx="256" cy="112" rx="18" ry="10" fill="#fb923c"/>

    <!-- Play Emblem Triangle in Center -->
    <polygon points="244,235 244,285 284,260" fill="#09090b" opacity="0.85"/>
    <polygon points="246,238 246,282 281,260" fill="#ffffff"/>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

console.log('Successfully generated all PWA & platform desktop icons:');
console.log('- /public/pwa-192x192.png');
console.log('- /public/pwa-512x512.png');
console.log('- /public/pwa-maskable-512x512.png');
console.log('- /public/apple-touch-icon.png');
console.log('- /public/icon.svg');
console.log('- /public/favicon.svg');
