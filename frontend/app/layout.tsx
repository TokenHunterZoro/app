import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import Layout from "@/components/sections/layout";
import { EnvironmentStoreProvider } from "@/components/context";
import { Toaster } from "@/components/ui/toaster";

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

// export const metadata: Metadata = {
//   title: "ZoroX | World's Best Memecoin Hunter",
//   description: "An autonomous AI agent that hunts for new memecoins in Tiktok.",
// };
export const metadata: Metadata = {
  twitter: {
    card: "summary_large_image",
    site: "@yourusername",
    title: "Web3 Transaction Interface",
    description: "Send ETH directly from Twitter",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-screen h-screen overflow-hidden">
      <iframe
        src="https://zorox-ai.vercel.app"
        className="w-full h-full border-0"
      />
    </div>
  );
  // return (
  //   <EnvironmentStoreProvider>
  //     <html lang="en">
  //       <ThemeProvider
  //         attribute="class"
  //         defaultTheme="dark"
  //         forcedTheme="dark"
  //         disableTransitionOnChange
  //       >
  //         <body
  //           className={`${geistSans.variable} ${geistMono.variable} antialiased select-none`}
  //         >
  //           <Layout>{children}</Layout>
  //           <Toaster />
  //         </body>
  //       </ThemeProvider>
  //     </html>
  //   </EnvironmentStoreProvider>
  // );
}
