import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITE_URL } from "@mazidi/config";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mazidi Group — Build it. Run it. Grow it.", template: "%s — Mazidi Group" },
  description:
    "Mazidi Group helps entrepreneurs, investors and businesses build companies, operate them efficiently and accelerate their growth through one connected ecosystem.",
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
