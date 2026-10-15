import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Check, Handshake, ShieldCheck, Truck } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
const Ticker = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.Ticker })));
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import homeHeroBottle from "@/assets/home-white-bottle.webp";
import {
  catalog,
  collectionLabel,
  formatPrice,
  slugifyProduct,
  type BoutiqueProduct,
} from "@/lib/catalog-data";
import { supabase } from "@/integrations/supabase/client";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { whatsappUrl } from "@/lib/perfume-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "2M Parfumerie Dakar | Parfums authentiques livrés à Dakar" },
      {
        name: "description",
        content:
          "2M Parfumerie — parfums de qualité au Sénégal. Collections : Haqqi, Scentlab, Takeoff Fragance, Dubai, Parfums de poches.",
      },
      { name: "ai:summary", content: "2M Parfumerie vend des parfums de qualité (Haqqi, Scentlab, Takeoff), livraison au Sénégal." },
      { name: "keywords", content: "Haqqi, Scentlab, Takeoff Fragance, Parfums authentique, Parfums Dubai, Parfums de poches, Collections privées, Fragance Library" },
      { property: "og:title", content: "2M Parfumerie Dakar | Parfums authentiques livrés à Dakar" },
      {
        property: "og:description",
        content:
          "Achetez des parfums authentiques de luxe à Dakar. Livraison partout au Sénégal, commande finalisée directement avec le gérant.",
      },
      { property: "og:url", content: "https://www.2mparfumeriedk.com/" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:image", content: "https://www.2mparfumeriedk.com/assets/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "2M Parfumerie",
          description:
            "2M Parfumerie est spécialisée dans la vente de parfums de qualité et propose une sélection variée de fragrances inspirées des grandes maisons, adaptées à tous les styles et à toutes les occasions. Nous vendons les parfums et collections suivants : Haqqi, Scentlab, Takeoff Fragance, Parfums authentique, Parfums Dubai, Parfums de poches, Collections privées, Fragance Library",
          url: "https://www.2mparfumeriedk.com",
          telephone: "+221761923441",
          email: "2mparfumerie2025@gmail.com",
          keywords: "Haqqi, Scentlab, Takeoff Fragance, Parfums authentique, Parfums Dubai, Parfums de poches, Collections privées, Fragance Library",
          address: {
            "@type": "PostalAddress",
            addressCountry: "SN",
            addressLocality: "Dakar",
          },
          priceRange: "$$",
          sameAs: [
            "https://instagram.com/2mparfumeriesn",
            "https://www.facebook.com/profile.php?id=61551806734713",
          ],
        }),
      },
    ],
  }),
  component: Index,
});

const heroMessage =
  "Bonjour 2M Parfumerie 👋 Je souhaite découvrir vos collections. Pouvez-vous m'aider ?";
const finalMessage = "Bonjour 2M Parfumerie 👋 Je cherche un parfum. Pouvez-vous m'aider ?";

const featuredPackCards = [
  { title: "Pack Haqqi", subtitle: "3 parfums", price: "10 000 FCFA", imageBase: "haqqi-collection" },
  { title: "Pack SCENTLAB", subtitle: "3 parfums", price: "15 000 FCFA", imageBase: "scentlab-boxes" },
  {
    title: "Parfums de poches",
    subtitle: "5 parfums",
    price: "10 000 FCFA",
    imageBase: "pocket-perfumes-homme",
  },
] as const;

