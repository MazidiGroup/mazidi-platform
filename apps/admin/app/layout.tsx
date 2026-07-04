import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", weight: ["400", "500", "600"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Admin — Mazidi Group", template: "%s — Mazidi Admin" },
  robots: { index: false }, // private app
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${fraunces.variable} ${inter.variable} font-sans text-base leading-[1.65]`}>
        {children}
      </body>
    </html>
  );
}
