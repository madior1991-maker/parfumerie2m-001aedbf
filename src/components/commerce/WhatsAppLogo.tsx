import whatsappLogo from "@/assets/whatsapp-logo.svg";

import { cn } from "@/lib/utils";

export function WhatsAppLogo({
  className,
  tone = "brand",
  size = 14,
}: {
  className?: string;
  tone?: "brand" | "light";
  size?: number;
}) {
  return (
    <img
      src={whatsappLogo}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn(
        "block shrink-0 object-contain",
        tone === "light" && "rounded-full bg-primary-foreground p-0.5",
        className,
      )}
    />
  );
}
