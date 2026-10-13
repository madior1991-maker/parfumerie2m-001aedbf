import { createFileRoute } from "@tanstack/react-router";
import { Gem, MapPin, Phone, Plus, Users } from "lucide-react";
import { useState } from "react";

import aboutHero from "@/assets/about-perfume-grid.webp";
import brandLogo from "@/assets/2m-parfumerie-logo.webp";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { displayPhone, secondPhone, whatsappUrl } from "@/lib/perfume-data";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À Propos & FAQ | 2M Parfumerie Sénégal" },
      {
        name: "description",
        content:
          "Découvrez l'histoire de 2M Parfumerie, votre parfumerie authentique à Dakar, et retrouvez les réponses à toutes vos questions sur la livraison, l'authenticité et la commande.",
      },
      { property: "og:title", content: "À Propos & FAQ | 2M Parfumerie Dakar" },
      {
        property: "og:description",
        content:
          "Découvrez l'histoire de 2M Parfumerie et toutes les réponses à vos questions sur la livraison, l'authenticité et la commande.",
      },
      { property: "og:url", content: "https://www.2mparfumeriedk.com/a-propos" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "fr_FR" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/a-propos" }],
    scripts: [{ type: "application/ld+json", children: faqJsonLd }],
  }),
  component: AboutPage,
});

const faqs = [
  {
    question: "Les parfums sont-ils 100% authentiques ?",
    answer:
      "Absolument. Tous nos parfums sont sourcés directement auprès de distributeurs certifiés. Nous ne vendons aucune imitation ou contrefaçon. Si vous avez le moindre doute après réception, contactez-nous immédiatement sur WhatsApp.",
  },
  {
    question: "Combien coûte la livraison et en combien de temps ?",
    answer:
      "Nous livrons partout au Sénégal : livraison rapide à Dakar (1 500 à 2 000 FCFA selon la zone) et en 24 à 48h dans les régions (2 000 FCFA). La livraison est offerte dès 75 000 FCFA d'achat, et pour 2 parfums Takeoff (50 000 FCFA).",
  },
  {
    question: "Comment finaliser ma commande ?",
    answer:
      "Vous passez par WhatsApp ou téléphone, puis vous convenez directement avec le gérant du règlement et des détails de livraison. Vous payez par Wave, Orange Money ou en espèces. Il n'y a pas de paiement en ligne sur le site.",
  },
  {
    question: "Puis-je retourner un produit si je ne suis pas satisfait(e) ?",
    answer:
      "Nous sommes fiers de la qualité de nos produits. Si un article arrive endommagé ou ne correspond pas à ce que vous avez commandé, contactez-nous dans les 24h sur WhatsApp avec une photo. Nous trouverons une solution.",
  },
  {
    question: "Comment savoir quel parfum me correspond ?",
    answer:
      "C'est notre spécialité. Écrivez-nous sur WhatsApp en décrivant votre style, l'occasion pour laquelle vous cherchez un parfum, et votre budget — nous vous conseillerons personnellement sur 2-3 options parfaites pour vous.",
  },
  {
    question: "Livrez-vous dans les régions du Sénégal ?",
    answer:
      "Oui, nous livrons partout dans les régions du Sénégal. Nous avons déjà des clients satisfaits de nos produits dans plusieurs régions ; contactez-nous sur WhatsApp ou par appel pour confirmer le délai et le mode de livraison adaptés à votre localité.",
  },
  {
    question: "Quelle est la différence entre vos collections ?",
    answer:
      "Chaque collection a son univers :\n· SCENTLAB — fragrances contemporaines et épurées\n· TAKEOFF FRAGRANCE — signatures audacieuses et marquées\n· Dubai Perfumes — oud, rose, musc — l'Orient en flacon\n· Pocket Perfumes — formats voyage compacts\n· Authentic Perfumes — grandes maisons, originaux certifiés\n· Haqqi — sélection exclusive, qualité premium",
  },
  {
    question: "Comment passer une commande ?",
    answer:
      "C'est simple : trouvez votre parfum dans la boutique, cliquez sur 'Commander', et vous serez redirigé(e) vers WhatsApp avec le produit déjà mentionné dans le message. Vous pouvez aussi nous appeler directement via nos deux numéros pour commander ou poser vos questions.",
  },
];

// FAQ structured data for rich results
const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

const values = [
  {
    icon: Gem,
    title: "L'authenticité avant tout",
    body: "Chaque flacon est sourcé directement. Nous ne faisons aucun compromis sur la qualité — c'est notre engagement fondateur.",
  },
  {
    icon: Users,
    title: "Le parfum est personnel",
    body: "Il n'existe pas un parfum universel. C'est pour ça qu'on prend le temps de vous connaître avant de vous conseiller.",
  },
  {
    icon: MapPin,
    title: "Le Sénégal, au cœur de tout",
    body: "Notre marché, c'est le Sénégal. Notre livraison couvre le pays. Notre équipe accompagne chaque client avec la même exigence, où qu’il se trouve.",
  },
];

