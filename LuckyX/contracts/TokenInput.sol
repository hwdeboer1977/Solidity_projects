// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import OpenZeppelin ERC20 standard
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Maybe implement a minting schedule with halvings later?

contract TokenInput is ERC20, ERC20Burnable, Ownable(msg.sender) {
    constructor() ERC20("Input", "Input") {
        // Mint initial supply of 1,000,000 tokens (1,000,000 * 10^18)
        uint256 initialSupply = 1_000_000 * 10 ** decimals();
        _mint(msg.sender, initialSupply); // Mint to deployer's address
    }

    // Additional functionality (optional): owner can mint tokens
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
