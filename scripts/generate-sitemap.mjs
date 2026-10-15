// Plan du site généré à partir du vrai catalogue (mêmes adresses que le site).
// Lancé avant le build. En cas d'erreur, on garde le plan existant.
import fs from "node:fs";
import path from "node:path";
import { createServer } from "vite";

const SITE = "https://www.2mparfumeriedk.com";
const ROUTES = [
  "/",
  "/boutique",
  "/contact",
  "/faq",
  "/blog",
  "/coffret-signature",
  "/a-propos",
  "/mentions-legales",
  "/livraison",
  "/conseils",
  "/trouve-ton-parfum",
  "/collections/takeoff",
  "/collections/haqqi",
  "/collections/scentlab",
  "/collections/parfums-de-poches",
  "/collections/collections-privees",
  "/collections/callisto-paris",
  "/collections/coffrets",
  "/collections/fragrance-library",
];

async function main() {
  const server = await createServer({ logLevel: "error", server: { middlewareMode: true }, appType: "custom", optimizeDeps: { noDiscovery: true, include: [] } });
  try {
    const { catalog, slugifyProduct } = await server.ssrLoadModule("/src/lib/catalog-data.ts");
    const slugs = [...new Set(catalog.filter((p) => !p.placeholder).map(slugifyProduct))].filter(Boolean);
    const locs = [...ROUTES.map((r) => `${SITE}${r}`), ...slugs.map((s) => `${SITE}/boutique/${s}`)];
    const now = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs
      .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${loc.includes("/boutique/") ? "0.7" : "0.8"}</priority>\n  </url>`)
      .join("\n")}\n</urlset>\n`;
    fs.writeFileSync(path.join(process.cwd(), "public", "sitemap.xml"), xml);
    // Liste des produits du catalogue local, pour écrire leurs aperçus de partage après le build.
    const cacheDir = path.join(process.cwd(), "node_modules", ".cache", "2m");
    fs.mkdirSync(cacheDir, { recursive: true });
    const products = catalog
      .filter((p) => !p.placeholder)
      .map((p) => ({ slug: slugifyProduct(p), name: p.name, collection: p.collection, price: p.price, notes: p.notes, image: p.image }));
    fs.writeFileSync(path.join(cacheDir, "static-products.json"), JSON.stringify(products));
    console.log(`generate-sitemap: ${locs.length} adresses (${slugs.length} produits)`);
  } finally {
    await server.close();
  }
}

main().catch((error) => {
  console.log(`generate-sitemap: erreur (${error.message}), plan existant conservé`);
});
