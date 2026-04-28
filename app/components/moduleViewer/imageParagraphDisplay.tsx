import Image, { type StaticImageData } from "next/image";
import React from "react";

type ImagePosition = "left" | "right";

type ImageParagraphDisplayProps = {
	imageSrc: string | StaticImageData;
	imageAlt: string;
	paragraph: string;
	imagePosition?: ImagePosition;
	title?: string;
};

const ImageParagraphDisplay = ({
	imageSrc,
	imageAlt,
	paragraph,
	imagePosition = "left",
	title,
}: ImageParagraphDisplayProps) => {
	const isImageRight = imagePosition === "right";

	return (
		<article className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
			<div
				className={`grid items-center gap-4 md:grid-cols-2 ${
					isImageRight ? "md:[&>*:first-child]:order-2" : ""
				}`}
			>
				<div className="relative h-52 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
					<Image
						src={imageSrc}
						alt={imageAlt}
						fill
						className="object-cover"
						sizes="(min-width: 768px) 50vw, 100vw"
					/>
				</div>

				<div>
					{title ? (
						<h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
					) : null}
					<p className={`${title ? "mt-2" : ""} leading-relaxed text-zinc-700`}>
						{paragraph}
					</p>
				</div>
			</div>
		</article>
	);
};

export type { ImageParagraphDisplayProps, ImagePosition };
export default ImageParagraphDisplay;
