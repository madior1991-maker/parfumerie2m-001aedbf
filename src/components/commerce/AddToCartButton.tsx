import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/hooks/useCart";
import { track } from "@/lib/analytics";

export function AddToCartButton({ item }: { item: Omit<CartItem, "quantity"> }) {
  const { addItem } = useCart();

  return (
    <Button
      type="button"
      onClick={() => {
        addItem(item);
        track("add_to_cart", {
          currency: "XOF",
          value: item.price,
          items: [
            {
              item_id: item.id,
              item_name: item.name,
              item_category: item.collection,
              price: item.price,
              quantity: 1,
            },
          ],
        });
        toast(`✓ ${item.name} ajouté au panier`, { duration: 3000 });
      }}
      aria-label={`Ajouter ${item.name} au panier`}
      className="@container h-auto min-h-11 w-full whitespace-nowrap rounded-full bg-accent px-3 py-2.5 text-center text-[11px] leading-tight text-primary-foreground hover:bg-accent-hover sm:px-4 sm:py-3 sm:text-xs"
    >
      <ShoppingBag className="size-4 shrink-0" aria-hidden="true" />
      <span className="hidden @[12.5rem]:inline">Ajouter au panier</span>
      <span className="@[12.5rem]:hidden">Ajouter</span>
    </Button>
  );
}
