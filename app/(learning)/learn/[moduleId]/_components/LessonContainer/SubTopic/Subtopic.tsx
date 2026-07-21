import Image from "next/image";
import ReactMarkdown from "react-markdown";
import SubtopicSkeleton from "./SubtopicSkeleton";

export type SubtopicItem = {
  id: string;
  lesson_block_id: string;
  content_order: number;
  body_text: string;
  media_type: "text" | "image" | "video" | string;
  media_url: string | null;
  created_at: string;
  updated_at: string;
};

interface SubtopicProps {
  subtopics?: SubtopicItem[] | Record<string, SubtopicItem[]>;
}

// Converts YouTube links to embed format
function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const regExp =
    /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);

  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}`
    : url;
}

// Extracts # H1 Title and the remaining body description separately
function parseMarkdownContent(rawText: string) {
  if (!rawText) return { h1Title: null, description: "" };

  const lines = rawText.split("\n");
  const firstLine = lines[0].trim();

  // If the first line starts with a single '# ', treat it as the top section header
  if (firstLine.startsWith("# ")) {
    const h1Title = firstLine.replace(/^#\s+/, "").trim();
    const description = lines.slice(1).join("\n").trim();
    return { h1Title, description };
  }

  // If no # header, all text goes below
  return { h1Title: null, description: rawText };
}

export default function Subtopic({ subtopics }: SubtopicProps) {
  const subtopicsArray = (() => {
    if (!subtopics) return [];
    if (Array.isArray(subtopics)) return subtopics;
    return Object.values(subtopics).flat();
  })();

  if (subtopicsArray.length === 0) {
    return <SubtopicSkeleton />;
  }

  const sortedSubtopics = [...subtopicsArray].sort(
    (a, b) => a.content_order - b.content_order,
  );

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-10">
      {sortedSubtopics.map((item) => {
        // Clean text and extract # H1 Title vs remaining description
        const rawText = item.body_text?.trim() || "";
        const { h1Title, description } = parseMarkdownContent(rawText);

        const isQuote =
          description.startsWith("“") || description.startsWith('"');

        // Extract clean video URL even if glued to text in body_text
        let cleanMediaUrl = item.media_url;
        if (!cleanMediaUrl && rawText.includes("http")) {
          const match = rawText.match(/https?:\/\/[^\s]+/);
          if (match) cleanMediaUrl = match[0];
        }

        const isVideo =
          item.media_type === "video" ||
          (cleanMediaUrl &&
            (cleanMediaUrl.includes("youtube.com") ||
              cleanMediaUrl.includes("youtu.be")));

        const videoEmbedUrl = isVideo
          ? getYouTubeEmbedUrl(cleanMediaUrl)
          : null;

        return (
          <article
            key={item.id}
            className="w-full space-y-6 pb-8 border-b border-zinc-100/60 last:border-none last:pb-0"
          >
            {/* 1. TOP: Title (if # Title was provided) */}
            {h1Title && (
              <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight pb-2 border-b border-zinc-100/80">
                {h1Title}
              </h1>
            )}

            {/* 2. MIDDLE: Image or Video Media */}
            {cleanMediaUrl && item.media_type === "image" && !isVideo && (
              <figure className="my-4 rounded-2xl overflow-hidden border border-zinc-100 shadow-xs relative aspect-video w-full bg-zinc-50 group">
                <Image
                  src={cleanMediaUrl}
                  alt="Lesson visual aid"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </figure>
            )}

            {videoEmbedUrl && isVideo && (
              <div className="my-4 space-y-2">
                <figure className="rounded-2xl overflow-hidden border border-zinc-100 shadow-xs relative aspect-video w-full bg-zinc-900">
                  <iframe
                    src={videoEmbedUrl}
                    title={h1Title || "Lesson video content"}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </figure>
                <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-100 text-xs text-zinc-500">
                  <span>
                    If video fails to play inline due to owner restrictions:
                  </span>
                  <a
                    href={cleanMediaUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:text-indigo-700 underline flex items-center gap-1"
                  >
                    Watch directly on YouTube ↗
                  </a>
                </div>
              </div>
            )}

            {/* 3. BOTTOM: Remaining Markdown Description */}
            {description && (
              <div className="w-full">
                {isQuote ? (
                  <blockquote className="border-l-2 border-indigo-200 bg-indigo-50/20 p-5 rounded-r-xl my-4">
                    <p className="text-zinc-800 font-medium italic text-lg leading-relaxed m-0">
                      {description}
                    </p>
                  </blockquote>
                ) : (
                  <ReactMarkdown
                    components={{
                      hr: () => (
                        <div className="my-8 h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-200/50 to-transparent" />
                      ),
                      h2: ({ node, ...props }) => (
                        <h2
                          className="text-xl sm:text-2xl font-bold text-zinc-800 tracking-tight mt-6 mb-3 pl-3 border-l-2 border-indigo-200"
                          {...props}
                        />
                      ),
                      h3: ({ node, ...props }) => (
                        <h3
                          className="text-lg sm:text-xl font-semibold text-zinc-800 tracking-tight mt-5 mb-2"
                          {...props}
                        />
                      ),
                      p: ({ node, ...props }) => (
                        <p
                          className="text-zinc-600 text-base sm:text-lg leading-relaxed mb-4"
                          {...props}
                        />
                      ),
                      ul: ({ node, ...props }) => (
                        <ul
                          className="space-y-2.5 my-4 pl-1 list-none"
                          {...props}
                        />
                      ),
                      li: ({ node, children, ...props }) => (
                        <li
                          className="flex items-start gap-3 text-zinc-700 text-base leading-relaxed bg-zinc-50/40 p-3 rounded-lg border border-zinc-100/60 transition-colors hover:bg-indigo-50/20"
                          {...props}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-300 mt-2.5" />
                          <span className="flex-1">{children}</span>
                        </li>
                      ),
                      code: ({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) => (
                        <code
                          className="bg-zinc-50 text-indigo-600 font-mono text-sm px-1.5 py-0.5 rounded border border-zinc-200/50"
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                    }}
                  >
                    {description}
                  </ReactMarkdown>
                )}
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
