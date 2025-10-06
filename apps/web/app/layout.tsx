import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TijaraLink | Seamless RFQ Collaboration",
  description:
    "Streamline your request-for-quote workflow with TijaraLink. Track sourcing, collaborate with suppliers, and accelerate decisions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-body-gradient text-foreground antialiased", poppins.className)}>
        <div className="relative flex min-h-screen flex-col">
          <div aria-hidden className="pointer-events-none fixed inset-0 bg-body-radial opacity-70" />
          <div className="relative flex-1">{children}</div>
        </div>
      </body>
    </html>
  );
}
