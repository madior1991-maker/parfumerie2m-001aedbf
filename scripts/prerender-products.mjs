// Après le build : une page par produit de la base (titre, description, photo de partage)
// et un plan du site à jour. Si la base ne répond pas, on ne change rien.
import fs from "node:fs";
import path from "node:path";

const SITE = "https://www.2mparfumeriedk.com";
const dist = path.join(process.cwd(), "dist");
const DELETED = "__2M_ADMIN_DELETED_PRODUCT__";

function readEnv() {
  const env = { ...process.env };
  try {
    for (const line of fs.readFileSync(path.join(process.cwd(), ".env"), "utf8").split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2];
    }
  } catch {}
  return env;
}

const LABELS = { scentlab: "SCENTLAB", takeoff: "Takeoff Fragrance", dubai: "Dubai Perfumes", pocket: "Parfums de poche", authentic: "Parfums authentiques", haqqi: "Haqqi", callisto: "Callisto Paris", privees: "Collections privées", coffrets: "Coffrets", library: "Fragrance Library" };
const ALIASES = { "scent lab": "scentlab", "takeoff fragrance": "takeoff", "takeoff fragance": "takeoff", "dubai perfumes": "dubai", "pocket perfumes": "pocket", "authentic perfumes": "authentic", haqqui: "haqqi", "collections privees": "privees", "collections privées": "privees", "collection privee": "privees", "private collection": "privees", coffret: "coffrets", "fragrance library": "library" };
const collectionOf0 = (v) => { const n = (v || "").trim().toLowerCase(); return LABELS[n] ? n : ALIASES[n] || "scentlab"; };
const collectionOf = (v, name = "") => (/callisto/i.test(name) ? "callisto" : collectionOf0(v));
const price = (n) => `${new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ")} FCFA`;
const clean = (v) => {
  let t = String(v || "");
  try { t = decodeURIComponent(t); } catch {}
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"( data-static)? \\/>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}"${key === "description" ? " data-static" : ""} />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

function resolveImage(image) {
  if (!image) return `${SITE}/og/default.jpg`;
  if (/^https?:\/\//.test(image)) return image;
  const optimized = image.match(/^\/images\/optimized\/(.+)-w\d+\.[a-z]+$/i);
  if (optimized) return `${SITE}/images/optimized/${optimized[1]}-w1200.webp`;
  if (image.startsWith("/src/assets/")) {
    const file = path.basename(image);
    const ext = path.extname(file);
    const stem = file.slice(0, -ext.length);
    const assets = fs.existsSync(path.join(dist, "assets")) ? fs.readdirSync(path.join(dist, "assets")) : [];
    const hit = assets.find((a) => a.startsWith(`${stem}-`) && a.endsWith(ext));
    return hit ? `${SITE}/assets/${hit}` : `${SITE}/og/default.jpg`;
  }
  if (image.startsWith("/")) return `${SITE}${image}`;
  return `${SITE}/og/default.jpg`;
}

function writeProductPage(base, p0) {
  const p = { ...p0, name: String(p0.name || "").replace(/\s*[(\-–]\s*callisto paris\s*\)?\s*$/i, "").trim() || p0.name };
  const label = LABELS[collectionOf(p0.collection, p0.name)];
  const pageUrl = `${SITE}/boutique/${p.slug}`;
  const title = `${p.name} – ${label} | 2M Parfumerie Dakar`;
  const desc = `${p.name} (${label}) à ${price(p.price)}${p.notes ? `. Notes : ${p.notes}` : ""}. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.`.slice(0, 300);
  const image = resolveImage(p.image);
  let html = base.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  for (const [attr, k, v] of [["name", "description", desc], ["property", "og:title", title], ["property", "og:description", desc], ["property", "og:image", image], ["property", "og:url", pageUrl], ["property", "og:type", "product"], ["name", "twitter:title", title], ["name", "twitter:description", desc], ["name", "twitter:image", image]]) {
    html = setMeta(html, attr, k, v);
  }
  html = html.replace(/<meta property="og:image:(width|height)" content="[^"]*" \/>\s*/g, "");
  html = html.replace("</head>", `    <link rel="canonical" href="${pageUrl}" />\n  </head>`);
  const out = path.join(dist, "boutique", `${p.slug}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}

function writeStaticProducts(base, skip = new Set()) {
  const file = path.join(process.cwd(), "node_modules", ".cache", "2m", "static-products.json");
  if (!fs.existsSync(file)) return 0;
  const products = JSON.parse(fs.readFileSync(file, "utf8")).filter((p) => p.slug && !skip.has(p.slug));
  for (const p of products) writeProductPage(base, p);
  return products.length;
}

async function main() {
  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  const baseHtml = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  if (!url || !key) {
    const n = writeStaticProducts(baseHtml);
    return console.log(`prerender-products: pas d'accès à la base, ${n} fiches du catalogue local`);
  }
  let rows;
  try {
    const res = await fetch(`${url}/rest/v1/products?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rows = await res.json();
  } catch (error) {
    const n = writeStaticProducts(baseHtml);
    return console.log(`prerender-products: base injoignable (${error.message}), ${n} fiches du catalogue local`);
  }
  const base = baseHtml;
  const live = rows
    .filter((r) => r.slug && r.description !== DELETED)
    .map((r) => ({ ...r, name: String(r.name || "").trim(), slug: clean(r.slug) }))
    .filter((r) => r.slug);
  const deleted = new Set(rows.filter((r) => r.slug && r.description === DELETED).map((r) => clean(r.slug)));

  // Fiches du catalogue local (sauf celles gérées ou supprimées dans la base), puis fiches de la base.
  const staticCount = writeStaticProducts(base, new Set([...live.map((r) => r.slug), ...deleted]));
  for (const r of live) {
    const notes = [r.notes_top, r.notes_heart, r.notes_base].filter(Boolean).join(", ");
    writeProductPage(base, { slug: r.slug, name: r.name, collection: r.collection, price: r.price, notes, image: r.image_url || (r.image_urls && r.image_urls[0]) });
  }

  // Plan du site : pages existantes + produits de la base, sans les produits supprimés.
  const sitemapPath = path.join(dist, "sitemap.xml");
  const existing = fs.existsSync(sitemapPath) ? [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
  const locs = new Set(existing.filter((loc) => !deleted.has(loc.split("/boutique/")[1])));
  for (const r of live) locs.add(`${SITE}/boutique/${r.slug}`);
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...locs].map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`).join("\n")}\n</urlset>\n`;
  fs.writeFileSync(sitemapPath, xml);
  console.log(`prerender-products: ${live.length} fiches base + ${staticCount} catalogue, ${deleted.size} supprimées, sitemap ${locs.size} adresses`);
}

main();
