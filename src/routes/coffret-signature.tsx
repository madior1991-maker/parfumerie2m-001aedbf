import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowDown, Check, Sparkles, WandSparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import haqqiCollectionImage from "@/assets/haqqi-collection.webp";
import scentlabBoxesImage from "@/assets/scentlab-boxes.webp";
import pocketPerfumesHommeImage from "@/assets/pocket-perfumes-homme.webp";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { TutoVideoSection } from "@/components/commerce/TutoVideoSection";
import { catalog, formatPrice, slugifyProduct, type BoutiqueProduct } from "@/lib/catalog-data";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { supabase } from "@/integrations/supabase/client";
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
    label: "Compose ton pack Parfums de poche",
    price: 10000,
    subtitle: "5 parfums à composer dans un format pratique et facile à emporter.",
    requiredCount: 5,
  },
};

type Gender = "Homme" | "Unisex" | "Femme";

const genderOrder: Gender[] = ["Homme", "Unisex", "Femme"];

// Genre des parfums SCENTLAB (le catalogue les classe par famille olfactive).
const scentlabGender: Record<string, Gender> = {
  "creamy-almond-hypnotic-poison": "Femme",
  "bright-mandarin-louis-vuitton-imagination": "Homme",
  "fruity-gourmand-la-vie-est-belle": "Femme",
  "leather-violet-dior-fahrenheit": "Homme",
  "spicy-caramel-scandal-man-jpg": "Homme",
  "spicy-leather-one-million-lucky": "Homme",
  "rosy-hazelnut-amouage-guidance": "Femme",
  "oriental-oud-oud-for-greatness": "Homme",
  "vanilla-dream-burberry-goddess": "Femme",
  "savanna-vetiver-bal-d-afrique": "Homme",
  "cognac-whisper-kilian-angels-share": "Homme",
  "rosy-glow-lancome-idole": "Femme",
  "warm-spicy-armani-stronger-with-you": "Homme",
  "woody-bergamot-dior-sauvage": "Homme",
  "woody-bergamot-exclusive-dior-sauvage-elixir": "Homme",
  "fresh-grapefruit-paco-rabanne-invictus": "Homme",
  "minty-cedar-bleu-de-chanel": "Homme",
  "cool-mint-chanel-allure-homme-sport": "Homme",
  "spicy-leather-paco-rabanne-1-million": "Homme",
  "minty-vanilla-versace-eros": "Homme",
  "minty-lavender-jean-paul-gaultier-le-male": "Homme",
  "iris-cedar-dior-homme-intense": "Homme",
  "dark-leather-tom-ford-ombre-leather": "Homme",
  "aquatic-jasmine-armani-acqua-di-gio": "Homme",
  "earthy-vetiver-terre-d-hermes": "Homme",
  "pineapple-bergamot-creed-aventus": "Homme",
  "galactic-musk-marc-antoine-barrois-ganymede": "Homme",
  "dreamy-bloom-memo-marfa": "Homme",
  "oriental-tonka-montale-arabians-tonka": "Homme",
  "woody-oud-tom-ford-oud-wood": "Homme",
  "poetic-amber-xerjoff-more-than-words": "Homme",
  "sweet-tobacco-xerjoff-naxos": "Homme",
  "exotic-vanilla-armani-my-way": "Femme",
  "gardenia-jam-jean-paul-gaultier-scandal": "Femme",
  "spicy-citrus-chanel-chance": "Femme",
  "floral-musk-coco-mademoiselle": "Femme",
  "golden-floral-dior-j-adore": "Femme",
  "mystic-jasmine-mugler-alien": "Femme",
  "lush-gardenia-gucci-bloom": "Femme",
  "ambery-vanilla-ysl-black-opium": "Femme",
  "caramel-orange-kilian-love-don-t-be-shy": "Femme",
  "citrus-caramel-xerjoff-casamorati-lira": "Femme",
  "fruity-chypre-armani-si": "Femme",
  "jasmine-cedar-amouage-reflection": "Unisex",
  "addictive-peach-ex-nihilo-fleur-narcotique": "Unisex",
  "sandalwood-leather-le-labo-santal-33": "Unisex",
  "smoky-oud-louis-vuitton-ombre-nomade": "Unisex",
  "glow-amber-mfk-grand-soir": "Unisex",
  "satin-rose-mfk-oud-satin-mood": "Unisex",
  "marine-citrus-orto-parisi-megamare": "Unisex",
  "pink-peony-parfums-de-marly-delina": "Unisex",
  "fruity-passion-tiziana-terenzi-kirke": "Unisex",
  "ambery-orchid-tom-ford-black-orchid": "Unisex",
  "cherry-almond-tom-ford-lost-cherry": "Unisex",
  "fruity-vanilla-xerjoff-erba-pura": "Unisex",
  "sweet-saffron-mfk-baccarat-rouge-540": "Unisex",
  "sweet-saffron-extrait-mfk-baccarat-rouge-540-extrait": "Unisex",
  "spicy-vanilla-tom-ford-tobacco-vanille": "Unisex",
};

