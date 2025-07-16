module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments; // Access the deploy function
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  console.log("Deploying TimeLock with account:", deployer);

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
  const admin = deployer; // Set deployer as the admin for now
  // Deploy GovernanceToken contract
  const timeLock = await deploy("TimeLock", {
    from: deployer,
    args: [MIN_DELAY, proposers, executors, admin], // Constructor arguments
    log: true, // Logs deployment info to the console
  });

  console.log("TimeLock deployed to:", timeLock.address);
};

module.exports.tags = ["TimeLock"]; // Tag to identify this deployment script
