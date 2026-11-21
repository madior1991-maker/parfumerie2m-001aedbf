import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/collections-privees";
const TITLE = seoMeta("/collections/collections-privees").title;
const DESC = seoMeta("/collections/collections-privees").desc;

export const Route = createFileRoute("/collections/collections-privees")({
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
            { "@type": "ListItem", position: 3, name: "Collections privées", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="privees"
      eyebrow="Collections privées"
      h1="Collections privées — Une sélection exclusive de parfums"
      intro="Les Collections privées de 2M Parfumerie rassemblent une sélection exclusive de parfums, réservée à nos clients les plus exigeants. Livraison partout au Sénégal, avec confirmation directe avec le gérant."
    />
  ),
});
