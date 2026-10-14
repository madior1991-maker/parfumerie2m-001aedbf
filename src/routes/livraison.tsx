import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPinned } from "lucide-react";

import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import React, { Suspense } from "react";
import { SectionHeader } from "@/components/commerce/PageBlocks";
const WhatsAppBand = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.WhatsAppBand })));
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { GuaranteeSection } from "@/components/commerce/Guarantee";

export const Route = createFileRoute("/livraison")({
  head: () => ({
    meta: [
      { title: "Livraison | 2M Parfumerie Dakar" },
      {
        name: "description",
        content:
          "Livraison 2M Parfumerie : rapide à Dakar (1 500 à 2 000 FCFA selon la zone), 24 à 48h en régions (2 000 FCFA), offerte dès 75 000 FCFA. Paiement Wave, Orange Money ou espèces.",
      },
    ],
  }),
  component: DeliveryPage,
});

function DeliveryPage() {
  const steps = [
    {
      icon: WhatsAppLogo,
      title: "Commande",
      text: "Envoyez votre choix sur WhatsApp avec le parfum, l’édition et vos coordonnées.",
    },
    {
      icon: Clock,
      title: "Confirmation",
      text: "Nous confirmons la disponibilité et l'adresse. Livraison rapide à Dakar, 24 à 48h en régions.",
    },
    {
      icon: MapPinned,
      title: "Réception",
      text: "Vous payez à réception par Wave, Orange Money ou en espèces.",
    },
  ];
  const rates = [
    { label: "Dakar · livraison rapide", value: "1 500 à 2 000 FCFA" },
    { label: "Régions · 24 à 48h", value: "2 000 FCFA" },
    { label: "Livraison offerte", value: "Dès 75 000 FCFA" },
  ];
  return (
    <SiteLayout>
      <section className="pt-24 pb-16 md:pt-40 md:pb-20">
        <div className="section-shell space-y-10 md:space-y-12">
          <SectionHeader
            eyebrow="Livraison"
            title="Une commande simple, suivie et humaine."
            text="Chaque détail est confirmé sur WhatsApp pour éviter les surprises et garder l’expérience fluide."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {rates.map(({ label, value }) => (
              <div key={label} className="rounded-lg border border-accent/30 bg-accent-muted p-5">
                <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
                <p className="mt-2 font-display text-2xl text-foreground">{value}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article
                key={title}
                className="fade-up rounded-lg border border-border bg-card p-6 shadow-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <Icon className="mb-8 text-accent" aria-hidden="true" />
                <h3 className="text-2xl text-foreground">{title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{text}</p>
              </article>
            ))}
          </div>
          <GuaranteeSection />
        </div>
      </section>
      <Suspense fallback={null}>
        <WhatsAppBand />
      </Suspense>
    </SiteLayout>
  );
}
