"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pointerOrigin = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerOrigin.current = { x: e.clientX, y: e.clientY };

    // CRITICAL FIX: The moment the user clicks down, instantly clear any active
    // text highlighting on the page. This stops Chromium from triggering a text-drag
    // freeze when clicking a link through highlighted text.
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      selection.removeAllRanges();
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow opening in a new tab via Ctrl/Cmd + Click
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      return;
    }

    // Ignore drag-clicks
    const moveX = Math.abs(e.clientX - pointerOrigin.current.x);
    const moveY = Math.abs(e.clientY - pointerOrigin.current.y);
    if (moveX > 6 || moveY > 6) {
      e.preventDefault();
      return;
    }

    // Prevent rapid-click thread locks
    if (isPending) {
      e.preventDefault();
      return;
    }

    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      draggable={false} // Disables Chromium's native link-dragging engine
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className="group relative py-1 text-sm font-medium text-zinc-600 transition-all duration-200 hover:text-zinc-900 select-none cursor-pointer"
    >
      {children}
      {/* Sliding underline hover animation */}
      <span className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </Link>
  );
}