// Choix proposés dans les packs mais sans fiche produit sur le site.
const packOnlyOptions: Record<CoffretCollection, (CoffretOption & { gender: Gender })[]> = {
  haqqi: [
    {
      id: "haqqi-homme-scandal-man",
      title: "Scandal Man",
      description: "",
      gender: "Homme",
    },
    {
      id: "haqqi-unisex-baccarat-rouge-540",
      title: "Baccarat Rouge 540",
      description: "",
      gender: "Unisex",
    },
    {
      id: "haqqi-unisex-more-than-words",
      title: "More Than Words",
      description: "",
      gender: "Unisex",
    },
    {
      id: "haqqi-unisex-duetto",
      title: "Duetto",
      description: "",
      gender: "Unisex",
    },
    {
      id: "haqqi-femme-gucci-bloom",
      title: "Gucci Bloom",
      description: "",
      gender: "Femme",
    },
  ],
  scentlab: [
    {
      id: "scentlab-match-naughty-rose",
      title: "Naughty Rose",
      description: "Rose gourmande.",
      gender: "Femme",
    },
    {
      id: "scentlab-match-orange-blossom",
      title: "Orange Blossom",
      description: "Inspiré de Libre.",
      gender: "Femme",
    },
    {
      id: "scentlab-match-flirty-caramel",
      title: "Flirty Caramel",
      description: "Inspiré de Good Girl.",
      gender: "Femme",
    },
  ],
  pocket: [],
};

function genderOf(product: BoutiqueProduct): Gender | "Nouveautés" {
  if (product.collection === "scentlab")
    return scentlabGender[slugifyProduct(product)] ?? "Nouveautés";
  const family = product.family?.toLowerCase() ?? "";
  if (family.startsWith("homme")) return "Homme";
  if (family.startsWith("femme")) return "Femme";
  if (family.startsWith("unisex") || family.startsWith("mixte")) return "Unisex";
  return "Nouveautés";
}

function optionDescription(product: BoutiqueProduct) {
  if (product.collection === "pocket" || product.collection === "haqqi") return "";
  if (product.collection === "scentlab" && product.ref) return `Inspiré de ${product.ref}.`;
  return product.notes;
}

// Les listes des packs viennent du catalogue (et des modifications faites dans l'admin).
function buildPackSections(
  products: BoutiqueProduct[],
): Record<CoffretCollection, CoffretSection[]> {
  const result = {} as Record<CoffretCollection, CoffretSection[]>;
  for (const collection of ["haqqi", "scentlab", "pocket"] as CoffretCollection[]) {
    const groups = new Map<string, CoffretOption[]>();
    const seen = new Set<string>();
    const push = (group: string, option: CoffretOption) => {
      const key = option.title.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      groups.set(group, [...(groups.get(group) ?? []), option]);
    };
    for (const product of products) {
      if (product.collection !== collection) continue;
      push(genderOf(product), {
        id: slugifyProduct(product),
        title: product.name,
        description: optionDescription(product),
      });
    }
    for (const extra of packOnlyOptions[collection]) {
      push(extra.gender, { id: extra.id, title: extra.title, description: extra.description });
    }
    result[collection] = [...genderOrder, "Nouveautés"]
      .filter((title) => groups.has(title))
      .map((title) => ({
        title,
        items: [...(groups.get(title) ?? [])].sort((x, y) => x.title.localeCompare(y.title, "fr")),
      }));
  }
  return result;
}

const staticPackSections = buildPackSections(catalog);

const collectionShortLabel: Record<CoffretCollection, string> = {
  haqqi: "Haqqi",
  scentlab: "SCENTLAB",
  pocket: "Parfums de poche",
};

const collectionOrder: CoffretCollection[] = ["haqqi", "scentlab", "pocket"];

