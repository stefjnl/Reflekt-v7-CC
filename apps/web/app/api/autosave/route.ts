import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId, content } = await req.json();

  const userId = parseInt(session.user.id!);

  try {
    await db
      .update(entries)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(and(eq(entries.id, entryId), eq(entries.userId, userId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Auto-save error:", error);
    return NextResponse.json(
      { error: "Failed to save" },
      { status: 500 }
    );
  }
}
