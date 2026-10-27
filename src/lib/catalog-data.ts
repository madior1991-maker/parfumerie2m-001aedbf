import losAngelesImage from "@/assets/takeoff-los-angeles.webp";
import amsterdamImage from "@/assets/takeoff-amsterdam.webp";
import zurichImage from "@/assets/takeoff-zurich.webp";
import berlinImage from "@/assets/takeoff-berlin.webp";
import dubaiImage from "@/assets/takeoff-dubai.webp";
import riyadhImage from "@/assets/takeoff-riyadh.webp";
import viennaImage from "@/assets/takeoff-vienna.webp";
import lisbonImage from "@/assets/hero-lisbon.jpg";
import capriImage from "@/assets/takeoff-capri.webp";
import seoulImage from "@/assets/takeoff-seoul.webp";
import romeImage from "@/assets/takeoff-rome.webp";
import istanbulImage from "@/assets/takeoff-istanbul.webp";
import monacoImage from "@/assets/takeoff-monaco.webp";
import newYorkImage from "@/assets/takeoff-new-york.webp";
import moscowImage from "@/assets/takeoff-moscow.webp";
import milanImage from "@/assets/takeoff-milan.webp";
import budapestImage from "@/assets/takeoff-budapest.webp";
import parisImage from "@/assets/takeoff-paris.webp";
// Use optimized public images for large assets to reduce bundle size
const creamyAlmondImage = "/images/optimized/scentlab-creamy-almond-upload-w800.webp";
import brightMandarinImage from "@/assets/scentlab-bright-mandarin.webp";
import caramelCitrusImage from "@/assets/scentlab-caramel-citrus.webp";
import fruityGourmandImage from "@/assets/scentlab-fruity-gourmand-upload.webp";
const fruityVanillaImage = "/images/optimized/scentlab-fruity-vanilla-w800.webp";
import leatherVioletImage from "@/assets/scentlab-leather-violet.webp";
import spicyCaramelImage from "@/assets/scentlab-spicy-caramel-upload.webp";
import spicyLeatherImage from "@/assets/scentlab-spicy-leather-upload.webp";
import rosyHazelnutImage from "@/assets/scentlab-rosy-hazelnut-upload.webp";
import orientalOudImage from "@/assets/scentlab-oriental-oud-upload.webp";
import vanillaDreamImage from "@/assets/scentlab-vanilla-dream-upload.webp";
import savannaVetiverImage from "@/assets/scentlab-savanna-vetiver-upload.webp";
import cognacWhisperImage from "@/assets/scentlab-cognac-whisper-upload.webp";
import rosyGlowImage from "@/assets/scentlab-rosy-glow-upload.png";
const haqqiCollectionImage = "/images/optimized/haqqi-collection-w800.webp";
const pocketHommeImage = "/images/optimized/pocket-perfumes-homme-w800.webp";
const pocketFemmeImage = "/images/optimized/pocket-perfumes-femme-w800.webp";

export const collectionValues = [
  "all",
  "scentlab",
  "takeoff",
  "dubai",
  "pocket",
  "authentic",
  "callisto",
  "haqqi",
  "privees",
  "coffrets",
  "library",
  "soie-sublime",
] as const;
export const priceValues = ["all", "under-10000", "10000-25000", "over-25000"] as const;

export type KnownCollection = (typeof collectionValues)[number];
// Une catégorie créée depuis l'admin est un texte libre (ex. « musc-blanc »).
export type Collection = KnownCollection | (string & {});
export type PriceRange = (typeof priceValues)[number];

export type BoutiqueProduct = {
  name: string;
  ref: string;
  inspiration?: string;
  notes: string;
  headNotes: string;
  heartNotes: string;
  baseNotes: string;
  price: number;
  collection: Collection;
  image: string;
  imageUrls?: string[];
  family: string;
  concentration: string;
  volume: string;
  description: string;
  slug?: string;
  placeholder?: boolean;
  createdAt?: string;
  isBestseller?: boolean;
};

export const collectionFilters: { label: string; value: KnownCollection }[] = [
  { label: "Toutes", value: "all" },
  { label: "Haqqi", value: "haqqi" },
  { label: "SCENTLAB", value: "scentlab" },
  { label: "Takeoff", value: "takeoff" },
  { label: "Parfums de poche", value: "pocket" },
  { label: "Parfums Dubai", value: "dubai" },
  { label: "Parfums authentiques", value: "authentic" },
  { label: "Callisto Paris", value: "callisto" },
  { label: "Collections privées", value: "privees" },
  { label: "Coffrets", value: "coffrets" },
  { label: "Fragrance Library", value: "library" },
  { label: "Soie Sublime Paris", value: "soie-sublime" },
];

const collectionAliases: Record<string, KnownCollection> = {
  all: "all",
  scentlab: "scentlab",
  "scent lab": "scentlab",
  takeoff: "takeoff",
  "takeoff fragrance": "takeoff",
  "takeoff fragance": "takeoff",
  dubai: "dubai",
  "dubai perfumes": "dubai",
  pocket: "pocket",
  "pocket perfumes": "pocket",
  authentic: "authentic",
  "authentic perfumes": "authentic",
  haqqi: "haqqi",
  haqqui: "haqqi",
  callisto: "callisto",
  "callisto paris": "callisto",
  privees: "privees",
  "collections privees": "privees",
  "collections privées": "privees",
  "collection privee": "privees",
  "private collection": "privees",
  coffrets: "coffrets",
  coffret: "coffrets",
  library: "library",
  "fragrance library": "library",
  "soie-sublime": "soie-sublime",
  "soie sublime": "soie-sublime",
  "soie sublime paris": "soie-sublime",
};

// Libellés des catégories créées dans l'admin (clé normalisée -> texte saisi).
const customCollectionLabels = new Map<string, string>();

