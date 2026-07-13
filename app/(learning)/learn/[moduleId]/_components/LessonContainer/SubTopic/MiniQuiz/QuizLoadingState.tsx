export function QuizLoadingState() {
  // Shared base class for animating skeleton tracks
  const skeletonBase = "animate-pulse bg-zinc-200 rounded";

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8 sm:space-y-10">
      {/* Quiz Top Action Line */}
      <header className="border-b border-zinc-200 pb-6 sm:pb-8 space-y-4">
        <div className="flex justify-between items-center">
          {/* Section Category Tag */}
          <div className={`h-3 w-24 ${skeletonBase}`} />
          {/* Question Index Progress Label */}
          <div className={`h-3 w-12 ${skeletonBase}`} />
        </div>
        {/* Loading Progress Bar Track */}
        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-zinc-200 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Main Core View Area */}
      <div className="space-y-6 sm:space-y-8">
        <div className="space-y-3">
          {/* Question Meta Hint */}
          <div className={`h-3 w-28 ${skeletonBase}`} />
          {/* Two-line Primary Title Body Block */}
          <div className={`h-6 w-full ${skeletonBase}`} />
          <div className={`h-6 w-4/5 ${skeletonBase}`} />
        </div>

        {/* Dummy Selectable Multi-Choice Options Array */}
        <div className="space-y-3 sm:space-y-4">
          {[1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 p-4 sm:gap-5 sm:p-6"
            >
              {/* Outer Radio Button Shell */}
              <div className="h-5 w-5 shrink-0 rounded-full bg-zinc-100 border border-zinc-200 animate-pulse sm:h-6 sm:w-6" />
              {/* Variable Text Lines */}
              <div className="w-full">
                <div
                  className={`h-4 ${index === 3 ? "w-1/2" : index === 4 ? "w-2/3" : "w-5/6"} ${skeletonBase}`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Global Footer Navigation Panel */}
        <div className="flex flex-col gap-4 border-t border-zinc-200 pt-6 sm:flex-row sm:items-center sm:justify-between sm:pt-8">
          {/* Context Disclaimer text bar */}
          <div className={`h-4 w-52 self-center ${skeletonBase}`} />
          {/* Bottom Execution Trigger Button */}
          <div className={`h-11 w-full sm:w-36 ${skeletonBase}`} />
        </div>
      </div>
    </div>
  );
}
