-- CreateEnum QualificationStatus and ProspectPath
CREATE TYPE "QualificationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "ProspectPath" AS ENUM ('HOT', 'HESITANT');

-- AlterEnum LeadStatus: add IN_WHATSAPP_CONVERSATION and QUALIFIED (before IN_CONTACT)
ALTER TYPE "LeadStatus" ADD VALUE 'IN_WHATSAPP_CONVERSATION';
ALTER TYPE "LeadStatus" ADD VALUE 'QUALIFIED';

-- AlterEnum SequenceChannel: add WHATSAPP
ALTER TYPE "SequenceChannel" ADD VALUE 'WHATSAPP';

-- AlterEnum ActivityType: add WHATSAPP_SENT and CALENDLY_SENT
ALTER TYPE "ActivityType" ADD VALUE 'WHATSAPP_SENT';
ALTER TYPE "ActivityType" ADD VALUE 'CALENDLY_SENT';

-- Agency: add Calendly and commission columns
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "calendlyToken" TEXT;
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "calendlyOrgUri" TEXT;
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "calendlyEventType" TEXT;
ALTER TABLE "Agency" ADD COLUMN IF NOT EXISTS "defaultCommission" INTEGER;

-- Lead: add qualification and Calendly columns
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "qualificationStatus" "QualificationStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "qualificationPayload" JSONB;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "heatScore" INTEGER;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "prospectPath" "ProspectPath";
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "calendlyLinkSentAt" TIMESTAMP(3);
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "calendlyBookingUrl" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "rdvConfirmedAt" TIMESTAMP(3);
