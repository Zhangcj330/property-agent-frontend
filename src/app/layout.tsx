import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/organisms/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Property Agent | Find Your Dream Home",
  description: "Modern property recommendation platform with AI-powered chat assistance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Navigation />
        <main className="flex-grow">{children}</main>
        <footer className="bg-neutral-800 text-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center">© {new Date().getFullYear()} Property Agent. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
