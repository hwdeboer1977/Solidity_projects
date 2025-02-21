import React, { useCallback, useState, useEffect, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDroplet,
  faTrophy,
  faRecycle,
} from "@fortawesome/free-solid-svg-icons";
import Treasury from "./treasury.png"; // Adjust the path to your image
import "./StakingPage.css"; // Loaded first
import "./WalletConnect.css"; // Loaded second, overrides wrappage.css if selectors are equally specific
import { ethers } from "ethers";
import { WalletContext } from "../WalletContext"; // Import Wallet Context

const StakingPage = () => {
  const iconTextStyle = {
    color: "#333333", // Replace with your desired color
    textAlign: "center",
  };

  // Retrieve this information from WalletContect (avaiable in all subpages)
  const {
    walletAddress,
    chainId,
    provider,
    //nativeBalance,
    //auctionContract,
    luckyTokenXContract,
    //inputTokenContract,
    //auctionAddress,
    stakingAddress,
    stakingContract,
    faucetAddress,
    faucetContract,
  } = useContext(WalletContext);

  // Initialize variables
  const [amount, setAmount] = useState(""); // Input amount for staking
  const [stakedBalance, setStakedBalance] = useState("0");
  const [totalStaked, setTotalStaked] = useState("0");
  const [userBalance, setUserBalance] = useState("0");
  const [userStake, setUserStake] = useState("0");
  const [userShare, setUserShare] = useState("0%");
  const [lotteryPrizePool, setLotteryPrizePool] = useState("0");
  const [rewardsToClaim, setRewardsToClaim] = useState("0");
  const [biggestDepositorPrize, setBiggestDepositorPrize] = useState("0");
  const [currentBiggestDepositor, setCurrentBiggestDepositor] = useState("");
  const [faucetBalance, setFaucetBalance] = useState("0");

  // Function to get staking statistics
  const fetchStakingStats = useCallback(async () => {
    if (!stakingContract || !provider) return;

    try {
      console.log("⏳ Fetching staking stats...");

      const signer = provider.getSigner();
      const userAddress = await signer.getAddress();

      // Fetch contract data
      const userBalanceWei = await luckyTokenXContract.balanceOf(userAddress);

      // No balanceOf function

      const faucetBalanceWei = await luckyTokenXContract.balanceOf(
        faucetAddress
      );
      const totalStakedWei = await stakingContract.totalStaked();
      const userStakeWei = await stakingContract.stakedBalance(userAddress);
      const lotteryPrizePoolWei = await stakingContract.lotteryPool();
      const rewardsToClaimWei = await stakingContract.claimableRewards(
        userAddress
      );
      const biggestDepositorPrizeWei =
        await stakingContract.biggestDepositorRewardPool();
      const currentBiggestDepositorAddress =
        await stakingContract.biggestDepositor();

      // Convert BigNumber to human-readable values
      const decimals = await luckyTokenXContract.decimals(); // Get the token's decimals
      // Convert balance from wei to token units (considering decimals)
      const userBalanceFormatted = ethers.utils.formatUnits(
        userBalanceWei,
        decimals
      );

      // Round the balance to the nearest integer
      const userBalance = parseFloat(userBalanceFormatted).toFixed(0);
      const totalStakedEth = ethers.utils.formatEther(totalStakedWei);
      const faucetBalanceETH = ethers.utils.formatEther(faucetBalanceWei);
      const userStakeEth = ethers.utils.formatEther(userStakeWei);
      const lotteryPrizePoolEth = ethers.utils.formatEther(lotteryPrizePoolWei);
      const rewardsToClaimEth = ethers.utils.formatEther(rewardsToClaimWei);
      const biggestDepositorPrizeEth = ethers.utils.formatEther(
        biggestDepositorPrizeWei
      );

      // Calculate user's share
      const share = totalStakedWei.gt(0)
        ? userStakeWei.mul(100).div(totalStakedWei).toString() + "%"
        : "0%";

      // Update state
      setUserBalance(userBalance);
      setTotalStaked(totalStakedEth);
      setFaucetBalance(faucetBalanceETH);
      setUserStake(userStakeEth);
      setUserShare(share);
      setLotteryPrizePool(lotteryPrizePoolEth);
      setRewardsToClaim(rewardsToClaimEth);
      setBiggestDepositorPrize(biggestDepositorPrizeEth);
      setCurrentBiggestDepositor(currentBiggestDepositorAddress);

      console.log("✅ Staking stats updated!");
    } catch (error) {
      console.error("❌ Error fetching staking stats:", error);
    }
  }, [stakingContract, luckyTokenXContract, faucetAddress, provider]); // ✅ Add dependencies here!

  // Use useEffect() to call fetchStakingStats() when the component loads:
  useEffect(() => {
    if (stakingContract && provider) {
      fetchStakingStats();
    }
  }, [stakingContract, provider, fetchStakingStats]);

  // **(1) Approve Token Spending**
  const approveStaking = async () => {
    if (!luckyTokenXContract) return alert("❌ Token contract not loaded");

    try {
      console.log("⏳ Approving token spending...");

      console.log("Amount to approve: ", amount);

      const amountApprove = ethers.utils.parseEther(amount); // Convert input to wei

      // Attach signer to the inputTokenContract
      const signer = await provider.getSigner(); // Get the signer from the provider

      // Connect
      const luckyTokenWithSigner = luckyTokenXContract.connect(signer);

      console.log("Amount to approve:", amountApprove.toString());
      console.log("Signer:", signer);
      console.log("Staking Contract Address:", stakingContract);
      console.log("Amount approved: ", amountApprove.toString());

      // Approve the auction contract to spend user's tokens
      const approvalTx = await luckyTokenWithSigner.approve(
        stakingAddress,
        amountApprove,
        { gasLimit: 300000 }
      );
      await approvalTx.wait(); // Wait for the transaction to be mined
      console.log("Approval successful:", approvalTx);
    } catch (error) {
      console.error("❌ Approval error:", error);
      alert("❌ Approval failed.");
    }
  };

  // **(2) Stake Tokens**
  const stakeTokens = async () => {
    if (!stakingContract || !luckyTokenXContract) {
      return alert("❌ Staking contract or token contract not loaded");
    }

    try {
      const amountStake = ethers.utils.parseEther(amount); // Convert input to wei
      console.log("Amount to stake:", amountStake.toString());

      const signer = await provider.getSigner(); // Get the signer from the provider

      const stakingWithSigner = stakingContract.connect(signer);
      console.log(signer);
      console.log(stakingWithSigner);
      const depositTx = await stakingWithSigner.stake(amountStake, {
        gasLimit: 300000,
      });
      await depositTx.wait(); // Wait for the transaction to be mined
      console.log("Deposit successful:", depositTx);
      alert("Deposit successful!");
    } catch (error) {
      console.error("❌ Staking error:", error);
      alert("❌ Staking failed. Check console for details.");
    }
  };

  // **(3) Withdraw Stake**
  const withdrawStake = async () => {
    if (!stakingContract) return alert("Staking contract not loaded");
    try {
      const tx = await stakingContract.withdraw(
        ethers.utils.parseUnits(amount, 18)
      );
      await tx.wait();
      alert("✅ Withdrawal successful!");
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert("❌ Withdrawal failed");
    }
  };

  // **(4) Claim Rewards**
  const claimRewards = async () => {
    if (!stakingContract) return alert("Staking contract not loaded");
    try {
      const tx = await stakingContract.claimDripRewards();
      await tx.wait();
      alert("✅ Rewards claimed successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      alert("❌ Claiming rewards failed");
    }
  };

  // **(5) Claim From Faucet**
  const claimFaucet = async () => {
    if (!faucetContract) return alert("Faucet contract not loaded");
    try {
      const tx = await faucetContract.claim();
      await tx.wait();
      alert("✅ Token claim from faucet successfully!");
    } catch (error) {
      console.error("Claim error:", error);
      alert("❌ Token claim from faucet failed");
    }
  };

  // **(1) Fetch Staked Balance When Component Mounts**
  useEffect(() => {
    if (stakingContract && walletAddress) {
      const fetchStakedBalance = async () => {
        try {
          const balance = await stakingContract.stakedBalance(walletAddress);
          setStakedBalance(ethers.utils.formatUnits(balance, 18));
          console.log("Staked balance: ", stakedBalance);
        } catch (error) {
          console.error("Error fetching staked balance:", error);
        }
      };

      fetchStakedBalance();
    }
  }, [stakingContract, walletAddress, stakedBalance]);

  // Listen to events stake, withdraw and claim
  useEffect(() => {
    if (!stakingContract) return;

    console.log("🔄 Listening for staking events...");

    // Event: Stake
    const handleStakeEvent = (user, amount) => {
      console.log(
        `📢 Stake Event: ${user} staked ${ethers.utils.formatEther(amount)} ETH`
      );
      fetchStakingStats(); // Update UI
    };

    // Event: Withdraw
    const handleWithdrawEvent = (user, amount) => {
      console.log(
        `📢 Withdraw Event: ${user} withdrew ${ethers.utils.formatEther(
          amount
        )} ETH`
      );
      fetchStakingStats();
    };

    // Listening event: WeeklyRewardsDistributed
    const handleClaims = (user, amount) => {
      console.log(
        `📢 Claim Event: ${user} claimed ${ethers.utils.formatEther(
          amount
        )} ETH`
      );
      fetchStakingStats();
    };

    // Listening event: WeeklyRewardsDistributed
    const handleWeeklyRewards = () => {
      console.log("Paying the prices");
      fetchStakingStats();
    };

    // Listening event: new deposit Faucet
    const handleFaucetDeposit = (user, amount) => {
      fetchStakingStats();
    };

    // Listening event: new claim Faucet
    const handleFaucetClaim = (user, amount) => {
      fetchStakingStats();
    };

    // Event WeeklyRewardsDistributed
    stakingContract.on("WeeklyRewardsDistributed", handleWeeklyRewards);

    // Subscribe to events
    stakingContract.on("Staked", handleStakeEvent);
    stakingContract.on("Withdrawn", handleWithdrawEvent);
    stakingContract.on("RewardClaimed", handleClaims);
    faucetContract.on("TokensDeposited", handleFaucetDeposit);
    faucetContract.on("TokensClaimed", handleFaucetClaim);

    return () => {
      // Cleanup: Remove listeners when component unmounts
      stakingContract.off("Staked", handleStakeEvent);
      stakingContract.off("Withdrawn", handleWithdrawEvent);
      stakingContract.off("RewardClaimed", handleClaims);
      stakingContract.off("WeeklyRewardsDistributed", handleWeeklyRewards);
      faucetContract.off("TokensDeposited", handleFaucetDeposit);
      faucetContract.off("TokensClaimed", handleFaucetClaim);
      //stakingContract.off("RewardClaimed", handleClaimEvent);
    };
  }, [stakingContract, faucetContract, fetchStakingStats]); // Depend on stakingContract

  useEffect(() => {
    if (!stakingContract || !walletAddress) return;

    console.log("🔄 Updating Staking Stats on Wallet/Chain Change...");
    fetchStakingStats(); // Refresh stats whenever wallet or chain changes
  }, [stakingContract, walletAddress, chainId, fetchStakingStats]); // Trigger when these values change

  return (
    <div className="container-all">
      {/* Left Side: Staking Stats */}
      <div className="staking-container">
        <div className="staking-stats">
          {/* Left Side: Staking Stats: top */}
          <h2>📊 Statistics</h2>
          <p>
            <strong>User balance:</strong> {userBalance} LuckyX
          </p>

          <p>
            <strong>Total Staked:</strong> {totalStaked} LuckyX
          </p>
          <p>
            <strong>Your Stake:</strong> {userStake} LuckyX
          </p>
          <p>
            <strong>Your Share:</strong> {userShare}
          </p>
          <p>
            <strong>Lottery Prize Pool:</strong> {lotteryPrizePool} LuckyX
          </p>
          <p>
            <strong>Rewards to Claim:</strong> {rewardsToClaim} LuckyX
          </p>
          <p>
            <strong>Biggest Depositor Prize:</strong> {biggestDepositorPrize}{" "}
            LuckyX
          </p>
          <p>
            <strong>Current Biggest Depositor:</strong>{" "}
            {currentBiggestDepositor.slice(0, 6)}...
            {currentBiggestDepositor.slice(-4)}
          </p>
        </div>

        {/* Left Side: Staking Stats: Bottom */}
        <div className="staking-dashboard">
          <h3>Staking Dashboard</h3>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={approveStaking}>✅ Approve Staking</button>
          <button onClick={stakeTokens}>🔹 Stake</button>
          <button onClick={withdrawStake}>❌ Withdraw Stake</button>
          <button onClick={claimRewards}>💰 Claim Rewards</button>
        </div>
      </div>

      {/* Middle Side: Image and Text */}
      <div className="image-container">
        <div style={imageContainerStyle}>
          <img
            src={Treasury}
            alt="Treasury Chest"
            style={{
              maxWidth: "60%",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          />
          <h1 style={winnerTextStyle}>And the winner is?</h1>
          <h1>Get some test tokens here:</h1>
          <button onClick={claimFaucet}> Get test tokens</button>
          <h1>Balance of Faucet: {faucetBalance}</h1>
        </div>
      </div>

      {/* Right Side: Cards */}
      <div className="card-container">
        <div style={cardsContainerStyle}>
          {/* Drip Pool Rewards */}
          <div style={cardStyle}>
            <div style={iconTextStyle}>
              <FontAwesomeIcon icon={faDroplet} size="2x" color="#007BFF" />
              <div>
                <h2>Staking Rewards</h2>
                <p>
                  Stake your tokens and watch the rewards roll in!{" "}
                  <strong>50% of the entry and exit fees</strong> are instantly
                  distributed to stakers, providing further rewards for
                  participating in the staking program
                </p>
              </div>
            </div>
          </div>

          {/* Lottery Jackpot and Biggest Depositor Prize */}
          <div style={cardStyle}>
            <div style={iconTextStyle}>
              <FontAwesomeIcon icon={faTrophy} size="2x" color="#FFD700" />
              <div>
                <h2>Lottery Jackpot & Biggest Depositor</h2>
                <p>
                  {/*<h2>Feeling lucky?</h2>*/}
                  <p>
                    <strong>30% of the treasury</strong> contributes to an
                    exciting lottery prize pool! By staking, you're
                    automatically entered for a chance to win big. Additionally,{" "}
                    <strong>10% of the treasury</strong> is awarded weekly to
                    the biggest depositor as a prize!
                  </p>
                </p>
              </div>
            </div>
          </div>

          {/* Fair Contribution */}
          <div style={cardStyle}>
            <div style={iconTextStyle}>
              <FontAwesomeIcon icon={faRecycle} size="2x" color="#28A745" />
              <div>
                <h2>Fair Contribution</h2>
                <p>
                  To keep the ecosystem thriving, a{" "}
                  <strong>10% entry fee</strong> and{" "}
                  <strong>10% exit fee</strong> apply to all staking
                  transactions. These fees directly contribute to the treasury,
                  benefitting all participants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Connect Section */}
      <div className="wallet-connect-container"></div>
    </div>
  );
};

const cardsContainerStyle = {
  display: "flex",
  flexWrap: "wrap", // Allow wrapping on smaller screens
  gap: "20px",
  justifyContent: "space-between", // Distribute space between the cards
  flex: "1", // Allow cards to take up flexible space
  marginTop: "20px", // Space between stats and cards
  width: "100%", // Ensure content takes up the full width
};

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
};

const imageContainerStyle = {
  flex: "1", // Allow image container to grow and take up space
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "20px", // Space between image and cards
};

const winnerTextStyle = {
  marginTop: "20px",
  fontSize: "1.8rem",
  color: "#333",
  textAlign: "center",
};

export default StakingPage;
