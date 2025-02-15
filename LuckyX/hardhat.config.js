require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

// module.exports = {
//   solidity: "0.8.20",
//   networks: {
//     sepolia: {
//       url: process.env.ALCHEMY_API_SEPOLIA, // Replace with your RPC URL
//       accounts: [process.env.WALLET_SECRET], // Replace with your private key
//     },
//     etherscan: {
//       apiKey: {
//         sepolia: process.env.ETHERSCAN_API_KEY, // ✅ Use environment variable
//       },
//     },
//     localhost: {
//       url: "http://127.0.0.1:8545/",
//     },
//   },
// };

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_API_SEPOLIA, // ✅ Use Alchemy URL from .env
      accounts: [process.env.WALLET_SECRET], // ✅ Use private key from .env
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY, // ✅ Load API key from .env
    },
  },
};
