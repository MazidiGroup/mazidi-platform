import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Muscle Map — Privacy Policy",
  description: "How the Muscle Map: Workout Anatomy app handles your data.",
  alternates: { canonical: "/musclemap/privacy" },
};

export default function MuscleMapPrivacy() {
  return <LegalPage kind="privacy" title="Privacy Policy" />;
}
