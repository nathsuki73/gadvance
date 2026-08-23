"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import * as locales from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  withMultiColumn,
  multiColumnDropCursor,
  locales as multiColumnLocales,
} from "@blocknote/xl-multi-column";

import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";

import { createYouTubeBlock } from "./YoutubeBlock";
import { createLicensedImageBlockReader } from "./LicensedImageBlockReader";
import { createImageBlockReader } from "./ImageBlockReader";

let customSchemaInstance: any = null;

function getCustomSchema() {
  if (!customSchemaInstance) {
    customSchemaInstance = withMultiColumn(
      BlockNoteSchema.create({
        blockSpecs: {
          ...defaultBlockSpecs,
          image: createImageBlockReader(),
          youtube: createYouTubeBlock(),
          licensedImage: createLicensedImageBlockReader(),
        },
      }),
    );
  }
  return customSchemaInstance;
}

/**
 * Deep sanitization ensuring every single block has valid iterable arrays for `content` and `children`.
 */
function sanitizeBlocks(blocks: any[]): any[] {
  if (!blocks || !Array.isArray(blocks)) return [];

  return blocks
    .map((block) => {
      if (!block || typeof block !== "object") return null;

      const type = typeof block.type === "string" ? block.type : "paragraph";
      const safeChildren = Array.isArray(block.children)
        ? sanitizeBlocks(block.children)
        : [];
      const safeProps =
        block.props && typeof block.props === "object" ? block.props : {};

      // Handle multi-column containers
      if (type === "columnList") {
        const validColumns = safeChildren.filter(
          (c) => c && c.type === "column",
        );
        return {
          id: typeof block.id === "string" ? block.id : undefined,
          type: "columnList",
          props: safeProps,
          children: validColumns.length > 0 ? validColumns : [],
          content: [],
        };
      }

      if (type === "column") {
        return {
          id: typeof block.id === "string" ? block.id : undefined,
          type: "column",
          props: safeProps,
          children:
            safeChildren.length > 0
              ? safeChildren
              : [
                  {
                    type: "paragraph",
                    props: {},
                    content: [],
                    children: [],
                  },
                ],
          content: [],
        };
      }

      // Handle media blocks
      if (type === "image" || type === "licensedImage") {
        return {
          id: typeof block.id === "string" ? block.id : undefined,
          type,
          props: {
            ...safeProps,
            url: safeProps.url || "",
            caption: safeProps.caption || "",
            title: safeProps.title || "",
            author: safeProps.author || "",
            sourceName: safeProps.sourceName || "",
            sourceUrl: safeProps.sourceUrl || "",
            license: safeProps.license || "",
            showPreview: safeProps.showPreview ?? true,
            previewWidth: safeProps.previewWidth || "100%",
            width: safeProps.width || "100%",
            textAlignment: safeProps.textAlignment || "left",
          },
          content: [],
          children: safeChildren,
        };
      }

      // Standard text/heading/list blocks
      return {
        id: typeof block.id === "string" ? block.id : undefined,
        type,
        props: safeProps,
        content: sanitizeContent(block.content),
        children: safeChildren,
      };
    })
    .filter(Boolean);
}

function sanitizeContent(content: any): any[] {
  if (!content) return [];

  if (Array.isArray(content)) {
    return content.map(sanitizeInlineItem).filter(Boolean);
  }

  if (typeof content === "string") {
    return [{ type: "text", text: content, styles: {} }];
  }

  return [];
}

function sanitizeInlineItem(item: any): any {
  if (item == null) return { type: "text", text: "", styles: {} };

  if (typeof item === "string") {
    return { type: "text", text: item, styles: {} };
  }

  if (typeof item !== "object") {
    return { type: "text", text: "", styles: {} };
  }

  const rawStyles = item.styles;
  const safeStyles =
    rawStyles && typeof rawStyles === "object" && !Array.isArray(rawStyles)
      ? rawStyles
      : {};

  // Links carry a nested `content` array, not a flat `text` string.
  if (item.type === "link") {
    const nestedContent =
      Array.isArray(item.content) && item.content.length > 0
        ? item.content.map(sanitizeInlineItem).filter(Boolean)
        : [{ type: "text", text: "", styles: {} }];

    return {
      type: "link",
      href: typeof item.href === "string" ? item.href : "",
      content: nestedContent,
    };
  }

  return {
    type: typeof item.type === "string" ? item.type : "text",
    text:
      item.text === null || item.text === undefined ? "" : String(item.text),
    styles: safeStyles,
  };
}

interface BlockNoteReaderProps {
  initialContent?: any[];
}

export default function BlockNoteReader({
  initialContent,
}: BlockNoteReaderProps) {
  const schema = useMemo(() => getCustomSchema(), []);
  const isInitializedRef = useRef<boolean>(false);

  // 🔑 1. Initialize editor completely empty to avoid constructor parsing crashes
  const editor = useCreateBlockNote({
    schema,
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
  });

  // 🔑 2. Safely populate blocks after mount
  useEffect(() => {
    if (!editor || isInitializedRef.current) return;

    if (
      initialContent &&
      Array.isArray(initialContent) &&
      initialContent.length > 0
    ) {
      try {
        const sanitized = sanitizeBlocks(initialContent);
        if (sanitized.length > 0) {
          editor.replaceBlocks(editor.document, sanitized);
          isInitializedRef.current = true;
        }
      } catch (err) {
        console.warn("BlockNoteReader: Failed to load content blocks:", err);
      }
    }
  }, [editor, initialContent]);

  return (
    <div className="w-full border-zinc-200/85 bg-white shadow-2xs overflow-x-auto">
      <style jsx global>{`
        .ProseMirror-selectednode,
        .ProseMirror-selectednode * {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }
        .bn-block-content img,
        .bn-image-block img {
          user-select: none !important;
          -webkit-user-drag: none !important;
          pointer-events: auto !important;
        }
        .bn-image-toolbar,
        .bn-file-toolbar,
        .bn-popover,
        [data-node-view-wrapper] .bn-image-menu,
        button[aria-label*="Download"],
        button[aria-label*="Image"] {
          display: none !important;
        }
      `}</style>

      <BlockNoteView editor={editor} theme="light" editable={false} />
    </div>
  );
}
