"use client";

import { http, createConfig } from "wagmi";
import { sepolia, hardhat, mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "public-demo-id";

const sepoliaRpc =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
  "https://rpc.sepolia.org";

export const config = getDefaultConfig({
  appName: "Sepolia NFT Gallery",
  projectId,
  chains: [sepolia, hardhat, mainnet],
  transports: {
    [sepolia.id]: http(sepoliaRpc),
    [hardhat.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// Convenience: contract address used across the app
export const CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  ("0x0000000000000000000000000000000000000000" as `0x${string}`);

export const IS_CONTRACT_CONFIGURED =
  CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
