import type { Entry } from "@reflekt/db";
import { SidebarEntryItem } from "./sidebar-entry-item";

interface SidebarSectionProps {
  title: string;
  entries: Entry[];
}

export function SidebarSection({ title, entries }: SidebarSectionProps) {
  if (entries.length === 0) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <h2 className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {title}
      </h2>
      <div className="space-y-1 px-2 pb-2">
        {entries.map((entry) => (
          <SidebarEntryItem key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
