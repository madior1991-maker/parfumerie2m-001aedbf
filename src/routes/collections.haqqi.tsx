import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";

const URL = "https://www.2mparfumeriedk.com/collections/haqqi";
const TITLE = "Haqqi Parfums Dakar | Collection abordable — 2M Parfumerie Dakar";
const DESC =
  "Découvrez la collection Haqqi chez 2M Parfumerie. Parfums de qualité à partir de 4 000 FCFA, livrés partout au Sénégal. Commandez sur WhatsApp.";

export const Route = createFileRoute("/collections/haqqi")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.2mparfumeriedk.com/" },
            { "@type": "ListItem", position: 2, name: "Collections", item: "https://www.2mparfumeriedk.com/boutique" },
            { "@type": "ListItem", position: 3, name: "Haqqi", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="haqqi"
      eyebrow="Collection Haqqi"
      h1="Haqqi — Parfums quotidiens accessibles livrés partout au Sénégal"
      intro="Haqqi est la collection de parfums abordables et quotidiens de 2M Parfumerie. Pensés pour le quotidien sénégalais, les parfums Haqqi offrent une tenue remarquable à un prix accessible, à partir de 4 000 FCFA. Livraison rapide à Dakar, 24 à 48h en régions. Commandez sur WhatsApp ou composez votre pack de 3 Haqqi à 10 000 FCFA."
      ctaLabel="Pack Haqqi (3 parfums) — 10 000 FCFA"
      ctaHref="/coffret-signature"
    />
  ),
});
