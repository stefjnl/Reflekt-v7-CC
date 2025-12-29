"use client";

import type { Entry } from "@reflekt/db";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarEntryItemProps {
  entry: Entry;
}

export function SidebarEntryItem({ entry }: SidebarEntryItemProps) {
  const pathname = usePathname();
  const isActive = pathname === `/entry/${entry.id}`;

  // Truncate title if too long
  const displayTitle = entry.title.length > 30
    ? entry.title.substring(0, 30) + "..."
    : entry.title;

  return (
    <Link
      href={`/entry/${entry.id}`}
      className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      <div className="truncate font-medium">{displayTitle}</div>
      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        {new Date(entry.createdAt).toLocaleDateString()}
      </div>
    </Link>
  );
}
