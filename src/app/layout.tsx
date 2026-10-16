import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
// import { Inter, Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { QueryProvider } from "@/providers/query-provider";

export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

/*
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
});
*/

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
    <html lang="en" className={`${bricolage.variable}`}>
      <Toaster position="top-right"/>
      <body className="min-h-screen flex flex-col font-sans">
        <QueryProvider>
          <div className="flex-1 flex flex-col w-full">
            {children}
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}

