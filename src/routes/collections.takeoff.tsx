import { createFileRoute } from "@tanstack/react-router";

import takeoffPoster from "@/assets/poster takeoff.jpeg";
import takeoffMoscow from "@/assets/takeoff-moscow.webp";
import { CollectionPage } from "@/components/commerce/CollectionPage";
import { seoMeta } from "@/components/commerce/SeoText";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { Button } from "@/components/ui/button";
import { whatsappUrl } from "@/lib/perfume-data";

const URL = "https://www.2mparfumeriedk.com/collections/takeoff";
const TITLE = seoMeta("/collections/takeoff").title;
const DESC = seoMeta("/collections/takeoff").desc;

export const Route = createFileRoute("/collections/takeoff")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://www.2mparfumeriedk.com/" },
            { "@type": "ListItem", position: 2, name: "Collections", item: "https://www.2mparfumeriedk.com/boutique" },
            { "@type": "ListItem", position: 3, name: "Takeoff", item: URL },
          ],
        }),
      },
    ],
  }),
  component: () => (
    <CollectionPage
      collection="takeoff"
      eyebrow="Collection Takeoff — Scent of Journey"
      h1="Takeoff — Scent of Journey, la collection voyage de 2M Parfumerie"
      intro="Takeoff est la collection signature de 2M Parfumerie : des parfums inspirés des grandes villes du monde — Paris, New York, Dubai, Rome, Lisbon, Capri et bien d'autres. Chaque flacon (Eau de Parfum, 100 ml) est à 25 000 FCFA. Les 2 à 50 000 FCFA, livraison offerte. Commandez sur WhatsApp, livraison rapide à Dakar, 24 à 48h en régions."
      heroImage={takeoffMoscow}
      heroImageAlt="Parfum Takeoff Moscow, inspiré de Xerjoff La Capitale"
    >
      <section className="border-t border-border bg-surface-alt py-14 md:py-20">
        <div className="section-shell grid gap-10 md:grid-cols-[45fr_55fr] md:items-center md:gap-12">
          <div className="fade-up mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-xl border border-border bg-card shadow-card md:order-2 md:max-w-none">
            <img
              src={takeoffPoster}
              alt="2M Parfumerie, distributeur officiel Takeoff Fragrance au Sénégal"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="fade-up text-center md:order-1 md:text-left">
            <p className="caption-luxe text-accent">Pour les professionnels</p>
            <h2 className="mt-4 font-display text-[32px] font-medium text-foreground md:text-4xl">
              Commander en gros
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-[1.9] text-muted-foreground md:mx-0">
              Vous revendez ou souhaitez équiper votre commerce en parfums Takeoff ? À partir de 6
              unités, bénéficiez de tarifs de gros — communiqués directement sur demande via
              WhatsApp.
            </p>
            <Button asChild variant="whatsapp" size="lg" className="mt-8">
              <a
                href={whatsappUrl(
                  "Bonjour 2M Parfumerie, je souhaite commander des parfums Takeoff en gros (à partir de 6 unités). Merci de me communiquer vos tarifs.",
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <WhatsAppLogo tone="light" className="size-5" /> Commander en gros sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>
    </CollectionPage>
  ),
});
