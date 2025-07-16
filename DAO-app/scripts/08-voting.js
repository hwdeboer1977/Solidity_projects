// After the proposal was made, we can vote
const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");
const { time } = require("console");

const proposalsFile = path.join(__dirname, "proposals.json");

// Step 1: Please make sure all the contracts have been deployed!
// npx hardhat deploy --network localhost

// Step 2: Set up the governance contract:
// npx hardhat run scripts/05-setup-governance-contracts.js --network localhost

// Step 3: Propose
// npx hardhat run scripts/propose.js --network localhost

// Step 4: Voting
// npx hardhat run scripts/voting.js --network localhost

async function main() {
  // Get the current network's chainId
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  // Load proposals from the JSON file
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));

  // Ensure proposals exist for the current chainId
  if (!proposals[chainId] || proposals[chainId].length === 0) {
    console.error(`No proposals found for chain ID ${chainId}.`);
    return;
  }

  // Get the last proposal for the current chainId
  const proposalId = proposals[chainId].at(-1); // Access the last proposal ID
  console.log(`Last Proposal ID for chain ID ${chainId}: ${proposalId}`);

  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1;
  const reason = "I lika do da cha cha";
  await vote(proposalId, voteWay, reason);
}

// Function to vote
// 0 = Against, 1 = For, 2 = Abstain for this example
async function vote(proposalId, voteWay, reason) {
  // Logic here
  console.log("Voting...");

  // Get deployer
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  // Get contract Governance contract again
  const governanceContract = await ethers.getContract("GovernanceContract");

  console.log("proposalId: ", proposalId);
  console.log("voteWay: ", voteWay);
  console.log("reason: ", reason);

  // First check the state of the proposal
  // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
  let proposalState = await governanceContract.state(proposalId.toString());
  console.log(`Current Proposal State: ${proposalState}`);

  // Get the snapshot and deadline for the proposal (optional for tracking)
  const proposalSnapShot = await governanceContract.proposalSnapshot(
    proposalId
  );
  const proposalDeadline = await governanceContract.proposalDeadline(
    proposalId
  );
  console.log("Proposal Snapshot: ", proposalSnapShot.toString());
  console.log("Proposal Deadline: ", proposalDeadline.toString());

  // Initial block
  let latestBlock = await ethers.provider.getBlock("latest");
  console.log("Latest Block: ", latestBlock.number);

  // Initial timestap
  console.log("Latest Block Timestamp: ", latestBlock.timestamp);

  // Get the proposal snapshot and calculate the active block
  let proposalSnapshot = await governanceContract.proposalSnapshot(proposalId);
  const VOTING_DELAY = 7200; // Blocks specified in GovernorSettings
  const VOTING_ACTIVE_AT = parseInt(proposalSnapshot.toString());

  console.log("Proposal Snapshot Block:", proposalSnapshot.toString());
  console.log("Voting Active at Block Number:", VOTING_ACTIVE_AT);

  // Calculate blocks to mine
  const blocksToMine = VOTING_ACTIVE_AT - latestBlock.number + 1;
  console.log(`Blocks to Mine: ${blocksToMine}`);

  // Mine the required number of blocks
  if (blocksToMine > 0) {
    console.log(`Mining ${blocksToMine} blocks...`);
    for (let i = 0; i < blocksToMine; i++) {
      await ethers.provider.send("evm_mine", []);
    }
  } else {
    console.log("Already past the voting delay. No need to mine more blocks.");
  }

  // Fetch the updated block and proposal state
  const updatedBlock = await ethers.provider.getBlock("latest");
  console.log("Updated Block Number:", updatedBlock.number);

  // Check the proposal state
  proposalState = await governanceContract.state(proposalId);
  console.log("Proposal State:", proposalState.toString());

  if (proposalState.toString() === "1") {
    console.log("Proposal is now Active! You can vote on it.");
  } else {
    console.log("Proposal is still Pending. Ensure enough blocks were mined.");
  }

  // Check Quorum: defines the minimum number of votes required for a proposal to pass
  const quorumValue = await governanceContract.quorum(proposalSnapshot);
  console.log("Quorum at Snapshot Block:", quorumValue.toString());

  // Check remaining current blocks and dealine again
  latestBlock = await ethers.provider.getBlockNumber();
  const votingDeadline = await governanceContract.proposalDeadline(proposalId);

  console.log("Current Block:", latestBlock);
  console.log("Voting Deadline Block:", votingDeadline.toString());

  async function monitorVotes(proposalId) {
    // Fetch the current votes
    const { forVotes, againstVotes, abstainVotes } =
      await governanceContract.proposalVotes(proposalId);

    // Display the vote counts
    console.log("\n--- Vote Update ---");
    console.log("Votes For:", forVotes.toString());
    console.log("Votes Against:", againstVotes.toString());
    console.log("Votes Abstain:", abstainVotes.toString());
  }

  // Get contract Governance token
  const governanceToken = await ethers.getContract("GovernanceToken");

  // Check balance of Governance token
  const balance = await governanceToken.balanceOf(deployer);
  console.log("Token Balance:", balance.toString());

  // Check voting power (if 0, you cannot vote!)
  const votingPower = await governanceContract.getVotes(
    deployer,
    proposalSnapShot
  );
  console.log("Voting Power at Snapshot Block:", votingPower.toString());

  // Replace YOUR_PROPOSAL_ID with the actual proposal ID
  //await monitorVotes(proposalId);

  // Call castVote function:
  //  function _castVote(uint256 proposalId, uint8 support)
  //  function castVoteWithReason(uint256 proposalId, uint8 support, reason)
  const voteTx = await governanceContract.castVoteWithReason(
    proposalId,
    voteWay,
    reason
  );

  const voteTxReceipt = await voteTx.wait(1);
  //console.log("Vote transaction hash:", voteTx.hash);
  //console.log("Vote transaction receipt:", voteTxReceipt);

  // Get the event
  // event VoteCast(address indexed voter, uint256 proposalId, uint8 support, uint256 weight, string reason);
  const events = await governanceContract.queryFilter("VoteCast");
  events.forEach((event) => {
    const { voter, proposalId, support, weight, reason } = event.args;
    console.log(`VoteCast Event:
      Voter: ${voter}
      Proposal ID: ${proposalId.toString()}
      Support: ${support}
      Weight: ${weight.toString()}
      Reason: ${reason}`);
  });

  // Check the proposal state
  proposalState = await governanceContract.state(proposalId);
  console.log("Proposal State:", proposalState.toString());

  await monitorVotes(proposalId);

  // // Move the block so that voting period ends
  // // GovernorSettings(7200 /* 1 day */, 50400 /* 1 week */, 0)
  // // Move the blocks so that voting period ends
  const VOTING_PERIOD = 50400 + 1; // Blocks specified in GovernorSettings

  async function endVotingPeriod() {
    console.log(
      `\nAdvancing ${VOTING_PERIOD} blocks to end the voting period...`
    );
    for (let i = 0; i < VOTING_PERIOD; i++) {
      await ethers.provider.send("evm_mine", []);
      if (i % 1000 === 0) {
        console.log(`Mined ${i} blocks...`);
      }
    }
    console.log(
      `Successfully mined ${VOTING_PERIOD} blocks. Voting period should now be over.`
    );
  }
  // Move blocks to end the voting period
  await endVotingPeriod();

  // Check the final state of the proposal
  proposalState = await governanceContract.state(proposalId);
  console.log("\nFinal Proposal State:", proposalState.toString());
  // // Proposal states:
  // // 0: Pending, 1: Active, 2: Canceled, 3: Defeated, 4: Succeeded, 5: Queued, 6: Expired, 7: Executed
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
