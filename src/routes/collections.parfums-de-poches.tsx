import { Link, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { PocketShowcase } from "@/components/commerce/PocketShowcase";
import { catalog } from "@/lib/catalog-data";
import { whatsappUrl } from "@/lib/perfume-data";

const URL = "https://www.2mparfumeriedk.com/collections/parfums-de-poches";
const TITLE = "Parfums de poche Dakar | Pack de 5 à 10 000 F — 2M Parfumerie";
const DESC =
  "Parfums de poche chez 2M Parfumerie : compose ton pack de 5 parfums à 10 000 FCFA. Un format pratique à glisser dans le sac, livré partout au Sénégal.";

const families = ["Homme", "Unisex", "Femme"] as const;

export const Route = createFileRoute("/collections/parfums-de-poches")({
  head: () => ({
    meta: [{ title: TITLE }, { name: "description", content: DESC }],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Accueil",
              item: "https://www.2mparfumeriedk.com/",
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Collections",
              item: "https://www.2mparfumeriedk.com/boutique",
            },
            { "@type": "ListItem", position: 3, name: "Parfums de poche", item: URL },
          ],
        }),
      },
    ],
  }),
  component: PocketPage,
});

function PocketPage() {
  // Les parfums de poche sont masqués un par un dans l'admin (vente en pack seulement) :
  // la liste vient du catalogue.
  const products = catalog;

  const groups = useMemo(() => {
    const pocket = products.filter((product) => product.collection === "pocket");
    return families
      .map((family) => ({
        family,
        names: pocket
          .filter((product) => product.family === family)
          .map((product) => product.name)
          .sort((a, b) => a.localeCompare(b, "fr")),
      }))
      .filter((group) => group.names.length > 0);
  }, [products]);

  const total = groups.reduce((sum, group) => sum + group.names.length, 0);

  return (
    <SiteLayout>
      <section className="border-b border-border bg-surface pt-24 pb-10 md:pt-32 md:pb-14">
        <div className="section-shell text-center">
          <p className="caption-luxe text-accent">Parfums de poche</p>
          <h1 className="mt-4 font-display text-3xl font-semibold text-foreground md:text-5xl">
            5 parfums de poche pour 10&nbsp;000&nbsp;F
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-muted-foreground">
            Un petit format à glisser dans le sac ou la poche, pour changer de parfum selon ta
            journée. Tu choisis tes 5 parfums parmi {total} références Homme et Femme. On prépare
            ton pack et on te livre partout au Sénégal.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-accent text-primary-foreground hover:bg-accent/90"
            >
              <Link to="/coffret-signature">Composer mon pack de 5</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href={whatsappUrl(
                  "Bonjour 2M Parfumerie, je veux un pack de 5 parfums de poche à 10 000 F.",
                )}
                target="_blank"
                rel="noreferrer"
              >
                Commander sur WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-background py-10 md:py-14">
        <div className="section-shell">
          <PocketShowcase />
        </div>
      </section>

      <section className="border-t border-border bg-surface py-10 md:py-14">
        <div className="section-shell">
          <h2 className="font-display text-2xl text-foreground md:text-3xl">
            Les parfums au choix dans le pack
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Choisis-en 5. Mélange Homme et Femme comme tu veux.
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {groups.map((group) => (
              <div key={group.family}>
                <h3 className="caption-luxe text-accent">
                  {group.family} · {group.names.length}
                </h3>
                <ul className="mt-3 space-y-1.5 text-sm text-foreground">
                  {group.names.map((name) => (
                    <li key={name} className="border-b border-border/60 pb-1.5">
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button
              asChild
              size="lg"
              className="h-auto max-w-full whitespace-normal py-3 bg-accent text-primary-foreground hover:bg-accent/90"
            >
              <Link to="/coffret-signature">Composer mon pack de 5 — 10 000 F</Link>
            </Button>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
