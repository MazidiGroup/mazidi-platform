import { clsx } from "clsx";

/** Dashboard KPI card (docs/02 §Portal components). */
export function KPICard({
  label, value, delta, up = true,
}: { label: string; value: string; delta?: string; up?: boolean }) {
  return (
    <div className="rounded-md border border-line bg-bg2 p-[22px]">
      <span className="text-[.78rem] font-semibold text-t3">{label}</span>
      <b className="mb-1 mt-1.5 block font-display text-[1.9rem] font-medium tabular-nums">{value}</b>
      {delta && (
        <span className={clsx("text-[.76rem] font-semibold", up ? "text-success" : "text-danger")}>
          {up ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}
