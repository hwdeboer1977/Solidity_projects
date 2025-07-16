# Assignment module-17: DAO project

The goal is to set up a DAO governance project, where we:

- make a proposal
- vote during a voting period
- queue and execute the proposal (if the voting has passed)

I follow OpenZeppelin's governances contracts:

- Documentation can be found here: https://docs.openzeppelin.com/contracts/5.x/governance
- Smart contracts can be found here: https://github.com/OpenZeppelin/openzeppelin-contracts/tree/master/contracts/governance

And the tutorial by Patrick Collins:

- https://www.youtube.com/watch?v=AhJtmUqhAqg

### I have tested and deployed the smart contracts with Foundry.

The smart contracts can be found here:

- "...\contracts\Box.sol"
- "...\GovernanceContract.sol"
- "...\GovernanceToken.sol"
- "...\TimeLock.sol"

The scripts to deploy and run the DAO can be found here:

- "...\deploy\01-deploy-governanceToken.js"
- "...\deploy\02-deploy-timeLock.js"
- "...\deploy\03-deploy-governor.js"
- "...\deploy\04-deply-box.js"
- "...\scripts\05-setup-governance-contracts.js"
- "...\scripts\06-propose.js"
- "...\scripts\07-queue_execute.js"
- "...\scripts\08-voting.js"

Finally, I have used Tally for my frontend: https://www.tally.xyz/

### Hardhat commands to run DAO:

```shell
npx hardhat help
npx hardhat node
npx hardhat deploy --network localhost
npx hardhat run scripts/05-setup-governance-contracts.js
npx hardhat run scripts/06-propose.js
npx hardhat run scripts/07-queue_execute.js
npx hardhat run scripts/08-voting.js
```
