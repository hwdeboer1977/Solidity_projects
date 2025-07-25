// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Use ERC20Votes instead! 
// This extension will keep track of historical balances so that voting power is retrieved 
// from past snapshots rather than current balance, which is an important protection that prevents double voting.
// ERC20Votes includes functionality specifically designed for governance, such as tracking historical voting power and enabling delegated voting.



import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {Nonces} from "@openzeppelin/contracts/utils/Nonces.sol";

contract GovernanceToken is ERC20, ERC20Permit, ERC20Votes {
    constructor() ERC20("MyToken", "MTK") ERC20Permit("MyToken") {// Pre-mint tokens to the deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());}

    // The functions below are overrides required by Solidity.

    function _update(address from, address to, uint256 amount) internal override(ERC20, ERC20Votes) {
        super._update(from, to, amount);
    }

    function nonces(address owner) public view virtual override(ERC20Permit, Nonces) returns (uint256) {
        return super.nonces(owner);
    }
 
    
}