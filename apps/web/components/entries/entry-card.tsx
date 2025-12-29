import Link from "next/link";
import type { Entry } from "@reflekt/db";

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  return (
    <Link
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
  );
}
