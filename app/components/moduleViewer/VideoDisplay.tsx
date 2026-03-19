import React from "react";

type VideoDisplayProps = {
  title?: string;
  url: string;
  description?: string;
};

const getEmbedUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const videoId = parsed.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (host === "vimeo.com") {
      const videoId = parsed.pathname.replace("/", "");
      return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
    }

    return null;
  } catch {
    return null;
  }
};

const VideoDisplay = ({ title, url, description }: VideoDisplayProps) => {
  const embedUrl = getEmbedUrl(url);

  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
      {title ? (
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
      ) : null}

      {description ? (
        <p className="mt-2 text-sm text-zinc-600">{description}</p>
      ) : null}

      {embedUrl ? (
        <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
          <iframe
            src={embedUrl}
            title={title ?? "Learning video"}
            className="aspect-video w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex rounded-lg border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
        >
          Open video
        </a>
      )}
    </article>
  );
};

export default VideoDisplay;
