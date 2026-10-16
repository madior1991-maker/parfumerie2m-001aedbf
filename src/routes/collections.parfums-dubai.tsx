import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/parfums-dubai";
const TITLE = seoMeta("/collections/parfums-dubai").title;
const DESC = seoMeta("/collections/parfums-dubai").desc;

export const Route = createFileRoute("/collections/parfums-dubai")({
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
            { "@type": "ListItem", position: 3, name: "Parfums Dubai", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="dubai"
      eyebrow="Parfums Dubai"
      h1="Parfums Dubai à Dakar, dès 12 000 F"
      intro="Oud, ambre, musc et safran : des parfums orientaux généreux qui tiennent longtemps. Lattafa, Afnan, Mousuf, Khadlaj, Rayhaan et plus, dès 12 000 F. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions."
    />
  ),
});
