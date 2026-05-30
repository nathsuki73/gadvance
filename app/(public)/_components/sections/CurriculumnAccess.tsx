// "use client";

// import React from "react";
// import { FileText, ArrowRight, Download } from "lucide-react";

// const CurriculumAccess = () => {
//   return (
//     <section className="bg-white py-32 sm:py-48">
//       <div className="mx-auto max-w-7xl px-8 lg:px-12">
//         <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
          
//           {/* text side */}
//           <div className="max-w-2xl">
//             <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#00aeef] mb-8">
//               curriculum
//             </h2>
//             <h3 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
//               explore the <span className="italic font-serif">learning modules.</span>
//             </h3>
//             <p className="mt-8 text-xl text-zinc-500 font-light leading-9">
//               our 2026 roadmap covers the essential pillars of gender advancement 
//               tailored for the philippine workplace. download the overview to see 
//               the full list of modules, learning outcomes, and certification paths.
//             </p>

//             <div className="mt-12 flex flex-col sm:flex-row gap-6">
//               {/* primary action */}
//               <button className="group flex items-center justify-center gap-3 rounded-full bg-[#00aeef] px-8 py-4 text-white transition-all hover:bg-[#0096ce] hover:shadow-lg hover:shadow-sky-100">
//                 <Download size={18} />
//                 <span className="font-medium lowercase">download overview</span>
//               </button>
              
//               {/* secondary action for partners */}
//               <button className="flex items-center justify-center gap-3 rounded-full border border-zinc-200 px-8 py-4 text-zinc-600 hover:bg-zinc-50 transition-all">
//                 <span className="font-medium lowercase">institutional inquiry</span>
//                 <ArrowRight size={18} className="text-zinc-400" />
//               </button>
//             </div>
//           </div>

//           {/* visual side: the "roadmap" document card */}
//           <div className="relative w-full max-w-sm">
//             {/* the skeuomorphic card */}
//             <div className="aspect-[3/4] rounded-[32px] bg-zinc-50 border border-zinc-100 p-10 flex flex-col justify-between shadow-sm transition-transform duration-500 hover:-rotate-1 hover:shadow-xl">
//               <div className="flex justify-between items-start">
//                 <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
//                   <FileText size={24} className="text-[#00aeef]" />
//                 </div>
//                 <span className="text-[10px] font-bold tracking-widest text-[#00aeef] bg-sky-50 px-3 py-1 rounded-full uppercase">
//                   v1.0 2026
//                 </span>
//               </div>

//               <div>
//                 <h4 className="text-2xl font-semibold text-zinc-900 leading-snug">
//                   gender advancement <br/> roadmap & curriculum
//                 </h4>
//                 <div className="mt-6 space-y-3">
//                   <div className="flex items-center gap-3">
//                     <div className="h-1.5 w-1.5 rounded-full bg-[#00aeef]" />
//                     <span className="text-xs text-zinc-500 lowercase">12 foundational modules</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="h-1.5 w-1.5 rounded-full bg-[#00aeef]" />
//                     <span className="text-xs text-zinc-500 lowercase">institutional framework</span>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <div className="h-1.5 w-1.5 rounded-full bg-[#00aeef]" />
//                     <span className="text-xs text-zinc-500 lowercase">certification standards[cite: 1]</span>
//                   </div>
//                 </div>
//               </div>

//               <div className="pt-8 border-t border-zinc-200/60">
//                 <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
//                   gadvance philippines[cite: 1]
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default CurriculumAccess;

"use client";

import React, { useEffect, useRef } from "react";
import { FileText, ArrowRight, Download } from "lucide-react";

const CurriculumAccess = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0", "translate-x-0");
            entry.target.classList.remove("opacity-0", "translate-y-10", "translate-x-10", "-translate-x-10");
          } else {
            // Reset animations based on their original directions
            entry.target.classList.remove("opacity-100", "translate-y-0", "translate-x-0");
            
            // Re-apply original offsets
            if (entry.target.classList.contains("slide-left")) {
              entry.target.classList.add("opacity-0", "-translate-x-10");
            } else if (entry.target.classList.contains("slide-right")) {
              entry.target.classList.add("opacity-0", "translate-x-10");
            } else {
              entry.target.classList.add("opacity-0", "translate-y-10");
            }
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px" 
      }
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="bg-white py-32 sm:py-48 overflow-hidden">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-24">
          
          {/* Text Side - Slides in from the left */}
          <div className="max-w-2xl scroll-anim slide-left opacity-0 -translate-x-10 transition-all duration-1000 ease-out">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-8">
              curriculum
            </h2>
            <h3 className="text-4xl md:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
              explore the <span className="italic font-serif">learning modules.</span>
            </h3>
            <p className="mt-8 text-xl text-zinc-500 font-light leading-9">
              our 2026 roadmap covers the essential pillars of gender advancement 
              tailored for the philippine workplace. download the overview to see 
              the full list of modules, learning outcomes, and certification paths.
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              {/* Primary action */}
              <button className="group flex items-center justify-center gap-3 rounded-full bg-[#8b5cf6] px-8 py-4 text-white transition-all hover:bg-[#7c3aed] hover:shadow-lg hover:shadow-violet-100 active:scale-95">
                <Download size={18} />
                <span className="font-medium lowercase">download overview</span>
              </button>
              
              {/* Secondary action */}
              <button className="flex items-center justify-center gap-3 rounded-full border border-zinc-200 px-8 py-4 text-zinc-600 hover:bg-zinc-50 transition-all active:scale-95">
                <span className="font-medium lowercase">institutional inquiry</span>
                <ArrowRight size={18} className="text-zinc-400" />
              </button>
            </div>
          </div>

          {/* Visual Side: The "Roadmap" document card - Slides in from the right */}
          <div className="relative w-full max-w-sm scroll-anim slide-right opacity-0 translate-x-10 transition-all duration-1000 delay-300 ease-out">
            {/* Skeuomorphic card */}
            <div className="aspect-[3/4] rounded-[32px] bg-zinc-50 border border-zinc-100 p-10 flex flex-col justify-between shadow-sm transition-all duration-500 hover:-rotate-1 hover:shadow-xl hover:bg-white cursor-default">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                  <FileText size={24} className="text-[#8b5cf6]" />
                </div>
                <span className="text-[10px] font-bold tracking-widest text-[#8b5cf6] bg-violet-50 px-3 py-1 rounded-full uppercase">
                  v1.0 2026
                </span>
              </div>

              <div>
                <h4 className="text-2xl font-semibold text-zinc-900 leading-snug">
                  gender advancement <br/> roadmap & curriculum
                </h4>
                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs text-zinc-500 lowercase">12 foundational modules</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs text-zinc-500 lowercase">institutional framework</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
                    <span className="text-xs text-zinc-500 lowercase">certification standards</span>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-200/60">
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
                  gadvance philippines
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurriculumAccess;