// Après une mise en ligne, les fichiers de l'ancienne version n'existent plus.
// Un visiteur qui avait déjà le site ouvert ne peut plus charger la page suivante :
// on recharge alors le site une fois, pour qu'il prenne la nouvelle version.
const KEY = "2m-reload-after-update";

export function isOutdatedBuildError(error: unknown) {
  const message = String((error as { message?: string })?.message ?? error ?? "");
  return /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Failed to fetch|MIME type|Unable to preload CSS|ChunkLoadError|Loading chunk/i.test(
    message,
  );
}

// Recharge au plus une fois par minute, pour ne jamais boucler.
export function reloadForUpdate() {
  try {
    const last = Number(sessionStorage.getItem(KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // sans stockage, on recharge quand même une fois
  }
  window.location.reload();
  return true;
}

export function listenForOutdatedBuild() {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadForUpdate();
  });
}
