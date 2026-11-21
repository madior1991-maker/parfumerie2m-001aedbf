import { formatPrice, type BoutiqueProduct } from "@/lib/catalog-data";
import { whatsappUrl } from "@/lib/perfume-data";

export type Pour = "homme" | "femme" | "tous";
export type Ambiance = "frais" | "gourmand" | "boise" | "floral";
export type Budget = "petit" | "plus" | "tous";
export type Moment = "jour" | "soir" | "cadeau";
export type Answers = { pour: Pour; ambiance: Ambiance; budget: Budget; moment: Moment };

type Option<T extends string> = { value: T; label: string; hint: string; emoji: string };

export const questions = [
  {
    key: "pour",
    title: "C'est pour qui ?",
    options: [
      { value: "homme", label: "Homme", hint: "Parfums masculins et mixtes", emoji: "🧔🏾" },
      { value: "femme", label: "Femme", hint: "Parfums féminins et mixtes", emoji: "👩🏾" },
      { value: "tous", label: "Peu importe", hint: "Montre-moi tout", emoji: "✨" },
    ] as Option<Pour>[],
  },
  {
    key: "ambiance",
    title: "Quelle ambiance tu aimes ?",
    options: [
      { value: "frais", label: "Frais et propre", hint: "Agrumes, marin, lumineux", emoji: "🍋" },
      { value: "gourmand", label: "Sucré et gourmand", hint: "Vanille, caramel, fruits", emoji: "🍯" },
      { value: "boise", label: "Boisé et oriental", hint: "Oud, ambre, épices, cuir", emoji: "🪵" },
      { value: "floral", label: "Floral", hint: "Rose, jasmin, fleurs blanches", emoji: "🌸" },
    ] as Option<Ambiance>[],
  },
  {
    key: "budget",
    title: "Ton budget par parfum ?",
    options: [
      { value: "petit", label: "Moins de 10 000 F", hint: "Parfums de poche, Haqqi, SCENTLAB", emoji: "💸" },
      { value: "plus", label: "10 000 F et plus", hint: "Takeoff, Dubai, grandes marques", emoji: "💎" },
      { value: "tous", label: "Peu importe", hint: "Le bon parfum d'abord", emoji: "🤷🏾" },
    ] as Option<Budget>[],
  },
  {
    key: "moment",
    title: "Tu le portes quand ?",
    options: [
      { value: "jour", label: "Tous les jours", hint: "Bureau, école, sorties", emoji: "☀️" },
      { value: "soir", label: "Le soir", hint: "Dîners, cérémonies, fêtes", emoji: "🌙" },
      { value: "cadeau", label: "C'est un cadeau", hint: "Pour faire plaisir", emoji: "🎁" },
    ] as Option<Moment>[],
  },
] as const;

const KEYWORDS: Record<Ambiance, string[]> = {
  frais: [
    "frais", "propre", "lumineux", "aerien", "marin", "marine", "solaire", "agrume", "citr", "bergamote",
    "mandarine", "neroli", "petillant", "vert", "aquatique", "lavand", "mineral", "hesperide", "aromatique",
    "menthe", "the ", "gingembre", "pomme",
  ],
  gourmand: [
    "sucre", "vanill", "gourmand", "caramel", "amande", "cafe", "miel", "chocolat", "praline", "tonka",
    "rhum", "cremeux", "fruit", "prune", "framboise", "cassis", "noisette", "cognac", "addictif",
  ],
  boise: [
    "boise", "bois", "oud", "ambr", "epic", "cuir", "tabac", "encens", "resin", "safran", "oriental",
    "patchouli", "vetiver", "sombre", "intense", "profond", "nocturne", "chaud",
  ],
  floral: [
    "floral", "florale", "fleur", "rose", "jasmin", "tubereuse", "iris", "violette", "gardenia", "orchidee",
    "bouquet", "poudre", "pivoine", "chypre",
  ],
};

const EXCLUDED = new Set(["coffrets", "library"]);

