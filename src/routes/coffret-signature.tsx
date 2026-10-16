import { createFileRoute } from "@tanstack/react-router";
import { Play, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { TutoVideoSection } from "@/components/commerce/TutoVideoSection";
import {
  catalog,
  formatPrice,
  optimizedProductImageUrl,
  slugifyProduct,
  type BoutiqueProduct,
} from "@/lib/catalog-data";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { supabase } from "@/integrations/supabase/client";
import { whatsappUrl } from "@/lib/perfume-data";
import { cn } from "@/lib/utils";

type CoffretCollection = "haqqi" | "scentlab" | "pocket";

type CoffretOption = {
  id: string;
  title: string;
  image: string;
  gender: Gender | "Nouveautés";
};

const coffretOffers: Record<
  CoffretCollection,
  { label: string; short: string; price: number; requiredCount: number; imageBase: string }
> = {
  haqqi: { label: "Pack Haqqi", short: "Haqqi", price: 10000, requiredCount: 3, imageBase: "haqqi-collection" },
  scentlab: { label: "Pack SCENTLAB", short: "SCENTLAB", price: 15000, requiredCount: 3, imageBase: "scentlab-boxes" },
  pocket: { label: "Pack Parfums de poche", short: "Poche", price: 10000, requiredCount: 5, imageBase: "pocket-perfumes-homme" },
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
  "naughty-rose-exclusive": "Femme",
  "flirty-caramel-carolina-herrera-good-girl": "Femme",
  "orange-blossom-ysl-libre": "Femme",
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
const packOnlyOptions: Record<CoffretCollection, CoffretOption[]> = {
  haqqi: [{ id: "haqqi-femme-gucci-bloom", title: "Gucci Bloom", image: "", gender: "Femme" }],
  scentlab: [],
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

// Les listes des packs viennent du catalogue (et des modifications faites dans l'admin).
function buildPackOptions(products: BoutiqueProduct[]): Record<CoffretCollection, CoffretOption[]> {
  const result = {} as Record<CoffretCollection, CoffretOption[]>;
  for (const collection of collectionOrder) {
    const seen = new Set<string>();
    const list: CoffretOption[] = [];
    const push = (option: CoffretOption) => {
      const key = option.title.toLowerCase();
      if (seen.has(key)) return;
      seen.add(key);
      list.push(option);
    };
    for (const product of products) {
      if (product.collection !== collection) continue;
      push({
        id: slugifyProduct(product),
        title: product.name,
        image: product.image,
        gender: genderOf(product),
      });
    }
    packOnlyOptions[collection].forEach(push);
    result[collection] = list.sort((x, y) => x.title.localeCompare(y.title, "fr"));
  }
  return result;
}

const collectionOrder: CoffretCollection[] = ["haqqi", "scentlab", "pocket"];
const staticPackOptions = buildPackOptions(catalog);
const genderTabs = ["Tous", "Homme", "Femme", "Unisex"] as const;
type GenderTab = (typeof genderTabs)[number];

function validatePackSearch(search: Record<string, unknown>): { pack?: CoffretCollection } {
  const pack = typeof search.pack === "string" ? search.pack.toLowerCase() : "";
  return collectionOrder.includes(pack as CoffretCollection) ? { pack: pack as CoffretCollection } : {};
}

export const Route = createFileRoute("/coffret-signature")({
  validateSearch: validatePackSearch,
  head: () => ({
    meta: [
      { title: "Compose ton pack — 2M Parfumerie Sénégal" },
      {
        name: "description",
        content:
          "Composez votre pack chez 2M Parfumerie : 3 parfums Haqqi à 10 000 FCFA, 3 parfums SCENTLAB à 15 000 FCFA ou 5 parfums de poche à 10 000 FCFA, à choisir en photos.",
      },
    ],
  }),
  component: CoffretSignaturePage,
});

function packImage(base: string, width: 400 | 800 = 400) {
  return `/images/optimized/${base}-w${width}.webp`;
}

function CoffretSignaturePage() {
  const search = Route.useSearch();
  const [selectedCollection, setSelectedCollection] = useState<CoffretCollection>(search.pack ?? "haqqi");
  const [selections, setSelections] = useState<Record<CoffretCollection, string[]>>({
    haqqi: [],
    scentlab: [],
    pocket: [],
  });
  const [packOptions, setPackOptions] = useState(staticPackOptions);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState<GenderTab>("Tous");

  useEffect(() => {
    if (search.pack) setSelectedCollection(search.pack);
  }, [search.pack]);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("products").select("*");
      if (!data?.length) return;
      // Les parfums de poche sont masqués un par un dans l'admin (vente en pack seulement) :
      // leur liste reste celle du catalogue.
      const live = buildPackOptions(mergeLiveCatalog(data));
      setPackOptions({ ...live, pocket: staticPackOptions.pocket });
    })();
  }, []);

  const offer = coffretOffers[selectedCollection];
  const allOptions = packOptions[selectedCollection];
  const selectedIds = selections[selectedCollection];
  const selectedOptions = selectedIds
    .map((id) => allOptions.find((option) => option.id === id))
    .filter((option): option is CoffretOption => Boolean(option));
  const remaining = offer.requiredCount - selectedOptions.length;
  const canSend = remaining === 0;
  const showGender = selectedCollection !== "pocket";

  const visibleOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allOptions.filter(
      (option) =>
        (!showGender || gender === "Tous" || option.gender === gender) &&
        (!q || option.title.toLowerCase().includes(q)),
    );
  }, [allOptions, gender, query, showGender]);

  const choosePack = (collection: CoffretCollection) => {
    setSelectedCollection(collection);
    setGender("Tous");
    setQuery("");
  };

  const toggleOption = (optionId: string) => {
    setSelections((current) => {
      const active = current[selectedCollection];
      if (active.includes(optionId)) {
        return { ...current, [selectedCollection]: active.filter((id) => id !== optionId) };
      }
      if (active.length >= offer.requiredCount) return current;
      return { ...current, [selectedCollection]: [...active, optionId] };
    });
  };

  return (
    <SiteLayout>
      <section className="bg-background pt-20 pb-40 md:pt-28 md:pb-44">
        <div className="section-shell">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="caption-luxe text-accent">3 parfums Haqqi ou SCENTLAB · 5 parfums de poche</p>
              <h1 className="mt-2 font-display text-[34px] font-semibold leading-[1.05] text-foreground md:text-5xl">
                Compose ton pack
              </h1>
            </div>
            <a
              href="#tuto"
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
            >
              <span className="grid size-7 place-items-center rounded-full border-[1.5px] border-accent">
                <Play className="size-3 fill-current" aria-hidden="true" />
              </span>
              Voir comment ça marche
            </a>
          </div>

          <StepTitle number={1}>Choisis ton pack</StepTitle>
          <div className="grid grid-cols-3 gap-2 md:max-w-3xl md:gap-4">
            {collectionOrder.map((collection) => {
              const item = coffretOffers[collection];
              const active = collection === selectedCollection;
              const count = selections[collection].length;
              return (
                <button
                  key={collection}
                  type="button"
                  onClick={() => choosePack(collection)}
                  aria-pressed={active}
                  className={cn(
                    "relative rounded-xl border-[1.5px] bg-card p-1.5 pb-2 text-center transition-all md:p-2.5",
                    active
                      ? "border-accent bg-surface-alt ring-1 ring-accent"
                      : "border-border hover:border-accent",
                  )}
                >
                  <img
                    src={packImage(item.imageBase)}
                    alt=""
                    width={400}
                    height={400}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                  <span className="mt-1.5 block text-[13px] font-semibold leading-tight text-foreground md:text-base">
                    {item.short}
                  </span>
                  <span className="block text-[11px] text-muted-foreground md:text-sm">
                    {item.requiredCount} pour {formatShortPrice(item.price)}
                  </span>
                  {count > 0 && (
                    <span className="absolute right-2.5 top-2.5 rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                      {count}/{item.requiredCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <StepTitle number={2}>
            Choisis {offer.requiredCount} parfums {offer.short}
          </StepTitle>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Rechercher : Sauvage, Black Opium…"
              aria-label="Rechercher un parfum du pack"
              className="w-full rounded-full border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 md:max-w-sm"
            />
            {showGender && (
              <div className="grid grid-cols-4 gap-1 rounded-full bg-surface-alt p-1 md:w-[420px]">
                {genderTabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setGender(tab)}
                    aria-pressed={gender === tab}
                    className={cn(
                      "rounded-full py-2 text-xs font-semibold transition-colors md:text-sm",
                      gender === tab ? "bg-accent text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {tab === "Unisex" ? "Unisexe" : tab}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
            {visibleOptions.map((option) => {
              const position = selectedIds.indexOf(option.id);
              const checked = position >= 0;
              const disabled = !checked && remaining === 0;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  aria-pressed={checked}
                  disabled={disabled}
                  className={cn(
                    "relative rounded-xl border-[1.5px] bg-white p-1.5 pb-2 text-center transition-all",
                    checked ? "border-accent ring-1 ring-accent" : "border-border hover:border-accent",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  {option.image ? (
                    <img
                      src={optimizedProductImageUrl(option.image, 400)}
                      alt=""
                      loading="lazy"
                      width={400}
                      height={400}
                      className="aspect-square w-full object-contain"
                    />
                  ) : (
                    <span className="grid aspect-square w-full place-items-center rounded-lg bg-surface font-display text-2xl text-accent">
                      {option.title.charAt(0)}
                    </span>
                  )}
                  <span className="mt-1 line-clamp-2 block min-h-[2.5em] text-[11.5px] font-semibold leading-tight text-[#1F1A15] md:text-[13px]">
                    {option.title}
                  </span>
                  {checked && (
                    <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-accent text-xs font-bold text-primary-foreground">
                      {position + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {visibleOptions.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
              Aucun parfum trouvé. Essaie un autre nom.
            </p>
          )}
          <p className="mt-4 text-sm text-muted-foreground">
            Si un parfum n’est plus disponible, on te propose un remplacement proche avant de préparer ton pack.
          </p>
        </div>
      </section>

      <div id="tuto" className="scroll-mt-20">
        <TutoVideoSection />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-primary pb-[max(12px,env(safe-area-inset-bottom))] pt-2.5 text-primary-foreground shadow-[0_-10px_30px_rgba(0,0,0,0.18)]">
        <div className="section-shell">
          <div className="mb-2 flex min-h-[26px] flex-wrap gap-1.5">
            {selectedOptions.map((option) => (
              <span
                key={option.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 py-1 pl-3 pr-1.5 text-xs"
              >
                {option.title}
                <button
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  aria-label={`Retirer ${option.title}`}
                  className="grid size-5 place-items-center rounded-full text-[#E3C67F] hover:bg-white/15"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
            {Array.from({ length: Math.max(0, remaining) }).map((_, index) => (
              <span
                key={index}
                className="rounded-full border border-dashed border-white/35 px-3 py-1 text-xs text-white/60"
              >
                à choisir
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-white/75">
                {selectedOptions.length}/{offer.requiredCount} choisis · {offer.label}
              </p>
              <p className="font-display text-xl font-semibold leading-tight md:text-2xl">{formatShortPrice(offer.price)}</p>
            </div>
            {canSend ? (
              <a
                href={whatsappUrl(buildWhatsAppMessage(selectedCollection, selectedOptions))}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-bold text-white shadow-card"
              >
                <WhatsAppLogo tone="light" className="size-5" /> Valider sur WhatsApp
              </a>
            ) : (
              <span className="shrink-0 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white/80">
                Choisis encore {remaining}
              </span>
            )}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}

function StepTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <h2 className="mb-3 mt-7 flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.16em] text-accent md:mt-9 md:text-sm">
      <span className="grid size-6 place-items-center rounded-full bg-primary text-[12px] tracking-normal text-primary-foreground">
        {number}
      </span>
      {children}
    </h2>
  );
}

function formatShortPrice(price: number) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} F`;
}

function buildWhatsAppMessage(collection: CoffretCollection, options: CoffretOption[]) {
  const offer = coffretOffers[collection];
  const choiceLines = options.map((option) => `• ${option.title}`).join("\n");
  return `Bonjour 2M Parfumerie 👋 Je veux un ${offer.label} à ${formatPrice(offer.price)}.\n\nMes ${offer.requiredCount} choix :\n${choiceLines}\n\nMerci de me préparer le pack.`;
}
