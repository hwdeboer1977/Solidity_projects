const { ethers } = require("hardhat");

async function deployGovernanceToken() {
  const [deployer, user1] = await ethers.getSigners();
  // console.log(
  //   "Deploying GovernanceToken contract with the account: " + deployer.address
  // );
  // console.log("Address user 1: " + user1.address);

  // Deploy the Governance token
  const GovernanceToken = await ethers.getContractFactory("GovernanceToken");
  const governanceToken = await GovernanceToken.deploy();
  //console.log("Deployed governanceToken at: " + governanceToken.target);

  // HOW CAN WE DELEGATE VOTE? I CANT FIND THE FUNCTION DELEGATE
  // It is here: openzeppelin-contracts/contracts/governance/utils/Votes.sol
  //    function delegate(address delegatee) public virtual {
  //     address account = _msgSender();
  //     _delegate(account, delegatee);

  // Checkpoints before delegation
  // console.log(
  //   `Checkpoints before delegation for user1: ${await governanceToken.numCheckpoints(
  //     user1.address
  //   )}`
  // );

  // // Delegate votes from deployer to user1
  // const transactionResponse = await governanceToken
  //   .connect(deployer)
  //   .delegate(user1.address);
  // await transactionResponse.wait(1);

  // // Checkpoints after delegation
  // console.log(
  //   `Checkpoints after delegation for user1: ${await governanceToken.numCheckpoints(
  //     user1.address
  //   )}`
  // );
  return governanceToken;
}

// deployGovernanceToken().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;
// });

module.exports = { deployGovernanceToken };
