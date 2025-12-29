"use client";

import { TiptapEditor } from "./editor/tiptap-editor";
import { useState, useEffect } from "react";
import type { Entry } from "@reflekt/db";

interface TodayEntryEditorProps {
  initialEntry: Entry | null;
  userId: number;
}

export function TodayEntryEditor({ initialEntry, userId }: TodayEntryEditorProps) {
  const [entry, setEntry] = useState<Entry | null>(initialEntry);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    // If no entry exists for today, create one
    if (!entry && !creating) {
      setCreating(true);
      const today = new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: today,
          content: "",
          userId,
        }),
      })
        .then((res) => res.json())
        .then((newEntry) => {
          setEntry(newEntry);
          setCreating(false);
        })
        .catch((error) => {
          console.error("Failed to create entry:", error);
          setCreating(false);
        });
    }
  }, [entry, userId, creating]);

  if (creating || !entry) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <p className="text-center text-gray-500">Creating today's entry...</p>
      </div>
    );
  }

  return <TiptapEditor initialContent={entry.content} entryId={entry.id} />;
}
