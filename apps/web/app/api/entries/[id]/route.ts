import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id!);
  const entryId = parseInt(params.id);

  try {
    // Verify entry belongs to user before deleting
    const entry = await db.query.entries.findFirst({
      where: and(eq(entries.id, entryId), eq(entries.userId, userId)),
    });

    if (!entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // Delete the entry
    await db.delete(entries).where(eq(entries.id, entryId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry" },
      { status: 500 }
    );
  }
}
