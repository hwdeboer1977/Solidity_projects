// Import Hardhat Runtime Environment
const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  // try {
  //Get the contract factory
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
  const initialSupply = hre.ethers.utils.parseUnits("1000000", 18); // 1 million token

  // Deploy the token contracts
  const tokenLuckyX = await TokenLuckyX.deploy(initialSupply);

  // Wait for token deployment
  await tokenLuckyX.deployed();
  console.log("tokenLuckyX contract deployed to:", tokenLuckyX.address);

  const stakingContract = await StakingContract.deploy(tokenLuckyX.address);
  await stakingContract.deployed();
  console.log("stakingContract contract deployed to:", stakingContract.address);

  // Send some tokens to all users
  // List of user addresses
  const users = [
    user1.address,
    user2.address,
    user3.address,
    // Add more addresses as needed
  ];

  // Amount to send to each user
  const amount = ethers.utils.parseUnits("100", 18); // 100 tokens (adjust decimals if different)

  // Check owner's balance
  const balanceLuckyX = await tokenLuckyX.balanceOf(owner.address);
  console.log(
    "Owner's balance before transfer:",
    ethers.utils.formatUnits(balanceLuckyX, 18)
  );

  // Send tokens to each user
  for (const user of users) {
    const tx = await tokenLuckyX.transfer(user, amount);
    console.log(
      `Sent ${ethers.utils.formatUnits(
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
    ethers.utils.formatUnits(updatedBalanceLuckyX, 18)
  );

  // Check user's balance
  const balance = await tokenLuckyX.balanceOf(user1.address);
  console.log(`User1 balance: ${ethers.utils.formatUnits(balance, 18)} tokens`);

  // User approves the staking contract to spend tokens on their behalf
  await tokenLuckyX.connect(user1).approve(stakingContract.address, amount);
  await tokenLuckyX.connect(user2).approve(stakingContract.address, amount);
  await tokenLuckyX.connect(user3).approve(stakingContract.address, amount);

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
    stakingContract.address
  );
  console.log(
    `StakingContract balance: ${ethers.utils.formatUnits(
      balanceStakingContract,
      18
    )} tokens`
  );

  // Check totalStaked
  const totalStaked = await stakingContract.totalStaked();
  console.log("Total staked: " + totalStaked);

  // Generate a random number (e.g., between 1 and 100)
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  console.log("Random number generated:", randomNumber);

  // Call the `pickWinner` function
  // Only after 24 hours, so manipulate time
  await hre.network.provider.send("evm_increaseTime", [24 * 60 * 60]); // Increase time by 24 hours

  const tx = await stakingContract.pickWinner(randomNumber);
  console.log("Transaction hash:", tx.hash);

  // Wait for the transaction to be mined
  await tx.wait();
  console.log("Random number sent to contract successfully!");

  if (tx.status === 1) {
    console.log("Prize paid successfully!");
  } else {
    console.log("Prize payout skipped. Not yet time.");
  }

  // Check the price
  // Listen for the LotteryWinner event
  const events = await stakingContract.queryFilter(
    "LotteryWinner",
    0,
    "latest"
  );
  for (const event of events) {
    console.log(`Winner: ${event.args.winner}`);
    console.log(
      `Prize: ${ethers.utils.formatUnits(event.args.prizeAmount, 18)} tokens`
    );
    console.log(
      `Treasury: ${ethers.utils.formatUnits(event.args.totalFees, 18)} tokens`
    );
  }
}

// Run the script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