export function slugifyCollection(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isKnownCollection(value: string): value is KnownCollection {
  return (collectionValues as readonly string[]).includes(value);
}

export function normalizeCollectionValue(value: string | null | undefined): Collection {
  if (!value || !value.trim()) return "scentlab";
  const normalized = value.trim().toLowerCase();
  const known =
    collectionAliases[normalized] ?? (isKnownCollection(normalized) ? normalized : undefined);
  if (known) return known;
  const slug = slugifyCollection(value);
  if (!slug) return "scentlab";
  // Le texte saisi dans l'admin sert de libellé ; une valeur d'URL (« musc-blanc ») ne l'écrase pas.
  const existing = customCollectionLabels.get(slug);
  if (!existing || (existing === slug && value.trim() !== slug)) {
    customCollectionLabels.set(slug, value.trim());
  }
  return slug;
}

export const priceFilters: { label: string; value: PriceRange }[] = [
  { label: "Tous les prix", value: "all" },
  { label: "< 10 000 FCFA", value: "under-10000" },
  { label: "10 000 – 25 000 FCFA", value: "10000-25000" },
  { label: "> 25 000 FCFA", value: "over-25000" },
];

const takeoffProducts = [
  {
    name: "Los Angeles",
    ref: "Kilian Love Don’t Be Shy",
    price: 25000,
    image: losAngelesImage,
    notes: "Ambre · Fruits rouges · Musc",
    family: "Ambré fruité",
  },
  {
    name: "Amsterdam",
    ref: "Initio Side Effect",
    price: 25000,
    image: amsterdamImage,
    notes: "Violette · Bois doux · Musc",
    family: "Floral boisé",
  },
  {
    name: "Zurich",
    ref: "MFK Oud Satin Mood",
    price: 25000,
    image: zurichImage,
    notes: "Bois frais · Ambre · Épices",
    family: "Boisé ambré",
  },
  {
    name: "Berlin",
    ref: "Xerjoff Naxos 1861",
    price: 25000,
    image: berlinImage,
    notes: "Vanille · Musc · Fleurs blanches",
    family: "Musqué doux",
  },
  {
    name: "Dubai",
    ref: "Montale Arabian Tonka",
    price: 25000,
    image: dubaiImage,
    notes: "Oud · Ambre · Épices",
    family: "Oriental boisé",
  },
  {
    name: "Riyadh",
    ref: "Louis Vuitton Ombre Nomade",
    price: 25000,
    image: riyadhImage,
    notes: "Résines · Safran · Bois chauds",
    family: "Oriental ambré",
  },
  {
    name: "Vienna",
    ref: "Delina Parfums de Marly",
    price: 25000,
    image: viennaImage,
    notes: "Rose · Musc · Fruits tendres",
    family: "Floral musqué",
  },
  {
    name: "Lisbon",
    ref: "Xerjoff Sospiro Erba Pura",
    price: 25000,
    image: lisbonImage,
    notes: "Agrumes · Musc propre · Bois clair",
    family: "Frais musqué",
  },
  {
    name: "Capri",
    ref: "Tiziani Terenzi Kirke",
    price: 25000,
    image: capriImage,
    notes: "Marine · Agrumes · Ambre gris",
    family: "Frais aromatique",
  },
  {
    name: "Seoul",
    ref: "Louis Vuitton Imagination",
    price: 25000,
    image: seoulImage,
    notes: "Musc bleu · Agrumes · Bois propres",
    family: "Frais boisé",
  },
  {
    name: "Rome",
    ref: "Xerjoff Accento",
    price: 25000,
    image: romeImage,
    notes: "Violette · Ambre doux · Musc",
    family: "Floral ambré",
  },
  {
    name: "Istanbul",
    ref: "Nishane Hacivat",
    price: 25000,
    image: istanbulImage,
    notes: "Musc blanc · Fleurs propres · Bois doux",
    family: "Musqué floral",
  },
  {
    name: "Monaco",
    ref: "Xerjoff 40 Knots",
    price: 25000,
    image: monacoImage,
    notes: "Accord marin · Agrumes · Ambre clair",
    family: "Aromatique frais",
  },
  {
    name: "New York",
    ref: "Dior Sauvage Elixir",
    price: 25000,
    image: newYorkImage,
    notes: "Bois urbains · Ambre · Épices fraîches",
    family: "Boisé épicé",
  },
  {
    name: "Moscow",
    ref: "Xerjoff La Capitale",
    price: 25000,
    image: moscowImage,
    notes: "Vanille claire · Ambre · Musc",
    family: "Ambré doux",
  },
  {
    name: "Milan",
    ref: "Xerjoff Torino 21",
    price: 25000,
    image: milanImage,
    notes: "Bergamote · Musc · Bois élégants",
    family: "Chypré frais",
  },
  {
    name: "Budapest",
    ref: "MFK Grand Soir",
    price: 25000,
    image: budapestImage,
    notes: "Ambre doré · Musc · Bois blonds",
    family: "Ambré musqué",
  },
  {
    name: "Paris",
    ref: "MFK Baccarat Rouge",
    price: 25000,
    image: parisImage,
    notes: "Rose rouge · Ambre · Musc",
    family: "Floral ambré",
  },
] as const;

const scentlabProducts = [
  {
    name: "Creamy Almond",
    ref: "Hypnotic Poison",
    image: creamyAlmondImage,
    notes: "Amande crémeuse · Vanille · Musc",
    family: "Gourmand crémeux",
  },
  {
    name: "Bright Mandarin",
    ref: "Louis Vuitton Imagination",
    image: brightMandarinImage,
    notes: "Mandarine · Agrumes · Musc propre",
    family: "Hespéridé frais",
  },
  {
    name: "Citrus Caramel",
    ref: "Xerjoff Casamorati Lira",
    image: caramelCitrusImage,
    notes: "Caramel · Agrumes · Ambre",
    family: "Gourmand hespéridé",
  },
  {
    name: "Fruity Gourmand",
    ref: "La Vie Est Belle",
    image: fruityGourmandImage,
    notes: "Fruits doux · Praline · Musc",
    family: "Fruité gourmand",
  },
  {
    name: "Fruity Vanilla",
    ref: "Xerjoff Erba Pura",
    image: fruityVanillaImage,
    notes: "Fruits rouges · Vanille · Musc",
    family: "Vanillé fruité",
  },
  {
    name: "Leather Violet",
    ref: "Dior Fahrenheit",
    image: leatherVioletImage,
    notes: "Cuir · Violette · Ambre",
    family: "Cuir floral",
  },
  {
    name: "Spicy Caramel",
    ref: "Scandal Man JPG",
    image: spicyCaramelImage,
    notes: "Caramel · Épices · Bois ambrés",
    family: "Gourmand épicé",
  },
  {
    name: "Spicy Leather Exclusive",
    ref: "One Million Lucky",
    // Adresse d'origine conservée
    slug: "spicy-leather-one-million-lucky",
    image: spicyLeatherImage,
    notes: "Cuir · Épices · Résines",
    family: "Cuir épicé",
  },
  {
    name: "Rosy Hazelnut",
    ref: "Amouage Guidance",
    image: rosyHazelnutImage,
    notes: "Rose · Noisette · Ambre",
    family: "Floral ambré",
  },
  {
    name: "Oriental Oud",
    ref: "Oud For Greatness",
    image: orientalOudImage,
    notes: "Oud · Résines · Ambre",
    family: "Oriental boisé",
  },
  {
    name: "Vanilla Dream",
    ref: "Burberry Goddess",
    image: vanillaDreamImage,
    notes: "Vanille · Ambre · Musc",
    family: "Vanillé ambré",
  },
  {
    name: "Savanna Vetiver",
    ref: "Bal d’Afrique",
    image: savannaVetiverImage,
    notes: "Vétiver · Agrumes · Bois secs",
    family: "Boisé frais",
  },
  {
    name: "Cognac Whisper",
    ref: "Kilian Angels’ Share",
    image: cognacWhisperImage,
    notes: "Cognac · Bois · Épices",
    family: "Ambré boisé",
  },
  {
    name: "Rosy Glow",
    ref: "Lancôme Idole",
    image: rosyGlowImage,
    notes: "Rose · Musc · Fruits doux",
    family: "Floral musqué",
  },
] as const;

const takeoffCatalog: BoutiqueProduct[] = takeoffProducts.map((product) => ({
  name: product.name,
  ref: product.ref,
  notes: product.notes,
  headNotes: product.notes,
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: product.price,
  collection: "takeoff",
  image: product.image,
  family: product.family,
  concentration: "Eau de parfum",
  volume: "100 ml",
  description: `${product.name} par TAKEOFF Fragrance est une eau de parfum 100 ml de la collection Scent of Journey, disponible chez 2M Parfumerie à Dakar.`,
}));


// SCENTLAB ajoutés depuis la liste du fournisseur (photos scentlabfragrance.com).
const scentlabExtraProducts: {
  name: string;
  ref: string;
  slug: string;
  notes: string;
  family: string;
  concentration?: string;
}[] = [
  { name: "Warm Spicy", ref: "Armani Stronger With You", slug: "warm-spicy", notes: "Châtaigne · Épices chaudes · Vanille", family: "Ambré épicé" },
  { name: "Woody Bergamot", ref: "Dior Sauvage", slug: "woody-bergamot", notes: "Bergamote · Poivre · Ambroxan", family: "Aromatique frais" },
  { name: "Fresh Grapefruit", ref: "Paco Rabanne Invictus", slug: "fresh-grapefruit", notes: "Pamplemousse · Notes marines · Bois", family: "Frais aquatique" },
  { name: "Aquatic Jasmine", ref: "Armani Acqua di Giò", slug: "aquatic-jasmine", notes: "Notes marines · Jasmin · Bois", family: "Aquatique floral" },
  { name: "Minty Cedar", ref: "Bleu de Chanel", slug: "minty-cedar", notes: "Agrumes · Menthe · Cèdre", family: "Boisé aromatique" },
  { name: "Cool Mint", ref: "Chanel Allure Homme Sport", slug: "cool-mint", notes: "Menthe · Agrumes · Musc", family: "Frais aromatique" },
  { name: "Spicy Leather", ref: "Paco Rabanne 1 Million", slug: "spicy-leather", notes: "Cannelle · Cuir · Ambre", family: "Cuir épicé" },
  { name: "Earthy Vetiver", ref: "Terre d'Hermès", slug: "earthy-vetiver", notes: "Orange · Vétiver · Bois", family: "Boisé terreux" },
  { name: "Minty Vanilla", ref: "Versace Eros", slug: "minty-vanilla", notes: "Menthe · Pomme verte · Vanille", family: "Fougère vanillée" },
  { name: "Minty Lavender", ref: "Jean Paul Gaultier Le Male", slug: "minty-lavender", notes: "Menthe · Lavande · Vanille", family: "Fougère orientale" },
  { name: "Iris Cedar", ref: "Dior Homme Intense", slug: "iris-cedar", notes: "Iris · Cèdre · Vétiver", family: "Boisé poudré" },
  { name: "Dark Leather", ref: "Tom Ford Ombré Leather", slug: "dark-leather", notes: "Cuir · Épices · Patchouli", family: "Cuir boisé" },
  { name: "Exotic Vanilla", ref: "Armani My Way", slug: "exotic-vanilla", notes: "Fleur d'oranger · Tubéreuse · Vanille", family: "Floral vanillé" },
  { name: "Gardenia Jam", ref: "Jean Paul Gaultier Scandal", slug: "gardenia-jam", notes: "Miel · Gardénia · Patchouli", family: "Floral gourmand" },
  { name: "Spicy Citrus", ref: "Chanel Chance", slug: "spicy-citrus", notes: "Agrumes · Poivre rose · Jasmin", family: "Floral hespéridé" },
  { name: "Floral Musk", ref: "Coco Mademoiselle", slug: "floral-musk", notes: "Orange · Rose · Patchouli", family: "Floral chypré" },
  { name: "Golden Floral", ref: "Dior J'adore", slug: "golden-floral", notes: "Ylang-ylang · Rose · Jasmin", family: "Floral bouquet" },
  { name: "Mystic Jasmine", ref: "Mugler Alien", slug: "mystic-jasmine", notes: "Jasmin · Bois · Ambre", family: "Floral boisé" },
  { name: "Fruity Chypre", ref: "Armani Sì", slug: "fruity-chypre", notes: "Cassis · Rose · Vanille", family: "Chypré fruité" },
  { name: "Lush Gardenia", ref: "Gucci Bloom", slug: "lush-gardenia", notes: "Tubéreuse · Jasmin · Gardénia", family: "Floral blanc" },
  { name: "Ambery Vanilla", ref: "YSL Black Opium", slug: "ambery-vanilla", notes: "Café · Fleur blanche · Vanille", family: "Oriental vanillé" },
  { name: "Jasmine Cedar", ref: "Amouage Reflection", slug: "jasmine-cedar", notes: "Jasmin · Néroli · Cèdre", family: "Floral boisé" },
  { name: "Pineapple Bergamot", ref: "Creed Aventus", slug: "pineapple-bergamot", notes: "Ananas · Bergamote · Bouleau fumé", family: "Chypré fruité" },
  { name: "Addictive Peach", ref: "Ex Nihilo Fleur Narcotique", slug: "addictive-peach", notes: "Pêche · Fleurs blanches · Musc", family: "Floral fruité" },
  { name: "Caramel Orange", ref: "Kilian Love Don't Be Shy", slug: "caramel-orange", notes: "Orange · Caramel · Fleur d'oranger", family: "Gourmand fleuri" },
  { name: "Sandalwood Leather", ref: "Le Labo Santal 33", slug: "sandalwood-leather", notes: "Santal · Cuir · Cardamome", family: "Boisé cuiré" },
  { name: "Smoky Oud", ref: "Louis Vuitton Ombre Nomade", slug: "smoky-oud", notes: "Oud · Framboise · Encens", family: "Oriental boisé" },
  { name: "Galactic Musk", ref: "Marc-Antoine Barrois Ganymede", slug: "galactic-musk", notes: "Mandarine · Musc · Bois minéraux", family: "Boisé musqué" },
  { name: "Dreamy Bloom", ref: "Memo Marfa", slug: "dreamy-bloom", notes: "Tubéreuse · Fleur d'oranger · Musc", family: "Floral blanc" },
  { name: "Sweet Saffron Extrait", ref: "MFK Baccarat Rouge 540 Extrait", slug: "sweet-saffron-extrait", notes: "Safran · Amandes amères · Ambre", family: "Ambré boisé", concentration: "Extrait de parfum" },
  { name: "Sweet Saffron", ref: "MFK Baccarat Rouge 540", slug: "sweet-saffron", notes: "Safran · Jasmin · Ambre", family: "Ambré floral" },
  { name: "Glow Amber", ref: "MFK Grand Soir", slug: "glow-amber", notes: "Ambre · Vanille · Benjoin", family: "Ambré oriental" },
  { name: "Satin Rose", ref: "MFK Oud Satin Mood", slug: "satin-rose", notes: "Rose · Oud · Vanille", family: "Oriental floral" },
  { name: "Oriental Tonka", ref: "Montale Arabians Tonka", slug: "oriental-tonka", notes: "Fève tonka · Rose · Ambre", family: "Oriental gourmand" },
  { name: "Marine Citrus", ref: "Orto Parisi Megamare", slug: "marine-citrus", notes: "Notes marines · Agrumes · Algues", family: "Aquatique hespéridé" },
  { name: "Pink Peony", ref: "Parfums de Marly Delina", slug: "pink-peony", notes: "Litchi · Pivoine · Rose", family: "Floral fruité" },
  { name: "Woody Bergamot Exclusive", ref: "Dior Sauvage Elixir", slug: "woody-bergamot-exclusive", notes: "Épices · Bergamote · Bois de réglisse", family: "Aromatique boisé" },
  { name: "Naughty Rose Exclusive", ref: "", slug: "naughty-rose-exclusive", notes: "Osmanthus · Pêche · Tubéreuse · Rose · Ambre", family: "Floral fruité" },
  { name: "Flirty Caramel", ref: "Carolina Herrera Good Girl", slug: "flirty-caramel", notes: "Amande · Café · Tubéreuse · Fève tonka · Cacao", family: "Floral gourmand" },
  { name: "Orange Blossom", ref: "YSL Libre", slug: "orange-blossom", notes: "Lavande · Mandarine · Fleur d'oranger · Jasmin · Vanille", family: "Floral aromatique" },
  { name: "Fruity Passion", ref: "Tiziana Terenzi Kirke", slug: "fruity-passion", notes: "Fruits rouges · Fruit de la passion · Vanille", family: "Fruité gourmand" },
  { name: "Ambery Orchid", ref: "Tom Ford Black Orchid", slug: "ambery-orchid", notes: "Truffe noire · Orchidée · Patchouli", family: "Oriental floral" },
  { name: "Cherry Almond", ref: "Tom Ford Lost Cherry", slug: "cherry-almond", notes: "Cerise · Amande amère · Tonka", family: "Gourmand fruité" },
  { name: "Woody Oud", ref: "Tom Ford Oud Wood", slug: "woody-oud", notes: "Oud · Bois de rose · Cardamome", family: "Boisé oriental" },
  { name: "Spicy Vanilla", ref: "Tom Ford Tobacco Vanille", slug: "spicy-vanilla", notes: "Tabac · Épices · Vanille", family: "Oriental épicé" },
  { name: "Poetic Amber", ref: "Xerjoff More Than Words", slug: "poetic-amber", notes: "Iris · Vanille · Bois", family: "Ambré poudré" },
  { name: "Sweet Tobacco", ref: "Xerjoff Naxos", slug: "sweet-tobacco", notes: "Lavande · Miel · Tabac", family: "Oriental aromatique" },
];

const scentlabCatalog: BoutiqueProduct[] = scentlabProducts.map((product) => ({
  ...("slug" in product ? { slug: product.slug } : {}),
  name: product.name,
  ref: product.ref,
  notes: product.notes,
  headNotes: product.notes,
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: 6000,
  collection: "scentlab",
  image: product.image,
  family: product.family,
  concentration: "Eau de parfum",
  volume: "50 ml",
  description: `${product.name} par SCENTLAB est une eau de parfum sélectionnée par 2M Parfumerie pour un sillage moderne et facile à porter à Dakar.`,
}));

const scentlabExtraCatalog: BoutiqueProduct[] = scentlabExtraProducts.map((product) => ({
  name: product.name,
  ref: product.ref,
  notes: product.notes,
  headNotes: product.notes,
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: 6000,
  collection: "scentlab",
  image: `/images/optimized/scentlab-${product.slug}-w800.webp`,
  family: product.family,
  concentration: product.concentration ?? "Eau de parfum",
  volume: "50 ml",
  description: `${product.name} par SCENTLAB est une ${(product.concentration ?? "Eau de parfum").toLowerCase()} de 50 ml, aux notes ${product.notes.toLowerCase()}, disponible chez 2M Parfumerie à Dakar.`,
}));

const haqqiProducts: { name: string; ref: string; family: string; notes: string }[] = [
  // Homme
  { name: "Sauvage", ref: "Inspiration Dior Sauvage", family: "Homme", notes: "Frais · Épicé · Iconique" },
  { name: "Sauvage Élixir", ref: "Inspiration Dior Sauvage Élixir", family: "Homme", notes: "Concentré · Épicé · Intense" },
  { name: "Bleu de Chanel", ref: "Inspiration Chanel Bleu de Chanel", family: "Homme", notes: "Boisé · Aromatique · Élégant" },
  { name: "Invictus", ref: "Inspiration Paco Rabanne Invictus", family: "Homme", notes: "Frais · Marin · Énergique" },
  { name: "One Million", ref: "Inspiration Paco Rabanne One Million", family: "Homme", notes: "Épicé · Cuir · Affirmé" },
  { name: "Bois d'Argent", ref: "Inspiration Dior Bois d'Argent", family: "Homme", notes: "Boisé · Noble · Raffiné" },
  { name: "Allure Homme Sport", ref: "Inspiration Chanel Allure Homme Sport", family: "Homme", notes: "Frais · Sportif · Lumineux" },
  { name: "Le Mâle", ref: "Inspiration Jean Paul Gaultier Le Mâle", family: "Homme", notes: "Aromatique · Vanillé · Iconique" },
  { name: "Acqua di Giò", ref: "Inspiration Armani Acqua di Giò", family: "Homme", notes: "Marin · Frais · Solaire" },
  { name: "Stronger With You", ref: "Inspiration Emporio Armani Stronger With You", family: "Homme", notes: "Sucré · Épicé · Chaleureux" },
  { name: "Lacoste Noir L12", ref: "Inspiration Lacoste L12.12 Noir", family: "Homme", notes: "Propre · Élégant · Quotidien" },
  { name: "La Nuit de l'Homme", ref: "Inspiration YSL La Nuit de l'Homme", family: "Homme", notes: "Sombre · Chic · Présent" },
  { name: "Desert Oud", ref: "Inspiration Desert Oud", family: "Homme", notes: "Oud sec · Profond · Signature" },
  { name: "Oud Noir", ref: "Inspiration Oud Noir", family: "Homme", notes: "Boisé · Intense · Enveloppant" },
  { name: "Imagination", ref: "Inspiration Louis Vuitton Imagination", family: "Homme", notes: "Frais · Lumineux · Moderne" },
  { name: "Terre d'Hermès", ref: "Inspiration Hermès Terre d'Hermès", family: "Homme", notes: "Boisé minéral · Sec · Raffiné" },
  { name: "CK Euphoria", ref: "Inspiration Calvin Klein Euphoria", family: "Homme", notes: "Rond · Propre · Facile" },
  { name: "Kouros", ref: "Inspiration YSL Kouros", family: "Homme", notes: "Direct · Expressif · Sans détour" },
  { name: "Burberry Classic", ref: "Inspiration Burberry Classic", family: "Homme", notes: "Classique · Doux · Élégant" },
  { name: "Pegasus", ref: "Inspiration Parfums de Marly Pegasus", family: "Homme", notes: "Crémeux · Élégant · Distinctif" },
  { name: "Creed Aventus", ref: "Inspiration Creed Aventus", family: "Homme", notes: "Frais · Noble · Signature" },
  { name: "African Leather", ref: "Inspiration Memo African Leather", family: "Homme", notes: "Cuir chaud · Sec · Racé" },
  { name: "Encre Noire", ref: "Inspiration Lalique Encre Noire", family: "Homme", notes: "Sombre · Boisé · Texturé" },
  { name: "Black Code", ref: "Inspiration Armani Code", family: "Homme", notes: "Nocturne · Élégant · Subtil" },
  { name: "Man in Black", ref: "Inspiration Bvlgari Man in Black", family: "Homme", notes: "Ambré · Intense · Profond" },
  { name: "Cartier Déclaration", ref: "Inspiration Cartier Déclaration", family: "Homme", notes: "Boisé épicé · Classique · Net" },
  { name: "Dolce Gabbana The One", ref: "Inspiration D&G The One", family: "Homme", notes: "Chaud · Suave · Séduisant" },
  { name: "Valentino Uomo", ref: "Inspiration Valentino Uomo", family: "Homme", notes: "Doux · Ambré · Raffiné" },
  { name: "Scandal Man", ref: "Inspiration Jean Paul Gaultier Scandal Pour Homme", family: "Homme", notes: "Charismatique · Affirmé · Présent" },
  // Unisex
  { name: "Kirke", ref: "Inspiration Tiziana Terenzi Kirke", family: "Unisex", notes: "Fruité · Solaire · Expressif" },
  { name: "Duetto", ref: "Inspiration Duetto", family: "Unisex", notes: "Équilibré · Net · Facile à porter" },
  { name: "Baccarat Rouge 540", ref: "Inspiration MFK Baccarat Rouge 540", family: "Unisex", notes: "Ambré · Lumineux · Reconnaissable" },
  { name: "More Than Words", ref: "Inspiration Xerjoff More Than Words", family: "Unisex", notes: "Élégant · Poétique · Boisé" },
  { name: "Baccarat Rouge 540 Extrait", ref: "Inspiration MFK Baccarat Rouge Extrait", family: "Unisex", notes: "Profond · Dense · Luxueux" },
  { name: "Oud Satin Mood", ref: "Inspiration MFK Oud Satin Mood", family: "Unisex", notes: "Velouté · Oriental · Raffiné" },
  { name: "Tom Ford Tobacco Vanille", ref: "Inspiration Tom Ford Tobacco Vanille", family: "Unisex", notes: "Tabac · Vanille · Gourmand" },
  { name: "Tom Ford Neroli Portofino", ref: "Inspiration Tom Ford Neroli Portofino", family: "Unisex", notes: "Agrumes · Lumineux · Frais" },
  { name: "Tom Ford White Patchouli", ref: "Inspiration Tom Ford White Patchouli", family: "Unisex", notes: "Chic · Blanc · Boisé" },
  { name: "Tom Ford Soleil Blanc", ref: "Inspiration Tom Ford Soleil Blanc", family: "Unisex", notes: "Solaire · Doux · Élégant" },
  { name: "Tom Ford Ombré Leather", ref: "Inspiration Tom Ford Ombré Leather", family: "Unisex", notes: "Cuir profond · Sombre · Sophistiqué" },
  // Femme
  { name: "My Way", ref: "Inspiration Armani My Way", family: "Femme", notes: "Floral · Lumineux · Moderne" },
  { name: "Hypnotic Poison", ref: "Inspiration Dior Hypnotic Poison", family: "Femme", notes: "Vanille · Amande · Envoûtant" },
  { name: "Narciso Pink for Her", ref: "Inspiration Narciso Rodriguez For Her", family: "Femme", notes: "Musqué · Floral · Sensuel" },
  { name: "Black Opium", ref: "Inspiration YSL Black Opium", family: "Femme", notes: "Café · Vanille · Addictif" },
  { name: "Coco Mademoiselle", ref: "Inspiration Chanel Coco Mademoiselle", family: "Femme", notes: "Chypré · Élégant · Iconique" },
  { name: "Scandal", ref: "Inspiration JPG Scandal", family: "Femme", notes: "Miel · Gourmand · Affirmé" },
  { name: "So Scandal", ref: "Inspiration JPG So Scandal", family: "Femme", notes: "Floral · Sucré · Pétillant" },
  { name: "La Nuit Trésor", ref: "Inspiration Lancôme La Nuit Trésor", family: "Femme", notes: "Gourmand · Velouté · Féminin" },
  { name: "Suprême Bouquet", ref: "Inspiration Suprême Bouquet", family: "Femme", notes: "Floral riche · Lumineux · Généreux" },
  { name: "Guidance", ref: "Inspiration Amouage Guidance", family: "Femme", notes: "Floral · Crémeux · Élégant" },
  { name: "Chanel Chance", ref: "Inspiration Chanel Chance", family: "Femme", notes: "Doux · Pétillant · Intemporel" },
  { name: "Euphoria Femme", ref: "Inspiration Calvin Klein Euphoria", family: "Femme", notes: "Fruité · Sensuel · Aimable" },
  { name: "La Vie Est Belle", ref: "Inspiration Lancôme La Vie Est Belle", family: "Femme", notes: "Gourmand · Lumineux · Réconfortant" },
  { name: "YSL Cinéma", ref: "Inspiration YSL Cinéma", family: "Femme", notes: "Chaleureux · Glamour · Assumé" },
  { name: "Manifesto", ref: "Inspiration YSL Manifesto", family: "Femme", notes: "Moderne · Doux · Affirmé" },
  { name: "Bright Crystal", ref: "Inspiration Versace Bright Crystal", family: "Femme", notes: "Aérien · Propre · Lumineux" },
  { name: "Lolita Lempicka", ref: "Inspiration Lolita Lempicka", family: "Femme", notes: "Sucré · Original · Féminin" },
  { name: "Dior Addict", ref: "Inspiration Dior Addict", family: "Femme", notes: "Profond · Sensuel · Marqué" },
  { name: "Diesel Fuel for Life", ref: "Inspiration Diesel Fuel for Life", family: "Femme", notes: "Audacieux · Doux · Présent" },
  { name: "Si Passione", ref: "Inspiration Armani Si Passione", family: "Femme", notes: "Rouge · Fruité · Intensément féminin" },
];

// Photos réelles des flacons Haqqi (fond détouré). Les autres gardent la photo de la collection.
const haqqiPhotos: Record<string, string> = {
  "Scandal Man": "scandal-man",
  "Baccarat Rouge 540": "baccarat-rouge-540",
  "My Way": "my-way",
  "Dolce Gabbana The One": "dolce-gabbana-the-one",
  "YSL Cinéma": "ysl-cinema",
  "Acqua di Giò": "acqua-di-gio",
  "Sauvage": "sauvage",
  "Oud Satin Mood": "oud-satin-mood",
  "Tom Ford Neroli Portofino": "tom-ford-neroli-portofino",
  "Tom Ford Soleil Blanc": "tom-ford-soleil-blanc",
  "Le Mâle": "le-male",
  "More Than Words": "more-than-words",
  "Tom Ford Ombré Leather": "tom-ford-ombre-leather",
  "Cartier Déclaration": "cartier-declaration",
  "Desert Oud": "desert-oud",
  "Baccarat Rouge 540 Extrait": "baccarat-rouge-540-extrait",
  "Hypnotic Poison": "hypnotic-poison",
  "Terre d'Hermès": "terre-d-hermes",
  "Pegasus": "pegasus",
  "Creed Aventus": "creed-aventus",
  "Valentino Uomo": "valentino-uomo",
  "Tom Ford White Patchouli": "tom-ford-white-patchouli",
  "Kirke": "kirke",
  "Black Opium": "black-opium",
  "Invictus": "invictus",
  "Allure Homme Sport": "allure-homme-sport",
};

const haqqiCatalog: BoutiqueProduct[] = haqqiProducts.map((product) => ({
  name: product.name,
  ref: "",
  notes: product.notes,
  headNotes: product.notes,
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: 4000,
  collection: "haqqi",
  image: haqqiPhotos[product.name]
    ? `/images/optimized/haqqi-${haqqiPhotos[product.name]}-w800.webp`
    : haqqiCollectionImage,
  family: product.family,
  concentration: "Eau de parfum",
  volume: "40 ml",
  description: `${product.name} de la collection Haqqi : une eau de parfum de 40 ml (${product.notes.toLowerCase()}), disponible à l'unité chez 2M Parfumerie ou dans le Pack de 3 Haqqi à composer.`,
}));

const pocketProducts: { name: string; ref: string; family: "Homme" | "Unisex" | "Femme"; notes: string; image: string }[] = [
  // Homme
  { name: "Le Mâle", ref: "Inspiration JPG Le Mâle", family: "Homme", notes: "Frais lavandé · Sucré", image: pocketHommeImage },
  { name: "One Million", ref: "Inspiration Paco Rabanne One Million", family: "Homme", notes: "Épicé · Doré", image: pocketHommeImage },
  { name: "Zara Tobacco Collection", ref: "Inspiration Zara Tobacco", family: "Homme", notes: "Tabac chaleureux", image: pocketHommeImage },
  { name: "CK Eternity", ref: "Inspiration Calvin Klein Eternity", family: "Homme", notes: "Frais · Boisé classique", image: pocketHommeImage },
  { name: "Killian Back to Black", ref: "Inspiration Killian Back to Black", family: "Homme", notes: "Tabac · Miel sensuel", image: pocketHommeImage },
  { name: "Killian Intoxicated", ref: "Inspiration Killian Intoxicated", family: "Homme", notes: "Café · Cardamome", image: pocketHommeImage },
  { name: "Killian Amber Oud", ref: "Inspiration Killian Amber Oud", family: "Homme", notes: "Oud · Ambré profond", image: pocketHommeImage },
  { name: "Killian Straight to Heaven", ref: "Inspiration Killian Straight to Heaven", family: "Homme", notes: "Rhum · Boisé", image: pocketHommeImage },
  { name: "Killian Good Girl Gone Bad (H)", ref: "Inspiration Killian Good Girl Gone Bad", family: "Homme", notes: "Floral · Fruité magnétique", image: pocketHommeImage },
  { name: "Tom Ford Tuscan Leather", ref: "Inspiration Tom Ford Tuscan Leather", family: "Homme", notes: "Cuir · Framboise", image: pocketHommeImage },
  { name: "Tom Ford Tobacco Oud", ref: "Inspiration Tom Ford Tobacco Oud", family: "Homme", notes: "Tabac · Oud épicé", image: pocketHommeImage },
  { name: "Tom Ford Noir Extrême", ref: "Inspiration Tom Ford Noir Extrême", family: "Homme", notes: "Gourmand · Boisé chaud", image: pocketHommeImage },
  { name: "Parfums de Marly Pegasus", ref: "Inspiration Parfums de Marly Pegasus", family: "Homme", notes: "Amande · Vanille élégant", image: pocketHommeImage },
  { name: "Creed Aventus", ref: "Inspiration Creed Aventus", family: "Homme", notes: "Ananas · Fumé iconique", image: pocketHommeImage },
  { name: "Nasomatto Black Afgano", ref: "Inspiration Nasomatto Black Afgano", family: "Homme", notes: "Boisé · Résineux intense", image: pocketHommeImage },
  { name: "Amouage Interlude", ref: "Inspiration Amouage Interlude", family: "Homme", notes: "Encens · Ambre puissant", image: pocketHommeImage },
  { name: "Amouage Reflection", ref: "Inspiration Amouage Reflection", family: "Homme", notes: "Floral vert raffiné", image: pocketHommeImage },
  { name: "Amouage Opus", ref: "Inspiration Amouage Opus", family: "Homme", notes: "Boisé oriental noble", image: pocketHommeImage },
  { name: "Mousuf", ref: "Inspiration Mousuf", family: "Homme", notes: "Oriental signature", image: pocketHommeImage },
  { name: "Byredo Mojave Ghost", ref: "Inspiration Byredo Mojave Ghost", family: "Homme", notes: "Boisé minéral aérien", image: pocketHommeImage },
  { name: "Byredo Bal d’Afrique", ref: "Inspiration Byredo Bal d’Afrique", family: "Homme", notes: "Vétiver · Agrumes solaire", image: pocketHommeImage },
  { name: "Killian Black Phantom", ref: "Inspiration Killian Black Phantom", family: "Homme", notes: "Café · Rhum gourmand", image: pocketHommeImage },
  { name: "Dsquared2 Wood", ref: "Inspiration Dsquared2 Wood", family: "Homme", notes: "Boisé moderne dynamique", image: pocketHommeImage },
  { name: "Baccarat Rouge 540", ref: "Inspiration MFK Baccarat Rouge 540", family: "Homme", notes: "Ambré · Safrané iconique", image: pocketHommeImage },
  { name: "Kirke", ref: "Inspiration Tiziana Terenzi Kirke", family: "Homme", notes: "Fruité solaire", image: pocketHommeImage },
  // Femme
  { name: "Zara Oriental", ref: "Inspiration Zara Oriental", family: "Femme", notes: "Ambre · Vanille chaleureux", image: pocketFemmeImage },
  { name: "Zara Orchid", ref: "Inspiration Zara Orchid", family: "Femme", notes: "Floral oriental vibrant", image: pocketFemmeImage },
  { name: "Ex Nihilo Fleur Narcotique", ref: "Inspiration Ex Nihilo Fleur Narcotique", family: "Femme", notes: "Floral fruité poudré", image: pocketFemmeImage },
  { name: "Nasomatto Narcotique", ref: "Inspiration Nasomatto Narcotique", family: "Femme", notes: "Floral envoûtant intense", image: pocketFemmeImage },
  { name: "La Vie Est Belle", ref: "Inspiration Lancôme La Vie Est Belle", family: "Femme", notes: "Gourmand iris", image: pocketFemmeImage },
  { name: "La Vie Est Belle Floral", ref: "Inspiration Lancôme La Vie Est Belle Florale", family: "Femme", notes: "Florale lumineuse", image: pocketFemmeImage },
  { name: "Gucci Bloom", ref: "Inspiration Gucci Bloom", family: "Femme", notes: "Tubéreuse · Jasmin", image: pocketFemmeImage },
  { name: "Coco Mademoiselle", ref: "Inspiration Chanel Coco Mademoiselle", family: "Femme", notes: "Patchouli · Rose chypré", image: pocketFemmeImage },
  { name: "Chanel Chance", ref: "Inspiration Chanel Chance", family: "Femme", notes: "Floral pétillant", image: pocketFemmeImage },
  { name: "Chanel Chance Eau Tendre", ref: "Inspiration Chanel Chance Eau Tendre", family: "Femme", notes: "Floral fruité doux", image: pocketFemmeImage },
  { name: "Armani Si", ref: "Inspiration Armani Si", family: "Femme", notes: "Cassis · Ambré sensuel", image: pocketFemmeImage },
  { name: "CK Euphoria", ref: "Inspiration Calvin Klein Euphoria", family: "Femme", notes: "Orchidée noire envoûtant", image: pocketFemmeImage },
  { name: "Creed Aventus for Her", ref: "Inspiration Creed Aventus for Her", family: "Femme", notes: "Floral fruité chic", image: pocketFemmeImage },
  { name: "212 Sexy Women", ref: "Inspiration Carolina Herrera 212 Sexy", family: "Femme", notes: "Vanille · Fleurs piquantes", image: pocketFemmeImage },
  { name: "212 VIP Women", ref: "Inspiration Carolina Herrera 212 VIP", family: "Femme", notes: "Rhum · Musc festif", image: pocketFemmeImage },
  { name: "Hermès Jour", ref: "Inspiration Hermès Jour d’Hermès", family: "Femme", notes: "Floral lumineux frais", image: pocketFemmeImage },
  { name: "Dior J’adore", ref: "Inspiration Dior J’adore", family: "Femme", notes: "Bouquet floral solaire", image: pocketFemmeImage },
  { name: "Calvin Klein Eternity Femme", ref: "Inspiration Calvin Klein Eternity", family: "Femme", notes: "Floral blanc romantique", image: pocketFemmeImage },
  { name: "Alien", ref: "Inspiration Mugler Alien", family: "Femme", notes: "Jasmin · Ambré hypnotique", image: pocketFemmeImage },
  { name: "Killian Good Girl Gone Bad (F)", ref: "Inspiration Killian Good Girl Gone Bad", family: "Femme", notes: "Tubéreuse · Rose magnétique", image: pocketFemmeImage },
  { name: "Killian Liaisons Dangereuses", ref: "Inspiration Killian Liaisons Dangereuses", family: "Femme", notes: "Rose · Prune sensuelle", image: pocketFemmeImage },
  { name: "Versace Crystal Noir", ref: "Inspiration Versace Crystal Noir", family: "Femme", notes: "Gardénia · Ambré mystérieux", image: pocketFemmeImage },
  { name: "DKNY Be Delicious", ref: "Inspiration DKNY Be Delicious", family: "Femme", notes: "Pomme verte pétillante", image: pocketFemmeImage },
  { name: "Bulgari Omnia", ref: "Inspiration Bvlgari Omnia", family: "Femme", notes: "Épices · Musc raffiné", image: pocketFemmeImage },
];

const pocketCatalog: BoutiqueProduct[] = pocketProducts.map((product) => ({
  name: product.name,
  ref: product.ref,
  notes: product.notes,
  headNotes: product.notes,
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: 2500,
  collection: "pocket",
  image: product.image,
  family: product.family,
  concentration: "Eau de parfum",
  volume: "50 ml",
  description: `${product.name} fait partie des Parfums de poche 2M : un petit format pratique à glisser dans le sac. À choisir dans le pack de 5 parfums de poche à 10 000 FCFA.`,
}));

// Fragrance Library : 38 eaux de parfum 100 ml à 35 000 F, un titre de roman par flacon.
// ref = parfum d'inspiration (vide pour Old Book, création de la maison).
// Les 6 fiches déjà créées dans l'admin gardent leurs données (même adresse = même fiche).
const libraryProducts: { name: string; ref: string; notes: string; family: string; head?: string; heart?: string; base?: string; concentration?: string }[] = [
  { name: "The Gambler", ref: "Xerjoff Lira", notes: "Lavande · Caramel · Vanille", family: "Gourmand ambré" },
  { name: "Crime and Punishment", ref: "MFK Baccarat Rouge 540", notes: "Safran · Jasmin · Ambre gris", family: "Ambré floral" },
  { name: "War and Peace", ref: "Frédéric Malle Portrait of a Lady", notes: "Rose · Patchouli · Encens", family: "Floral oriental" },
  { name: "The Golden Bowl", ref: "Tiziana Terenzi Kirke", notes: "Fruit de la passion · Pêche · Musc", family: "Fruité musqué" },
  { name: "The Red and the Black", ref: "Bond No. 9 New York Amber", notes: "", family: "Ambré" },
  { name: "The Secret Garden", ref: "Sospiro Erba Pura", notes: "Agrumes · Fruits · Musc blanc", family: "Fruité musqué" },
  { name: "The Age of Innocence", ref: "Montale Roses Musk", notes: "Rose · Jasmin · Musc", family: "Floral musqué" },
  { name: "The Grapes of Wrath", ref: "Initio Baraka", notes: "", family: "Fragrance Library" },
  { name: "Republic", ref: "MFK Silk Mood", notes: "", family: "Fragrance Library" },
  { name: "Notes from Underground", ref: "Nasomatto Black Afgano", notes: "Encens · Oud · Tabac", family: "Boisé fumé" },
  { name: "The Brothers Karamazov", ref: "Nasomatto Duro", notes: "", family: "Boisé" },
  { name: "The Trial", ref: "Tom Ford Tobacco Vanille", notes: "Tabac · Vanille · Fève tonka", family: "Oriental épicé" },
  { name: "Things Fall Apart", ref: "Kilian Black Aphrodisiac", notes: "", family: "Fragrance Library" },
  { name: "Hamlet", ref: "Tom Ford Oud Wood", notes: "Oud · Santal · Cardamome", family: "Boisé" },
  { name: "The Sun Also Rises", ref: "Nasomatto Baraonda", notes: "Whisky · Rose · Bois", family: "Boisé ambré" },
  { name: "Under the Volcano", ref: "Hervé Gambs Ombre Sauvage", notes: "", family: "Fragrance Library" },
  { name: "The Stranger", ref: "Dior Oud Ispahan", notes: "Rose · Oud · Patchouli", family: "Oriental floral" },
  { name: "Heart of Darkness", ref: "MFK Oud Satin Mood", notes: "Rose · Oud · Vanille", family: "Oriental boisé" },
  { name: "The Alchemist", ref: "Sultan", notes: "", family: "Fragrance Library", concentration: "Extrait de parfum" },
  { name: "Hard Times", ref: "Montale Arabians Tonka", notes: "Safran · Oud · Fève tonka", family: "Oriental boisé", concentration: "Extrait de parfum" },
  { name: "Great Expectations", ref: "Escentric Molecules Escentric 02", notes: "Ambroxan · Bois · Musc", family: "Boisé musqué" },
  { name: "1984", ref: "Ex Nihilo Fleur Narcotique", notes: "Pêche · Fleurs blanches · Musc", family: "Floral fruité" },
  { name: "The Magic Mountain", ref: "Creed Silver Mountain Water", notes: "Bergamote · Thé vert · Cassis", family: "Frais aromatique" },
  { name: "The Great Gatsby", ref: "Creed Aventus", notes: "Ananas · Bergamote · Bouleau fumé", family: "Chypré fruité" },
  { name: "Anna Karenina", ref: "Kilian Good Girl Gone Bad", notes: "Tubéreuse · Jasmin · Rose", family: "Floral blanc" },
  { name: "The Call of the Wild", ref: "Amouage Honour Man", notes: "Poivre · Encens · Fève tonka", family: "Boisé épicé", head: "Poivre rose · Poivre", heart: "Géranium · Élémi · Muscade", base: "Encens · Vétiver · Cèdre de Virginie · Musc · Fève tonka · Patchouli" },
  { name: "One Hundred Years of Solitude", ref: "Le Labo Santal 33", notes: "Santal · Cuir · Cardamome", family: "Boisé cuiré" },
  { name: "Sense and Sensibility", ref: "Vertus Paçuli", notes: "", family: "Fragrance Library" },
  { name: "Emma", ref: "Parfums de Marly Delina", notes: "Litchi · Rose · Vanille", family: "Floral fruité" },
  { name: "Lost Illusions", ref: "Initio Side Effect", notes: "Rhum · Tabac · Vanille", family: "Oriental épicé" },
  { name: "In Search of Lost Time", ref: "Xerjoff More Than Words", notes: "Oud · Rose · Patchouli", family: "Oriental boisé" },
  { name: "To the Lighthouse", ref: "Xerjoff 1861 Naxos", notes: "Miel · Tabac · Lavande", family: "Gourmand tabac" },
  { name: "The Overcoat", ref: "Amouage Interlude Man", notes: "Encens · Oud · Ambre", family: "Boisé fumé" },
  { name: "The Castle", ref: "Initio Oud for Greatness", notes: "Oud · Safran · Lavande", family: "Oriental boisé" },
  { name: "Vanity Fair", ref: "Xerjoff Alexandria II", notes: "Rose · Oud · Ambre", family: "Oriental boisé" },
  { name: "A Tale of Two Cities", ref: "MFK Gentle Fluidity", notes: "Genièvre · Muscade · Vanille", family: "Aromatique musqué" },
  { name: "Utopia", ref: "Marc-Antoine Barrois Ganymede", notes: "Mandarine · Musc · Bois minéraux", family: "Boisé musqué" },
  { name: "Old Book", ref: "", notes: "", family: "Création Fragrance Library" },
];

const libraryCatalog: BoutiqueProduct[] = libraryProducts.map((product) => {
  const slug = cleanSlug(product.name);
  const notes = product.notes || "Notes à préciser";
  const inspiration = product.ref ? ` Inspiration : ${product.ref}.` : " Une création originale de la maison Fragrance Library.";
  const sillage = product.notes ? ` aux notes ${product.notes.toLowerCase()},` : "";
  const concentration = product.concentration ?? "Eau de parfum";
  return {
    slug,
    name: product.name,
    ref: product.ref,
    notes,
    headNotes: product.head || notes,
    heartNotes: product.heart || "Notes à préciser",
    baseNotes: product.base || "Notes à préciser",
    price: 35000,
    collection: "library",
    image: `/images/optimized/library-${slug}-w800.webp`,
    family: product.family,
    concentration,
    volume: "100 ml",
    description: `${product.name}, de la collection Fragrance Library : ${concentration === "Eau de parfum" ? "une eau de parfum" : "un extrait de parfum"} de 100 ml${sillage} présentée dans son coffret d'origine.${inspiration} Disponible chez 2M Parfumerie à 35 000 F, livraison partout au Sénégal.`,
  };
});

// Coffrets de grandes marques : tous à 90 000 F. Photos tirées du stock réel (recadrées sur fond blanc).
const coffretProducts: { slug: string; name: string; brand: string; contents: string; family: "Femme" | "Homme"; notes: string }[] = [
  { slug: "chloe-signature", name: "Coffret Chloé Signature", brand: "Chloé", contents: "eau de parfum, lait pour le corps et miniature", family: "Femme", notes: "Rose · Pivoine · Musc" },
  { slug: "chloe-nomade", name: "Coffret Chloé Nomade", brand: "Chloé", contents: "eau de parfum et lait pour le corps", family: "Femme", notes: "Mirabelle · Freesia · Mousse de chêne" },
  { slug: "lancome-la-vie-est-belle", name: "Coffret Lancôme La Vie est Belle", brand: "Lancôme", contents: "eau de parfum, lait pour le corps 50 ml et vaporisateur de voyage", family: "Femme", notes: "Iris · Praliné · Vanille" },
  { slug: "boucheron-quatre", name: "Coffret Boucheron Quatre", brand: "Boucheron", contents: "eau de parfum, lait parfumé pour le corps et gel douche parfumé", family: "Femme", notes: "Floral · Ambré · Musc" },
  { slug: "gaultier-divine", name: "Coffret Gaultier Divine Le Parfum", brand: "Jean Paul Gaultier", contents: "Le Parfum et lait pour le corps", family: "Femme", notes: "Fleurs blanches · Ambre · Gourmand" },
  { slug: "million-gold-for-her", name: "Coffret Rabanne Million Gold For Her", brand: "Rabanne", contents: "parfum et vaporisateur de voyage", family: "Femme", notes: "Floral · Doré · Ambré" },
  { slug: "burberry-goddess", name: "Coffret Burberry Goddess", brand: "Burberry", contents: "eau de parfum, lait pour le corps et vaporisateur de voyage", family: "Femme", notes: "Vanille · Lavande · Cacao" },
  { slug: "cerruti-1881-femme", name: "Coffret Cerruti 1881 Pour Femme", brand: "Cerruti", contents: "eau de toilette et lait pour le corps", family: "Femme", notes: "Floral · Frais · Musc" },
  { slug: "hugo-man", name: "Coffret Hugo Man", brand: "Hugo Boss", contents: "eau de toilette et déodorant spray 150 ml", family: "Homme", notes: "Pomme verte · Sauge · Sapin" },
  { slug: "rabanne-1-million",name: "Coffret Rabanne 1 Million", brand: "Rabanne", contents: "eau de toilette, déodorant spray et vaporisateur de voyage", family: "Homme", notes: "Mandarine · Cannelle · Cuir" },
  { slug: "montblanc-explorer-platinum", name: "Coffret Montblanc Explorer Platinum", brand: "Montblanc", contents: "eau de parfum, gel douche et vaporisateur de voyage", family: "Homme", notes: "Boisé · Aromatique · Frais" },
  { slug: "terre-d-hermes", name: "Coffret Terre d'Hermès", brand: "Hermès", contents: "flacon 75 ml, vaporisateur de voyage 15 ml et 40 ml", family: "Homme", notes: "Orange · Poivre · Vétiver" },
  { slug: "cerruti-1881", name: "Coffret Cerruti 1881 Pour Homme", brand: "Cerruti", contents: "eau de toilette 100 ml et déodorant spray 150 ml", family: "Homme", notes: "Frais · Aromatique · Boisé" },
  { slug: "bad-boy", name: "Coffret Carolina Herrera Bad Boy", brand: "Carolina Herrera", contents: "eau de toilette et ses produits assortis", family: "Homme", notes: "Poivre · Sauge · Cacao" },
  { slug: "dolce-gabbana", name: "Coffret Dolce&Gabbana", brand: "Dolce&Gabbana", contents: "parfum et produits assortis", family: "Homme", notes: "Notes à préciser" },
  { slug: "givenchy", name: "Coffret Givenchy", brand: "Givenchy", contents: "parfum et produits assortis", family: "Homme", notes: "Notes à préciser" },
];

const coffretCatalog: BoutiqueProduct[] = coffretProducts.map((product) => ({
  slug: `coffret-${product.slug}`,
  name: product.name,
  ref: product.brand,
  notes: product.notes,
  headNotes: product.notes,
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: 90000,
  collection: "coffrets",
  image: `/images/optimized/coffret-${product.slug}-w800.webp`,
  family: product.family,
  concentration: "Coffret",
  volume: "Coffret",
  description: `${product.name} : un coffret cadeau original ${product.brand} avec ${product.contents}. Prêt à offrir, disponible chez 2M Parfumerie à 90 000 F, livraison offerte partout au Sénégal.`,
}));

// Parfums Dubai ajoutés le 27/10/2026 (Maison Asrar, Gulf Orchid) : prix fournisseur + 7 000 F, arrondi au millier supérieur.
const dubaiProducts: { slug: string; name: string; brand: string; price: number; volume: string; concentration: string; family: string; contents?: string }[] = [
  { slug: "vanilla-aura", name: "Vanilla Aura", brand: "Maison Asrar", price: 26000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "vanilla-seduction", name: "Vanilla Seduction", brand: "Maison Asrar", price: 26000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "nada", name: "Nada", brand: "Maison Asrar", price: 25000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "soiree", name: "Soirée", brand: "Maison Asrar", price: 25000, volume: "110 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "legacy-royal-collection", name: "Legacy Royal Collection", brand: "Maison Asrar", price: 30000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "heavenly-lychee", name: "Heavenly Lychee", brand: "Gulf Orchid", price: 20000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "naughty-vanilla", name: "Naughty Vanilla", brand: "Gulf Orchid", price: 24000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "vanilla-addiction", name: "Vanilla Addiction", brand: "Gulf Orchid", price: 20000, volume: "100 ml", concentration: "Eau de parfum", family: "Parfum Dubai" },
  { slug: "gulf-orchid-gift-set", name: "Coffret Gulf Orchid 4 parfums", brand: "Gulf Orchid", price: 29000, volume: "4 x 30 ml", concentration: "Eau de parfum", family: "Coffret Dubai", contents: "4 eaux de parfum de 30 ml : Sweet Cherry Kiss, Sweet Like Candy, Vanilla Addiction et Pink Marshmallow" },
  { slug: "musk-collection-pomegranate", name: "Coffret Musk Collection Pomegranate", brand: "Gulf Orchid", price: 27000, volume: "Coffret", concentration: "Coffret", family: "Coffret Dubai", contents: "une brume pour le corps, une eau de parfum et une huile parfumée Musk Collection Pomegranate" },
];

const dubaiCatalog: BoutiqueProduct[] = dubaiProducts.map((product) => ({
  slug: product.slug,
  name: product.name,
  ref: product.brand,
  notes: "Notes à préciser",
  headNotes: "Notes à préciser",
  heartNotes: "Notes à préciser",
  baseNotes: "Notes à préciser",
  price: product.price,
  collection: "dubai",
  image: `/images/optimized/dubai-${product.slug}-w800.webp`,
  family: product.family,
  concentration: product.concentration,
  volume: product.volume,
  description: product.contents
    ? `${product.name} de ${product.brand} : ${product.contents}. Présenté dans sa boîte d'origine, disponible chez 2M Parfumerie, livraison partout au Sénégal.`
    : `${product.name} de ${product.brand}, ${product.concentration.toLowerCase()} ${product.volume} dans sa boîte d'origine. Disponible chez 2M Parfumerie, livraison partout au Sénégal.`,
}));

export const catalog: BoutiqueProduct[] = [...takeoffCatalog, ...scentlabCatalog, ...scentlabExtraCatalog, ...haqqiCatalog, ...pocketCatalog, ...libraryCatalog, ...coffretCatalog, ...dubaiCatalog];

// Adresse propre : minuscules, sans accents, mots séparés par des tirets.
export function cleanSlug(value: string) {
  let text = value;
  try {
    text = decodeURIComponent(value);
  } catch {}
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function slugifyProduct(product: BoutiqueProduct) {
  // Une adresse saisie à la main dans l'admin (espaces, parenthèses…) est nettoyée aussi.
  if (product.slug) return cleanSlug(product.slug);
  return cleanSlug(`${product.name}-${product.ref}`);
}

export function findProductBySlug(slug: string) {
  const wanted = cleanSlug(slug);
  return catalog.find((product) => slugifyProduct(product) === wanted);
}

export function productImages(product: BoutiqueProduct) {
  return Array.from(new Set([product.image, ...(product.imageUrls ?? [])].filter(Boolean)));
}

export function optimizedProductImageBase(image: string) {
  if (!image.startsWith("/images/")) return "";
  const fileName = image.split("/").pop() ?? "";
  return fileName.replace(/-w\d+\.[a-zA-Z]+$/, "");
}

// Photos envoyées depuis l'admin : compressées et redimensionnées par Vercel (WebP/AVIF).
const REMOTE_IMAGE_PREFIX = "https://urquhrasvuexivrkevad.supabase.co/storage/v1/object/public/";
const isRemoteProductImage = (image: string) => image.startsWith(REMOTE_IMAGE_PREFIX);
const remoteImageUrl = (image: string, width: number) =>
  `/_vercel/image?url=${encodeURIComponent(image)}&w=${width}&q=75`;

export function optimizedProductImageUrl(image: string, width = 800) {
  if (isRemoteProductImage(image)) return remoteImageUrl(image, width);
  const base = optimizedProductImageBase(image);
  return base ? `/images/optimized/${base}-w${width}.webp` : image;
}

export function optimizedProductImageSet(image: string) {
  if (isRemoteProductImage(image)) {
    const set = [1200, 800, 400].map((w) => `${remoteImageUrl(image, w)} ${w}w`).join(", ");
    return { avif: "", webp: set };
  }
  const base = optimizedProductImageBase(image);
  if (!base) return { avif: "", webp: "" };
  return {
    avif: `/images/optimized/${base}-w1200.avif 1200w, /images/optimized/${base}-w800.avif 800w, /images/optimized/${base}-w400.avif 400w`,
    webp: `/images/optimized/${base}-w1200.webp 1200w, /images/optimized/${base}-w800.webp 800w, /images/optimized/${base}-w400.webp 400w`,
  };
}

// Prix barrés : ancien prix affiché à côté du prix actuel, par collection.
const compareAtPrices: Record<string, number> = {
  callisto: 80000,
  "soie-sublime": 120000,
};

export function compareAtPrice(product: { collection: string; price: number }) {
  const old = compareAtPrices[product.collection];
  return old && old > product.price ? old : undefined;
}

export function formatPrice(price: number) {
  return `${new Intl.NumberFormat("fr-FR").format(price)} FCFA`;
}

export function productOrderUrl(product: BoutiqueProduct) {
  const price = new Intl.NumberFormat("fr-FR").format(product.price);
  const message = `Bonjour 2M Parfumerie 👋 Je souhaite commander *${product.name}* — ${price} FCFA. Est-il disponible ?`;
  return `https://wa.me/221761923441?text=${encodeURIComponent(message)}`;
}

export function collectionLabel(value: Collection) {
  const known = collectionFilters.find((filter) => filter.value === value)?.label;
  if (known) return known;
  const custom = customCollectionLabels.get(value);
  if (custom) return custom;
  const words = value.replace(/-/g, " ").trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Collection";
}

// Filtres de la boutique : les catégories connues, puis celles créées dans l'admin.
export function collectionFiltersFor(products: { collection: Collection }[]) {
  const custom = Array.from(new Set(products.map((product) => product.collection)))
    .filter((value) => !isKnownCollection(value))
    .map((value) => ({ label: collectionLabel(value), value: value as Collection }))
    .sort((a, b) => a.label.localeCompare(b.label, "fr"));
  return [...(collectionFilters as { label: string; value: Collection }[]), ...custom];
}
