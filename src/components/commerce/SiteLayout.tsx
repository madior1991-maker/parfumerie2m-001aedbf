import { Link, useLocation } from "@tanstack/react-router";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShoppingBag,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { CartDrawer } from "@/components/commerce/CartDrawer";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";
import { displayPhone, email, instagram, secondPhone, tiktokUrl, whatsappUrl } from "@/lib/perfume-data";
import { TikTokLogo } from "@/components/commerce/TikTokLogo";

const navItems = [
  { label: "Boutique", to: "/boutique" },
  { label: "Takeoff", to: "/collections/takeoff" },
  { label: "Compose ton pack", to: "/coffret-signature" },
  { label: "Blog", to: "/blog" },
  { label: "À Propos", to: "/a-propos" },
  { label: "Contact", to: "/contact" },
] as const;

const footerCollections = [
  { label: "SCENTLAB", collection: "scentlab" },
  { label: "TAKEOFF FRAGRANCE", collection: "takeoff" },
  { label: "Dubai Perfumes", collection: "dubai" },
  { label: "Parfums de poches", collection: "pocket" },
  { label: "Parfums authentiques", collection: "authentic" },
  { label: "Haqqi", collection: "haqqi" },
  { label: "Collections privées", collection: "privees" },
  { label: "Coffrets", collection: "coffrets" },
  { label: "Fragrance library", collection: "library" },
] as const;

const boutiqueCategories = [
  { label: "All scents", to: "/boutique" as const },
  { label: "Collections privées", to: "/collections/collections-privees" as const },
  { label: "Coffrets", to: "/collections/coffrets" as const },
  { label: "Fragrance library", to: "/collections/fragrance-library" as const },
  { label: "SCENTLAB", to: "/collections/scentlab" as const },
  { label: "TAKEOFF FRAGRANCE", to: "/collections/takeoff" as const },
  { label: "Dubai Perfumes", to: "/boutique" as const, collection: "dubai" },
  { label: "Parfums de poches", to: "/boutique" as const, collection: "pocket" },
  { label: "Parfums authentiques", to: "/boutique" as const, collection: "authentic" },
  { label: "Haqqi", to: "/collections/haqqi" as const },
] as const;

