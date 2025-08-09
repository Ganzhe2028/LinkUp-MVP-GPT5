import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/utils";
import { createSession } from "@/lib/session";

// 登录接口：POST /api/auth/login
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "参数不合法" }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ message: "邮箱或密码错误" }, { status: 401 });

    await createSession({ sub: user.id, username: user.username, email: user.email });

    return NextResponse.json({ id: user.id, needsOnboarding: user.needsOnboarding }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "服务器错误" }, { status: 500 });
  }
}