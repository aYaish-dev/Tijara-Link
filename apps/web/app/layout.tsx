import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import { cn } from "@/lib/utils";

import "./globals.css";
import AuthProvider from "./providers/AuthProvider";
import SiteHeader from "./components/SiteHeader";

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
    <html lang="en" dir="ltr">
      <body className={poppins.className}>
        <AuthProvider>
          <SiteHeader />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