export const Route = createFileRoute("/coffret-signature")({
  head: () => ({
    meta: [
      { title: "Compose ton pack — 2M Parfumerie Sénégal" },
      {
        name: "description",
        content:
          "Composez votre pack chez 2M Parfumerie : 3 parfums Haqqi à 10 000 FCFA, 3 parfums SCENTLAB à 15 000 FCFA ou 5 parfums de poche à 10 000 FCFA, à sélectionner vous-même.",
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

  const [packSections, setPackSections] = useState(staticPackSections);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("products").select("*");
      if (!data?.length) return;
      // Les parfums de poche sont masqués un par un dans l'admin (vente en pack seulement) :
      // leur liste reste celle du catalogue.
      const live = buildPackSections(mergeLiveCatalog(data));
      setPackSections({ ...live, pocket: staticPackSections.pocket });
    })();
  }, []);

  const currentOffer = coffretOffers[selectedCollection];
  const currentSections = packSections[selectedCollection];
  const currentOptions = useMemo(
    () => currentSections.flatMap((section) => section.items),
    [currentSections],
  );
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
              Une expérience simple et plus personnelle qu’un achat classique: tu choisis ton
              univers, tu coches tes parfums (3 ou 5 selon le pack), et ton coffret est préparé pour
              être offert ou porté tout de suite.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Badge className="bg-accent text-primary-foreground">
                3 parfums Haqqi / SCENTLAB, 5 parfums de poche
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
              const imageBase =
                collection === "haqqi"
                  ? "haqqi-collection"
                  : collection === "scentlab"
                    ? "scentlab-boxes"
                    : "pocket-perfumes-homme";

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
                Tu peux garder tes sélections Haqqi, SCENTLAB et Parfums de poche séparément. Une
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
                {currentSections.map((section) => (
                  <div key={section.title} className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-2xl text-foreground">{section.title}</h3>
                      <Badge variant="secondary">{section.items.length} parfums</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {section.items.map((option) => {
                        const checked = selectedIds.includes(option.id);
                        const disabled =
                          !checked && selectedOptions.length >= currentOffer.requiredCount;

                        return (
                          <label
                            key={option.id}
                            htmlFor={option.id}
                            className={
                              checked
                                ? "group flex cursor-pointer items-start gap-3 rounded-xl border border-accent bg-accent-muted p-3 transition-all sm:p-4"
                                : disabled
                                  ? "group flex cursor-not-allowed items-start gap-3 rounded-xl border border-border bg-background p-3 opacity-50 sm:p-4"
                                  : "group flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:border-accent sm:p-4"
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
                                <div className="min-w-0">
                                  {selectedCollection !== "pocket" && (
                                    <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                      {collectionShortLabel[selectedCollection]} · {section.title}
                                    </p>
                                  )}
                                  <h4 className="mt-1 font-display text-lg text-foreground sm:text-[22px]">
                                    {option.title}
                                  </h4>
                                  {option.description && (
                                    <p className="mt-1 text-sm text-muted-foreground">
                                      {option.description}
                                    </p>
                                  )}
                                </div>
                                {checked && (
                                  <Check
                                    className="mt-1 size-5 shrink-0 text-accent"
                                    aria-hidden="true"
                                  />
                                )}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
              <CardDescription>Résumé rapide avant l’envoi du message.</CardDescription>
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
                      <li
                        key={option.id}
                        className="flex items-start gap-3 text-sm text-foreground"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                        <span>{option.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Choisis {currentOffer.requiredCount} parfums pour voir ton coffret se construire
                    ici.
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
                  <a
                    ref={validateRef}
                    href={whatsappUrl(whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
              text: "Haqqi à 10 000 FCFA, SCENTLAB à 15 000 FCFA ou Parfums de poche à 10 000 FCFA selon le style recherché.",
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
  return collection === "haqqi"
    ? "Haqqi"
    : collection === "scentlab"
      ? "SCENTLAB"
      : "Parfums de poche";
}

function buildWhatsAppMessage(collection: CoffretCollection, options: CoffretOption[]) {
  const offer = coffretOffers[collection];
  const choiceLines = options.map((option) => `• ${option.title}`).join("\n");

  return `Bonjour 2M Parfumerie 👋 Je veux un ${offer.label} à ${formatPrice(offer.price)}.\n\nMes ${offer.requiredCount} choix :\n${choiceLines}\n\nMerci de me préparer le coffret.`;
}
