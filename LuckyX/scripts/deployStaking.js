const hre = require("hardhat");
const fs = require("fs");

// How to deploy from VS code?
// Use deploy.js: npx hardhat run scripts/deployStaking.js --network sepolia

// Verify: npx hardhat verify --network sepolia 0xYourContractAddress  "0xLuckyXAddress"
// npx hardhat verify --network sepolia 0x1e66428E54ff9A2A2a5401815bC24479f7C73588 "0xa6D4E6f25849529ce8Ef15f1c12Ae1DeBb62F1Dd"

async function main() {
  const [deployer] = await hre.ethers.getSigners(); // Use plural 'getSigners()'
  console.log("Deploying contracts with the account:", deployer.address);

  // Load addresses from input.json
  const config = JSON.parse(fs.readFileSync("input.json", "utf8"));
  console.log(config);

  const inputTokenAddress = config.inputTokenContract;
  const luckyxAddress = config.luckXContract;
  console.log(luckyxAddress);

  const Staking = await hre.ethers.getContractFactory("StakingContract");
  const staking = await Staking.deploy(
    luckyxAddress // Reward token
  );

  await staking.waitForDeployment();
  console.log("Staking contract deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
