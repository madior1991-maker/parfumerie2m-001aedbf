import { Phone, Plus } from "lucide-react";
import { useState } from "react";

import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { Button } from "@/components/ui/button";
import { displayPhone, secondPhone, whatsappUrl } from "@/lib/perfume-data";

// Questions fréquentes : affichées sur À propos et sur la page FAQ.
export const faqs = [
  {
    question: "Vos parfums sont-ils authentiques ?",
    answer:
      "Nous vendons deux types de parfums et nous le disons clairement. Nos parfums authentiques sont les originaux des grandes maisons. Haqqi, SCENTLAB et Takeoff sont des créations inspirées des grands parfums : chaque fiche indique le parfum dont elle s'inspire. Nous ne vendons aucune contrefaçon, c'est-à-dire aucune copie qui se ferait passer pour la marque d'origine. Au moindre doute après réception, écrivez-nous sur WhatsApp.",
  },
  {
    question: "Combien coûte la livraison et en combien de temps ?",
    answer:
      "Nous livrons partout au Sénégal : livraison rapide à Dakar (1 500 à 2 000 FCFA selon la zone) et en 24 à 48h dans les régions (2 000 FCFA). La livraison est offerte dès 75 000 FCFA d'achat, et pour 2 parfums Takeoff (50 000 FCFA).",
  },
  {
    question: "Comment passer une commande ?",
    answer:
      "Trouvez votre parfum dans la boutique et cliquez sur « Commander » : WhatsApp s'ouvre avec le parfum déjà indiqué dans le message. Vous pouvez aussi composer votre pack sur la page « Compose ton pack », ou nous appeler au 76 192 34 41 ou au 78 144 17 66.",
  },
  {
    question: "Comment je paie ?",
    answer:
      "La commande se finalise avec le gérant, sur WhatsApp ou par téléphone. Vous payez par Wave, Orange Money ou en espèces à la livraison. Il n'y a pas de paiement en ligne sur le site.",
  },
  {
    question: "Puis-je retourner un produit si je ne suis pas satisfait(e) ?",
    answer:
      "Si un flacon arrive cassé, qu'il fuit ou qu'il ne correspond pas à votre commande, envoyez-nous une photo sur WhatsApp dans les 24h après réception. Nous vous l'échangeons, sans frais.",
  },
  {
    question: "Comment savoir quel parfum me correspond ?",
    answer:
      "Faites le quiz « Trouve ton parfum » : 4 questions, 3 suggestions en 30 secondes. Vous pouvez aussi nous écrire sur WhatsApp en décrivant votre style, l'occasion et votre budget : nous vous proposerons 2 ou 3 parfums.",
  },
  {
    question: "Livrez-vous dans les régions du Sénégal ?",
    answer:
      "Oui, partout au Sénégal, en 24 à 48h pour 2 000 FCFA. Écrivez-nous sur WhatsApp pour confirmer le délai et le mode de livraison pour votre ville.",
  },
  {
    question: "Quelle est la différence entre vos collections ?",
    answer:
      "· Haqqi — eaux de parfum 40 ml inspirées des grands parfums, dès 4 000 F (pack de 3 à 10 000 F)\n· SCENTLAB — eaux de parfum 50 ml inspirées des grands parfums, 6 000 F (pack de 3 à 15 000 F)\n· Takeoff — eaux de parfum 100 ml inspirées des grands parfums, aux noms de grandes villes, 25 000 F (les 2 à 50 000 F)\n· Parfums de poche — 50 ml faciles à emporter, pack de 5 à 10 000 F\n· Parfums Dubai — parfums orientaux : oud, rose, musc\n· Parfums authentiques — les originaux des grandes maisons\n· Callisto Paris — extraits de parfum de la maison Callisto Paris, 75 000 F\n· Soie Sublime Paris — extraits de parfum, 90 000 F au lieu de 120 000 F\n· Fragrance Library — eaux de parfum 100 ml, 35 000 F\n· Collections privées — Prestige Paris et Reef, dès 25 000 F\n· Coffrets — coffrets cadeaux des grandes maisons, 90 000 F",
  },
];

export const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
});

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState(0);
  return (
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
  );
}

export function FaqContact() {
  return (
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
  );
}