function plain(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function haystack(product: BoutiqueProduct) {
  return plain(
    [product.family, product.notes, product.headNotes, product.heartNotes, product.baseNotes, product.name]
      .filter((part) => part && part !== "Notes à préciser")
      .join(" "),
  );
}

function hits(text: string, ambiance: Ambiance) {
  return KEYWORDS[ambiance].reduce((count, word) => count + (text.includes(word) ? 1 : 0), 0);
}

function genderOf(product: BoutiqueProduct): "homme" | "femme" | "mixte" {
  const text = plain(`${product.family} ${product.name}`);
  if (/\bfemme\b|\(f\)/.test(text)) return "femme";
  if (/\bhomme\b|\(h\)/.test(text)) return "homme";
  return "mixte";
}

// Petit hash stable pour départager les ex aequo sans toujours montrer les mêmes.
function tieBreak(name: string, seed: string) {
  let h = 2166136261;
  for (const c of name + seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return h >>> 0;
}

function fitsBudget(product: BoutiqueProduct, budget: Budget) {
  if (budget === "petit") return product.price < 10000;
  if (budget === "plus") return product.price >= 10000;
  return true;
}

export function recommend(products: BoutiqueProduct[], answers: Answers, count = 3) {
  const seed = `${answers.pour}${answers.ambiance}${answers.budget}${answers.moment}`;
  const pool = products.filter((product) => {
    if (product.placeholder || !product.price || EXCLUDED.has(product.collection)) return false;
    const gender = genderOf(product);
    if (answers.pour === "homme" && gender === "femme") return false;
    if (answers.pour === "femme" && gender === "homme") return false;
    return true;
  });

  const scored = pool.map((product) => {
    const text = haystack(product);
    const main = Math.min(hits(text, answers.ambiance), 2) * 3;
    let score = main;
    if (answers.pour !== "tous" && genderOf(product) === answers.pour) score += 1;
    if (answers.moment === "jour" && hits(text, "frais") > 0) score += 1;
    if (answers.moment === "soir" && (hits(text, "boise") > 0 || hits(text, "gourmand") > 0)) score += 1;
    if (answers.moment === "cadeau" && product.price >= 6000) score += 1;
    if (product.heartNotes && product.heartNotes !== "Notes à préciser") score += 0.5;
    return { product, score, main };
  });

  const order = (a: (typeof scored)[number], b: (typeof scored)[number]) =>
    b.score - a.score || tieBreak(a.product.name, seed) - tieBreak(b.product.name, seed);

  // On remplit en assouplissant petit à petit : d'abord la bonne ambiance dans le budget
  // (2 max par collection), puis sans limite de collection, puis tout le budget, puis le reste.
  const chosen: BoutiqueProduct[] = [];
  const fill = (list: typeof scored, perCollectionCap: number) => {
    const perCollection = new Map<string, number>();
    chosen.forEach((p) => perCollection.set(p.collection, (perCollection.get(p.collection) ?? 0) + 1));
    for (const { product } of [...list].sort(order)) {
      if (chosen.length >= count) return;
      const used = perCollection.get(product.collection) ?? 0;
      if (used >= perCollectionCap || chosen.some((p) => p.name === product.name)) continue;
      chosen.push(product);
      perCollection.set(product.collection, used + 1);
    }
  };
  const inBudget = scored.filter((entry) => fitsBudget(entry.product, answers.budget));
  const matching = inBudget.filter((entry) => entry.main > 0);
  fill(matching, 2);
  fill(matching, count);
  fill(inBudget, count);
  fill(scored, count);
  return chosen;
}

export function labelFor(key: keyof Answers, value: string) {
  const question = questions.find((q) => q.key === key);
  return question?.options.find((option) => option.value === value)?.label ?? value;
}

export function quizWhatsappUrl(answers: Answers, picks: BoutiqueProduct[]) {
  const lines = [
    "Bonjour 2M Parfumerie 👋 J'ai fait le quiz « Trouve ton parfum » sur le site.",
    `• Pour : ${labelFor("pour", answers.pour)}`,
    `• Ambiance : ${labelFor("ambiance", answers.ambiance)}`,
    `• Budget : ${labelFor("budget", answers.budget)}`,
    `• Moment : ${labelFor("moment", answers.moment)}`,
  ];
  if (picks.length) {
    lines.push("", "Le quiz me propose :");
    picks.forEach((product) => lines.push(`• ${product.name} — ${formatPrice(product.price)}`));
  }
  lines.push("", "Vous pouvez me conseiller ?");
  return whatsappUrl(lines.join("\n"));
}
