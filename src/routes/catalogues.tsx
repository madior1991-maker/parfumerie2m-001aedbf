import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { catalogueCover, catalogueFile, catalogues, fullCatalogue } from "@/lib/catalogues";
import { displayPhone, secondPhone, whatsappUrl } from "@/lib/perfume-data";

const URL = "https://www.2mparfumeriedk.com/catalogues";
const TITLE = "Catalogues PDF à télécharger | 2M Parfumerie Dakar";
const DESC =
  "Téléchargez gratuitement les catalogues 2M Parfumerie : Haqqi, SCENTLAB, Takeoff, Parfums de poche, Parfums Dubai, parfums authentiques, Callisto Paris, collections privées, coffrets et Fragrance Library.";

export const Route = createFileRoute("/catalogues")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: CataloguesPage,
});

function CataloguesPage() {
  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface pt-24 pb-10 md:pt-32 md:pb-14">
        <div className="section-shell grid gap-8 md:grid-cols-[1fr_auto] md:items-center md:gap-12">
          <div className="fade-up text-center md:text-left">
            <p className="caption-luxe text-accent">Catalogues PDF</p>
            <h1 className="mt-4 font-display text-3xl font-semibold text-foreground md:text-5xl">
              Nos catalogues, à télécharger et à partager
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:mx-0">
              Chaque collection a son catalogue, avec les senteurs et les prix. Gardez-le sur votre téléphone, envoyez-le à
              vos proches, puis commandez sur WhatsApp au {displayPhone.replace("+221 ", "")}.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
              <Button asChild size="lg" className="bg-accent text-primary-foreground hover:bg-accent/90">
                <a href={catalogueFile(fullCatalogue.slug)} download>
                  <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                  Télécharger le catalogue complet
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href={whatsappUrl("Bonjour 2M Parfumerie, j'ai vu votre catalogue et je souhaite commander.")} target="_blank" rel="noopener noreferrer">
                  Commander sur WhatsApp
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Catalogue complet : {fullCatalogue.pages} pages · {fullCatalogue.size}
            </p>
          </div>
          <a
            href={catalogueFile(fullCatalogue.slug)}
            download
            className="fade-up mx-auto block w-48 rotate-[-2deg] overflow-hidden rounded border border-border bg-white shadow-card transition-transform hover:rotate-0 md:w-56"
            aria-label="Télécharger le catalogue complet"
          >
            <img
              src={catalogueCover("00-nos-collections")}
              alt="Couverture du catalogue complet 2M Parfumerie"
              width={480}
              height={679}
              className="h-auto w-full"
            />
          </a>
        </div>
      </section>

      <section className="bg-background py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-3 md:px-6">
          <p className="caption-luxe mb-6 text-center text-accent">Par collection</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
            {catalogues.map((item, index) => (
              <article
                key={item.slug}
                className="fade-up group flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all hover:-translate-y-1 hover:border-accent"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <a href={catalogueFile(item.slug)} download className="block bg-surface p-3" aria-label={`Télécharger le catalogue ${item.title}`}>
                  <img
                    src={catalogueCover(item.slug)}
                    alt={`Couverture du catalogue ${item.title}`}
                    width={480}
                    height={679}
                    loading="lazy"
                    className="h-auto w-full rounded-sm border border-border bg-white"
                  />
                </a>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h2 className="font-display text-base leading-snug text-foreground sm:text-lg">{item.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.summary}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    PDF · {item.pages} pages · {item.size}
                  </p>
                  <div className="mt-auto pt-3">
                    <a
                      href={catalogueFile(item.slug)}
                      download
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-primary-foreground sm:text-sm"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Télécharger
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Une question ? WhatsApp et appels au {displayPhone.replace("+221 ", "")}. Second numéro : {secondPhone.replace("+221 ", "")}.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
