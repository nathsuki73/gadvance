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
 * Deep sanitization ensuring every single block matches valid structures.
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

      // Handle table blocks natively preserving columns/rows
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

function sanitizeCellContent(cell: any): any {
  if (!cell || typeof cell !== "object") {
    return {
      type: "tableCell",
      content: [],
      props: {
        colspan: 1,
        rowspan: 1,
        backgroundColor: "default",
        textColor: "default",
        textAlignment: "left",
      },
    };
  }

  if (cell.type === "tableCell") {
    return {
      type: "tableCell",
      content: sanitizeContent(cell.content),
      props:
        cell.props && typeof cell.props === "object"
          ? cell.props
          : {
              colspan: 1,
              rowspan: 1,
              backgroundColor: "default",
              textColor: "default",
              textAlignment: "left",
            },
    };
  }

  let inlineContent = [];
  if (Array.isArray(cell.content)) {
    inlineContent = sanitizeContent(cell.content);
  } else if (Array.isArray(cell)) {
    inlineContent = sanitizeContent(cell);
  } else if (cell.text !== undefined) {
    inlineContent = sanitizeContent([cell]);
  } else if (typeof cell === "string") {
    inlineContent =
      cell.trim().length > 0 ? [{ type: "text", text: cell, styles: {} }] : [];
  }

  return {
    type: "tableCell",
    content: inlineContent,
    props:
      cell.props && typeof cell.props === "object"
        ? cell.props
        : {
            colspan: 1,
            rowspan: 1,
            backgroundColor: "default",
            textColor: "default",
            textAlignment: "left",
          },
  };
}

function sanitizeTableContent(content: any): any {
  const emptyTable = {
    type: "tableContent",
    columnWidths: [null, null],
    rows: [{ cells: [sanitizeCellContent([]), sanitizeCellContent([])] }],
  };

  if (!content || typeof content !== "object") return emptyTable;

  const columnWidths = Array.isArray(content.columnWidths)
    ? content.columnWidths
    : [null, null];
  const rows = Array.isArray(content.rows)
    ? content.rows
    : Array.isArray(content)
      ? content
      : null;

  if (!rows) return emptyTable;

  return {
    type: "tableContent",
    columnWidths,
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

        .bn-block-content[data-content-type="paragraph"] {
          text-align: justify !important;
        }
        .bn-block-content[data-content-type="paragraph"] .bn-inline-content {
          text-align: justify !important;
        }

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
