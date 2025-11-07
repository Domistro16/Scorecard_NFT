import"dotenv/config";
import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-verify";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-ethers"; 
const { API_URL, DEPLOYER_KEY } = process.env;

const config = {
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  defaultNetwork: "bsc",
  networks: {
    hardhat: {},
    bsc: {
      url: API_URL,
      chainId: 56,
      accounts: [`${DEPLOYER_KEY}`],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.API_KEY,
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
} satisfies HardhatUserConfig;

export default config;