// After the vote period has ended, we can queue and execute
const { ethers, network } = require("hardhat");

async function queueAndExecute() {
  const NEW_STORE_VALUE = 77;
  const FUNC = "store";
  const PROPOSAL_DESCRIPTION = "Porposal 1: set value to 77 in Box contract"; // This should be the same as in proposal!

  // Arguments encodeFunctionData
  const args = [NEW_STORE_VALUE];
  const functionToCall = FUNC;

  // We need to follow a similar approach as with 'propose'
  // queue can be found here in the governor contract?

  // Get contract Box
  const box = await ethers.getContract("Box");

  const encodedFunctionCall = box.interface.encodeFunctionData(
    functionToCall,
    args
  );

  // Function propose is found here: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/Governor.sol
  // Function queue(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash)
  // Similar arguments as propose function

  const descriptionHash = ethers.keccak256(
    ethers.toUtf8Bytes(PROPOSAL_DESCRIPTION)
  );
  // could also use ethers.id(PROPOSAL_DESCRIPTION)

  // Get contract Governance
  const governanceContract = await ethers.getContract("GovernanceContract");
  console.log("Queueing...");

  const queueTx = await governanceContract.queue(
    [box.target],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await queueTx.wait(1);
  console.log(queueTx);

  console.log("Executing...");
  // This will fail on a testnet because you need to wait for the MIN_DELAY!

  const MIN_DELAY = 3600; // Replace with your contract's actual timelock delay in seconds
  await ethers.provider.send("evm_increaseTime", [MIN_DELAY]);
  await ethers.provider.send("evm_mine", []);
  console.log("Simulated timelock delay.");

  const executeTx = await governanceContract.execute(
    [box.target],
    [0],
    [encodedFunctionCall],
    descriptionHash
  );
  await executeTx.wait(1);
  console.log("Proposal executed!");

  const newValue = await box.retrieve();
  console.log("New Box Value:", newValue.toString());
  // Expected Output: NEW_STORE_VALUE (e.g., 77)
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
