// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";


// Import ReentrancyGuard
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
 
contract StakingContract is ReentrancyGuard, Ownable (msg.sender) {
    //IERC20 public tokenX;  // The token being staked (TokenX)
    ERC20Burnable public tokenX; 

    // uint256 public currentRound;           // Tracks the current round
    // uint256 public startTimeCurrentRound;  // Start time of the current round
    // uint256 public roundDuration = 1 weeks; // Duration of each round (for testing)

    // List of all stakers
    address[] public stakers; 
    mapping(address => bool) public isStaker; // To check if an address is already a staker

    uint256 public entryFee = 1000;  // 10% entry fee (1000 means 10% since fee is in basis points)
    uint256 public exitFee = 1000;   // 10% exit fee (1000 means 10% since fee is in basis points)
    uint256 public constant FEE_DENOMINATOR = 10000; // Basis points denominator (10000 = 100%)
    uint256 public constant PRIZE_PERCENTAGE = 500; // 5%
    uint256 public lastPayoutTime;

    // Total fees (entry and deposit)
    uint256 public totalFees;

    // Rewards Pool (50% of totalFees is allocated here)
    uint256 public constant DRIP_ALLOCATION_PERCENTAGE = 2; // Divide by 2
    uint256 public dripRewardsPool;

    // Lottery pool, biggest depositor etc
    uint256 public lotteryPool;
    uint256 public biggestDepositorRewardPool;
    uint256 public highestDeposit;
    address public biggestDepositor;
    uint256 public burnedAmount;

    // Rewards Pool (50% of totalFees is allocated here)
    mapping(address => uint256) public claimableRewards;

    // Randomness with blocktimestamp etc unsafe
    // Chainlink VRF is paid service
    // Use NodeJS for randomness

    mapping(address => uint256) public stakedBalances;
    uint256 public totalStaked;

    // Events
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event LotteryWinner(address indexed winner, uint256 prizeAmount, uint256 totalFees);
    event BiggestDepositorReward(address indexed depositor, uint256 rewardAmount);
    event TokensBurned(uint256 burnedAmount);

    // Constructor
    // totalStakedccept ERC20Burnable so burn() is recognized
    constructor(ERC20Burnable _tokenX) {
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

        // Distribute the fees
        uint256 dripAmount = (fee * 5) / 10; // 5% to drip pool
        uint256 lotteryAmount = (fee * 3) / 10; // 3% to lottery pool
        uint256 depositorRewardAmount = (fee * 1) / 10; // 1% to biggest depositor reward
        burnedAmount = fee - (dripAmount + lotteryAmount + depositorRewardAmount); // 1% burned


        // Share of the fees that goes to drip rewards pool
        dripRewardsPool += dripAmount;
        lotteryPool += lotteryAmount;
        biggestDepositorRewardPool += depositorRewardAmount;
        // Burned amount is simply not added to any pool
        

        // Update state before external calls
        stakedBalances[msg.sender] += amountToStake;
        totalStaked += amountToStake;

        // Update mapping claimableRewards (for stakers only)
        if (totalStaked > 0) {
            claimableRewards[msg.sender] += (dripAmount * stakedBalances[msg.sender]) / totalStaked;
        }

        //_msgSenderCheck for biggest depositor (PM PM PM PM)
        if (amount> highestDeposit) {
            highestDeposit = amount;
            biggestDepositor = msg.sender;
        }

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

        // Distribute the fees
        uint256 dripAmount = (fee * 5) / 10; // 5% to drip pool
        uint256 lotteryAmount = (fee * 3) / 10; // 3% to lottery pool
        uint256 depositorRewardAmount = (fee * 1) / 10; // 1% to biggest depositor reward
        burnedAmount = fee - (dripAmount + lotteryAmount + depositorRewardAmount); // 1% burned


        // Share of the fees that goes to drip rewards pool
        dripRewardsPool += dripAmount;
        lotteryPool += lotteryAmount;
        biggestDepositorRewardPool += depositorRewardAmount;


        // Update the staked balance of the user
        stakedBalances[msg.sender] -= amount;
        totalStaked -= amount;


        // Update mapping claimableRewards (for stakers only)
        if (totalStaked > 0) {
            claimableRewards[msg.sender] += (dripAmount * stakedBalances[msg.sender]) / totalStaked;
        }
    

        // Handle exit fee (this example burns the fee, but you can send it to a treasury or reward pool)
        // tokenX.transfer(address(0), fee);  // Burn the exit fee (or use another mechanism)

        // Transfer the remaining amount back to the user
        tokenX.transfer(msg.sender, amountToWithdraw);

        emit Withdrawn(msg.sender, amountToWithdraw);
    }

    
    // Assign each staker a range of numbers based on their stake size relative to the total staked amount.
    // If a staker has 10% of the total stake, they get 10% of the number range (1–100 in this case).
    // function pickWinner(uint256 randomNumber) external onlyOwner {
    //     require(stakers.length > 0, "No stakers available for lottery");
    //     require(totalStaked > 0, "No tokens staked");
    //     require(totalFees > 0, "No fees in treasury");
    //     require(lotteryPool > 0, "Prize amount is too small");
    //     //require(block.timestamp >= lastPayoutTime + 1 weeks, "Prize can only be paid every week");

    //     // Ensure totalStaked is not zero before using modulo
    //     if (totalStaked == 0) {
    //         revert("Cannot pick a winner when no tokens are staked");
    //     }
 
    //     // Calculate the prize amount
    //     uint256 prizeAmount = lotteryPool;

    //     // Normalize the random number to a range of 0 to totalStaked
    //     // The randomNumber is normalized to a range between 0 and totalStaked - 1 using the modulo operation. 
    //     // This ensures that the random number falls within the total amount of tokens staked, 
    //     // aligning it with the cumulative stake values.
    //     uint256 normalizedRandom = randomNumber % totalStaked;

    //     // Initialize Variables
    //     // Weighted Probability: Each staker is assigned a range proportional to their stake. 
    //     // For example, if a staker has 30% of the total stake, they occupy 30% of the range from 0 to totalStaked - 1
    //     uint256 cumulativeStake = 0; // Keeps a running total of the stakes as we iterate through each staker.
    //     address winner; // Will store the address of the selected winner

    //     // Iterate through stakers to find the winner
    //     for (uint256 i = 0; i < stakers.length; i++) {
    //         // Update Cumulative Stake: For each staker, their staked amount is added to cumulativeStake.
    //         cumulativeStake += stakedBalances[stakers[i]];
    //         // If normalizedRandom is less than cumulativeStake, it means the random number 
    //         // falls within the range assigned to the current staker.
    //         if (normalizedRandom < cumulativeStake) {
    //             // The current staker is then selected as the winner, and the loop is exited using break.
    //             winner = stakers[i];
    //             break;
    //         }
    //     }

    //     // Ensure a winner was selected
    //     require(winner != address(0), "Winner selection failed");

    //     // Update last payout time (before external call)
    //     lastPayoutTime = block.timestamp;

    //     // Transfer first, THEN reset lotteryPool
    //     tokenX.transfer(winner, prizeAmount);

    //     // Reset lotteryPool after transfer (not before)
    //     //lotteryPool = 0;

    //     // Emit the LotteryWinner event
    //     emit LotteryWinner(winner, prizeAmount, totalFees);
    // }

    function distributeWeeklyRewards(uint256 randomNumber) external {
        //require(block.timestamp >= getNextSaturday6PM(), "Can only be run on Saturday at 6 PM UTC");
        require(stakers.length > 0, "No stakers available for lottery");
        require(totalStaked > 0, "No tokens staked");
        require(totalFees > 0, "No fees in treasury");
        require(lotteryPool > 0, "Lottery prize too small");
        require(biggestDepositorRewardPool > 0, "Biggest depositor prize too small");

        // Step 1: Lottery Winner Selection
        uint256 normalizedRandom = randomNumber % totalStaked;
        uint256 cumulativeStake = 0;
        address lotteryWinner;

        for (uint256 i = 0; i < stakers.length; i++) {
            cumulativeStake += stakedBalances[stakers[i]];
            if (normalizedRandom < cumulativeStake) {
                lotteryWinner = stakers[i];
                break;
            }
        }
        require(lotteryWinner != address(0), "Lottery winner selection failed");

        uint256 lotteryPrize = lotteryPool;
        tokenX.transfer(lotteryWinner, lotteryPrize);
    
        // Step 2: Reward the Biggest Depositor of the Week
        tokenX.transfer(biggestDepositor, biggestDepositorRewardPool);

        // Step 3: Burn a Portion of Fees
        
        tokenX.burn(burnedAmount); // Sending to zero address burns the tokens

        // Emit events for transparency
        emit LotteryWinner(lotteryWinner, lotteryPrize, totalFees);
        emit BiggestDepositorReward(biggestDepositor, biggestDepositorRewardPool);
        emit TokensBurned(burnedAmount);
}

    function claimDripRewards() external nonReentrant {
        uint256 reward = claimableRewards[msg.sender];
        require(reward > 0, "No rewards to claim");
        require(dripRewardsPool >= reward, "Not enough rewards in the pool");

        // Deduct from rewards pool
        dripRewardsPool -= reward;

        // Reset user's claimable amount
        claimableRewards[msg.sender] = 0;

        // Transfer the reward to the user
        tokenX.transfer(msg.sender, reward);

        emit LotteryWinner(msg.sender, reward, dripRewardsPool); // Reuse event for claiming rewards
    }

    // Function to fetch the claimable rewards balance.
    function getClaimableDripRewards(address user) external view returns (uint256) {
        return claimableRewards[user];
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
