import type { Collection } from "@/lib/catalog-data";

export type CatalogueEntry = {
  slug: string;
  title: string;
  summary: string;
  pages: number;
  size: string;
  collection?: Collection;
};

const BASE = "/catalogues";

export const catalogueFile = (slug: string) => `${BASE}/2m-parfumerie-catalogue-${slug}.pdf`;
export const catalogueCover = (slug: string) => `${BASE}/couvertures/${slug}.webp`;

export const fullCatalogue = {
  slug: "complet",
  title: "Le catalogue complet",
  summary: "Toutes nos collections réunies dans un seul fichier, avec les prix et les senteurs.",
  pages: 40,
  size: "9,5 Mo",
};

export const catalogues: CatalogueEntry[] = [
  { slug: "00-nos-collections", title: "Nos collections", summary: "L'aperçu des 9 collections et des prix.", pages: 2, size: "0,2 Mo" },
  { slug: "01-haqqi", title: "Haqqi", summary: "60 senteurs, pack de 3 à 10 000 F.", pages: 5, size: "1,3 Mo", collection: "haqqi" },
  { slug: "02-scentlab", title: "SCENTLAB", summary: "61 senteurs, 6 000 F, pack de 3 à 15 000 F.", pages: 6, size: "1,3 Mo", collection: "scentlab" },
  { slug: "03-parfums-de-poche", title: "Parfums de poche", summary: "49 senteurs, pack de 5 à 10 000 F.", pages: 3, size: "0,4 Mo", collection: "pocket" },
  { slug: "04-takeoff", title: "Takeoff", summary: "13 escales, 25 000 F, les 2 à 50 000 F.", pages: 4, size: "0,9 Mo", collection: "takeoff" },
  { slug: "05-dubai-perfumes", title: "Dubai Perfumes", summary: "Dès 12 000 F, avec la nouvelle gamme Mousuf.", pages: 5, size: "2,2 Mo", collection: "dubai" },
  { slug: "06-parfums-authentiques", title: "Parfums authentiques", summary: "Les originaux des grandes maisons.", pages: 5, size: "1,8 Mo", collection: "authentic" },
  { slug: "07-callisto-paris", title: "Callisto Paris", summary: "5 parfums de la maison Callisto Paris.", pages: 3, size: "0,5 Mo", collection: "callisto" },
  { slug: "08-collections-privees", title: "Collections privées", summary: "Prestige Paris, Soie Sublime, Reef.", pages: 4, size: "1,3 Mo", collection: "privees" },
  { slug: "09-coffrets", title: "Coffrets", summary: "Coffrets cadeaux des grandes maisons.", pages: 3, size: "0,7 Mo", collection: "coffrets" },
];

export const catalogueForCollection = (collection: Collection) =>
  catalogues.find((item) => item.collection === collection);
