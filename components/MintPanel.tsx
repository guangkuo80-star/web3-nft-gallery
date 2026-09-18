"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { formatEther, parseEther } from "viem";
import { sepolia } from "wagmi/chains";
import { myNftAbi } from "@/lib/abi";
import { CONTRACT_ADDRESS, IS_CONTRACT_CONFIGURED } from "@/lib/wagmi";

export default function MintPanel() {
  const { address, isConnected, chainId } = useAccount();
  const [quantity, setQuantity] = useState(1);

  const { data: mintPrice } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "mintPrice",
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED },
  });

  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "totalSupply",
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED },
  });

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "MAX_SUPPLY",
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED },
  });

  const { data: maxPerWallet } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "MAX_PER_WALLET",
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED },
  });

  const { data: publicMintOpen } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "publicMintOpen",
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED },
  });

  const { data: userBalance } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: myNftAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { enabled: IS_CONTRACT_CONFIGURED && !!address },
  });

  const {
    writeContract,
    data: hash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const totalPrice = mintPrice ? mintPrice * BigInt(quantity) : 0n;
  const supplyPct =
    totalSupply !== undefined && maxSupply !== undefined && maxSupply > 0n
      ? Math.min(100, (Number(totalSupply) / Number(maxSupply)) * 100)
      : 0;
  const remainingForUser =
    maxPerWallet && userBalance !== undefined
      ? Number(maxPerWallet) - Number(userBalance)
      : 0;
  const canMint =
    IS_CONTRACT_CONFIGURED &&
    isConnected &&
    chainId === sepolia.id &&
    publicMintOpen === true &&
    remainingForUser > 0 &&
    quantity <= remainingForUser;

  function handleMint() {
    if (!canMint) return;
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: myNftAbi,
      functionName: "mint",
      args: [BigInt(quantity)],
      value: totalPrice,
      chainId: sepolia.id,
    });
  }

  if (!IS_CONTRACT_CONFIGURED) {
    return (
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6">
        <h2 className="mb-2 text-lg font-semibold text-amber-400">
          Contract not configured
        </h2>
        <p className="text-sm text-white/70">
          Set{" "}
          <code className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-xs">
            NEXT_PUBLIC_CONTRACT_ADDRESS
          </code>{" "}
          in <code className="font-mono text-xs">.env.local</code> after
          deploying. See README → "Deploy the contract".
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-border bg-card/60 p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Mint</h2>
          <p className="mt-1 text-sm text-white/55">
            Public mint on Sepolia. Testnet ETH only — get some from{" "}
            <a
              href="https://faucets.chain.link/sepolia"
              target="_blank"
              rel="noreferrer"
              className="text-accent2 underline-offset-2 hover:underline"
            >
              Chainlink Faucet
            </a>
            .
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-xs uppercase tracking-wider text-white/40">
            Supply
          </div>
          <div className="font-mono text-lg">
            {totalSupply?.toString() ?? "—"}
            <span className="text-white/40">
              {" "}
              / {maxSupply?.toString() ?? "1000"}
            </span>
          </div>
        </div>
      </div>

      {/* Supply progress bar */}
      <div className="mb-6">
        <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-white/40">
          <span>Minted</span>
          <span>{supplyPct.toFixed(1)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full border border-border bg-bg/60">
          <div
            className="progress-fill h-full rounded-full"
            style={{ width: `${supplyPct}%` }}
          />
        </div>
      </div>

      {/* Quantity selector */}
      <div className="mb-5">
        <label className="mb-2 block font-mono text-xs uppercase tracking-wider text-white/50">
          Quantity {maxPerWallet ? `(max ${maxPerWallet.toString()} per wallet)` : ""}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-10 rounded-md border border-border bg-bg/60 text-lg transition hover:border-accent/40"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <input
            type="number"
            min={1}
            max={Math.max(1, remainingForUser || 1)}
            value={quantity}
            onChange={(e) => {
              const v = Math.max(
                1,
                Math.min(Number(e.target.value) || 1, remainingForUser || 1)
              );
              setQuantity(v);
              reset();
            }}
            className="h-10 w-20 rounded-md border border-border bg-bg/60 text-center font-mono outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={() =>
              setQuantity((q) =>
                Math.min(Math.max(1, remainingForUser || 1), q + 1)
              )
            }
            className="h-10 w-10 rounded-md border border-border bg-bg/60 text-lg transition hover:border-accent/40"
            aria-label="Increase quantity"
          >
            +
          </button>
          <div className="ml-4 text-sm text-white/60">
            You own{" "}
            <span className="font-mono text-white">
              {userBalance?.toString() ?? "0"}
            </span>
            {maxPerWallet && (
              <>
                {" "}
                / {maxPerWallet.toString()} ·{" "}
                <span className="text-accent2">{remainingForUser} left</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Price + action */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-5">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-white/40">
            Total
          </div>
          <div className="font-mono text-xl">
            {mintPrice ? formatEther(totalPrice) : "—"}{" "}
            <span className="text-sm text-white/50">ETH</span>
          </div>
          {mintPrice && (
            <div className="text-xs text-white/40">
              @ {formatEther(mintPrice)} ETH each
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canMint || isPending || isConfirming}
          onClick={handleMint}
          className="rounded-md bg-accent px-6 py-3 font-medium text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/40"
        >
          {!isConnected
            ? "Connect wallet"
            : chainId !== sepolia.id
            ? "Switch to Sepolia"
            : publicMintOpen === false
            ? "Mint closed"
            : remainingForUser <= 0
            ? "Wallet cap reached"
            : isPending
            ? "Confirm in wallet…"
            : isConfirming
            ? "Minting…"
            : isSuccess
            ? "✓ Minted"
            : `Mint ${quantity}`}
        </button>
      </div>

      {/* Status */}
      {hash && (
        <div className="mt-4 rounded-md border border-border bg-bg/40 p-3 font-mono text-xs">
          <div className="mb-1 text-white/50">Transaction</div>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent2 hover:underline"
          >
            {hash.slice(0, 20)}…{hash.slice(-12)}
          </a>
          <div className="mt-1 text-white/50">
            {isConfirming
              ? "Waiting for confirmation…"
              : isSuccess
              ? "✓ Confirmed on Sepolia"
              : ""}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-500/30 bg-red-500/5 p-3 font-mono text-xs text-red-400">
          {(error as Error).message?.slice(0, 200)}
        </div>
      )}
    </section>
  );
}
