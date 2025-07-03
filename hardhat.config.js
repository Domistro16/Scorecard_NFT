require("dotenv").config();
require("@nomicfoundation/hardhat-verify");
require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-ethers"); // Ensure this is the correct package
const { API_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.20",
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
    hardhat: {
    },
    bsc: {
      url: API_URL,
      chainId: 97,
      accounts: [`${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "4MJADPB2SXCSKNET9W5TGV6VSMMBNNZ38J"
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true
  }

};