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
const ABI = [
  "function distributeWeeklyRewards(uint256 randomNumber) external",
  "function lotteryPool() external view returns (uint256)",
  "function biggestDepositorRewardPool() external view returns (uint256)",
];

// Set up provider and wallet
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const stakingContract = new ethers.Contract(STAKING_CA, ABI, wallet);

// Function to distribute weekly rewards
const distributeRewards = async () => {
  // Fetch the current prize pools from the contract
  const lotteryPrize = await stakingContract.lotteryPool();
  const biggestDepositorPrize =
    await stakingContract.biggestDepositorRewardPool();

  // Only call distributeWeeklyRewards if there are prizes
  if (lotteryPrize > 0 && biggestDepositorPrize > 0) {
    // Generate random number (or pass as needed)
    console.log("⏳ Generating random number...");
    const randomNumber = Math.floor(Math.random() * 1e9);

    try {
      console.log(`📢 Calling distributeWeeklyRewards(${randomNumber})...`);
      const tx = await stakingContract.distributeWeeklyRewards(randomNumber);
      console.log("Transaction sent:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed!");
    } catch (error) {
      console.error("Error distributing rewards:", error);
    }
  } else {
    console.log("No prizes available. Skipping rewards distribution.");
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

// To test every 30 minutes:
cron.schedule("*/30 * * * *", () => {
  console.log("⏳ Running scheduled task every minute...");
  distributeRewards();
});

// API Route to Trigger Manually
app.post("/trigger-reward", async (req, res) => {
  try {
    await distributeRewards();
    res.status(200).json({ message: "Reward distributed successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error distributing rewards." });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});
