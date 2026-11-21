import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/parfums-authentiques";
const TITLE = seoMeta("/collections/parfums-authentiques").title;
const DESC = seoMeta("/collections/parfums-authentiques").desc;

export const Route = createFileRoute("/collections/parfums-authentiques")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
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
            { "@type": "ListItem", position: 3, name: "Parfums authentiques", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="authentic"
      eyebrow="Parfums authentiques"
      h1="Parfums authentiques à Dakar"
      intro="Les originaux des grandes maisons, dans leur flacon et leur boîte d'origine : Yves Saint Laurent, Hermès, Guerlain, Givenchy, Paco Rabanne, Issey Miyake et d'autres. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions, offerte dès 75 000 F."
    />
  ),
});
