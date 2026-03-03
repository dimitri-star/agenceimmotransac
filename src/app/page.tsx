"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target, Star, Check } from "lucide-react";

const FEATURES = [
  "Réponse auto en moins de 2 min",
  "Séquences de relance personnalisées",
  "Dashboard & pipeline en temps réel",
];

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center transition-transform hover:-translate-y-0.5 cursor-default">
      <span className="text-lg font-bold text-foreground sm:text-xl">{value}</span>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Fond dégradé léger (style capture) */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, oklch(0.97 0.01 85) 0%, oklch(1 0 0) 50%, oklch(0.98 0.005 200) 100%)",
        }}
      />

      {/* Header */}
      <header className="flex items-center justify-between border-b border-border/50 bg-background/70 px-6 py-4 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-primary-foreground">
            EF
          </div>
          <span className="text-xl font-semibold text-foreground">EstimaFlow</span>
        </div>
      </header>

      {/* Hero deux colonnes */}
      <main className="mx-auto max-w-7xl px-4 pt-12 pb-16 sm:px-6 md:pt-20 md:pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Colonne gauche */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 pt-4 text-left">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-2">
                Solution professionnelle
                <Star className="h-3.5 w-3.5 text-primary fill-primary" />
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.05]">
              Plus d&apos;estimations
              <br />
              <span
                className="bg-gradient-to-br from-primary via-primary to-primary/80 bg-clip-text text-transparent"
                style={{
                  maskImage: "linear-gradient(180deg, black 0%, black 85%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(180deg, black 0%, black 85%, transparent 100%)",
                }}
              >
                qui finissent en mandat
              </span>
            </h1>

            <p className="max-w-xl text-lg text-muted-foreground leading-relaxed">
              Une application qui combine réactivité et suivi structuré, pour transformer chaque
              demande d&apos;estimation en mandat signé, sans perdre de leads.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="gap-2 rounded-full px-8 text-base w-full sm:w-auto" asChild>
                <Link href="/dashboard">
                  Découvrir l&apos;application
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Colonne droite : cartes */}
          <div className="lg:col-span-5 space-y-6 lg:pt-8">
            {/* Carte Stats */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/95 p-6 shadow-xl sm:p-8">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 ring-1 ring-primary/20">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                      200+
                    </div>
                    <div className="text-sm text-muted-foreground">Leads gérés par mois</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Temps de réponse</span>
                    <span className="font-medium text-foreground">&lt; 2 min</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                      style={{ width: "95%" }}
                    />
                  </div>
                </div>

                <div className="h-px w-full bg-border mb-6" />

                <div className="grid grid-cols-3 gap-4 text-center">
                  <StatItem value="23" label="Leads" />
                  <div className="w-px self-stretch bg-border mx-auto min-h-[40px]" />
                  <StatItem value="8" label="RDV" />
                  <div className="w-px self-stretch bg-border mx-auto min-h-[40px]" />
                  <StatItem value="34%" label="Conversion" />
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[10px] font-medium tracking-wide text-foreground">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Actif
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-[10px] font-medium tracking-wide text-foreground">
                    <Star className="h-3 w-3 text-primary fill-primary" />
                    Personnalisé
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Fonctionnalités */}
            <div className="relative overflow-hidden rounded-3xl border border-border bg-card/95 p-6 shadow-xl sm:p-8">
              <h3 className="mb-5 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Fonctionnalités principales
              </h3>
              <ul className="space-y-4">
                {FEATURES.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
