// Envoi d'événements à Google Analytics 4 (balise G-RNH2WE1NP3 dans index.html).
// Sans effet si la balise n'est pas chargée (bloqueur de pub, aperçu…).
type GtagParams = Record<string, string | number | boolean | undefined | object>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: GtagParams) => void;
  }
}

export function track(name: string, params: GtagParams = {}) {
  try {
    window.gtag?.("event", name, { page_path: window.location.pathname, ...params });
  } catch {
    // ne jamais bloquer une commande à cause du suivi
  }
}

// Un seul écouteur pour tous les liens WhatsApp et téléphone du site.
export function trackContactClicks() {
  const onClick = (event: MouseEvent) => {
    const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
    if (!link) return;
    const href = link.getAttribute("href") ?? "";
    const label = (link.getAttribute("aria-label") || link.textContent || "").trim().slice(0, 60);
    if (href.includes("wa.me/") || href.includes("api.whatsapp.com")) {
      track("whatsapp_click", { link_text: label });
    } else if (href.startsWith("tel:")) {
      track("call_click", { link_text: label });
    }
  };
  document.addEventListener("click", onClick, { capture: true });
  return () => document.removeEventListener("click", onClick, { capture: true });
}
