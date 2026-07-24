"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import { Twitter, Linkedin, Instagram } from "lucide-react";
import { useToast } from "./context/ToastContext";

const Footer = () => {
  const { showToast } = useToast();

  const socialLinks = [
    { name: "twitter", Icon: Twitter },
    { name: "linkedin", Icon: Linkedin },
    { name: "instagram", Icon: Instagram },
  ];

  const handleSocialClick = (platform: string) => {
    showToast(`${platform} coming soon!`, "info");
  };

  return (
    <footer className="bg-white border-t border-zinc-50 pt-16 sm:pt-24 pb-12">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Main Grid: 1 col on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Identity Section */}
          <div className="flex flex-col space-y-6 sm:space-y-8">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0 grayscale opacity-80">
                <Image
                  src={logoIcon}
                  alt="gadvance logo"
                  className="object-contain"
                  fill
                  sizes="32px"
                />
              </div>
              <span className="text-lg font-semibold tracking-tight text-zinc-800 lowercase">
                gadvance
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-light lowercase">
              providing the tools and education needed to advance gender
              equality within the philippine workplace and beyond.
            </p>
            <div className="flex gap-3">
              {socialLinks.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSocialClick(name)}
                  className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#8b5cf6] hover:bg-violet-50 transition-all duration-300 touch-manipulation focus:outline-none"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Programs Links */}
          <div className="sm:pl-4 lg:pl-0">
            <h4 className="text-xs font-bold text-zinc-900 mb-6 sm:mb-8 uppercase tracking-[0.2em]">
              programs
            </h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-light lowercase">
              <li>
                <Link
                  href="/explore"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  all courses
                </Link>
              </li>
              <li>
                <Link
                  href="/leadership"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  women in leadership
                </Link>
              </li>
              <li>
                <Link
                  href="/advocacy"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  workplace advocacy
                </Link>
              </li>
              <li>
                <Link
                  href="/wellness"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  mental health
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 mb-6 sm:mb-8 uppercase tracking-[0.2em]">
              resources
            </h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-light lowercase">
              <li>
                <Link
                  href="/news"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  articles & news
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  community forum
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  help center
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  our partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Section: Spans full width on mobile, 1 col on desktop */}
          <div className="bg-zinc-50/50 rounded-[32px] p-6 sm:p-8 border border-zinc-100/50 sm:col-span-2 lg:col-span-1">
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
                className="w-full bg-white px-4 py-3 rounded-xl border border-zinc-100 focus:outline-none focus:ring-4 focus:ring-violet-50 text-sm placeholder:text-zinc-300 lowercase"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#8b5cf6] text-white px-4 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-[#7c3aed] transition-colors">
                join
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Stacked on mobile, side-by-side on tablet/desktop */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-zinc-50 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-[10px] text-zinc-400 tracking-widest uppercase text-center md:text-left">
            © {new Date().getFullYear()} gadvance leadership
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <Link
              href="/privacy"
              className="hover:text-zinc-900 transition-colors"
            >
              privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-zinc-900 transition-colors"
            >
              terms
            </Link>
            <Link
              href="/cookies"
              className="hover:text-zinc-900 transition-colors"
            >
              cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
