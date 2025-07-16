const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments; // Access the deploy function
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  console.log("Deploying Governance contract with account:", deployer);

  // Get contract governanceToken
  const governanceToken = await ethers.getContract("GovernanceToken");

  // Get contract timeLock
  const timeLock = await ethers.getContract("TimeLock");

  // Deploy Governance contract  contract
  const governanceContract = await deploy("GovernanceContract", {
    from: deployer,
    args: [governanceToken.target, timeLock.target], // Use addresses of the contracts
    log: true, // Logs deployment info to the console
  });

  console.log("GovernanceContract deployed to:", governanceContract.address);
};

module.exports.tags = ["GovernanceContract"]; // Tag to identify this deployment script
