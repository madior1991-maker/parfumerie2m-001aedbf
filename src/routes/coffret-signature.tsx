import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Check, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import haqqiCollectionImage from "@/assets/haqqi-collection.webp";
import scentlabBoxesImage from "@/assets/scentlab-boxes.webp";
import pocketPerfumesHommeImage from "@/assets/pocket-perfumes-homme.webp";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { TutoVideoSection } from "@/components/commerce/TutoVideoSection";
import { catalog, formatPrice, slugifyProduct } from "@/lib/catalog-data";
import { whatsappUrl } from "@/lib/perfume-data";

type CoffretCollection = "haqqi" | "scentlab" | "pocket";

type CoffretOption = {
  id: string;
  title: string;
  description: string;
};

type CoffretSection = {
  title: string;
  items: CoffretOption[];
};

const coffretOffers: Record<
  CoffretCollection,
  { label: string; price: number; subtitle: string; requiredCount: number }
> = {
  haqqi: {
    label: "Compose ton pack Haqqi",
    price: 10000,
    subtitle: "3 parfums à composer dans un esprit plus profond, chaud et élégant.",
    requiredCount: 3,
  },
  scentlab: {
    label: "Compose ton pack SCENTLAB",
    price: 15000,
    subtitle: "3 parfums à composer dans une lecture plus moderne, fraîche ou gourmande.",
    requiredCount: 3,
  },
  pocket: {
    label: "Compose ton pack Parfums de poches",
    price: 10000,
    subtitle: "5 parfums à composer dans un format pratique et facile à emporter.",
    requiredCount: 5,
  },
};

