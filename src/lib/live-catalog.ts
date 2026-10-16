import { useEffect, useState } from "react";
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

// Les parfums Callisto Paris forment leur propre collection,
// même s'ils sont encore rangés dans « Parfums authentiques » dans l'admin.
const CALLISTO = /callisto/i;
const CALLISTO_SUFFIX = /\s*[(\-–]\s*callisto paris\s*\)?\s*$/i;

function productFromRow(product: ProductRow, fallback?: BoutiqueProduct): BoutiqueProduct {
  const isCallisto = CALLISTO.test(product.name) || CALLISTO.test(product.subtitle ?? "");
  const collection = isCallisto ? "callisto" : normalizeCollectionValue(product.collection);
  const name = isCallisto ? product.name.replace(CALLISTO_SUFFIX, "").trim() || product.name : product.name;
  const image = product.image_url || product.image_urls?.[0] || fallback?.image || "";
  const notes = product.notes_top || fallback?.notes || "Notes à préciser";

  return {
    createdAt: product.created_at ?? undefined,
    isBestseller: Boolean(product.is_bestseller),
    name,
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
    concentration: fallback?.concentration || (["soie-sublime", "callisto"].includes(collection) ? "Extrait de parfum" : "Eau de parfum"),
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
// Catégories créées dans l'admin (hors catégories prévues dans le code).
// Une seule requête par visite, partagée par le menu et le pied de page.
export type CustomCollection = { value: Collection; label: string; minPrice: number };

let customCollectionsPromise: Promise<CustomCollection[]> | null = null;

export function loadCustomCollections() {
  customCollectionsPromise ??= (async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data } = await supabase.from("products").select("collection,price,description");
      const byValue = new Map<string, CustomCollection>();
      for (const row of data ?? []) {
        if (row.description === DELETED_PRODUCT_MARKER) continue;
        const value = normalizeCollectionValue(row.collection);
        if (collectionValues.includes(value as (typeof collectionValues)[number])) continue;
        const current = byValue.get(value);
        const price = Number(row.price) || 0;
        if (!current) byValue.set(value, { value, label: collectionLabel(value), minPrice: price });
        else if (price && (!current.minPrice || price < current.minPrice)) current.minPrice = price;
      }
      return Array.from(byValue.values()).sort((a, b) => a.label.localeCompare(b.label, "fr"));
    } catch {
      customCollectionsPromise = null;
      return [];
    }
  })();
  return customCollectionsPromise;
}

export function useCustomCollections() {
  const [collections, setCollections] = useState<CustomCollection[]>([]);
  useEffect(() => {
    let active = true;
    void loadCustomCollections().then((result) => {
      if (active) setCollections(result);
    });
    return () => {
      active = false;
    };
  }, []);
  return collections;
}
