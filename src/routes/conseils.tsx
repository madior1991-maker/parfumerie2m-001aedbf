import { seoMeta } from "@/components/commerce/SeoText";
import { createFileRoute } from "@tanstack/react-router";
import { Droplets, Moon, Sun } from "lucide-react";

import React, { Suspense } from "react";
import { SectionHeader } from "@/components/commerce/PageBlocks";
const BoutiqueLink = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.BoutiqueLink })));
const WhatsAppBand = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.WhatsAppBand })));
import { SiteLayout } from "@/components/commerce/SiteLayout";

export const Route = createFileRoute("/conseils")({
  head: () => ({
    meta: [
      { title: seoMeta("/conseils").title },
      {
        name: "description",
        content:
          seoMeta("/conseils").desc,
      },
    ],
  }),
  component: AdvicePage,
});

function AdvicePage() {
  const advice = [
    {
      icon: Sun,
      title: "Pour la journée",
      text: "Privilégiez les muscs propres, les agrumes et les fruités lumineux qui restent élégants sous la chaleur.",
    },
    {
      icon: Moon,
      title: "Pour le soir",
      text: "Osez l’ambre, le cuir, la tonka ou l’oud lorsque vous cherchez une présence plus sensuelle.",
    },
    {
      icon: Droplets,
      title: "Pour durer",
      text: "Vaporisez sur peau hydratée, textile léger et points de chaleur, sans saturer votre entourage.",
    },
  ];
  return (
    <SiteLayout>
      <section className="pt-24 pb-16 md:pt-40 md:pb-20">
        <div className="section-shell space-y-10 md:space-y-12">
          <SectionHeader
            eyebrow="Conseils"
            as="h1"
            title="Choisir un parfum, c’est choisir une manière d’entrer."
            text="Quelques repères simples pour trouver un sillage qui correspond à votre rythme et à votre présence."
          />
          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {advice.map(({ icon: Icon, title, text }, index) => (
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
          <div className="text-center">
            <Suspense fallback={null}>
              <BoutiqueLink />
            </Suspense>
          </div>
        </div>
      </section>
      <Suspense fallback={null}>
        <WhatsAppBand />
      </Suspense>
    </SiteLayout>
  );
}
