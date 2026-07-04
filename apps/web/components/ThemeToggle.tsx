"use client";

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      className="grid h-[38px] w-[38px] place-items-center rounded-full border border-line2 text-t2 transition-colors hover:border-gold hover:text-gold"
      onClick={() => {
        const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        try { localStorage.setItem("mz-theme", next); } catch {}
      }}
    >
      ◐
    </button>
  );
}
