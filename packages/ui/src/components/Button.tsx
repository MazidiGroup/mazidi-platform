import Link from "next/link";
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md";

const base =
  "inline-flex items-center gap-2 rounded-full font-semibold transition-all duration-200 ease-meridian whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-gold text-[#14100A] hover:bg-gold-soft hover:shadow-[0_8px_28px_rgba(201,164,97,.32)]",
  outline: "border border-line2 text-t1 hover:border-gold hover:text-gold",
  ghost: "text-t2 hover:text-gold",
  dark: "bg-t1 text-bg hover:opacity-85",
};
const sizes: Record<Size, string> = {
  sm: "px-[18px] py-[9px] text-[.85rem]",
  md: "px-[26px] py-[14px] text-[.92rem]",
};

interface OwnProps {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary", size = "md", className, children, ...rest
}: OwnProps & ComponentProps<"button">) {
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary", size = "md", className, children, href, ...rest
}: OwnProps & ComponentProps<typeof Link>) {
  return (
    <Link href={href} className={clsx(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}

export const Arrow = () => (
  <svg viewBox="0 0 16 16" fill="none" className="h-[15px] w-[15px]" aria-hidden>
    <path d="M2 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);
