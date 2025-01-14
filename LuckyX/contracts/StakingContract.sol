// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Import ReentrancyGuard
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
 
contract StakingContract is ReentrancyGuard, Ownable (msg.sender) {
    IERC20 public tokenX;  // The token being staked (TokenX)
    
    // List of all stakers
    address[] public stakers; 
    mapping(address => bool) public isStaker; // To check if an address is already a staker

    uint256 public entryFee = 500;  // 5% entry fee (500 means 5% since fee is in basis points)
    uint256 public exitFee = 500;   // 5% exit fee (500 means 5% since fee is in basis points)
    uint256 public constant FEE_DENOMINATOR = 10000; // Basis points denominator (10000 = 100%)
    uint256 public constant PRIZE_PERCENTAGE = 500; // 5%
    uint256 public lastPayoutTime;

    uint256 public totalFees;

    // Randomness with blocktimestamp etc unsafe
    // Chainlink VRF is paid service
    // Use NodeJS for randomness

    mapping(address => uint256) public stakedBalances;
    uint256 public totalStaked;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event LotteryWinner(address indexed winner, uint256 prizeAmount, uint256 totalFees);

    // Constructor
    constructor(IERC20 _tokenX) {
        tokenX = _tokenX;
        lastPayoutTime = block.timestamp; // Initialize with the contract's deployment time
    }


    // Function to stake TokenX with entry fee
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");

        uint256 fee = (amount * entryFee) / FEE_DENOMINATOR;
        uint256 amountToStake = amount - fee;
        
        // Update total fees collected
        totalFees += fee;

        // Update state before external calls
        stakedBalances[msg.sender] += amountToStake;
        totalStaked += amountToStake;

        // Add the user to the stakers array if not already added
        if (!isStaker[msg.sender]) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }
    

        // Transfer TokenX from the user to the contract
        tokenX.transferFrom(msg.sender, address(this), amount);
        
        // Handle entry fee (this example burns the fee, but you can send it to a treasury or reward pool)
        //tokenX.transfer(address(0), fee);  // Burn the entry fee (or use another mechanism)

        emit Staked(msg.sender, amountToStake);
    }

    // Function to withdraw TokenX with exit fee
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(stakedBalances[msg.sender] >= amount, "Insufficient staked balance");

        uint256 fee = (amount * exitFee) / FEE_DENOMINATOR;
        uint256 amountToWithdraw = amount - fee;

        // Update total fees collected
        totalFees += fee;


        // Update the staked balance of the user
        stakedBalances[msg.sender] -= amount;
        totalStaked -= amount;

        // Handle exit fee (this example burns the fee, but you can send it to a treasury or reward pool)
        // tokenX.transfer(address(0), fee);  // Burn the exit fee (or use another mechanism)

        // Transfer the remaining amount back to the user
        tokenX.transfer(msg.sender, amountToWithdraw);

        emit Withdrawn(msg.sender, amountToWithdraw);
    }

    
    // Assign each staker a range of numbers based on their stake size relative to the total staked amount.
    // If a staker has 10% of the total stake, they get 10% of the number range (1–100 in this case).
    function pickWinner(uint256 randomNumber) external {
        require(stakers.length > 0, "No stakers available for lottery");
        require(totalStaked > 0, "No tokens staked");
        // require(block.timestamp >= lastPayoutTime + 24 hours, "Prize can only be paid every 24 hours");
        require(totalFees > 0, "No fees in treasury");

        if (block.timestamp < lastPayoutTime + 24 hours) {
            return; // Do nothing if 24 hours has not passed
        }

        
        uint256 prizeAmount = (totalFees * PRIZE_PERCENTAGE) / FEE_DENOMINATOR;
        require(prizeAmount > 0, "Prize amount is too small");


        // Calculate winner based on ranges
        uint256 cumulativeStake = 0;
        address winner;

        for (uint256 i = 0; i < stakers.length; i++) {
            cumulativeStake += stakedBalances[stakers[i]];
            uint256 stakerRange = (cumulativeStake * 100) / totalStaked;

            if (randomNumber <= stakerRange) {
                winner = stakers[i];
                break;
            }
        }

        // Transfer the prize to the winner
        totalFees -= prizeAmount;
        tokenX.transfer(winner, prizeAmount);

        // Update the last payout time
        lastPayoutTime = block.timestamp;
        emit LotteryWinner(winner, prizeAmount, totalFees);
    }


    // View function to get the current staked balance of the user
    function stakedBalance(address user) external view returns (uint256) {
        return stakedBalances[user];
    }

    // Function to update the entry fee (only by the contract owner)
    function setEntryFee(uint256 _entryFee) external onlyOwner {
        require(_entryFee <= FEE_DENOMINATOR, "Entry fee must be <= 100%");
        entryFee = _entryFee;
    }

    // Function to update the exit fee (only by the contract owner)
    function setExitFee(uint256 _exitFee) external onlyOwner {
        require(_exitFee <= FEE_DENOMINATOR, "Exit fee must be <= 100%");
        exitFee = _exitFee;
    }

    // Function to withdraw any tokens (including fees) from the contract (only by the owner)
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        tokenX.transfer(msg.sender, amount);
    }
}
