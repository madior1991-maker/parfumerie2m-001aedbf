import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import pocketHommeImage from "@/assets/pocket-perfumes-homme.webp";
import pocketFemmeImage from "@/assets/pocket-perfumes-femme.webp";

export function PocketShowcase() {
  return (
    <div className="space-y-8">
      <div className="mx-auto max-w-sm overflow-hidden rounded-lg border border-border bg-card shadow-card">
        <video
          src="/videos/pocket-perfumes.mp4"
          poster="/videos/pocket-perfumes-poster.jpg"
          autoPlay
          loop
          muted
          playsInline
          controls
          className="h-full w-full object-cover"
        />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <img
            src={pocketHommeImage}
            alt="Parfums de poche Homme — 2M Parfumerie"
            className="h-full w-full object-contain p-6"
            loading="lazy"
          />
        </div>
        <div className="overflow-hidden rounded-lg border border-border bg-surface shadow-card">
          <img
            src={pocketFemmeImage}
            alt="Parfums de poche Femme — 2M Parfumerie"
            className="h-full w-full object-contain p-6"
            loading="lazy"
          />
        </div>
      </div>
      <div className="rounded-lg border border-border bg-surface-alt px-6 py-10 text-center">
        <p className="caption-luxe text-accent">Compose ton pack</p>
        <h2 className="mt-2 font-display text-2xl text-foreground md:text-3xl">
          Crée ton pack Parfums de poche ici
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
          Sélectionne 5 parfums de poche et compose ton pack.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            asChild
            size="lg"
            className="h-auto max-w-full whitespace-normal break-words bg-accent px-6 py-3 text-center text-primary-foreground shadow-elegant ring-2 ring-accent/40 ring-offset-2 ring-offset-surface-alt animate-pulse hover:bg-accent/90"
          >
            <Link to="/coffret-signature">Pack Parfums de poche (5 parfums) — 10 000 FCFA</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
