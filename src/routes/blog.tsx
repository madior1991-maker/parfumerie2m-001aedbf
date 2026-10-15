import { Outlet, createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, MessageCircle, Search, Sparkles, Tag } from "lucide-react";
import React, { Suspense } from "react";
import type { ComponentType } from "react";

const BoutiqueLink = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.BoutiqueLink })));
const WhatsAppBand = React.lazy(() => import("@/components/commerce/PageBlocks").then((m) => ({ default: m.WhatsAppBand })));
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { estimateBlogReadTime, formatBlogDate } from "@/lib/blog-data";

type BlogPostRow = Database["public"]["Tables"]["blog_posts"]["Row"];

const topicPillars = [
  "Guides parfum au Sénégal",
  "Sélection des meilleures signatures",
  "Conseils pour durer sous la chaleur",
  "Authenticité et choix éclairé",
] as const;

const quickLinks = [
  { label: "Conseils parfum", to: "/conseils" },
  { label: "Boutique", to: "/boutique" },
  { label: "Coffret signature", to: "/coffret-signature" },
] as const;

export const Route = createFileRoute("/blog")({
  loader: async () => {
    const { data } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    return data ?? [];
  },
  head: ({ loaderData }) => {
    const blogPosts = (loaderData ?? []) as BlogPostRow[];

    return {
      meta: [
        { title: "Blog parfum Sénégal | 2M Parfumerie" },
        {
          name: "description",
          content:
            "Blog 2M Parfumerie: guides parfum, tendances à Dakar et conseils d'achat pour découvrir les meilleures signatures olfactives.",
        },
      ],
      links: [{ rel: "canonical", href: "https://www.2mparfumeriedk.com/blog" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            name: "Blog 2M Parfumerie",
            description:
              "Guides parfum, tendances et conseils pour mieux choisir ses fragrances au Sénégal.",
            url: "https://www.2mparfumeriedk.com/blog",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: blogPosts.map((article, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: article.title,
              url: `https://www.2mparfumeriedk.com/blog/${article.slug}`,
            })),
          }),
        },
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
            ],
          }),
        },
      ],
    };
  },
  component: BlogPage,
});

function BlogPage() {
  const blogPosts = Route.useLoaderData() as BlogPostRow[];
  const location = useLocation();

  if (location.pathname !== "/blog") {
    return <Outlet />;
  }

  return (
    <SiteLayout>
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-40 md:pb-20">
        <div className="section-shell space-y-10 md:space-y-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div className="space-y-6">
              <p className="caption-luxe text-accent fade-up">Blog parfum</p>
              <h1 className="fade-up delay-120 font-display text-4xl font-semibold leading-[1.05] text-foreground md:text-7xl">
                Le blog parfum de 2M Parfumerie pour découvrir des conseils utiles et des idées
                parfum.
              </h1>
              <p className="fade-up delay-180 max-w-2xl text-base text-muted-foreground md:text-lg">
                Cette page rassemble des conseils parfum, des tendances à Dakar, des comparatifs
                et des repères simples avant d’acheter.
              </p>
              <div className="fade-up delay-240 flex flex-wrap gap-3">
                {topicPillars.map((pillar) => (
                  <span
                    key={pillar}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-card"
                  >
                    <Sparkles className="size-4 text-accent" aria-hidden="true" />
                    {pillar}
                  </span>
                ))}
              </div>
              <div className="fade-up delay-300 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  to="/conseils"
                  search={{}}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-accent/90"
                >
                  Lire les conseils parfum <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/boutique"
                  search={{}}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-medium text-foreground transition-all hover:border-accent hover:text-accent"
                >
                  Voir les collections <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
            <aside className="fade-up rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
              <div className="flex items-center gap-3 text-accent">
                <Search className="size-5" aria-hidden="true" />
                <p className="caption-luxe">Repères du blog</p>
              </div>
              <div className="mt-6 space-y-4">
                <Metric icon={CalendarDays} label="Fréquence" value="2 à 4 articles/mois" />
                <Metric icon={Tag} label="Sujets" value="guide, tendance, authenticité" />
                <Metric icon={MessageCircle} label="But" value="aider à choisir plus facilement" />
              </div>
              <div className="mt-8 rounded-2xl bg-accent-muted p-5">
                <p className="caption-luxe text-accent">À lire</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <li>• Choisir un parfum selon la saison</li>
                  <li>• Distinguer les familles olfactives</li>
                  <li>• Acheter plus sereinement en ligne</li>
                </ul>
              </div>
            </aside>
          </div>

          {blogPosts.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {blogPosts.map((post, index) => (
                <article
                  key={post.slug}
                  className={`fade-up ${["delay-90", "delay-180", "delay-270"][index] ?? "delay-270"} group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-accent`}
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-accent">
                    <span>{post.category}</span>
                    <span className="text-border">/</span>
                    <span>{estimateBlogReadTime(post.content)}</span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl leading-tight text-foreground">
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="transition-colors group-hover:text-accent"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-3 flex-1 text-sm leading-6 text-muted-foreground">
                    {post.excerpt}
                  </p>
                  <div className="mt-6 flex items-center justify-between gap-4 text-xs text-muted-foreground">
                    <span>{formatBlogDate(post.created_at)}</span>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: post.slug }}
                      className="inline-flex items-center gap-1 font-medium text-foreground transition-colors hover:text-accent"
                    >
                      Lire <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-card">
              <p className="caption-luxe text-accent">Blog</p>
              <h2 className="mt-3 font-display text-3xl text-foreground">
                Aucun article n’est publié pour le moment.
              </h2>
              <p className="mt-4 text-muted-foreground">
                L’admin peut créer et publier le premier article depuis l’espace privé.
              </p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">
            <article className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
              <p className="caption-luxe text-accent">Sélection de lectures</p>
              <h2 className="mt-3 font-display text-3xl text-foreground md:text-4xl">
                Une page blog qui renforce le site et renvoie vers les pages qui comptent.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Les articles à venir peuvent répondre aux questions fréquentes, puis orienter
                naturellement les visiteurs vers la boutique, les conseils ou les coffrets.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    search={{}}
                    className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-8 grid gap-3">
                {blogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    to="/blog/$slug"
                    params={{ slug: post.slug }}
                    className="flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground transition-colors hover:border-accent hover:text-accent"
                  >
                    <span>{post.title}</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </article>
            <aside className="rounded-3xl border border-border bg-accent-muted p-6 md:p-8">
              <p className="caption-luxe text-accent">Prochaines idées</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li>• Les meilleures notes pour la chaleur humide</li>
                <li>• Parfums masculins les plus demandés au Sénégal</li>
                <li>• Comment porter un parfum intense sans saturer</li>
                <li>• Top signatures pour cadeaux et coffrets</li>
              </ul>
            </aside>
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

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-background/70 p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}
