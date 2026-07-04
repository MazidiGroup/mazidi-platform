import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 font-display text-[1.28rem] font-semibold tracking-[-.01em]">
      <svg viewBox="0 0 40 40" fill="none" className="h-[34px] w-[34px] flex-none" aria-hidden>
        <rect x="11" y="11" width="18" height="18" transform="rotate(45 20 20)" stroke="#C9A461" strokeWidth="2" />
        <rect x="16" y="16" width="8" height="8" transform="rotate(45 20 20)" fill="#C9A461" />
      </svg>
      Mazidi Group
    </Link>
  );
}
