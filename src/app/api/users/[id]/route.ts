import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// 获取用户公开信息（不含联系方式）
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ message: "未找到用户" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    skills: user.skills as string[],
    lookingForTeammates: user.lookingForTeammates,
    updatedAt: user.updatedAt,
    socialLinks: (user.socialLinks as Record<string, string>) || null,
  });
}