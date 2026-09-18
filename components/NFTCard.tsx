"use client";

import { useEffect, useState } from "react";
import { useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { myNftAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS } from "@/lib/wagmi";

type Metadata = {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{ trait_type?: string; value?: string | number }>;
};

/** Convert ipfs://… to a public https gateway URL so <img> can load it. */
function toHttpUrl(uri?: string): string | undefined {
  if (!uri) return undefined;
  if (uri.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${uri.slice(7)}`;
  }
  return uri;
}

export default function NFTCard({ tokenId }: { tokenId: bigint }) {
  const { data: tokenUri } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "tokenURI",
    args: [tokenId],
    chainId: sepolia.id,
  });

  const [meta, setMeta] = useState<Metadata | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = toHttpUrl(tokenUri as string | undefined);
    if (!url) return;
    setMetaError(null);
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (!cancelled) setMeta(j as Metadata);
      })
      .catch((e) => {
        if (!cancelled) setMetaError((e as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, [tokenUri]);

  const imageUrl = toHttpUrl(meta?.image);

  return (
    <article className="card-hover overflow-hidden rounded-xl border border-border bg-card/60 hover:border-accent/40">
      {/* Image / placeholder */}
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-accent/20 via-bg to-accent2/10">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={meta?.name ?? `Token #${tokenId.toString()}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="font-mono text-4xl text-accent/70">
                #{tokenId.toString()}
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/40">
                {metaError ? "metadata unavailable" : "loading metadata…"}
              </div>
            </div>
          </div>
        )}
        <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur">
          #{tokenId.toString()}
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="mb-1 truncate text-sm font-semibold">
          {meta?.name ?? `Token #${tokenId.toString()}`}
        </h3>
        {meta?.description && (
          <p className="mb-3 line-clamp-2 text-xs text-white/55">
            {meta.description}
          </p>
        )}

        {meta?.attributes && meta.attributes.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {meta.attributes.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="rounded border border-border bg-bg/50 px-1.5 py-0.5 font-mono text-[10px] text-white/60"
              >
                {a.trait_type}: {String(a.value)}
              </span>
            ))}
          </div>
        )}

        <a
          href={`https://sepolia.etherscan.io/token/${CONTRACT_ADDRESS}?a=${tokenId.toString()}`}
          target="_blank"
          rel="noreferrer"
          className="block font-mono text-[10px] uppercase tracking-wider text-accent2 hover:underline"
        >
          View on Etherscan →
        </a>
      </div>
    </article>
  );
}
