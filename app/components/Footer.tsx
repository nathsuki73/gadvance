"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import { Twitter, Linkedin, Instagram, Send, ArrowUp } from "lucide-react";
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-white border-t border-zinc-100 py-10 sm:py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Brand Identity Section (4 Cols Desktop) */}
          <div className="flex flex-col space-y-4 lg:col-span-4">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src={logoIcon}
                  alt="gadvance logo"
                  className="object-contain"
                  fill
                  sizes="32px"
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
            <div className="flex gap-2.5 pt-1">
              {socialLinks.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSocialClick(name)}
                  className="w-9 h-9 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 hover:text-[#8b5cf6] hover:bg-violet-50 transition-all duration-300 touch-manipulation focus:outline-none border border-zinc-100"
                  aria-label={name}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Programs Links (2 Cols Desktop) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-zinc-900 mb-4 uppercase tracking-[0.2em]">
              programs
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-500 font-light lowercase">
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
            <h4 className="text-xs font-bold text-zinc-900 mb-4 uppercase tracking-[0.2em]">
              resources
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-500 font-light lowercase">
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

          {/* Compact Newsletter Box (4 Cols Desktop) */}
          <div className="bg-gradient-to-br from-violet-50/60 via-zinc-50 to-white rounded-2xl p-5 border border-violet-100 shadow-sm sm:col-span-2 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Send size={14} className="text-[#8b5cf6]" />
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-[0.2em]">
                  stay updated
                </h4>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Receive insights on Philippine gender frameworks, policy
                directives, and leadership.
              </p>
            </div>

            <form
              onSubmit={handleNewsletterSubmit}
              className="mt-4 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="w-full bg-white px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-violet-100 text-xs placeholder:text-zinc-400 text-zinc-800 transition-all shadow-sm"
              />
              <button
                type="submit"
                className="bg-[#8b5cf6] text-white py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wide hover:bg-[#7c3aed] transition-all shadow-md shadow-violet-500/10 active:scale-[0.98] shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[11px] text-zinc-400 tracking-widest uppercase text-center md:text-left">
            © {new Date().getFullYear()} gadvance leadership. all rights
            reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
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

            {/* Back to Top Button */}
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:border-violet-200 hover:bg-violet-50 hover:text-[#8b5cf6] transition-all active:scale-95 shrink-0"
              aria-label="Back to top"
            >
              <span>Top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
