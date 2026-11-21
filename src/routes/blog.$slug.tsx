import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Clock3, Link2 } from "lucide-react";

import React, { Suspense } from "react";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import type { Database } from "@/integrations/supabase/types";
const BoutiqueLink = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.BoutiqueLink })));
const WhatsAppBand = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.WhatsAppBand })));
import { supabase } from "@/integrations/supabase/client";
import { estimateBlogReadTime, formatBlogDate, splitBlogContent } from "@/lib/blog-data";

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const [{ data: article }, { data: relatedPosts }] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", params.slug)
        .eq("is_published", true)
        .maybeSingle(),
      supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false }),
    ]);

    return {
      article,
      relatedPosts: (relatedPosts ?? []).filter((post) => post.slug !== params.slug).slice(0, 3),
    };
  },
  head: ({ loaderData, params }) => {
    const article = (loaderData as { article: BlogPostRow | null } | undefined)?.article ?? null;
    const url = `https://www.2mparfumeriedk.com/blog/${params.slug}`;
    const title = article ? `${article.title} | 2M Parfumerie` : "Article blog | 2M Parfumerie";
    const description = article
      ? article.excerpt
      : "Découvrez les conseils parfum de 2M Parfumerie.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: article ? "article" : "website" },
        { property: "og:locale", content: "fr_FR" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
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
                name: "Blog",
                item: "https://www.2mparfumeriedk.com/blog",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: article?.title ?? "Article",
                item: url,
              },
            ],
          }),
        },
        ...(article
          ? [
              {
                type: "application/ld+json",
                children: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "BlogPosting",
                  headline: article.title,
                  description: article.excerpt,
                  datePublished: article.created_at,
                  dateModified: article.updated_at ?? article.created_at,
                  mainEntityOfPage: url,
                  author: { "@type": "Organization", name: "2M Parfumerie" },
                  publisher: { "@type": "Organization", name: "2M Parfumerie" },
                }),
              },
            ]
          : []),
      ],
    };
  },
  component: BlogArticlePage,
});

function BlogArticlePage() {
  const { article, relatedPosts } = Route.useLoaderData() as {
    article: BlogPostRow | null;
    relatedPosts: BlogPostRow[];
  };

  if (!article) {
    return (
      <SiteLayout>
        <section className="section-shell flex min-h-[70vh] flex-col items-center justify-center py-28 text-center">
          <p className="caption-luxe text-accent">Blog</p>
          <h1 className="mt-4 font-display text-4xl text-foreground">Article introuvable</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Cette page n’existe pas encore. Retournez au blog pour découvrir les premiers contenus.
          </p>
              <Link
                to="/blog"
                search={{}}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90"
              >
                Retour au blog <ArrowRight className="ml-2 size-4" aria-hidden="true" />
              </Link>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <article className="pt-24 pb-16 md:pt-40 md:pb-20">
        <div className="section-shell space-y-10 md:space-y-12">
          <div className="max-w-4xl space-y-6">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-accent">
              <span>{article.category}</span>
              <span className="text-border">/</span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                <CalendarDays className="size-3.5" aria-hidden="true" /> {formatBlogDate(article.created_at)}
              </span>
              <span className="inline-flex items-center gap-1 normal-case tracking-normal">
                <Clock3 className="size-3.5" aria-hidden="true" /> {estimateBlogReadTime(article.content)}
              </span>
            </div>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] text-foreground md:text-7xl">
              {article.title}
            </h1>
            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">{article.excerpt}</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_0.32fr] lg:items-start">
            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
                <h2 className="font-display text-3xl text-foreground">L’article</h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted-foreground md:text-base">
                  {splitBlogContent(article.content).map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-accent-muted p-6 md:p-8">
                <p className="caption-luxe text-accent">Lire aussi</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {relatedPosts.map((related) => (
                    <Link
                      key={related.slug}
                      to="/blog/$slug"
                      params={{ slug: related.slug }}
                      className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      <span>{related.title}</span>
                      <Link2 className="size-4 shrink-0" aria-hidden="true" />
                    </Link>
                  ))}
                </div>
              </section>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/blog"
                  search={{}}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
                >
                  Retour au blog <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/conseils"
                  search={{}}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90"
                >
                  Voir les conseils parfum
                </Link>
              </div>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-24">
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <p className="caption-luxe text-accent">Repères rapides</p>
                <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <li>• Lecture courte et ciblée</li>
                  <li>• Lien direct vers la boutique</li>
                  <li>• Conseils applicables immédiatement</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-border bg-card p-6 shadow-card">
                <p className="caption-luxe text-accent">Navigation utile</p>
                <div className="mt-4 grid gap-3">
                  <Link
                    to="/boutique"
                    search={{}}
                    className="rounded-2xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    Boutique
                  </Link>
                  <Link
                    to="/nos-packs"
                    search={{}}
                    className="rounded-2xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    Nos packs
                  </Link>
                  <Link
                    to="/conseils"
                    search={{}}
                    className="rounded-2xl border border-border px-4 py-3 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    Conseils parfum
                  </Link>
                </div>
              </div>
            </aside>
          </div>

          <div className="text-center">
            <Suspense fallback={null}>
              <BoutiqueLink />
            </Suspense>
          </div>
        </div>
      </article>
      <Suspense fallback={null}>
        <WhatsAppBand />
      </Suspense>
    </SiteLayout>
  );
}
