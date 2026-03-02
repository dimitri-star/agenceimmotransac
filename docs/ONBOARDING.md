# Onboarding pilotes — EstimaFlow

## Connexion

1. Ouvrir l’URL de l’application (ex. `https://votre-instance.vercel.app`).
2. Se connecter avec les identifiants fournis (email + mot de passe).

## Envoi de leads

### Option 1 : Webhook (formulaires, sites, Typeform)

- **URL** : `POST https://votre-instance.vercel.app/api/webhooks/lead`
- **Headers** : `Content-Type: application/json`, `x-webhook-secret: VOTRE_SECRET` (si configuré).
- **Body** (JSON) :
  - `firstName`, `lastName`, `email`, `phone`, `propertyAddress` (obligatoires)
  - `propertyType`, `propertySize` (optionnels)
  - `source` : `WEBSITE` | `PORTAL_SELOGER` | `PORTAL_LEBONCOIN` | `PORTAL_BIENICI` | `MANUAL` | `OTHER`
  - `agencyId` : ID de l’agence (fourni par l’admin)

Exemple avec cURL :
```bash
curl -X POST https://votre-instance.vercel.app/api/webhooks/lead \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: VOTRE_SECRET" \
  -d '{"agencyId":"xxx","firstName":"Jean","lastName":"Dupont","email":"jean@email.fr","phone":"0612345678","propertyAddress":"12 rue de la Paix 75002 Paris","source":"WEBSITE"}'
```

### Option 2 : Saisie manuelle

- Depuis l’app : utiliser le formulaire d’ajout de lead (à venir en UI) ou l’API `POST /api/leads` en étant connecté.

## Pipeline

- **Dashboard** : KPIs du mois, actions urgentes, funnel.
- **Pipeline** : colonnes Nouveau → En contact → RDV programmé → Estimation faite → Mandat signé → Perdu. Glisser-déposer les cartes pour changer le statut.
- **Fiche lead** : clic sur une carte pour voir le détail, la timeline et les actions (appel, SMS, statut, note).

## Séquences

- **Paramètres → Séquences** : activer/désactiver les séquences (Nouveau lead, Post-estimation, No-show) et consulter les étapes.  
- La réponse automatique (SMS + email) est envoyée à la réception d’un lead (webhook ou création manuelle).  
- Les relances sont gérées par le moteur (cron toutes les 10 min).

## Support

Pour toute question : contacter l’équipe EstimaFlow.
