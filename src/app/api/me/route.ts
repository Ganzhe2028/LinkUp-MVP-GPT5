import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// 获取当前登录用户信息
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json(null, { status: 200 });

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json(null, { status: 200 });

  return NextResponse.json({
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    skills: user.skills as string[],
    contactType: user.contactType,
    contactValue: user.contactValue,
    contactQr: user.contactQr,
    socialLinks: user.socialLinks as Record<string, string> | null,
    lookingForTeammates: user.lookingForTeammates,
    needsOnboarding: user.needsOnboarding,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  });
}