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

const LABELS = { scentlab: "SCENTLAB", takeoff: "Takeoff Fragrance", dubai: "Dubai Perfumes", pocket: "Parfums de poche", authentic: "Parfums authentiques", haqqi: "Haqqi", privees: "Collections privées", coffrets: "Coffrets", library: "Fragrance Library" };
const ALIASES = { "scent lab": "scentlab", "takeoff fragrance": "takeoff", "takeoff fragance": "takeoff", "dubai perfumes": "dubai", "pocket perfumes": "pocket", "authentic perfumes": "authentic", haqqui: "haqqi", "collections privees": "privees", "collections privées": "privees", "collection privee": "privees", "private collection": "privees", coffret: "coffrets", "fragrance library": "library" };
const collectionOf = (v) => { const n = (v || "").trim().toLowerCase(); return LABELS[n] ? n : ALIASES[n] || "scentlab"; };
const price = (n) => `${new Intl.NumberFormat("fr-FR").format(n).replace(/ | /g, " ")} FCFA`;
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"( data-static)? \\/>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}"${key === "description" ? " data-static" : ""} />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

async function main() {
  const env = readEnv();
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return console.log("prerender-products: pas d'accès à la base, ignoré");
  let rows;
  try {
    const res = await fetch(`${url}/rest/v1/products?select=*`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rows = await res.json();
  } catch (error) {
    return console.log(`prerender-products: base injoignable (${error.message}), ignoré`);
  }
  const base = fs.readFileSync(path.join(dist, "index.html"), "utf8");
  const live = rows.filter((r) => r.slug && r.description !== DELETED);
  const deleted = new Set(rows.filter((r) => r.slug && r.description === DELETED).map((r) => r.slug));

  for (const r of live) {
    const label = LABELS[collectionOf(r.collection)];
    const pageUrl = `${SITE}/boutique/${r.slug}`;
    const title = `${r.name} – ${label} | 2M Parfumerie Dakar`;
    const notes = [r.notes_top, r.notes_heart, r.notes_base].filter(Boolean).join(", ");
    const desc = `${r.name} (${label}) à ${price(r.price)}${notes ? `. Notes : ${notes}` : ""}. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.`.slice(0, 300);
    const image = r.image_url || (r.image_urls && r.image_urls[0]) || `${SITE}/og/default.jpg`;
    let html = base.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
    for (const [attr, k, v] of [["name", "description", desc], ["property", "og:title", title], ["property", "og:description", desc], ["property", "og:image", image], ["property", "og:url", pageUrl], ["property", "og:type", "product"], ["name", "twitter:title", title], ["name", "twitter:description", desc], ["name", "twitter:image", image]]) {
      html = setMeta(html, attr, k, v);
    }
    html = html.replace(/<meta property="og:image:(width|height)" content="[^"]*" \/>\s*/g, "");
    html = html.replace("</head>", `    <link rel="canonical" href="${pageUrl}" />\n  </head>`);
    const out = path.join(dist, "boutique", `${r.slug}.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  }

  // Plan du site : pages existantes + produits de la base, sans les produits supprimés.
  const sitemapPath = path.join(dist, "sitemap.xml");
  const existing = fs.existsSync(sitemapPath) ? [...fs.readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]) : [];
  const locs = new Set(existing.filter((loc) => !deleted.has(loc.split("/boutique/")[1])));
  for (const r of live) locs.add(`${SITE}/boutique/${r.slug}`);
  const now = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...locs].map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n  </url>`).join("\n")}\n</urlset>\n`;
  fs.writeFileSync(sitemapPath, xml);
  console.log(`prerender-products: ${live.length} fiches, ${deleted.size} supprimées, sitemap ${locs.size} adresses`);
}

main();
