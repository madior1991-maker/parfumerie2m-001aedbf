import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Gift, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { GuaranteeStrip } from "@/components/commerce/Guarantee";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import {
  catalog,
  collectionLabel,
  formatPrice,
  slugifyProduct,
  type BoutiqueProduct,
} from "@/lib/catalog-data";
import { mergeLiveCatalog } from "@/lib/live-catalog";
import { questions, quizWhatsappUrl, recommend, type Answers } from "@/lib/quiz";

export const Route = createFileRoute("/trouve-ton-parfum")({
  head: () => ({
    meta: [
      { title: "Trouve ton parfum en 4 questions | 2M Parfumerie Dakar" },
      {
        name: "description",
        content:
          "Quiz gratuit : réponds à 4 questions et découvre 3 parfums faits pour toi, à partir de 2 500 F. Commande sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/trouve-ton-parfum" }],
  }),
  component: QuizPage,
});

type Partial4 = Partial<Answers>;

function QuizPage() {
  const [products, setProducts] = useState<BoutiqueProduct[]>(catalog);
  const [answers, setAnswers] = useState<Partial4>({});
  const [step, setStep] = useState(0);

  useEffect(() => {
    let alive = true;
    supabase
      .from("products")
      .select("*")
      .then(({ data }) => {
        if (alive && data) setProducts(mergeLiveCatalog(data));
      });
    return () => {
      alive = false;
    };
  }, []);

  const done = step >= questions.length;
  const complete = done ? (answers as Answers) : null;
  const picks = useMemo(() => (complete ? recommend(products, complete) : []), [complete, products]);

  useEffect(() => {
    if (complete) track("quiz_complete", { ...complete });
  }, [complete]);

  const choose = (key: keyof Answers, value: string) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setStep((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
  };

  return (
    <SiteLayout>
      <section className="pt-24 pb-16 md:pt-36 md:pb-24">
        <div className="section-shell mx-auto max-w-3xl">
          {!done ? (
            <QuestionStep step={step} answers={answers} onChoose={choose} onBack={() => setStep(step - 1)} />
          ) : (
            <Results answers={complete!} picks={picks} onRestart={restart} />
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

function QuestionStep({
  step,
  answers,
  onChoose,
  onBack,
}: {
  step: number;
  answers: Partial4;
  onChoose: (key: keyof Answers, value: string) => void;
  onBack: () => void;
}) {
  const question = questions[step];
  const selected = answers[question.key];
  return (
    <div>
      {step === 0 && (
        <div className="mb-10 text-center">
          <p className="caption-luxe text-accent">Trouve ton parfum</p>
          <h1 className="mt-3 font-display text-[34px] font-medium leading-[1.15] text-foreground md:text-5xl">
            4 questions, 3 parfums faits pour toi.
          </h1>
          <p className="mt-4 text-muted-foreground">30 secondes. Aucune inscription.</p>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        {step > 0 ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-accent"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Retour
          </button>
        ) : (
          <span />
        )}
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Question {step + 1} sur {questions.length}
        </span>
      </div>
      <div className="mb-8 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h2 className="font-display text-3xl text-foreground md:text-4xl">{question.title}</h2>
      <div className={`mt-6 grid gap-3 ${question.options.length === 4 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        {question.options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChoose(question.key, option.value)}
            aria-pressed={selected === option.value}
            className={`flex min-h-24 flex-col items-start rounded-lg border p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              selected === option.value ? "border-accent bg-accent-muted" : "border-border bg-card"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {option.emoji}
            </span>
            <span className="mt-2 font-display text-xl text-foreground">{option.label}</span>
            <span className="mt-1 text-[13px] text-muted-foreground">{option.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Results({
  answers,
  picks,
  onRestart,
}: {
  answers: Answers;
  picks: BoutiqueProduct[];
  onRestart: () => void;
}) {
  return (
    <div>
      <div className="text-center">
        <p className="caption-luxe text-accent">Ta sélection</p>
        <h1 className="mt-3 font-display text-[34px] font-medium leading-[1.15] text-foreground md:text-5xl">
          Voilà ce qu'on te conseille.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Pas convaincu ? Envoie ta sélection sur WhatsApp, on affine avec toi.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {picks.map((product) => (
          <PickCard key={slugifyProduct(product)} product={product} />
        ))}
      </div>

      {answers.moment === "cadeau" && (
        <Link
          to="/coffret-signature"
          className="mt-6 flex items-center gap-4 rounded-lg border border-accent/30 bg-accent-muted p-5 hover:border-accent"
        >
          <Gift className="size-8 shrink-0 text-accent" aria-hidden="true" />
          <span>
            <strong className="block font-display text-xl text-foreground">Pour offrir, pense au pack</strong>
            <span className="text-sm text-muted-foreground">
              3 parfums à choisir dès 10 000 F, préparés en coffret. →
            </span>
          </span>
        </Link>
      )}

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="whatsapp" size="lg">
          <a href={quizWhatsappUrl(answers, picks)} target="_blank" rel="noopener noreferrer">
            <WhatsAppLogo tone="light" className="size-5" /> Envoyer ma sélection
          </a>
        </Button>
        <Button variant="outline" size="lg" onClick={onRestart}>
          <RotateCcw aria-hidden="true" /> Refaire le quiz
        </Button>
      </div>

      <div className="mx-auto max-w-md">
        <GuaranteeStrip />
      </div>
    </div>
  );
}

function PickCard({ product }: { product: BoutiqueProduct }) {
  const label = collectionLabel(product.collection);
  const slug = slugifyProduct(product);
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card">
      <Link
        to="/boutique/$productSlug"
        params={{ productSlug: slug }}
        search={{}}
        className="relative block aspect-square bg-surface"
        aria-label={`Voir ${product.name}`}
      >
        <span className="absolute left-3 top-3 z-10 rounded-full bg-surface px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <img
          src={product.image}
          alt={`${product.name} chez 2M Parfumerie`}
          className="h-full w-full object-contain p-4"
          loading="lazy"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <Link
          to="/boutique/$productSlug"
          params={{ productSlug: slug }}
          search={{}}
          className="font-display text-2xl leading-tight text-foreground hover:text-accent"
        >
          {product.name}
        </Link>
        <p className="mt-1 text-[13px] text-muted-foreground">{product.notes}</p>
        <p className="mt-3 text-lg font-semibold text-accent">{formatPrice(product.price)}</p>
        <div className="mt-auto pt-4">
          <AddToCartButton
            item={{ id: slug, name: product.name, collection: label, price: product.price, imageUrl: product.image }}
          />
        </div>
      </div>
    </article>
  );
}
