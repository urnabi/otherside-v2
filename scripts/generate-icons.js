import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, isMaskable = false) {
  // CRC table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function writeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcBuf = Buffer.alloc(4 + len);
    crcBuf.write(type, 0, 4, 'ascii');
    data.copy(crcBuf, 4);
    buf.writeUInt32BE(crc32(crcBuf), 8 + len);
    return buf;
  }

  // Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = writeChunk('IHDR', ihdrData);

  // Raw image data: filter byte + width * 4 bytes per row
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  // Scaled radii
  const rCircle = width * (isMaskable ? 0.22 : 0.25);
  const leftX = cx - width * 0.08;
  const rightX = cx + width * 0.08;
  const centerR = width * 0.1;
  const pupilR = width * 0.035;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // filter type 0

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Background: #FAF8F5 (250, 248, 245)
      let r = 250, g = 248, b = 245, a = 255;

      // Distances
      const dLeft = Math.hypot(x - leftX, y - cy);
      const dRight = Math.hypot(x - rightX, y - cy);
      const dCenter = Math.hypot(x - cx, y - cy);

      const inLeft = dLeft <= rCircle;
      const inRight = dRight <= rCircle;
      const inCenter = dCenter <= centerR;
      const inPupil = dCenter <= pupilR;

      if (inPupil) {
        // Center dark pupil: #3B3654
        r = 59; g = 54; b = 84;
      } else if (inCenter) {
        // Center aperture ring
        r = 250; g = 248; b = 245;
      } else if (inLeft && inRight) {
        // Intersection of perspectives
        r = 100; g = 110; b = 135;
      } else if (inLeft) {
        // Lavender: #7C72A8 (124, 114, 168)
        r = 124; g = 114; b = 168;
      } else if (inRight) {
        // Sage: #63856D (99, 133, 109)
        r = 99; g = 133; b = 109;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = writeChunk('IDAT', compressed);
  const iend = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

console.log('Successfully generated all PWA icons!');
