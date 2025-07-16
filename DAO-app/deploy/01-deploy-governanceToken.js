// To integrate your 01-deploy-token.js script with hardhat-deploy, you’ll need to refactor
// // it into a format that works with the deployment plugin's structure.
// The hardhat-deploy plugin uses a deploy function provided in its deployment context,
// which simplifies deployment and stores deployment information.

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments; // Access the deploy function
  const { deployer } = await getNamedAccounts(); // Fetch named accounts

  console.log("Deploying GovernanceToken with account:", deployer);

  // Deploy GovernanceToken contract
  const governanceToken = await deploy("GovernanceToken", {
    from: deployer,
    log: true, // Logs deployment info to the console
  });

  console.log("GovernanceToken deployed to:", governanceToken.address);
};

module.exports.tags = ["GovernanceToken"]; // Tag to identify this deployment script
