"use client";

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import React, { useState } from "react";
import {
  Link as LinkIcon,
  Info,
  X,
  ShieldCheck,
  Maximize2,
} from "lucide-react";

export const createLicensedImageBlockReader = createReactBlockSpec(
  {
    type: "licensedImage",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      url: { default: "" },
      title: { default: "" }, // T - Title
      author: { default: "" }, // A - Author
      sourceName: { default: "" }, // S - Source Name
      sourceUrl: { default: "" }, // S - Source Link URL
      license: { default: "" }, // L - License type
      width: { default: "100%" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const [showPopover, setShowPopover] = useState(false);
      const [isFullscreen, setIsFullscreen] = useState(false);
      const imageUrl = props.block.props.url;
      const configuredWidth = props.block.props.width || "100%";

      if (!imageUrl) return null;

      // Reusable attribution content block to keep code clean
      const renderAttributionContent = () => (
        <>
          <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              TASL Attribution
            </span>
            <button
              onClick={() => setShowPopover(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-1 rounded-lg hover:bg-zinc-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col gap-1 text-xs">
              <span className="font-semibold text-zinc-800 leading-snug break-words">
                {props.block.props.title || "Untitled Graphic"}
              </span>
              {props.block.props.author && (
                <span className="text-zinc-500 break-words">
                  By{" "}
                  <strong className="text-zinc-700">
                    {props.block.props.author}
                  </strong>
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-1 border-t border-zinc-100">
              {props.block.props.sourceUrl ? (
                <a
                  href={props.block.props.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 px-3 py-2 text-xs text-purple-700 font-semibold transition-colors break-all"
                >
                  <LinkIcon size={13} className="shrink-0" />
                  <span className="line-clamp-1">
                    {props.block.props.sourceName ||
                      props.block.props.sourceUrl}
                  </span>
                </a>
              ) : (
                <span className="text-xs text-zinc-400 italic">
                  No source link provided.
                </span>
              )}

              {props.block.props.license && (
                <div className="inline-flex items-start gap-1.5 text-[11px] text-zinc-500 font-medium px-1">
                  <ShieldCheck
                    size={14}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />
                  <span className="break-words">
                    License: {props.block.props.license}
                  </span>
                </div>
              )}
            </div>
          </div>
        </>
      );

      return (
        <div className="w-full my-4 flex flex-col items-center select-none focus:outline-none">
          {/* Global style override to eliminate blue selection outlines */}
          <style jsx global>{`
            .ProseMirror-selectednode [data-block-type="licensedImage"],
            .ProseMirror-selectednode:has(div[data-licensed-image-wrapper]) {
              outline: none !important;
              box-shadow: none !important;
              border: none !important;
            }
          `}</style>

          <div
            data-licensed-image-wrapper="true"
            style={{ "--custom-width": configuredWidth } as React.CSSProperties}
            className="w-full sm:w-[var(--custom-width)] relative group flex flex-col gap-1.5 transition-all duration-200 max-w-full outline-none focus:outline-none"
            tabIndex={-1}
          >
            {/* Image Box Container */}
            <div
              onClick={() => setIsFullscreen(true)}
              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 flex items-center justify-center w-full cursor-zoom-in group/img"
              title="Click to view full screen"
            >
              <img
                src={imageUrl}
                alt={props.block.props.title || "Learning module illustration"}
                className="w-full h-auto object-contain block pointer-events-auto select-none transition-transform duration-200 group-hover/img:scale-[1.01]"
                draggable={false}
              />

              {/* Hover Hint for Fullscreen */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="flex items-center gap-1.5 rounded-full bg-zinc-900/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md shadow-md">
                  <Maximize2 size={13} />
                  <span>Click to expand</span>
                </span>
              </div>

              {/* Source Info Button Overlay */}
              <div
                className="absolute bottom-3 right-3 z-20"
                contentEditable={false}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setShowPopover(!showPopover)}
                  className="flex items-center gap-1 rounded-full bg-zinc-900/80 hover:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all shadow-md cursor-pointer select-none"
                  title="View TASL Attribution"
                >
                  <Info size={14} className="text-purple-400" />
                  <span>Source</span>
                </button>
              </div>
            </div>

            {/* POPOVER: Mobile Fullscreen Overlay vs Desktop Dropdown */}
            {showPopover && (
              <>
                {/* Mobile: Gray transparent dark overlay covering screen, clicking outside closes it */}
                <div
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:hidden animate-in fade-in duration-150"
                  onClick={() => setShowPopover(false)}
                >
                  <div
                    className="w-full max-w-xs flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl text-zinc-800 text-left"
                    onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside the card
                  >
                    {renderAttributionContent()}
                  </div>
                </div>

                {/* Desktop: Standard absolute dropdown */}
                <div
                  className="hidden sm:flex absolute right-0 bottom-12 z-50 flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-2xl text-zinc-800 w-[320px] text-left animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {renderAttributionContent()}
                </div>
              </>
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
                    alt={props.block.props.title || "Full screen view"}
                    className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
                  />
                  {props.block.props.title && (
                    <span className="text-xs sm:text-sm font-medium text-zinc-300 text-center px-4 break-words max-w-xl">
                      {props.block.props.title}{" "}
                      {props.block.props.author
                        ? `— By ${props.block.props.author}`
                        : ""}
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
