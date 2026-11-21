export const whatsappNumber = "221761923441";
export const displayPhone = "+221 76 192 34 41";
export const secondPhone = "+221 78 144 17 66";
export const instagram = "@2mparfumeriesn";
export const tiktok = "@2mparfumerie";
export const tiktokUrl = "https://www.tiktok.com/@2mparfumerie";
export const email = "2mparfumerie2025@gmail.com";

export type Product = {
  id: string;
  name: string;
  edition: string;
  family: string;
  mood: string;
  price: string;
  image: string;
  notes: string[];
  description: string;
};

export const products: Product[] = [];

export function whatsappUrl(message = "Bonjour 2M Parfumerie, je souhaite commander un parfum.") {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

export function productWhatsappUrl(product: Product) {
  return whatsappUrl(
    `Bonjour 2M Parfumerie 👋 Je souhaite commander *${product.name}* — ${product.price.replace(/f$/i, "")} FCFA. Est-il disponible ?`,
  );
}

export function productPriceValue(price: string) {
  return Number(price.replace(/[^0-9]/g, "")) || 0;
}
