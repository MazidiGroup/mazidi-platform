import type { Metadata } from "next";
import { LegalPage } from "../LegalPage";

export const metadata: Metadata = {
  title: "Muscle Map — Terms of Use",
  description: "Terms of Use (EULA) for the Muscle Map: Workout Anatomy app and Muscle Map Premium.",
  alternates: { canonical: "/musclemap/terms" },
};

export default function MuscleMapTerms() {
  return <LegalPage kind="terms" title="Terms of Use" />;
}
