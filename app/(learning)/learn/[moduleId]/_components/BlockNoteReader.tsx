"use client";

import React, { useEffect, useMemo, useRef } from "react";
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
 * Safely sanitizes blocks for read-only view
 */
function sanitizeBlocks(blocks: any[]): any[] {
  if (!Array.isArray(blocks)) return [];

  return blocks.flatMap((block) => {
    if (!block || typeof block !== "object") return [];

    const type = typeof block.type === "string" ? block.type : "paragraph";

    // Safely convert legacy table structures into paragraphs
    if (type === "table") {
      const rows = block.content?.rows || [];
      const flattenedParagraphs: any[] = [];

      for (const row of rows) {
        const cellTexts = (row.cells || [])
          .map((cell: any) => {
            if (Array.isArray(cell.content)) {
              return cell.content
                .map((c: any) => (c && c.text ? c.text : ""))
                .join("");
            }
            return "";
          })
          .filter(Boolean);

        if (cellTexts.length > 0) {
          flattenedParagraphs.push({
            type: "paragraph",
            props: {
              textAlignment: "left",
              backgroundColor: "default",
              textColor: "default",
            },
            content: [
              { type: "text", text: cellTexts.join(" | "), styles: {} },
            ],
            children: [],
          });
        }
      }

      if (flattenedParagraphs.length > 0) {
        return flattenedParagraphs;
      }

      return [
        {
          type: "paragraph",
          props: {
            textAlignment: "left",
            backgroundColor: "default",
            textColor: "default",
          },
          content: [{ type: "text", text: "[Table Content]", styles: {} }],
          children: [],
        },
      ];
    }

    // Allow void/media blocks like youtube, licensedImage, and image to pass through safely
    if (
      type === "youtube" ||
      type === "licensedImage" ||
      type === "image" ||
      type === "divider"
    ) {
      const children = Array.isArray(block.children)
        ? sanitizeBlocks(block.children)
        : [];
      return [
        {
          id: typeof block.id === "string" ? block.id : undefined,
          type,
          props:
            block.props && typeof block.props === "object" ? block.props : {},
          children,
        },
      ];
    }

    // Standard block sanitization
    const sanitizedContent = sanitizeContent(block.content);
    const children = Array.isArray(block.children)
      ? sanitizeBlocks(block.children)
      : [];

    return [
      {
        id: typeof block.id === "string" ? block.id : undefined,
        type,
        props:
          block.props && typeof block.props === "object" ? block.props : {},
        content: sanitizedContent,
        children,
      },
    ];
  });
}

function sanitizeContent(content: any): any[] {
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (typeof item === "string")
        return { type: "text", text: item, styles: {} };
      if (item && typeof item === "object") {
        return {
          type: typeof item.type === "string" ? item.type : "text",
          text:
            item.text === null || item.text === undefined
              ? ""
              : String(item.text),
          styles:
            item.styles && typeof item.styles === "object" ? item.styles : {},
          href: typeof item.href === "string" ? item.href : undefined,
        };
      }
      return { type: "text", text: "", styles: {} };
    });
  }
  if (typeof content === "string")
    return [{ type: "text", text: content, styles: {} }];
  return [];
}

interface BlockNoteReaderProps {
  initialContent?: any[];
}

export default function BlockNoteReader({
  initialContent,
}: BlockNoteReaderProps) {
  const schema = useMemo(() => getCustomSchema(), []);
  const isInitializedRef = useRef<boolean>(false);

  const editor = useCreateBlockNote({
    schema,
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
  });

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
        console.warn(
          "BlockNoteReader: Failed to parse initial content blocks:",
          err,
        );
      }
    }
  }, [editor, initialContent]);

  return (
    <div className="w-full border-zinc-200/85 bg-white shadow-2xs overflow-x-auto">
      {/* 💡 Global styles to eliminate blue selection borders and hide image download toolbars */}
      <style jsx global>{`
        /* Remove node selection outlines across all BlockNote viewer blocks */
        .ProseMirror-selectednode,
        .ProseMirror-selectednode * {
          outline: none !important;
          box-shadow: none !important;
          border-color: transparent !important;
        }

        /* Prevent text highlighting or element dragging on images */
        .bn-block-content img,
        .bn-image-block img {
          user-select: none !important;
          -webkit-user-drag: none !important;
          pointer-events: auto !important;
        }

        /* Hide BlockNote's default floating image formatting menus, file action buttons, and download triggers in read mode */
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
