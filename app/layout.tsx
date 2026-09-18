import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Providers from "./providers";
import Header from "@/components/Header";
import Background from "@/components/Background";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Sepolia NFT Gallery — Web3 Demo",
  description:
    "Mint and showcase ERC-721 NFTs on Sepolia testnet. Built with Next.js 15, wagmi v2, viem, RainbowKit, Solidity, Hardhat.",
  openGraph: {
    title: "Sepolia NFT Gallery",
    description: "Mint ERC-721 NFTs on Sepolia testnet.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="relative min-h-screen bg-bg font-sans antialiased">
        <Providers>
          <Background />
          <Header />
          <main className="mx-auto max-w-6xl px-6 py-12">{children}</main>
          <footer className="border-t border-border/60 py-6 text-center font-mono text-xs text-white/40">
            Sepolia testnet only · No real funds · Built as a Web3 portfolio
            demo
          </footer>
        </Providers>
      </body>
    </html>
  );
}
