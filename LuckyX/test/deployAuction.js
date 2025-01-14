// Import Hardhat Runtime Environment
const hre = require("hardhat");
const { ethers } = require("hardhat");

// TO DO: BETTER MAPPING OF DEPOSITS, PER USER, PER ROUND
// CLAIM PER ROUND?
// OR ACCUMULATED CLAIM?

// CREATE DRIP POOL AND DRIP REWARDS FROM TREASURY TO STAKERS

async function main() {
  //Get the contract factory
  const TokenLuckyX = await hre.ethers.getContractFactory("TokenLuckyX");
  const TokenInput = await hre.ethers.getContractFactory("TokenInput");
  const Auction = await hre.ethers.getContractFactory("Auction");

  // Set maximum supply
  const initialSupply = hre.ethers.utils.parseUnits("1000000", 18); // 1 million token

  // Deploy the token contracts
  const tokenLuckyX = await TokenLuckyX.deploy(initialSupply);
  const tokenInput = await TokenInput.deploy(initialSupply);

  // Wait for token deployment
  await tokenLuckyX.deployed();
  await tokenInput.deployed();
  console.log("tokenLuckyX contract deployed to:", tokenLuckyX.address);
  console.log("token Input contract deployed to:", tokenInput.address);

  // Deploy the auction contract
  const auction = await Auction.deploy(tokenInput.address, tokenLuckyX.address);
  await auction.deployed();
  console.log("Auction contract deployed to:", auction.address);

  // Transfer all LuckyX tokens to the Auction contract
  const totalLuckyXSupply = await tokenLuckyX.totalSupply(); // Get the total supply
  const transferTx = await tokenLuckyX.transfer(
    auction.address,
    totalLuckyXSupply
  ); // Transfer to Auction
  await transferTx.wait();
  console.log(
    `Transferred ${hre.ethers.utils.formatUnits(
      totalLuckyXSupply,
      18
    )} LuckyX tokens to Auction contract.`
  );

  // Confirm balance of LuckyX tokens in Auction contract
  const auctionBalanceInit = await tokenLuckyX.balanceOf(auction.address);
  console.log(
    `Auction contract LuckyX balance: ${hre.ethers.utils.formatUnits(
      auctionBalanceInit,
      18
    )}`
  );

  // Get starttime: Unix timestamp format, which is in seconds.
  // Unix timestamps represent the number of seconds elapsed since January 1, 1970, 00:00:00 UTC.
  const startTimeAuction = await auction.startTimeCurrentRound();
  console.log("Start time auction: " + startTimeAuction);
  const date = new Date(startTimeAuction * 1000); // Multiply by 1000 to convert to milliseconds
  console.log(date.toISOString()); // Outputs in ISO 8601 format

  // If you don't manipulate time, elapsedTime will always be 0 because block.timestamp and startTimeAuction will remain the same.
  // Note: we want the auction rounds to continue automatically (without calling the function getCurrentAuctionRound manually)
  // await auction.getCurrentAuctionRound();
  // const currentRoundUpdated = await auction.currentRound();
  // console.log("Current auction round: " + currentRoundUpdated);
  // Track the progress of currentRound
  // Update current round explicitly
  console.log("Calling getCurrentAuctionRound...");
  await auction.getCurrentAuctionRound();
  let currentRound = await auction.currentRound();
  console.log("Initial auction round: " + currentRound);

  // Simulate passage of time and mine blocks

  // console.log("Simulating auction rounds...");
  // for (let i = 0; i < 4; i++) {
  //   await hre.network.provider.send("evm_increaseTime", [10]); // Advance by roundDuration (10 seconds)
  //   await hre.network.provider.send("evm_mine"); // Mine a block

  //   // Call the upkeep function manually to update the round
  //   await auction.performUpkeep("0x");

  //   // Get updated round
  //   currentRound = await auction.currentRound();
  //   console.log(`Updated auction round: ${currentRound}`);
  // }

  // Deposit funds in contract
  // Simulate user deposit
  const [owner, user1, user2, user3] = await hre.ethers.getSigners(); // Get owner and a test user
  console.log("Owner address:", owner.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);
  console.log("User3 address:", user3.address);

  // Mint input tokens to the user
  const userTokens = hre.ethers.utils.parseUnits("100", 18); // 100 TokenInput tokens
  await tokenInput.connect(owner).transfer(user1.address, userTokens);
  await tokenInput.connect(owner).transfer(user2.address, userTokens);
  await tokenInput.connect(owner).transfer(user3.address, userTokens);
  console.log(`Transferred ${userTokens.toString()} TokenInput to user.`);

  // // Approve auction contract to spend user's TokenInput tokens
  // const depositAmount = hre.ethers.utils.parseUnits("10", 18); // Deposit 10 tokens
  // await tokenInput.connect(user1).approve(auction.address, userTokens);
  // await tokenInput.connect(user2).approve(auction.address, userTokens);
  // await tokenInput.connect(user3).approve(auction.address, userTokens);
  // console.log(
  //   `User approved ${depositAmount.toString()} TokenInput for auction contract.`
  // );

  // // First deposit user 1: call deposit function
  // const tx = await auction.connect(user1).deposit(depositAmount);
  // await tx.wait();
  // console.log(
  //   `User deposited 1st time ${depositAmount.toString()} TokenInput into the auction.`
  // );

  // // Second deposit user 1: call deposit function again
  // const tx2 = await auction.connect(user1).deposit(depositAmount);
  // await tx2.wait();
  // console.log(
  //   `User deposited 2nd time ${depositAmount.toString()} TokenInput into the auction.`
  // );

  // // First deposit user 2: call deposit function again
  // const tx3 = await auction.connect(user2).deposit(depositAmount);
  // await tx3.wait();
  // console.log(
  //   `User deposited 2nd time ${depositAmount.toString()} TokenInput into the auction.`
  // );

  // // Verify contract balances
  // const auctionBalance = await tokenInput.balanceOf(auction.address);
  // console.log(
  //   "Auction contract TokenInput balance:",
  //   hre.ethers.utils.formatUnits(auctionBalance, 18)
  // );

  // // Check user's balance
  // const userBalance1 = await tokenInput.balanceOf(user1.address);
  // console.log(
  //   "User TokenInput balance:",
  //   hre.ethers.utils.formatUnits(userBalance1, 18)
  // );
  // const userBalance2 = await tokenInput.balanceOf(user2.address);
  // console.log(
  //   "User TokenInput balance:",
  //   hre.ethers.utils.formatUnits(userBalance2, 18)
  // );

  // // Check user's deposit per round
  // const userDepositCountOwner = await auction.userDepositCount(owner.address);
  // const userDepositCountUser1 = await auction.userDepositCount(user1.address);
  // const userDepositCountUser2 = await auction.userDepositCount(user2.address);
  // console.log("userDepositCountOwner: " + userDepositCountOwner);
  // console.log("userDepositCountUser 1: " + userDepositCountUser1);
  // console.log("userDepositCountUser 2: " + userDepositCountUser2);

  // const depositUser1 = await auction.userDeposits(user1.address, currentRound);
  // if (depositUser1.gt(0)) {
  //   // Check if deposit is greater than zero
  //   console.log(
  //     `User 1 Round ${currentRound}: Deposited ${depositUser1.toString()}`
  //   );
  // }
  // const depositUser2 = await auction.userDeposits(user2.address, currentRound);
  // if (depositUser2.gt(0)) {
  //   // Check if deposit is greater than zero
  //   console.log(
  //     `User 2 Round ${currentRound}: Deposited ${depositUser2.toString()}`
  //   );
  // }

  // // Check totalDepositRound and claimable amount
  // //const roundNumber = 1; // Replace with the desired round number
  // const totalDepositRound = await auction.totalDepositsPerRound(currentRound);
  // console.log(
  //   `Total deposit for round ${currentRound}:`,
  //   ethers.utils.formatUnits(totalDepositRound, 18)
  // );

  // // In Hardhat blocks are not mined automatically
  // // Advance time by 24 hours (86400 seconds)
  // await hre.network.provider.send("evm_increaseTime", [24 * 60 * 60]);

  // // Get updated round
  // await auction.updateCurrentRound();

  // // Get updated round
  // currentRound = await auction.currentRound();
  // console.log(`Updated auction round: ${currentRound.toString()}`);

  // // Call the `amountToClaim` function
  // const tx4 = await auction.amountToClaim(user1.address, 0); // Initiate the transaction
  // const receipt = await tx4.wait(); // Wait for the transaction to be mined

  // // Decode the returned value (toClaim)
  // // Find the 'Claimed' event
  // const claimedEvent = receipt.events.find(
  //   (event) => event.event === "Claimed"
  // );

  // if (claimedEvent) {
  //   const toClaim = claimedEvent.args.amount; // Extract 'toClaim' amount
  //   console.log(`Claimable amount:`, toClaim.toString());
  // } else {
  //   console.log("Claimed event not found in the transaction receipt.");
  // }

  // // Check balances after claim
  // const auctionInputBalanceClaimed = await tokenInput.balanceOf(
  //   auction.address
  // );
  // const auctionOutputBalanceClaimed = await tokenLuckyX.balanceOf(
  //   auction.address
  // );
  // const userInputBalanceClaimed = await tokenInput.balanceOf(user1.address);
  // const userOutputBalanceClaimed = await tokenLuckyX.balanceOf(user1.address);

  // console.log("auctionInputBalanceClaimed: " + auctionInputBalanceClaimed);
  // console.log("auctionOutputBalanceClaimed: " + auctionOutputBalanceClaimed);
  // console.log("userInputBalanceClaimed: " + userInputBalanceClaimed);
  // console.log("userOutputBalanceClaimed: " + userOutputBalanceClaimed);

  const tx = await auction.updateTimeRemaining();
  const receipt = await tx.wait();

  const setDuration = await auction.setRoundDuration(300);
  const receipt2 = await setDuration.wait();

  //console.log("Events:", receipt.events);
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
