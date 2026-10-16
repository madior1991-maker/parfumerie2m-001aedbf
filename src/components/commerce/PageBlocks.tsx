import { Link } from "@tanstack/react-router";
import { ArrowRight, Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import {
  displayPhone,
  email,
  instagram,
  products,
  secondPhone,
  tiktok,
  tiktokUrl,
  whatsappUrl,
} from "@/lib/perfume-data";
import { TikTokLogo } from "./TikTokLogo";
import { ProductCard } from "./ProductCard";

const facebookUrl = "https://www.facebook.com/profile.php?id=61551806734713";

export function SectionHeader({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text?: string;
}) {
  return (
    <div className="fade-up mx-auto max-w-3xl text-center">
      <p className="caption-luxe text-accent">{eyebrow}</p>
      <h2 className="mt-3 font-display text-[32px] font-medium leading-[1.2] text-foreground md:text-5xl">
        {title}
      </h2>
      {text && <p className="mt-5 text-muted-foreground">{text}</p>}
    </div>
  );
}

export function ProductGrid({ limit }: { limit?: number }) {
  const shown = limit ? products.slice(0, limit) : products;
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {shown.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
}

export function Ticker() {
  const items = [
    "✦ Haqqi dès 4 000 F",
    "✦ SCENTLAB 6 000 F · pack de 3 à 15 000 F",
    "✦ Takeoff 25 000 F · les 2 à 50 000 F",
    "✦ Parfums de poche · pack de 5 à 10 000 F",
    "✦ Livraison rapide à Dakar · 24 à 48h en régions",
    "✦ Livraison offerte dès 75 000 F",
    "✦ Paiement Wave · Orange Money · espèces",
    "✦ Commande avec le gérant sur WhatsApp",
    "✦ Réponse WhatsApp en moins d'1h",
    "✦ Parfums Dubai · Parfums authentiques · Collections privées",
  ];
  return (
    <div
      className="flex h-11 items-center overflow-hidden whitespace-nowrap bg-accent md:h-12"
      aria-hidden="true"
    >
      <div
        className="ticker-track flex w-max shrink-0 flex-nowrap items-center gap-8"
        style={{ animationDuration: `${Math.round((45 * items.length) / 7)}s` }}
      >
        {[...items, ...items, ...items, ...items].map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="nav-luxe shrink-0 whitespace-nowrap text-primary-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WhatsAppBand() {
  return (
    <section className="bg-accent-muted py-12 md:py-16">
      <div className="section-shell flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="caption-luxe text-accent">Commande directe</p>
          <h2 className="mt-3 font-display text-[32px] leading-tight text-foreground md:text-5xl">
            Un parfum choisi, un message envoyé, une réponse humaine.
          </h2>
        </div>
        <Button asChild variant="whatsapp" size="lg">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <WhatsAppLogo tone="light" className="size-5" /> Commander sur WhatsApp
          </a>
        </Button>
      </div>
    </section>
  );
}

export function ContactCards() {
  const cards = [
    {
      icon: WhatsAppLogo,
      label: "WhatsApp",
      value: displayPhone,
      href: whatsappUrl(),
      brand: true,
    },
    { icon: Phone, label: "Téléphone", value: secondPhone, href: "tel:+221781441766" },
    {
      icon: Instagram,
      label: "Instagram",
      value: instagram,
      href: "https://instagram.com/2mparfumeriesn",
    },
    { icon: TikTokLogo, label: "TikTok", value: tiktok, href: tiktokUrl },
    { icon: Facebook, label: "Facebook", value: "2MPARFUMERIE-Dk", href: facebookUrl },
    { icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map(({ icon: Icon, label, value, href, brand }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel="noreferrer"
          className="min-h-32 rounded-lg border border-border bg-card p-5 shadow-card transition-all hover:-translate-y-1 hover:border-accent"
        >
          <Icon className={brand ? "mb-5 size-7" : "mb-5 text-accent"} />
          <p className="caption-luxe text-muted-foreground">{label}</p>
          <p className="mt-2 font-medium text-foreground">{value}</p>
        </a>
      ))}
      <div className="rounded-lg border border-border bg-card p-5 shadow-card sm:col-span-2 lg:col-span-3">
        <MapPin className="mb-5 text-accent" aria-hidden="true" />
        <p className="caption-luxe text-muted-foreground">Zone</p>
        <p className="mt-2 font-display text-2xl text-foreground">
          Sénégal — commandes et livraisons coordonnées partout au pays sur WhatsApp ou par appel.
        </p>
      </div>
    </div>
  );
}

export function BoutiqueLink() {
  return (
    <Button asChild variant="outline" size="lg">
      <Link to="/boutique" search={{}}>
        Voir la boutique <ArrowRight aria-hidden="true" />
      </Link>
    </Button>
  );
}
