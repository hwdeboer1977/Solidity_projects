const { ethers } = require("ethers");
const WebSocket = require("ws");
const http = require("http");
require("dotenv").config({
  path: "C:\\Users\\hwdeb\\Documents\\auction\\.env",
});

const RPC_URL = process.env.ALCHEMY_API_SEPOLIA;
const PRIVATE_KEY = process.env.WALLET_SECRET;

const auctionAddress = "0xEb9Ed228Dca0ebfD6122415c1Db9eA0aaD27a6c8";
const AuctionABI = require("./pages/Auction.json");

const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contractAuction = new ethers.Contract(auctionAddress, AuctionABI, wallet);

const app = require("express")();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentRound = 0;
let roundDuration = 0;
let startTimeCurrentRound = 0;
let currentTime = 0;
let currentRoundEndTime = 0;

const broadcastRoundData = () => {
  currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  currentRoundEndTime = startTimeCurrentRound + roundDuration; // Calculate once

  const data = JSON.stringify({
    currentRound,
    currentRoundEndTime,
    currentTime,
  });

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
};

const CHECK_INTERVAL = 20000; // Check every second

async function monitorRounds() {
  try {
    currentRound = Number(await contractAuction.currentRound());
    startTimeCurrentRound = Number(
      await contractAuction.startTimeCurrentRound()
    );
    roundDuration = Number(await contractAuction.roundDuration());
    currentRoundEndTime = startTimeCurrentRound + roundDuration;

    currentTime = Math.floor(Date.now() / 1000);

    console.log("Current round:", currentRound);
    console.log("Current round end time:", currentRoundEndTime);
    console.log("Current time:", currentTime);

    if (currentTime >= currentRoundEndTime) {
      console.log(`Round ${currentRound} has ended. Updating to next round...`);
      const tx = await contractAuction.updateCurrentRound();
      console.log("Transaction sent:", tx.hash);

      await tx.wait();
      console.log("Round updated successfully.");
    }

    broadcastRoundData();
  } catch (error) {
    console.error("Error monitoring rounds:", error);
  }
}

setInterval(monitorRounds, CHECK_INTERVAL);

wss.on("connection", (ws) => {
  console.log("Client connected");

  // Send the latest data when a client connects
  ws.send(
    JSON.stringify({
      currentRound,
      currentRoundEndTime,
      currentTime,
    })
  );

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
