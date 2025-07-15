# 🎯 LuckyX: Auction & Staking DApp

**LuckyX** is a decentralized Ethereum-based DApp that gamifies token distribution through a **100-round auction system** and a **staking-based lottery**. Participants deposit **DripX tokens** during each round and receive **LuckyX tokens** in return. These tokens can then be staked to earn additional rewards via a fair lottery mechanism.

> ⚠️ This project is in testing and subject to change. Feedback is welcome.

---

## 💡 Key Features

- 🏆 **Auction Rounds (100)**  
  Users deposit DripX tokens during timed rounds and receive LuckyX tokens proportional to their contribution.

- 🎰 **Staking Lottery**  
  Stake LuckyX tokens to enter randomized fairness-based reward distributions.

- 💧 **Token Faucet**  
  A built-in faucet to help new users claim initial LuckyX tokens (for testing).

- 🔁 **Auto Reset**  
  Backend scripts help reset round durations or the entire auction cycle for seamless test iteration.

---

## 🗂 Project Structure

```bash
LuckyX/
├── contracts/              # Solidity smart contracts
│   ├── Auction.sol
│   ├── StakingContract.sol
│   ├── TokenInput.sol
│   ├── TokenLuckyX.sol
│   └── FaucetLuckyX.sol
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── ABI/
│       ├── pages/
│       ├── App.js, App.css, index.js
│       ├── WalletContext.js
│       ├── resetAuction.js, resetDuration.js
│       └── server.js, serverRandomGen.js
│
├── backend/
│   └── server.js           # Express backend server
│
└── README.md
```

### 🔐 Smart Contracts

- Auction.sol: Manages timed deposit rounds and LuckyX token allocation.
- StakingContract.sol: Allows staking and lottery-based reward distribution.
- TokenInput.sol: ERC20-compatible DripX token (used for deposit).
- TokenLuckyX.sol: ERC20 LuckyX reward token.
- FaucetLuckyX.sol: Simple faucet for testing and onboarding.

### 💻 Frontend

Built with React, the frontend enables:

- Wallet connection
- Live round countdowns
- Token balances + deposit input
- Claiming LuckyX rewards
- Staking UI and lottery reward status

To run locally:

- cd frontend
- npm install
- npm start

### 🔌 Backend

Minimal backend using Node.js/Express, providing:

- WebSocket-based live updates
- Off-chain auction timing logic
- Round resets: resetAuction.js and resetDuration.js
- Random generator support for lottery: serverRandomGen.js

Run the backend:

- cd backend
- node server.js

### 🛠 Tech Stack

- Solidity (smart contracts)
- React (frontend UI)
- Node.js / Express (backend)
- Hardhat (contract development & deployment)
- Ethers.js (web3 interactions)

### 👨‍💻 Author

Henk Wim de Boer
Smart Contract Developer & DeFi Strategist
GitHub: @hwdeboer1977
