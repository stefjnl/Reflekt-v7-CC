"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorToolbar } from "./editor-toolbar";

interface TiptapEditorProps {
  initialContent: string;
  entryId?: number;
  onSave?: (content: string) => void;
}

export function TiptapEditor({
  initialContent,
  entryId,
  onSave,
}: TiptapEditorProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "idle">("idle");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "What's on your mind today?",
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-[500px] p-8",
      },
    },
    onUpdate: ({ editor }) => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      setSaveStatus("saving");

      // Debounced auto-save (1 second)
      saveTimeoutRef.current = setTimeout(async () => {
        const content = editor.getHTML();

        if (entryId) {
          try {
            await fetch("/api/autosave", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ entryId, content }),
            });
            setSaveStatus("saved");
          } catch (error) {
            console.error("Auto-save failed:", error);
            setSaveStatus("idle");
          }
        }

        onSave?.(content);
      }, 1000);
    },
  });

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <EditorToolbar editor={editor} />
        {saveStatus !== "idle" && (
          <span className="text-sm text-gray-500">
            {saveStatus === "saving" ? "Saving..." : "Saved"}
          </span>
        )}
      </div>
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
