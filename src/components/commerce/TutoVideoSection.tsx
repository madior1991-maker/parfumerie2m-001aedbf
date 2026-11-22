import { useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WhatsAppLogo } from "@/components/commerce/WhatsAppLogo";

const steps = [
  { title: "Choisis ton pack", text: "Cadeau fin d’année 35 000 F, Haqqi 10 000 F, SCENTLAB 15 000 F ou Poche 10 000 F." },
  { title: "Coche tes parfums", text: "4 pour le Pack cadeau (un par étape), 3 pour Haqqi et SCENTLAB, 5 pour la poche." },
  { title: "Envoie sur WhatsApp", text: "Le bouton s’allume quand ton pack est complet. Ta sélection part toute seule." },
  { title: "On te livre", text: "Réponse en moins d’1h, livraison partout au Sénégal." },
];

const videos = [
  { key: "cadeau", label: "Cadeau", src: "/videos/tuto-packs.mp4?v=2", poster: "/videos/tuto-packs-poster.jpg?v=2" },
  { key: "haqqi", label: "Haqqi", src: "/videos/tuto-pack-haqqi.mp4", poster: "/videos/tuto-pack-haqqi-poster.jpg" },
  { key: "scentlab", label: "SCENTLAB", src: "/videos/tuto-pack-scentlab.mp4", poster: "/videos/tuto-pack-scentlab-poster.jpg" },
] as const;

export function TutoVideoSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const video = videos[current];

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
        <div className="mx-auto w-full max-w-[340px] md:mx-0">
        <div role="tablist" aria-label="Choisis le tuto" className="mb-3 grid grid-cols-3 gap-1 rounded-full border border-border bg-background p-1">
          {videos.map((item, index) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={index === current}
              onClick={() => { setCurrent(index); setMuted(true); }}
              className={`rounded-full px-3 py-2 text-[14px] font-semibold transition-colors ${index === current ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[340px] overflow-hidden rounded-[28px] border border-border bg-footer shadow-glow md:mx-0">
          <video
            key={video.key}
            ref={videoRef}
            className="h-full w-full object-cover"
            src={video.src}
            poster={video.poster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label={`Tutoriel : comment commander le pack ${video.label} sur 2mparfumeriedk.com`}
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
        </div>

        <div className="min-w-0">
          <p className="caption-luxe text-accent">Tuto en vidéo</p>
          <h2 id="tuto-pack-title" className="mt-2 font-display text-[32px] font-semibold leading-[1.08] text-foreground md:text-[46px]">
            Commande ton pack en 40 secondes
          </h2>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Pack cadeau fin d’année, Haqqi, SCENTLAB ou parfums de poche : c’est le même chemin, et on livre partout au Sénégal.
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
