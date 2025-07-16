const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments; // Access the deploy function
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  console.log("Deploying Box contract with account:", deployer);

  // Deploy the Box contract
  // Deploy GovernanceToken contract
  const box = await deploy("Box", {
    from: deployer,
    log: true, // Logs deployment info to the console
  });

  console.log("Box contract deployed to:", box.address);
};

module.exports.tags = ["Box"]; // Tag to identify this deployment script
