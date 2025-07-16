const { ethers } = require("hardhat");
const { setupContracts } = require("./04-setup-governance-contracts.js");

async function deployBox() {
  const [deployer, user1] = await ethers.getSigners();

  // Deploy GovernanceToken, TimeLock, GovernanceContract
  // Call the deployGovernanceContract function
  const { governanceContract, timeLock, governanceToken } =
    await setupContracts();

  console.log("GovernanceContract deployed at:", governanceContract.target);
  console.log("TimeLock deployed at:", timeLock.target);
  console.log("GovernanceToken deployed at:", governanceToken.target);

  // Deploy the Box contract
  const Box = await ethers.getContractFactory("Box");
  const box = await Box.deploy();
  console.log("Deployed Box contract at: " + box.target);

  const boxContract = await ethers.getContractAt("Box", box.target);

  const transferTx = await boxContract.transferOwnership(timeLock.target);
  await transferTx.wait(1);
}

deployBox().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
