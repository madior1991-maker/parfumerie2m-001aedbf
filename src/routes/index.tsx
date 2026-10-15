import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Check, Handshake, ShieldCheck, Truck } from "lucide-react";
import React, { Suspense, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/commerce/AddToCartButton";
const Ticker = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.Ticker })));
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import homeHeroBottle from "@/assets/home-white-bottle.webp";
import takeoffParisImage from "@/assets/takeoff-paris.webp";
import {
  catalog,
  collectionLabel,
  formatPrice,
  optimizedProductImageUrl,
  slugifyProduct,
  type BoutiqueProduct,
} from "@/lib/catalog-data";
import { supabase } from "@/integrations/supabase/client";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { whatsappUrl } from "@/lib/perfume-data";

export const Route = createFileRoute("/")({
  head: () => ({
    // Les balises de partage (og:, twitter:) sont dans index.html, une seule fois.
    meta: [
      { title: "2M Parfumerie Dakar | Parfums dès 4 000 F, livrés partout au Sénégal" },
      {
        name: "description",
        content:
          "Parfums à Dakar dès 4 000 F : Haqqi, SCENTLAB, Takeoff, Dubai Perfumes et parfums authentiques. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions. Paiement Wave, Orange Money ou espèces.",
      },
      { name: "ai:summary", content: "2M Parfumerie vend des parfums à Dakar (Haqqi, SCENTLAB, Takeoff, Dubai Perfumes, parfums authentiques), livraison partout au Sénégal." },
      { name: "keywords", content: "Haqqi, Scentlab, Takeoff Fragance, Parfums authentique, Parfums Dubai, Parfums de poches, Collections privées, Fragance Library" },
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

const heroPrices = [
  { label: "Haqqi", price: "dès 4 000 F", to: "/collections/haqqi" },
  { label: "SCENTLAB", price: "6 000 F", to: "/collections/scentlab" },
  { label: "Takeoff", price: "25 000 F", to: "/collections/takeoff" },
] as const;

const homeCollections = [
  { name: "Haqqi", price: "Dès 4 000 F", note: "Pack de 3 à 10 000 F", image: "/images/home/tuile-haqqi.webp", to: "/collections/haqqi" },
  { name: "SCENTLAB", price: "6 000 F", note: "Pack de 3 à 15 000 F", image: "/images/optimized/scentlab-boxes-w800.webp", to: "/collections/scentlab" },
  { name: "Takeoff", price: "25 000 F", note: "Les 2 à 50 000 F", image: takeoffParisImage, to: "/collections/takeoff" },
  { name: "Dubai Perfumes", price: "Dès 20 000 F", note: "Parfums orientaux", image: "/images/home/tuile-dubai.webp", to: "/boutique", collection: "dubai" },
  { name: "Parfums de poche", price: "Pack de 5", note: "10 000 F", image: "/images/optimized/pocket-perfumes-homme-w800.webp", to: "/collections/parfums-de-poches" },
  { name: "Parfums authentiques", price: "Originaux", note: "Grandes maisons", image: "/videos/authentic-poster.jpg", to: "/boutique", collection: "authentic" },
] as const;

const featuredPackCards = [
  { title: "Pack Haqqi", subtitle: "3 parfums", price: "10 000 FCFA", imageBase: "haqqi-collection" },
  { title: "Pack SCENTLAB", subtitle: "3 parfums", price: "15 000 FCFA", imageBase: "scentlab-boxes" },
  {
    title: "Parfums de poche",
    subtitle: "5 parfums",
    price: "10 000 FCFA",
    imageBase: "pocket-perfumes-homme",
  },
] as const;


// Tirage renouvelé tous les 3 jours : un parfum de chaque collection.
const FEATURED_COLLECTIONS: BoutiqueProduct["collection"][] = [
  "authentic",
  "coffrets",
  "dubai",
  "scentlab",
  "haqqi",
  "takeoff",
];

function currentPeriod(date = new Date(), days = 3) {
  return Math.floor(date.getTime() / 86_400_000 / days);
}

function pickFeaturedProducts(products: BoutiqueProduct[], period = currentPeriod()) {
  return FEATURED_COLLECTIONS.map((collection, collectionIndex) => {
    const available = products
      .filter((product) => product.collection === collection)
      // Uniquement les parfums disponibles avec un prix
      .filter((product) => product.price > 0)
      // Temporaire: image Vanilla Dream cassée côté base, à retirer une fois corrigée
      .filter((product) => product.name !== "Vanilla Dream")
      .sort((a, b) => a.name.localeCompare(b.name, "fr"));
    if (available.length === 0) return undefined;
    return available[(period + collectionIndex * 7) % available.length];
  }).filter((product): product is BoutiqueProduct => Boolean(product));
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
    title: "Qualité contrôlée",
    body: "Chaque flacon est vérifié avant envoi. Nos parfums authentiques sont des originaux ; nos créations inspirées le disent clairement.",
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
                Ton parfum dès 4 000 F, livré partout au Sénégal
              </h1>
              <p
                className="fade-up mt-4 text-lg text-muted-foreground md:text-xl"
                style={{ animationDelay: "240ms" }}
              >
                Haqqi, SCENTLAB, Takeoff, Dubai Perfumes et parfums authentiques. Tu choisis, on te
                livre.
              </p>
              <div
                className="fade-up mt-6 flex flex-wrap gap-2"
                style={{ animationDelay: "300ms" }}
              >
                {heroPrices.map((item) => (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="inline-flex items-baseline gap-2 whitespace-nowrap rounded-full border border-accent/40 bg-surface px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:bg-accent/10"
                  >
                    <span className="font-semibold">{item.label}</span>
                    <span className="font-semibold text-accent">{item.price}</span>
                  </Link>
                ))}
              </div>
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
                {["Livraison rapide à Dakar, 24 à 48h en régions", "Wave · Orange Money · espèces", "Commande avec le gérant"].map(
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
                src="/videos/haqqi-collection.mp4"
                poster="/videos/haqqi-collection-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="h-full w-full object-cover object-[50%_40%]"
              />
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <Ticker />
      </Suspense>

      <section className="band-maison relative py-14 md:py-20">
        <div className="section-shell">
          <div className="fade-up mb-8 text-center">
            <p className="caption-luxe mb-3 text-accent">Nos collections</p>
            <h2 className="font-display text-[32px] font-medium text-foreground md:text-5xl">
              Un parfum pour chaque budget
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              Haqqi, SCENTLAB et Takeoff sont nos créations inspirées des grands parfums. Nos
              parfums authentiques sont les originaux des grandes maisons.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-6">
            {homeCollections.map((item, index) => (
              <Link
                key={item.name}
                to={item.to}
                search={"collection" in item ? { collection: item.collection } : {}}
                className="fade-up group overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <div className="aspect-[4/5] overflow-hidden bg-surface">
                  <img
                    src={item.image}
                    alt={`Collection ${item.name}, 2M Parfumerie`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-display text-lg leading-tight text-foreground sm:text-xl">{item.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-accent">{item.price}</p>
                  <p className="text-xs text-muted-foreground">{item.note}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="relative border-t-4 border-accent/20 bg-background py-16 md:py-24">
        <div className="section-shell text-center">
          <HomeHeader
            title="Nos parfums du moment"
            subtitle="Nos coups de cœur, piochés dans chaque collection."
          />
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 text-left sm:gap-5 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {featuredProducts.map((product, index) => (
              <article
                key={product.name}
                className="fade-up group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1.5 hover:border-accent"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Link
                  to="/boutique/$productSlug"
                  params={{ productSlug: slugifyProduct(product) }}
                  search={{}}
                  aria-label={`Voir la fiche produit de ${product.name}`}
                  className="image-zoom relative block aspect-square overflow-hidden bg-white"
                >
                  <img
                    src={optimizedProductImageUrl(product.image, 800)}
                    alt={`${product.name}, ${collectionLabel(product.collection)}, chez 2M Parfumerie`}
                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105 sm:p-4 lg:p-3"
                    loading="lazy"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <p className="mb-1 truncate text-[10px] uppercase tracking-[0.1em] text-muted-foreground sm:text-[11px]">
                    {collectionLabel(product.collection)}
                  </p>
                  <h3 className="mb-1 line-clamp-2 min-h-[2.5em] font-display text-sm leading-tight text-foreground sm:text-lg lg:text-base">
                    {product.name}
                  </h3>
                  <p className="mb-2 font-body text-base font-semibold text-accent sm:mb-3 sm:text-lg lg:text-base">
                    {formatPrice(product.price)}
                  </p>
                  <div className="mt-auto">
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

      <section className="band-maison relative border-t-4 border-accent/20 py-16 md:py-24">
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
