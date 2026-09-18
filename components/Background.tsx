/**
 * Ambient animated backdrop: panning grid + drifting color orbs + vignette.
 * Fixed behind all content, non-interactive. Pure CSS, no deps.
 */
export default function Background() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-grid absolute inset-0" />
      <div className="orb left-1/2 top-[-160px] h-[420px] w-[640px] -translate-x-1/2 bg-accent/25" />
      <div className="orb orb-2 bottom-[-120px] right-[-80px] h-[360px] w-[480px] bg-accent2/15" />
      <div className="orb orb-2 left-[-120px] top-1/3 h-[300px] w-[300px] bg-fuchsia-500/10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#0a0a0f_85%)]" />
    </div>
  );
}
