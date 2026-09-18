/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    // viem / wagmi need these Node polyfills disabled for edge/browser
    config.externals.push("pino-pretty", "lokijs", "encoding");
    // Blanket-ignore optional / platform-specific packages that wagmi's
    // connectors transitively import but never execute in a browser dApp:
    //   • @x402/*                       — Coinbase payment-protocol SDK
    //   • @react-native-async-storage/*  — MetaMask SDK's React Native path
    // `webpack` is provided by Next.js as the second arg — do NOT import it
    // from "webpack" directly, Next bundles its own copy.
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(@x402\/|@react-native-async-storage\/)/,
      })
    );
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.ipfs.dweb.link" },
      { protocol: "https", hostname: "**.pinata.cloud" },
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
    ],
  },
};

export default nextConfig;
