// Après `vite build` : crée une copie de dist/index.html par page principale,
// avec son propre titre, sa description, son image de partage et son lien canonique.
// WhatsApp, Facebook et Google lisent ces balises sans exécuter le JavaScript.
import fs from "node:fs";
import path from "node:path";
import { seoContent, injectBody, injectHead, jsonLd, STORE, stripSeo } from "./seo-body.mjs";

const SITE = "https://www.2mparfumeriedk.com";
const dist = path.join(process.cwd(), "dist");
const base = stripSeo(fs.readFileSync(path.join(dist, "index.html"), "utf8"));

const pages = [
  { path: "/boutique", title: "Boutique parfums Dakar | Plus de 200 parfums dès 4 000 F — 2M Parfumerie", desc: "Plus de 200 parfums à Dakar dès 4 000 F : Haqqi, SCENTLAB, Takeoff, Parfums Dubai, parfums authentiques et coffrets. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.", image: "default" },
  { path: "/coffret-signature", title: "Compose ton pack de parfums | Haqqi 10 000 F, SCENTLAB 15 000 F — 2M Parfumerie", desc: "Compose ton pack : 3 parfums Haqqi à 10 000 FCFA, 3 SCENTLAB à 15 000 FCFA ou 5 parfums de poche à 10 000 FCFA. Validation sur WhatsApp, livraison partout au Sénégal.", image: "packs" },
  { path: "/collections/takeoff", title: "Takeoff Fragrance Dakar — 25 000 F, les 2 à 50 000 F | 2M Parfumerie", desc: "Takeoff Fragrance à Dakar : parfums inspirés des grandes villes du monde à 25 000 FCFA, les 2 à 50 000 FCFA avec livraison offerte. Livraison rapide à Dakar, 24 à 48h en régions.", image: "takeoff" },
  { path: "/collections/haqqi", title: "Parfums Haqqi Dakar dès 4 000 F | Pack de 3 à 10 000 F — 2M Parfumerie", desc: "La collection Haqqi : parfums inspirés des grandes marques dès 4 000 FCFA, pack de 3 à 10 000 FCFA. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.", image: "haqqi" },
  { path: "/collections/scentlab", title: "SCENTLAB Dakar — 6 000 F le parfum, pack de 3 à 15 000 F | 2M Parfumerie", desc: "Parfums SCENTLAB inspirés des grands parfums de luxe, 6 000 FCFA l'unité ou 15 000 FCFA le pack de 3. Livraison rapide à Dakar, 24 à 48h en régions.", image: "scentlab" },
  { path: "/collections/parfums-de-poches", title: "Parfums de poche Dakar | Pack de 5 à 10 000 F — 2M Parfumerie", desc: "Parfums de poche chez 2M Parfumerie : compose ton pack de 5 parfums à 10 000 FCFA. Un format pratique à glisser dans le sac, livré partout au Sénégal.", image: "packs" },
  { path: "/collections/collections-privees", title: "Collections privées Dakar | Parfums exclusifs — 2M Parfumerie", desc: "Une sélection exclusive de parfums rares à Dakar. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.", image: "privees" },
  { path: "/collections/callisto-paris", title: "Callisto Paris à Dakar | Parfums de la maison Callisto — 2M Parfumerie", desc: "Les parfums Callisto Paris à Dakar : African Gold, Oud Sable, Iris Absolu et plus. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.", image: "callisto" },
  { path: "/collections/coffrets", title: "Coffrets parfums Dakar | Idées cadeaux — 2M Parfumerie", desc: "Coffrets de parfums prêts à offrir à Dakar. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions, offerte dès 75 000 FCFA.", image: "coffrets" },
  { path: "/collections/soie-sublime", title: "", desc: "", image: "soie-sublime" },
  { path: "/collections/parfums-dubai", title: "", desc: "", image: "dubai" },
  { path: "/collections/parfums-authentiques", title: "", desc: "", image: "authentiques" },
  { path: "/catalogues", title: "Catalogues PDF à télécharger | 2M Parfumerie Dakar", desc: "Téléchargez gratuitement les catalogues 2M Parfumerie : Haqqi, SCENTLAB, Takeoff, Parfums de poche, Parfums Dubai, parfums authentiques, Callisto Paris, collections privées, coffrets, Fragrance Library et Soie Sublime Paris.", image: "default" },
  { path: "/collections/fragrance-library", title: "Fragrance Library à Dakar | Eaux de parfum 100 ml à 30 000 F — 2M Parfumerie", desc: "Les eaux de parfum Fragrance Library à 30 000 F : A Tale of Two Cities, The Golden Bowl, Sense and Sensibility et plus. Commande sur WhatsApp, livraison partout au Sénégal.", image: "library" },
  { path: "/livraison", title: "Livraison rapide à Dakar, 24 à 48h en régions | 2M Parfumerie", desc: "Livraison rapide à Dakar (1 500 à 2 000 FCFA selon la zone), 24 à 48h en régions (2 000 FCFA), offerte dès 75 000 FCFA. Paiement Wave, Orange Money ou espèces.", image: "default" },
  { path: "/contact", title: "Contact — 2M Parfumerie Dakar | WhatsApp 76 192 34 41", desc: "Commandez sur WhatsApp au +221 76 192 34 41 ou appelez le +221 78 144 17 66. Réponse en moins d'1h, 7j/7. Livraison partout au Sénégal.", image: "default" },
  { path: "/a-propos", title: "À propos & FAQ | 2M Parfumerie Dakar", desc: "L'histoire de 2M Parfumerie et les réponses à vos questions : livraison, authenticité, paiement Wave, Orange Money ou espèces.", image: "default" },
  { path: "/faq", title: "FAQ | 2M Parfumerie Dakar", desc: "Livraison, paiement, authenticité, conseils : toutes les réponses de 2M Parfumerie.", image: "default" },
  { path: "/blog", title: "Blog parfum Sénégal | Conseils et tendances — 2M Parfumerie", desc: "Conseils parfum, tendances à Dakar et comparatifs pour bien choisir avant d'acheter.", image: "default" },
  { path: "/trouve-ton-parfum", title: "Trouve ton parfum en 4 questions | 2M Parfumerie Dakar", desc: "Quiz gratuit : 4 questions, 3 parfums faits pour toi, dès 4 000 F. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.", image: "default" },
  { path: "/conseils", title: "Conseils parfum | 2M Parfumerie Dakar", desc: "Bien choisir, porter et faire durer son parfum : les conseils de 2M Parfumerie.", image: "default" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function setMeta(html, attr, key, value) {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"( data-static)? \\/>`);
  const tag = `<meta ${attr}="${key}" content="${esc(value)}"${key === "description" ? " data-static" : ""} />`;
  return re.test(html) ? html.replace(re, tag) : html.replace("</head>", `    ${tag}\n  </head>`);
}

for (const page of [...pages, { path: "/", image: "default" }]) {
  const seo = seoContent[page.path];
  if (seo) { page.title = seo.title; page.desc = seo.desc; }
  const url = SITE + (page.path === "/" ? "/" : page.path);
  const img = `${SITE}/og/${page.image}.jpg`;
  let html = base.replace(/<title>[^<]*<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, "name", "description", page.desc);
  html = setMeta(html, "property", "og:title", page.title);
  html = setMeta(html, "property", "og:description", page.desc);
  html = setMeta(html, "property", "og:image", img);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "name", "twitter:title", page.title);
  html = setMeta(html, "name", "twitter:description", page.desc);
  html = setMeta(html, "name", "twitter:image", img);
  const ld = [];
  if (page.path === "/") {
    ld.push(STORE, { "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE}/#website`, name: "2M Parfumerie", url: `${SITE}/`, inLanguage: "fr-SN", publisher: { "@id": `${SITE}/#store` } });
  } else {
    const name = (seo?.h1 || page.title.split(/ [|:—–] /)[0]).trim();
    const crumbs = [{ "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE}/` }];
    if (page.path.startsWith("/collections/")) crumbs.push({ "@type": "ListItem", position: 2, name: "Boutique", item: `${SITE}/boutique` });
    crumbs.push({ "@type": "ListItem", position: crumbs.length + 1, name, item: url });
    ld.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs });
    if (page.path.startsWith("/collections/")) ld.push({ "@context": "https://schema.org", "@type": "CollectionPage", name, description: page.desc, url, inLanguage: "fr-SN", isPartOf: { "@id": `${SITE}/#website` } });
  }
  let body = seo;
  if (page.path === "/faq") {
    const src = fs.readFileSync(path.join(process.cwd(), "src/components/commerce/Faq.tsx"), "utf8");
    const faqs = [...src.matchAll(/question:\s*"([^"]+)",\s*answer:\s*"((?:[^"\\]|\\.)*)"/g)].map((m) => ({ q: m[1], a: m[2].replace(/\\n/g, " ") }));
    ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
    body = { h1: "Questions fréquentes", paragraphs: faqs.flatMap((f) => [f.q, f.a]), links: [["Livraison", "/livraison"], ["Contact", "/contact"], ["Boutique", "/boutique"]] };
  }
  if (page.path === "/contact") ld.push(STORE);
  html = injectHead(html, `<link rel="canonical" href="${url}" />${ld.map(jsonLd).join("")}`);
  if (body?.h1) html = injectBody(html, body);
  const out = page.path === "/" ? path.join(dist, "index.html") : path.join(dist, `${page.path.slice(1)}.html`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
}
console.log(`prerender-meta: ${pages.length} pages`);
