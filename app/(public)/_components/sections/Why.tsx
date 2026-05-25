// "use client";

// import React from "react";

// const WhyItMattersSection = () => {
//   return (
//     <section className="bg-white py-32 sm:py-48">
//       <div className="mx-auto max-w-7xl px-8 lg:px-12">
        
//         {/* Section Label */}
//         <div className="flex items-center gap-4 mb-16">
//           <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#00aeef]">
//               WHY IT MATTERS
//             </h2>
//         </div>

//         {/* Main Argument - Staggered Layout */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12">
//           <div className="lg:col-span-7">
//             <h2 className="text-4xl md:text-6xl font-light tracking-tight text-zinc-900 leading-[1.1]">
//               Equity is not just a <br /> 
//               <span className="italic font-serif text-[#00aeef]">social goal.</span>
//             </h2>
//           </div>
          
//           <div className="lg:col-start-8 lg:col-span-5 self-end">
//             <p className="text-xl leading-9 text-zinc-500 font-light">
//               In the Philippines, organizations that prioritize gender advancement report 
//               <span className="text-zinc-900 font-medium"> significantly higher revenue growth </span> 
//               and talent retention in 2026.
//             </p>
//           </div>
//         </div>

//         {/* Data Points - Minimalist list */}
//         <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-zinc-100 pt-16">
          
//           {/* Stat 01 */}
//           <div>
//             <span className="text-5xl font-light text-[#00aeef]">44%</span>
//             <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
//               Higher Growth
//             </h4>
//             <p className="mt-4 text-zinc-500 leading-7 font-light">
//               Local companies with gender-equal initiatives are nearly twice as likely to 
//               outperform industry benchmarks in the Philippine market.
//             </p>
//           </div>

//           {/* Stat 02 */}
//           <div>
//             <span className="text-5xl font-light text-[#00aeef]">28%</span>
//             <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
//               The Visibility Gap
//             </h4>
//             <p className="mt-4 text-zinc-500 leading-7 font-light">
//               Only 28% of Filipino employees see senior leaders as visible role models, 
//               marking a massive opportunity for brand differentiation.
//             </p>
//           </div>

//           {/* Stat 03 */}
//           <div>
//             <span className="text-5xl font-light text-[#00aeef]">Top 25</span>
//             <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
//               Global Standing
//             </h4>
//             <p className="mt-4 text-zinc-500 leading-7 font-light">
//               The Philippines remains a regional leader in gender parity, yet cultural 
//               &quot;double burdens&quot; still hinder full economic participation.
//             </p>
//           </div>

//         </div>

//        {/* closing "why" - full bleed mobile, rounded desktop */}
// <div className="relative mt-40 -mx-8 sm:mx-0 overflow-hidden rounded-none sm:rounded-[40px] bg-sky-50/50 px-8 py-24 sm:py-32">
//   {/* soft ambient light */}
//   <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(0,174,239,0.08)_0%,_transparent_70%)]" />
  
//   <div className="relative mx-auto max-w-4xl text-center">
//     {/* minimal accent line */}
//     <div className="mx-auto mb-12 h-1.5 w-1.5 rounded-full bg-[#00aeef]" />
    
//     <p className="text-3xl md:text-5xl font-light leading-[1.2] tracking-tight text-zinc-800 italic">
//       &quot;when we advance gender equity, we don&apos;t just fix a workplace—we{" "}
//       <span className="font-semibold text-[#00aeef] not-italic">
//         modernize the philippine economy
//       </span>{" "}
//       for the next generation of leaders.&quot;
//     </p>
    
//     {/* lowercase minimal label */}
//     <p className="mt-12 text-sm font-medium tracking-[0.2em] text-zinc-400 lowercase">
//       — the gadvance mission
//     </p>
//   </div>
// </div>

//       </div>
//     </section>
//   );
// };

// export default WhyItMattersSection;

"use client";

import React, { useEffect, useRef } from "react";

const WhyItMattersSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          } else {
            entry.target.classList.remove("opacity-100", "translate-y-0");
            entry.target.classList.add("opacity-0", "translate-y-10");
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
        
        {/* Section Label */}
        <div className="flex items-center gap-4 mb-16 scroll-anim opacity-0 translate-y-10 transition-all duration-700 ease-out">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
              WHY IT MATTERS
            </h2>
        </div>

        {/* Main Argument */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-100 ease-out">
          <div className="lg:col-span-7">
            <h2 className="text-4xl md:text-6xl font-light tracking-tight text-zinc-900 leading-[1.1]">
              Equity is not just a <br /> 
              <span className="italic font-serif text-primary">social goal.</span>
            </h2>
          </div>
          
          <div className="lg:col-start-8 lg:col-span-5 self-end">
            <p className="text-xl leading-9 text-zinc-500 font-light">
              In the Philippines, organizations that prioritize gender advancement report 
              <span className="text-zinc-900 font-medium"> significantly higher revenue growth </span> 
              and talent retention in 2026.
            </p>
          </div>
        </div>

        {/* Data Points - Staggered list */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-zinc-100 pt-16">
          
          {/* Stat 01 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out">
            <span className="text-5xl font-light text-primary">44%</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Higher Growth
            </h4>
            <p className="mt-4 text-zinc-500 leading-7 font-light">
              Local companies with gender-equal initiatives are nearly twice as likely to 
              outperform industry benchmarks in the Philippine market.
            </p>
          </div>

          {/* Stat 02 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out">
            <span className="text-5xl font-light text-primary">28%</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              The Visibility Gap
            </h4>
            <p className="mt-4 text-zinc-500 leading-7 font-light">
              Only 28% of Filipino employees see senior leaders as visible role models, 
              marking a massive opportunity for brand differentiation.
            </p>
          </div>

          {/* Stat 03 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-700 ease-out">
            <span className="text-5xl font-light text-primary">Top 25</span>
            <h4 className="mt-6 text-sm font-bold uppercase tracking-widest text-zinc-900">
              Global Standing
            </h4>
            <p className="mt-4 text-zinc-500 leading-7 font-light">
              The Philippines remains a regional leader in gender parity, yet cultural 
              &quot;double burdens&quot; still hinder full economic participation.
            </p>
          </div>

        </div>

        {/* Closing "Why" Block - Smooth zoom/fade */}
        <div className="scroll-anim opacity-0 translate-y-10 scale-[0.98] transition-all duration-[1200ms] delay-500 ease-out relative mt-40 -mx-8 sm:mx-0 overflow-hidden rounded-none sm:rounded-[40px] bg-sky-50/50 px-8 py-24 sm:py-32">
          {/* soft ambient light */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-full bg-[radial-gradient(circle_at_center,_rgba(0,174,239,0.08)_0%,_transparent_70%)]" />
          
          <div className="relative mx-auto max-w-4xl text-center">
            {/* minimal accent line */}
            <div className="mx-auto mb-12 h-1.5 w-1.5 rounded-full bg-primary" />
            
            <p className="text-3xl md:text-5xl font-light leading-[1.2] tracking-tight text-zinc-800 italic">
              &quot;when we advance gender equity, we don&apos;t just fix a workplace—we{" "}
              <span className="font-semibold text-primary not-italic">
                modernize the philippine economy
              </span>{" "}
              for the next generation of leaders.&quot;
            </p>
            
            <p className="mt-12 text-sm font-medium tracking-[0.2em] text-zinc-400 lowercase">
              — the gadvance mission
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default WhyItMattersSection;