const haqqiSections: CoffretSection[] = [
  {
    title: "Homme",
    items: [
      { id: "haqqi-homme-sauvage", title: "Sauvage", description: "Frais, épicé et terriblement iconique." },
      { id: "haqqi-homme-sauvage-elixir", title: "Sauvage Élixir", description: "Concentré, épicé et intense." },
      { id: "haqqi-homme-bleu-de-chanel", title: "Bleu de Chanel", description: "Boisé, aromatique et élégant." },
      { id: "haqqi-homme-invictus", title: "Invictus", description: "Frais, marin et énergique." },
      { id: "haqqi-homme-one-million", title: "One Million", description: "Épicé, cuir et affirmé." },
      { id: "haqqi-homme-bois-d-argent", title: "Bois d'Argent", description: "Boisé, noble et raffiné." },
      { id: "haqqi-homme-allure-homme-sport", title: "Allure Homme Sport", description: "Frais, sportif et lumineux." },
      { id: "haqqi-homme-le-male", title: "Le Mâle", description: "Aromatique, vanillé et très iconique." },
      { id: "haqqi-homme-acqua-di-gio", title: "Acqua di Giò", description: "Marin, frais et solaire." },
      { id: "haqqi-homme-stronger-with-you", title: "Stronger With You", description: "Sucré, épicé et chaleureux." },
      { id: "haqqi-homme-lacoste-noir-l12", title: "Lacoste noir L12", description: "Propre, élégant, facile à porter tous les jours." },
      { id: "haqqi-homme-la-nuit-del-homme", title: "La nuit del homme", description: "Plus sombre, plus chic, avec une belle présence." },
      { id: "haqqi-homme-desert-oud", title: "Desert oud", description: "Oud sec et profond avec une signature marquée." },
      { id: "haqqi-homme-oud-noir", title: "Oud noir", description: "Boisé, intense et très enveloppant." },
      { id: "haqqi-homme-scandal-man", title: "Scandal man", description: "Plus charismatique, plus affirmé, très présent." },
      { id: "haqqi-homme-imagination", title: "Imagination", description: "Frais lumineux, net et moderne." },
      { id: "haqqi-homme-terre-d-hermes", title: "Terre d Hermès", description: "Boisé minéral, sec et très raffiné." },
      { id: "haqqi-homme-ck-euphoria", title: "Ck Euphoria", description: "Plus rond, propre et facile à aimer." },
      { id: "haqqi-homme-kouros", title: "Kouros", description: "Un choix direct, expressif et sans détour." },
      { id: "haqqi-homme-burberry-classic", title: "Burberry classic", description: "Classique, doux et élégant." },
      { id: "haqqi-homme-pegasus", title: "Pegasus", description: "Crémeux, élégant et très distinctif." },
      { id: "haqqi-homme-creed-aventus", title: "Creed Aventus", description: "Frais, noble et très signature." },
      { id: "haqqi-homme-african-leather", title: "African Leather", description: "Cuir chaud, sec et racé." },
      { id: "haqqi-homme-encre-noir", title: "Encre noir", description: "Sombre, boisé et très texturé." },
      { id: "haqqi-homme-black-code", title: "Black code", description: "Nocturne, élégant et subtil." },
      { id: "haqqi-homme-man-in-black", title: "Man in black", description: "Ambré et intense avec une belle profondeur." },
      { id: "haqqi-homme-cartier-declaration", title: "Cartier déclaration", description: "Boisé épicé, plus classique et net." },
      { id: "haqqi-homme-dolce-gabbana-the-one", title: "Dolce gabbana the One", description: "Chaud, suave et très séduisant." },
      { id: "haqqi-homme-valentino-uomo", title: "Valentino oumo", description: "Doux, ambré et raffiné." },
    ],
  },
  {
    title: "Unisex",
    items: [
      { id: "haqqi-unisex-baccarat-rouge-540", title: "Baccarat rouge 540", description: "Signature lumineuse, ambrée et ultra reconnaissable." },
      { id: "haqqi-unisex-baccarat-rouge-540-extrait", title: "Baccarat rouge 540 extrait", description: "Version plus profonde, plus dense et plus luxueuse." },
      { id: "haqqi-unisex-oud-satin-mood", title: "Oud satin mood", description: "Velouté, oriental et raffiné." },
      { id: "haqqi-unisex-more-than-words", title: "More than words", description: "Élégant, poétique et légèrement boisé." },
      { id: "haqqi-unisex-kirke", title: "Kirke", description: "Fruité, solaire et très expressif." },
      { id: "haqqi-unisex-duetto", title: "Duetto", description: "Équilibré, net et facile à porter à deux styles." },
      { id: "haqqi-unisex-tom-ford-neroli-portofino", title: "Tom Ford neroli portofino", description: "Agrumes propres, lumineux et très frais." },
      { id: "haqqi-unisex-tom-ford-white-pachouli", title: "Tom Ford White pachouli", description: "Chic, blanc, boisé et très fluide." },
      { id: "haqqi-unisex-tom-ford-soleil-blanc", title: "Tom Ford soleil blanc", description: "Solaire, doux et élégant." },
      { id: "haqqi-unisex-tom-ford-ombre-leather", title: "Tom Ford ombre Leather", description: "Cuir profond, sombre et sophistiqué." },
      { id: "haqqi-unisex-tom-ford-tobacco-vanille", title: "Tom Ford Tobacco Vanille", description: "Tabac, vanille et très gourmand." },
    ],
  },
  {
    title: "Femme",
    items: [
      { id: "haqqi-femme-la-nuit-tresor", title: "La nuit trésor", description: "Gourmand, velouté et très féminin." },
      { id: "haqqi-femme-supreme-bouquet", title: "Suprême bouquet", description: "Floral riche, lumineux et généreux." },
      { id: "haqqi-femme-guidance", title: "Guidance", description: "Florale, crémeuse et élégante." },
      { id: "haqqi-femme-chanel-chance", title: "Chanel chance", description: "Doux, pétillant et intemporel." },
      { id: "haqqi-femme-euphoria", title: "Euphoria", description: "Fruité, sensuel et facile à aimer." },
      { id: "haqqi-femme-la-vie-est-belle", title: "La vie est belle", description: "Gourmand, lumineux et très réconfortant." },
      { id: "haqqi-femme-ysl-cinema", title: "YSL Cinéma", description: "Chaleureux, glamour et assumé." },
      { id: "haqqi-femme-manifesto", title: "Manifesto", description: "Plus moderne, plus doux, plus affirmé." },
      { id: "haqqi-femme-bright-cristal", title: "Bright cristal", description: "Aérien, propre et lumineux." },
      { id: "haqqi-femme-gucci-bloom", title: "Gucci Bloom", description: "Floral blanc, pur et généreux." },
      { id: "haqqi-femme-lolita-lempicka", title: "Lolita lempicka", description: "Sucré, original et très féminin." },
      { id: "haqqi-femme-dior-addict", title: "Dior addict", description: "Plus profond, plus sensuel, plus marqué." },
      { id: "haqqi-femme-diesel-full-for-life", title: "Diesel full for Life", description: "Audacieux, doux et très présent." },
      { id: "haqqi-femme-si-passione", title: "Si passione", description: "Rouge, fruité et intensément féminin." },
      { id: "haqqi-femme-my-way", title: "My way", description: "Floral, lumineux et moderne." },
      { id: "haqqi-femme-hypnotic-poison", title: "Hypnotic poison", description: "Vanille, amande et envoûtant." },
      { id: "haqqi-femme-narciso-pink-for-her", title: "Narciso Pink for Her", description: "Musqué, floral et sensuel." },
      { id: "haqqi-femme-black-opium", title: "Black opium", description: "Café, vanille et très addictif." },
      { id: "haqqi-femme-coco-mademoiselle", title: "Coco mademoiselle", description: "Chypré, élégant et iconique." },
      { id: "haqqi-femme-scandal", title: "Scandal", description: "Miel, gourmand et affirmé." },
      { id: "haqqi-femme-so-scandal", title: "So Scandal", description: "Floral, sucré et pétillant." },
    ],
  },
];

const scentlabSections: CoffretSection[] = [
  {
    title: "Hommes",
    items: [
      { id: "scentlab-match-woody-bergamot", title: "Woody bergamot", description: "Inspiré de Sauvage." },
      { id: "scentlab-match-minty-cedar", title: "Minty Cedar", description: "Inspiré de Bleu de Chanel." },
      { id: "scentlab-match-fresh-grapefruit", title: "Fresh grapefruit", description: "Inspiré d'Invictus." },
      { id: "scentlab-match-minty-vanilla", title: "Minty vanilla", description: "Inspiré de Versace Eros." },
      { id: "scentlab-match-earth-vetiver", title: "Earth vétiver", description: "Inspiré de Terre d'Hermès." },
      { id: "scentlab-match-aquatique-jasmine", title: "Aquatique Jasmine", description: "Inspiré de Acqua di Gio." },
      { id: "scentlab-match-warm-spicy", title: "Warm Spicy", description: "Inspiré de Stronger With You." },
      { id: "scentlab-match-cool-mint", title: "Cool mint", description: "Inspiré d'Allure." },
      { id: "scentlab-match-pineapple-bergamote", title: "Pineapple bergamote", description: "Inspiré de Creed Aventus." },
      { id: "scentlab-match-minty-lavender", title: "Minty lavender", description: "Inspiré de JPG Le Male." },
      { id: "scentlab-match-spicy-leather", title: "Spicy Leather", description: "Inspiré de One Million." },
      { id: "scentlab-new-bright-mandarin", title: "Bright Mandarin", description: "Inspiré de Louis Vuitton Imagination." },
      { id: "scentlab-new-sweet-tobacco", title: "Sweet Tobacco", description: "Inspiré de Xerjoff Naxos." },
      { id: "scentlab-new-woody-oud", title: "Woody oud", description: "Inspiré de Tom Ford Oud Wood." },
      { id: "scentlab-new-dark-leather", title: "Dark Leather", description: "Inspiré de Tom Ford Ombre Leather." },
      { id: "scentlab-new-iris-cedar", title: "Iris Cedar", description: "Inspiré de Dior Homme Intense." },
      { id: "scentlab-new-leather-violet", title: "Leather violet", description: "Inspiré de Dior Fahrenheit." },
      { id: "scentlab-new-spicy-caramel", title: "Spicy caramel", description: "Inspiré de Scandal Man." },
      { id: "scentlab-new-cognac-whisper", title: "Cognac whisper", description: "Inspiré de Killian Angels' Share." },
      { id: "scentlab-new-oriental-oud", title: "Oriental oud", description: "Inspiré de Oud for Greatness." },
      { id: "scentlab-new-spicy-leather-exclusive", title: "Spicy Leather exclusive", description: "Inspiré de One Million Lucky." },
      { id: "scentlab-new-oriental-tonka", title: "Oriental tonka", description: "Inspiré d'Arabian Tonka." },
      { id: "scentlab-new-poetic-amber", title: "Poetic Amber", description: "Inspiré de More Than Words." },
      { id: "scentlab-new-dreamy-bloom", title: "Dreamy bloom", description: "Inspiré de Memo Marfa." },
      { id: "scentlab-new-galactic-musk", title: "Galactic musk", description: "Inspiré de Ganymed." },
      { id: "scentlab-new-savanna-vetiver", title: "Savanna vétiver", description: "Inspiré de Bal d'Afrique." },
    ],
  },
  {
    title: "Unisex",
    items: [
      { id: "scentlab-new-glow-amber", title: "Glow amber", description: "Inspiré de Grand Soir." },
      { id: "scentlab-new-sandal-wood-leather", title: "Sandal Wood Leather", description: "Inspiré de Santal 33." },
      { id: "scentlab-new-sweet-safron-exclusive", title: "Sweet safron exclusive", description: "Inspiré de Baccarat Extrait." },
      { id: "scentlab-match-sweet-safron", title: "Sweet safron", description: "Inspiré de MFK Baccarat Rouge." },
      { id: "scentlab-match-smoky-oud", title: "Smoky Oud", description: "Inspiré de Louis Vuitton Ombre Nomade." },
      { id: "scentlab-match-fruity-passion", title: "Fruity passion", description: "Inspiré de Tiziana Terenzi Kirke." },
      { id: "scentlab-match-fruity-vanille", title: "Fruity Vanille", description: "Inspiré de Xerjoff Erba Pura." },
      { id: "scentlab-match-addictive-peach", title: "Addictive peach", description: "Inspiré de Fleur Narcotique." },
      { id: "scentlab-match-ambery-orchid", title: "Ambery orchid", description: "Inspiré de Tom Ford Black Orchid." },
      { id: "scentlab-match-pink-peony", title: "Pink peony", description: "Inspiré de Parfums de Marly Delina." },
      { id: "scentlab-match-cherry-almond", title: "Cherry Almond", description: "Inspiré de Tom Ford Lost Cherry." },
      { id: "scentlab-match-marine-citrus", title: "Marine citrus", description: "Inspiré de Orto Parisi Megamare." },
      { id: "scentlab-match-satin-rose", title: "Satin rose", description: "Inspiré de MFK Oud Satin Mood." },
      { id: "scentlab-match-jasmine-cedar", title: "Jasmine Cédar", description: "Inspiré de Amouage Reflection." },
    ],
  },
  {
    title: "Femmes",
    items: [
      { id: "scentlab-match-naughty-rose", title: "Naughty rose", description: "Inspiré de Good Girl Gone Bad." },
      { id: "scentlab-match-ambery-vanilla", title: "Ambery vanilla", description: "Inspiré de Black Opium." },
      { id: "scentlab-match-floral-musk", title: "Floral musk", description: "Inspiré de Coco Mademoiselle." },
      { id: "scentlab-match-golden-floral", title: "Golden floral", description: "Inspiré de J'adore." },
      { id: "scentlab-match-fruity-gourmand", title: "Fruity gourmand", description: "Inspiré de La Vie Est Belle." },
      { id: "scentlab-match-spicy-citrus", title: "Spicy citrus", description: "Inspiré de Chanel Chance." },
      { id: "scentlab-match-orange-blossom", title: "Orange blossom", description: "Inspiré de Libre." },
      { id: "scentlab-match-fruity-cyphere", title: "Fruity cyphere", description: "Inspiré de Si." },
      { id: "scentlab-match-gardenia-jam", title: "Gardénia jam", description: "Inspiré de Scandal." },
      { id: "scentlab-match-lush-gardenia", title: "Lush gardénia", description: "Inspiré de Gucci Bloom." },
      { id: "scentlab-match-flirty-caramel", title: "Flirty caramel", description: "Inspiré de Good Girl." },
      { id: "scentlab-match-exotic-vanilla", title: "Exotic vanilla", description: "Inspiré de My Way." },
      { id: "scentlab-match-mystic-jasmine", title: "Mystic jasmine", description: "Inspiré d'Alien." },
      { id: "scentlab-new-caramel-citrus", title: "Caramel citrus", description: "Inspiré de Xerjoff Casamorati Lira." },
      { id: "scentlab-new-caramel-orange", title: "Caramel orange", description: "Inspiré de Killian Love Don't Be Shy." },
      { id: "scentlab-new-rosy-hazelnut", title: "Rosy hazelnut", description: "Inspiré de Amouage Guidance." },
      { id: "scentlab-new-creamy-almond", title: "Creamy Almond", description: "Inspiré d'Hypnotic Poison." },
      { id: "scentlab-new-rosy-glow", title: "Rosy glow", description: "Inspiré de Lancôme Idôle." },
      { id: "scentlab-new-vanilla-dream", title: "Vanilla dream", description: "Inspiré de Burberry Goddess." },
    ],
  },
];

