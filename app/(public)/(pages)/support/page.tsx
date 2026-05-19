"use client";

import React from "react";
import { Mail, MessageCircle, FileText, HelpCircle, Code, ShieldCheck } from "lucide-react";

const SupportPage = () => {
  return (
    <main className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-violet-50 selection:text-[#8b5cf6]">
      
      {/* Section 1: Hero & Direct Assistance */}
      <section className="relative py-32 sm:py-48 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(139,92,246,0.03)_0%,_transparent_70%)]" />
        <div className="container mx-auto px-8 lg:px-12 relative">
          <div className="max-w-3xl">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-8">
              support center
            </h2>
            <h1 className="text-4xl md:text-7xl font-light tracking-tight text-zinc-900 leading-[1.1]">
              we are here to <br />
              <span className="font-semibold italic font-serif text-[#8b5cf6]">facilitate your growth.</span>
            </h1>
            <p className="mt-12 text-xl text-zinc-500 font-light leading-relaxed lowercase">
              whether you are navigating our modules or seeking institutional 
              partnership details, our team is ready to provide the clarity you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-20">
            <ContactCard 
              icon={<Mail size={24} strokeWidth={1.5} />}
              title="general inquiries"
              detail="gadvanceproject@gmail.com"
              desc="for students and individual learners seeking guidance on curriculum access."
            />
            <ContactCard 
              icon={<MessageCircle size={24} strokeWidth={1.5} />}
              title="partnership support"
              detail="gadvanceproject@gmail.com"
              desc="dedicated assistance for organizations and universities integrating our framework."
            />
          </div>
        </div>
      </section>

      {/* Section 2: Resource Gateway (Self-Service) */}
      <section className="py-32 bg-zinc-50/50 border-y border-zinc-100">
        <div className="container mx-auto px-8 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-400 mb-6">self-service</h2>
            <h3 className="text-3xl md:text-5xl font-light tracking-tight text-zinc-900 lowercase">
              find answers <span className="italic font-serif text-[#8b5cf6]">instantly.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ResourceItem 
              icon={<HelpCircle size={20} />}
              title="knowledge base"
              desc="frequently asked questions about gender advancement and our learning methodology."
            />
            <ResourceItem 
              icon={<FileText size={20} />}
              title="curriculum guide"
              desc="detailed breakdown of learning outcomes and certification requirements."
            />
            <ResourceItem 
              icon={<ShieldCheck size={20} />}
              title="privacy & ethics"
              desc="understanding how we protect your data and maintain research integrity."
            />
          </div>
        </div>
      </section>

      {/* Section 3: Technical & Academic Origins */}
      <section className="py-32 sm:py-48 bg-white">
        <div className="container mx-auto px-8 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="lg:w-1/2">
              <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-[#8b5cf6] mb-8">technical help</h2>
              <h3 className="text-3xl md:text-5xl font-light tracking-tight text-zinc-900 leading-tight">
                engineered by the <br />
                <span className="font-semibold italic font-serif text-[#8b5cf6]">lspu ccs team.</span>
              </h3>
              <p className="mt-8 text-lg text-zinc-500 font-light leading-8 lowercase">
                for platform-related bugs, account access issues, or technical 
                integration inquiries, our developer team at laguna state polytechnic 
                university is available for direct troubleshooting.
              </p>
                <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  <div className="h-10 w-10 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase">lspu</div>
                  <div className="h-10 w-10 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase">octa</div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full grid grid-cols-1 gap-6">
              <div className="p-8 rounded-[32px] border border-zinc-100 hover:border-[#8b5cf6]/30 transition-colors group">
                <Code size={24} className="text-[#8b5cf6] mb-6" strokeWidth={1.5} />
                <h4 className="text-lg font-semibold text-zinc-900 lowercase">developer desk</h4>
                <p className="mt-2 text-sm text-zinc-500 font-light lowercase">report technical anomalies or suggest platform improvements.</p>
                <p className="mt-6 text-[#8b5cf6] text-sm font-medium">gadvanceproject@gmail.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

/* --- Sub-components --- */

const ContactCard = ({ icon, title, detail, desc }: { icon: React.ReactNode; title: string; detail: string; desc: string }) => (
  <div className="p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] bg-zinc-50 border border-zinc-100 transition-all hover:bg-white hover:shadow-xl hover:shadow-violet-100/20 group">
    <div className="h-12 w-12 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-[#8b5cf6] mb-8 shadow-sm">
      {icon}
    </div>
    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">{title}</h4>
    
    {/* Fixed responsiveness for long text/emails */}
    <p className="text-xl sm:text-2xl font-light text-zinc-900 lowercase mb-4 break-words overflow-hidden leading-tight">
      {detail}
    </p>
    
    <p className="text-sm text-zinc-500 font-light leading-relaxed lowercase">{desc}</p>
  </div>
);
const ResourceItem = ({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) => (
  <div className="flex flex-col space-y-6 p-2">
    <div className="text-[#8b5cf6]">{icon}</div>
    <h4 className="text-xl font-semibold text-zinc-900 lowercase">{title}</h4>
    <p className="text-zinc-500 font-light leading-7 lowercase">{desc}</p>
    <button className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8b5cf6] hover:gap-4 transition-all">
      view details <ArrowRight size={14} />
    </button>
  </div>
);

const ArrowRight = ({ size, className }: { size?: number; className?: string }) => (
  <svg 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export default SupportPage;