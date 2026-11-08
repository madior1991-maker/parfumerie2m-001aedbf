import { AddToCartButton } from "@/components/commerce/AddToCartButton";
import { optimizedProductImageSet, optimizedProductImageUrl } from "@/lib/catalog-data";
import { productPriceValue, type Product } from "@/lib/perfume-data";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <article
      className="fade-up group overflow-hidden rounded-lg border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:shadow-glow"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="image-zoom aspect-square overflow-hidden bg-surface-alt">
        {(() => {
          const sources = optimizedProductImageSet(product.image);
          const fallback = optimizedProductImageUrl(product.image, 800);
          return (
            <picture className="block h-full w-full">
              <source type="image/avif" srcSet={sources.avif} sizes="(min-width: 1024px) 25vw, 50vw" />
              <source type="image/webp" srcSet={sources.webp} sizes="(min-width: 1024px) 25vw, 50vw" />
              <img
                src={fallback}
                alt={`${product.name} édition ${product.edition}`}
                className="h-full w-full object-cover"
                loading="lazy"
                width={800}
                height={800}
                decoding="async"
              />
            </picture>
          );
        })()}
      </div>
      <div className="space-y-5 p-5">
        <div>
          <p className="caption-luxe text-accent">
            {product.edition} · {product.family}
          </p>
          <h3 className="mt-2 text-[26px] leading-tight text-foreground">{product.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{product.mood}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.notes.map((note) => (
            <span
              key={note}
              className="rounded-full border border-accent bg-accent-muted/40 px-3 py-1 text-xs text-accent font-medium"
            >
              {note}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="font-body text-2xl font-bold text-accent">{product.price}</p>
        </div>
        <AddToCartButton
          item={{
            id: product.id,
            name: product.name,
            collection: product.edition,
            price: productPriceValue(product.price),
            imageUrl: optimizedProductImageUrl(product.image, 800),
          }}
        />
      </div>
    </article>
  );
}
