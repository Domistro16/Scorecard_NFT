const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ScorecardNFT", function () {
  let ScorecardNFT, nftContract, owner, addr1, addr2, oracleMock;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
  
    // Deploy Mock Oracle
    const OracleMock = await ethers.getContractFactory("MockPriceOracle");
    oracleMock = await OracleMock.deploy();
    await oracleMock.waitForDeployment(); // Wait for deployment completion
    await oracleMock.setLatestPrice(600000000000000000000n);
  
    // Fund addr1 (Ethers v6 syntax)
    await owner.sendTransaction({
      to: addr1.address,
      value: ethers.parseEther("10")
    });
  
    // Deploy ScorecardNFT
    const ScorecardNFT = await ethers.getContractFactory("ScorecardNFT");
    nftContract = await ScorecardNFT.deploy(
      await owner.getAddress(), // Explicitly get address
      await oracleMock.getAddress() // Get deployed contract address
    );
    await nftContract.waitForDeployment(); // Wait for NFT contract deployment
  });

  it("Should mint an NFT when the correct fee is paid", async function () {
    const mintFee = await nftContract.getMintFeeInNative();

    await expect(
      nftContract.connect(addr1).mintNFT("ipfs://sample-metadata", { value: mintFee })
    )
      .to.emit(nftContract, "NFTMinted")
      .withArgs(addr1.address, 1, "ipfs://sample-metadata");

    expect(await nftContract.ownerOf(1)).to.equal(addr1.address);
  });

  it("Should fail if incorrect minting fee is paid", async function () {
    const mintFee = await nftContract.getMintFeeInNative();
    const lowFee = mintFee - ethers.parseEther("0.001"); // Direct subtraction
  
    await expect(
      nftContract.connect(addr1).mintNFT("ipfs://sample-metadata", { value: lowFee })
    ).to.be.revertedWith("Insufficient mint fee");
  });
  it("Should allow owner to withdraw funds", async function () {
    // Mint first to accumulate funds
    const mintFee = await nftContract.getMintFeeInNative();
    await nftContract.connect(addr1).mintNFT("ipfs://meta", { value: mintFee });
    const ownerAddress = await owner.getAddress();
    const contractAddress = await nftContract.getAddress();
    const initialBalance = await ethers.provider.getBalance(ownerAddress);
    const contractBalance = await ethers.provider.getBalance(contractAddress);
  
    // Withdraw
    const tx = await nftContract.connect(owner).withdrawFunds();
    const receipt = await tx.wait();
  
    // Calculate gas costs using BigInt
    const gasUsed = receipt.gasUsed * receipt.gasPrice;
  
    // Check final balance with tolerance
    const finalBalance = await ethers.provider.getBalance(owner.address);
    expect(finalBalance).to.be.closeTo(
      initialBalance + contractBalance - gasUsed,
      ethers.parseEther("0.1") // Allow 0.1 ETH variance for gas fluctuations
    );
  });
  it("Should not allow non-owner to withdraw funds", async function () {
    await expect(nftContract.connect(addr1).withdrawFunds())
      .to.be.revertedWithCustomError(nftContract, "OwnableUnauthorizedAccount")
      .withArgs(addr1.address);
  });
});
