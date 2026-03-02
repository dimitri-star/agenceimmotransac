/**
 * Création d'une nouvelle agence (pour duplication / nouvelle instance).
 * Usage: AGENCY_NAME="Agence Dupont" ADMIN_EMAIL="admin@dupont.fr" TEMP_PASS="xxx" npx tsx scripts/setup-new-agency.ts
 * Prérequis: DATABASE_URL dans .env, migrations appliquées.
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
const agencyName = process.env.AGENCY_NAME ?? "Nouvelle Agence";
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@agence.fr";
const tempPass = process.env.TEMP_PASS ?? "ChangeMe123!";

if (!connectionString) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const agency = await prisma.agency.create({
    data: {
      name: agencyName,
      emailFrom: adminEmail,
      smsSenderName: "Agence",
      subscriptionStatus: "active",
    },
  });
  const hash = await bcrypt.hash(tempPass, 10);
  await prisma.user.create({
    data: {
      agencyId: agency.id,
      name: "Admin",
      email: adminEmail,
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  console.log("Agence créée:", agency.id, agency.name);
  console.log("Connexion:", adminEmail, "/", tempPass);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
