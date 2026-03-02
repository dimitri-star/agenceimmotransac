# PRD — EstimaFlow
## Application de conversion Estimation → Mandat pour agences immobilières

**Version** : 1.0 — MVP
**Date** : 2 mars 2026
**Auteur** : Adimi Flow
**Statut** : Draft — En attente validation

---

## 1. Executive Summary

EstimaFlow est une application web légère qui intercepte chaque demande d'estimation immobilière, déclenche automatiquement une réponse rapide, qualifie le lead, et pilote une séquence de relance structurée jusqu'à la signature du mandat.

**Ce que ce n'est PAS** : un CRM, un outil de gestion d'agence, une plateforme de diffusion d'annonces.

**Ce que c'est** : un moteur de conversion estimation → mandat, avec dashboard de performance.

---

## 2. Problème

| Symptôme | Impact | Coût estimé |
|----------|--------|-------------|
| Temps de réponse > 30 min après demande d'estimation | Lead capté par un concurrent | 1 mandat perdu = 3 000€ à 8 000€ d'honoraires |
| Aucune séquence de relance structurée | 60-70% des leads tièdes jamais recontactés | Budget pub gaspillé |
| No-show aux RDV d'estimation | Temps perdu du négociateur (1h à 2h) | Coût d'opportunité |
| Estimation faite mais pas de suivi → pas de mandat | Taux conversion estimation→mandat sous-optimal | Chiffre d'affaires perdu |
| Aucune visibilité sur la performance du funnel | Décisions au doigt mouillé | Investissements mal alloués |

**Insight clé** : La fenêtre critique pour répondre à une demande d'estimation est de 5 minutes. Au-delà, le taux de contact chute de 80%.

---

## 3. Cible utilisateur

### Buyer persona prioritaire (MVP)
**Directeur d'agence indépendante** — 2 à 8 négociateurs
- Décideur unique (pas de validation corporate)
- Budget outils : 200-500€/mois
- Pain principal : "Je paie de la pub mais mes négociateurs ne relancent pas"
- Familiarité tech : moyenne (utilise un CRM basique, SeLoger, LeBonCoin)

### Utilisateurs quotidiens
- **Directeur** : consulte le dashboard, paramètre les séquences
- **Négociateur** : reçoit les leads qualifiés, confirme les RDV, met à jour les statuts

### Personas V2 (hors MVP)
- Responsable de réseau/franchise (multi-agences)
- Mandataire indépendant

---

## 4. Proposition de valeur

> "Chaque demande d'estimation reçoit une réponse en moins de 2 minutes, une séquence de relance adaptée, et un suivi jusqu'au mandat signé."

**Métriques de valeur :**
- Temps de première réponse : de >30 min à <2 min
- Taux de contact effectif : de ~30% à >70%
- Taux estimation→mandat : +15% à +25% (à valider sur pilote)
- Réduction no-show : -40% (à valider sur pilote)

---

## 5. Périmètre MVP — Ce qui entre vs ce qui sort

### DANS le MVP (Must Have)

#### 5.1 Ingestion de leads multi-canal
- **Saisie manuelle** : formulaire rapide (nom, téléphone, email, adresse du bien, source)
- **Webhook générique** : endpoint REST pour recevoir les leads depuis formulaires web (Typeform, site agence, etc.)
- **Transfert email** : adresse email dédiée par agence (leads@agence-estima.flow) — parsing automatique des emails de notification portails
- Déduplication par téléphone + email

#### 5.2 Réponse automatique instantanée
- **SMS** via API (Twilio ou OVH SMS) : message personnalisé envoyé <2 min après réception
- **Email** : email de confirmation avec branding agence
- Templates personnalisables par agence
- Variables dynamiques : {prénom}, {adresse_bien}, {nom_agence}, {nom_négociateur}

#### 5.3 Pipeline visuel (Kanban simplifié)
6 colonnes fixes :
1. **Nouveau** — Lead vient d'arriver, réponse auto envoyée
2. **En contact** — Échange en cours (appel, SMS, email)
3. **RDV programmé** — Créneau confirmé
4. **Estimation faite** — Visite réalisée, estimation remise
5. **Mandat signé** — Conversion réussie
6. **Perdu** — Lead abandonné (avec motif obligatoire)

Chaque carte affiche : nom, adresse bien, source, dernière action, prochaine relance, négociateur assigné.

