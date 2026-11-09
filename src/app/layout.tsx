import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tollway — 100ms Micro-Payment, Pay-to-Unlock & Self-Paying $KNTQ Pass",
  description:
    "Universal 100ms payment rail on Elysium L2 for APIs (x402), no-code digital files (TollLink), instant revenue splits, and self-paying $KNTQ yield vaults.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans selection:bg-emerald-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}
