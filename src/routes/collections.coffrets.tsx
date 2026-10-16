import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/coffrets";
const TITLE = seoMeta("/collections/coffrets").title;
const DESC = seoMeta("/collections/coffrets").desc;

export const Route = createFileRoute("/collections/coffrets")({
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
            { "@type": "ListItem", position: 3, name: "Coffrets", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="coffrets"
      eyebrow="Coffrets"
      h1="Coffrets — Des ensembles de parfums prêts à offrir"
      intro="Les Coffrets 2M Parfumerie rassemblent plusieurs parfums dans un même ensemble, parfaits pour offrir ou pour se faire plaisir. Livraison partout au Sénégal, avec confirmation directe avec le gérant."
      ctaLabel="Composer mon pack"
      ctaHref="/coffret-signature"
    />
  ),
});
