import type { PillarKey } from "@mazidi/config";

/** DB enum ("BUILD") → config key ("build"). */
export const pillarKey = (p: string): PillarKey => p.toLowerCase() as PillarKey;

export const pillarText: Record<PillarKey, string> = {
  build: "text-build", run: "text-run", grow: "text-grow",
};
export const pillarBg: Record<PillarKey, string> = {
  build: "bg-build/15 text-build", run: "bg-run/15 text-run", grow: "bg-grow/15 text-grow",
};
export const pillarBorder: Record<PillarKey, string> = {
  build: "border-build", run: "border-run", grow: "border-grow",
};
