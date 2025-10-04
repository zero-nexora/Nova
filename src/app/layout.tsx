import "./globals.css";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { TRPCReactProvider } from "@/trpc/client";
import { ModalProvider } from "@/providers/modal-provider";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nova Small | Premium Online Shopping Experience",
  description:
    "Nova Small is your trusted online shopping destination. Explore fashion, electronics, home essentials, beauty, and more — with great prices, secure checkout, and fast delivery.",
  keywords: [
    "Nova Small",
    "online shopping",
    "ecommerce",
    "fashion",
    "electronics",
    "home essentials",
    "beauty products",
    "premium shopping",
    "fast delivery",
  ],
  authors: [{ name: "Nova Small Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <TRPCReactProvider>
              <NuqsAdapter>
                {children}
                <Toaster />
                <ModalProvider />
              </NuqsAdapter>
            </TRPCReactProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
