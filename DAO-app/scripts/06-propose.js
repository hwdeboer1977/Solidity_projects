const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

const proposalsFile = path.join(__dirname, "proposals.json");

// Step 1: Please make sure all the contracts have been deployed!
// npx hardhat deploy --network localhost

// Step 2: Set up the governance contract:
// npx hardhat run scripts/05-setup-governance-contracts.js --network localhost

// Step 3: Propose
// npx hardhat run scripts/propose.js --network localhost

// Sequence of DAO is as follows:
// 1. Make proposal (propose.js)
// 2. Voting (voting.js)
// 3. Queue & Execute (queue-and-execute.js)

async function propose(functionToCall, args, proposalDescription) {
  // Get deployer
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  // Get contract token
  const governanceToken = await ethers.getContract("GovernanceToken");

  // Get contract timeLock
  const timeLock = await ethers.getContract("TimeLock");

  // Get contract Governance
  const governanceContract = await ethers.getContract("GovernanceContract");

  // Get contract Box
  const box = await ethers.getContract("Box");

  // Function propose is found here: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/Governor.sol
  //    function propose(address[] memory targets,uint256[] memory values,bytes[] memory calldatas, string memory description)
  //    targets = contracts we want to target (here our box contract)
  //    value = eth we send (here 0)
  //    calldatas = encoded parameters of the function
  //    description = a discription

  // Our box function has a store and retrieve function
  // We need to encode this!
  console.log("functionToCall: ", functionToCall);
  console.log("arguments: ", args);

  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  );
  console.log("Encoded function call:", encodedFunctionCall);
  console.log(`Proposing ${functionToCall} on ${box.target} with ${args}`);
  console.log(`Proposal Description:\n  ${proposalDescription}`);

  // Delegate voting power: DO THIS BEFORE PROPOSAL
  const delegateTx = await governanceToken.delegate(deployer);
  await delegateTx.wait();
  console.log("Tokens delegated to self.");

  const delegatee = await governanceToken.delegates(deployer);
  console.log("Delegatee Address:", delegatee);

  // Mine one block to ensure state is updated
  await ethers.provider.send("evm_mine", []);
  console.log("Mined one block after delegation.");

  // Now we can propose
  const proposeTx = await governanceContract.propose(
    [box.target],
    [0],
    [encodedFunctionCall],
    proposalDescription
  );

  // Each proposal has an ID which is emitted in an event
  const proposeReceipt = await proposeTx.wait(1);

  //console.log("Transaction Receipt Logs:", proposeReceipt.logs);

  // Find the ProposalCreated event in the logs
  const event = proposeReceipt.logs.find(
    (log) => log.fragment.name === "ProposalCreated"
  );

  let proposalId; // Declare proposalId in the outer scope
  if (event) {
    proposalId = event.args[0]; // Or event.args.proposalId if named
    console.log("Proposal ID:", proposalId.toString());
    console.log("Proposer:", event.args[1]);
    console.log("Description:", event.args[8]);
  } else {
    console.error("ProposalCreated event not found in transaction logs.");
  }

  // Get the snapshot and deadline for the proposal (optional for tracking)
  const proposalSnapShot = await governanceContract.proposalSnapshot(
    proposalId
  );
  const proposalDeadline = await governanceContract.proposalDeadline(
    proposalId
  );
  console.log("Proposal Snapshot: ", proposalSnapShot.toString());
  console.log("Proposal Deadline: ", proposalDeadline.toString());

  // Wait for the voting delay (voting delay in blocks)
  // Assuming the token uses block numbers, and assuming block time of around 12 seconds,
  // we will have set votingDelay = 1 day = 7200 blocks, and votingPeriod = 1 week = 50400 blocks.
  // const VOTING_DELAY = 7200; // 7200 blocks
  // await ethers.provider.send("evm_increaseTime", [VOTING_DELAY + 10]); // Fast forward time
  // await ethers.provider.send("evm_mine", []); // Mine a block to apply the time change

  // // Check the proposal state after the voting delay
  // const proposalState = await governanceContract.state(proposalId);
  // console.log("Proposal State after voting delay: ", proposalState.toString());

  // // the Proposal State is an enum data type, defined in the IGovernor contract.
  // // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
  // console.log(`Current Proposal State: ${proposalState}`);
  // // What block # the proposal was snapshot
  // console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // // The block number the proposal voting expires
  // console.log(`Current Proposal Deadline: ${proposalDeadline}`);

  // save the proposalId
  storeProposalId(proposalId);
}

// Store all proposal in JSON
async function storeProposalId(proposalId) {
  // Get the current network
  const network = await ethers.provider.getNetwork();

  // Retrieve the chainId from the network
  const chainId = network.chainId.toString();

  // Log the chainId
  console.log("Chain Id: ", chainId);
  // Initialize an empty object
  let proposals = {};

  // Check if the proposals file exists
  if (fs.existsSync(proposalsFile)) {
    proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  }

  // Ensure the chainId exists in the proposals object
  if (!proposals[chainId]) {
    proposals[chainId] = [];
  }

  // Add the new proposalId to the chain's array
  proposals[chainId].push(proposalId.toString());

  // Write the updated proposals object back to the file
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals, null, 2), "utf8");

  console.log(`Proposal ID ${proposalId} stored for chain ID ${chainId}`);
}

// 1st input = function "store" from Box contract
// 2nd input = newValue to store
// 3rd input = proposalDescription
propose("store", [77], "Porposal 1: set value to 77 in Box contract");
