
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://live-pahina-production.up.railway.app"),
  title: "Live Pahina",
  description: "Welcome to Live Pahina.",

  icons: {
    icon: "/live-pahina-favicon.png",
    shortcut: "/live-pahina-favicon.png",
    apple: "/live-pahina-favicon.png",
  },

  openGraph: {
    title: "Live Pahina",
    description: "Welcome to Live Pahina.",
    url: "https://live-pahina-production.up.railway.app",
    siteName: "Live Pahina",
    type: "website",
    images: [
      {
        url: "/live-pahina-logo.png",
        alt: "Live Pahina Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Live Pahina",
    description: "Welcome to Live Pahina.",
    images: ["/live-pahina-logo.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
