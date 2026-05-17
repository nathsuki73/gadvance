"use client";

import React from "react";

type VideoBlockMetadata = {
  title?: string;

  description?: string;
};

type VideoDisplayBlockProps = {
  content?: string | null;

  metadata?: VideoBlockMetadata;
};

const getEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);

    const host = parsed.hostname.replace("www.", "");

    /*
    |--------------------------------------------------------------------------
    | YOUTUBE
    |--------------------------------------------------------------------------
    */

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");

      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    /*
    |--------------------------------------------------------------------------
    | VIMEO
    |--------------------------------------------------------------------------
    */

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.replace("/", "");

      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    /*
    |--------------------------------------------------------------------------
    | DIRECT VIDEO FILE
    |--------------------------------------------------------------------------
    */

    if (url.endsWith(".mp4") || url.endsWith(".webm") || url.endsWith(".ogg")) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
};

const VideoDisplayBlock = ({ content, metadata }: VideoDisplayBlockProps) => {
  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  if (!content || content.trim() === "") {
    return (
      <div
        className="border border-dashed
          border-zinc-300 bg-white p-44
          text-center
        "
      >
        <span className="text-sm text-zinc-400">No video provided</span>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(content);

  const isDirectVideo =
    content.endsWith(".mp4") ||
    content.endsWith(".webm") ||
    content.endsWith(".ogg");

  return (
    <article
      className="
        overflow-hidden
        
        bg-white py-12 px-4 sm:px-8 lg:px-20 xl:px-32
      "
    >
      {/* HEADER */}
      {(metadata?.title || metadata?.description) && (
        <div
          className="
            border-b border-zinc-200
            px-5 py-5
            sm:px-6
          "
        >
          {metadata?.title && (
            <h3
              className="
                text-xl font-bold
                tracking-tight
                text-zinc-900
              "
            >
              {metadata.title}
            </h3>
          )}

          {metadata?.description && (
            <p
              className="
                mt-2 leading-7
                text-zinc-600
              "
            >
              {metadata.description}
            </p>
          )}
        </div>
      )}

      {/* VIDEO */}
      <div className="bg-black">
        {embedUrl ? (
          isDirectVideo ? (
            <video controls className="aspect-video w-full">
              <source src={embedUrl} />
            </video>
          ) : (
            <iframe
              src={embedUrl}
              title={metadata?.title ?? "Learning video"}
              className="aspect-video w-full"
              allow="
                accelerometer;
                autoplay;
                clipboard-write;
                encrypted-media;
                gyroscope;
                picture-in-picture;
                web-share
              "
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          )
        ) : (
          <div
            className="
              flex aspect-video
              items-center justify-center
              bg-zinc-100
              p-6 text-center
            "
          >
            <div>
              <p className="text-sm text-zinc-500">Unsupported video URL</p>

              <a
                href={content}
                target="_blank"
                rel="noreferrer"
                className="
                  mt-4 inline-flex
                  border border-zinc-300
                  px-4 py-2 text-sm
                  font-medium text-zinc-700
                  transition hover:bg-zinc-200
                "
              >
                Open Video
              </a>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default VideoDisplayBlock;
