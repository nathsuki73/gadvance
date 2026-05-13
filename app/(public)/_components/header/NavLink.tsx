"use client";
import Link from "next/link";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link 
      href={href} 
      className="group relative py-1 text-sm font-medium text-zinc-600 transition-colors hover:text-black"
    >
      {children}
      {/* The Minimal Line Slider */}
      <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-[#00A9D1] transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}