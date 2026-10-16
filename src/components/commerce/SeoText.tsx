import { useLocation } from "@tanstack/react-router";

import seoContent from "@/lib/seo-content.json";

type SeoEntry = { heading?: string; paragraphs?: string[]; links?: string[][] };

// Texte de présentation de la page (le même que celui lu par Google avant le chargement du site).
export function SeoText({ path }: { path?: string }) {
  const location = useLocation();
  const entry = (seoContent as unknown as Record<string, SeoEntry>)[path ?? location.pathname];
  if (!entry?.paragraphs?.length) return null;
  return (
    <section className="border-t border-border bg-surface py-10 md:py-14">
      <div className="section-shell max-w-3xl">
        {entry.heading && (
          <h2 className="font-display text-2xl font-semibold text-foreground md:text-3xl">{entry.heading}</h2>
        )}
        <div className="mt-4 space-y-3 text-[15px] leading-7 text-foreground/80">
          {entry.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
        </div>
        {entry.links?.length ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {entry.links.map(([label, href]) => (
              <li key={href}>
                <a
                  href={href}
                  className="inline-flex rounded-full border border-accent/40 bg-background px-4 py-2 text-sm font-semibold text-accent hover:border-accent"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function seoMeta(path: string) {
  const entry = (seoContent as Record<string, { title: string; desc: string }>)[path];
  return entry;
}
