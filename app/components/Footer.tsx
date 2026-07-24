"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import { Twitter, Linkedin, Instagram, Send } from "lucide-react";
import { useToast } from "./context/ToastContext";

const Footer = () => {
  const { showToast } = useToast();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const socialLinks = [
    { name: "Twitter", Icon: Twitter },
    { name: "LinkedIn", Icon: Linkedin },
    { name: "Instagram", Icon: Instagram },
  ];

  const handleSocialClick = (platform: string) => {
    showToast(`${platform} coming soon!`, "info");
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }
    showToast("Thank you for subscribing to GADvance updates!", "success");
    setNewsletterEmail("");
  };

  return (
    <footer className="bg-white border-t border-zinc-100 pt-16 sm:pt-24 pb-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Main Grid: 1 col mobile, 2 col tablet, 12-column flex on desktop */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Identity Section (4 Cols Desktop) */}
          <div className="flex flex-col space-y-6 sm:space-y-8 lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 shrink-0">
                <Image
                  src={logoIcon}
                  alt="gadvance logo"
                  className="object-contain"
                  fill
                  sizes="36px"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-zinc-900 lowercase">
                gadvance
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-light lowercase">
              providing the tools and education needed to advance gender
              equality within the philippine workplace and beyond.
            </p>
            <div className="flex gap-3 pt-2">
              {socialLinks.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSocialClick(name)}
                  className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#8b5cf6] hover:bg-violet-50 transition-all duration-300 touch-manipulation focus:outline-none border border-zinc-100"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Programs Links (2 Cols Desktop) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-zinc-900 mb-6 uppercase tracking-[0.2em]">
              programs
            </h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-light lowercase">
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
                  href="/mental-health"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  mental health
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links (2 Cols Desktop) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-zinc-900 mb-6 uppercase tracking-[0.2em]">
              resources
            </h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-light lowercase">
              <li>
                <Link
                  href="/articles-and-news"
                  className="hover:text-[#8b5cf6] transition-colors"
                >
                  articles & news
                </Link>
              </li>
              <li>
                <Link
                  href="/community-forum"
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
            </ul>
          </div>

          {/* Prominent Newsletter Box (4 Cols Desktop) */}
          <div className="bg-gradient-to-br from-violet-50/60 via-zinc-50 to-white rounded-3xl p-6 sm:p-8 border border-violet-100 shadow-sm sm:col-span-2 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Send size={16} className="text-[#8b5cf6]" />
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-[0.2em]">
                  stay updated
                </h4>
              </div>
              <h5 className="text-base sm:text-lg font-medium text-zinc-900 leading-snug">
                Join the GADvance Newsletter
              </h5>
              <p className="text-xs sm:text-sm text-zinc-500 mt-2 font-light leading-relaxed">
                Receive weekly insights on Philippine gender frameworks, policy
                directives, and leadership development.
              </p>
            </div>

            <form onSubmit={handleNewsletterSubmit} className="mt-6 space-y-3">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full bg-white px-4 py-3.5 rounded-2xl border border-zinc-200 focus:outline-none focus:border-[#8b5cf6] focus:ring-4 focus:ring-violet-100 text-sm placeholder:text-zinc-400 text-zinc-800 transition-all shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#8b5cf6] text-white py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide hover:bg-[#7c3aed] transition-all shadow-md shadow-violet-500/10 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>Subscribe to Insights</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-zinc-100 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-[11px] text-zinc-400 tracking-widest uppercase text-center md:text-left">
            © {new Date().getFullYear()} gadvance leadership. all rights
            reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
            <Link
              href="/privacy-policy"
              className="hover:text-[#8b5cf6] transition-colors"
            >
              privacy policy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-[#8b5cf6] transition-colors"
            >
              terms of service
            </Link>
            <Link
              href="/support"
              className="hover:text-[#8b5cf6] transition-colors"
            >
              contact support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
