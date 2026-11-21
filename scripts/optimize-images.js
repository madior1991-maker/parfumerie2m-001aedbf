import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src', 'assets');
const outDir = path.join(projectRoot, 'public', 'images', 'optimized');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const files = [
  'haqqi-collection.png',
  'about-perfume-grid.png',
  'scentlab-creamy-almond-upload.png',
  'scentlab-fruity-vanilla.png',
  'pocket-perfumes-homme.png',
  'pocket-perfumes-femme.png',
  'scentlab-boxes.png',
];

const widths = [400, 800, 1200];

async function processFile(filename) {
  const src = path.join(srcDir, filename);
  if (!fs.existsSync(src)) {
    console.warn('Missing', src);
    return;
  }
  const base = path.parse(filename).name;
  for (const w of widths) {
    const webpOut = path.join(outDir, `${base}-w${w}.webp`);
    const avifOut = path.join(outDir, `${base}-w${w}.avif`);
    await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(webpOut);
    await sharp(src).resize({ width: w }).avif({ quality: 60 }).toFile(avifOut);
    console.log('Wrote', webpOut, avifOut);
  }
}

(async () => {
  for (const f of files) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await processFile(f);
    } catch (e) {
      console.error('Failed', f, e);
    }
  }
  console.log('Image optimization complete');
})();
