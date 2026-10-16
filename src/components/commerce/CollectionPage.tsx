import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { CatalogueDownload } from "@/components/commerce/CatalogueDownload";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { SeoText } from "@/components/commerce/SeoText";
import {
  collectionLabel,
  formatPrice,
  optimizedProductImageSet,
  optimizedProductImageUrl,
  slugifyProduct,
  type BoutiqueProduct,
  type Collection,
} from "@/lib/catalog-data";
import { supabase } from "@/integrations/supabase/client";
import { mergeLiveCatalog } from "@/lib/live-catalog";

export type CollectionPageProps = {
  collection: Collection;
  h1: string;
  eyebrow: string;
  intro: string;
  ctaLabel?: string;
  ctaHref?: "/coffret-signature";
  ctaPack?: "haqqi" | "scentlab" | "pocket";
  heroImage?: string;
  heroImageAlt?: string;
  children?: React.ReactNode;
};

export function CollectionPage({
  collection,
  h1,
  eyebrow,
  intro,
  ctaLabel,
  ctaHref,
  ctaPack,
  heroImage,
  heroImageAlt,
  children,
}: CollectionPageProps) {
  const [products, setProducts] = useState<BoutiqueProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(25);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("products").select("*");
      setProducts(mergeLiveCatalog(data ?? []));
      setLoaded(true);
    })();
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.collection === collection),
    [products, collection],
  );
  const visible = filtered.slice(0, visibleCount);
  const label = collectionLabel(collection);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface pt-24 pb-10 md:pt-32 md:pb-14">
        {heroImage ? (
          <div className="section-shell grid gap-10 md:grid-cols-[55fr_45fr] md:items-center md:gap-12">
            <div className="fade-up text-center md:text-left">
              <p className="caption-luxe text-accent">{eyebrow}</p>
              <h1 className="mt-4 font-display text-3xl font-semibold text-foreground md:text-5xl">
                {h1}
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-muted-foreground md:mx-0">{intro}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                <Button asChild variant="outline">
                  <Link to="/boutique" search={{}}>
                    Voir toute la boutique
                  </Link>
                </Button>
                {ctaLabel && ctaHref && (
                  <Button asChild className="bg-accent text-primary-foreground hover:bg-accent/90">
                    <Link to={ctaHref} search={ctaPack ? { pack: ctaPack } : {}}>{ctaLabel}</Link>
                  </Button>
                )}
              </div>
            </div>
            <div className="fade-up mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-white shadow-card md:max-w-none">
              <img
                src={heroImage}
                alt={heroImageAlt ?? h1}
                className="h-full w-full object-contain p-4"
                loading="eager"
              />
            </div>
          </div>
        ) : (
          <div className="section-shell text-center">
            <p className="caption-luxe text-accent">{eyebrow}</p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-foreground md:text-5xl">
              {h1}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-left text-muted-foreground md:text-center">
              {intro}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline">
                <Link to="/boutique" search={{}}>
                  Voir toute la boutique
                </Link>
              </Button>
              {ctaLabel && ctaHref && (
                <Button asChild className="bg-accent text-primary-foreground hover:bg-accent/90">
                  <Link to={ctaHref} search={ctaPack ? { pack: ctaPack } : {}}>{ctaLabel}</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="bg-background py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          <CatalogueDownload collection={collection} className="mb-8" />
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} parfum{filtered.length > 1 ? "s" : ""} {label}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {visible.map((product, index) => (
              <article
                key={`${product.name}-${index}`}
                className="fade-up group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-accent"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="relative aspect-square overflow-hidden bg-white">
                  <Link
                    to="/boutique/$productSlug"
                    params={{ productSlug: slugifyProduct(product) }}
                    search={{}}
                    aria-label={`Voir ${product.name}`}
                    className="block h-full w-full"
                  >
                    {(() => {
                      const sources = optimizedProductImageSet(product.image);
                      const fallback = optimizedProductImageUrl(product.image, 800);
                      return (
                        <picture>
                          <source
                            type="image/avif"
                            srcSet={sources.avif}
                            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                          />
                          <source
                            type="image/webp"
                            srcSet={sources.webp}
                            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                          />
                          <img
                            src={fallback}
                            alt={`${product.name} — ${label} chez 2M Parfumerie`}
                            className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:p-5"
                            loading="lazy"
                            width={800}
                            height={800}
                            decoding="async"
                          />
                        </picture>
                      );
                    })()}
                  </Link>
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
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
            ))}
          </div>
          {visible.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center text-muted-foreground">
              {loaded ? "Les parfums de cette collection arrivent bientôt. Écrivez-nous sur WhatsApp." : "Catalogue en cours de chargement…"}
            </div>
          )}
          {visibleCount < filtered.length && (
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" onClick={() => setVisibleCount((c) => c + 25)}>
                Voir plus
              </Button>
            </div>
          )}
        </div>
      </section>

      {children}
      <SeoText />
    </SiteLayout>
  );
}
