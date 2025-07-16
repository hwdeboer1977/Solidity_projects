const { ethers } = require("hardhat");

async function deployTimeLock() {
  const [deployer, user1] = await ethers.getSigners();
  //console.log("Deploying Time Lock with the account: " + deployer.address);
  //console.log("Address user 1: " + user1.address);

  // Deploy the Time Lock contract
  //   Inputs:
  //   uint256 minDelay,
  //   address[] memory proposers,
  //   address[] memory executors,
  //   address admin

  // Initialize parameters constructor TimeLock
  const MIN_DELAY = 3600; // In seconds
  const proposers = []; // Empty array for proposers
  const executors = []; // Empty array for executors
  const admin = deployer.address; // Set deployer as the admin for now

  const TimeLock = await ethers.getContractFactory("TimeLock");
  const timeLock = await TimeLock.deploy(
    MIN_DELAY,
    proposers,
    executors,
    admin
  );
  //console.log("Deployed governanceToken at: " + timeLock.target);

  return timeLock;
}

// deployTimeLock().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

module.exports = { deployTimeLock };
