import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
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
import type { Collection } from "@/lib/catalog-data";
import { useCustomCollections } from "@/lib/live-catalog";

// Menu principal : l'essentiel pour acheter. Le reste passe dans « Aide ».
const navItems = [
  { label: "Boutique", to: "/boutique" },
  { label: "Compose ton pack", to: "/coffret-signature" },
  { label: "Catalogues", to: "/catalogues" },
] as const;

const helpItems = [
  { label: "Quiz parfum", hint: "Trouve ton parfum en 1 minute", to: "/trouve-ton-parfum" },
  { label: "Livraison", hint: "Tarifs, délais, paiement", to: "/livraison" },
  { label: "FAQ", hint: "Les questions fréquentes", to: "/faq" },
  { label: "Contact", hint: "WhatsApp, appel, e-mail", to: "/contact" },
] as const;

const moreItems = [
  { label: "À propos", to: "/a-propos" },
  { label: "Conseils", to: "/conseils" },
  { label: "Blog", to: "/blog" },
] as const;

type SiteCollection = {
  label: string;
  price: string;
  to:
    | "/collections/haqqi"
    | "/collections/scentlab"
    | "/collections/takeoff"
    | "/collections/parfums-dubai"
    | "/collections/parfums-authentiques"
    | "/collections/parfums-de-poches"
    | "/collections/collections-privees"
    | "/collections/callisto-paris"
    | "/collections/coffrets"
    | "/collections/fragrance-library"
    | "/collections/soie-sublime"
    | "/boutique";
  collection?: Collection;
};

// Collections du menu, du menu mobile et du pied de page (une seule liste).
const siteCollections: SiteCollection[] = [
  { label: "Haqqi", price: "Dès 4 000 F", to: "/collections/haqqi" },
  { label: "SCENTLAB", price: "6 000 F", to: "/collections/scentlab" },
  { label: "Takeoff", price: "25 000 F", to: "/collections/takeoff" },
  { label: "Parfums de poche", price: "Pack de 5 à 10 000 F", to: "/collections/parfums-de-poches" },
  { label: "Parfums Dubai", price: "Dès 12 000 F", to: "/collections/parfums-dubai" },
  { label: "Parfums authentiques", price: "Les originaux", to: "/collections/parfums-authentiques" },
  { label: "Callisto Paris", price: "75 000 F", to: "/collections/callisto-paris" },
  { label: "Soie Sublime Paris", price: "90 000 F", to: "/collections/soie-sublime" },
  { label: "Collections privées", price: "Éditions rares", to: "/collections/collections-privees" },
  { label: "Coffrets", price: "Prêts à offrir", to: "/collections/coffrets" },
  { label: "Fragrance Library", price: "30 000 F", to: "/collections/fragrance-library" },
];

const footerPages = [
  { label: "Boutique", to: "/boutique" },
  { label: "Compose ton pack", to: "/coffret-signature" },
  { label: "Catalogues PDF", to: "/catalogues" },
  { label: "Quiz parfum", to: "/trouve-ton-parfum" },
  { label: "Livraison", to: "/livraison" },
  { label: "FAQ", to: "/faq" },
  { label: "Conseils", to: "/conseils" },
  { label: "Blog", to: "/blog" },
  { label: "À propos", to: "/a-propos" },
  { label: "Contact", to: "/contact" },
  { label: "Mentions légales", to: "/mentions-legales" },
] as const;

const collectionSearch = (item: SiteCollection) => (item.collection ? { collection: item.collection } : {});

const formatFrom = (price: number) =>
  price > 0 ? `Dès ${new Intl.NumberFormat("fr-FR").format(price).replace(/\s/g, " ")} F` : "Nouveau";

// Les catégories créées dans l'admin s'ajoutent au menu et au pied de page.
function useAllCollections(): SiteCollection[] {
  const customCollections = useCustomCollections();
  return [
    ...siteCollections,
    ...customCollections.map((item) => ({
      label: item.label,
      price: formatFrom(item.minPrice),
      to: "/boutique" as const,
      collection: item.value,
    })),
  ];
}

