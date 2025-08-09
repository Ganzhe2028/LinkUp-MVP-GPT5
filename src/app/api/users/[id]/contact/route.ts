import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// 获取联系方式（需满足：已登录 && 对方正在寻找队友）
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "未登录" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ message: "未找到用户" }, { status: 404 });

  if (!user.lookingForTeammates) {
    return NextResponse.json({ message: "对方未开放联系方式" }, { status: 403 });
  }

  return NextResponse.json({
    contactType: user.contactType,
    contactValue: user.contactValue,
    contactQr: user.contactQr,
  });
}