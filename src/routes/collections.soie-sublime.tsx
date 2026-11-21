import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/soie-sublime";
const TITLE = seoMeta("/collections/soie-sublime").title;
const DESC = seoMeta("/collections/soie-sublime").desc;

export const Route = createFileRoute("/collections/soie-sublime")({
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
            { "@type": "ListItem", position: 3, name: "Soie Sublime Paris", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="soie-sublime"
      eyebrow="Soie Sublime Paris"
      h1="Soie Sublime Paris à Dakar"
      intro="Alba, Encens et Somari : les extraits de parfum de la maison Soie Sublime Paris. 90&nbsp;000&nbsp;F au lieu de 120&nbsp;000&nbsp;F. Commande sur WhatsApp, livraison offerte partout au Sénégal."
    />
  ),
});
