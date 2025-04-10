import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/organisms/Navigation";
import ClientFooter from "@/components/organisms/ClientFooter";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Property Agent | Find Your Dream Home",
  description: "Modern property recommendation platform with AI-powered chat assistance",
  icons: {
    icon: [
      { url: '/Dataly back brandmark.png', sizes: '32x32' },
      { url: '/Dataly back brandmark.png', sizes: '16x16' },
    ],
    apple: [
      { url: '/Dataly back brandmark.png' },
      { url: '/Dataly back brandmark.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`} suppressHydrationWarning>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <ClientFooter />
      </body>
    </html>
  );
}
