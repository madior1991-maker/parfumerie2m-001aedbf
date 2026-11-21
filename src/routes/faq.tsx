import { seoMeta } from "@/components/commerce/SeoText";
import { Link, createFileRoute } from "@tanstack/react-router";

import { FaqAccordion, FaqContact, faqJsonLd } from "@/components/commerce/Faq";
import { SiteLayout } from "@/components/commerce/SiteLayout";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: seoMeta("/faq").title },
      {
        name: "description",
        content:
          seoMeta("/faq").desc,
      },
    ],
    links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/faq" }],
    scripts: [{ type: "application/ld+json", children: faqJsonLd }],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <SiteLayout>
      <section className="bg-surface pb-10 pt-28 md:pb-14 md:pt-36">
        <div className="section-shell text-center">
          <p className="caption-luxe text-accent">On a les réponses</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground md:text-[56px]">
            Questions fréquentes
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Livraison, paiement, collections : tout ce qu'il faut savoir avant de commander. Les
            détails de livraison sont aussi sur la page{" "}
            <Link to="/livraison" className="text-accent underline underline-offset-4">
              Livraison
            </Link>
            .
          </p>
        </div>
      </section>
      <section className="bg-background py-12 md:py-16">
        <div className="section-shell mx-auto max-w-3xl">
          <FaqAccordion />
          <FaqContact />
        </div>
      </section>
    </SiteLayout>
  );
}