const facebookUrl = "https://www.facebook.com/profile.php?id=61551806734713";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount } = useCart();
  const location = useLocation();
  const allCollections = useAllCollections();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setCollectionsOpen(false);
    setHelpOpen(false);
  }, [location.pathname, location.searchStr]);

  useEffect(() => {
    if (!collectionsOpen && !helpOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setCollectionsOpen(false);
      setHelpOpen(false);
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-collections-menu]")) setCollectionsOpen(false);
      if (!target.closest("[data-help-menu]")) setHelpOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [collectionsOpen, helpOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header>
        <nav
          className={cn(
            "nav-maison fixed left-0 top-0 z-50 flex h-16 w-full items-center justify-between border-b px-3 transition-all duration-300 md:h-20 md:px-6",
            scrolled && "glass-nav",
          )}
        >
          <Link
            to="/"
            className="brand-wordmark flex items-center gap-2 whitespace-nowrap text-lg font-bold text-accent md:gap-3 md:text-[22px]"
            aria-label="2M Parfumerie accueil"
          >
            <img
              src="/logo-2m-parfumerie.svg"
              alt=""
              width={2683}
              height={2357}
              className="h-11 w-auto md:h-[60px]"
              fetchPriority="high"
            />
            <span>2M Parfumerie</span>
          </Link>
          <div className="hidden items-center gap-7 xl:flex">
            <div
              className="relative"
              data-collections-menu
              onMouseEnter={() => setCollectionsOpen(true)}
              onMouseLeave={() => setCollectionsOpen(false)}
            >
              <button
                type="button"
                aria-expanded={collectionsOpen}
                aria-controls="menu-collections"
                onClick={() => setCollectionsOpen(true)}
                className={cn(
                  "nav-luxe inline-flex min-h-11 items-center gap-1 text-muted-foreground transition-colors hover:text-accent",
                  (collectionsOpen || location.pathname.startsWith("/collections")) && "text-accent",
                )}
              >
                Collections
                <ChevronDown
                  className={cn("size-4 transition-transform", collectionsOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              <div
                id="menu-collections"
                className={cn(
                  "absolute left-1/2 top-full z-50 w-[520px] -translate-x-1/2 pt-3 transition-all duration-200",
                  collectionsOpen ? "visible opacity-100" : "invisible opacity-0",
                )}
              >
                <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-card p-3 shadow-elegant">
                  {allCollections.map((item) => (
                    <Link
                      key={item.label}
                      to={item.to}
                      search={collectionSearch(item)}
                      className="rounded-md px-3 py-2 transition-colors hover:bg-surface-alt"
                    >
                      <span className="block text-sm font-medium text-foreground">{item.label}</span>
                      <span className="block text-xs text-accent">{item.price}</span>
                    </Link>
                  ))}
                  <Link
                    to="/boutique"
                    search={{}}
                    className="col-span-2 mt-1 rounded-md border-t border-border px-3 pt-3 text-sm font-semibold text-accent hover:underline"
                  >
                    Voir tous les parfums →
                  </Link>
                  <Link
                    to="/catalogues"
                    className="col-span-2 rounded-md px-3 pb-1 text-xs text-muted-foreground hover:text-accent hover:underline"
                  >
                    Télécharger les catalogues PDF
                  </Link>
                </div>
              </div>
            </div>
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group nav-luxe relative min-h-11 content-center text-muted-foreground transition-colors hover:text-accent"
                activeProps={{ className: "text-accent" }}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-1 w-0 rounded-full bg-accent transition-all duration-300 group-hover:w-full group-data-[status=active]:w-full" />
              </Link>
            ))}
            <div
              className="relative"
              data-help-menu
              onMouseEnter={() => setHelpOpen(true)}
              onMouseLeave={() => setHelpOpen(false)}
            >
              <button
                type="button"
                aria-expanded={helpOpen}
                aria-controls="menu-aide"
                onClick={() => setHelpOpen(true)}
                className={cn(
                  "nav-luxe inline-flex min-h-11 items-center gap-1 text-muted-foreground transition-colors hover:text-accent",
                  (helpOpen || helpItems.some((item) => location.pathname === item.to)) && "text-accent",
                )}
              >
                Aide
                <ChevronDown className={cn("size-4 transition-transform", helpOpen && "rotate-180")} aria-hidden="true" />
              </button>
              <div
                id="menu-aide"
                className={cn(
                  "absolute right-0 top-full z-50 w-[280px] pt-3 transition-all duration-200",
                  helpOpen ? "visible opacity-100" : "invisible opacity-0",
                )}
              >
                <div className="grid gap-1 rounded-lg border border-border bg-card p-3 shadow-elegant">
                  {helpItems.map((item) => (
                    <Link key={item.to} to={item.to} className="rounded-md px-3 py-2 transition-colors hover:bg-surface-alt">
                      <span className="block text-sm font-medium text-foreground">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">{item.hint}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative hidden size-11 items-center justify-center text-muted-foreground hover:text-accent xl:flex"
            aria-label="Ouvrir le panier"
          >
            <ShoppingBag className="size-[22px]" aria-hidden="true" />
            {itemCount > 0 && (
              <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary-foreground">
                {itemCount}
              </span>
            )}
          </button>
          <Button asChild variant="whatsapp" size="sm" className="hidden xl:inline-flex">
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
              <WhatsAppLogo tone="light" className="size-4" /> Commander
            </a>
          </Button>
          <div className="flex items-center gap-1 xl:hidden">
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
          "fixed inset-0 z-40 flex flex-col bg-background px-5 pt-20 transition-all duration-300 xl:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        )}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex-1 overflow-y-auto pb-4">
          <p className="caption-luxe mb-2 text-accent">Collections</p>
          <div className="grid grid-cols-2 gap-2">
            {allCollections.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                search={collectionSearch(item)}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                <span className="block truncate text-[14px] font-medium leading-tight text-foreground">{item.label}</span>
                <span className="mt-0.5 block truncate text-[11px] text-accent">{item.price}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 grid">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-b border-border py-3 font-display text-[22px] text-foreground"
                activeProps={{ className: "text-accent" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <p className="caption-luxe mb-2 mt-6 text-accent">Aide</p>
          <div className="grid grid-cols-2 gap-x-4">
            {[...helpItems, ...moreItems].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="border-b border-border py-2.5 text-[15px] text-muted-foreground"
                activeProps={{ className: "text-accent" }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
        <Button asChild variant="whatsapp" size="lg" className="mb-4 h-[52px] w-full">
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
      {!open && !cartOpen && !location.pathname.startsWith("/boutique/") && location.pathname !== "/coffret-signature" && <FloatingWhatsApp />}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

function SiteFooter() {
  const allCollections = useAllCollections();
  return (
    <footer className="border-t border-border bg-footer py-10 md:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 md:gap-10 md:px-6 lg:grid-cols-4">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="inline-block" aria-label="2M Parfumerie accueil">
            <img
              src="/logo-2m-parfumerie.svg"
              alt="Logo 2M Parfumerie"
              width={2683}
              height={2357}
              loading="lazy"
              className="h-24 w-auto md:h-28"
            />
          </Link>
          <p className="mt-2 max-w-xs text-[13px] text-muted-foreground">
            Parfums dès 4 000 F. Livraison partout au Sénégal.
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
        <FooterColumn title="Pages">
          {footerPages.map((item) => (
            <FooterLink key={item.to} to={item.to}>
              {item.label}
            </FooterLink>
          ))}
        </FooterColumn>
        <FooterColumn title="Collections">
          {allCollections.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={collectionSearch(item)}
              className="block min-h-9 py-1 text-[13px] text-muted-foreground hover:text-primary-foreground"
            >
              {item.label}
            </Link>
          ))}
        </FooterColumn>
        <FooterColumn title="Contact" className="col-span-2 lg:col-span-1">
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
        <p>Fait avec ♥ à Dakar</p>
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
    <div className={cn("min-w-0 [overflow-wrap:anywhere]", className)}>
      <p className="caption-luxe mb-3 text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({
  to,
  children,
}: {
  to: (typeof footerPages)[number]["to"];
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
