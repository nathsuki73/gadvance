"use client";

import React from "react";
import Image from "next/image";

type BannerBlockProps = {
  imageUrl?: string | null;
  alt?: string;
  height?: number;
};

const BannerBlock = ({
  imageUrl,
  alt = "Banner",
  height = 280,
}: BannerBlockProps) => {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border bg-muted"
      style={{ height }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
          No banner image
        </div>
      )}
    </div>
  );
};

export default BannerBlock;