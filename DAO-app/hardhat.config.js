require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-deploy-ethers");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  namedAccounts: {
    deployer: {
      default: 0, // First account is the deployer
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
  },
};
