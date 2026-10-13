import { createFileRoute } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { SiteLayout } from "@/components/commerce/SiteLayout";
import { displayPhone, email, instagram, secondPhone, tiktok, tiktokUrl, whatsappUrl } from "@/lib/perfume-data";
import { TikTokLogo } from "@/components/commerce/TikTokLogo";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — 2M Parfumerie Dakar | WhatsApp & Téléphone" },
      {
        name: "description",
        content:
          "Contactez 2M Parfumerie à Dakar. WhatsApp et appels disponibles 7j/7. Livraison partout au Sénégal. 2mparfumerie2025@gmail.com",
      },
      { name: "keywords", content: "Haqqi, Scentlab, Takeoff Fragance, Parfums authentique, Parfums Dubai, Parfums de poches" },
      { property: "og:title", content: "Contact — 2M Parfumerie Dakar" },
      {
        property: "og:description",
        content: "WhatsApp et appels disponibles 7j/7. Livraison partout au Sénégal.",
      },
    ],
    scripts: [
      { type: "application/ld+json", children: contactLocalBusinessJson },
    ],
  }),
  component: ContactPage,
});

// Add JSON-LD LocalBusiness for contact page
const contactLocalBusinessJson = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "2M Parfumerie",
  telephone: "+221761923441",
  email: "2mparfumerie2025@gmail.com",
  address: { "@type": "PostalAddress", addressCountry: "SN", addressLocality: "Dakar" },
  sameAs: ["https://instagram.com/2mparfumeriesn", "https://www.tiktok.com/@2mparfumerie", "https://www.facebook.com/profile.php?id=61551806734713"],
});

const schedules = [
  ["Lundi – Vendredi", "08h – 20h"],
  ["Samedi", "09h – 20h"],
  ["Dimanche", "10h – 18h"],
];

const facebookUrl = "https://www.facebook.com/profile.php?id=61551806734713";

function ContactPage() {
  return (
    <SiteLayout>
      <section className="bg-surface pt-24 pb-12 md:pt-32 md:pb-16">
        <div className="section-shell text-center">
          <p className="caption-luxe text-accent">Nous sommes là</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-foreground md:text-[56px]">
            Parlons parfums.
          </h1>
        </div>
      </section>

      <section className="bg-background py-14 md:py-20">
        <div className="section-shell grid gap-10 md:grid-cols-2 md:gap-16">
          <div className="fade-up">
            <h2 className="mb-6 font-display text-[32px] text-foreground md:mb-8">
              Comment nous joindre
            </h2>
            <div className="space-y-6 md:space-y-8">
              <ContactItem
                icon={<WhatsAppLogo className="size-7 text-whatsapp" />}
                label="WhatsApp — Disponible 7j/7"
              >
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-foreground hover:text-accent"
                >
                  {displayPhone}
                </a>
                <p className="mt-1 text-sm text-muted-foreground">
                  Réponse en moins d'1h · Lun–Dim
                </p>
                <a
                  href={whatsappUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-6 py-3 text-[13px] font-semibold text-primary-foreground hover:bg-whatsapp-hover"
                >
                  <WhatsAppLogo tone="light" className="size-4" /> Écrire sur WhatsApp →
                </a>
              </ContactItem>

              <ContactItem
                icon={<Phone className="size-6 text-accent" aria-hidden="true" />}
                label="Appel normal — 2 numéros"
              >
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-foreground">
                  <a href="tel:+221761923441" className="hover:text-accent">
                    {displayPhone}
                  </a>
                  <span className="text-muted-foreground">·</span>
                  <a href="tel:+221781441766" className="hover:text-accent">
                    {secondPhone}
                  </a>
                </div>
              </ContactItem>

              <ContactItem
                icon={<Mail className="size-6 text-accent" aria-hidden="true" />}
                label="Email"
              >
                <a href={`mailto:${email}`} className="text-foreground hover:text-accent">
                  {email}
                </a>
              </ContactItem>

              <ContactItem
                icon={<Instagram className="size-6 text-accent" aria-hidden="true" />}
                label="Instagram"
              >
                <a
                  href="https://instagram.com/2mparfumeriesn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-accent"
                >
                  {instagram}
                </a>
              </ContactItem>

              <ContactItem
                icon={<TikTokLogo className="size-6 text-accent" />}
                label="TikTok"
              >
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-accent"
                >
                  {tiktok}
                </a>
              </ContactItem>

              <ContactItem
                icon={<Facebook className="size-6 text-accent" aria-hidden="true" />}
                label="Facebook"
              >
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:text-accent"
                >
                  2MPARFUMERIE-Dk
                </a>
              </ContactItem>

              <ContactItem
                icon={<MapPin className="size-6 text-accent" aria-hidden="true" />}
                label="Zone de livraison"
              >
                <p className="text-foreground">Partout au Sénégal</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Livraison en 24 à 48h · Dakar 1 500 à 2 000 F, régions 2 000 F · offerte dès 75 000 F
                </p>
              </ContactItem>
            </div>
          </div>

          <aside className="fade-up rounded-lg border border-border bg-surface p-5 shadow-card md:self-start md:p-8">
            <h2 className="mb-6 font-display text-2xl text-foreground">
              Horaires de disponibilité
            </h2>
            <div>
              {schedules.map(([day, time]) => (
                <div
                  key={day}
                  className="flex justify-between gap-4 border-b border-border py-3 text-sm"
                >
                  <span className="text-muted-foreground">{day}</span>
                  <span className="font-medium text-foreground">{time}</span>
                </div>
              ))}
            </div>
            <div className="my-6 h-px bg-border" />
            <h3 className="mb-4 font-display text-xl text-foreground">Zone de livraison</h3>
            <p className="text-[13px] leading-[1.8] text-muted-foreground">
              Livraison disponible partout au Sénégal, avec confirmation du délai selon votre ville
              ou région.
            </p>
            <span className="caption-luxe mt-4 block text-accent">
              Clients satisfaits dans plusieurs régions du Sénégal
            </span>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
}

function ContactItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 md:gap-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-muted">
        {icon}
      </div>
      <div>
        <p className="caption-luxe mb-2 text-accent">{label}</p>
        {children}
      </div>
    </div>
  );
}
