"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

interface SmoothAnchorProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  offset?: number;
}

export function SmoothAnchor({ children, href, offset = 96, onClick, ...props }: SmoothAnchorProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);

        if (!href?.startsWith("#") || event.defaultPrevented) {
          return;
        }

        const target = document.querySelector(href);

        if (!target) {
          return;
        }

        event.preventDefault();

        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }}
      {...props}
    >
      {children}
    </a>
  );
}
