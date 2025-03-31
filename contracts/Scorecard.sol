// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPriceOracle {
    function getLatestPrice() external view returns (uint256);
}

contract ScorecardNFT is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    uint256 public constant MINT_FEE_USD = 5 * 1e18; // $5 in 18 decimal precision
    IPriceOracle public priceOracle;

    event NFTMinted(address indexed recipient, uint256 tokenId, string tokenURI);
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor(address initialOwner, address oracleAddress)
        ERC721("ScorecardNFT", "SCNFT")
        Ownable(initialOwner)
    {
        _tokenIds = 1;
        priceOracle = IPriceOracle(oracleAddress);
    }

    function mintNFT(string memory tokenURI) public payable returns (uint256) {
        uint256 requiredFee = getMintFeeInNative();
        require(msg.value >= requiredFee, "Insufficient mint fee");

        // Increment token ID and mint NFT
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        emit NFTMinted(msg.sender, newItemId, tokenURI);

        return newItemId;
    }

    function getMintFeeInNative() public view returns (uint256) {
    uint256 ethPrice = priceOracle.getLatestPrice(); // Price should have 18 decimals
    require(ethPrice > 0, "Invalid oracle price");
    return (MINT_FEE_USD * 10**18) / ethPrice; // Proper division for ETH amount
    }

    function _setTokenURI(
        uint256 tokenId, 
        string memory tokenURI_
    ) internal override {
        require(
            bytes(super.tokenURI(tokenId)).length == 0, // Use public getter
            "URI frozen"
        );
        super._setTokenURI(tokenId, tokenURI_);
    }
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");

        emit FundsWithdrawn(owner(), balance);
    }

    receive() external payable {} // Allow contract to receive payments
}

