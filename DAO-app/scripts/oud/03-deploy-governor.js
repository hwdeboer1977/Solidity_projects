const { deployGovernanceToken } = require("./01-deploy-token.js");
const { deployTimeLock } = require("./02-deploy-timeLock.js");
const { ethers } = require("hardhat");

async function deployGovernanceContract() {
  const [deployer, user1] = await ethers.getSigners();
  // console.log(
  //   "Deploying Governor contract with the account: " + deployer.address
  // );

  // Deploy GovernanceToken
  const governanceToken = await deployGovernanceToken();
  //console.log("GovernanceToken deployed at: " + governanceToken.target);

  // Deploy TimeLock
  // minDelay is how long you have to wait before executing
  // proposers is the list of addresses that can propose
  // executors is the list of addresses that can execute
  const timeLock = await deployTimeLock();
  //console.log("timeLock deployed at: " + timeLock.target);

  // Deploy GovernanceContract
  const GovernanceContract = await ethers.getContractFactory(
    "GovernanceContract"
  );
  const governanceContract = await GovernanceContract.deploy(
    governanceToken.target,
    timeLock.target
  );
  //console.log("Deployed GovernanceContract at: " + governanceContract.target);

  // Return both instances
  return {
    governanceContract,
    timeLock,
    governanceToken,
  };
}

// deployGovernanceContract().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

module.exports = { deployGovernanceContract };
