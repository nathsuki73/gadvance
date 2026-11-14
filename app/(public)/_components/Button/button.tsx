"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

interface ButtonProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}

export function Button({
  href,
  onClick,
  children,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const pointerOrigin = useRef({ x: 0, y: 0 });

  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-6 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md",
    ghost: "bg-transparent text-zinc-600 hover:text-black hover:bg-zinc-50",
  };

  const combinedStyles = `${baseStyles} ${variants[variant]} ${className}`;

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerOrigin.current = { x: e.clientX, y: e.clientY };

    // Clear active text selection instantly on mouse down to prevent freezes
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

    // Prevent rapid-click thread locks in Chromium browsers
    if (isPending) {
      e.preventDefault();
      return;
    }

    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
    }

    e.preventDefault();
    startTransition(() => {
      router.push(href);
    });

    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      href={href}
      draggable={false}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={combinedStyles}
    >
      {children}
    </Link>
  );
}