const pocketSections: CoffretSection[] = ["Homme", "Unisex", "Femme"]
  .map((family) => ({
    title: family,
    items: catalog
      .filter((product) => product.collection === "pocket" && product.family === family)
      .map((product) => ({
        id: slugifyProduct(product),
        title: product.name,
        description: product.description,
      })),
  }))
  .filter((section) => section.items.length > 0);

const coffretOptions: Record<CoffretCollection, CoffretOption[]> = {
  haqqi: haqqiSections.flatMap((section) => section.items),
  scentlab: scentlabSections.flatMap((section) => section.items),
  pocket: pocketSections.flatMap((section) => section.items),
};

const collectionOrder: CoffretCollection[] = ["haqqi", "scentlab", "pocket"];

export const Route = createFileRoute("/coffret-signature")({
  head: () => ({
    meta: [
      { title: "Compose ton pack — 2M Parfumerie Sénégal" },
      {
        name: "description",
        content:
          "Composez votre pack chez 2M Parfumerie : 3 parfums Haqqi à 10 000 FCFA, 3 parfums SCENTLAB à 15 000 FCFA ou 5 parfums de poches à 10 000 FCFA, à sélectionner vous-même.",
      },
    ],
  }),
  component: CoffretSignaturePage,
});

function CoffretSignaturePage() {
  const [selectedCollection, setSelectedCollection] = useState<CoffretCollection>("haqqi");
  const [selections, setSelections] = useState<Record<CoffretCollection, string[]>>({
    haqqi: [],
    scentlab: [],
    pocket: [],
  });

  const currentOffer = coffretOffers[selectedCollection];
  const currentOptions = coffretOptions[selectedCollection];
  const selectedIds = selections[selectedCollection];
  const selectedOptions = useMemo(
    () => currentOptions.filter((option) => selectedIds.includes(option.id)),
    [currentOptions, selectedIds],
  );
  const remaining = currentOffer.requiredCount - selectedOptions.length;
  const canSend = selectedOptions.length === currentOffer.requiredCount;
  const whatsappMessage = buildWhatsAppMessage(selectedCollection, selectedOptions);
  const validateRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!canSend) return;
    const timer = window.setTimeout(() => {
      validateRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [canSend, selectedCollection]);

  const toggleOption = (optionId: string) => {
    setSelections((current) => {
      const activeSelections = current[selectedCollection];
      const alreadySelected = activeSelections.includes(optionId);

      if (alreadySelected) {
        return {
          ...current,
          [selectedCollection]: activeSelections.filter((id) => id !== optionId),
        };
      }

      if (activeSelections.length >= currentOffer.requiredCount) {
        return current;
      }

      return {
        ...current,
        [selectedCollection]: [...activeSelections, optionId],
      };
    });
  };

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-background pt-24 md:pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(27,94,63,0.12),transparent_36%),radial-gradient(circle_at_left,rgba(27,94,63,0.08),transparent_30%)]" />
        <div className="section-shell relative grid gap-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:py-12">
          <div>
            <Badge variant="outline" className="border-accent/30 bg-accent-muted text-accent">
              Compose ton pack
            </Badge>
            <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.08] text-foreground md:text-[64px]">
              Compose ton coffret, coche le bon nombre de parfums, on s’occupe du reste.
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
              Une expérience simple et plus personnelle qu’un achat classique: tu choisis ton univers,
              tu coches trois parfums, et ton coffret est préparé pour être offert ou porté tout de
              suite.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge className="bg-accent text-primary-foreground">
                3 parfums Haqqi / SCENTLAB, 5 parfums de poches
              </Badge>
              <Badge variant="secondary">Coffret prêt à offrir</Badge>
              <Badge variant="secondary">Validation rapide sur WhatsApp</Badge>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="whatsapp" size="lg">
                <a href="#compose">Composer mon coffret</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/boutique" search={{ collection: "all" }}>
                  Voir la boutique
                </Link>
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-3 text-accent md:mt-5">
              <ArrowDown className="size-5 animate-bounce" aria-hidden="true" />
              <p className="text-sm font-medium uppercase tracking-[0.14em]">
                Choisis ton pack juste en dessous
              </p>
            </div>
          </div>

          <div className="grid gap-2 md:justify-items-end">
            {collectionOrder.map((collection) => {
              const offer = coffretOffers[collection];
              const active = selectedCollection === collection;
              const imageBase = collection === "haqqi" ? "haqqi-collection" : collection === "scentlab" ? "scentlab-boxes" : "pocket-perfumes-homme";

              return (
                <button
                  key={collection}
                  type="button"
                  onClick={() => setSelectedCollection(collection)}
                  className={
                    active
                      ? "w-full rounded-xl border border-accent bg-accent-muted p-3 text-left shadow-card transition-all md:max-w-sm"
                      : "w-full rounded-xl border border-border bg-card p-3 text-left shadow-card transition-all hover:-translate-y-1 hover:border-accent md:max-w-sm"
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 overflow-hidden rounded-lg border border-border bg-background/60">
                      <picture>
                        <source
                          type="image/avif"
                          srcSet={`/images/optimized/${imageBase}-w1200.avif 1200w, /images/optimized/${imageBase}-w800.avif 800w, /images/optimized/${imageBase}-w400.avif 400w`}
                          sizes="(min-width: 768px) 80px, 64px"
                        />
                        <source
                          type="image/webp"
                          srcSet={`/images/optimized/${imageBase}-w1200.webp 1200w, /images/optimized/${imageBase}-w800.webp 800w, /images/optimized/${imageBase}-w400.webp 400w`}
                          sizes="(min-width: 768px) 80px, 64px"
                        />
                        <img
                          src={`/images/optimized/${imageBase}-w800.webp`}
                          alt={offer.label}
                          loading="lazy"
                          width={80}
                          height={80}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </picture>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="mt-1 font-display text-base text-foreground">{offer.label}</h2>
                    </div>
                    <Badge variant={active ? "default" : "secondary"}>
                      {formatPrice(offer.price)}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-5 text-muted-foreground">{offer.subtitle}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <TutoVideoSection />

      <section id="compose" className="bg-surface py-16 md:py-24">
        <div className="section-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-[28px] text-foreground md:text-[34px]">
                Choisis ton univers, puis coche le bon nombre de parfums
              </CardTitle>
              <CardDescription className="mt-2 text-base text-muted-foreground">
                Tu peux garder tes sélections Haqqi, SCENTLAB et Parfums de poches séparément. Une
                fois que tu as le bon nombre de choix dans l’univers actif, tu peux valider
                directement sur WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {collectionOrder.map((collection) => {
                  const offer = coffretOffers[collection];
                  const count = selections[collection].length;
                  const active = selectedCollection === collection;

                  return (
                    <button
                      key={collection}
                      type="button"
                      onClick={() => setSelectedCollection(collection)}
                      className={
                        active
                          ? "rounded-xl border border-accent bg-accent-muted px-4 py-4 text-left transition-all"
                          : "rounded-xl border border-border bg-background px-4 py-4 text-left transition-all hover:border-accent"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                            {offer.label}
                          </p>
                          <p className="mt-1 font-semibold text-foreground">
                            {count}/{offer.requiredCount} sélectionné{count > 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant={active ? "default" : "secondary"}>
                          {formatPrice(offer.price)}
                        </Badge>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-6">
                {selectedCollection === "haqqi" ? (
                  haqqiSections.map((section) => (
                    <div key={section.title} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-2xl text-foreground">{section.title}</h3>
                        <Badge variant="secondary">{section.items.length} parfums</Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {section.items.map((option) => {
                          const checked = selectedIds.includes(option.id);
                          const disabled = !checked && selectedOptions.length >= currentOffer.requiredCount;

                          return (
                            <label
                              key={option.id}
                              htmlFor={option.id}
                              className={
                                checked
                                  ? "group flex cursor-pointer items-start gap-4 rounded-xl border border-accent bg-accent-muted p-4 transition-all"
                                  : "group flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent"
                              }
                            >
                              <Checkbox
                                id={option.id}
                                checked={checked}
                                disabled={disabled}
                                onCheckedChange={() => toggleOption(option.id)}
                                className="mt-1"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                      Haqqi {section.title}
                                    </p>
                                    <h4 className="mt-1 font-display text-[22px] text-foreground">
                                      {option.title}
                                    </h4>
                                  </div>
                                  {checked && (
                                    <Check className="mt-1 size-5 text-accent" aria-hidden="true" />
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : selectedCollection === "scentlab" ? (
                  scentlabSections.map((section) => (
                    <div key={section.title} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-2xl text-foreground">{section.title}</h3>
                        <Badge variant="secondary">{section.items.length} parfums</Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {section.items.map((option) => {
                          const checked = selectedIds.includes(option.id);
                          const disabled = !checked && selectedOptions.length >= currentOffer.requiredCount;

                          return (
                            <label
                              key={option.id}
                              htmlFor={option.id}
                              className={
                                checked
                                  ? "group flex cursor-pointer items-start gap-4 rounded-xl border border-accent bg-accent-muted p-4 transition-all"
                                  : "group flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent"
                              }
                            >
                              <Checkbox
                                id={option.id}
                                checked={checked}
                                disabled={disabled}
                                onCheckedChange={() => toggleOption(option.id)}
                                className="mt-1"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                      Scentlab {section.title}
                                    </p>
                                    <h4 className="mt-1 font-display text-[22px] text-foreground">
                                      {option.title}
                                    </h4>
                                  </div>
                                  {checked && (
                                    <Check className="mt-1 size-5 text-accent" aria-hidden="true" />
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  pocketSections.map((section) => (
                    <div key={section.title} className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-display text-2xl text-foreground">{section.title}</h3>
                        <Badge variant="secondary">{section.items.length} parfums</Badge>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {section.items.map((option) => {
                          const checked = selectedIds.includes(option.id);
                          const disabled = !checked && selectedOptions.length >= currentOffer.requiredCount;

                          return (
                            <label
                              key={option.id}
                              htmlFor={option.id}
                              className={
                                checked
                                  ? "group flex cursor-pointer items-start gap-4 rounded-xl border border-accent bg-accent-muted p-4 transition-all"
                                  : "group flex cursor-pointer items-start gap-4 rounded-xl border border-border bg-background p-4 transition-all hover:border-accent"
                              }
                            >
                              <Checkbox
                                id={option.id}
                                checked={checked}
                                disabled={disabled}
                                onCheckedChange={() => toggleOption(option.id)}
                                className="mt-1"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                      Parfums de poches {section.title}
                                    </p>
                                    <h4 className="mt-1 font-display text-[22px] text-foreground">
                                      {option.title}
                                    </h4>
                                  </div>
                                  {checked && (
                                    <Check className="mt-1 size-5 text-accent" aria-hidden="true" />
                                  )}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-sm text-muted-foreground">
                Tu dois cocher exactement {currentOffer.requiredCount} parfums. Si un choix n’est
                plus disponible, on te propose un remplacement proche avant validation.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-[28px] text-foreground">
                Ton coffret en cours
              </CardTitle>
              <CardDescription>
                Résumé rapide avant l’envoi du message.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl bg-surface p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="caption-luxe text-accent">{currentOffer.label}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{currentOffer.subtitle}</p>
                  </div>
                  <Badge>{formatPrice(currentOffer.price)}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-accent" aria-hidden="true" />
                  <span>
                    {selectedOptions.length}/{currentOffer.requiredCount} parfums choisis
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-border p-5">
                <p className="caption-luxe text-muted-foreground">Mes choix</p>
                {selectedOptions.length ? (
                  <ul className="mt-4 space-y-3">
                    {selectedOptions.map((option) => (
                      <li key={option.id} className="flex items-start gap-3 text-sm text-foreground">
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span>{option.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Choisis {currentOffer.requiredCount} parfums pour voir ton coffret se construire ici.
                  </p>
                )}
              </div>

              <div className="rounded-2xl bg-accent-muted p-5">
                <p className="caption-luxe text-accent">Prix du coffret</p>
                <p className="mt-3 font-display text-4xl text-foreground">
                  {formatPrice(currentOffer.price)}
                </p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {currentOffer.requiredCount} parfums, un seul coffret, et un échange humain pour
                  finaliser la sélection.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              {canSend ? (
                <Button asChild variant="whatsapp" size="lg" className="w-full">
                  <a ref={validateRef} href={whatsappUrl(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                    <WhatsAppLogo tone="light" className="size-5" /> Valider mon coffret
                  </a>
                </Button>
              ) : (
                <Button type="button" variant="whatsapp" size="lg" className="w-full" disabled>
                  Choisis encore {remaining} parfum{remaining > 1 ? "s" : ""}
                </Button>
              )}
              <Button asChild variant="outline" size="lg" className="w-full">
                <Link to="/contact">Parler à l’équipe</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="section-shell grid gap-4 md:grid-cols-3 md:gap-5">
          {[
            {
              icon: WandSparkles,
              title: "1. Tu choisis l’univers",
              text: "Haqqi à 10 000 FCFA, SCENTLAB à 15 000 FCFA ou Parfums de poches à 10 000 FCFA selon le style recherché.",
            },
            {
              icon: Check,
              title: "2. Tu coches le bon nombre de parfums",
              text: "3 parfums pour Haqqi ou SCENTLAB, 5 parfums pour les poches: la sélection se fait en quelques clics.",
            },
            {
              icon: Sparkles,
              title: "3. On prépare ton coffret",
              text: "Tu valides sur WhatsApp et on finalise la commande avec toi.",
            },
          ].map(({ icon: Icon, title, text }) => (
            <article
              key={title}
              className="rounded-2xl border border-border bg-card p-6 shadow-card"
            >
              <Icon className="mb-6 size-8 text-accent" aria-hidden="true" />
              <h3 className="font-display text-2xl text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{text}</p>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}

function collectionOffersLabel(collection: CoffretCollection) {
  return collection === "haqqi" ? "Haqqi" : collection === "scentlab" ? "SCENTLAB" : "Parfums de poches";
}

function buildWhatsAppMessage(collection: CoffretCollection, options: CoffretOption[]) {
  const offer = coffretOffers[collection];
  const choiceLines = options.map((option) => `• ${option.title}`).join("\n");

  return `Bonjour 2M Parfumerie 👋 Je veux un ${offer.label} à ${formatPrice(offer.price)}.\n\nMes ${offer.requiredCount} choix :\n${choiceLines}\n\nMerci de me préparer le coffret.`;
}