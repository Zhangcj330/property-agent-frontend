import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/organisms/Navigation";
import ClientFooter from "@/components/organisms/ClientFooter";
import { AuthProvider } from "@/contexts/AuthContext";

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
      { url: '/brickAI.png', sizes: '64x64' },
      { url: '/brickAI.png', sizes: '32x32' },
    ],
    apple: [
      { url: '/brickAI.png' },
      { url: '/brickAI.png', sizes: '180x180', type: 'image/png' },
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
        <AuthProvider>
          <Navigation />
          <main className="flex-grow">{children}</main>
          <ClientFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
