import type { Metadata } from "next";
import { Sarabun, Kanit } from "next/font/google";
import { LanguageProvider } from "@/lib/language-context";
import Footer from "@/components/Footer";
import "./globals.css";

const sarabun = Sarabun({
  subsets: ["latin", "thai"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sarabun",
  display: "swap",
});

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["500", "600", "700"],
  variable: "--font-kanit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Thai Driving Theory Test",
  description:
    "Prepare for the Thailand driving license theory exam with 150 official questions. Practice in exam mode, training mode, or review your weak points.",
  keywords: [
    "Thailand driving test",
    "driving theory exam",
    "Thai license",
    "driving test practice",
  ],
  openGraph: {
    title: "Thai Driving Theory Test",
    description: "Prepare for the Thailand driving license theory exam",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sarabun.variable} ${kanit.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1a237e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ThaiDrive" />
      </head>
      <body className="antialiased">
        <LanguageProvider>
          {children}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
