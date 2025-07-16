// We run: npx hardhat deploy --network localhost, which deploys the following contracts
// GovernanceToken.sol
// TimeLock.sol
// GovernanceContract.sol

// Note: npx hardhat deploy --network localhost (run first!!)
// Run this script with: npx hardhat run scripts/05-setup-governance-contracts.js --network localhost

const { ethers } = require("hardhat");

async function setupContracts() {
  // Here we set up the contracts
  const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

  // Get deployer
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  // Get contract timeLock
  const timeLock = await ethers.getContract("TimeLock");

  // Get contract Governance
  const governanceContract = await ethers.getContract("GovernanceContract");

  // Get all the roles from TimeLock contract (see
  // https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/TimelockController.sol)
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.CANCELLER_ROLE();

  const proposerTx = await timeLock.grantRole(
    proposerRole,
    governanceContract.target
  );
  await proposerTx.wait(1);

  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
  // Guess what? Now, anything the timelock wants to do has to go through the governance process!
  console.log(
    "Now, anything the timelock wants to do has to go through the governance process!"
  );

  // Get Box contract
  const box = await ethers.getContract("Box");
  const transferTx = await box.transferOwnership(timeLock.target);
  await transferTx.wait(1);
}

setupContracts().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
