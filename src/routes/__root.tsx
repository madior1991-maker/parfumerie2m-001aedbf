import { useEffect } from "react";
import { HeadContent, Outlet, Link, createRootRoute, useRouterState } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/sonner";
import { trackContactClicks } from "@/lib/analytics";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page introuvable</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cette page n'existe pas ou a été déplacée. Nos parfums vous attendent dans la boutique.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
    ],
  }),
});

// Retire la description par défaut de index.html quand la page a la sienne,
// pour que Google ne voie qu'une seule description.
function useSingleDescription() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    const own = document.querySelectorAll('meta[name="description"]:not([data-static])');
    if (own.length) {
      document.querySelectorAll('meta[name="description"][data-static]').forEach((el) => el.remove());
    }
  }, [pathname]);
}

function RootComponent() {
  useSingleDescription();
  useEffect(() => trackContactClicks(), []);
  return (
    <>
      <HeadContent />
      <Outlet />
      <Toaster position="top-right" richColors={false} closeButton />
    </>
  );
}
