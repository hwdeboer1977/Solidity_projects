// Import Hardhat Runtime Environment
const hre = require("hardhat");
const { ethers } = require("hardhat");
const crypto = require("crypto");

// Run with: npx hardhat run test/deployStakingDapp.js --network hardhat

async function main() {
  // try {
  //Get the contract factory
  const TokenInput = await hre.ethers.getContractFactory("TokenInput");
  const TokenLuckyX = await hre.ethers.getContractFactory("TokenLuckyX");
  const StakingContract = await hre.ethers.getContractFactory(
    "StakingContract"
  );

  const [owner, user1, user2, user3] = await hre.ethers.getSigners(); // Get owner and a test user
  console.log("Owner address:", owner.address);
  console.log("User1 address:", user1.address);
  console.log("User2 address:", user2.address);
  console.log("User3 address:", user3.address);
  // } catch (error) {
  //   console.error("Error:", error);
  // }

  // Set maximum supply
  const initialSupply = hre.ethers.parseUnits("1000000", 18); // 1 million token

  // Deploy the token contracts
  const tokenInput = await TokenInput.deploy();
  await tokenInput.waitForDeployment();
  console.log("TokenInput deployed at:", tokenInput.target);

  const tokenLuckyX = await TokenLuckyX.deploy();
  await tokenLuckyX.waitForDeployment();
  console.log("TokenInput deployed at:", tokenLuckyX.target);

  const stakingContract = await StakingContract.deploy(tokenLuckyX.target);
  await stakingContract.waitForDeployment();
  console.log("StakingContract deployed at:", stakingContract.target);

  // Send some tokens to all users
  // List of user addresses
  const users = [
    user1.address,
    user2.address,
    user3.address,
    // Add more addresses as needed
  ];

  // Amount to send to each user
  const amount = ethers.parseUnits("100", 18); // 100 tokens (adjust decimals if different)

  // Check owner's balance
  const balanceLuckyX = await tokenLuckyX.balanceOf(owner.address);
  console.log(
    "Owner's balance before transfer:",
    ethers.formatUnits(balanceLuckyX, 18)
  );

  // Send tokens to each user
  for (const user of users) {
    const tx = await tokenLuckyX.transfer(user, amount);
    console.log(
      `Sent ${ethers.formatUnits(
        amount,
        18
      )} tokens to ${user}. Transaction hash: ${tx.hash}`
    );
    await tx.wait(); // Wait for the transaction to be mined
  }

  // Check owner's balance after transfers
  const updatedBalanceLuckyX = await tokenLuckyX.balanceOf(owner.address);
  console.log(
    "Owner's balance after transfer:",
    ethers.formatUnits(updatedBalanceLuckyX, 18)
  );

  // Check user's balance
  const balance = await tokenLuckyX.balanceOf(user1.address);
  console.log(`User1 balance: ${ethers.formatUnits(balance, 18)} tokens`);

  // User approves the staking contract to spend tokens on their behalf
  await tokenLuckyX.connect(user1).approve(stakingContract.target, amount);
  await tokenLuckyX.connect(user2).approve(stakingContract.target, amount);
  await tokenLuckyX.connect(user3).approve(stakingContract.target, amount);

  // All users are staking their tokens
  let stakeTx;
  stakeTx = await stakingContract.connect(user1).stake(amount);
  await stakeTx.wait();
  stakeTx = await stakingContract.connect(user2).stake(amount);
  await stakeTx.wait();
  stakeTx = await stakingContract.connect(user3).stake(amount);
  await stakeTx.wait();

  // Check balance of staking contract
  const balanceStakingContract = await tokenLuckyX.balanceOf(
    stakingContract.target
  );
  console.log(
    `StakingContract balance: ${ethers.formatUnits(
      balanceStakingContract,
      18
    )} tokens`
  );

  // Check totalStaked
  const totalStaked = await stakingContract.totalStaked();
  console.log("Total staked: " + totalStaked);

  await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds

  // Check balance lottery pool
  const lotteryPool = await stakingContract.lotteryPool();
  console.log("lotteryPool:", lotteryPool.toString());

  const contractBalance = await tokenLuckyX.balanceOf(stakingContract.target);
  console.log(
    "Contract Token Balance:",
    ethers.formatUnits(contractBalance, 18)
  );

  // Generate a secure random number within the correct range
  const randomNumber = await generateSecureRandomNumber(totalStaked);

  console.log("Random number generated:", randomNumber.toString());

  // // Call pickWinner with the safe random number
  // const tx = await stakingContract.pickWinner(randomNumber);
  // await tx.wait();
  // console.log("Random number sent to contract successfully!");

  // Prizes are paid at Saturday 6PM UTC
  const nextSaturdayTimestamp = getNextSaturday6PM();
  console.log(
    "Next Saturday 6 PM UTC in seconds:",
    nextSaturdayTimestamp.toString()
  );

  // Information dripRewardsPool
  const dripRewardsPool = await stakingContract.dripRewardsPool();
  console.log(
    "Total rewards in Drip Rewards Pool: ",
    dripRewardsPool,
    toString()
  );

  // Claimable rewards per user
  // ClaimableRewards is a public mapping, Solidity automatically creates a getter functio
  // Call the public mapping getter function
  const rewards = await stakingContract.claimableRewards(user1);

  console.log(
    `Claimable Rewards for ${user1}: ${ethers.formatUnits(rewards, 18)} tokens`
  );

  // Biggest depositor price
  const rewardBigDeposit = await stakingContract.biggestDepositorRewardPool();
  console.log(
    `Biggest Depositor Price: ${ethers.formatUnits(
      rewardBigDeposit,
      18
    )} tokens`
  );

  // Highest deposit
  const highestDeposit = await stakingContract.highestDeposit();
  console.log("Current Highest Deposit: ", highestDeposit);

  // Highest depositer
  const highestDepositUser = await stakingContract.biggestDepositor();
  console.log("Current Highest Deposit: ", highestDepositUser.toString());

  // Call the `pickWinner` function
  await hre.network.provider.send("evm_increaseTime", [nextSaturdayTimestamp]); // Increase time by 24 hours

  // Burned amount
  const burnedAmount = await stakingContract.burnedAmount();
  console.log("Amount to be burned: ", burnedAmount.toString());

  const tx = await stakingContract.distributeWeeklyRewards(randomNumber);
  const receipt = await tx.wait(); // Wait for transaction to be confirmed
  console.log("Transaction Mined! Hash:", tx.hash);

  // Wait for the transaction to be mined
  await tx.wait();
  console.log("Random number sent to contract successfully!");

  // Check the price
  // Listen for the LotteryWinner event
  // Fetch only the latest LotteryWinner event
  const events = await stakingContract.queryFilter("LotteryWinner", -1);

  // Process only the last event
  if (events.length > 0) {
    const latestEvent = events[events.length - 1];

    console.log(`Winner: ${latestEvent.args.winner}`);
    console.log(
      `Prize: ${ethers.formatUnits(latestEvent.args.prizeAmount, 18)} tokens`
    );
    console.log(
      `Treasury: ${ethers.formatUnits(latestEvent.args.totalFees, 18)} tokens`
    );
  } else {
    console.log("No lottery winner event found.");
  }
}

