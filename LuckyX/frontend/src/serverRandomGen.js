require("dotenv").config({
  path: "C:\\Users\\hwdeb\\Documents\\blockstat_solutions_work\\Solidity_projects\\LuckyX\\.env",
});
const { ethers } = require("ethers");
const crypto = require("crypto");
const fs = require("fs");

// Load environment variables
const RPC_URL = process.env.ALCHEMY_API_SEPOLIA;
const PRIVATE_KEY = process.env.WALLET_SECRET;

// Define the ABI of your smart contract
const StakingABI = require("./ABI/Staking.json");

// Load addresses from input.json
const config = JSON.parse(fs.readFileSync("input.json", "utf8"));
console.log(config);

const auctionAddress = config.auctionContract;

// // Connect to the Ethereum network via Infura
const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractStaking = new ethers.Contract(auctionAddress, StakingABI, wallet);

// Function to generate a secure random number
function generateSecureRandomNumber() {
  const randomBytes = crypto.randomBytes(32);
  return ethers.BigNumber.from(randomBytes);
}

// Function to call the pickWinner function on the smart contract
async function callPickWinner() {
  try {
    const randomNumber = generateSecureRandomNumber();
    console.log(`Generated Random Number: ${randomNumber.toString()}`);

    // const tx = await contractStaking.pickWinner(randomNumber);
    // console.log("Transaction sent. Waiting for confirmation...");
    // await tx.wait();
    // console.log("Transaction confirmed:", tx.hash);
  } catch (error) {
    console.error("Error calling pickWinner:", error);
  }
}

// Execute the function
callPickWinner();
