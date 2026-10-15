import { Link } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Collection } from "@/lib/catalog-data";
import { catalogueCover, catalogueFile, catalogueForCollection } from "@/lib/catalogues";

// Bandeau « Télécharger le catalogue » affiché sur la page d'une catégorie.
export function CatalogueDownload({ collection, className = "" }: { collection: Collection; className?: string }) {
  const entry = catalogueForCollection(collection);
  if (!entry) return null;

  return (
    <div className={className}>
      <div className="flex flex-col items-center gap-4 rounded-lg border border-accent/40 bg-accent-muted p-4 shadow-card sm:flex-row sm:gap-6 sm:p-5">
        <a href={catalogueFile(entry.slug)} download className="shrink-0" aria-label={`Télécharger le catalogue ${entry.title}`}>
          <img
            src={catalogueCover(entry.slug)}
            alt={`Couverture du catalogue ${entry.title}`}
            width={96}
            height={136}
            loading="lazy"
            className="h-[136px] w-[96px] rounded border border-border bg-white object-cover shadow-card"
          />
        </a>
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <p className="caption-luxe text-accent">Catalogue PDF</p>
          <p className="mt-1 font-display text-xl text-foreground md:text-2xl">
            Le catalogue {entry.title}, à garder ou à partager
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.summary} {entry.pages} pages · {entry.size}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-center gap-2">
          <Button asChild className="bg-accent text-primary-foreground hover:bg-accent/90">
            <a href={catalogueFile(entry.slug)} download>
              <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              Télécharger le catalogue
            </a>
          </Button>
          <Link to="/catalogues" className="text-xs text-muted-foreground underline-offset-4 hover:text-accent hover:underline">
            Voir tous les catalogues
          </Link>
        </div>
      </div>
    </div>
  );
}
