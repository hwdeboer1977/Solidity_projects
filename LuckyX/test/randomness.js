const crypto = require("crypto");
const { ethers } = require("ethers");

// Function to generate a random number between min and max
function generateRandomNumber(min, max) {
  const randomBytes = crypto.randomBytes(32);
  const randomBigInt = BigInt(`0x${randomBytes.toString("hex")}`);
  const range = BigInt(max) - BigInt(min) + 1n;
  const randomInRange = (randomBigInt % range) + BigInt(min);
  return randomInRange.toString();
}

async function sendRandomNumber(contractAddress, randomNumber) {
  // Connect to the Ethereum provider (use your RPC URL)
  //const provider = new ethers.providers.JsonRpcProvider("https://your_rpc_url");

  // Wallet setup (use your private key)
  //const wallet = new ethers.Wallet("YOUR_PRIVATE_KEY", provider);

  // Contract ABI and address
  const abi = ["function pickWinner(uint256 randomNumber) external"];
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  // Send the random number
  console.log(`Sending random number: ${randomNumber}`);
  const tx = await contract.pickWinner(randomNumber);
  console.log("Transaction hash:", tx.hash);

  // Wait for the transaction to be mined
  await tx.wait();
  console.log("Random number sent successfully!");
}

(async () => {
  const randomNumber = generateRandomNumber(1, 100);
  console.log("Generated random number:", randomNumber);

  const contractAddress = "0xYourContractAddressHere";
  await sendRandomNumber(contractAddress, randomNumber);
})();
