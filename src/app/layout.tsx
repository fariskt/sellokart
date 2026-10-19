import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});


export const metadata: Metadata = {
  title: {
    default: "Sellokart | Premium Online Store & Lifestyle Essentials",
    template: "%s | Sellokart",
  },
  description:
    "Shop curated fashion, premium streetwear, and lifestyle essentials at Sellokart. Exceptional quality, seamless checkout, and nationwide delivery.",
  icons: {
    icon: "/logo5.png",
    shortcut: "/logo5.png",
    apple: "/logo5.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable}`}>
      <body className="min-h-screen flex flex-col font-sans">
        <QueryProvider>
          {children}
        </QueryProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}