"use client";

import { useState, forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "ref"> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  autoComplete?: string;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, icon, suffix, className, type = "text", autoComplete, disabled, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      props.onChange?.(e);
    };

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative group">
        {/* Glow effect behind input */}
        <div
          className={cn(
            "absolute -inset-[1px] rounded-xl opacity-0 transition-opacity duration-500 pointer-events-none",
            isFocused && "opacity-100"
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(255,31,31,0.4), rgba(255,80,80,0.15), rgba(255,31,31,0.4))",
            filter: "blur(8px)",
          }}
        />

        <div
          className={cn(
            "relative flex items-center h-12 rounded-xl border transition-all duration-300 overflow-hidden",
            "bg-zinc-950/70 backdrop-blur-sm",
            isFocused
              ? "border-red-500/40 shadow-[0_0_20px_rgba(255,31,31,0.15),inset_0_1px_0_rgba(255,255,255,0.05)]"
              : "border-zinc-700/40 shadow-none",
            error && !isFocused && "border-red-500/50 shadow-[0_0_12px_rgba(255,31,31,0.1)]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* Animated border gradient on focus */}
          <div
            className={cn(
              "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 pointer-events-none",
              isFocused && "opacity-100"
            )}
          >
            <div
              className="absolute inset-[-1px] rounded-xl"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,31,31,0.3), rgba(255,80,80,0.2), rgba(255,31,31,0.3), transparent)",
                backgroundSize: "200% 100%",
                animation: isFocused ? "border-shine 2s linear infinite" : "none",
                mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: "1px",
              }}
            />
          </div>

          {/* Icon prefix */}
          {icon && (
            <div
              className={cn(
                "flex items-center justify-center pl-3 pr-2 transition-colors duration-300",
                isFocused ? "text-red-400" : "text-zinc-500"
              )}
            >
              {icon}
            </div>
          )}

          {/* Input field */}
          <div className="relative flex-1 min-w-0">
            <label
              className={cn(
                "absolute left-0 pointer-events-none transition-all duration-300 origin-left",
                isFloating
                  ? "top-[2px] text-[10px] text-red-400/80 font-medium tracking-wide"
                  : "top-1/2 -translate-y-1/2 text-sm text-zinc-400"
              )}
            >
              {label}
            </label>
            <input
              ref={ref}
              type={type}
              autoComplete={autoComplete}
              disabled={disabled}
              {...props}
              onChange={handleChange}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              className={cn(
                "w-full bg-transparent text-zinc-100 text-sm outline-none pt-5 pb-1.5 px-3",
                "placeholder:text-transparent",
                "[color-scheme:dark]",
                className
              )}
              style={{
                // Kill autofill blue background
                WebkitBoxShadow: "0 0 0 30px #09090b inset",
                WebkitTextFillColor: "#fafafa",
                caretColor: "#ff1f1f",
              }}
            />
          </div>

          {/* Suffix (eye toggle etc) */}
          {suffix && (
            <div className="flex items-center justify-center pr-3 pl-2">
              {suffix}
            </div>
          )}
        </div>

        {/* Error message with shake */}
        {error && (
          <p className="text-xs text-red-400 mt-1.5 ml-1 animate-shake">{error}</p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
