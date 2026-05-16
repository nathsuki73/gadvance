"use client";

import Image from "next/image";

type ImageBlockProps = {
  imageUrl?: string | null;

  alt?: string;
};

const ImageBlock = ({ imageUrl, alt = "Module image" }: ImageBlockProps) => {
  /*
  |--------------------------------------------------------------------------
  | VALIDATORS
  |--------------------------------------------------------------------------
  */

  const isHttpUrl = (value: string) => {
    try {
      const url = new URL(value);

      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isBase64Image = (value: string) => {
    return /^data:image\/[a-zA-Z]+;base64,/.test(value);
  };

  const isLocalPath = (value: string) => {
    return value.startsWith("/");
  };

  /*
  |--------------------------------------------------------------------------
  | VALID IMAGE
  |--------------------------------------------------------------------------
  */

  const isValidImage =
    typeof imageUrl === "string" &&
    imageUrl.trim() !== "" &&
    (isHttpUrl(imageUrl) || isBase64Image(imageUrl) || isLocalPath(imageUrl));

  /*
  |--------------------------------------------------------------------------
  | EMPTY STATE
  |--------------------------------------------------------------------------
  */

  if (!isValidImage) {
    return (
      <div
        className="
          flex min-h-[240px] w-full items-center justify-center
          rounded-2xl border border-dashed border-zinc-300
          bg-zinc-100
        "
      >
        <span className="text-sm text-zinc-400">No image available</span>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="flex w-full justify-center py-6">
      <div
        className="
          relative
          w-full
          max-w-3xl
          overflow-hidden
          rounded-2xl
          bg-zinc-100
        "
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={1400}
          height={900}
          unoptimized={isBase64Image(imageUrl)}
          className="
            h-auto
            w-full
            object-contain
            
          "
        />
      </div>
    </div>
  );
};

export default ImageBlock;
