import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
    const [deployer] = await ethers.getSigners();
    
    // Grab the contract factory 
    const MyNFT = await ethers.getContractFactory("ScorecardNFT");
 
    // Start deployment, returning a promise that resolves to a contract object
    const NFT = await MyNFT.deploy(deployer.address, process.env.ORACLE); // Pass the deployer's address as the initial owner
    
    const address = await NFT.getAddress();
    console.log("Contract deployed to address:", address);
 }
 
 main()
   .then(() => process.exit(0))
   .catch(error => {
     console.error(error);
     process.exit(1);
   });