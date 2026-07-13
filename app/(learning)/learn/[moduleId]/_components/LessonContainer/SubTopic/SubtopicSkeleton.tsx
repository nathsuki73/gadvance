export default function SubtopicSkeleton() {
  const skeletonBase = "animate-pulse bg-zinc-200 rounded";

  return (
    <div className="size-full overflow-hidden space-y-8">
      {/* Loop through 2 dummy items to make the skeleton feel like a real article stream */}
      {[1, 2].map((i) => (
        <div key={i} className="w-full flex flex-col space-y-4">
          {/* Section Title Bar Placeholder (only on first item to vary layout) */}
          {i === 1 && (
            <div className="bg-indigo-50/40 px-6 sm:px-12 py-5 border-b border-zinc-100 flex items-center justify-start mb-2">
              <div className={`h-7 w-48 sm:w-64 ${skeletonBase}`} />
            </div>
          )}

          <div className="px-6 sm:px-12 max-w-3xl mx-auto w-full space-y-5">
            {/* Image Placeholder (only on first item to mimic mixed media layouts) */}
            {i === 1 && (
              <div className="my-3 rounded-xl border border-zinc-100 shadow-sm relative h-72 w-full bg-zinc-100/80 animate-pulse flex items-center justify-center">
                {/* Optional subtle image icon hint inside skeleton */}
                <svg
                  className="w-10 h-10 text-zinc-200"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 002-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}

            {/* Markdown Paragraph Lines */}
            <div className="space-y-3 pt-2">
              <div className={`h-4 w-full ${skeletonBase}`} />
              <div className={`h-4 w-11/12 ${skeletonBase}`} />
              <div className={`h-4 w-4/5 ${skeletonBase}`} />
            </div>

            {/* List Items Placeholder */}
            <div className="space-y-3 pl-1 py-2">
              {[1, 2, 3].map((listItem) => (
                <div key={listItem} className="flex items-center gap-3">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-200 animate-pulse" />
                  <div
                    className={`h-3 ${listItem === 3 ? "w-1/2" : "w-3/4"} ${skeletonBase}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