function getNextSaturday6PM() {
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();

  let daysUntilSaturday = (6 - currentDay + 7) % 7;
  const nextSaturday = new Date(now);
  nextSaturday.setUTCDate(now.getUTCDate() + daysUntilSaturday);
  nextSaturday.setUTCHours(18, 0, 0, 0);

  if (currentDay === 6 && currentHour >= 18) {
    nextSaturday.setUTCDate(nextSaturday.getUTCDate() + 7);
  }

  return Math.floor(nextSaturday.getTime() / 1000);
}

// Function to generate a secure random number
// Uses crypto.randomBytes(32), generate 32 Random Bytes, which is cryptographically secure.
async function generateSecureRandomNumber(totalStaked) {
  const randomBytes = crypto.randomBytes(32); // Generate a secure 32-byte random number
  // Convert Bytes to BigInt: gives a random number between 0 and 2^256 - 1.
  // % totalStaked → Scale Down to totalStaked Range
  // Since randomBigInt is a huge number (up to 2^256-1), it needs to be scaled down.
  // % totalStaked ensures the number is within 0 and totalStaked - 1.
  const randomBigInt = ethers.toBigInt(randomBytes) % totalStaked;
  // If totalStaked = 200: random number between 0 and 199
  // If totalStaked = 1000: random number between 0 and 999
  return randomBigInt;
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
