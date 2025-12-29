"use client";

import type { Entry } from "@reflekt/db";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface SidebarEntryItemProps {
  entry: Entry;
  onDelete?: () => void;
}

export function SidebarEntryItem({ entry, onDelete }: SidebarEntryItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === `/entry/${entry.id}`;
  const [isDeleting, setIsDeleting] = useState(false);

  // Truncate title if too long
  const displayTitle = entry.title.length > 30
    ? entry.title.substring(0, 30) + "..."
    : entry.title;

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Delete "${entry.title}"?`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/entries/${entry.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }

      // If we're currently viewing this entry, redirect to home
      if (isActive) {
        router.push("/");
      }

      // Call the parent's refresh callback
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("Failed to delete entry:", error);
      alert("Failed to delete entry");
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
        isActive
          ? "bg-primary/10 text-primary"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      <Link href={`/entry/${entry.id}`} className="flex-1 min-w-0">
        <div className="truncate font-medium">{displayTitle}</div>
        <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {new Date(entry.createdAt).toLocaleDateString()}
        </div>
      </Link>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded disabled:opacity-50"
        title="Delete entry"
      >
        <Trash2 size={14} className="text-red-600 dark:text-red-400" />
      </button>
    </div>
  );
}
