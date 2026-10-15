import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";

const URL = "https://www.2mparfumeriedk.com/collections/fragrance-library";
const TITLE = "Fragrance Library Dakar | 2M Parfumerie";
const DESC =
  "Explorez la Fragrance Library de 2M Parfumerie : notre bibliothèque complète de parfums, livrée partout au Sénégal. Commandez sur WhatsApp.";

export const Route = createFileRoute("/collections/fragrance-library")({
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
            { "@type": "ListItem", position: 3, name: "Fragrance Library", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="library"
      eyebrow="Fragrance Library"
      h1="Fragrance Library — Notre bibliothèque complète de parfums"
      intro="La Fragrance Library de 2M Parfumerie réunit l'ensemble de nos références olfactives dans un même espace. Livraison partout au Sénégal, avec confirmation directe avec le gérant."
    />
  ),
});
