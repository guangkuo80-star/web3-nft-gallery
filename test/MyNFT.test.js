const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("MyNFT", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    const nft = await MyNFT.deploy(
      "Test NFT",
      "TNFT",
      "ipfs://QmTest/"
    );
    await nft.waitForDeployment();
    return { nft, owner, alice, bob };
  }

  describe("Deployment", function () {
    it("sets name, symbol and owner correctly", async function () {
      const { nft, owner } = await loadFixture(deployFixture);
      expect(await nft.name()).to.equal("Test NFT");
      expect(await nft.symbol()).to.equal("TNFT");
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("exposes MAX_SUPPLY and MAX_PER_WALLET", async function () {
      const { nft } = await loadFixture(deployFixture);
      expect(await nft.MAX_SUPPLY()).to.equal(1000n);
      expect(await nft.MAX_PER_WALLET()).to.equal(5n);
    });
  });

  describe("Minting", function () {
    it("mints when caller sends exact price", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await expect(
        nft.connect(alice).mint(1, { value: price })
      ).to.changeTokenBalance(nft, alice, 1);
      expect(await nft.totalSupply()).to.equal(1n);
    });

    it("reverts on insufficient ETH", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      await expect(
        nft.connect(alice).mint(1, { value: 0n })
      ).to.be.revertedWith("Insufficient ETH");
    });

    it("reverts when exceeding per-wallet cap", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await expect(
        nft.connect(alice).mint(6, { value: price * 6n })
      ).to.be.revertedWith("Invalid quantity");
    });

    it("refunds overpayment", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      const before = await ethers.provider.getBalance(alice.address);
      const tx = await nft.connect(alice).mint(1, { value: price * 2n });
      const receipt = await tx.wait();
      const gas = receipt.gasUsed * receipt.gasPrice;
      const after = await ethers.provider.getBalance(alice.address);
      // spent exactly price + gas, not 2x price
      expect(before - after - gas).to.equal(price);
    });

    it("emits Minted event", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await expect(nft.connect(alice).mint(2, { value: price * 2n }))
        .to.emit(nft, "Minted")
        .withArgs(alice.address, 2n, price * 2n);
    });
  });

  describe("Owner functions", function () {
    it("ownerMint bypasses price and cap", async function () {
      const { nft, owner, bob } = await loadFixture(deployFixture);
      await nft.connect(owner).ownerMint(bob.address, 10);
      expect(await nft.balanceOf(bob.address)).to.equal(10n);
    });

    it("non-owner cannot ownerMint", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      await expect(
        nft.connect(alice).ownerMint(alice.address, 1)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("owner can pause and unpause minting", async function () {
      const { nft, owner, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await nft.connect(owner).pause();
      await expect(
        nft.connect(alice).mint(1, { value: price })
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");
      await nft.connect(owner).unpause();
      await expect(
        nft.connect(alice).mint(1, { value: price })
      ).to.not.be.reverted;
    });

    it("owner can toggle public mint", async function () {
      const { nft, owner, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await nft.connect(owner).togglePublicMint();
      await expect(
        nft.connect(alice).mint(1, { value: price })
      ).to.be.revertedWith("Public mint is closed");
    });

    it("owner can withdraw balance", async function () {
      const { nft, owner, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await nft.connect(alice).mint(1, { value: price });
      const bal = await ethers.provider.getBalance(await nft.getAddress());
      expect(bal).to.equal(price);
      await expect(nft.connect(owner).withdraw()).to.changeEtherBalance(
        owner,
        price
      );
    });
  });

  describe("Views", function () {
    it("tokensOfOwner returns all owned ids", async function () {
      const { nft, alice } = await loadFixture(deployFixture);
      const price = await nft.mintPrice();
      await nft.connect(alice).mint(3, { value: price * 3n });
      const ids = await nft.tokensOfOwner(alice.address);
      expect(ids.length).to.equal(3);
      expect(ids[0]).to.equal(0n);
      expect(ids[1]).to.equal(1n);
      expect(ids[2]).to.equal(2n);
    });
  });
});
