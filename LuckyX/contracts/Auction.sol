// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// This is an auction contract
// This is still a test version
// TO DO: replace block.timestamp because of potential miner manipulation of the block.timestamp 

contract Auction is Ownable, ReentrancyGuard {
    using SafeERC20 for ERC20Burnable;

    uint256 public currentRound;           // Tracks the current round
    uint256 public startTimeCurrentRound;  // Start time of the current round
    //uint256 public roundDuration = 24 hours; // Duration of each round
    uint256 public roundDuration = 5 minutes; // Duration of each round (for testing)

    uint256 public tokensForAuction = 10000 * 10**18 ; 
    uint256 public constant maxRounds = 5;

    address[] public userAddresses;
    mapping(address => bool) private isUserTracked;

    ERC20Burnable public immutable tokenInput; // Token used to pay
    ERC20Burnable public immutable luckyX;     // Token rewarded

    // Mappings
    mapping(address => uint256) public userDepositCount;
    mapping(address => mapping(uint256 => uint256)) public userDeposits; // User deposits per round
    mapping(uint256 => uint256) public totalDepositsPerRound; // Total deposits per round

    // Events
    event Deposit(address indexed user, uint256 amount, uint256 round, uint256 totalDepositsPerRound, uint256 userDeposits);
    event Claimed(address indexed user, uint256 amount, uint256 round);
    event RoundUpdated(uint256 newRound, uint256 timestamp);
    event TimeRemainingUpdated(uint256 timeRemaining);
    event RoundDurationUpdated(uint256 newDuration);
    event TokensForAuctionUpdated(uint256 newTokenAmount);
        

    constructor(address _tokenInput, address _luckyX) Ownable(msg.sender) {
        tokenInput = ERC20Burnable(_tokenInput);
        luckyX = ERC20Burnable(_luckyX);
        startTimeCurrentRound = block.timestamp;
        currentRound = 0; // Initialize with Round 0
    }

    // Get the current round without modifying state
    function getCurrentAuctionRound() public view returns (uint256) {
        if (block.timestamp >= startTimeCurrentRound + roundDuration) {
            return currentRound + 1; // Next round
        }
        return currentRound; // Current round
    }

    // Update the current round and reset the timer
    function updateCurrentRound() public {
        require(block.timestamp >= startTimeCurrentRound + roundDuration, "Current round is still active");
        require(currentRound < maxRounds, "Maximum number of rounds reached");

        // Increment the round and reset the timer
        currentRound++;
        startTimeCurrentRound = block.timestamp;

        emit RoundUpdated(currentRound, block.timestamp);
    }


    function deposit(uint192 _amount) external {
        // Ensure the auction is active
        require(currentRound < maxRounds, "Auction rounds are over");

        // Update to the latest round
        if (block.timestamp >= startTimeCurrentRound + roundDuration) {
            updateCurrentRound();
        }

        // User deposit logic
        require(_amount > 0, "Deposit amount must be greater than zero");
        require(tokenInput.balanceOf(msg.sender) >= _amount, "Insufficient token balance");
        require(tokenInput.allowance(msg.sender, address(this)) >= _amount, "Token allowance too low");
        require(userDepositCount[msg.sender] < 10, "Maximum deposits per round reached");

        // Track user address
        if (!isUserTracked[msg.sender]) {
            userAddresses.push(msg.sender);
            isUserTracked[msg.sender] = true;
        }

        // Update user deposits
        userDeposits[msg.sender][currentRound] += _amount;
        userDepositCount[msg.sender]++;
        totalDepositsPerRound[currentRound] += _amount;

        emit Deposit(msg.sender, _amount, currentRound, totalDepositsPerRound[currentRound], userDeposits[msg.sender][currentRound] );

        // Transfer tokens to the contract
        tokenInput.safeTransferFrom(msg.sender, address(this), _amount);
    }

    function amountToClaim(address _user, uint32 _round) public nonReentrant returns (uint256 toClaim) {
        require(_round < currentRound, "Cannot claim for ongoing or future rounds");

        uint256 userDeposit = userDeposits[_user][_round];
        require(userDeposit > 0, "No deposits for this round");

        uint256 roundTotalDeposits = totalDepositsPerRound[_round];
        require(roundTotalDeposits > 0, "No deposits made in this round");

        toClaim = (userDeposit * tokensForAuction) / roundTotalDeposits; // Adjust reward calculation logic as needed

        // Prevent double claiming
        userDeposits[_user][_round] = 0;

        luckyX.safeTransfer(_user, toClaim);
        emit Claimed(_user, toClaim, _round);

        return toClaim;
    }

    function getTimeRemaining() public view returns (uint256) {
        if (block.timestamp >= startTimeCurrentRound + roundDuration) {
            return 0; // Current round has ended
        }
        return (startTimeCurrentRound + roundDuration) - block.timestamp;
    }

    function updateTimeRemaining() public {
        uint256 remainingTime = getTimeRemaining(); // Fetch remaining time
        emit TimeRemainingUpdated(remainingTime); // Emit the event
    }

    function setRoundDuration(uint256 _duration) public onlyOwner {
        require(_duration > 0, "Duration must be greater than 0");
        roundDuration = _duration;

        emit RoundDurationUpdated(_duration);
    }

    function setTokensForAuction(uint256 _tokens) public onlyOwner {
        require(_tokens > 0, "Tokens must be greater than 0");
        tokensForAuction = _tokens;
         emit TokensForAuctionUpdated(_tokens);
    }

    function resetAuction() external onlyOwner {
        // Reset rounds
        currentRound = 0;
        startTimeCurrentRound = block.timestamp;

        // Clear mapping data for past rounds
        for (uint256 round = 0; round < maxRounds; round++) {
            totalDepositsPerRound[round] = 0; // Clear total deposits
        }

        // Clear user-specific data
        uint256 userAddressesLength = userAddresses.length; // Cache array length
        for (uint256 i = 0; i < userAddressesLength; i++) {
            address user = userAddresses[i];
            userDepositCount[user] = 0; // Reset deposit count for each user

            for (uint256 round = 0; round < maxRounds; round++) {
                userDeposits[user][round] = 0; // Reset user deposits per round
            }

            isUserTracked[user] = false; // Untrack user
        }

        // Clear the userAddresses array
        delete userAddresses;

        emit RoundUpdated(0, block.timestamp); // Emit event to indicate reset
    }

        // Owner-only withdraw function
    function withdrawTokens(address _token, uint256 _amount) external onlyOwner {
        require(_amount > 0, "Withdraw amount must be greater than 0");
        ERC20Burnable token = ERC20Burnable(_token);
        uint256 contractBalance = token.balanceOf(address(this));
        require(contractBalance >= _amount, "Insufficient contract balance");

        token.safeTransfer(owner(), _amount);
    }

}
