import fs from 'fs';
import path from 'path';

// Read catalog-data.ts and extract product name/ref pairs without importing TS
const catalogSource = fs.readFileSync(path.join(process.cwd(), 'src', 'lib', 'catalog-data.ts'), 'utf8');

// Match object literals that contain name: and ref: fields
const objRe = /\{[^}]*?name:\s*["']([^"']+)["'][^}]*?ref:\s*["']([^"']*)["'][^}]*?\}/gs;
const products = [];
let m;
while ((m = objRe.exec(catalogSource)) !== null) {
  const name = m[1];
  const ref = m[2] ?? '';
  products.push({ name, ref });
}

function slugify(name, ref) {
  const raw = `${name}-${ref || ''}`.toLowerCase();
  return raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const baseUrl = 'https://www.2mparfumeriedk.com';
const routes = [
  '/',
  '/boutique',
  '/contact',
  '/faq',
  '/blog',
  '/coffret-signature',
  '/a-propos',
  '/mentions-legales',
  '/livraison',
  '/conseils',
  '/collections/takeoff',
  '/collections/haqqi',
  '/collections/scentlab',
  '/collections/parfums-de-poches',
  '/collections/collections-privees',
  '/collections/coffrets',
  '/collections/fragrance-library',
];

const productUrls = products.map((p) => `${baseUrl}/boutique/${slugify(p.name, p.ref)}`);

const urls = [...routes.map((r) => `${baseUrl}${r}`), ...productUrls].map((loc) => ({ loc }));

const now = new Date().toISOString();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((u) => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`)
  .join('\n')}
</urlset>`;

const out = path.join(process.cwd(), 'public', 'sitemap.xml');
fs.writeFileSync(out, xml, 'utf8');
console.log('Wrote sitemap to', out);

process.exit(0);
