const { ethers } = require("ethers");
const WebSocket = require("ws");
const http = require("http");
require("dotenv").config({
  path: "C:\\Users\\hwdeb\\Documents\\blockstat_solutions_work\\Solidity_projects\\LuckyX\\.env",
});

const RPC_URL = process.env.ALCHEMY_API_SEPOLIA;
const PRIVATE_KEY = process.env.WALLET_SECRET;

const auctionAddress = "0x1AbB8C31Cc06759bEeB07184a0DF9A0Ce11CbA9c";
const AuctionABI = require("./pages/Auction.json");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractAuction = new ethers.Contract(auctionAddress, AuctionABI, wallet);

async function reset() {
  const resetAuction = await contractAuction.resetAuction();
  await resetAuction.wait();
}
reset();
