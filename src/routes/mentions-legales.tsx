import { createFileRoute } from "@tanstack/react-router";

import { SiteLayout } from "@/components/commerce/SiteLayout";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions Légales | 2M Parfumerie" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Mentions légales de 2M Parfumerie. Contact et informations légales pour la boutique de parfums au Sénégal." },
      { name: "keywords", content: "Haqqi, Scentlab, Takeoff Fragance, Parfums authentique, Parfums Dubai" },
    ],
  }),
  component: LegalPage,
});

function LegalPage() {
  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        <h1 className="font-display text-5xl font-semibold text-foreground">Mentions Légales</h1>
        <div className="mt-10 space-y-10 text-[15px] leading-8 text-muted-foreground">
          <section>
            <h2 className="mb-3 font-display text-2xl text-foreground">Éditeur du site</h2>
            <p>
              Le présent site est édité par 2M Parfumerie, parfumerie en ligne spécialisée dans la vente de
              parfums au Sénégal : créations inspirées des grands parfums et parfums originaux.
            </p>
            <p className="mt-2">
              Contact : 2mparfumerie2025@gmail.com · Téléphone : +221 76 192 34 41 / +221 78 144 17
              66.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-2xl text-foreground">Hébergement</h2>
            <p>
              Le site est hébergé par un prestataire technique assurant la disponibilité, la
              sécurité et la diffusion des pages web.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-2xl text-foreground">Propriété intellectuelle</h2>
            <p>
              Les textes, visuels, éléments graphiques, noms commerciaux et contenus présents sur ce
              site sont protégés. Toute reproduction, distribution ou utilisation non autorisée est
              interdite sans accord préalable de 2M Parfumerie.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-2xl text-foreground">Données personnelles</h2>
            <p>
              Les informations transmises volontairement via WhatsApp, téléphone ou email sont
              utilisées uniquement pour répondre aux demandes, confirmer les commandes et organiser
              la livraison. 2M Parfumerie ne vend pas les données personnelles de ses clients.
            </p>
            <p className="mt-2">
              Vous pouvez demander l’accès, la rectification ou la suppression de vos informations
              en écrivant à 2mparfumerie2025@gmail.com.
            </p>
          </section>
          <section>
            <h2 className="mb-3 font-display text-2xl text-foreground">Cookies</h2>
            <p>
              Le site peut utiliser des cookies techniques nécessaires au bon fonctionnement de la
              navigation et à la mesure anonyme de performance. Aucun cookie publicitaire intrusif
              n’est installé par 2M Parfumerie.
            </p>
          </section>
        </div>
      </article>
    </SiteLayout>
  );
}
