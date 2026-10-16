import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, LayoutGrid, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { CatalogueDownload } from "@/components/commerce/CatalogueDownload";
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
import { SeoText, seoMeta } from "@/components/commerce/SeoText";

function validateBoutiqueSearch(search: Record<string, unknown>): { collection?: Collection } {
  if (typeof search.collection !== "string" || !search.collection.trim()) {
    return {};
  }
  const value = normalizeCollectionValue(search.collection);
  if (value === "all") return {};
  return { collection: value };
}


const NEW_DAYS = 14;
function isNewProduct(product: BoutiqueProduct) {
  if (!product.createdAt) return false;
  return Date.now() - new Date(product.createdAt).getTime() < NEW_DAYS * 24 * 3600 * 1000;
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
      { title: seoMeta("/boutique").title },
      {
        name: "description",
        content: seoMeta("/boutique").desc,
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

  // Les nouveautés d'abord (ajoutées depuis 14 jours, les plus récentes en tête),
  // puis les meilleures ventes, puis le reste mélangé.
  const mixedProducts = useMemo(() => {
    const isNew = (p: BoutiqueProduct) => isNewProduct(p);
    const fresh = products
      .filter(isNew)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    const others = products.filter((p) => !isNew(p));
    return [
      ...fresh,
      ...mixProductsByCollection(others.filter((p) => p.isBestseller)),
      ...mixProductsByCollection(others.filter((p) => !p.isBestseller)),
    ];
  }, [products]);

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

  const collectionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) counts.set(product.collection, (counts.get(product.collection) ?? 0) + 1);
    return counts;
  }, [products]);

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
          <CategoryPicker
            filters={filters}
            active={collection}
            counts={collectionCounts}
            total={products.length}
          />
        </div>
      </section>

      <section className="bg-background py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          {isPocketShowcase && <CatalogueDownload collection="pocket" className="mb-8" />}
          {isPocketShowcase ? (
            <PocketShowcase />
          ) : (
            <>
          {collection !== "all" && <CatalogueDownload collection={collection} className="mb-8" />}
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
                <Link to="/coffret-signature" search={{ pack: "haqqi" }}>Pack Haqqi (3 parfums) — 10 000 FCFA</Link>
              </Button>
            )}
            {collection === "scentlab" && (
              <Button
                asChild
                size="lg"
                className="h-auto max-w-full whitespace-normal break-words bg-accent px-6 py-3 text-center text-primary-foreground shadow-elegant ring-2 ring-accent/40 ring-offset-2 ring-offset-surface-alt animate-pulse hover:bg-accent/90"
              >
                <Link to="/coffret-signature" search={{ pack: "scentlab" }}>Pack SCENTLAB (3 parfums) — 15 000 FCFA</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
      )}
      <SeoText path="/boutique" />
    </SiteLayout>
  );
}

// Prix affichés à côté de chaque catégorie, dans la liste mobile.
const categoryPriceHint: Record<string, string> = {
  haqqi: "Dès 4 000 F",
  scentlab: "6 000 F",
  takeoff: "25 000 F",
  pocket: "5 pour 10 000 F",
  dubai: "Dès 12 000 F",
  authentic: "Originaux",
  callisto: "75 000 F",
  privees: "Dès 25 000 F",
  coffrets: "90 000 F",
  library: "30 000 F",
};

const categoryImages = new Set(Object.keys(categoryPriceHint));

// Un bouton « Catégorie » qui ouvre la liste complète (depuis le bas de l'écran sur téléphone).
function CategoryPicker({
  filters,
  active,
  counts,
  total,
}: {
  filters: { label: string; value: Collection }[];
  active: Collection;
  counts: Map<string, number>;
  total: number;
}) {
  const [open, setOpen] = useState(false);
  const current = filters.find((filter) => filter.value === active);
  const currentCount = active === "all" ? total : (counts.get(active) ?? 0);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => setOpen(false), [active]);

  return (
    <div className="mx-auto max-w-xl">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 rounded-xl border-[1.5px] border-accent bg-card px-3 py-2.5 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <CategoryThumb value={active} />
          <span className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-accent">Catégorie</span>
            <span className="block truncate text-[15px] font-semibold text-foreground">
              {active === "all" ? "Toutes les collections" : (current?.label ?? "Catégorie")}
              {currentCount > 0 && <span className="font-normal text-muted-foreground"> · {currentCount} parfums</span>}
            </span>
          </span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-accent" aria-hidden="true" />
      </button>

      <div
        className={`fixed inset-0 z-[70] bg-black/40 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choisir une catégorie"
        className={`fixed inset-x-0 bottom-0 z-[71] max-h-[85dvh] overflow-y-auto rounded-t-2xl bg-card px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-12px_40px_rgba(0,0,0,0.25)] transition-all duration-300 ease-out md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:px-5 md:pb-4 ${open ? "translate-y-0 md:opacity-100" : "pointer-events-none translate-y-full md:scale-95 md:opacity-0"}`}
      >
        <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-border md:hidden" />
        <div className="mb-1 flex items-center justify-between">
          <p className="caption-luxe text-accent">Choisis une catégorie</p>
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer" className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-surface">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <ul>
          {filters.map((filter) => {
            const selected = filter.value === active;
            const count = filter.value === "all" ? total : (counts.get(filter.value) ?? 0);
            return (
              <li key={filter.value} className="border-b border-border/70 last:border-0">
                <Link
                  to="/boutique"
                  search={{ collection: filter.value }}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 py-2.5"
                >
                  <CategoryThumb value={filter.value} />
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[15px] font-semibold ${selected ? "text-accent" : "text-foreground"}`}>
                      {filter.value === "all" ? "Toutes les collections" : filter.label}
                    </span>
                    {count > 0 && <span className="block text-xs text-muted-foreground">{count} parfums</span>}
                  </span>
                  {categoryPriceHint[filter.value] && (
                    <span className="shrink-0 text-xs font-bold text-accent">{categoryPriceHint[filter.value]}</span>
                  )}
                  {selected && <Check className="size-5 shrink-0 text-accent" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function CategoryThumb({ value }: { value: Collection }) {
  if (categoryImages.has(value)) {
    return (
      <img
        src={`/images/categories/${value}.webp`}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        className="size-11 shrink-0 rounded-lg object-cover"
      />
    );
  }
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
      <LayoutGrid className="size-5" aria-hidden="true" />
    </span>
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
        <div className="absolute left-2 right-2 top-2 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
          <span className="max-w-full truncate rounded-full bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            {label}
          </span>
          {isNewProduct(product) && (
            <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-primary-foreground">
              Nouveau
            </span>
          )}
        </div>
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
