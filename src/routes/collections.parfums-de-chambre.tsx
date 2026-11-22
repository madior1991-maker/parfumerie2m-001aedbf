import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/parfums-de-chambre";
const TITLE = seoMeta("/collections/parfums-de-chambre").title;
const DESC = seoMeta("/collections/parfums-de-chambre").desc;

export const Route = createFileRoute("/collections/parfums-de-chambre")({
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
            { "@type": "ListItem", position: 3, name: "Parfums de chambre", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="parfums-de-chambre"
      eyebrow="SCENTLAB · Room spray"
      h1="Parfums de chambre à Dakar"
      intro="Lavender Whisper, Melon Crush, Mango Bloom, Oud Bouquet et Noir Oud : les room spray SCENTLAB en flacon de 500&nbsp;ml, à 5&nbsp;000&nbsp;F. Commande sur WhatsApp, livraison partout au Sénégal."
    />
  ),
});
