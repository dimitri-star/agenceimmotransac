import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is required to run seed.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("password", 10);

  const agency = await prisma.agency.upsert({
    where: { id: "seed-agency-1" },
    update: {},
    create: {
      id: "seed-agency-1",
      name: "Agence Demo",
      primaryColor: "#0a0a0a",
      smsSenderName: "AgenceDemo",
      emailFrom: "contact@agence-demo.fr",
      subscriptionStatus: "active",
    },
  });

  const admin = await prisma.user.upsert({
    where: { id: "seed-user-admin" },
    update: {},
    create: {
      id: "seed-user-admin",
      agencyId: agency.id,
      name: "Admin Demo",
      email: "demo@estimaflow.fr",
      passwordHash: hashedPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { id: "seed-user-neg-1" },
    update: {},
    create: {
      id: "seed-user-neg-1",
      agencyId: agency.id,
      name: "Marie Martin",
      email: "marie@agence-demo.fr",
      passwordHash: await bcrypt.hash("password", 10),
      role: "NEGOTIATOR",
    },
  });

  const seq = await prisma.sequence.upsert({
    where: { id: "seed-seq-new-lead" },
    update: {},
    create: {
      id: "seed-seq-new-lead",
      agencyId: agency.id,
      name: "Nouveau lead",
      triggerStatus: "NEW",
      isActive: true,
    },
  });

  await prisma.sequenceStep.deleteMany({ where: { sequenceId: seq.id } });
  await prisma.sequenceStep.createMany({
    data: [
      { sequenceId: seq.id, order: 1, delayDays: 0, delayHours: 0, channel: "SMS", templateContent: "Bonjour {prénom}, merci pour votre demande d'estimation pour {adresse_bien}. {nom_négociateur} vous contacte très vite." },
      { sequenceId: seq.id, order: 2, delayDays: 1, delayHours: 0, channel: "SMS", templateContent: "Bonjour {prénom}, avez-vous des questions sur l'estimation de votre bien ?" },
      { sequenceId: seq.id, order: 3, delayDays: 3, delayHours: 0, channel: "EMAIL", templateContent: "Guide estimation et tendances marché local...", subject: "Votre estimation immobilière" },
      { sequenceId: seq.id, order: 4, delayDays: 7, delayHours: 0, channel: "MANUAL_TASK", templateContent: "Relance finale - appeler le lead" },
    ],
    skipDuplicates: true,
  });

  console.log("Seed done:", { agency: agency.name, admin: admin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
