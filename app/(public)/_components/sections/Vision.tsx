// "use client";

// import React from "react";
// import image1 from "@/app/(public)/assets/hero.png";
// import Image from "next/image";

// const TheVisionSection = () => {
//   return (
//     <section className="bg-zinc-50 py-32 sm:py-48"> {/* Subtle background shift to off-white */}
//       <div className="mx-auto max-w-7xl px-8 lg:px-12">
        
//         <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-24">
          
//           {/* Left: Content Area */}
//           <div className="max-w-2xl lg:sticky lg:top-24">
//             <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#00aeef]">
//               The Vision
//             </h2>
//             <h3 className="mt-10 text-4xl font-light tracking-tight text-zinc-900 sm:text-6xl leading-[1.1]">
//               Moving from <span className="italic">awareness</span> <br />
//               <span className="font-semibold">to action.</span>
//             </h3>
            
//             <p className="mt-12 text-xl leading-9 text-zinc-500 font-light">
//               GADVance helps organizations and individuals bridge the gap between 
//               intent and impact through practical education and leadership development.
//             </p>

//             <div className="mt-16 space-y-16">
//               {/* Feature 01 */}
//               <div className="max-w-md">
//                 <h4 className="text-lg font-semibold text-zinc-900 uppercase tracking-wider">
//                   For Organizations
//                 </h4>
//                 <p className="mt-4 text-zinc-500 leading-7 font-light">
//                   Develop healthier workplace cultures, stronger collaboration, and 
//                   more inclusive leadership systems that drive retention and innovation.
//                 </p>
//               </div>

//               {/* Feature 02 */}
//               <div className="max-w-md">
//                 <h4 className="text-lg font-semibold text-zinc-900 uppercase tracking-wider">
//                   For Individuals
//                 </h4>
//                 <p className="mt-4 text-zinc-500 leading-7 font-light">
//                   Build the confidence and leadership readiness needed to navigate 
//                   and thrive in modern professional environments.
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Right: Large Visual Placeholder */}
//           <div className="relative w-full lg:max-w-xl aspect-[4/5] overflow-hidden rounded-sm">
//              {/* 
//                 Visual Placeholder 
//                 This is where your high-end video or abstract image will live.
//                 Using aspect-[4/5] gives it an editorial/magazine feel.
//              */}
//              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs uppercase tracking-widest">
//               <Image
//   src={image1}
//   width={1200}
//   height={1200}
//   alt="Hero illustration"
//   className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl object-contain transform -translate-y-10 sm:-translate-y-16 lg:-translate-y-24 pointer-events-none"
// />

//              </div>
//           </div>

//         </div>
//       </div>
//     </section>
//   );
// };

// export default TheVisionSection;

"use client";

import React, { useEffect, useRef } from "react";
import image1 from "@/app/(public)/assets/hero.png";
import Image from "next/image";

const TheVisionSection = () => {
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
    <section className="bg-zinc-50 py-32 sm:py-48 overflow-hidden">
      <div ref={scrollRef} className="mx-auto max-w-7xl px-8 lg:px-12">
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-24">
          
          {/* Left: Content Area */}
          <div className="max-w-2xl lg:sticky lg:top-24">
            {/* Main Header Animation */}
            <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 ease-out">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-[#00aeef]">
                The Vision
              </h2>
              <h3 className="mt-10 text-4xl font-light tracking-tight text-zinc-900 sm:text-6xl leading-[1.1]">
                Moving from <span className="italic">awareness</span> <br />
                <span className="font-semibold">to action.</span>
              </h3>
              
              <p className="mt-12 text-xl leading-9 text-zinc-500 font-light">
                GADVance helps organizations and individuals bridge the gap between 
                intent and impact through practical education and leadership development.
              </p>
            </div>

            <div className="mt-16 space-y-16">
              {/* Feature 01 - Staggered Delay */}
              <div className="max-w-md scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-300 ease-out">
                <h4 className="text-lg font-semibold text-zinc-900 uppercase tracking-wider">
                  For Organizations
                </h4>
                <p className="mt-4 text-zinc-500 leading-7 font-light">
                  Develop healthier workplace cultures, stronger collaboration, and 
                  more inclusive leadership systems that drive retention and innovation.
                </p>
              </div>

              {/* Feature 02 - Staggered Delay */}
              <div className="max-w-md scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out">
                <h4 className="text-lg font-semibold text-zinc-900 uppercase tracking-wider">
                  For Individuals
                </h4>
                <p className="mt-4 text-zinc-500 leading-7 font-light">
                  Build the confidence and leadership readiness needed to navigate 
                  and thrive in modern professional environments.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Large Visual - Different transition for a "Reveal" effect */}
          <div className="relative w-full lg:max-w-xl aspect-[4/5] overflow-hidden rounded-sm scroll-anim opacity-0 translate-y-10 transition-all duration-[1500ms] delay-200 ease-out">
             <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                <Image
                  src={image1}
                  width={1200}
                  height={1200}
                  alt="Vision illustration"
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-[3000ms] hover:scale-110"
                />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TheVisionSection;