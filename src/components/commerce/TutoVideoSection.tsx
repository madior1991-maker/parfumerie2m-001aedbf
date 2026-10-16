import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";

const steps = [
  { title: "Choisis ton pack", text: "Haqqi 10 000 F, SCENTLAB 15 000 F ou Poche 10 000 F." },
  { title: "Coche tes parfums", text: "3 pour Haqqi et SCENTLAB, 5 pour les parfums de poche." },
  { title: "Envoie sur WhatsApp", text: "Ta sélection part toute seule dans le message." },
  { title: "On te livre", text: "Réponse en moins d’1h, livraison partout au Sénégal." },
];

export function TutoVideoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !video.muted;
    video.muted = next;
    if (!next) {
      video.currentTime = 0;
      void video.play().catch(() => undefined);
    }
    setMuted(next);
  };

  return (
    <section aria-labelledby="tuto-pack-title" className="border-b border-border bg-surface py-12 md:py-16">
      <div className="section-shell grid items-center gap-8 md:grid-cols-[340px_1fr] md:gap-14">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-[28px] border border-border bg-footer shadow-glow md:mx-0">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/videos/tuto-packs.mp4"
            poster="/videos/tuto-packs-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Tutoriel : comment commander un pack sur 2mparfumeriedk.com"
          />
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={!muted}
            className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/60 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur"
          >
            {muted ? <VolumeX className="size-4" aria-hidden="true" /> : <Volume2 className="size-4" aria-hidden="true" />}
            {muted ? "Activer le son" : "Couper le son"}
          </button>
        </div>

        <div className="min-w-0">
          <p className="caption-luxe text-accent">Tuto en vidéo</p>
          <h2 id="tuto-pack-title" className="mt-2 font-display text-[32px] font-semibold leading-[1.08] text-foreground md:text-[46px]">
            Commande ton pack en 40 secondes
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Pack Haqqi, pack SCENTLAB ou pack de 5 parfums de poche : c’est le même chemin, et on livre partout au Sénégal.
          </p>
          <ol className="mt-6 grid gap-3">
            {steps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[34px_1fr] items-start gap-3">
                <span className="grid size-[34px] place-items-center rounded-full bg-accent text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-foreground">{step.title}</p>
                  <p className="text-sm text-muted-foreground">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <Button asChild variant="whatsapp" size="lg" className="mt-6">
            <a href="#pack">
              <WhatsAppLogo tone="light" className="size-5" /> Composer mon pack
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
