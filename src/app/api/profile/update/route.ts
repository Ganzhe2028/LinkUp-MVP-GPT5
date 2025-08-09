import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(50),
  bio: z.string().max(140).optional().default(""),
  skills: z.array(z.string()).min(1).max(5),
  contactType: z.enum(["WECHAT", "PHONE", "QR"]).optional().nullable(),
  contactValue: z.string().optional().nullable(),
  contactQr: z.string().optional().nullable(),
  lookingForTeammates: z.boolean(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ message: "未登录" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = UpdateProfileSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ message: "参数不合法" }, { status: 400 });

    const data = parsed.data;

    await prisma.user.update({
      where: { id: session.sub },
      data: {
        displayName: data.displayName,
        bio: data.bio ?? "",
        skills: data.skills,
        contactType: data.contactType ?? null,
        contactValue: data.contactValue ?? null,
        contactQr: data.contactQr ?? null,
        lookingForTeammates: data.lookingForTeammates,
        needsOnboarding: false, // 首次填写完成
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}