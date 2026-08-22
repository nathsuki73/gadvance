"use client";

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import React, { useState } from "react";
import { Link as LinkIcon, Info, X, ShieldCheck } from "lucide-react";

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
      const imageUrl = props.block.props.url;
      const configuredWidth = props.block.props.width || "100%";

      if (!imageUrl) return null;

      return (
        <div className="w-full my-4 flex flex-col items-center">
          {/* 💡 On mobile (< 640px), force w-full so it never shrinks. On sm+ screens, use configured width. */}
          <div
            style={{ "--custom-width": configuredWidth } as React.CSSProperties}
            className="w-full sm:w-[var(--custom-width)] relative group flex flex-col gap-1.5 transition-all duration-200 max-w-full"
          >
            {/* Image Box Container */}
            <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 flex items-center justify-center w-full">
              <img
                src={imageUrl}
                alt={props.block.props.title || "Learning module illustration"}
                className="w-full h-auto object-contain block"
              />

              {/* Source Info Button Overlay */}
              <div
                className="absolute bottom-3 right-3 z-20"
                contentEditable={false}
              >
                <button
                  type="button"
                  onClick={() => setShowPopover(!showPopover)}
                  className="flex items-center gap-1 rounded-full bg-zinc-900/80 hover:bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all shadow-md cursor-pointer"
                  title="View TASL Attribution"
                >
                  <Info size={14} className="text-purple-400" />
                  <span>Source</span>
                </button>

                {/* Responsive Popover Card */}
                {showPopover && (
                  <div className="absolute right-0 bottom-10 z-30 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl text-zinc-800 w-[260px] sm:w-[300px] max-w-[calc(100vw-2rem)]">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        TASL Attribution
                      </span>
                      <button
                        onClick={() => setShowPopover(false)}
                        className="text-zinc-400 hover:text-zinc-700 cursor-pointer p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-semibold text-zinc-800 leading-snug">
                          {props.block.props.title || "Untitled Graphic"}
                        </span>
                        {props.block.props.author && (
                          <span className="text-zinc-500">
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
                            <span className="truncate">
                              {props.block.props.sourceName ||
                                "Original Source"}
                            </span>
                          </a>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">
                            No source link provided.
                          </span>
                        )}

                        {props.block.props.license && (
                          <div className="inline-flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium px-1">
                            <ShieldCheck
                              size={14}
                              className="text-emerald-600 shrink-0"
                            />
                            <span className="break-words">
                              License: {props.block.props.license}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
);
