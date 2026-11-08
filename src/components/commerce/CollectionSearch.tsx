import { Search, X } from "lucide-react";

// Recherche sans tenir compte des majuscules ni des accents : « eau » trouve « Éau », « oud » trouve « OUD ».
export function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

type Searchable = {
  name?: string;
  ref?: string;
  inspiration?: string;
  notes?: string;
  headNotes?: string;
  heartNotes?: string;
  baseNotes?: string;
  family?: string;
};

export function matchesSearch(product: Searchable, query: string) {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = normalizeSearch(
    [
      product.name,
      product.ref,
      product.inspiration,
      product.notes,
      product.headNotes,
      product.heartNotes,
      product.baseNotes,
      product.family,
    ]
      .filter(Boolean)
      .join(" "),
  );
  return words.every((word) => haystack.includes(word));
}

export function CollectionSearch({
  value,
  onChange,
  placeholder = "Rechercher un parfum…",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative mx-auto max-w-xl ${className}`}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        inputMode="search"
        enterKeyHint="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Rechercher un parfum dans la collection"
        className="w-full appearance-none rounded-full border border-border bg-surface py-3 pl-11 pr-11 text-base text-foreground shadow-card placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 md:text-sm [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Effacer la recherche"
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-accent-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
