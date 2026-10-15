import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { GuaranteeStrip } from "@/components/commerce/Guarantee";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import {
  cleanSlug,
  catalog,
  collectionLabel,
  findProductBySlug,
  formatPrice,
  optimizedProductImageSet,
  optimizedProductImageUrl,
  productImages,
  productOrderUrl,
  slugifyProduct,
  type BoutiqueProduct,
} from "@/lib/catalog-data";
import { supabase } from "@/integrations/supabase/client";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { displayPhone } from "@/lib/perfume-data";

export const Route = createFileRoute("/boutique/$productSlug")({
  head: ({ params }) => {
    const product = findProductBySlug(params.productSlug);
    const url = `https://www.2mparfumeriedk.com/boutique/${cleanSlug(params.productSlug)}`;
    // Produits ajoutés depuis l'admin : absents du catalogue local, on part du nom dans l'adresse.
    const slugName = cleanSlug(params.productSlug)
      .split("-")
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const title = product
      ? `${product.name} – ${collectionLabel(product.collection)} | 2M Parfumerie Dakar`
      : `${slugName} | 2M Parfumerie Dakar`;
    const description = product
      ? `${product.name} par ${collectionLabel(product.collection)} : notes de ${product.notes}. ${formatPrice(product.price)}. Livraison rapide à Dakar. Commandez sur WhatsApp chez 2M Parfumerie.`
      : `${slugName} chez 2M Parfumerie. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions. Paiement Wave, Orange Money ou espèces.`;
    const rawHeadImage = product?.image ? optimizedProductImageUrl(product.image, 1200) : undefined;
    // Les balises de partage (og:, twitter:) sont écrites dans la page HTML au build.
    const image = rawHeadImage?.startsWith("/") ? `https://www.2mparfumeriedk.com${rawHeadImage}` : rawHeadImage;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
    ];
    const scripts: Array<{ type: string; children: string }> = [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.2mparfumeriedk.com/" },
            { "@type": "ListItem", position: 2, name: "Boutique", item: "https://www.2mparfumeriedk.com/boutique" },
            { "@type": "ListItem", position: 3, name: product?.name ?? "Produit", item: url },
          ],
        }),
      },
    ];
    if (product) {
      scripts.push({
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description,
          image: image,
          brand: { "@type": "Brand", name: collectionLabel(product.collection) },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "XOF",
            availability: "https://schema.org/InStock",
            url,
            seller: { "@type": "Organization", name: "2M Parfumerie" },
          },
        }),
      });
    }
    return {
      meta,
      links: [{ rel: "canonical", href: url }],
      scripts,
    };
  },
  component: ProductPage,
});

function ProductPage() {
  const { productSlug } = Route.useParams();
  const [products, setProducts] = useState<BoutiqueProduct[]>(() => catalog);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from("products").select("*");
      setProducts(mergeLiveCatalog(data ?? []));
      setLoaded(true);
    };
    void loadProducts();
  }, []);

  const wanted = cleanSlug(productSlug);
  const product = products?.find((item) => slugifyProduct(item) === wanted) ?? null;
  const navigate = useNavigate();

  // Ancienne adresse mal formée (espaces, majuscules…) : on bascule sur l'adresse propre.
  useEffect(() => {
    if (product && productSlug !== wanted) {
      void navigate({ to: "/boutique/$productSlug", params: { productSlug: wanted }, replace: true });
    }
  }, [product, productSlug, wanted, navigate]);

  // Produit ajouté depuis l'admin : on attend la base avant d'afficher « introuvable ».
  if (!product && !loaded) {
    return (
      <SiteLayout>
        <section className="section-shell py-40 text-center" aria-busy="true">
          <p className="caption-luxe text-accent">Boutique</p>
          <p className="mt-4 font-display text-2xl text-muted-foreground">Chargement du parfum…</p>
        </section>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <section className="section-shell py-40 text-center">
          <p className="caption-luxe text-accent">Boutique</p>
          <h1 className="mt-4 font-display text-4xl text-foreground">Parfum introuvable</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Cette référence n’est pas encore disponible dans la boutique en ligne.
          </p>
          <Button asChild variant="outline" size="lg" className="mt-8">
            <Link to="/boutique" search={{}}>
              Retour à la boutique
            </Link>
          </Button>
        </section>
      </SiteLayout>
    );
  }

  return (
    <>
      {!findProductBySlug(wanted) && <ProductJsonLd product={product} slug={wanted} />}
      <ProductTemplate product={product} products={products} />
    </>
  );
}

