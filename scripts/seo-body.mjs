// Contenu lisible par Google avant le chargement du site (remplacé par la page dès qu'elle s'affiche).
import fs from "node:fs";
import path from "node:path";

export const SITE = "https://www.2mparfumeriedk.com";
export const seoContent = JSON.parse(fs.readFileSync(path.join(process.cwd(), "src/lib/seo-content.json"), "utf8"));

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export function stripSeo(html) {
  return html
    .replace(/<!--seo-->[\s\S]*?<!--\/seo-->/g, "")
    .replace(/\s*<!--seo-ld-->[\s\S]*?<!--\/seo-ld-->/g, "");
}

export function injectBody(html, { h1, heading, paragraphs = [], links = [] }) {
  const parts = [`<h1>${esc(h1)}</h1>`];
  if (heading) parts.push(`<h2>${esc(heading)}</h2>`);
  for (const p of paragraphs) parts.push(`<p>${esc(p)}</p>`);
  if (links.length) parts.push(`<ul>${links.map(([l, h]) => `<li><a href="${esc(h)}">${esc(l)}</a></li>`).join("")}</ul>`);
  const block = `<!--seo--><main style="max-width:720px;margin:96px auto;padding:0 16px;font-family:sans-serif">${parts.join("")}</main><!--/seo-->`;
  return html.replace(/<!--seo-->[\s\S]*?<!--\/seo-->/g, "").replace(/<div id="root">\s*<\/div>/, `<div id="root">${block}</div>`);
}

export function injectHead(html, snippet) {
  return html.replace("</head>", `    <!--seo-ld-->${snippet}<!--/seo-ld-->\n  </head>`);
}

export const jsonLd = (data) => `<script type="application/ld+json" data-seo-static>${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;

export const STORE = {
  "@context": "https://schema.org",
  "@type": "Store",
  "@id": `${SITE}/#store`,
  name: "2M Parfumerie",
  description: "Parfumerie en ligne à Dakar : parfums Haqqi, SCENTLAB, Takeoff Fragrance, parfums Dubai, parfums authentiques et coffrets, livrés partout au Sénégal.",
  url: `${SITE}/`,
  logo: `${SITE}/icon-192.png`,
  image: `${SITE}/og/default.jpg`,
  telephone: "+221761923441",
  email: "2mparfumerie2025@gmail.com",
  priceRange: "4 000 F – 130 000 F",
  currenciesAccepted: "XOF",
  paymentAccepted: "Wave, Orange Money, espèces",
  address: { "@type": "PostalAddress", addressLocality: "Dakar", addressCountry: "SN" },
  areaServed: { "@type": "Country", name: "Sénégal" },
  sameAs: ["https://instagram.com/2mparfumeriesn", "https://www.facebook.com/profile.php?id=61551806734713", "https://www.tiktok.com/@2mparfumerie"],
};

export const COLLECTION_PATH = {
  haqqi: "/collections/haqqi",
  scentlab: "/collections/scentlab",
  takeoff: "/collections/takeoff",
  dubai: "/collections/parfums-dubai",
  pocket: "/collections/parfums-de-poches",
  authentic: "/collections/parfums-authentiques",
  callisto: "/collections/callisto-paris",
  privees: "/collections/collections-privees",
  coffrets: "/collections/coffrets",
  library: "/collections/fragrance-library",
  "soie-sublime": "/collections/soie-sublime",
};
