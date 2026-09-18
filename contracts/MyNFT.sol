// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title MyNFT
 * @notice Minimal ERC-721 for a Sepolia demo — mint price, per-wallet cap,
 *         pausable, owner-withdrawable, IPFS base URI.
 * @dev    Not audited. Testnet only. Do NOT deploy to mainnet as-is.
 */
contract MyNFT is
    ERC721,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    Pausable,
    ReentrancyGuard
{
    // ─── Config ────────────────────────────────────────────────────────────
    uint256 public constant MAX_SUPPLY = 1000;
    uint256 public constant MAX_PER_WALLET = 5;

    uint256 public mintPrice = 0.001 ether;
    string private _baseTokenURI;
    bool public publicMintOpen = true;

    // ─── Events ────────────────────────────────────────────────────────────
    event Minted(address indexed to, uint256 quantity, uint256 totalPrice);
    event PriceUpdated(uint256 newPrice);
    event BaseURIUpdated(string newBaseURI);
    event PublicMintToggled(bool open);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory baseURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
    }

    // ─── Mint ──────────────────────────────────────────────────────────────
    /**
     * @notice Public mint. Caller pays `mintPrice * quantity`.
     * @param quantity number of tokens to mint (1..MAX_PER_WALLET)
     */
    function mint(uint256 quantity)
        external
        payable
        nonReentrant
        whenNotPaused
    {
        require(publicMintOpen, "Public mint is closed");
        require(quantity > 0 && quantity <= MAX_PER_WALLET, "Invalid quantity");
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Would exceed max supply"
        );
        require(
            balanceOf(msg.sender) + quantity <= MAX_PER_WALLET,
            "Exceeds per-wallet cap"
        );
        require(msg.value >= mintPrice * quantity, "Insufficient ETH");

        uint256 nextId = totalSupply();
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(msg.sender, nextId + i);
        }

        emit Minted(msg.sender, quantity, msg.value);

        // Refund overpayment (avoid locking user funds)
        uint256 excess = msg.value - (mintPrice * quantity);
        if (excess > 0) {
            (bool ok, ) = payable(msg.sender).call{value: excess}("");
            require(ok, "Refund failed");
        }
    }

    /**
     * @notice Owner-only free mint (airdrops, giveaways).
     */
    function ownerMint(address to, uint256 quantity)
        external
        onlyOwner
        nonReentrant
    {
        require(quantity > 0 && quantity <= 100, "Invalid quantity");
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Would exceed max supply"
        );
        uint256 nextId = totalSupply();
        for (uint256 i = 0; i < quantity; i++) {
            _safeMint(to, nextId + i);
        }
        emit Minted(to, quantity, 0);
    }

    // ─── Admin ─────────────────────────────────────────────────────────────
    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
        emit PriceUpdated(newPrice);
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(newBaseURI);
    }

    function togglePublicMint() external onlyOwner {
        publicMintOpen = !publicMintOpen;
        emit PublicMintToggled(publicMintOpen);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Owner withdraws all contract balance. Sepolia ETH has no value,
     *         but the pattern is included to show production hygiene.
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 bal = address(this).balance;
        require(bal > 0, "No balance");
        (bool ok, ) = payable(owner()).call{value: bal}("");
        require(ok, "Withdraw failed");
    }

    // ─── Views ─────────────────────────────────────────────────────────────
    /**
     * @notice Return all token IDs owned by `owner_`.
     *         Convenience helper for the frontend gallery.
     */
    function tokensOfOwner(address owner_)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = balanceOf(owner_);
        uint256[] memory ids = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ids[i] = tokenOfOwnerByIndex(owner_, i);
        }
        return ids;
    }

    function contractURI() external view returns (string memory) {
        return
            string(
                abi.encodePacked(
                    "Collection: ",
                    name(),
                    " (",
                    symbol(),
                    ") | Supply: ",
                    _totalSupplyToString(),
                    "/",
                    _uint256ToString(MAX_SUPPLY)
                )
            );
    }

    // tiny uint→string helpers (avoid importing Strings.sol for demo brevity)
    function _totalSupplyToString() private view returns (string memory) {
        return _uint256ToString(totalSupply());
    }

    function _uint256ToString(uint256 value)
        private
        pure
        returns (string memory)
    {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + (value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // ─── Required overrides ────────────────────────────────────────────────
    function _baseURI()
        internal
        view
        override
        returns (string memory)
    {
        return _baseTokenURI;
    }

    function _update(
        address to,
        uint256 tokenId,
        address auth
    )
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(
        address account,
        uint128 value
    ) internal override(ERC721, ERC721Enumerable) {
        super._increaseBalance(account, value);
    }

    function tokenURI(
        uint256 tokenId
    )
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
