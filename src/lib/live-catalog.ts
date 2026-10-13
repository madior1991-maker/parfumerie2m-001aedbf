import type { Database } from "@/integrations/supabase/types";
import {
  catalog,
  collectionLabel,
  collectionValues,
  normalizeCollectionValue,
  slugifyProduct,
  type BoutiqueProduct,
  type Collection,
} from "@/lib/catalog-data";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

const DELETED_PRODUCT_MARKER = "__2M_ADMIN_DELETED_PRODUCT__";

export function mergeLiveCatalog(productRows: ProductRow[]) {
  const databaseBySlug = new Map(productRows.map((product) => [product.slug, product]));
  const catalogSlugs = new Set(catalog.map(slugifyProduct));
  const mergedCatalog = catalog.flatMap((product) => {
    const slug = slugifyProduct(product);
    const savedProduct = databaseBySlug.get(slug);
    if (savedProduct?.description === DELETED_PRODUCT_MARKER) return [];
    if (savedProduct) return [productFromRow(savedProduct, product)];
    return [product];
  });
  const extraProducts = productRows
    .filter((product) => !catalogSlugs.has(product.slug) && product.description !== DELETED_PRODUCT_MARKER)
    .map((product) => productFromRow(product));

  return [...mergedCatalog, ...extraProducts];
}

function productFromRow(product: ProductRow, fallback?: BoutiqueProduct): BoutiqueProduct {
  const collection = normalizeCollectionValue(product.collection);
  const image = product.image_url || product.image_urls?.[0] || fallback?.image || "";
  const notes = product.notes_top || fallback?.notes || "Notes à préciser";

  return {
    name: product.name,
    ref: product.subtitle || fallback?.ref || "Collection 2M",
    notes,
    headNotes: product.notes_top || fallback?.headNotes || notes,
    heartNotes: product.notes_heart || fallback?.heartNotes || "Notes à préciser",
    baseNotes: product.notes_base || fallback?.baseNotes || "Notes à préciser",
    price: product.price,
    collection,
    image,
    imageUrls: product.image_urls?.length ? product.image_urls : image ? [image] : [],
    family: fallback?.family || collectionLabelFallback(collection),
    concentration: fallback?.concentration || "Eau de parfum",
    volume: fallback?.volume || "100 ml",
    description: product.description || fallback?.description || buildDescription(product.name, collection, product),
    slug: product.slug,
  };
}

function collectionLabelFallback(collection: Collection) {
  return collection === "takeoff" ? "Scent of Journey" : collectionLabel(collection);
}

// Description de secours quand la fiche n'en a pas : nom, collection et notes réelles.
function buildDescription(name: string, collection: Collection, product: ProductRow) {
  const notes = [product.notes_top, product.notes_heart, product.notes_base]
    .map((value) => value?.trim().replace(/[.;]+$/, ""))
    .filter((value): value is string => Boolean(value));
  const label = collectionLabel(collection);
  const intro = notes.length
    ? `${name} (${label}) s'ouvre sur ${notes[0].toLowerCase()}${notes[1] ? `, avec un cœur de ${notes[1].toLowerCase()}` : ""}${notes[2] ? ` et un fond de ${notes[2].toLowerCase()}` : ""}.`
    : `${name}, de la collection ${label}.`;
  return `${intro} Disponible chez 2M Parfumerie : commande sur WhatsApp, livraison rapide à Dakar et en 24 à 48h dans les régions.`;
}