// Données « Produit » pour Google (prix, stock) quand la fiche vient de la base.
function ProductJsonLd({ product, slug }: { product: BoutiqueProduct; slug: string }) {
  const url = `https://www.2mparfumeriedk.com/boutique/${slug}`;
  const rawImage = optimizedProductImageUrl(product.image, 1200);
  const image = rawImage
    ? rawImage.startsWith("http")
      ? rawImage
      : `https://www.2mparfumeriedk.com${rawImage.startsWith("/") ? "" : "/"}${rawImage}`
    : undefined;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image,
    brand: { "@type": "Brand", name: collectionLabel(product.collection) },
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "XOF",
      availability: "https://schema.org/InStock",
      url,
      seller: { "@type": "Organization", name: "2M Parfumerie" },
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function ProductTemplate({ product, products }: { product: BoutiqueProduct; products: BoutiqueProduct[] }) {
  const label = collectionLabel(product.collection);
  const images = productImages(product);
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const currentSlug = slugifyProduct(product);
  const sameCollection = products.filter(
    (item) => item.collection === product.collection && slugifyProduct(item) !== currentSlug,
  );
  const others = products.filter(
    (item) => item.collection !== product.collection && slugifyProduct(item) !== currentSlug,
  );
  const similar = [...sameCollection, ...others].slice(0, 4);

  useEffect(() => {
    setSelectedImage(images[0]);
  }, [images[0]]);

  return (
    <SiteLayout>
      <section className="bg-background pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="section-shell grid gap-8 md:grid-cols-2 md:gap-16">
          <div className="order-1 flex flex-col gap-4 md:flex-row md:items-start">
            {images.length > 1 && (
              <div className="order-2 grid grid-cols-5 gap-3 md:order-1 md:w-20 md:flex-none md:grid-cols-1">
                {images.map((image, index) => {
                  const isSelected = image === selectedImage;
                  return (
                    <button
                      key={image}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`group relative aspect-square overflow-hidden rounded-md border bg-surface p-1.5 transition-all hover:border-accent ${
                        isSelected ? "border-accent shadow-card" : "border-border"
                      }`}
                      aria-label={`Afficher la photo ${index + 1} de ${product.name}`}
                    >
                      {(() => {
                        const sources = optimizedProductImageSet(image);
                        const fallback = optimizedProductImageUrl(image, 400);
                        return (
                          <picture>
                            <source type="image/avif" srcSet={sources.avif} sizes="80px" />
                            <source type="image/webp" srcSet={sources.webp} sizes="80px" />
                            <img
                              src={fallback}
                              alt={`${product.name} vue ${index + 1}`}
                              className="h-full w-full object-contain"
                              loading="lazy"
                              width={80}
                              height={80}
                              decoding="async"
                            />
                          </picture>
                        );
                      })()}
                      {!isSelected && (
                        <span className="pointer-events-none absolute inset-0 bg-background/55 opacity-0 transition-opacity group-hover:opacity-100" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="order-1 mx-auto flex aspect-square w-full max-w-lg items-center justify-center overflow-hidden rounded-xl bg-surface p-5 shadow-card md:order-2 md:p-8">
              {(() => {
                const sources = optimizedProductImageSet(selectedImage);
                const fallback = optimizedProductImageUrl(selectedImage, 1200);
                return (
                  <picture>
                    <source type="image/avif" srcSet={sources.avif} sizes="(min-width: 1024px) 600px, 90vw" />
                    <source type="image/webp" srcSet={sources.webp} sizes="(min-width: 1024px) 600px, 90vw" />
                    <img
                      src={fallback}
                      alt={`${product.name} chez 2M Parfumerie`}
                      className="h-full w-full rounded-lg object-contain"
                      width={1200}
                      height={1200}
                      decoding="async"
                    />
                  </picture>
                );
              })()}
            </div>
          </div>

          <aside className="order-2 md:sticky md:top-24 md:self-start">
            <span className="caption-luxe mb-4 inline-block rounded-full bg-accent-muted px-3 py-1 text-accent">
              {label}
            </span>
            <h1 className="font-display text-4xl font-medium leading-tight text-foreground md:text-5xl">
              {product.name}
            </h1>
            {product.collection !== "dubai" && product.collection !== "authentic" && product.ref && (
              <p className="mt-3 text-sm italic text-muted-foreground">
                Inspiré de {product.ref}
                {product.inspiration ? ` · ${product.inspiration}` : ""}
              </p>
            )}
            <p className="mt-6 font-body text-[32px] font-bold text-accent">
              {formatPrice(product.price)}
            </p>
            <p className="mt-2 text-[13px] text-whatsapp">
              ✓ En stock — Livraison rapide à Dakar, 24 à 48h en régions
            </p>

            <div className="mt-8 space-y-2">
              <AddToCartButton
                item={{
                  id: slugifyProduct(product),
                  name: product.name,
                  collection: label,
                  price: product.price,
                  imageUrl: optimizedProductImageUrl(product.image, 1200),
                }}
              />
              <Button asChild variant="whatsapp" size="lg" className="w-full">
                <a href={productOrderUrl(product)} target="_blank" rel="noopener noreferrer">
                  <WhatsAppLogo tone="light" className="size-5" /> Commander sur WhatsApp
                </a>
              </Button>
            </div>
            <a
              href="tel:+221761923441"
              className="mt-3 flex min-h-11 items-center justify-center gap-2 text-center text-[13px] text-muted-foreground hover:text-accent"
            >
              <Phone className="size-4" aria-hidden="true" /> Ou appeler : {displayPhone}
            </a>
            <p className="mt-1 text-center text-[12px] text-muted-foreground">
              Paiement Wave, Orange Money ou espèces · Livraison offerte dès 75 000 FCFA
            </p>
            <GuaranteeStrip />

            <div className="my-8 h-px bg-border" />
            <div>
              <h2 className="mb-4 font-display text-xl text-foreground">Composition</h2>
              {[
                ["🌸", "Notes de tête", product.headNotes],
                ["💐", "Notes de cœur", product.heartNotes],
                ["🌿", "Notes de fond", product.baseNotes],
              ]
                .filter(([, , notes]) => notes && !/notes à préciser/i.test(notes))
                .map(([icon, title, notes]) => (
                <div
                  key={title}
                  className="flex gap-3 border-b border-border py-2 text-sm text-muted-foreground last:border-0"
                >
                  <span aria-hidden="true">{icon}</span>
                  <p>
                    <strong className="text-foreground">{title}:</strong> {notes}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 min-[380px]:grid-cols-3">
              {[
                ["Contenance", product.volume],
                ["Concentration", product.concentration],
                ["Famille", product.family],
              ].map(([title, value]) => (
                <div key={title} className="rounded-md bg-surface p-4 text-center">
                  <p className="caption-luxe text-muted-foreground">{title}</p>
                  <p className="mt-2 text-xs text-foreground">{value}</p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-surface-alt py-12 md:py-16">
        <div className="section-shell mx-auto max-w-3xl">
          <h2 className="mb-6 font-display text-[32px] text-foreground md:text-5xl">
            À propos de ce parfum
          </h2>
          <p className="text-base leading-[1.9] text-muted-foreground">{product.description}</p>
        </div>
      </section>

      {similar.length > 0 && (
      <section className="bg-background py-16 md:py-20">
        <div className="section-shell">
          <h2 className="mb-12 text-center font-display text-[32px] text-foreground md:text-5xl">
            Vous aimerez aussi
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {similar.map((item) => (
              <SimilarCard key={slugifyProduct(item)} product={item} />
            ))}
          </div>
        </div>
      </section>
      )}
    </SiteLayout>
  );
}

function SimilarCard({ product }: { product: BoutiqueProduct }) {
  const label = collectionLabel(product.collection);
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-accent">
      <Link
        to="/boutique/$productSlug"
        params={{ productSlug: slugifyProduct(product) }}
        search={{}}
        className="image-zoom block aspect-square overflow-hidden bg-surface"
      >
        {(() => {
          const sources = optimizedProductImageSet(product.image);
          const fallback = optimizedProductImageUrl(product.image, 800);
          return (
            <picture>
              <source type="image/avif" srcSet={sources.avif} sizes="(min-width: 1024px) 25vw, 50vw" />
              <source type="image/webp" srcSet={sources.webp} sizes="(min-width: 1024px) 25vw, 50vw" />
              <img
                src={fallback}
                alt={`${product.name} chez 2M Parfumerie`}
                className="h-full w-full object-contain p-2 transition-transform duration-500 hover:scale-105 sm:p-5"
                loading="lazy"
                width={800}
                height={800}
                decoding="async"
              />
            </picture>
          );
        })()}
      </Link>
      <div className="p-3 sm:p-5">
        {product.collection !== "dubai" && product.collection !== "authentic" && product.ref && (
          <p className="mb-1 hidden text-[11px] uppercase tracking-[0.1em] text-muted-foreground sm:block">
            {product.ref}
          </p>
        )}
        <Link
          to="/boutique/$productSlug"
          params={{ productSlug: slugifyProduct(product) }}
          search={{}}
          className="line-clamp-2 font-display text-sm text-foreground hover:text-accent sm:text-[22px]"
        >
          {product.name}
        </Link>
        <p className="mt-2 font-body text-base font-semibold text-accent sm:mt-4 sm:text-xl">
          {formatPrice(product.price)}
        </p>
        <div className="mt-4">
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
