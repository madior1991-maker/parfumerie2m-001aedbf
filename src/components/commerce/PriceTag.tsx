import { compareAtPrice, formatPrice } from "@/lib/catalog-data";

// Prix d'un parfum, avec l'ancien prix barré quand il y a une remise.
// Les deux prix passent sur deux lignes si la carte est trop étroite.
export function PriceTag({ product }: { product: { collection: string; price: number } }) {
  const old = compareAtPrice(product);
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2">
      {old ? (
        <s className="whitespace-nowrap text-[0.8em] font-medium text-muted-foreground">{formatPrice(old)}</s>
      ) : null}
      <span className="whitespace-nowrap">{formatPrice(product.price)}</span>
    </span>
  );
}