function currentWeekNumber(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((utcDate.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
}

function pickFeaturedProducts(products: BoutiqueProduct[], weekNumber = currentWeekNumber()) {
  const featuredCollections: BoutiqueProduct["collection"][] = [
    "takeoff",
    "scentlab",
    "dubai",
    "authentic",
  ];

  return featuredCollections
    .map((collection, collectionIndex) => {
      const collectionProducts = products
        .filter((product) => product.collection === collection)
        // Temporaire: image Vanilla Dream cassée côté base, à retirer une fois corrigée
        .filter((product) => product.name !== "Vanilla Dream")
        .sort((a, b) => a.name.localeCompare(b.name, "fr"));

      if (collectionProducts.length === 0) return undefined;

      const weeklyIndex = (weekNumber + collectionIndex * 7) % collectionProducts.length;
      return collectionProducts[weeklyIndex];
    })
    .filter((product): product is BoutiqueProduct => Boolean(product));
}

const fallbackFeaturedProducts = pickFeaturedProducts(catalog);

const promises = [
  {
    icon: WhatsAppLogo,
    title: "Réponse en moins d'1h",
    body: "Notre équipe WhatsApp est disponible 7j/7 pour vous aider à trouver votre fragrance.",
  },
  {
    icon: ShieldCheck,
    title: "Authenticité certifiée",
    body: "Chaque flacon est contrôlé avant envoi. Zéro contrefaçon, zéro compromis.",
  },
  {
    icon: Truck,
    title: "Livraison Sénégal",
    body: "Partout au Sénégal. Commandez avant 21h, nous confirmons le meilleur délai selon votre zone.",
  },
  {
    icon: Handshake,
    title: "Accord avec le gérant",
    body: "La commande se finalise directement avec le gérant. Paiement Wave, Orange Money ou espèces.",
  },
];

type ReviewMessage = { from: "shop" | "client"; text: string; time: string };

// Vrais messages reçus sur WhatsApp, recopiés mot pour mot.
// Noms réduits au prénom ou aux initiales, numéros et photos retirés.
const testimonials: { id: string; name: string; initials: string; messages: ReviewMessage[] }[] = [
  {
    id: "r",
    name: "R.",
    initials: "R",
    messages: [{ from: "client", text: "Bien reçu 🫡 et satisfait comme d'habitude ✅✅✅", time: "18:16" }],
  },
  {
    id: "philippe",
    name: "Philippe",
    initials: "P",
    messages: [
      {
        from: "client",
        text: "Merci, bien réceptionné et satisfait. Je peux avoir une liste des parfums femmes à votre disposition ?",
        time: "20:33",
      },
    ],
  },
  {
    id: "client-tres-bon",
    name: "Client",
    initials: "2M",
    messages: [
      { from: "client", text: "Merci Mr le parfum est tres bon", time: "20:54" },
      { from: "client", text: "Vrmt merci mr vous avez tout fait pour que votre client soit satisfait", time: "20:55" },
    ],
  },
  {
    id: "client-bon-parfum",
    name: "Client",
    initials: "2M",
    messages: [
      { from: "shop", text: "Satisfait ?", time: "17:21" },
      { from: "client", text: "Ouii ouii c'est un bon parfum ma cha ALLÂH", time: "17:24" },
    ],
  },
  {
    id: "a",
    name: "A.",
    initials: "A",
    messages: [{ from: "client", text: "Client satisfait 🤝🤝", time: "23:48" }],
  },
  {
    id: "satisfaite",
    name: "Cliente",
    initials: "2M",
    messages: [{ from: "client", text: "Je suis satisfaite", time: "14:38" }],
  },
];

function Index() {
  const [featuredProducts, setFeaturedProducts] =
    useState<BoutiqueProduct[]>(fallbackFeaturedProducts);

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      const { data } = await supabase.from("products").select("*");
      const liveProducts = mergeLiveCatalog(data ?? []);
      setFeaturedProducts(pickFeaturedProducts(liveProducts));
    };
    void loadFeaturedProducts();
  }, []);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden bg-background pt-20 md:h-screen md:min-h-[560px] md:pt-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.36_0.096_160/0.08),transparent_36%),radial-gradient(circle_at_bottom_left,oklch(0.87_0.045_160/0.05),transparent_40%)]" />
        <div className="grid items-center relative z-10 md:h-full md:grid-cols-[55fr_45fr]">
          <div className="section-shell z-10 order-1 py-4 md:w-auto md:py-6 md:pl-[max(2rem,calc((100vw-1180px)/2))] md:pr-10">
            <div className="max-w-2xl">
              <h1
                className="fade-up font-display text-4xl font-semibold leading-[1.1] text-foreground md:text-5xl lg:text-6xl"
                style={{ animationDelay: "120ms" }}
              >
                Parfums authentiques à Dakar | 2M Parfumerie
              </h1>
              <p
                className="fade-up mt-4 text-lg text-muted-foreground md:text-xl"
                style={{ animationDelay: "240ms" }}
              >
                Livraison partout au Sénégal
              </p>
              <div
                className="fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
                style={{ animationDelay: "360ms" }}
              >
                <Button asChild variant="whatsapp" size="lg">
                  <a href={whatsappUrl(heroMessage)} target="_blank" rel="noopener noreferrer">
                    <WhatsAppLogo tone="light" className="size-5" /> Commander sur WhatsApp
                  </a>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/boutique" search={{}}>
                    Visiter la boutique
                  </Link>
                </Button>
              </div>
              <div
                className="fade-up mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground"
                style={{ animationDelay: "480ms" }}
              >
                {["Livraison Sénégal", "Authenticité garantie", "Commande avec le gérant"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-1">
                      <Check className="size-3 text-accent" aria-hidden="true" /> {item}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
            <div className="relative order-2 h-[38vh] min-h-[260px] overflow-hidden bg-surface-alt md:h-full md:min-h-0">
              <video
                src="/videos/authentic.mp4"
                poster="/videos/authentic-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Ticker />
      </Suspense>

      <section className="relative border-t-4 border-accent/20 bg-background py-16 md:py-24">
        <div className="section-shell text-center">
          <HomeHeader
            title="Nos parfums du moment"
            subtitle="Quelques de nos best sellers, choisis pour vous !"
          />
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 text-left sm:gap-6 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <article
                key={product.name}
                className="fade-up group overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-accent"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Link
                  to="/boutique/$productSlug"
                  params={{ productSlug: slugifyProduct(product) }}
                  search={{}}
                  aria-label={`Voir la fiche produit de ${product.name}`}
                  className="image-zoom relative block aspect-square overflow-hidden bg-surface"
                >
                  <img
                    src={product.image}
                    alt={`${product.name} TAKEOFF Fragrance chez 2M Parfumerie`}
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 sm:p-5"
                    loading="lazy"
                  />
                </Link>
                <div className="p-3 sm:p-5">
                  <p className="mb-1 hidden text-[11px] uppercase tracking-[0.1em] text-muted-foreground sm:block">
                    {product.ref}
                  </p>
                  <h3 className="mb-1 line-clamp-2 font-display text-sm text-foreground sm:text-[22px]">
                    {product.name}
                  </h3>
                  <p className="mb-2 font-body text-base font-semibold text-accent sm:mb-4 sm:text-xl">
                    {formatPrice(product.price)}
                  </p>
                  <AddToCartButton
                    item={{
                      id: slugifyProduct(product),
                      name: product.name,
                      collection: collectionLabel(product.collection),
                      price: product.price,
                      imageUrl: product.image,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
          <Button asChild variant="outline" size="lg" className="mt-12">
            <Link to="/boutique" search={{}}>
              Voir toute la sélection
            </Link>
          </Button>
        </div>
      </section>

      <section className="relative border-t-4 border-accent/20 bg-surface-alt py-16 md:py-24">
        <div className="section-shell text-center">
          <p className="caption-luxe text-accent">Compose ton pack</p>
          <h2 className="mt-4 font-display text-[32px] font-medium text-foreground md:text-5xl">
            Crée ton coffret sur-mesure
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Choisis tes parfums dans la collection de ton choix — on s'occupe du reste.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-accent">
            <ArrowDown className="size-5 animate-bounce" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase tracking-[0.18em]">
              Clique sur l’un des packs
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {featuredPackCards.map((pack) => (
              <article
                key={pack.title}
                className="group mx-auto flex h-full w-full max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent"
              >
                <div className="relative h-40 overflow-hidden bg-surface md:h-44">
                  <picture>
                    <source
                      type="image/avif"
                      srcSet={`/images/optimized/${pack.imageBase}-w800.avif 800w, /images/optimized/${pack.imageBase}-w1200.avif 1200w`}
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                    <source
                      type="image/webp"
                      srcSet={`/images/optimized/${pack.imageBase}-w800.webp 800w, /images/optimized/${pack.imageBase}-w1200.webp 1200w`}
                      sizes="(min-width: 768px) 33vw, 100vw"
                    />
                    <img
                      src={`/images/optimized/${pack.imageBase}-w800.webp`}
                      alt={pack.title}
                      loading="lazy"
                      width={800}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </picture>
                  <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-accent shadow-sm backdrop-blur">
                    Pack
                  </div>
                </div>
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h3 className="font-display text-2xl leading-tight text-foreground">
                      {pack.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{pack.subtitle}</p>
                    <p className="mt-1 font-body text-lg font-semibold text-accent">{pack.price}</p>
                  </div>
                  <div className="mt-auto">
                    <Button
                      asChild
                      size="lg"
                      className="h-auto w-full justify-center rounded-full bg-accent px-5 py-3 text-primary-foreground shadow-elegant ring-2 ring-accent/40 ring-offset-2 ring-offset-surface-alt hover:bg-accent/90"
                    >
                      <Link to="/coffret-signature">Choisir ce pack</Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t-4 border-accent/20 bg-background py-16 md:py-24">
        <div className="section-shell">
          <div className="fade-up mb-10 max-w-2xl">
            <p className="caption-luxe mb-3 text-accent">Avis clients</p>
            <h2 className="font-display text-[32px] font-medium leading-[1.15] text-foreground md:text-5xl">
              Ils nous ont écrit sur WhatsApp
            </h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Messages reçus après livraison, recopiés tels quels et publiés avec l'accord de nos
              clients. Numéros et photos retirés.
            </p>
          </div>
          <div className="flex snap-x gap-5 overflow-x-auto pb-4 md:grid md:grid-cols-3 md:overflow-visible">
            {testimonials.map((item, index) => (
              <article
                key={item.id}
                className="fade-up flex min-w-[86%] snap-center flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all hover:border-accent-hover hover:shadow-green md:min-w-0"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <header className="flex items-center gap-3 bg-[#075E54] px-4 py-3 text-white">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold">
                    {item.initials}
                  </span>
                  <span className="min-w-0">
                    <strong className="block truncate text-sm font-semibold">{item.name}</strong>
                    <small className="text-xs text-white/75">Client 2M Parfumerie</small>
                  </span>
                  <WhatsAppLogo tone="light" className="ml-auto size-5 opacity-90" />
                </header>
                <div className="flex flex-1 flex-col justify-end gap-2 bg-[#ECE5DD] px-3 py-5">
                  {item.messages.map((m, i) => (
                    <p
                      key={i}
                      className={
                        "max-w-[88%] rounded-lg px-3 py-2 text-[15px] leading-snug text-[#111b21] shadow-sm " +
                        (m.from === "shop"
                          ? "self-end rounded-tr-none bg-[#D9FDD3]"
                          : "self-start rounded-tl-none bg-white")
                      }
                    >
                      {m.text}
                      <span className="ml-2 inline-block translate-y-1 text-[11px] text-[#667781]">
                        {m.time}
                      </span>
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t-4 border-accent/20 final-cta-bg border-t border-border py-16 md:py-20">
        <div className="section-shell mx-auto max-w-2xl text-center">
          <p className="caption-luxe mb-4 text-accent">Trouvez votre signature</p>
          <h2 className="font-display text-[32px] leading-[1.2] text-foreground md:text-5xl">
            Pas sûr de votre choix ? 4 questions suffisent.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Le quiz vous propose 3 parfums selon votre style, votre budget et le moment. Ou écrivez-nous
            directement, on s'occupe du reste.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="min-h-14 px-10 text-[15px]">
              <Link to="/trouve-ton-parfum">Faire le quiz</Link>
            </Button>
            <Button asChild variant="whatsapp" size="lg" className="min-h-14 px-10 text-[15px]">
              <a href={whatsappUrl(finalMessage)} target="_blank" rel="noopener noreferrer">
                <WhatsAppLogo tone="light" className="size-5" /> Démarrer sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="relative border-t-4 border-accent/20 bg-background py-16 md:py-24">
        <div className="section-shell grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-12">
          <div className="fade-up">
            <h2 className="font-display text-[32px] font-medium text-foreground md:text-5xl">
              Notre Promesse
            </h2>
            <p className="mt-6 max-w-sm text-muted-foreground">
              Chez 2M Parfumerie, chaque commande est une rencontre entre votre identité et le
              parfum parfait. Nous ne vendons pas des flacons — nous livrons des émotions.
            </p>
            <Button asChild variant="outline" size="lg" className="mt-8">
              <Link to="/contact">Nous contacter</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {promises.map(({ icon: Icon, title, body }, index) => (
              <article
                key={title}
                className="fade-up rounded-lg border border-border bg-surface p-6 transition-all hover:border-accent hover:shadow-green"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Icon className="mb-6 size-8 text-accent drop-shadow-md" aria-hidden="true" />
                <h3 className="font-display text-2xl text-foreground">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

    </SiteLayout>
  );
}

function HomeHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-16 text-center">
      <h2 className="font-display text-[32px] font-medium text-foreground md:text-5xl">{title}</h2>
      <p className="mt-4 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