#### 5.4 Séquences de relance automatiques
Moteur de séquences simple :
- Séquence "Nouveau lead" : J+0 (SMS auto), J+1 (relance SMS), J+3 (email), J+7 (SMS final)
- Séquence "Post-estimation sans mandat" : J+1 (email remerciement), J+5 (SMS relance), J+15 (email relance), J+30 (dernier SMS)
- Séquence "No-show" : H+1 (SMS), J+1 (appel planifié), J+3 (email)
- Chaque étape peut être : SMS, Email, ou Tâche manuelle (rappel au négociateur)
- Pause automatique si le lead répond ou change de statut

#### 5.5 Dashboard exécutif
Vue unique avec :
- **KPIs en haut** : Leads ce mois / RDV programmés / Mandats signés / Taux conversion
- **Graphique** : Funnel estimation→mandat (barres horizontales)
- **Liste d'actions urgentes** : Leads à relancer aujourd'hui, RDV sans confirmation, Estimations non transformées >7j
- **Filtre par** : période, négociateur, source du lead

#### 5.6 Gestion basique des utilisateurs
- Directeur (admin) : accès complet, paramétrage, dashboard
- Négociateur : voit ses leads, met à jour les statuts, pas d'accès au paramétrage
- Auth simple : email + mot de passe (pas d'OAuth pour le MVP)

### HORS du MVP (V2+)

| Feature | Raison d'exclusion | Version cible |
|---------|-------------------|---------------|
| WhatsApp Business API | Complexité d'approbation Meta, templates, opt-in | V2 |
| Intégration CRM bidirectionnelle | Trop d'hétérogénéité entre CRM, coûteux à maintenir | V2 |
| Prise de RDV en ligne (calendrier public) | Nice to have, pas critique pour prouver la valeur | V2 |
| Chatbot de qualification | Complexité IA, pas nécessaire pour MVP | V3 |
| Multi-agences (vue réseau) | Commencer par mono-agence | V2 |
| Scoring automatique des leads | Pas assez de data au départ | V3 |
| App mobile native | PWA responsive suffisante | V3 |
| Rapports PDF exportables | Dashboard web suffit | V2 |
| Intégration portails en direct (API SeLoger) | APIs non publiques ou payantes | V3 |

---

## 6. User Flows principaux

### Flow 1 : Nouveau lead arrive
```
Lead remplit formulaire / email portail arrive
        ↓
[Ingestion] Lead créé dans EstimaFlow (statut: Nouveau)
        ↓
[Auto] SMS envoyé en <2 min : "Bonjour {prénom}, merci pour votre demande d'estimation pour {adresse}. {nom_négociateur} vous contacte très vite."
        ↓
[Auto] Email de confirmation envoyé
        ↓
[Auto] Notification push/email au négociateur assigné
        ↓
[Négociateur] Appelle le lead, passe le statut → "En contact"
        ↓
Séquence "Nouveau lead" se met en pause
```

### Flow 2 : Relance automatique
```
Lead en statut "Nouveau" depuis 24h, pas de changement
        ↓
[Auto] Séquence J+1 : SMS "Bonjour {prénom}, avez-vous des questions sur l'estimation de votre bien ?"
        ↓
Lead toujours "Nouveau" à J+3
        ↓
[Auto] Email avec contenu de valeur (guide estimation, tendances marché local)
        ↓
Lead toujours "Nouveau" à J+7
        ↓
[Auto] SMS final + création tâche manuelle pour le négociateur
        ↓
Si pas de réponse → statut "Perdu" (motif: "Injoignable")
```

### Flow 3 : Post-estimation sans mandat
```
Négociateur passe le lead en "Estimation faite"
        ↓
[Auto] J+1 : Email "Merci de nous avoir reçu, voici le récap de l'estimation"
        ↓
[Auto] J+5 : SMS "Avez-vous réfléchi ? Nous restons disponibles"
        ↓
[Auto] J+15 : Email avec argument marché
        ↓
[Auto] J+30 : Dernier SMS
        ↓
Alerte dashboard si >30j sans mandat
```

---

## 7. Architecture technique recommandée

### Principes directeurs
1. **Duplicabilité** : une instance par agence, déployée via script/template
2. **Simplicité** : stack mainstream, pas d'over-engineering
3. **Front-first** : UI démontrable avant backend complet
4. **Coût minimal** : services gratuits ou peu coûteux en tier gratuit

### Stack recommandée

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  Next.js 14+ (App Router)                       │
│  React + TypeScript                              │
│  Tailwind CSS + shadcn/ui                        │
│  État : Zustand ou React Query                   │
└──────────────────────┬──────────────────────────┘
                       │ API Routes / Server Actions
┌──────────────────────▼──────────────────────────┐
│                   BACKEND                        │
│  Next.js API Routes (monolithe simple)           │
│  Prisma ORM                                      │
│  Auth : NextAuth.js (credentials provider)       │
└──────────┬───────────┬───────────┬──────────────┘
           │           │           │
    ┌──────▼──┐  ┌─────▼────┐ ┌───▼──────────┐
    │ Postgres │  │ Resend   │ │ Twilio       │
    │ (Supabase│  │ (Email)  │ │ (SMS)        │
    │  ou Neon)│  │          │ │              │
    └─────────┘  └──────────┘ └──────────────┘
           │
    ┌──────▼──────────┐
    │ Cron/Queue      │
    │ (Vercel Cron    │
    │  ou Inngest)    │
    └─────────────────┘
```

### Justification des choix

| Choix | Justification | Alternative écartée |
|-------|---------------|-------------------|
| **Next.js** | Full-stack en un seul projet, déploiement Vercel simple, SSR pour dashboard | Nuxt (moins de maturité écosystème), SvelteKit (moins de devs disponibles) |
| **TypeScript** | Sécurité du code, autocomplétion, maintenabilité | JavaScript pur — trop risqué à l'échelle |
| **Tailwind + shadcn/ui** | UI pro rapidement, composants copiés (pas de dépendance), thémable | Material UI (trop lourd), Chakra (moins flexible) |
| **Prisma** | ORM type-safe, migrations simples, compatible tout SQL | Drizzle (plus léger mais moins mature), TypeORM (moins ergonomique) |
| **Supabase/Neon (Postgres)** | Tier gratuit généreux, Postgres standard, scalable | SQLite (pas adapté multi-user), MongoDB (overkill) |
| **Resend** | API email moderne, 100 emails/jour gratuits, bon DX | SendGrid (plus complexe), Mailgun (pricing moins clair) |
| **Twilio** | Leader SMS, API fiable, pricing transparent | OVH SMS (moins d'API), Vonage (moins de docs) |
| **Inngest** | Background jobs type-safe, retry automatique, monitoring | Bull/BullMQ (nécessite Redis), Vercel Cron (limité) |

### Stratégie de duplicabilité

```
Option A — Multi-tenant (Recommandé pour V2+)
  → Une seule instance, données séparées par tenant_id
  → Plus économique à l'échelle
  → Plus complexe au départ

Option B — Instance par agence (Recommandé pour MVP)
  → Script de déploiement Vercel + provisioning DB
  → Isolation totale des données (argument commercial RGPD)
  → Simple mais coûteux à >20 agences
  → Migration vers multi-tenant possible plus tard
```

**Recommandation MVP** : Option B (instance par agence). Chaque agence a son URL (agence-dupont.estimaflow.fr), sa propre DB, son propre déploiement. Un script de setup automatise la création. À 10-15 agences, migrer vers multi-tenant.

---

## 8. Modèle de données simplifié (MVP)

```
Agency
  ├── id, name, logo_url, primary_color
  ├── sms_sender_name, email_from
  └── subscription_status

User
  ├── id, agency_id, name, email, password_hash
  ├── role (ADMIN | NEGOTIATOR)
  └── phone

Lead
  ├── id, agency_id, assigned_to (user_id)
  ├── first_name, last_name, email, phone
  ├── property_address, property_type, property_size
  ├── source (WEBSITE | PORTAL_SELOGER | PORTAL_LEBONCOIN | PORTAL_BIENICI | MANUAL | OTHER)
  ├── status (NEW | IN_CONTACT | APPOINTMENT_SET | ESTIMATION_DONE | MANDATE_SIGNED | LOST)
  ├── lost_reason (nullable)
  ├── estimated_value (nullable)
  ├── mandate_type (EXCLUSIVE | SIMPLE | nullable)
  ├── notes
  ├── created_at, updated_at
  └── next_action_at

Sequence
  ├── id, agency_id, name, trigger_status
  ├── is_active
  └── steps[] (JSON ou table liée)

SequenceStep
  ├── id, sequence_id, order
  ├── delay_days, delay_hours
  ├── channel (SMS | EMAIL | MANUAL_TASK)
  ├── template_content
  └── subject (for email)

SequenceExecution
  ├── id, lead_id, sequence_id
  ├── current_step, status (ACTIVE | PAUSED | COMPLETED | CANCELLED)
  └── next_execution_at

Message
  ├── id, lead_id, channel, direction (INBOUND | OUTBOUND)
  ├── content, status (SENT | DELIVERED | FAILED)
  └── sent_at

Activity
  ├── id, lead_id, user_id
  ├── type (STATUS_CHANGE | NOTE | CALL | SMS_SENT | EMAIL_SENT | APPOINTMENT | MANUAL_TASK)
  ├── description
  └── created_at
```

---

## 9. Écrans MVP (Front-end)

### 9.1 Login
- Email + mot de passe
- Logo agence (personnalisé par instance)

### 9.2 Dashboard (page d'accueil)
```
┌──────────────────────────────────────────────────────────┐
│  [Logo Agence]              EstimaFlow    [User ▼]       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 23       │ │ 8        │ │ 5        │ │ 34%      │   │
│  │ Leads    │ │ RDV      │ │ Mandats  │ │ Taux     │   │
│  │ ce mois  │ │ program. │ │ signés   │ │ convert. │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                          │
│  ⚡ Actions urgentes                                     │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔴 3 leads à relancer aujourd'hui                │   │
│  │ 🟡 2 RDV sans confirmation                       │   │
│  │ 🟠 4 estimations non transformées >7j            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  📊 Funnel du mois                                      │
│  Leads     ████████████████████████ 23                   │
│  Contact   ████████████████ 15                           │
│  RDV       █████████ 8                                   │
│  Estim.    ██████ 6                                      │
│  Mandats   █████ 5                                       │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 9.3 Pipeline (Kanban)
```
┌─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Nouveau │En contact│ RDV    │Estim.   │ Mandat  │ Perdu   │
│  (5)    │  (8)    │ pris(3)│faite(4) │signé(3) │  (2)    │
├─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│┌───────┐│┌───────┐│         │         │         │         │
││Dupont ││├Martin ││         │         │         │         │
││12 rue.│││8 av...││         │         │         │         │
││SeLoger│││Site   ││         │         │         │         │
││J.Nego │││M.Nego ││         │         │         │         │
││⏰ 2h  │││⏰ 1j  ││         │         │         │         │
│└───────┘│└───────┘│         │         │         │         │
│┌───────┐│         │         │         │         │         │
││Leroy  ││         │         │         │         │         │
││...    ││         │         │         │         │         │
│└───────┘│         │         │         │         │         │
└─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘
```

### 9.4 Fiche Lead (détail)
- Infos contact + bien
- Timeline d'activité (tous les échanges, changements de statut)
- Séquence en cours (étape actuelle, prochaine action)
- Actions rapides : Appeler, Envoyer SMS, Changer statut, Ajouter note
- Assignation négociateur

### 9.5 Paramétrage séquences
- Liste des séquences (Nouveau lead, Post-estimation, No-show)
- Éditeur d'étapes : délai + canal + contenu
- Activation/désactivation par séquence
- Prévisualisation du message avec variables

### 9.6 Paramètres agence
- Nom, logo, couleur principale
- Configuration SMS (sender name)
- Configuration email (from address)
- Gestion des utilisateurs (ajout/suppression)

---

## 10. Métriques de succès MVP

### Métriques produit (à tracker dès le jour 1)
| Métrique | Baseline estimée | Objectif MVP |
|----------|-----------------|--------------|
| Temps moyen première réponse | >30 min | <2 min |
| % de leads avec au moins 3 tentatives de contact | <30% | >80% |
| Taux de passage Nouveau → En contact | ~40% | >65% |
| Taux de no-show RDV | ~25% | <15% |
| Taux estimation → mandat | ~30% | >40% |

### Métriques business
| Métrique | Objectif 6 mois |
|----------|----------------|
| Agences payantes | 5-10 |
| Churn mensuel | <5% |
| NPS utilisateurs | >40 |
| MRR | 2 500€ - 5 000€ |

---

## 11. Pricing suggéré

| Plan | Prix | Inclus |
|------|------|--------|
| **Setup** | 500€ one-shot | Configuration, personnalisation, import contacts, formation 1h |
| **Standard** | 149€/mois | Jusqu'à 5 utilisateurs, 500 SMS/mois, emails illimités |
| **Pro** | 249€/mois | Jusqu'à 15 utilisateurs, 1500 SMS/mois, support prioritaire |
| **SMS additionnel** | 0.07€/SMS | Au-delà du forfait inclus |

**Justification** : une agence qui signe 1 mandat supplémentaire par mois grâce à l'outil génère 3 000€ à 8 000€ d'honoraires. ROI immédiat à 149€/mois.

---

## 12. Roadmap

### Phase 1 — Front-end démo (Semaines 1-3)
- [ ] Setup projet Next.js + Tailwind + shadcn/ui
- [ ] Écran de login (maquette fonctionnelle)
- [ ] Dashboard avec données fictives
- [ ] Pipeline Kanban avec drag & drop
- [ ] Fiche lead avec timeline
- [ ] Écran de paramétrage séquences
- [ ] Responsive mobile (négociateurs sur le terrain)
- **Objectif** : Démo convaincante pour signer des pilotes

### Phase 2 — Backend MVP (Semaines 4-8)
- [ ] Schema DB Prisma + migrations
- [ ] Auth NextAuth.js (credentials)
- [ ] CRUD leads + pipeline
- [ ] Endpoint webhook ingestion leads
- [ ] Email parsing (ingestion portails)
- [ ] Envoi SMS (Twilio)
- [ ] Envoi email (Resend)
- [ ] Moteur de séquences (Inngest)
- [ ] Dashboard avec données réelles
- **Objectif** : MVP fonctionnel déployé chez 1-2 pilotes

### Phase 3 — Validation & itération (Semaines 9-12)
- [ ] Onboarding pilotes
- [ ] Collecte feedback
- [ ] Itérations UX
- [ ] Mesure des métriques de succès
- [ ] Script de duplicabilité (setup automatique nouvelle agence)
- **Objectif** : Prouver la valeur, affiner le produit

### Phase 4 — Scale (Mois 4+)
- [ ] WhatsApp Business API
- [ ] Intégrations CRM (Zapier en premier, API natives ensuite)
- [ ] Multi-tenant (si >10 agences)
- [ ] Calendrier de prise de RDV en ligne
- [ ] Scoring leads
- **Objectif** : Produit marché, croissance

---

## 13. Risques et mitigations

| Risque | Probabilité | Impact | Mitigation |
|--------|------------|--------|------------|
| Pas de pilote trouvé | Moyenne | Critique | Démarchage actif dès que le front est prêt. Offrir 3 mois gratuits aux 3 premiers pilotes. |
| Adoption faible par les négociateurs | Élevée | Élevée | UX mobile-first, notifications push, formation 1h, quick wins visibles dès semaine 1 |
| Deliverabilité SMS/email | Moyenne | Élevée | Sender ID vérifié, opt-in documenté, monitoring bounce/spam |
| Conformité RGPD | Faible | Critique | Consentement explicite, politique de rétention (suppression auto >12 mois), mention légale dans chaque message |
| Coûts SMS qui grimpent | Moyenne | Moyenne | Forfait SMS inclus dans l'abonnement, alertes de consommation, bascule email si quota atteint |
| Concurrent qui copie | Moyenne | Faible | Le moat est dans l'exécution et la relation client, pas dans la techno |

---

## 14. Décisions à prendre

| Décision | Options | Recommandation |
|----------|---------|---------------|
| Nom de produit | EstimaFlow / EstimaLead / MandatFlow | EstimaFlow (clair, mémorable) |
| Hébergement | Vercel / Railway / VPS OVH | Vercel (DX, simplicité, scaling auto) |
| Base de données | Supabase / Neon / PlanetScale | Supabase (Postgres + dashboard + auth en backup) |
| Provider SMS | Twilio / OVH SMS / Brevo | Twilio (fiabilité, API, international) |
| Background jobs | Inngest / Vercel Cron / QStash | Inngest (type-safe, retry, monitoring) |
| Instance vs multi-tenant MVP | Instance par agence / Multi-tenant | Instance par agence (isolation, simplicité, argument RGPD) |

---

## 15. Critères de succès du MVP

Le MVP est considéré validé si, après 8 semaines de pilote :

1. **Au moins 2 agences** utilisent l'outil quotidiennement
2. **>80% des leads** reçoivent une réponse en <5 min
3. **Taux de conversion estimation→mandat** mesurable et en hausse vs baseline
4. **Au moins 1 agence** prête à payer après la période pilote
5. **NPS >30** auprès des utilisateurs

---

*Ce PRD est un document vivant. Il sera mis à jour après chaque phase de validation.*
