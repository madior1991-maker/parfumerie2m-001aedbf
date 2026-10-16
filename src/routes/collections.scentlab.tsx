import { createFileRoute } from "@tanstack/react-router";

import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";

const URL = "https://www.2mparfumeriedk.com/collections/scentlab";
const TITLE = seoMeta("/collections/scentlab").title;
const DESC = seoMeta("/collections/scentlab").desc;

export const Route = createFileRoute("/collections/scentlab")({
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
            { "@type": "ListItem", position: 3, name: "SCENTLAB", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="scentlab"
      eyebrow="Collection SCENTLAB"
      h1="SCENTLAB à Dakar — Parfums de luxe livrés à Dakar"
      intro="SCENTLAB est une maison de parfumerie qui crée des fragrances inspirées des plus grands parfums de luxe au monde. Chez 2M Parfumerie, nous sommes votre revendeur officiel SCENTLAB à Dakar. Chaque flacon SCENTLAB est une Eau de Parfum longue tenue, disponible en livraison partout au Sénégal, avec confirmation directe avec le gérant. Découvrez notre sélection complète de SCENTLAB Dakar et trouvez votre signature olfactive."
      ctaLabel="Pack SCENTLAB (3 parfums) — 15 000 FCFA"
      ctaHref="/coffret-signature"
      ctaPack="scentlab"
    />
  ),
});
