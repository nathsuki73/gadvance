"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoIcon from "@/app/assets/logo.png";
import { ArrowUp, Mail } from "lucide-react";
import { SUPPORT_EMAIL, supportMailto } from "@/app/lib/support";

type FooterLink = { href: string; label: string };

const LEARN_LINKS: FooterLink[] = [
  { href: "/explore", label: "explore courses" },
  { href: "/organization", label: "organizations" },
  { href: "/mental-health", label: "mental health resources" },
];

const HELP_LINKS: FooterLink[] = [
  { href: "/docs", label: "documentation" },
  { href: "/support", label: "help center" },
  { href: "/about", label: "about gadvance" },
];

const FooterColumn = ({ title, links }: { title: string; links: FooterLink[] }) => (
  <div className="lg:col-span-2">
    <h4 className="text-xs font-bold text-zinc-900 mb-4 uppercase tracking-[0.2em]">
      {title}
    </h4>
    <ul className="space-y-2.5 text-sm text-zinc-500 font-light lowercase">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="hover:text-[#8b5cf6] transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="bg-white border-t border-zinc-100 py-10 sm:py-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col space-y-4 lg:col-span-4">
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
              <span className="text-xl font-semibold tracking-tight text-zinc-900 lowercase">
                gadvance
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-light">
              Adaptive Gender and Development (GAD) e-learning. Assessments
              adjust to each learner using Bayesian Knowledge Tracing.
            </p>
          </div>

          <FooterColumn title="learn" links={LEARN_LINKS} />
          <FooterColumn title="help" links={HELP_LINKS} />

          {/* Support contact */}
          <div className="bg-gradient-to-br from-violet-50/60 via-zinc-50 to-white rounded-2xl p-5 border border-violet-100 shadow-sm sm:col-span-2 lg:col-span-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Mail size={14} className="text-[#8b5cf6]" aria-hidden="true" />
                <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-[0.2em]">
                  contact support
                </h4>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Questions, bug reports, account help, and security concerns
                all go to one inbox.
              </p>
            </div>
            <a
              href={supportMailto("support")}
              className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-[#8b5cf6] py-2.5 px-4 text-xs font-semibold tracking-wide text-white shadow-md shadow-violet-500/10 transition-all hover:bg-[#7c3aed] break-all"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-zinc-100 flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-[11px] text-zinc-400 tracking-widest uppercase text-center md:text-left">
            © {new Date().getFullYear()} gadvance · lspu college of computer
            studies
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

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 hover:border-violet-200 hover:bg-violet-50 hover:text-[#8b5cf6] transition-all active:scale-95 shrink-0"
              aria-label="Back to top"
            >
              <span>Top</span>
              <ArrowUp size={12} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
