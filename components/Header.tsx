"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { sepolia } from "wagmi/chains";

const portfolio =
  process.env.NEXT_PUBLIC_DEMO_PORTFOLIO?.trim() ||
  "https://web3-portfolio-pied.vercel.app";

export default function Header() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const wrongNetwork = isConnected && chainId !== sepolia.id;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          <div>
            <div className="font-mono text-sm tracking-tight">
              sepolia<span className="text-accent">.nft-gallery</span>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-white/40">
              ERC-721 · Testnet Demo
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={portfolio}
            target="_blank"
            rel="noreferrer"
            className="hidden font-mono text-[11px] text-white/50 transition hover:text-accent2 md:inline-block"
          >
            ← Portfolio
          </a>
          {wrongNetwork && (
            <span className="hidden rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-amber-400 md:inline-block">
              Switch to Sepolia
            </span>
          )}
          <ConnectButton
            chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
            showBalance={{ smallScreen: false, largeScreen: true }}
            accountStatus="address"
          />
        </div>
      </div>
    </header>
  );
}
