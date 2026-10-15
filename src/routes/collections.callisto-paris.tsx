import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";

const URL = "https://www.2mparfumeriedk.com/collections/callisto-paris";
const TITLE = "Callisto Paris à Dakar | Parfums de la maison Callisto — 2M Parfumerie";
const DESC =
  "Les parfums Callisto Paris à Dakar : African Gold, Oud Sable, Iris Absolu, Iris Gourmand, Cœur de Patchouli. Commande sur WhatsApp, livraison partout au Sénégal.";

export const Route = createFileRoute("/collections/callisto-paris")({
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
            { "@type": "ListItem", position: 3, name: "Callisto Paris", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="callisto"
      eyebrow="Callisto Paris"
      h1="Callisto Paris — La maison parisienne, à Dakar"
      intro="Les parfums de la maison Callisto Paris, dans leur flacon d'origine : African Gold, Oud Sable, Iris Absolu, Iris Gourmand et Cœur de Patchouli. Commande sur WhatsApp, livraison partout au Sénégal."
    />
  ),
});
