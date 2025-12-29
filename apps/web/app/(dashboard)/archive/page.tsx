import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";

export default async function ArchivePage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const userId = parseInt(session.user.id!);

  // Fetch first 50 entries (cursor pagination in Phase 7)
  const entryList = await db.query.entries.findMany({
    where: eq(entries.userId, userId),
    orderBy: [desc(entries.createdAt)],
    limit: 50,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Archive</h1>

      <div className="space-y-4">
        {entryList.map((entry) => (
          <Link
            key={entry.id}
            href={`/entry/${entry.id}`}
            className="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-900"
          >
            <h2 className="text-xl font-semibold">{entry.title}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {new Date(entry.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <div
              className="prose prose-sm dark:prose-invert mt-3 line-clamp-3 max-w-none"
              dangerouslySetInnerHTML={{
                __html: entry.content.substring(0, 200) + "...",
              }}
            />
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500">
        Cursor pagination will be added in Phase 7
      </p>
    </div>
  );
}
