# Déploiement EstimaFlow (Vercel + DB + Inngest)

## Variables d'environnement

À configurer dans Vercel (Settings → Environment Variables) ou dans `.env` en local :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL Postgres (Supabase, Neon, etc.) | `postgresql://user:pass@host:5432/db` |
| `AUTH_SECRET` | Secret NextAuth (générer : `openssl rand -base64 32`) | — |
| `AUTH_URL` | URL publique de l'app | `https://votre-app.vercel.app` |
| `TWILIO_ACCOUNT_SID` | Compte Twilio | — |
| `TWILIO_AUTH_TOKEN` | Token Twilio | — |
| `TWILIO_PHONE_NUMBER` | Numéro expéditeur SMS | +33... |
| `RESEND_API_KEY` | Clé API Resend | — |
| `EMAIL_FROM` | Adresse d'envoi email | `noreply@votredomaine.com` |
| `WEBHOOK_LEAD_SECRET` | Secret pour le webhook d'ingestion (optionnel) | — |

## Étapes

1. **Créer une base Postgres** (Supabase ou Neon), récupérer l’URL.
2. **Déployer sur Vercel** : connecter le repo, définir les variables ci-dessus.
3. **Migrations** : exécuter `npx prisma migrate deploy` (via script post-deploy ou manuellement sur une instance avec DATABASE_URL).
4. **Seed** (première agence) : `npm run db:seed` une fois la DB créée.
5. **Inngest** : connecter le projet à [Inngest Cloud](https://www.inngest.com) et configurer l’URL du serveur (ex. `https://votre-app.vercel.app/api/inngest`).

## Premier utilisateur

Après le seed : `demo@estimaflow.fr` / `password` (admin de l’agence de démo).
