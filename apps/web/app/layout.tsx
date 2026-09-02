import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITE_URL } from "@mazidi/config";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mazidi Group — Property, construction, IT services and iOS apps", template: "%s — Mazidi Group" },
  description:
    "Mazidi Group is a family of businesses run from London and Dubai: Mazidi Homes (RERA-registered off-plan brokerage), Mazidi Construction, Mazidi IT Services and an apps studio behind Muscle Map, Fitness Muscle Coach, Football Academy and RERA Exam Prep Dubai.",
  openGraph: { siteName: "Mazidi Group", type: "website" },
};

/** Set theme before paint to avoid FOUC; dark is the master-brand default. */
const themeScript = `(function(){try{var t=localStorage.getItem("mz-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){}})()`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${fraunces.variable} ${inter.variable} font-sans text-base leading-[1.65]`}>
        {children}
      </body>
    </html>
  );
}
