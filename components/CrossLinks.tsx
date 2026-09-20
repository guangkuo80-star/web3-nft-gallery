const portfolio =
  process.env.NEXT_PUBLIC_DEMO_PORTFOLIO?.trim() ||
  "https://web3-portfolio-pied.vercel.app";
const dashboard =
  process.env.NEXT_PUBLIC_DEMO_WALLET_DASHBOARD?.trim() ||
  "https://web3-wallet-dashboard-xi.vercel.app";
const gh =
  process.env.NEXT_PUBLIC_GITHUB_USERNAME?.trim() || "guangkuo80-star";

/**
 * Cross-demo navigation — ties this gallery back to the rest of the
 * portfolio so the three sites form one connected project.
 */
export default function CrossLinks() {
  return (
    <section className="rounded-xl border border-border bg-card/40 p-6">
      <h2 className="mb-1 font-mono text-xs uppercase tracking-wider text-white/50">
        Part of a connected set
      </h2>
      <p className="mb-5 text-sm text-white/55">
        Mint here → see your NFTs in the Wallet Dashboard → browse everything
        from the Portfolio hub. One wallet, one design system, one Sepolia
        testnet.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <LinkCard
          href={portfolio}
          kicker="hub"
          title="Portfolio"
          body="All projects, links and contact."
        />
        <LinkCard
          href={dashboard}
          kicker="read"
          title="Wallet Dashboard"
          body="See the NFTs you minted, read-only."
        />
        <LinkCard
          href={`https://github.com/${gh}`}
          kicker="source"
          title="GitHub"
          body="Read the source of every demo."
        />
      </div>
    </section>
  );
}

function LinkCard({
  href,
  kicker,
  title,
  body,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group rounded-lg border border-border bg-bg/40 p-4 transition hover:border-accent/40"
    >
      <div className="mb-1 font-mono text-[9px] uppercase tracking-wider text-accent2/70">
        {kicker}
      </div>
      <div className="text-sm font-semibold text-white transition group-hover:text-accent2">
        {title} →
      </div>
      <div className="mt-1 text-[11px] text-white/45">{body}</div>
    </a>
  );
}
