"use client";

import Image from "next/image";

type ImageTextMetadata = {
  title?: string;

  image_alt?: string;

  image_position?: "left" | "right";
};

type ImageTextBlockProps = {
  content?: string | null;

  metadata?: ImageTextMetadata;
};

const ImageTextBlock = ({ content, metadata }: ImageTextBlockProps) => {
  /*
  |--------------------------------------------------------------------------
  | PARSE CONTENT
  |--------------------------------------------------------------------------
  |
  | content format:
  |
  | imageUrl|||paragraph
  |
  */

  const [imageUrl = "", paragraph = ""] = content?.split("|||") ?? [];

  /*
  |--------------------------------------------------------------------------
  | CONFIG
  |--------------------------------------------------------------------------
  */

  const title = metadata?.title;

  const imageAlt = metadata?.image_alt ?? "Image";

  const imagePosition = metadata?.image_position ?? "left";

  const isRight = imagePosition === "right";

  /*
  |--------------------------------------------------------------------------
  | IMAGE VALIDATION
  |--------------------------------------------------------------------------
  */

  const isValidImage =
    imageUrl.startsWith("http") ||
    imageUrl.startsWith("/") ||
    imageUrl.startsWith("data:image");

  return (
    <article
      className="
        overflow-hidden rounded-2xl
        border border-zinc-200
        bg-white
      "
    >
      <div
        className={`
          grid gap-0
          md:grid-cols-2

          ${isRight ? "md:[&>*:first-child]:order-2" : ""}
        `}
      >
        {/* IMAGE */}
        {/* IMAGE */}
        <div
          className="
    flex items-center justify-center 
    p-4
  "
        >
          {isValidImage ? (
            <Image
              src={imageUrl}
              alt={imageAlt}
              width={800}
              height={600}
              unoptimized
              className="
        h-auto
        max-h-[420px]
        w-auto
        max-w-full
        rounded-xl
        object-contain
      "
            />
          ) : (
            <div
              className="
        flex h-[240px] w-full items-center
        justify-center
        rounded-xl
        border border-dashed border-zinc-300
        text-sm text-zinc-400
      "
            >
              No image
            </div>
          )}
        </div>

        {/* CONTENT */}
        <div
          className="
            flex flex-col justify-center

            p-6
            sm:p-8
            lg:p-10
          "
        >
          {title && (
            <h3
              className="
                text-2xl font-semibold
                tracking-tight
                text-zinc-800
                
              "
            >
              {title}
            </h3>
          )}

          <p
            className={`
              leading-8
font-light tracking-wide text-zinc-900
              ${title ? "mt-4" : ""}
            `}
          >
            {paragraph}
          </p>
        </div>
      </div>
    </article>
  );
};

export default ImageTextBlock;
