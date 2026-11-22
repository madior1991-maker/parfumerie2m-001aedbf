import { Link, useLocation } from "@tanstack/react-router";
import { Copy, Gift, X } from "lucide-react";
import { useEffect, useState } from "react";

import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";

// Fenêtre « Pack cadeau fin d'année » : s'ouvre une fois par jour, quelques secondes après l'arrivée.
const PACK_URL = "https://www.2mparfumeriedk.com/nos-packs?pack=fin-annee";
const SHARE_TEXT = `🎁 Pack cadeau fin d'année chez 2M Parfumerie : 1 Takeoff + 1 SCENTLAB + 1 Haqqi + 1 parfum de chambre au choix, et un parfum de poche offert. 35 000 F au lieu de 42 000 F 👉 ${PACK_URL}`;
const STORAGE_KEY = "2m-pack-cadeau-vu";
const IMG = "/images/optimized/pack-cadeau-fin-annee-w800.webp";

type Variant = "fenetre" | "bandeau" | "bulle";

export function GiftPackPopup() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  // Aperçu des propositions : ?apercu-popup=fenetre | bandeau | bulle
  const preview = new URLSearchParams(location.searchStr).get("apercu-popup") as Variant | null;
  const variant: Variant = preview ?? "fenetre";
  const onPackPage = location.pathname === "/nos-packs" && location.searchStr.includes("fin-annee");

  useEffect(() => {
    if (preview) {
      setOpen(true);
      return;
    }
    if (onPackPage) return;
    let seen = "";
    try {
      seen = localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
      /* stockage indisponible */
    }
    if (seen === new Date().toDateString()) return;
    const timer = window.setTimeout(() => setOpen(true), 5000);
    return () => window.clearTimeout(timer);
  }, [onPackPage, preview]);

  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    } catch {
      /* stockage indisponible */
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open || (onPackPage && !preview)) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(PACK_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* copie refusée */
    }
  };

  const share = (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[13px] font-bold text-white"
      >
        <WhatsAppLogo tone="light" className="size-4" /> Partager
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(PACK_URL)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-full bg-[#1877F2] px-3 py-1.5 text-[13px] font-bold text-white"
      >
        Facebook
      </a>
      <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-full border border-[#D4B26A] px-3 py-1.5 text-[13px] font-bold text-[#F7F1E4]">
        <Copy className="size-3.5" aria-hidden="true" /> {copied ? "Lien copié" : "Copier le lien"}
      </button>
    </div>
  );

  const cta = (
    <Link
      to="/nos-packs"
      search={{ pack: "fin-annee" }}
      onClick={close}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#D4B26A] px-6 py-3 text-[15px] font-extrabold text-[#0A2E22] shadow-lg"
    >
      <Gift className="size-5" aria-hidden="true" /> Composer mon pack cadeau
    </Link>
  );

  const price = (
    <p className="flex flex-wrap items-baseline gap-2">
      <span className="rounded-lg bg-[#D4B26A] px-3 py-0.5 text-2xl font-extrabold text-[#0A2E22]">35 000 F</span>
      <span className="text-[15px] text-[#E9DFC9]">
        au lieu de <s>42 000 F</s>
      </span>
    </p>
  );

  const closeBtn = (
    <button type="button" onClick={close} aria-label="Fermer" className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/40 text-white">
      <X className="size-5" aria-hidden="true" />
    </button>
  );

  if (variant === "bulle") {
    return (
      <div className="gift-pop fixed bottom-24 left-3 z-[60] w-[290px] overflow-hidden rounded-2xl border-2 border-[#D4B26A] bg-[#0E3B2C] text-[#F7F1E4] shadow-2xl" role="dialog" aria-label="Pack cadeau fin d'année">
        {closeBtn}
        <div className="flex gap-3 p-3">
          <img src={IMG} alt="" width={96} height={96} className="size-24 shrink-0 rounded-xl object-cover" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#D4B26A]">Offre de fin d'année</p>
            <p className="font-display text-xl font-semibold leading-tight !text-[#F7F1E4]">Pack cadeau</p>
            <p className="mt-1 text-[13px]">
              <b className="text-[#D4B26A]">35 000 F</b> au lieu de <s>42 000 F</s>
            </p>
          </div>
        </div>
        <Link to="/nos-packs" search={{ pack: "fin-annee" }} onClick={close} className="block bg-[#D4B26A] py-2.5 text-center text-sm font-extrabold text-[#0A2E22]">
          Voir le pack →
        </Link>
      </div>
    );
  }

  if (variant === "bandeau") {
    return (
      <div className="gift-pop fixed inset-x-0 bottom-0 z-[60] rounded-t-3xl border-t-4 border-[#D4B26A] bg-[#0E3B2C] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 text-[#F7F1E4] shadow-2xl" role="dialog" aria-label="Pack cadeau fin d'année">
        {closeBtn}
        <div className="mx-auto flex max-w-3xl flex-col gap-3 md:flex-row md:items-center md:gap-6">
          <img src="/images/optimized/pack-cadeau-fin-annee-wide-w800.webp" alt="" width={800} height={333} className="w-full rounded-xl md:w-80" />
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#D4B26A]">Offre de fin d'année</p>
            <p className="font-display text-2xl font-semibold leading-tight !text-[#F7F1E4]">Pack cadeau fin d'année</p>
            {price}
            {cta}
            {share}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Pack cadeau fin d'année" onClick={close}>
      <div className="gift-pop relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-[#D4B26A] bg-[#0E3B2C] text-[#F7F1E4] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {closeBtn}
        <img src={IMG} alt="Takeoff, SCENTLAB, Haqqi, parfum de chambre et parfum de poche offert" width={800} height={800} className="aspect-[4/3] w-full object-cover" />
        <div className="flex flex-col gap-3 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4B26A]">🎁 Offre de fin d'année</p>
          <p className="font-display text-3xl font-semibold leading-tight !text-[#F7F1E4]">Pack cadeau fin d'année</p>
          <p className="text-[15px] text-[#E9DFC9]">1 Takeoff + 1 SCENTLAB + 1 Haqqi + 1 parfum de chambre au choix. On ajoute un parfum de poche offert.</p>
          {price}
          {cta}
          <div className="border-t border-white/15 pt-3">
            <p className="mb-2 text-[13px] text-[#E9DFC9]">Fais-le connaître à tes proches :</p>
            {share}
          </div>
        </div>
      </div>
    </div>
  );
}
