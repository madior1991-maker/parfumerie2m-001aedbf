import { createFileRoute } from "@tanstack/react-router";
import { Gem, MapPin, Users } from "lucide-react";

import aboutHero from "@/assets/about-perfume-grid.webp";
import brandLogo from "@/assets/2m-parfumerie-logo.webp";
import { FaqAccordion, FaqContact } from "@/components/commerce/Faq";
import { SiteLayout } from "@/components/commerce/SiteLayout";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À Propos & FAQ | 2M Parfumerie Sénégal" },
      {
        name: "description",
        content:
          "L'histoire de 2M Parfumerie, parfumerie en ligne à Dakar : créations inspirées dès 4 000 F et parfums originaux. Réponses sur la livraison, le paiement et la commande.",
      },
    ],
    links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/a-propos" }],
  }),
  component: AboutPage,
});



const values = [
  {
    icon: Gem,
    title: "La transparence avant tout",
    body: "Chaque fiche dit ce que vous achetez : création inspirée ou parfum original. Chaque flacon est vérifié avant envoi.",
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
            Le parfum pour tous, au juste prix.
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
                devrait pas être réservé à une élite. Chaque Sénégalais mérite de porter un
                parfum qui lui ressemble, celle qui laisse une trace dans une
                pièce, celle dont on se souvient.
              </p>
              <p>
                Nous avons commencé par une passion, une sélection rigoureuse, et l'obsession d'une
                seule chose : vous livrer exactement ce que vous attendez. Des créations inspirées des grands
                parfums, présentées comme telles, et des originaux pour ceux qui veulent la grande
                maison.
              </p>
              <p>
                Aujourd'hui, nos huit collections couvrent tous les budgets — du SCENTLAB épuré aux
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
          <FaqAccordion />
          <FaqContact />
        </div>
      </section>
    </SiteLayout>
  );
}
