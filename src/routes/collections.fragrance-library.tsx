import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/fragrance-library";
const TITLE = seoMeta("/collections/fragrance-library").title;
const DESC = seoMeta("/collections/fragrance-library").desc;

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
      h1="Fragrance Library — Des parfums qui se lisent comme des romans"
      intro="Chaque flacon porte le titre d'un grand roman : A Tale of Two Cities, The Golden Bowl, Sense and Sensibility, In Search of Lost Time… Eaux de parfum 100 ml, dans leur coffret d'origine, à 35 000 F. Livraison partout au Sénégal."
    />
  ),
});
