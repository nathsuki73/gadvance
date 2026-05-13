import React from "react";
import Link from "next/link";
import logoIcon from "@/app/assets/logo.ico";
import { Twitter, Linkedin, Instagram } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { name: "twitter", Icon: Twitter, href: "#" },
    { name: "linkedin", Icon: Linkedin, href: "#" },
    { name: "instagram", Icon: Instagram, href: "#" },
  ];

  return (
    <footer className="bg-white border-t border-zinc-50 pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-4 md:grid-cols-2">
          
          {/* brand identity section */}
          <div className="flex flex-col space-y-8">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0 grayscale opacity-80">
                <img
                  src={logoIcon.src}
                  alt="gadvance logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-lg font-semibold tracking-tight text-zinc-800 lowercase">
                gadvance
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-light lowercase">
              providing the tools and education needed to advance gender equality 
              within the philippine workplace and beyond.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ name, Icon, href }) => (
                <Link
                  key={name}
                  href={href}
                  className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#00aeef] hover:bg-sky-50 transition-all duration-300"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* programs links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 mb-8 uppercase tracking-[0.2em]">programs</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-light lowercase">
              <li><Link href="/courses" className="hover:text-[#00aeef] transition-colors">all courses</Link></li>
              <li><Link href="/leadership" className="hover:text-[#00aeef] transition-colors">women in leadership</Link></li>
              <li><Link href="/advocacy" className="hover:text-[#00aeef] transition-colors">workplace advocacy</Link></li>
              <li><Link href="/wellness" className="hover:text-[#00aeef] transition-colors">mental health</Link></li>
            </ul>
          </div>

          {/* resources links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 mb-8 uppercase tracking-[0.2em]">resources</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-light lowercase">
              <li><Link href="/blog" className="hover:text-[#00aeef] transition-colors">articles & news</Link></li>
              <li><Link href="/community" className="hover:text-[#00aeef] transition-colors">community forum</Link></li>
              <li><Link href="/faq" className="hover:text-[#00aeef] transition-colors">help center</Link></li>
              <li><Link href="/partners" className="hover:text-[#00aeef] transition-colors">our partners</Link></li>
            </ul>
          </div>

          {/* newsletter section */}
          <div className="bg-zinc-50/50 rounded-[32px] p-8 border border-zinc-100/50">
            <h4 className="text-xs font-bold text-zinc-900 mb-2 uppercase tracking-[0.2em]">
              newsletter
            </h4>
            <p className="text-xs text-zinc-400 mb-6 font-light lowercase">
              weekly insights on equality and leadership growth.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="email address"
                className="w-full bg-white px-4 py-3 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-sky-100 text-sm placeholder:text-zinc-300 lowercase"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#00aeef] text-white px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#0096ce] transition-colors">
                join
              </button>
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-24 pt-8 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-zinc-400 tracking-widest uppercase">
            © {new Date().getFullYear()} gadvance leadership
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Link href="/privacy" className="hover:text-zinc-900 transition-colors">privacy</Link>
            <Link href="/terms" className="hover:text-zinc-900 transition-colors">terms</Link>
            <Link href="/cookies" className="hover:text-zinc-900 transition-colors">cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;