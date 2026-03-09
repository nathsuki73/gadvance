export default function AboutLearningPlan() {
	return (
		<section className="relative left-1/2 right-1/2 mt-6 w-screen -translate-x-1/2 bg-[#f5f6f7] px-4 py-6 md:px-8 lg:px-12">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div className="min-w-0 lg:max-w-4xl">
						<h2 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
						About this learning plan
						</h2>

						<p className="mt-3 max-w-3xl text-base leading-relaxed text-zinc-600 md:text-lg">
						From community innovation labs to modern healthcare diagnostics,
						artificial intelligence is reshaping how we solve everyday and
						complex challenges. This learning plan introduces practical AI
						thinking with clear lessons, real examples, and ethical guidance so
						you can build confidence and apply AI responsibly in your own work.
						</p>

						<button
							type="button"
							className="mt-2 text-sm font-medium text-[#00aeef] transition hover:text-[#0092c9] md:text-base"
						>
							Show more
						</button>
					</div>

				<div className="w-full lg:ml-auto lg:w-72.5">
						<button
							type="button"
							className="flex w-full items-center justify-between rounded-lg bg-teal-600 px-4 py-3 text-left text-base font-semibold text-white transition hover:bg-teal-700"
						>
							Enroll
							<span aria-hidden="true">+</span>
						</button>

						<button
							type="button"
							className="mt-3 flex w-full items-center justify-between rounded-lg border border-zinc-300 bg-white px-4 py-3 text-left text-base font-medium text-zinc-700 transition hover:bg-zinc-50"
						>
							Actions
							<svg
								className="h-4 w-4 text-zinc-500"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								aria-hidden="true"
							>
								<path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
							</svg>
						</button>
				</div>
			</div>
		</section>
	);
}
