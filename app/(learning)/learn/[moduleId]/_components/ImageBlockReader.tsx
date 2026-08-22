"use client";

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import React, { useState } from "react";
import { Maximize2, X } from "lucide-react";

export const createImageBlockReader = createReactBlockSpec(
  {
    type: "image",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      url: { default: "" },
      caption: { default: "" },
      showPreview: { default: true },
      previewWidth: { default: "100%" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const [isFullscreen, setIsFullscreen] = useState(false);
      const imageUrl = props.block.props.url;
      const caption = props.block.props.caption;
      const configuredWidth = props.block.props.previewWidth || "100%";

      if (!imageUrl) return null;

      // Handle cases where previewWidth might be a number or string percentage/pixel
      const widthStyle =
        typeof configuredWidth === "number"
          ? `${configuredWidth}px`
          : configuredWidth;

      return (
        <div className="w-full my-4 flex flex-col items-center select-none focus:outline-none">
          {/* Global style override to remove blue selection outlines */}
          <style jsx global>{`
            .ProseMirror-selectednode [data-block-type="image"],
            .ProseMirror-selectednode:has(div[data-standard-image-wrapper]) {
              outline: none !important;
              box-shadow: none !important;
              border: none !important;
            }
          `}</style>

          <div
            data-standard-image-wrapper="true"
            style={{ "--custom-width": widthStyle } as React.CSSProperties}
            className="w-full sm:w-[var(--custom-width)] relative group flex flex-col gap-1.5 transition-all duration-200 max-w-full outline-none focus:outline-none"
            tabIndex={-1}
          >
            {/* Image Container */}
            <div
              onClick={() => setIsFullscreen(true)}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 flex items-center justify-center w-full cursor-zoom-in group/img"
              title="Click to view full screen"
            >
              <img
                src={imageUrl}
                alt={caption || "Module image"}
                className="w-full h-auto object-contain block pointer-events-auto select-none transition-transform duration-200 group-hover/img:scale-[1.01]"
                draggable={false}
              />

              {/* Hover Hint */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="flex items-center gap-1.5 rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md">
                  <Maximize2 size={13} />
                  <span>Click to expand</span>
                </span>
              </div>
            </div>

            {/* Optional Caption */}
            {caption && (
              <span className="px-1 text-xs font-medium text-zinc-600 text-center">
                {caption}
              </span>
            )}

            {/* FULL-SCREEN OVERLAY MODAL */}
            {isFullscreen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm animate-in fade-in duration-200 select-none"
                onClick={() => setIsFullscreen(false)}
              >
                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Close Fullscreen"
                >
                  <X size={20} />
                </button>

                {/* Expanded Image Container */}
                <div
                  className="relative max-h-[90vh] max-w-[90vw] flex flex-col items-center gap-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={imageUrl}
                    alt={caption || "Full screen view"}
                    className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
                  />
                  {caption && (
                    <span className="text-xs sm:text-sm font-medium text-zinc-300 text-center px-4">
                      {caption}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    },
  },
);
