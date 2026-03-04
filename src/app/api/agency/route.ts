import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import type { SessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const agency = await prisma.agency.findUnique({
    where: { id: user.agencyId },
    select: {
      id: true,
      name: true,
      logoUrl: true,
      primaryColor: true,
      smsSenderName: true,
      emailFrom: true,
      calendlyToken: true,
      calendlyOrgUri: true,
      calendlyEventType: true,
      defaultCommission: true,
    },
  });
  if (!agency) {
    return NextResponse.json({ error: "Agence introuvable" }, { status: 404 });
  }
  return NextResponse.json({
    ...agency,
    calendlyToken: agency.calendlyToken ? "(défini)" : null,
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;
  if (!user?.agencyId) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  if (!prisma) {
    return NextResponse.json({ error: "Base de données non configurée" }, { status: 503 });
  }
  const body = await req.json().catch(() => ({}));
  const {
    name,
    logoUrl,
    primaryColor,
    smsSenderName,
    emailFrom,
    calendlyToken,
    calendlyOrgUri,
    calendlyEventType,
    defaultCommission,
  } = body;
  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (logoUrl !== undefined) data.logoUrl = logoUrl;
  if (primaryColor !== undefined) data.primaryColor = primaryColor;
  if (smsSenderName !== undefined) data.smsSenderName = smsSenderName;
  if (emailFrom !== undefined) data.emailFrom = emailFrom;
  if (calendlyOrgUri !== undefined) data.calendlyOrgUri = calendlyOrgUri;
  if (calendlyEventType !== undefined) data.calendlyEventType = calendlyEventType;
  if (defaultCommission !== undefined) data.defaultCommission = defaultCommission == null ? null : Number(defaultCommission);
  if (calendlyToken !== undefined && calendlyToken !== "(défini)") data.calendlyToken = calendlyToken;
  const agency = await prisma.agency.update({
    where: { id: user.agencyId },
    data,
    select: {
      id: true,
      name: true,
      logoUrl: true,
      primaryColor: true,
      smsSenderName: true,
      emailFrom: true,
      calendlyToken: true,
      calendlyOrgUri: true,
      calendlyEventType: true,
      defaultCommission: true,
    },
  });
  return NextResponse.json({
    ...agency,
    calendlyToken: agency.calendlyToken ? "(défini)" : null,
  });
}
