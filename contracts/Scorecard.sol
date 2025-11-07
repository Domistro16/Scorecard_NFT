// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IPriceOracle {
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

contract ScorecardNFT is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIds;
    IPriceOracle public priceOracle;

    event NFTMinted(
        address indexed recipient,
        uint256 tokenId,
        string tokenURI
    );
    event FundsWithdrawn(address indexed owner, uint256 amount);

    constructor(
        address oracleAddress
    ) ERC721("Safucard", "SCNFT") Ownable(msg.sender) {
        _tokenIds = 0;
        priceOracle = IPriceOracle(oracleAddress);
    }

    function mintNFT(string memory _URI) public payable returns (uint256) {
        uint256 requiredFee = getMintFeeInNative();
        require(msg.value >= requiredFee, "Insufficient mint fee");

        // Increment token ID and mint NFT
        _tokenIds++;
        uint256 newItemId = _tokenIds;

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _URI);

        emit NFTMinted(msg.sender, newItemId, _URI);

        return newItemId;
    }

    function getMintFeeInNative() public view returns (uint256) {
        (, int256 answer, , , ) = priceOracle.latestRoundData(); // answer has 8 decimals
        require(answer > 0, "Invalid oracle price");

        uint256 price = uint256(answer); // 8 decimals
        uint256 usdAmount = 5 * 1e18; // 5 USD in 18 decimals

        return (usdAmount * 1e8) / price;
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

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
     function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    receive() external payable {} // Allow contract to receive payments
}
