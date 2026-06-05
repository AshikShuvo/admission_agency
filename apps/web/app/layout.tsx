import type { Metadata } from "next";
import { Manrope, Source_Serif_4 } from "next/font/google";
import "./globals.css";

import { ToastProvider } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap"
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap"
});

const themeScript = `
(() => {
  try {
    const key = "admission-agency-theme";
    const stored = window.localStorage.getItem(key);
    const theme = stored === "light" || stored === "dark"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
  } catch {
    document.documentElement.classList.add("light");
  }
})();
`;

export const metadata: Metadata = {
  title: "Admission Agency",
  description: "Internal admissions operations system"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(manrope.variable, sourceSerif.variable)}>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
