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
  openGraph: {
    title: "Nova Small | Premium Online Shopping Experience",
    description:
      "Shop smarter at Nova Small. Discover top-quality products, enjoy exclusive deals, and experience fast, reliable delivery.",
    url: "https://novasmall.com",
    siteName: "Nova Small",
    images: [
      {
        url: "https://novasmall.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Nova Small - Premium Online Shopping",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nova Small | Premium Online Shopping Experience",
    description:
      "Nova Small brings you a premium online shopping experience with a wide selection, competitive prices, and trusted service.",
    images: ["https://novasmall.com/og-image.png"],
  },
  category: "ecommerce",
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
