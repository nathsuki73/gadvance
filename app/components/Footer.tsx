"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.ico";
import { Twitter, Linkedin, Instagram, ArrowUp } from "lucide-react";
import { useToast } from "./context/ToastContext";

const Footer = () => {
  const { showToast } = useToast();

  const socialLinks = [
    { name: "Twitter", Icon: Twitter },
    { name: "LinkedIn", Icon: Linkedin },
    { name: "Instagram", Icon: Instagram },
  ];

  const handleSocialClick = (platform: string) => {
    showToast(`${platform} coming soon!`, "info");
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
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-8 items-start">
          {/* Brand Identity */}
          <div className="flex flex-col space-y-4 sm:col-span-2 lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src={logoIcon}
                  alt="GADvance logo"
                  className="object-contain"
                  fill
                  sizes="32px"
                />
              </div>

              <span className="text-xl font-semibold tracking-tight text-zinc-900">
                GADvance
              </span>
            </div>

            <p className="max-w-md text-sm font-light leading-relaxed text-zinc-500">
              Providing accessible tools and modular education to advance gender
              awareness and equality across schools, institutions, and workplaces.
            </p>

            <div className="flex gap-2.5 pt-1">
              {socialLinks.map(({ name, Icon }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSocialClick(name)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-100 bg-zinc-50 text-zinc-400 transition-all duration-300 hover:bg-violet-50 hover:text-[#8b5cf6] focus:outline-none touch-manipulation cursor-pointer"
                  aria-label={name}
                >
                  <Icon className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
              Platform
            </h4>

            <ul className="space-y-2.5 text-sm font-light text-zinc-500">
              <li>
                <Link
                  href="/explore"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  Explore Courses
                </Link>
              </li>

              <li>
                <Link
                  href="/organization"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  Organizations
                </Link>
              </li>

              <li>
                <Link
                  href="/workspace"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  My Workspace
                </Link>
              </li>

            </ul>
          </div>

          {/* About & Support Navigation */}
          <div className="lg:col-span-2">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
              About GADvance
            </h4>

            <ul className="space-y-2.5 text-sm font-light text-zinc-500">
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  About the Project
                </Link>
              </li>

              <li>
                <Link
                  href="/community-forum"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  Community Forum
                </Link>
              </li>

              <li>
                <Link
                  href="/support"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  Support Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Navigation */}
          <div className="lg:col-span-3">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-zinc-900">
              Resources
            </h4>

            <ul className="space-y-2.5 text-sm font-light text-zinc-500">
              <li>
                <Link
                  href="/mental-health"
                  className="transition-colors hover:text-[#8b5cf6]"
                >
                  Mental Health Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[11px] text-zinc-400 tracking-widest uppercase text-center md:text-left">
            © {new Date().getFullYear()} GADvance. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400">
              <Link
                href="/privacy-policy"
                className="hover:text-[#8b5cf6] transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="hover:text-[#8b5cf6] transition-colors"
              >
                Terms of Service
              </Link>
              <a
                href="mailto:gadvanceproject@gmail.com"
                className="hover:text-[#8b5cf6] transition-colors"
              >
                Support Desk
              </a>
            </div>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:border-violet-200 hover:bg-violet-50 hover:text-[#8b5cf6] transition-all active:scale-95 shrink-0 cursor-pointer"
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