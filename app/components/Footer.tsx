import React from "react";
import Link from "next/link";
import logoIcon from "@/app/assets/logo.ico";
import { Twitter, Linkedin, Instagram, ArrowRight } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { name: "Twitter", Icon: Twitter, href: "#" },
    { name: "LinkedIn", Icon: Linkedin, href: "#" },
    { name: "Instagram", Icon: Instagram, href: "#" },
  ];
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* Brand Identity Section */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-2">
              <div className="relative h-9 w-9 shrink-0">
                <img
                  src={logoIcon.src}
                  alt="GADVance logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-semibold tracking-tight text-gray-800">
                GADVance
              </span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Turning learning into real change. We provide the tools and
              education needed to advance gender equality globally.
            </p>
            <div className="flex gap-4">
              {socialLinks.map(({ name, Icon, href }) => (
                <Link
                  key={name}
                  href={href}
                  className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-zinc-500 hover:text-teal-600 hover:bg-teal-50 transition-all duration-200 border border-transparent hover:border-teal-100"
                  aria-label={name}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Programs Links */}
          <div>
            <h4 className="font-bold text-zinc-900 mb-6">Programs</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li>
                <Link
                  href="/courses"
                  className="hover:text-teal-600 transition-colors"
                >
                  All Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/leadership"
                  className="hover:text-teal-600 transition-colors"
                >
                  Women in Leadership
                </Link>
              </li>
              <li>
                <Link
                  href="/advocacy"
                  className="hover:text-teal-600 transition-colors"
                >
                  Workplace Advocacy
                </Link>
              </li>
              <li>
                <Link
                  href="/wellness"
                  className="hover:text-teal-600 transition-colors"
                >
                  Mental Health
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-bold text-zinc-900 mb-6">Resources</h4>
            <ul className="space-y-4 text-sm text-zinc-500">
              <li>
                <Link
                  href="/blog"
                  className="hover:text-teal-600 transition-colors"
                >
                  Articles & News
                </Link>
              </li>
              <li>
                <Link
                  href="/community"
                  className="hover:text-teal-600 transition-colors"
                >
                  Community Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-teal-600 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/partners"
                  className="hover:text-teal-600 transition-colors"
                >
                  Our Partners
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter/CTA Section */}
          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-zinc-900 mb-2">
                Join the movement
              </h4>
              <p className="text-xs text-zinc-500 mb-4">
                Weekly insights on equality and growth.
              </p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-teal-600 text-white px-3 rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-400">
            © {new Date().getFullYear()} Gadvance. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs font-medium text-zinc-400">
            <Link href="/privacy" className="hover:text-zinc-900">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-zinc-900">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-zinc-900">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
