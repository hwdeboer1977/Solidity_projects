const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed contract address
  const auctionAddress = "0xA7c59f010700930003b33aB25a7a0679C860f29c";

  // Get the contract ABI (from artifacts or saved file)
  const auctionABI =
    require("C:/Users/hwdeb/Documents/auction/artifacts/contracts/Auction.sol/Auction.json").abi;

  // Get the signer (e.g., first account from Hardhat node)
  const [deployer] = await ethers.getSigners();

  // Attach to the deployed contract
  const auctionContract = new ethers.Contract(
    auctionAddress,
    auctionABI,
    deployer
  );

  console.log(`Connected to Auction contract at: ${auctionAddress}`);

  // Example: Call a view function
  let currentRound = await auctionContract.currentRound();
  console.log("Current Round:", currentRound.toString());

  // Time to increase (10 minutes = 600 seconds)
  const timeToIncrease = 600; // 10 minutes in seconds

  console.log("Advancing time by 10 minutes...");

  // Increase time
  await network.provider.send("evm_increaseTime", [timeToIncrease]);

  const timeRemaining = await auctionContract.getTimeRemaining();
  console.log(
    "Time remaining after advancing time:",
    timeRemaining.toString(),
    "seconds"
  );

  // Call update function (if it exists)
  const updateTx = await auctionContract.updateCurrentRound();
  await updateTx.wait();
  console.log("Updated current round in the contract");

  currentRound = await auctionContract.currentRound();
  console.log("Current Round:", currentRound.toString());

  // Example: Call a state-changing function
  //   const newRoundDuration = 3600; // 1 hour in seconds
  //   const tx = await auctionContract.setRoundDuration(newRoundDuration);
  //   await tx.wait(); // Wait for the transaction to be mined
  //   console.log(`Updated round duration to ${newRoundDuration} seconds`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
