import MintPanel from "@/components/MintPanel";
import Gallery from "@/components/Gallery";
import ContractInfo from "@/components/ContractInfo";
import Reveal from "@/components/Reveal";
import CrossLinks from "@/components/CrossLinks";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <Reveal>
        <section>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-accent2" />
          Sepolia Testnet · chainId 11155111
        </div>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
          Mint your own{" "}
          <span className="text-gradient">ERC-721 NFT</span> on Sepolia.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/65">
          A full-stack Web3 demo: custom Solidity contract deployed via Hardhat,
          metadata on IPFS, and a Next.js frontend wired with{" "}
          <span className="font-mono text-accent2">wagmi · viem · RainbowKit</span>
          . Connect any wallet, mint a token, and see it appear in your gallery
          below.
        </p>
      </section>
      </Reveal>

      {/* Contract snapshot */}
      <Reveal delay={60}>
        <ContractInfo />
      </Reveal>

      {/* Mint + Gallery */}
      <Reveal delay={60}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <MintPanel />
        <div className="rounded-xl border border-border bg-card/40 p-6">
          <h2 className="mb-2 text-lg font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="space-y-2 text-sm text-white/65">
            <li>
              <span className="font-mono text-accent">1.</span> Connect your
              wallet via RainbowKit (MetaMask / WalletConnect / Coinbase).
            </li>
            <li>
              <span className="font-mono text-accent">2.</span> Make sure you
              are on <span className="font-mono">Sepolia</span>. Need testnet
              ETH?{" "}
              <a
                href="https://faucets.chain.link/sepolia"
                target="_blank"
                rel="noreferrer"
                className="text-accent2 hover:underline"
              >
                Chainlink Faucet
              </a>
              .
            </li>
            <li>
              <span className="font-mono text-accent">3.</span> Pick a quantity
              and click <span className="font-mono">Mint</span>. The frontend
              calls{" "}
              <code className="font-mono text-xs text-accent2">
                mint(quantity)
              </code>{" "}
              with{" "}
              <code className="font-mono text-xs text-accent2">
                msg.value = mintPrice × quantity
              </code>
              .
            </li>
            <li>
              <span className="font-mono text-accent">4.</span> Your new tokens
              appear in the gallery via{" "}
              <code className="font-mono text-xs text-accent2">
                tokensOfOwner(you)
              </code>{" "}
              + off-chain{" "}
              <code className="font-mono text-xs text-accent2">
                tokenURI(id)
              </code>{" "}
              metadata fetch.
            </li>
          </ol>

          <div className="mt-5 rounded-md border border-border bg-bg/40 p-3 font-mono text-[11px] text-white/55">
            Contract: <span className="text-accent2">MyNFT.sol</span> · OZ
            ERC721 + Enumerable + URIStorage + Ownable + Pausable +
            ReentrancyGuard
          </div>
        </div>
      </div>
      </Reveal>

      <Gallery />

      <Reveal delay={60}>
        <CrossLinks />
      </Reveal>
    </div>
  );
}
