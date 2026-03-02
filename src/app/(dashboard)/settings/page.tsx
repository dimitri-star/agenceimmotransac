"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const MOCK_AGENCY = {
  name: "Agence Demo",
  logoUrl: "",
  primaryColor: "#0a0a0a",
  smsSenderName: "AgenceDemo",
  emailFrom: "contact@agence-demo.fr",
};

const MOCK_USERS = [
  { id: "u0", name: "Admin Demo", email: "demo@estimaflow.fr", role: "ADMIN" as const },
  { id: "u1", name: "Marie Martin", email: "marie@agence-demo.fr", role: "NEGOTIATOR" as const },
  { id: "u2", name: "Jean Négociateur", email: "jean@agence-demo.fr", role: "NEGOTIATOR" as const },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Paramètres</h1>

      <Card>
        <CardHeader>
          <CardTitle>Agence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nom de l&apos;agence</Label>
            <Input defaultValue={MOCK_AGENCY.name} placeholder="Nom" />
          </div>
          <div className="space-y-2">
            <Label>Logo (URL)</Label>
            <Input defaultValue={MOCK_AGENCY.logoUrl} placeholder="https://..." />
          </div>
          <div className="space-y-2">
            <Label>Couleur principale</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                className="h-10 w-14 cursor-pointer p-1"
                defaultValue={MOCK_AGENCY.primaryColor}
              />
              <Input
                defaultValue={MOCK_AGENCY.primaryColor}
                className="flex-1 font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Communication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>SMS - Nom d&apos;expéditeur</Label>
            <Input defaultValue={MOCK_AGENCY.smsSenderName} placeholder="AgenceDemo" />
          </div>
          <div className="space-y-2">
            <Label>Email - Adresse d&apos;envoi</Label>
            <Input defaultValue={MOCK_AGENCY.emailFrom} placeholder="noreply@agence.fr" type="email" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gestion des accès (Phase 2 : ajout/suppression réelle).
          </p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {MOCK_USERS.map((user) => (
              <li
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role === "ADMIN" ? "Admin" : "Négociateur"}
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
