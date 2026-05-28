"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ value, onChange, options, placeholder = "Selecionar..." }: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-full bg-zinc-900/80 border border-zinc-800/70 rounded-xl px-4 py-2.5 text-[13px] transition-all",
          value ? "text-zinc-200" : "text-zinc-600",
          open && "border-zinc-500"
        )}
      >
        <span>{selected?.label ?? placeholder}</span>
        <ChevronDown
          className={cn(
            "size-4 text-zinc-500 transition-transform duration-200 flex-shrink-0 ml-2",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-zinc-700/60 bg-[#141414] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={opt.disabled}
              onClick={() => handleSelect(opt.value)}
              className={cn(
                "w-full text-left px-4 py-2.5 text-[13px] transition-colors",
                opt.value === value
                  ? "bg-red-500/12 text-zinc-100 border-l-2 border-red-500"
                  : "text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200 border-l-2 border-transparent",
                opt.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
