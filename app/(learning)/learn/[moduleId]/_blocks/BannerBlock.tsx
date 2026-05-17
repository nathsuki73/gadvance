"use client";

import Image from "next/image";

type BannerBlockProps = {
  imageUrl?: string | null;

  alt?: string;
};

const BannerBlock = ({ imageUrl, alt = "Banner" }: BannerBlockProps) => {
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
  | VALID IMAGE SOURCE
  |--------------------------------------------------------------------------
  */

  const isValidImage =
    typeof imageUrl === "string" &&
    imageUrl.trim() !== "" &&
    (isHttpUrl(imageUrl) || isBase64Image(imageUrl) || isLocalPath(imageUrl));

  /*
  |--------------------------------------------------------------------------
  | FALLBACK EMPTY BANNER
  |--------------------------------------------------------------------------
  */

  if (!isValidImage) {
    return (
      <div
        className="
          flex h-[260px] w-full items-center justify-center
         border border-dashed border-zinc-300
          bg-zinc-100
        "
      >
        <span className="text-sm text-zinc-400">No banner image</span>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | IMAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="relative h-[260px] w-full overflow-hidden bg-zinc-100">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        unoptimized={isBase64Image(imageUrl)}
        className="object-cover"
      />
    </div>
  );
};

export default BannerBlock;
