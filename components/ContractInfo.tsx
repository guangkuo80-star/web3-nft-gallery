"use client";

import { useReadContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { formatEther } from "viem";
import { myNftAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS, IS_CONTRACT_CONFIGURED } from "@/lib/wagmi";

export default function ContractInfo() {
  const common = {
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED },
  } as const;

  const { data: name } = useReadContract({
    ...common,
    functionName: "name",
  });
  const { data: symbol } = useReadContract({
    ...common,
    functionName: "symbol",
  });
  const { data: totalSupply } = useReadContract({
    ...common,
    functionName: "totalSupply",
  });
  const { data: maxSupply } = useReadContract({
    ...common,
    functionName: "MAX_SUPPLY",
  });
  const { data: mintPrice } = useReadContract({
    ...common,
    functionName: "mintPrice",
  });
  const { data: publicMintOpen } = useReadContract({
    ...common,
    functionName: "publicMintOpen",
  });
  const { data: paused } = useReadContract({
    ...common,
    functionName: "paused",
  });
  const { data: owner } = useReadContract({
    ...common,
    functionName: "owner",
  });

  if (!IS_CONTRACT_CONFIGURED) return null;

  return (
    <section className="rounded-xl border border-border bg-card/40 p-5">
      <h3 className="mb-4 font-mono text-xs uppercase tracking-wider text-white/50">
        Contract · Sepolia (chainId 11155111)
      </h3>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 font-mono text-xs md:grid-cols-4">
        <Info label="Name" value={name as string | undefined} />
        <Info label="Symbol" value={symbol as string | undefined} />
        <Info
          label="Supply"
          value={
            totalSupply !== undefined && maxSupply !== undefined
              ? `${totalSupply} / ${maxSupply}`
              : undefined
          }
        />
        <Info
          label="Mint price"
          value={
            mintPrice !== undefined ? `${formatEther(mintPrice)} ETH` : undefined
          }
        />
        <Info
          label="Public mint"
          value={publicMintOpen === undefined ? undefined : publicMintOpen ? "open" : "closed"}
        />
        <Info
          label="Paused"
          value={paused === undefined ? undefined : paused ? "yes" : "no"}
        />
        <Info label="Owner" value={shortAddr(owner as string | undefined)} />
        <Info
          label="Address"
          value={
            <a
              href={`https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noreferrer"
              className="text-accent2 hover:underline"
            >
              {shortAddr(CONTRACT_ADDRESS)} ↗
            </a>
          }
        />
      </div>
    </section>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="mt-0.5 truncate text-white/90">
        {value === undefined ? (
          <span className="text-white/30">—</span>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function shortAddr(addr?: string) {
  if (!addr) return undefined;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
