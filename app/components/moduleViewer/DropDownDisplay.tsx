"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type DropDownDisplayProps = {
	title: string;
	children: React.ReactNode;
	subtitle?: string;
	headerColor?: string;
	textColor?: string;
	defaultOpen?: boolean;
};

const DropDownDisplay = ({
	title,
	children,
	subtitle,
	headerColor = "#14b8a6",
	textColor = "#ffffff",
	defaultOpen = true,
}: DropDownDisplayProps) => {
	const [isOpen, setIsOpen] = useState(defaultOpen);

	return (
		<section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
			<button
				type="button"
				onClick={() => setIsOpen((current) => !current)}
				className="flex w-full items-center justify-between px-4 py-3 text-left transition-opacity hover:opacity-95"
				style={{ backgroundColor: headerColor, color: textColor }}
				aria-expanded={isOpen}
			>
				<div>
					<h3 className="text-base font-semibold md:text-lg">{title}</h3>
					{subtitle ? <p className="mt-1 text-sm opacity-90">{subtitle}</p> : null}
				</div>

				<ChevronDown
					size={18}
					className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen ? <div className="p-4 md:p-5">{children}</div> : null}
		</section>
	);
};

export type { DropDownDisplayProps };
export default DropDownDisplay;
