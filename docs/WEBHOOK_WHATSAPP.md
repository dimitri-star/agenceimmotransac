# Webhook WhatsApp – Payload attendu et branchement futur

Ce document décrit l’endpoint webhook prévu pour recevoir les messages WhatsApp entrants, le payload attendu et comment brancher un fournisseur (Twilio ou Meta Cloud API) plus tard.

## Endpoint

- **URL** : `POST /api/webhooks/whatsapp`
- **Rôle** : Recevoir les événements/messages entrants du fournisseur WhatsApp (Twilio, Meta, etc.), identifier le lead par numéro de téléphone, enregistrer le message en base et faire avancer le flux de qualification si applicable.

## Comportement attendu (côté applicatif)

1. **Vérification** : Valider la requête (signature Twilio/Meta si configurée).
2. **Identification du lead** : À partir du numéro expéditeur (format E.164), retrouver le `Lead` correspondant (`Lead.phone` normalisé) pour l’agence concernée.
3. **Enregistrement du message** : Créer une entrée `Message` avec :
   - `leadId`
   - `channel: WHATSAPP`
   - `direction: INBOUND`
   - `content` : corps du message entrant
   - `status` : ex. `RECEIVED`
   - `sentAt` : date/heure du message
4. **Qualification** : Si le lead est en qualification (`qualificationStatus === "IN_PROGRESS"`), passer le corps du message à la logique “avancer qualification” (mise à jour de `qualificationPayload`, étape suivante ou passage en `QUALIFIED` + calcul `heatScore` / `prospectPath`), puis envoi de la prochaine question (via `sendWhatsApp` côté backend).
5. **Réponse HTTP** : Répondre rapidement (200) pour éviter les timeouts côté fournisseur ; traiter la qualification de façon asynchrone si besoin (job Inngest déclenché par le webhook).

## Payload attendu (normalisé interne)

Après parsing du format fournisseur, le handler utilisera une forme interne du type :

```ts
// Forme normalisée utilisée en interne (après parsing Twilio / Meta)
type WhatsAppInboundPayload = {
  from: string;        // Numéro E.164 (ex. "33612345678")
  to?: string;         // Numéro du business
  body: string;        // Texte du message
  messageId?: string; // Id du message côté fournisseur
  timestamp?: string; // ISO 8601
};
```

## Twilio WhatsApp

- **Webhook** : Configurer l’URL de votre app (ex. `https://votre-domaine.com/api/webhooks/whatsapp`) dans la console Twilio (WhatsApp Sandbox ou compte WhatsApp Business).
- **Payload** : Twilio envoie un `POST` avec `Content-Type: application/x-www-form-urlencoded`. Champs utiles : `From`, `To`, `Body`, `MessageSid`.
- **Réponse** : Twilio attend du TwiML ou 200. Pour une simple réception, répondre `200 OK` sans TwiML suffit si les réponses sont envoyées via l’API Twilio (pas en réponse HTTP).
- **Branchement** : Dans `src/lib/whatsapp.ts`, remplacer le stub par l’appel à l’API Twilio (Messages Create) avec le même `body` et enregistrer le `Message` avec `status: "SENT"` et l’id Twilio en métadonnée si besoin.

## Meta Cloud API (WhatsApp Business)

- **Webhook** : Configurer l’URL dans l’app Meta (Produit WhatsApp > Configuration). GET pour la vérification (query `hub.mode`, `hub.verify_token`, `hub.challenge`), POST pour les événements.
- **Payload** : JSON. Les messages entrants sont dans `entry[].changes[].value.messages`. Champs utiles : `from` (numéro), `text.body`, `id`, `timestamp`.
- **Réponse** : Répondre 200 rapidement ; traiter les messages en tâche de fond.
- **Branchement** : Dans `src/lib/whatsapp.ts`, appeler l’API Meta pour envoyer des messages (template ou texte selon les règles Meta) et créer le `Message` en base avec le statut retourné.

## Implémentation actuelle (stub)

- L’envoi WhatsApp est un **stub** : `sendWhatsApp` crée uniquement un `Message` en base avec `channel: WHATSAPP` et `status: "SKIPPED_NO_PROVIDER"` (aucun appel API externe).
- L’endpoint `POST /api/webhooks/whatsapp` **n’est pas encore implémenté**. À créer lorsque le fournisseur est choisi :
  - Créer `src/app/api/webhooks/whatsapp/route.ts`.
  - Parser le body (Twilio form ou Meta JSON), normaliser en `WhatsAppInboundPayload`.
  - Identifier le lead par `from` (normaliser le numéro, chercher `Lead` par `phone` et `agencyId`).
  - Créer `Message` INBOUND, puis appeler la logique d’avancement de qualification (ex. même logique que `POST /api/leads/[id]/qualification/advance` avec `answer` = body du message).

## Sécurité

- Vérifier la signature du webhook (Twilio: `X-Twilio-Signature` + auth token ; Meta: signature HMAC dans les headers).
- Ne pas exposer de données sensibles dans les logs (numéros, contenu des messages).
- Utiliser des variables d’environnement pour les tokens et secrets du fournisseur.
