require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const cron = require("node-cron");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Load environment variables
const PORT = process.env.PORT || 5000;
const RPC_URL = process.env.ALCHEMY_API_SEPOLIA;
const PRIVATE_KEY = process.env.WALLET_SECRET;
const STAKING_CA = process.env.STAKING_CA;
const ABI = ["function distributeWeeklyRewards(uint256 randomNumber) external"];

// Set up provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(STAKING_CA, ABI, wallet);

// Function to distribute weekly rewards
const distributeRewards = async () => {
  try {
    console.log("⏳ Generating random number...");
    const randomNumber = Math.floor(Math.random() * 1e9);

    console.log(`📢 Calling distributeWeeklyRewards(${randomNumber})...`);
    const tx = await contract.distributeWeeklyRewards(randomNumber);
    console.log("🔄 Transaction sent, waiting for confirmation...");

    await tx.wait();
    console.log(`✅ Transaction confirmed! Hash: ${tx.hash}`);
  } catch (error) {
    console.error("❌ Error calling contract function:", error);
  }
};

// Schedule the function to run every Saturday at 6 PM UTC
// Now, let's break down "0 18 * * 6":
// 0: The minute when the task should run. 0 means the start of the hour.
// 18: The hour when the task should run. 18 is 6 PM UTC.
// *: The day of the month when the task should run. The asterisk (*) means every day of the month.
// *: The month when the task should run. The asterisk (*) means every month.
// 6: The day of the week when the task should run. 6 represents Saturday (0 = Sunday, 6 = Saturday).
// cron.schedule("0 18 * * 6", () => {
//   console.log("⏳ Running scheduled task for distributeWeeklyRewards...");
//   distributeRewards();
// });

// To test every minute:
// cron.schedule("* * * * *", () => {
//   console.log("⏳ Running scheduled task every minute...");
//   distributeRewards();
// });

// To test every 5 minutes:
cron.schedule("*/5 * * * *", () => {
  console.log("⏳ Running scheduled task every minute...");
  distributeRewards();
});

// // API Route to Trigger Manually
// app.post("/trigger-reward", async (req, res) => {
//   try {
//     await distributeRewards();
//     res.status(200).json({ message: "Reward distributed successfully!" });
//   } catch (error) {
//     res.status(500).json({ error: "Error distributing rewards." });
//   }
// });

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
