import fs from "node:fs";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";

const urls = [
  'https://api.builder.io/api/v1/image/assets/TEMP/09650d06d645361171a1767c2bee7bf73dc887d7?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/bd032d068ae6f42109b21b28056baaa211c2e335?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/f0ebe7ae9c693756a64926e34f3069beaa7f493c?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/8f895ef64a8bf2312af8fcc9119667959032f87a?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/34e30526e97a593055cb038ac758060b4a321169?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/825ba62cd2edb9d2ae5b54fddbd29267a5a7dc7d?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/bae1065a77c890cc7fe51c9238ff1415c0e193ae?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/f90672cbac0a276ff97b4f5a58ef142a48dce998?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/f28fd415b23a82891aa6c9e8841e2218c62e27e7?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/4482f04f89cf11c694558751693855e5b9cea3ad?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/71f5d3f38ad529c43582c5cf701c152d2866db8a?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/c10c3f9efea3ea9510684f581fc7dbd284105777?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/ecd9925c9a33c28c667bf8c487d5c1feca860d7b?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/5fecb88c0f090d01b6fd1afb18cc6b81322f28e0?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/9d50455e006c4eba01f351b0dabc60eea95f8042?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/7bba23d7edecfe99a8530fed8427d5450d5a568b?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/a1da39acb6cee399b145295a411c7e6aa0b2d0f6?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/51c40f29ab9a104536ce9f34e1dedbb47d069f55?width=564',
  'https://api.builder.io/api/v1/image/assets/TEMP/b2b27d531db22bcffa9d1e46111a2286d88827b1?width=566',
  'https://api.builder.io/api/v1/image/assets/TEMP/aaeaaf2d3dd812aa8ed0b2fe06e399db4bd6d7d4?width=566'
];

const outDir = "downloads";
fs.mkdirSync(outDir, { recursive: true });

function nameFromUrl(u) {
  const m = u.match(/\/TEMP\/([^?]+)/);
  return (m?.[1] ?? "image") + ".jpg";
}

async function fetchWithRetry(u, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(u, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      return buf;
    } catch (e) {
      if (i === tries) throw e;
      await delay(500 * i); // backoff
    }
  }
}

const CONCURRENCY = 6;
let i = 0;

async function worker() {
  while (i < urls.length) {
    const idx = i++;
    const u = urls[idx];
    const file = path.join(outDir, nameFromUrl(u));
    try {
      const data = await fetchWithRetry(u);
      fs.writeFileSync(file, data);
      console.log(`Saved ${path.basename(file)} (${data.length} bytes)`);
    } catch (err) {
      console.error(`Failed ${u}:`, err.message);
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
console.log("Done.");
