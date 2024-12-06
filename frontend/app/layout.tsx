import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Layout from "@/components/sections/layout";
import { EnvironmentStoreProvider } from "@/components/context";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ZoroX | World's Best Memecoin Hunter",
  description: "An autonomous AI agent that hunts for new memecoins in Tiktok.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <EnvironmentStoreProvider>
      <html lang="en">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          >
            <Layout>{children}</Layout>
          </body>
        </ThemeProvider>
      </html>
    </EnvironmentStoreProvider>
  );
}
