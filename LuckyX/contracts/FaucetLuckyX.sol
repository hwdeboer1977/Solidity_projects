// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address recipient, uint256 amount) external returns (bool);
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract FaucetLuckyX {
    // State variables
    IERC20 public token;
    uint256 public claimAmount;
    uint256 public cooldownTime;
    address public owner;
    mapping(address => uint256) public lastClaimed;

    // Events
    event TokensClaimed(address indexed user, uint256 amount);
    event ClaimAmountUpdated(uint256 newClaimAmount);
    event CooldownTimeUpdated(uint256 newCooldownTime);
    event TokensDeposited(address indexed from, uint256 amount);

    // Modifier to restrict access to only the owner
    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // Constructor
    constructor(address _token, uint256 _claimAmount, uint256 _cooldownTime) {
        token = IERC20(_token);
        claimAmount = _claimAmount;
        cooldownTime = _cooldownTime;
        owner = msg.sender;  // Set the contract deployer as the owner
    }

    // Claim function: Allows users to claim tokens
    function claim() external {
        require(block.timestamp >= lastClaimed[msg.sender] + cooldownTime, "You must wait before claiming again.");

        lastClaimed[msg.sender] = block.timestamp;

        bool success = token.transfer(msg.sender, claimAmount);
        require(success, "Transfer failed");

        emit TokensClaimed(msg.sender, claimAmount);
    }

    // Admin function to fund the faucet
    function fundFaucet(uint256 amount) external onlyOwner {
        require(token.transferFrom(msg.sender, address(this), amount), "Funding faucet failed");
        emit TokensDeposited(msg.sender, amount);
    }

    // Admin function to update the claim amount
    function updateClaimAmount(uint256 newClaimAmount) external onlyOwner {
        claimAmount = newClaimAmount;
        emit ClaimAmountUpdated(newClaimAmount);
    }

    // Admin function to update the cooldown time
    function updateCooldownTime(uint256 newCooldownTime) external onlyOwner {
        cooldownTime = newCooldownTime;
        emit CooldownTimeUpdated(newCooldownTime);
    }
}
