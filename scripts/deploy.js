/**
 * Deploys MyNFT to the target network and writes the deployed address +
 * ABI to `lib/deployments/<network>.json` so the frontend can pick it up.
 *
 * Usage:
 *   npx hardhat run scripts/deploy.js --network sepolia
 *   npx hardhat run scripts/deploy.js --network localhost
 */
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const network = hre.network.name;
  const [deployer] = await hre.ethers.getSigners();

  console.log("────────────────────────────────────────────────────────");
  console.log(`Deploying MyNFT to "${network}"`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(
    `Balance : ${hre.ethers.formatEther(
      await hre.ethers.provider.getBalance(deployer.address)
    )} ETH`
  );
  console.log("────────────────────────────────────────────────────────");

  // ── Config: token name, symbol, base metadata URI ─────────────────────
  // Base URI should point to an IPFS directory (with trailing slash) whose
  // children are `<tokenId>.json` metadata files. For a quick demo you can
  // use a public gateway URL. Replace with your own Pinata / web3.storage
  // CID after uploading metadata.
  const NAME = process.env.NFT_NAME || "My Demo NFT";
  const SYMBOL = process.env.NFT_SYMBOL || "MDN";
  const BASE_URI =
    process.env.NFT_BASE_URI ||
    "ipfs://QmTz1GxqvzVrYhRY6Q2eaNnCJ4dZeFXFR6MJdWqYxD8n3U/";

  const MyNFT = await hre.ethers.getContractFactory("MyNFT");
  const nft = await MyNFT.deploy(NAME, SYMBOL, BASE_URI);
  await nft.waitForDeployment();

  const address = await nft.getAddress();
  const tx = nft.deploymentTransaction();

  console.log(`✅ MyNFT deployed`);
  console.log(`   Address  : ${address}`);
  console.log(`   Tx hash  : ${tx?.hash}`);
  console.log(`   Name     : ${NAME}`);
  console.log(`   Symbol   : ${SYMBOL}`);
  console.log(`   Base URI : ${BASE_URI}`);

  if (network === "sepolia") {
    console.log(
      `   Explorer : https://sepolia.etherscan.io/address/${address}`
    );
  }

  // ── Persist deployment artifact for the frontend ──────────────────────
  const outDir = path.join(__dirname, "..", "lib", "deployments");
  fs.mkdirSync(outDir, { recursive: true });

  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    "MyNFT.sol",
    "MyNFT.json"
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));

  const payload = {
    address,
    chainId:
      network === "sepolia"
        ? 11155111
        : network === "localhost"
        ? 31337
        : hre.network.config.chainId,
    network,
    deployedAt: new Date().toISOString(),
    deployerTx: tx?.hash,
    constructorArgs: { NAME, SYMBOL, BASE_URI },
    abi: artifact.abi,
  };

  const outFile = path.join(outDir, `${network}.json`);
  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2));
  console.log(`\n📝 Wrote ${path.relative(process.cwd(), outFile)}`);

  // ── Verify on Etherscan (Sepolia only) ────────────────────────────────
  if (network === "sepolia" && process.env.ETHERSCAN_API_KEY) {
    console.log("\n🔍 Waiting for 5 block confirmations before verifying...");
    await tx.wait(5);
    try {
      await hre.run("verify:verify", {
        address,
        constructorArguments: [NAME, SYMBOL, BASE_URI],
      });
      console.log("✅ Verified on Etherscan");
    } catch (err) {
      console.warn("⚠️ Verification failed:", err.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
