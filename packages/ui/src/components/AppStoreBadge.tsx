import { clsx } from "clsx";

export function AppleMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.37 12.6c-.02-2.36 1.93-3.5 2.02-3.56-1.1-1.61-2.81-1.83-3.42-1.85-1.45-.15-2.84.86-3.58.86-.74 0-1.88-.84-3.09-.82-1.59.02-3.05.92-3.87 2.35-1.65 2.86-.42 7.1 1.18 9.42.79 1.14 1.72 2.42 2.95 2.37 1.19-.05 1.64-.77 3.07-.77 1.44 0 1.84.77 3.1.75 1.28-.02 2.09-1.16 2.87-2.3.9-1.32 1.28-2.6 1.3-2.66-.03-.01-2.49-.96-2.53-3.79zM14.02 5.66c.65-.79 1.09-1.89.97-2.98-.94.04-2.07.62-2.75 1.41-.6.7-1.13 1.82-.99 2.89 1.05.08 2.11-.53 2.77-1.32z" />
    </svg>
  );
}

/**
 * App Store call-to-action. `status: "live"` renders a download badge that
 * links to the listing; `"pending"` renders a quiet "in review" badge so a
 * page can ship before Apple approves the build.
 */
export function AppStoreBadge({
  url, status, className, size = "md",
}: { url?: string; status: "live" | "pending"; className?: string; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-10 px-3.5" : "h-12 px-4";
  if (status === "live" && url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={clsx(
          "inline-flex items-center gap-2.5 rounded-[10px] border border-[#3A4152] bg-[#0B0D12] text-white transition-all duration-200 ease-meridian hover:-translate-y-0.5 hover:border-[#6B7180]",
          dims, className,
        )}
      >
        <AppleMark className={size === "sm" ? "h-5 w-5" : "h-6 w-6"} />
        <span className="flex flex-col leading-none">
          <span className="text-[.6rem] uppercase tracking-[.04em] opacity-80">Download on the</span>
          <span className={clsx("font-semibold", size === "sm" ? "text-[.95rem]" : "text-[1.1rem]")}>App Store</span>
        </span>
      </a>
    );
  }
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2.5 rounded-[10px] border border-dashed border-gold/50 bg-gold/5 text-t1",
        dims, className,
      )}
    >
      <AppleMark className={clsx("text-gold", size === "sm" ? "h-5 w-5" : "h-6 w-6")} />
      <span className="flex flex-col leading-none">
        <span className="text-[.6rem] uppercase tracking-[.04em] text-gold">Submitted to Apple</span>
        <span className={clsx("font-semibold", size === "sm" ? "text-[.95rem]" : "text-[1.1rem]")}>Awaiting approval</span>
      </span>
    </span>
  );
}
