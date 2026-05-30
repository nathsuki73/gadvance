// "use client";

// import React from "react";
// import ProtectedButton from "../../../components/ProtectedButton";
// import Image from "next/image";
// import image1 from "@/app/(public)/assets/hero_image.png";
// import image2 from "@/app/(public)/assets/Subtract.png";

// const Hero = () => {
//   return (
//     <section className="mx-0 flex min-h-full max-w-full items-center justify-center overflow-hidden lg:pt-8
//       bg-gradient-to-b from-white via-sky-50 to-sky-100">
      
//       <div className="grid w-full grid-cols-1 items-center justify-items-center gap-12 text-center pt-10">
        
//         {/* Content */}
//         <div className="flex flex-col items-center justify-center space-y-6">
          
//           <div className="space-y-4">
//             <h1 className="text-4xl font-medium leading-tight tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl">
//   <span className="text-[#00aeef]">Empower.</span> Educate. <br />
//   Advance <span className="text-[#00aeef]">Gender Equality.</span>
// </h1>

//             <p className="mx-4 max-w-5xl text-base text-zinc-600 sm:text-lg">
//               Join GADvance and turn learning into real change. Empower yourself with
//               knowledge, build awareness, and take action toward a more equal and
//               inclusive future.
//             </p>
//           </div>

//           <div className="flex justify-center">
//             <ProtectedButton
//               onClick={() => {
//                 window.location.href = "/workspace";
//               }}
//               className="rounded-md bg-[#00aeef] px-8 py-3 text-base sm:text-lg font-medium text-white transition-colors hover:bg-[#0092c9]"
//               redirectUrl="/workspace"
//             >
//               Get Started
//             </ProtectedButton>
//           </div>

//           <Image
//   src={image2}
//   width={1200}
//   height={1200}
//   alt="Hero illustration"
//   className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl object-contain transform -translate-y-10 sm:-translate-y-16 lg:-translate-y-24 pointer-events-none"
// />
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Hero;

"use client";

import React, { useEffect, useRef } from "react";
import ProtectedButton from "../../../components/ProtectedButton";
import Image from "next/image";
import image2 from "@/app/(public)/assets/Subtract.png";

const Hero = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-10");
          }
        });
      },
      { threshold: 0.1 }
    );

    const children = scrollRef.current?.querySelectorAll(".scroll-anim");
    children?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-0 flex min-h-full max-w-full items-center justify-center overflow-hidden lg:pt-8
      bg-gradient-to-b from-white via-violet-50 to-violet-50">
      
      <div ref={scrollRef} className="grid w-full grid-cols-1 items-center justify-items-center gap-12 text-center pt-10">
        
        {/* Content Container */}
        <div className="flex flex-col items-center justify-center space-y-6">
          
          <div className="space-y-4">
            {/* 1. Header Animation */}
            <h1 className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 ease-out text-4xl font-medium leading-tight tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="text-[#8b5cf6]">Empower.</span> Educate. <br />
              Advance <span className="text-[#8b5cf6]">Gender Equality.</span>
            </h1>

            {/* 2. Paragraph Animation (with delay) */}
            <p className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-200 ease-out mx-4 max-w-5xl text-base text-zinc-600 sm:text-lg">
              Join GADvance and turn learning into real change. Empower yourself with
              knowledge, build awareness, and take action toward a more equal and
              inclusive future.
            </p>
          </div>

          {/* 3. Button Animation (with more delay) */}
          <div className="scroll-anim opacity-0 translate-y-10 transition-all duration-1000 delay-500 ease-out flex justify-center">
            <ProtectedButton
              onClick={() => {
                window.location.href = "/workspace";
              }}
              className="rounded-md bg-[#8b5cf6] px-8 py-3 text-base sm:text-lg font-medium text-white transition-colors hover:bg-[#7c3aed]"
              redirectUrl="/workspace"
            >
              Get Started
            </ProtectedButton>
          </div>

          {/* 4. Image Animation (slowest/bottom) */}
          <div className="scroll-anim opacity-0 translate-y-20 transition-all duration-[1500ms] delay-700 ease-out">
            <Image
              src={image2}
              width={1200}
              height={1200}
              alt="Hero illustration"
              className="w-full max-w-lg sm:max-w-xl lg:max-w-2xl object-contain transform -translate-y-10 sm:-translate-y-16 lg:-translate-y-24 pointer-events-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;