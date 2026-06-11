// Vygeneruje PNG ikony pro PWA (bez knihoven – čisté Node).
// Design: zeleno-azurový gradient + tři bílé proužky (ekvalizér).
const fs = require('fs'), zlib = require('zlib');

// CRC32 (potřeba pro PNG chunky)
const crcTable = (() => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, buf) {
  const len = Buffer.alloc(4); len.writeUInt32BE(buf.length, 0);
  const t = Buffer.from(type);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, buf])), 0);
  return Buffer.concat([len, t, buf, crc]);
}

function makeIcon(size) {
  const W = size, H = size;
  const barW = Math.round(size * 0.10);
  const gap  = Math.round(size * 0.07);
  const cx = size / 2;
  const xs = [cx - (barW + gap), cx, cx + (barW + gap)]; // středy tří proužků
  const heights = [0.34, 0.55, 0.42];                    // různě vysoké

  const data = Buffer.alloc((W * 3 + 1) * H);
  let p = 0;
  for (let y = 0; y < H; y++) {
    data[p++] = 0; // filtr "none"
    for (let x = 0; x < W; x++) {
      const t = (x + y) / (W + H);
      let r = Math.round(0x1e + (0x22 - 0x1e) * t);
      let g = Math.round(0xd7 + (0xd3 - 0xd7) * t);
      let b = Math.round(0x60 + (0xee - 0x60) * t);
      for (let i = 0; i < 3; i++) {
        const bh = size * heights[i], top = (size - bh) / 2, bot = (size + bh) / 2;
        if (Math.abs(x - xs[i]) <= barW / 2 && y >= top && y <= bot) { r = 255; g = 255; b = 255; }
      }
      data[p++] = r; data[p++] = g; data[p++] = b;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(data)), chunk('IEND', Buffer.alloc(0))]);
}

fs.writeFileSync('C:/Users/marti/spotify-stats/icon-512.png', makeIcon(512));
fs.writeFileSync('C:/Users/marti/spotify-stats/icon-192.png', makeIcon(192));
console.log('Ikony vytvořeny.');
