"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Loader2, User, MapPin } from "lucide-react";
import type { RelanceItem } from "@/app/api/relance/route";

type RelanceData = {
  noResponse: RelanceItem[];
  noAppointment: RelanceItem[];
  unconfirmedRdv: RelanceItem[];
  estimationNotSigned: RelanceItem[];
};

const CATEGORIES: { key: keyof RelanceData; title: string; description: string }[] = [
  { key: "noResponse", title: "Sans réponse", description: "Lead récent, aucun message entrant" },
  { key: "noAppointment", title: "Sans RDV", description: "Qualifié ou en contact depuis plusieurs jours, pas de RDV pris" },
  { key: "unconfirmedRdv", title: "RDV non confirmé", description: "RDV programmé sans confirmation enregistrée" },
  { key: "estimationNotSigned", title: "Estimation non signée", description: "Estimation réalisée depuis plus de 7 jours, mandat non signé" },
];

const EMPTY_DATA: RelanceData = {
  noResponse: [],
  noAppointment: [],
  unconfirmedRdv: [],
  estimationNotSigned: [],
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function RelancePage() {
  const [data, setData] = useState<RelanceData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/relance")
      .then((r) => {
        if (!r.ok) {
          if (r.status === 401) setError("Non connecté.");
          else if (r.status === 503) setError("Service indisponible.");
          else setError("Erreur lors du chargement.");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        setData(d ?? EMPTY_DATA);
      })
      .catch(() => {
        setError("Impossible de charger les données.");
        setData(EMPTY_DATA);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleRelance = async (leadId: string) => {
    setSending(leadId);
    try {
      const res = await fetch("/api/relance/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });
      if (res.ok) {
        setData((prev) => {
          const remove = (arr: RelanceItem[]) => arr.filter((i) => i.leadId !== leadId);
          return {
            noResponse: remove(prev.noResponse),
            noAppointment: remove(prev.noAppointment),
            unconfirmedRdv: remove(prev.unconfirmedRdv),
            estimationNotSigned: remove(prev.estimationNotSigned),
          };
        });
      }
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Centre de Relance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Relancez les leads par catégorie. Un clic envoie SMS, email et WhatsApp (stub).
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-200">
          {error}
          <p className="mt-1 text-muted-foreground">Les catégories ci-dessous sont vides.</p>
        </div>
      ) : null}

      {!loading && (
        <div className="space-y-6">
          {CATEGORIES.map(({ key, title, description }) => {
            const items = data[key] ?? [];
            return (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun lead dans cette catégorie.</p>
                  ) : (
                    <ul className="space-y-3">
                      {items.map((item) => (
                        <li
                          key={item.leadId}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                        >
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <Link
                                href={`/leads/${item.leadId}`}
                                className="font-medium hover:underline truncate"
                              >
                                {item.firstName} {item.lastName}
                              </Link>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{item.propertyAddress}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Dernière action : {formatDate(item.lastActionAt)}
                              {item.heatScore != null && ` · Score chaleur : ${item.heatScore}`}
                            </p>
                            <p className="text-xs text-muted-foreground">{item.suggestedAction}</p>
                          </div>
                          <Button
                            size="sm"
                            className="gap-1.5 shrink-0"
                            onClick={() => handleRelance(item.leadId)}
                            disabled={sending === item.leadId}
                          >
                            {sending === item.leadId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                            Relancer maintenant
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
