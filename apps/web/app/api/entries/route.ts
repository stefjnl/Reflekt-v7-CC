import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const isSidebar = searchParams.get("sidebar") === "true";

  if (isSidebar) {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const userId = parseInt(session.user.id!);

    const [today, yesterday, previous30Days] = await Promise.all([
      db.query.entries.findMany({
        where: and(eq(entries.userId, userId), gte(entries.createdAt, todayStart)),
        orderBy: [desc(entries.createdAt)],
        limit: 10,
      }),
      db.query.entries.findMany({
        where: and(
          eq(entries.userId, userId),
          gte(entries.createdAt, yesterdayStart),
          lt(entries.createdAt, todayStart)
        ),
        orderBy: [desc(entries.createdAt)],
        limit: 10,
      }),
      db.query.entries.findMany({
        where: and(
          eq(entries.userId, userId),
          gte(entries.createdAt, thirtyDaysAgo),
          lt(entries.createdAt, yesterdayStart)
        ),
        orderBy: [desc(entries.createdAt)],
        limit: 20,
      }),
    ]);

    return NextResponse.json({ today, yesterday, previous30Days });
  }

  // Regular pagination handled separately
  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();
  const userId = parseInt(session.user.id!);

  try {
    const [newEntry] = await db
      .insert(entries)
      .values({
        title,
        content,
        userId,
      })
      .returning();

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Failed to create entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry" },
      { status: 500 }
    );
  }
}