function AboutPage() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-48 md:pb-24">
        <img
          src={aboutHero}
          alt="Collection de parfums 2M Parfumerie"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/75" aria-hidden="true" />
        <div className="section-shell relative mx-auto max-w-2xl text-center">
          <p className="caption-luxe text-accent">Notre histoire</p>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] text-foreground md:text-[64px]">
            Le parfum pour tous. L'authenticité sans compromis.
          </h1>
        </div>
      </section>

      <section className="bg-background py-16 md:py-24">
        <div className="section-shell grid gap-10 md:grid-cols-[40fr_60fr] md:items-center md:gap-12">
          <div className="fade-up flex min-h-[320px] items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-8 shadow-card">
            <img
              src={brandLogo}
              alt="Logo 2M Parfumerie"
              className="max-h-[340px] w-full object-contain"
            />
          </div>
          <div className="fade-up">
            <p className="caption-luxe text-accent">La genèse</p>
            <h2 className="mt-4 font-display text-[32px] font-medium leading-tight text-foreground md:text-[40px]">
              Né d'une passion, construit pour le Sénégal.
            </h2>
            <div className="mt-6 space-y-6 text-base leading-[1.9] text-muted-foreground">
              <p>
                À l'origine de 2M Parfumerie, il y a une conviction simple : le parfum de luxe ne
                devrait pas être réservé à une élite. Chaque Sénégalais mérite de porter une
                fragrance authentique — celle qui lui ressemble, celle qui laisse une trace dans une
                pièce, celle dont on se souvient.
              </p>
              <p>
                Nous avons commencé par une passion, une sélection rigoureuse, et l'obsession d'une
                seule chose : vous livrer exactement ce que vous attendez. Pas des imitations. Pas
                des approximations. Des parfums vrais.
              </p>
              <p>
                Aujourd'hui, nos collections couvrent six univers olfactifs — du SCENTLAB épuré aux
                Dubai Perfumes orientaux — et notre équipe est disponible 7j/7 sur WhatsApp pour
                vous guider vers votre signature personnelle.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-alt py-16 md:py-24">
        <div className="section-shell">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-[32px] font-medium text-foreground md:text-5xl">
              Ce en quoi nous croyons
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:mt-16 md:grid-cols-3 md:gap-8">
            {values.map(({ icon: Icon, title, body }, index) => (
              <article
                key={title}
                className="fade-up rounded-lg border border-border bg-surface p-8 text-center transition-all hover:border-accent"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Icon className="mx-auto mb-7 size-10 text-accent" aria-hidden="true" />
                <h3 className="font-display text-2xl text-foreground">{title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface pt-16 pb-12 md:pt-24 md:pb-16">
        <div className="section-shell text-center">
          <p className="caption-luxe text-accent">On a les réponses</p>
          <h2 className="mt-4 font-display text-4xl font-semibold text-foreground md:text-[56px]">
            Questions fréquentes
          </h2>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="section-shell mx-auto max-w-3xl">
          <div className="divide-y divide-border border-y border-border">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={faq.question} className="py-5">
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-6 text-left text-[15px] font-semibold text-foreground hover:text-accent"
                    aria-expanded={isOpen ? "true" : "false"}
                    aria-controls={`faq-answer-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>{faq.question}</span>
                    <Plus
                      className={
                        isOpen
                          ? "size-5 shrink-0 rotate-45 text-accent transition-transform duration-300"
                          : "size-5 shrink-0 text-accent transition-transform duration-300"
                      }
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`faq-answer-${index}`}
                    className={
                      isOpen
                        ? "grid grid-rows-[1fr] opacity-100 transition-all duration-300"
                        : "grid grid-rows-[0fr] opacity-0 transition-all duration-300"
                    }
                  >
                    <div className="overflow-hidden">
                      <p className="whitespace-pre-line pb-2 pt-4 text-sm leading-[1.8] text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-16 text-center">
            <p className="caption-luxe text-accent">Autre question ?</p>
            <h2 className="mt-3 font-display text-[32px] text-foreground">
              On est sur WhatsApp et par téléphone.
            </h2>
            <Button asChild variant="whatsapp" size="lg" className="mt-6">
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
                <WhatsAppLogo tone="light" className="size-5" /> Nous écrire sur WhatsApp →
              </a>
            </Button>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row">
              <a
                href="tel:+221761923441"
                className="inline-flex min-h-11 items-center gap-2 hover:text-accent"
              >
                <Phone className="size-4" aria-hidden="true" /> {displayPhone}
              </a>
              <a
                href="tel:+221781441766"
                className="inline-flex min-h-11 items-center gap-2 hover:text-accent"
              >
                <Phone className="size-4" aria-hidden="true" /> {secondPhone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
