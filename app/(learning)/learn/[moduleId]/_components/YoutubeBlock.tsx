"use client";

import { defaultProps } from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";
import React, { useState } from "react";
import { Play, Video, Settings, Check } from "lucide-react";

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/,
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

export const createYouTubeBlock = createReactBlockSpec(
  {
    type: "youtube",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      url: { default: "" },
      height: { default: 360 },
      width: { default: "100%" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const [inputUrl, setInputUrl] = useState(props.block.props.url);
      const [showSettings, setShowSettings] = useState(false);

      const currentHeight = Math.min(
        720,
        Math.max(180, props.block.props.height || 360),
      );
      const [customHeight, setCustomHeight] = useState(currentHeight);

      const embedUrl = getYouTubeEmbedUrl(props.block.props.url);
      const isEditable = props.editor.isEditable;

      const handleSaveUrl = (e: React.FormEvent) => {
        e.preventDefault();
        const validEmbed = getYouTubeEmbedUrl(inputUrl);
        if (validEmbed) {
          props.editor.updateBlock(props.block, {
            type: "youtube",
            props: { url: inputUrl },
          });
        } else {
          alert("Please enter a valid YouTube URL.");
        }
      };

      const handleUpdateHeight = (newHeight: number) => {
        const clampedHeight = Math.min(720, Math.max(180, newHeight));
        setCustomHeight(clampedHeight);
        props.editor.updateBlock(props.block, {
          type: "youtube",
          props: { height: clampedHeight },
        });
      };

      const handleUpdateWidth = (newWidth: string) => {
        props.editor.updateBlock(props.block, {
          type: "youtube",
          props: { width: newWidth },
        });
      };

      if (!embedUrl && !isEditable) {
        return null;
      }

      if (!embedUrl) {
        return (
          <div className="w-full my-4 py-2 flex items-center justify-center">
            <form
              onSubmit={handleSaveUrl}
              contentEditable={false}
              className="flex w-full items-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 shadow-xs"
            >
              <Video size={18} className="text-purple-600 shrink-0 ml-1" />
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="Paste YouTube video URL..."
                className="flex-1 bg-transparent text-xs text-zinc-800 outline-none placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 transition-colors cursor-pointer"
              >
                <Play size={12} />
                <span>Embed</span>
              </button>
            </form>
          </div>
        );
      }

      return (
        <div className="w-full py-3 my-2 flex flex-col items-center">
          <div
            style={{
              height: `${currentHeight}px`,
              width: props.block.props.width || "100%",
            }}
            className="relative group max-w-full rounded-2xl border border-zinc-200 shadow-xs bg-black transition-all duration-200"
          >
            {isEditable && (
              <div
                contentEditable={false}
                className="absolute top-3 right-3 z-50 flex items-center gap-1 rounded-xl bg-zinc-900/90 p-1 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => setShowSettings(!showSettings)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
                >
                  <Settings size={14} />
                  <span>
                    {props.block.props.width || "100%"} × {currentHeight}px
                  </span>
                </button>

                {showSettings && (
                  <div className="absolute right-0 top-10 z-50 flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-3 shadow-xl text-zinc-800 min-w-[200px]">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Container Width
                      </span>
                      <div className="flex items-center gap-1">
                        {["100%", "75%", "50%"].map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => handleUpdateWidth(w)}
                            className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-colors cursor-pointer ${
                              (props.block.props.width || "100%") === w
                                ? "bg-purple-600 text-white"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 border-t border-zinc-100 pt-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Video Height
                      </span>
                      <div className="flex items-center gap-1">
                        {[240, 360, 480, 600].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              handleUpdateHeight(h);
                              setShowSettings(false);
                            }}
                            className={`flex-1 rounded-lg py-1 text-xs font-semibold transition-colors cursor-pointer ${
                              currentHeight === h
                                ? "bg-purple-600 text-white"
                                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="number"
                          min={180}
                          max={720}
                          value={customHeight}
                          onChange={(e) =>
                            setCustomHeight(Number(e.target.value))
                          }
                          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs outline-none focus:border-purple-600"
                          placeholder="Height (px)"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateHeight(customHeight);
                            setShowSettings(false);
                          }}
                          className="rounded-lg bg-purple-600 p-1 text-white hover:bg-purple-700 cursor-pointer shrink-0"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="w-full h-full rounded-2xl overflow-hidden">
              <iframe
                src={embedUrl}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      );
    },
  },
);
