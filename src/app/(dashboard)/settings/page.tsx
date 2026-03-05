"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MessageSquare,
  MessageCircle,
  Users,
  Check,
  Plus,
  Trash2,
  Mail,
  Shield,
  Palette,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

const MOCK_AGENCY = {
  name: "Agence Demo",
  logoUrl: "",
  primaryColor: "#0a0a0a",
  smsSenderName: "AgenceDemo",
  emailFrom: "contact@agence-demo.fr",
  calendlyEventType: "",
  calendlyOrgUri: "",
  defaultCommission: 8000,
};

const INITIAL_USERS = [
  { id: "u0", name: "Admin Demo", email: "demo@estimaflow.fr", role: "ADMIN" as const, phone: "06 00 00 00 00" },
  { id: "u1", name: "Marie Martin", email: "marie@agence-demo.fr", role: "NEGOTIATOR" as const, phone: "06 11 22 33 44" },
  { id: "u2", name: "Jean Negociateur", email: "jean@agence-demo.fr", role: "NEGOTIATOR" as const, phone: "06 55 66 77 88" },
];

type TabId = "agency" | "communication" | "users";

const TABS: { id: TabId; label: string; icon: typeof Building2 }[] = [
  { id: "agency", label: "Agence", icon: Building2 },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "users", label: "Utilisateurs", icon: Users },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("agency");
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", phone: "", role: "NEGOTIATOR" as "ADMIN" | "NEGOTIATOR" });
  const [agency, setAgency] = useState<typeof MOCK_AGENCY & { calendlyToken?: string | null; defaultCommission?: number | null }>(MOCK_AGENCY);
  const [calendlyUrl, setCalendlyUrl] = useState("");
  const [calendlyToken, setCalendlyToken] = useState("");
  const [defaultCommission, setDefaultCommission] = useState(String(MOCK_AGENCY.defaultCommission ?? ""));

  useEffect(() => {
    fetch("/api/agency")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) {
          setAgency((a) => ({ ...a, ...data, calendlyToken: data.calendlyToken }));
          setCalendlyUrl(data.calendlyEventType ?? "");
          setDefaultCommission(data.defaultCommission != null ? String(data.defaultCommission) : "");
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveAgency = async () => {
    const res = await fetch("/api/agency", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        calendlyEventType: calendlyUrl || null,
        defaultCommission: defaultCommission ? Number(defaultCommission) : null,
        ...(calendlyToken && calendlyToken !== "(défini)" ? { calendlyToken } : {}),
      }),
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email) return;
    setUsers((prev) => [
      ...prev,
      { id: `u${Date.now()}`, ...newUser },
    ]);
    setNewUser({ name: "", email: "", phone: "", role: "NEGOTIATOR" });
    setAddUserOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Parametres</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configuration de votre agence et de vos utilisateurs
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Agency tab */}
      {activeTab === "agency" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations de l&apos;agence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Nom de l&apos;agence</Label>
              <Input defaultValue={MOCK_AGENCY.name} placeholder="Nom de votre agence" />
            </div>
            <div className="space-y-2">
              <Label>Logo (URL)</Label>
              <Input defaultValue={MOCK_AGENCY.logoUrl} placeholder="https://votre-site.fr/logo.png" />
              <p className="text-xs text-muted-foreground">
                URL d&apos;une image PNG ou SVG. Affiche dans la sidebar et les emails.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Commission moyenne (€)</Label>
              <Input
                type="number"
                placeholder="8000"
                value={defaultCommission}
                onChange={(e) => setDefaultCommission(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Utilisée pour le calcul des revenus générés par l&apos;automatisation (dashboard).
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Palette className="h-3.5 w-3.5" />
                Couleur principale
              </Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  className="h-10 w-14 cursor-pointer p-1"
                  defaultValue={MOCK_AGENCY.primaryColor}
                />
                <Input
                  defaultValue={MOCK_AGENCY.primaryColor}
                  className="flex-1 font-mono text-sm"
                  placeholder="#000000"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Utilisee pour les boutons, liens et accents de l&apos;interface.
              </p>
            </div>
            <Separator />
            <Button onClick={handleSaveAgency} className="gap-2">
              {saved ? <Check className="h-4 w-4" /> : null}
              {saved ? "Enregistré !" : "Enregistrer les modifications"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Communication tab */}
      {activeTab === "communication" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Configuration SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nom d&apos;expediteur SMS</Label>
                <Input defaultValue={MOCK_AGENCY.smsSenderName} placeholder="AgenceDemo" />
                <p className="text-xs text-muted-foreground">
                  Le nom qui apparaitra comme expediteur des SMS (max 11 caracteres).
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100">
                    <MessageSquare className="h-4 w-4 text-violet-600" />
                  </div>
                  <div>
                    <p className="font-medium">Forfait SMS</p>
                    <p className="text-xs text-muted-foreground">127 / 500 SMS utilises ce mois</p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[25%] rounded-full bg-violet-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuration Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Adresse d&apos;envoi</Label>
                <Input defaultValue={MOCK_AGENCY.emailFrom} placeholder="noreply@agence.fr" type="email" />
                <p className="text-xs text-muted-foreground">
                  L&apos;adresse email utilisee pour envoyer les messages automatiques.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
                    <Mail className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium">Emails envoyes</p>
                    <p className="text-xs text-muted-foreground">89 emails envoyes ce mois &middot; 98% delivres</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
                Configuration WhatsApp
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Numéro WhatsApp Business</Label>
                <Input defaultValue="+33 6 00 00 00 00" placeholder="+33 6 XX XX XX XX" />
                <p className="text-xs text-muted-foreground">
                  Numéro connecté à l&apos;API WhatsApp Business pour l&apos;envoi automatique.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Token API WhatsApp</Label>
                <Input type="password" placeholder="Token WhatsApp Business API" />
                <p className="text-xs text-muted-foreground">
                  Token d&apos;accès Meta / WhatsApp Business API.
                </p>
              </div>
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Messages WhatsApp</p>
                    <p className="text-xs text-muted-foreground">234 messages envoyés ce mois &middot; 18 conversations actives</p>
                  </div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[47%] rounded-full bg-green-500" />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">234 / 500 messages (forfait mensuel)</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Calendly
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lien de prise de RDV (URL complète)</Label>
                <Input
                  placeholder="https://calendly.com/votre-agence/30min"
                  value={calendlyUrl}
                  onChange={(e) => setCalendlyUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Envoyé aux leads qualifiés (prospect chaud). Ex. https://calendly.com/votre-agence/estimation
                </p>
              </div>
              <div className="space-y-2">
                <Label>Token API (optionnel)</Label>
                <Input
                  type="password"
                  placeholder={agency.calendlyToken ? "••••••••" : "Token Calendly"}
                  value={calendlyToken === "(défini)" ? "" : calendlyToken}
                  onChange={(e) => setCalendlyToken(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Pour créer des liens personnalisés ou lister les types d&apos;événements.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveAgency} className="gap-2">
            {saved ? <Check className="h-4 w-4" /> : null}
            {saved ? "Enregistré !" : "Enregistrer les modifications"}
          </Button>
        </div>
      )}

      {/* Users tab */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Utilisateurs ({users.length})
              </CardTitle>
              <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un utilisateur</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom complet *</Label>
                      <Input
                        placeholder="Marie Martin"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="marie@agence.fr"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Telephone</Label>
                      <Input
                        placeholder="06 12 34 56 78"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(v) => setNewUser({ ...newUser, role: v as "ADMIN" | "NEGOTIATOR" })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ADMIN">Administrateur</SelectItem>
                          <SelectItem value="NEGOTIATOR">Negociateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddUser}
                      disabled={!newUser.name || !newUser.email}
                      className="w-full"
                    >
                      Ajouter l&apos;utilisateur
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className={cn(
                        "text-sm font-bold",
                        user.role === "ADMIN" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      )}>
                        {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{user.name}</p>
                        <Badge
                          variant={user.role === "ADMIN" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {user.role === "ADMIN" ? (
                            <span className="flex items-center gap-1">
                              <Shield className="h-3 w-3" /> Admin
                            </span>
                          ) : (
                            "Negociateur"
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.phone && (
                        <p className="text-xs text-muted-foreground">{user.phone}</p>
                      )}
                    </div>
                  </div>
                  {user.role !== "ADMIN" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
