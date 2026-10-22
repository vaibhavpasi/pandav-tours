import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import { ToastProvider } from "@/components/ui/Toast";
import { appUrl } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "Pandav Tours & Travel — Cab & Taxi Service in Nashik",
    template: "%s | Pandav Tours & Travel",
  },
  description:
    "Book local rides, outstation trips and holiday travel in Nashik with Pandav Tours & Travel.",
  applicationName: "Pandav Tours & Travel",
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Pandav Tours & Travel",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
