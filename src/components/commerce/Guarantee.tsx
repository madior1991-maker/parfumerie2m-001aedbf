import { PackageCheck, ShieldCheck } from "lucide-react";

import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";

function GuaranteeIcon({ kind, className }: { kind: "shield" | "package" | "whatsapp"; className: string }) {
  if (kind === "whatsapp") return <WhatsAppLogo className={className} />;
  const Icon = kind === "shield" ? ShieldCheck : PackageCheck;
  return <Icon className={className} aria-hidden="true" />;
}

export const guarantees = [
  {
    icon: "shield",
    title: "Vrais produits, vraie marque",
    short: "Chaque flacon vendu sous sa vraie marque",
    body: "Chaque parfum est vendu sous sa vraie marque : TAKEOFF, SCENTLAB, Haqqi, les maisons de Dubaï ou la grande marque d’origine. Nos créations « inspirées de » ne sont jamais vendues comme des originaux. Pas de surprise.",
  },
  {
    icon: "package",
    title: "Flacon abîmé ? On l'échange",
    short: "Flacon abîmé ou erreur : échangé",
    body: "Ton flacon arrive cassé, il fuit, ou ce n'est pas le bon ? Envoie-nous une photo sur WhatsApp dans les 24h après réception. On te l'échange, sans frais.",
  },
  {
    icon: "whatsapp",
    title: "Un humain te répond",
    short: "Réponse en moins d'1h sur WhatsApp",
    body: "Avant et après ta commande, quelqu'un de l'équipe te répond sur WhatsApp en moins d'1h. Pas de robot.",
  },
] as const;

/** Bloc complet, pour les pages Livraison et À propos. */
export function GuaranteeSection() {
  return (
    <section aria-labelledby="garantie-titre" className="rounded-lg border border-accent/30 bg-accent-muted p-6 md:p-8">
      <p className="caption-luxe text-accent">Garantie 2M</p>
      <h2 id="garantie-titre" className="mt-2 font-display text-3xl text-foreground md:text-4xl">
        Tu commandes l'esprit tranquille.
      </h2>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {guarantees.map(({ icon, title, body }) => (
          <div key={title}>
            <GuaranteeIcon kind={icon} className="mb-3 size-7 text-accent" />
            <h3 className="font-display text-xl text-foreground">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Version courte, sous le bouton de commande des fiches produit. */
export function GuaranteeStrip() {
  return (
    <ul className="mt-5 grid gap-2 rounded-lg border border-border bg-surface p-4" aria-label="Garantie 2M">
      {guarantees.map(({ icon, short }) => (
        <li key={short} className="flex items-center gap-3 text-[13px] text-foreground">
          <GuaranteeIcon kind={icon} className="size-4 shrink-0 text-accent" />
          {short}
        </li>
      ))}
    </ul>
  );
}
