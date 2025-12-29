import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";

export default async function EntryPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session) {
    return null;
  }

  const userId = parseInt(session.user.id!);
  const entryId = parseInt(params.id);

  const entry = await db.query.entries.findFirst({
    where: and(eq(entries.id, entryId), eq(entries.userId, userId)),
  });

  if (!entry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{entry.title}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {new Date(entry.createdAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: entry.content }}
        />
        <p className="mt-6 text-sm text-gray-500">
          TipTap editor will be integrated in Phase 6
        </p>
      </div>
    </div>
  );
}
