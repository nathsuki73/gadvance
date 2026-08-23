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

      // 💡 Handle table blocks — must come before the generic fallback,
      // since a table's `content` is a { type: "tableContent", rows } object,
      // not a flat inline-content array.
      if (type === "table") {
        return {
          id: typeof block.id === "string" ? block.id : undefined,
          type: "table",
          props: safeProps,
          content: sanitizeTableContent(block.content),
          children: [],
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
    const sanitized = content.map(sanitizeInlineItem).filter(Boolean);
    return repairBoundarySpacing(sanitized);
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

// 💡 Repair spaces lost between adjacent inline nodes (e.g. bold/plain runs
// split during import) so words don't get glued together on render.
function repairBoundarySpacing(items: any[]): any[] {
  const isWordChar = (c: string) => /[A-Za-z0-9À-ÖØ-öø-ÿ]/.test(c);

  const getLastChar = (item: any): string => {
    if (!item) return "";
    if (item.type === "link") {
      const nested = Array.isArray(item.content) ? item.content : [];
      for (let i = nested.length - 1; i >= 0; i--) {
        const c = getLastChar(nested[i]);
        if (c) return c;
      }
      return "";
    }
    const text = typeof item.text === "string" ? item.text : "";
    return text.length > 0 ? text[text.length - 1] : "";
  };

  const getFirstChar = (item: any): string => {
    if (!item) return "";
    if (item.type === "link") {
      const nested = Array.isArray(item.content) ? item.content : [];
      for (let i = 0; i < nested.length; i++) {
        const c = getFirstChar(nested[i]);
        if (c) return c;
      }
      return "";
    }
    const text = typeof item.text === "string" ? item.text : "";
    return text.length > 0 ? text[0] : "";
  };

  const appendSpaceToLast = (item: any) => {
    if (item.type === "link") {
      const nested = Array.isArray(item.content) ? item.content : [];
      for (let i = nested.length - 1; i >= 0; i--) {
        if (getLastChar(nested[i])) {
          appendSpaceToLast(nested[i]);
          return;
        }
      }
      return;
    }
    if (typeof item.text === "string") {
      item.text = item.text + " ";
    }
  };

  for (let i = 0; i < items.length - 1; i++) {
    const lastChar = getLastChar(items[i]);
    const firstChar = getFirstChar(items[i + 1]);

    const needsSpace =
      lastChar &&
      firstChar &&
      !/\s/.test(lastChar) &&
      !/\s/.test(firstChar) &&
      isWordChar(lastChar) &&
      isWordChar(firstChar);

    if (needsSpace) {
      appendSpaceToLast(items[i]);
    }
  }

  return items;
}

// 💡 Table sanitization — mirrors the shape BlockNote expects for
// `tableContent`: { type: "tableContent", rows: [{ cells: [...] }] }
function sanitizeCellContent(cell: any): any[] {
  let items: any[];

  if (typeof cell === "string") {
    return cell.trim().length > 0
      ? [{ type: "text", text: cell, styles: {} }]
      : [];
  }

  if (Array.isArray(cell)) {
    items = cell.map(sanitizeInlineItem).filter(Boolean);
  } else if (cell && typeof cell === "object") {
    if (cell.text !== undefined) {
      items = [sanitizeInlineItem(cell)].filter(Boolean);
    } else if (Array.isArray(cell.content)) {
      items = cell.content.map(sanitizeInlineItem).filter(Boolean);
    } else {
      return [];
    }
  } else {
    return [];
  }

  return repairBoundarySpacing(items);
}

function sanitizeTableContent(content: any): any {
  const emptyTable = { type: "tableContent", rows: [{ cells: [[]] }] };

  if (!content || typeof content !== "object") return emptyTable;

  const rows = Array.isArray(content.rows)
    ? content.rows
    : Array.isArray(content)
      ? content
      : null;

  if (!rows) return emptyTable;

  return {
    type: "tableContent",
    columnWidths: content.columnWidths,
    headerRows: content.headerRows,
    headerCols: content.headerCols,
    rows: rows.map((row: any) => {
      const cells = Array.isArray(row?.cells)
        ? row.cells
        : Array.isArray(row)
          ? row
          : [];
      return {
        cells: cells.map((cell: any) => sanitizeCellContent(cell)),
      };
    }),
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

        /* Justify all paragraph text, but leave headings (titles) as authored */
        .bn-block-content[data-content-type="paragraph"] {
          text-align: justify !important;
        }
        .bn-block-content[data-content-type="paragraph"] .bn-inline-content {
          text-align: justify !important;
        }

        /* Explicitly re-assert center alignment on headings so it can't be overridden */
        .bn-block-content[data-content-type="heading"] {
          text-align: center !important;
        }
        .bn-block-content[data-content-type="heading"] .bn-inline-content {
          text-align: center !important;
        }
      `}</style>

      <BlockNoteView editor={editor} theme="light" editable={false} />
    </div>
  );
}
