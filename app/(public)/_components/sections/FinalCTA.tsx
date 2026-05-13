"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";

const FinalCTA = () => {
  return (
    <section className="relative py-32 sm:py-56 overflow-hidden bg-white">
      {/* soft background glow to anchor the end of the page */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] bg-sky-50/40 rounded-full blur-[140px]" />

      <div className="relative mx-auto max-w-5xl px-8 text-center">
        <h2 className="text-sm font-bold uppercase tracking-[0.4em] text-[#00aeef] mb-12">
          take the next step
        </h2>
        
        <p className="text-4xl md:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
          be part of the <br />
          <span className="font-semibold italic font-serif text-[#00aeef]">equitable future</span> <br />
          of the philippines.
        </p>

        <p className="mt-12 text-xl text-zinc-500 font-light max-w-2xl mx-auto leading-relaxed">
          whether you are an institution looking to transform your culture or 
          a student ready to lead, gadvance provides the roadmap to get there.
        </p>

        {/* action buttons */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="group relative w-full sm:w-auto flex items-center justify-center gap-3 rounded-full bg-[#00aeef] px-10 py-5 text-white transition-all hover:bg-[#0096ce] hover:shadow-xl hover:shadow-sky-100">
            <span className="font-medium lowercase">start your enrollment</span>
            <ArrowUpRight size={20} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </button>

          <button className="w-full sm:w-auto rounded-full border border-zinc-200 bg-white px-10 py-5 text-zinc-600 transition-all hover:bg-zinc-50 hover:border-zinc-300">
            <span className="font-medium lowercase">contact our partnership team</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;