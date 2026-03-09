type SubHeaderProps = {
	title?: string;
	pathLabel?: string;
	duration?: string;
	learners?: string;
	reviews?: string;
};

export default function SubHeader({
	title = "AI Fundamentals: Foundations for Understanding AI (Earn a digital credential!)",
	pathLabel = "Learning Plan",
	duration = "About 9 hours",
	learners = "5,206",
	reviews = "283",
}: SubHeaderProps) {
	return (
		<section className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 bg-zinc-900">
			<div className="relative z-10 flex flex-col px-4 md:flex-row md:items-center md:px-8 lg:px-12">
				<div className="h-24 w-full shrink-0 bg-[#d6458f] md:h-28 md:w-52" />

				<div className="hidden h-24 w-px bg-zinc-700/60 md:block md:h-28" />

				<div className="flex flex-1 flex-col gap-3 px-4 py-4 md:px-6 md:py-5">
					<p className="text-sm text-[#9be3d6]">{pathLabel}</p>

					<h2 className="text-xl font-semibold leading-tight tracking-tight text-white md:text-3xl">
						{title}
					</h2>

					<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-300">
						<span className="inline-flex items-center gap-1.5">
							<svg
								className="h-4 w-4 text-[#00aeef]"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<circle cx="12" cy="12" r="9" />
								<path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
							{duration}
						</span>

						<span className="inline-flex items-center gap-1.5">
							<svg
								className="h-4 w-4 text-[#ef8700]"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									d="M16 19a4 4 0 00-8 0M12 12a3 3 0 100-6 3 3 0 000 6M20 19a4 4 0 00-3-3.87M17 6.13a3 3 0 010 5.75M4 19a4 4 0 013-3.87M7 6.13a3 3 0 000 5.75"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
							{learners}
						</span>

						<span className="inline-flex items-center gap-1.5">
							<span className="inline-flex text-amber-400">★★★★★</span>
							{reviews}
						</span>
					</div>
				</div>

				<button
					type="button"
					className="mx-4 mb-4 inline-flex items-center gap-2 self-start rounded-md border border-zinc-700 bg-zinc-800/80 px-3 py-2 text-sm text-zinc-100 transition hover:border-[#00aeef] hover:text-[#00aeef] md:mx-6 md:mb-0 md:self-center"
				>
					<svg
						className="h-4 w-4"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path d="M8.59 13.51l6.83 3.98" strokeLinecap="round" />
						<path d="M15.41 6.51L8.59 10.49" strokeLinecap="round" />
						<circle cx="18" cy="5" r="3" />
						<circle cx="6" cy="12" r="3" />
						<circle cx="18" cy="19" r="3" />
					</svg>
					Share
				</button>
			</div>
		</section>
	);
}
