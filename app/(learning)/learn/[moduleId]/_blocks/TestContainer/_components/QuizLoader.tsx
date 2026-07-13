export default function QuizLoader() {
  // Base classes for our animated skeleton components
  const skeletonBase = "animate-pulse bg-zinc-200 rounded";

  return (
    <div className="w-full space-y-8 sm:space-y-10">
      {/* Universal Header Skeleton */}
      <header className="border-b border-zinc-200 pb-6 sm:pb-8 space-y-4">
        <div className="flex justify-between items-center">
          {/* Tagline skeleton */}
          <div className={`h-3 w-24 ${skeletonBase}`} />
          {/* Progress / Metabar skeleton */}
          <div className={`h-3 w-12 ${skeletonBase}`} />
        </div>
        {/* Title row skeleton */}
        <div className={`h-8 w-2/3 sm:h-9 ${skeletonBase}`} />
        {/* Subtle subline skeleton */}
        <div className={`mt-2 h-4 w-1/2 ${skeletonBase}`} />
      </header>

      {/* Main Container Content Skeleton */}
      <div className="space-y-6 sm:space-y-8">
        <div>
          {/* Subheading placeholder */}
          <div className={`h-3 w-28 mb-3 ${skeletonBase}`} />
          {/* Body/Question row placeholder */}
          <div className={`h-6 w-11/12 max-w-xl ${skeletonBase}`} />
        </div>

        {/* Stacked Content Cards (Mimics Choices or Card items beautifully) */}
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4 sm:gap-5 sm:p-6"
            >
              {/* Visual geometric indicator skeleton (bullet/radio) */}
              <div className="h-5 w-5 shrink-0 rounded-full bg-zinc-100 border border-zinc-200 animate-pulse sm:h-6 sm:w-6" />
              {/* Card content skeleton text line */}
              <div className="w-full">
                <div
                  className={`h-4 ${index === 2 ? "w-2/3" : "w-4/5"} ${skeletonBase}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions Skeleton Layout */}
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          {/* Explanatory footer text segment placeholder */}
          <div className={`h-4 w-48 self-center ${skeletonBase}`} />
          {/* Primary Action Button skeleton block */}
          <div className={`h-11 w-full sm:w-36 ${skeletonBase}`} />
        </div>
      </div>
    </div>
  );
}