const facebookUrl = "https://www.facebook.com/profile.php?id=61551806734713";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <nav
          className={cn(
            "fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b border-transparent px-3 transition-all duration-300 md:h-20 md:px-6",
            scrolled && "glass-nav border-accent/15",
          )}
        >
          <Link
            to="/"
            className="brand-wordmark text-xl font-bold text-accent md:text-[24px]"
            aria-label="2M Parfumerie accueil"
          >
            2M Parfumerie
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {navItems.map((item) =>
              item.to === "/boutique" ? (
                <div key={item.to} className="group/boutique relative">
                  <Link
                    to={item.to}
                    className="group nav-luxe relative min-h-11 content-center text-muted-foreground hover:text-accent transition-colors"
                    activeProps={{ className: "text-accent" }}
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-1 w-0 bg-accent rounded-full transition-all duration-300 group-hover:w-full group-data-[status=active]:w-full" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover/boutique:visible group-hover/boutique:opacity-100">
                    <div className="grid gap-1 rounded-lg border border-border bg-card p-3 shadow-elegant">
                      {boutiqueCategories.map((category) => (
                        <Link
                          key={category.label}
                          to={category.to}
                          search={"collection" in category ? { collection: category.collection } : {}}
                          className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-alt hover:text-accent"
                        >
                          {category.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="group nav-luxe relative min-h-11 content-center text-muted-foreground hover:text-accent transition-colors"
                  activeProps={{ className: "text-accent" }}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-1 w-0 bg-accent rounded-full transition-all duration-300 group-hover:w-full group-data-[status=active]:w-full" />
                </Link>
              ),
            )}
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative hidden size-11 items-center justify-center text-muted-foreground hover:text-accent md:flex"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="size-[22px]" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </button>
          <Button asChild variant="whatsapp" size="sm" className="hidden md:inline-flex">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              <WhatsAppLogo tone="light" className="size-4" /> Commander
            </a>
          </Button>
          <div className="flex items-center gap-1 md:hidden">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex size-11 items-center justify-center text-muted-foreground hover:text-accent"
              aria-label="Ouvrir le panier"
            >
              <ShoppingBag className="size-[22px]" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center text-foreground"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              onClick={() => setOpen((value) => !value)}
            >
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </nav>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 flex flex-col items-center justify-center bg-background px-6 transition-all duration-300 md:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
      >
        <div className="flex flex-col items-center gap-7">
          {navItems.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="font-display text-[28px] text-foreground transition-all"
              activeProps={{ className: "text-accent underline underline-offset-8" }}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="absolute bottom-6 left-4 right-4 h-[52px] md:bottom-8 md:left-6 md:right-6"
        >
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            <WhatsAppLogo tone="light" className="size-5" /> Commander sur WhatsApp
          </a>
        </Button>
      </div>

      <a href="#main-content" className="skip-link">
        Aller au contenu
      </a>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      {/* Sur les fiches produits, le grand bouton WhatsApp suffit : la bulle le cachait sur mobile. */}
      {!location.pathname.startsWith("/boutique/") && <FloatingWhatsApp />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-footer py-10 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 md:grid-cols-4 md:gap-10 md:px-6">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="brand-wordmark text-2xl font-bold text-accent">
            2M Parfumerie
          </Link>
          <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">
            L'authenticité en flacon. Livraison partout au Sénégal.
          </p>
          <div className="mt-6 flex gap-4">
            <a
              href="https://instagram.com/2mparfumeriesn"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              aria-label="Instagram 2M Parfumerie"
              title="Logo Instagram 2M Parfumerie"
            >
              <Instagram className="size-5" aria-label="Logo Instagram 2M Parfumerie" />
            </a>
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              aria-label="TikTok 2M Parfumerie"
              title="TikTok 2M Parfumerie"
            >
              <TikTokLogo className="size-5" />
            </a>
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
              aria-label="Facebook 2M Parfumerie"
              title="Logo Facebook 2M Parfumerie"
            >
              <Facebook className="size-5" aria-label="Logo Facebook 2M Parfumerie" />
            </a>
            <a
              href={whatsappUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-whatsapp text-primary-foreground hover:bg-whatsapp-hover hover:shadow-green transition-all"
              aria-label="WhatsApp 2M Parfumerie"
            >
              <WhatsAppLogo tone="light" className="size-5" />
            </a>
          </div>
        </div>
        <FooterColumn title="Navigation">
          {[...navItems, { label: "Mentions légales", to: "/mentions-legales" as const }].map(
            (item) => (
              <FooterLink key={item.to} to={item.to}>
                {item.label}
              </FooterLink>
            ),
          )}
        </FooterColumn>
        <FooterColumn title="Collections">
          {footerCollections.map((item) => (
            <Link
              key={item.collection}
              to="/boutique"
              search={{ collection: item.collection }}
              className="block min-h-9 py-1 text-[13px] text-muted-foreground hover:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </FooterColumn>
        <FooterColumn title="Contact" className="col-span-2 md:col-span-1">
          <a
            href="tel:+221761923441"
            className="flex min-h-9 items-center gap-2 py-1 text-[13px] text-muted-foreground hover:text-primary-foreground"
          >
            <Phone className="size-4 shrink-0" aria-hidden="true" /> {displayPhone}
          </a>
          <a
            href="tel:+221781441766"
            className="flex min-h-9 items-center gap-2 py-1 text-[13px] text-muted-foreground hover:text-primary-foreground"
          >
            <Phone className="size-4 shrink-0" aria-hidden="true" /> {secondPhone}
          </a>
          <a
            href={`mailto:${email}`}
            className="flex min-h-9 items-center gap-2 py-1 text-[13px] text-muted-foreground hover:text-primary-foreground"
          >
            <Mail className="size-4 shrink-0" aria-hidden="true" /> {email}
          </a>
          <p className="flex min-h-9 items-center gap-2 py-1 text-[13px] text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" /> Dakar
          </p>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary-foreground hover:bg-whatsapp-hover"
          >
            <WhatsAppLogo tone="light" className="size-4" /> Commander maintenant
          </a>
        </FooterColumn>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col justify-between gap-3 border-t border-foreground/5 px-4 pt-8 text-xs text-muted-foreground md:flex-row md:px-6">
        <p>© 2026 2M Parfumerie. Tous droits réservés.</p>
        <p>
          Fait avec ♥ à Dakar · Site by{" "}
          <a
            href="https://www.nextwavesn.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-accent hover:underline"
          >
            Nextwave
          </a>
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="caption-luxe mb-3 text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({
  to,
  children,
}: {
  to:
    | "/"
    | "/boutique"
    | "/collections/takeoff"
    | "/coffret-signature"
    | "/blog"
    | "/a-propos"
    | "/contact"
    | "/mentions-legales";
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="block min-h-9 py-1 text-[13px] text-muted-foreground hover:text-primary-foreground"
    >
      {children}
    </Link>
  );
}

function FloatingWhatsApp() {
  const [rippling, setRippling] = useState(false);
  return (
    <a
      href={whatsappUrl(
        "Bonjour 2M Parfumerie 👋 Je souhaite commander un parfum. Pouvez-vous m'aider ?",
      )}
      target="_blank"
      rel="noopener noreferrer"
      role="link"
      aria-label="Commander sur WhatsApp"
      onClick={() => {
        setRippling(true);
        window.setTimeout(() => setRippling(false), 500);
      }}
      className="group fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center overflow-visible rounded-full bg-whatsapp text-primary-foreground whatsapp-pulse focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:bottom-6 md:right-6 md:h-[60px] md:w-[60px]"
    >
      <span className="pointer-events-none absolute right-[72px] hidden whitespace-nowrap rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground opacity-0 shadow-card transition-opacity group-hover:opacity-100 md:block">
        Commander sur WhatsApp
      </span>
      {rippling && (
        <span
          className="absolute inset-0 animate-ping rounded-full bg-primary-foreground/30"
          aria-hidden="true"
        />
      )}
      <WhatsAppLogo tone="light" className="size-8" />
    </a>
  );
}
