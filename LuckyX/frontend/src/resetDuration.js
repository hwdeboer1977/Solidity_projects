const { ethers } = require("ethers");
const WebSocket = require("ws");
const http = require("http");
require("dotenv").config({
  path: "C:\\Users\\hwdeb\\Documents\\auction\\.env",
});

const RPC_URL = process.env.ALCHEMY_API_SEPOLIA;
const PRIVATE_KEY = process.env.WALLET_SECRET;

const auctionAddress = process.env.AUCTION_ADDRESS;
const AuctionABI = require("./pages/Auction.json");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractAuction = new ethers.Contract(auctionAddress, AuctionABI, wallet);

async function setRoundDuration() {
  try {
    // Calculate 10 minutes in seconds
    const durationInSeconds = 3 * 60; // 10 minutes = 600 seconds

    // Call the contract function with the duration
    const tx = await contractAuction.setRoundDuration(durationInSeconds);

    // Wait for the transaction to be mined
    await tx.wait();

    console.log("Round duration successfully updated to 10 minutes!");
  } catch (error) {
    console.error("Failed to update round duration:", error);
  }
}

// Execute the function
setRoundDuration();
