const hre = require("hardhat");
const fs = require("fs");

// How to deploy from VS code?
// Use deploy.js: npx hardhat run scripts/deployAuction.js --network sepolia

// Verify: npx hardhat verify --network sepolia 0xYourContractAddress "0xTokenInputAddress" "0xLuckyXAddress"
// npx hardhat verify --network sepolia 0x1AbB8C31Cc06759bEeB07184a0DF9A0Ce11CbA9c "0x23Cd660055157fA8997f85D65F4e91A0d5FebC32" "0xa6D4E6f25849529ce8Ef15f1c12Ae1DeBb62F1Dd"

async function main() {
  const [deployer] = await hre.ethers.getSigners(); // Use plural 'getSigners()'
  console.log("Deploying contracts with the account:", deployer.address);

  // Load addresses from input.json
  const config = JSON.parse(fs.readFileSync("input.json", "utf8"));
  console.log(config);

  const inputTokenAddress = config.inputTokenAddress;
  const luckyxAddress = config.luckyxAddress;

  const Auction = await hre.ethers.getContractFactory("Auction");
  const auction = await Auction.deploy(
    inputTokenAddress, // Token used to pay
    luckyxAddress // Reward token
  );

  await auction.waitForDeployment();
  console.log("Auction contract deployed to:", await auction.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
