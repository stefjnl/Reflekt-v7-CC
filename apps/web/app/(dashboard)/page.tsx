import { auth } from "@/lib/auth";
import { db, entries } from "@reflekt/db";
import { eq, and, gte } from "drizzle-orm";
import { TodayEntryEditor } from "@/components/today-entry-editor";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const userId = parseInt(session.user.id!);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Check if entry exists for today
  const todayEntry = await db.query.entries.findFirst({
    where: and(eq(entries.userId, userId), gte(entries.createdAt, todayStart)),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h1>
      </div>

      <TodayEntryEditor initialEntry={todayEntry} userId={userId} />
    </div>
  );
}
