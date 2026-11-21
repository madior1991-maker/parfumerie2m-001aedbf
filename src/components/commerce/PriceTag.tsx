import { compareAtPrice, formatPrice } from "@/lib/catalog-data";

// Prix d'un parfum, avec l'ancien prix barré quand il y a une remise.
export function PriceTag({ product }: { product: { collection: string; price: number } }) {
  const old = compareAtPrice(product);
  return (
    <>
      {old ? (
        <s className="mr-2 whitespace-nowrap text-[0.8em] font-medium text-muted-foreground">{formatPrice(old)}</s>
      ) : null}
      <span className="whitespace-nowrap">{formatPrice(product.price)}</span>
    </>
  );
}
