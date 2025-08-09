import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// 推荐列表：支持分页与搜索
// GET /api/recommendations?cursor=xxx&limit=20&q=keyword
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const cursor = searchParams.get("cursor");

  const session = await getSession();
  const viewer = session ? await prisma.user.findUnique({ where: { id: session.sub } }) : null;

  const where = {
    lookingForTeammates: true,
    ...(q
      ? {
          OR: [
            { displayName: { contains: q, mode: "insensitive" } },
            { bio: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  } as const;

  // 拉取多一条用于判断是否还有下一页
  const users = await prisma.user.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  });

  const hasMore = users.length > limit;
  const items = users.slice(0, limit);

  const viewerSkills = viewer ? ((viewer.skills as string[]) || []) : [];

  // 如果有关键词，再按技能过滤（前端过滤，保证 SQLite JSON 兼容性）
  const filtered = q
    ? items.filter((u) => {
        const skills = ((u.skills as string[]) || []).map((s) => s.toLowerCase());
        return skills.some((s) => s.includes(q.toLowerCase()));
      })
    : items;

  // 计算匹配分（共同技能数 * 10 + 更新时间权重）
  const scored = filtered
    .map((u) => {
      const skills = (u.skills as string[]) || [];
      const common = skills.filter((s) => viewerSkills.includes(s)).length;
      const skillScore = common * 10;
      const timeScore = Math.max(0, 5 - Math.floor((Date.now() - u.updatedAt.getTime()) / (24 * 60 * 60 * 1000)));
      const score = skillScore + timeScore;
      return {
        id: u.id,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        skills,
        lookingForTeammates: u.lookingForTeammates,
        updatedAt: u.updatedAt,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return NextResponse.json({
    items: scored,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  });
}