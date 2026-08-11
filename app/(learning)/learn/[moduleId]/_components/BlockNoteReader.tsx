"use client";

import React, { useEffect, useMemo } from "react";
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

let customSchemaInstance: any = null;

function getCustomSchema() {
  if (!customSchemaInstance) {
    customSchemaInstance = withMultiColumn(
      BlockNoteSchema.create({
        blockSpecs: {
          ...defaultBlockSpecs,
          youtube: createYouTubeBlock(),
        },
      }),
    );
  }
  return customSchemaInstance;
}

function cleanBlockForSchema(block: any): any {
  if (!block || typeof block !== "object") return null;

  const type = block.type || "paragraph";
  const cleaned: any = {
    type,
    props: block.props || {},
  };

  if (block.id) {
    cleaned.id = block.id;
  }

  if (type === "table") {
    if (block.content) {
      cleaned.content = block.content;
    }
  } else {
    const noContentBlockTypes = [
      "image",
      "youtube",
      "video",
      "audio",
      "file",
      "columnList",
      "column",
    ];

    if (!noContentBlockTypes.includes(type)) {
      if (Array.isArray(block.content)) {
        cleaned.content = block.content.map((item: any) => {
          if (typeof item === "string") {
            return { type: "text", text: item, styles: {} };
          }
          return item;
        });
      } else if (typeof block.content === "string") {
        cleaned.content = [{ type: "text", text: block.content, styles: {} }];
      } else {
        cleaned.content = [];
      }
    }
  }

  if (Array.isArray(block.children) && block.children.length > 0) {
    const cleanedChildren = block.children
      .map(cleanBlockForSchema)
      .filter(Boolean);
    if (cleanedChildren.length > 0) {
      cleaned.children = cleanedChildren;
    }
  }

  return cleaned;
}

interface BlockNoteReaderProps {
  initialContent?: any[];
}

export default function BlockNoteReader({
  initialContent,
}: BlockNoteReaderProps) {
  const schema = useMemo(() => getCustomSchema(), []);

  const editor = useCreateBlockNote({
    schema,
    dropCursor: multiColumnDropCursor,
    dictionary: {
      ...locales.en,
      multi_column: multiColumnLocales.en,
    },
  });

  useEffect(() => {
    if (
      !editor ||
      !Array.isArray(initialContent) ||
      initialContent.length === 0
    ) {
      return;
    }

    try {
      const sanitized = initialContent.map(cleanBlockForSchema).filter(Boolean);
      if (sanitized.length > 0) {
        editor.replaceBlocks(editor.document, sanitized);
      }
    } catch (err) {
      console.warn(
        "BlockNoteReader: Failed to parse initial content blocks:",
        err,
      );
    }
  }, [editor, initialContent]);

  return (
    <div className="w-full   border-zinc-200/80 bg-white  shadow-2xs overflow-x-auto">
      <BlockNoteView editor={editor} theme="light" editable={false} />
    </div>
  );
}
