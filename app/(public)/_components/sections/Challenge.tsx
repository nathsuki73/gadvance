// "use client";

// import React from "react";

// const TheChallengeSection = () => {
//   return (
//     <section className=" py-32 sm:py-48 bg-gradient-to-b from-sky-100 via-sky-50 to-white"> {/* Increased vertical padding */}
//       <div className="mx-auto max-w-7xl px-8 lg:px-12"> {/* Increased horizontal padding */}
        
//         {/* Header - More air between elements */}
//         <div className="max-w-3xl">
//           <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#00aeef]">
//             The Reality
//           </h2>
//           <h3 className="mt-10 text-4xl font-light tracking-tight text-zinc-900 sm:text-6xl leading-[1.1]">
//             The gender gap in leadership <br className="hidden md:block" />
//             <span className="font-semibold text-[#00aeef]">still exists.</span>
//           </h3>
//           <p className="mt-12 text-xl leading-9 text-zinc-500 font-light max-w-2xl">
//             Despite progress, structural barriers continue to limit workplace inclusion 
//             and career advancement for marginalized genders.
//           </p>
//         </div>

//         {/* Grid - Wider gap and more top margin */}
//         <div className="mt-32 grid grid-cols-1 gap-x-24 gap-y-24 lg:grid-cols-2">
          
//           {/* Issue 01 */}
//           <div className="flex flex-col border-t border-zinc-100 pt-12">
//             <span className="text-[10px] font-bold tracking-[0.3em] text-[#00aeef] mb-6 uppercase">
//               01 / Opportunity
//             </span>
//             <h4 className="text-2xl font-medium text-zinc-900 tracking-tight">Unequal Access</h4>
//             <p className="mt-6 text-zinc-500 leading-8 font-light">
//               Leadership access and high-impact mentorship remain unevenly distributed. 
//               The &quot;broken rung&quot; still prevents qualified talent from reaching the first level of management.
//             </p>
//           </div>

//           {/* Issue 02 */}
//           <div className="flex flex-col border-t border-zinc-100 pt-12">
//             <span className="text-[10px] font-bold tracking-[0.3em] text-[#00aeef] mb-6 uppercase">
//               02 / Environment
//             </span>
//             <h4 className="text-2xl font-medium text-zinc-900 tracking-tight">Culture & Belonging</h4>
//             <p className="mt-6 text-zinc-500 leading-8 font-light">
//               Organizations struggle to move beyond &quot;diversity numbers&quot; to build 
//               environments where every individual feels a genuine sense of psychological safety.
//             </p>
//           </div>

//         </div>

//         {/* Bottom statement - More isolation */}
//         <div className="mt-32 flex items-scenter gap-x-6 text-zinc-400">
//           <div className="h-px w-16 bg-[#00aeef]" />
//           <p className="text-sm tracking-wide font-light">
//             This gap impacts innovation, retention, and long-term organizational growth.
//           </p>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default TheChallengeSection;

"use client";

import React, { useEffect, useRef } from "react";

const TheChallengeSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the browser supports IntersectionObserver
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Trigger animation
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          } else {
            // Reset animation to retrigger on next visit
            entry.target.classList.remove("opacity-100", "translate-y-0");
            entry.target.classList.add("opacity-0", "translate-y-10");
          }
        });
      },
      { 
        threshold: 0.1, // Trigger when 10% is visible
        rootMargin: "0px 0px -50px 0px" 
      }
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-32 sm:py-48 bg-gradient-to-b from-sky-100 via-sky-50 to-white overflow-hidden">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12"> 
        
        {/* Header Section */}
        <div className="max-w-3xl scroll-anim opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#00aeef]">
            The Reality
          </h2>
          <h3 className="mt-10 text-4xl font-light tracking-tight text-zinc-900 sm:text-6xl leading-[1.1]">
            The gender gap in leadership <br className="hidden md:block" />
            <span className="font-semibold text-[#00aeef]">still exists.</span>
          </h3>
          <p className="mt-12 text-xl leading-9 text-zinc-500 font-light max-w-2xl">
            Despite progress, structural barriers continue to limit workplace inclusion 
            and career advancement for marginalized genders.
          </p>
        </div>

        {/* Issues Grid */}
        <div className="mt-32 grid grid-cols-1 gap-x-24 gap-y-24 lg:grid-cols-2">
          
          {/* Issue 01 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out flex flex-col border-t border-zinc-100 pt-12">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#00aeef] mb-6 uppercase">
              01 / Opportunity
            </span>
            <h4 className="text-2xl font-medium text-zinc-900 tracking-tight">Unequal Access</h4>
            <p className="mt-6 text-zinc-500 leading-8 font-light">
              Leadership access and high-impact mentorship remain unevenly distributed. 
              The &quot;broken rung&quot; still prevents qualified talent from reaching the first level of management.
            </p>
          </div>

          {/* Issue 02 */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out flex flex-col border-t border-zinc-100 pt-12">
            <span className="text-[10px] font-bold tracking-[0.3em] text-[#00aeef] mb-6 uppercase">
              02 / Environment
            </span>
            <h4 className="text-2xl font-medium text-zinc-900 tracking-tight">Culture & Belonging</h4>
            <p className="mt-6 text-zinc-500 leading-8 font-light">
              Organizations struggle to move beyond &quot;diversity numbers&quot; to build 
              environments where every individual feels a genuine sense of psychological safety.
            </p>
          </div>

        </div>

        {/* Bottom statement */}
        <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-700 ease-out mt-32 flex items-center gap-x-6 text-zinc-400">
          <div className="h-px w-16 bg-[#00aeef]" />
          <p className="text-sm tracking-wide font-light">
            This gap impacts innovation, retention, and long-term organizational growth.
          </p>
        </div>
      </div>
    </section>
  );
};

export default TheChallengeSection;