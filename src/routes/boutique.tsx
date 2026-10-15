import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import {
  collectionFiltersFor,
  collectionLabel,
  formatPrice,
  normalizeCollectionValue,
  optimizedProductImageUrl,
  slugifyProduct,
  type BoutiqueProduct,
  type Collection,
} from "@/lib/catalog-data";
import { supabase } from "@/integrations/supabase/client";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { PocketShowcase } from "@/components/commerce/PocketShowcase";

function validateBoutiqueSearch(search: Record<string, unknown>): { collection?: Collection } {
  if (typeof search.collection !== "string" || !search.collection.trim()) {
    return {};
  }
  const value = normalizeCollectionValue(search.collection);
  if (value === "all") return {};
  return { collection: value };
}


const PAGE_SIZE = 25; // 5 rangées de 5 sur ordinateur

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Ordre aléatoire à chaque visite, en gardant les collections bien mélangées.
function mixProductsByCollection(products: BoutiqueProduct[]) {
  // Toutes les catégories présentes, y compris celles ajoutées plus tard.
  const collections = Array.from(new Set(products.map((product) => product.collection)));
  const groupedProducts = shuffle(
    collections.map((collection) =>
      shuffle(products.filter((product) => product.collection === collection)),
    ),
  );
  const maxGroupLength = Math.max(0, ...groupedProducts.map((group) => group.length));

  return Array.from({ length: maxGroupLength }).flatMap((_, index) =>
    groupedProducts.flatMap((group) => (group[index] ? [group[index]] : [])),
  );
}

export const Route = createFileRoute("/boutique")({
  validateSearch: validateBoutiqueSearch,
  head: () => ({
    meta: [
      { title: "Boutique parfums Dakar | Plus de 200 parfums dès 4 000 F — 2M Parfumerie" },
      {
        name: "description",
        content:
          "Plus de 200 parfums à Dakar dès 4 000 F : Haqqi, SCENTLAB, Takeoff, Dubai Perfumes et parfums authentiques. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/boutique" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.2mparfumeriedk.com/" },
            { "@type": "ListItem", position: 2, name: "Boutique", item: "https://www.2mparfumeriedk.com/boutique" },
          ],
        }),
      },
    ],
  }),
  component: BoutiquePage,
});

function BoutiquePage() {
  const location = useLocation();
  const search = Route.useSearch();
  const collection: Collection = search.collection ?? "all";
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [products, setProducts] = useState<BoutiqueProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [collection, searchQuery]);

  useEffect(() => {
    void loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    setProducts(mergeLiveCatalog(data ?? []));
  };

  const mixedProducts = useMemo(() => mixProductsByCollection(products), [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return mixedProducts.filter((product) => {
      const collectionMatch = collection === "all" || product.collection === collection;
      if (!collectionMatch) return false;
      if (!query) return true;
      const haystack = [
        product.name,
        product.ref,
        product.notes,
        product.family,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [mixedProducts, collection, searchQuery]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  // Catégories connues + catégories créées dans l'admin.
  const filters = useMemo(() => collectionFiltersFor(products), [products]);

  const isPocketShowcase = collection === "pocket";

  if (location.pathname !== "/boutique") {
    return <Outlet />;
  }

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="section-shell text-center">
          <p className="caption-luxe text-accent">Toutes les collections</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground md:text-[56px]">
            La Boutique
          </h1>
          <p className="mt-4 text-muted-foreground">
            Plus de 200 parfums, dès 4 000 F. Nos créations inspirées des grands parfums et les originaux des grandes maisons.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-background py-5 md:py-8">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          <div className="mx-auto mb-5 max-w-xl">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Rechercher un parfum, une note, une famille…"
              aria-label="Rechercher un parfum"
              className="w-full rounded-full border border-border bg-surface px-5 py-3 text-sm text-foreground shadow-card placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <p className="caption-luxe mb-3 text-center text-accent">Catégories</p>
          <div className="-mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-2 [scrollbar-width:none] md:mx-0 md:flex-wrap md:justify-center md:gap-3 md:overflow-visible md:px-0">
            {filters.map((filter) => (
              <FilterLink
                key={filter.value}
                active={collection === filter.value}
                search={{ collection: filter.value }}
                label={filter.label}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          {isPocketShowcase ? (
            <PocketShowcase />
          ) : (
            <>
          {collection === "haqqi" && (
            <div className="mb-8 overflow-hidden rounded-lg border border-border bg-card shadow-card">
              <video
                src="/videos/haqqi.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="h-full w-full object-cover"
              />
            </div>
          )}
          {collection === "authentic" && (
            <div className="mx-auto mb-8 max-w-md overflow-hidden rounded-lg border border-border bg-card shadow-card">
              <video
                src="/videos/authentic.mp4"
                autoPlay
                loop
                muted
                playsInline
                controls
                className="h-auto w-full"
              />
            </div>
          )}
          <div className="mb-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <p>
              {filteredProducts.length} résultat{filteredProducts.length > 1 ? "s" : ""}
              {collection !== "all" ? " filtré(s)" : ""}
            </p>
            {collection !== "all" && (
              <Link
                to="/boutique"
                search={{}}
                className="font-medium text-accent hover:underline"
              >
                Réinitialiser les filtres
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {visibleProducts.map((product, index) => (
              <CatalogCard
                key={`${product.collection}-${product.name}-${index}`}
                product={product}
                index={index}
              />
            ))}
          </div>
          {visibleProducts.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center text-muted-foreground">
              Aucun produit ne correspond à cette collection.
            </div>
          )}
          {visibleCount < filteredProducts.length && (
            <div className="mt-12 text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Voir plus
              </Button>
            </div>
          )}
            </>
          )}
        </div>
      </section>

      {(collection === "haqqi" || collection === "scentlab") && (
      <section className="border-t border-border bg-surface-alt py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-3 text-center md:px-6">
          <p className="caption-luxe text-accent">Compose ton pack</p>
          <h2 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
            {collection === "haqqi"
              ? "Crée ton pack Haqqi ici"
              : "Crée ton pack SCENTLAB ici"}
          </h2>
          <div className="mt-5 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
            {collection === "haqqi" && (
              <Button
                asChild
                size="lg"
                className="h-auto max-w-full whitespace-normal break-words bg-accent px-6 py-3 text-center text-primary-foreground shadow-elegant ring-2 ring-accent/40 ring-offset-2 ring-offset-surface-alt animate-pulse hover:bg-accent/90"
              >
                <Link to="/coffret-signature">Pack Haqqi (3 parfums) — 10 000 FCFA</Link>
              </Button>
            )}
            {collection === "scentlab" && (
              <Button
                asChild
                size="lg"
                className="h-auto max-w-full whitespace-normal break-words bg-accent px-6 py-3 text-center text-primary-foreground shadow-elegant ring-2 ring-accent/40 ring-offset-2 ring-offset-surface-alt animate-pulse hover:bg-accent/90"
              >
                <Link to="/coffret-signature">Pack SCENTLAB (3 parfums) — 15 000 FCFA</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
      )}
    </SiteLayout>
  );
}

function FilterLink({
  active,
  search,
  label,
}: {
  active: boolean;
  search: { collection: Collection };
  label: string;
}) {
  return (
    <Link
      to="/boutique"
      search={search}
      className={
        active
          ? "snap-start whitespace-nowrap rounded-full border border-accent bg-accent px-4 py-2 text-[13px] font-semibold text-primary-foreground"
          : "snap-start whitespace-nowrap rounded-full border border-border bg-transparent px-4 py-2 text-[13px] text-muted-foreground hover:border-accent hover:text-foreground"
      }
    >
      {label}
    </Link>
  );
}

function CatalogCard({ product, index }: { product: BoutiqueProduct; index: number }) {
  const label = collectionLabel(product.collection);
  return (
    <article
      data-collection={product.collection}
      className="fade-up group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-accent"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="image-zoom relative aspect-square overflow-hidden bg-white">
        <span className="absolute left-3 top-3 z-10 rounded-full bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        {product.placeholder && (
          <span className="absolute right-3 top-3 z-10 rounded-full bg-accent-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
            À renseigner
          </span>
        )}
        <Link
          to="/boutique/$productSlug"
          params={{ productSlug: slugifyProduct(product) }}
          search={{}}
          aria-label={`Voir ${product.name}`}
          className="block h-full w-full"
        >
          <img
            src={optimizedProductImageUrl(product.image, 800)}
            alt={`${product.name} chez 2M Parfumerie`}
            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:p-5"
            loading="lazy"
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {product.collection !== "dubai" && product.collection !== "authentic" && product.ref && (
          <p className="mb-1 hidden truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:block">
            {product.ref}
          </p>
        )}
        <Link
          to="/boutique/$productSlug"
          params={{ productSlug: slugifyProduct(product) }}
          search={{}}
          className="mb-1 block line-clamp-2 font-display text-sm leading-snug text-foreground hover:text-accent sm:text-base lg:text-[17px]"
        >
          {product.name}
        </Link>
        <p className="mb-3 font-body text-sm font-semibold text-accent sm:text-base">
          {formatPrice(product.price)}
        </p>
        <div className="mt-auto">
        <AddToCartButton
          item={{
            id: slugifyProduct(product),
            name: product.name,
            collection: label,
            price: product.price,
            imageUrl: optimizedProductImageUrl(product.image, 800),
          }}
        />
        </div>
      </div>
    </article>
  );
}
