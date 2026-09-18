"use client";

import { useAccount, useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { myNftAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS, IS_CONTRACT_CONFIGURED } from "@/lib/wagmi";
import NFTCard from "./NFTCard";
import Reveal from "./Reveal";

export default function Gallery() {
  const { address, isConnected } = useAccount();

  const { data: tokenIds, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "tokensOfOwner",
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: {
      enabled: IS_CONTRACT_CONFIGURED && !!address,
      refetchInterval: 10_000,
    },
  });

  if (!IS_CONTRACT_CONFIGURED) return null;

  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Your NFTs</h2>
          <p className="mt-1 text-sm text-white/55">
            Tokens owned by the connected wallet, queried on-chain via{" "}
            <code className="font-mono text-xs text-accent2">tokensOfOwner</code>
            .
          </p>
        </div>
        {tokenIds && (
          <span className="font-mono text-sm text-white/50">
            {tokenIds.length} item{tokenIds.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {!isConnected && (
        <EmptyState
          title="Connect your wallet"
          body="Once connected, your Sepolia NFTs from this collection will appear here."
        />
      )}

      {isConnected && isLoading && (
        <EmptyState title="Loading…" body="Querying on-chain ownership." />
      )}

      {isConnected && !isLoading && tokenIds && tokenIds.length === 0 && (
        <EmptyState
          title="No NFTs yet"
          body="Mint your first token above — it costs 0.001 Sepolia ETH."
        />
      )}

      {isConnected && tokenIds && tokenIds.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(tokenIds as bigint[]).map((id, i) => (
            <Reveal key={id.toString()} delay={Math.min(i, 8) * 70}>
              <NFTCard tokenId={id} />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/30 p-10 text-center">
      <div className="mb-1 text-sm font-medium text-white/80">{title}</div>
      <div className="text-xs text-white/50">{body}</div>
    </div>
  );
}
