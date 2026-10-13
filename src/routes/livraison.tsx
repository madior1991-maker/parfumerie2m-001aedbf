import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPinned } from "lucide-react";

import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import React, { Suspense } from "react";
import { SectionHeader } from "@/components/commerce/PageBlocks";
const WhatsAppBand = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.WhatsAppBand })));
import { SiteLayout } from "@/components/commerce/SiteLayout";

export const Route = createFileRoute("/livraison")({
  head: () => ({
    meta: [
      { title: "Livraison | 2M Parfumerie Dakar" },
      {
        name: "description",
        content:
          "Livraison 2M Parfumerie en 24 à 48h partout au Sénégal : 1 500 à 2 000 FCFA à Dakar, 2 000 FCFA en régions, offerte dès 75 000 FCFA. Paiement Wave, Orange Money ou espèces.",
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
      text: "Nous confirmons la disponibilité et l'adresse. Vous êtes livré en 24 à 48h maximum.",
    },
    {
      icon: MapPinned,
      title: "Réception",
      text: "Vous payez à réception par Wave, Orange Money ou en espèces.",
    },
  ];
  const rates = [
    { label: "Dakar", value: "1 500 à 2 000 FCFA" },
    { label: "Régions", value: "2 000 FCFA" },
    { label: "Délai", value: "24 à 48h max" },
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
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </section>
      <Suspense fallback={null}>
        <WhatsAppBand />
      </Suspense>
    </SiteLayout>
  );
}
