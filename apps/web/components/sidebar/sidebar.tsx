"use client";

import { useEffect, useState } from "react";
import { useSnapshot } from "valtio";
import { uiStore } from "@/lib/store";
import { SidebarSection } from "./sidebar-section";
import { ChevronLeft, Plus } from "lucide-react";
import type { Entry } from "@reflekt/db";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SidebarProps {
  userId: string;
}

interface GroupedEntries {
  today: Entry[];
  recent: Entry[];
}

export function Sidebar({ userId }: SidebarProps) {
  const snap = useSnapshot(uiStore);
  const router = useRouter();
  const [entries, setEntries] = useState<GroupedEntries>({
    today: [],
    recent: [],
  });

  useEffect(() => {
    fetch("/api/entries?sidebar=true")
      .then((res) => res.json())
      .then(setEntries)
      .catch(console.error);
  }, []);

  return (
    <aside
      className={`transition-all duration-300 ${
        snap.sidebarCollapsed ? "w-20" : "w-80"
      } border-r border-gray-200 bg-white/80 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/80`}
    >
      <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        {!snap.sidebarCollapsed && (
          <h1 className="text-xl font-semibold">Reflekt</h1>
        )}
        <button
          onClick={() => {
            uiStore.sidebarCollapsed = !uiStore.sidebarCollapsed;
          }}
          className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={snap.sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={`h-5 w-5 transition-transform ${
              snap.sidebarCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {!snap.sidebarCollapsed && (
        <div className="h-[calc(100vh-5rem)] overflow-y-auto">
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center gap-2 p-4 text-left hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Plus size={20} />
            <span>New Entry</span>
          </button>

          <SidebarSection title="Today" entries={entries.today} />

          <div className="border-t border-gray-200 dark:border-gray-700 mx-4 my-2" />

          <SidebarSection title="" entries={entries.recent} />

          <Link
            href="/entries"
            className="flex items-center gap-2 p-4 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            View All Entries
          </Link>
        </div>
      )}
    </aside>
  );
}
