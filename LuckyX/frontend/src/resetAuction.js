const { ethers } = require("ethers");
const WebSocket = require("ws");
const http = require("http");
require("dotenv").config({
  path: "C:\\Users\\hwdeb\\Documents\\auction\\.env",
});

const RPC_URL = process.env.ALCHEMY_API_SEPOLIA;
const PRIVATE_KEY = process.env.WALLET_SECRET;

const auctionAddress = "0x467cd335f03b3Fc7EE6DB0884309336310b7924a";
const AuctionABI = require("./pages/Auction.json");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractAuction = new ethers.Contract(auctionAddress, AuctionABI, wallet);

async function reset() {
  const resetAuction = await contractAuction.resetAuction();
  await resetAuction.wait();
}
reset();
