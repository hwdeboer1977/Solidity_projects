import "../App.css";
import "./AuctionPage.css";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import styles from "./ThreeColumns.module.css"; // Import CSS module
import { WalletContext } from "../WalletContext";

const SUPPORTED_CHAINS = [11155111]; // Add supported chain IDs (e.g., Sepolia)

function AuctionPage() {
  /* Initialize state variables */

  const [currentRound, setCurrentRound] = useState(null);
  const [luckyXBalance, setLuckyXBalance] = useState(null);
  const [inputTokenBalance, setInputTokenBalance] = useState(null);
  const [expectedLuckyX, setExpectedLuckyX] = useState(null);
  const [depositAmountUserRound, setDepositAmountUserRound] = useState("");
  const [depositAmountTotalRound, setDepositAmountTotalRound] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [claimableRounds, setClaimableRounds] = useState([]);
  const [currentRoundEndTime, setCurrentRoundEndTime] = useState(null);
  const [formattedTime, setFormattedTime] = useState("00:00:00");

  const duration = 24 * 60 * 60;

  // Retrieve this information from WalletContect (avaiable in all subpages)
  const {
    walletAddress,
    chainId,
    provider,
    nativeBalance,
    auctionContract,
    luckyTokenXContract,
    inputTokenContract,
    auctionAddress,
  } = useContext(WalletContext);

  // useEffect(() => {
  //   console.log("Wallet Address:", walletAddress);
  //   console.log("Chain ID:", chainId);
  //   console.log("Provider:", provider);
  // }, [walletAddress, chainId, provider]);

  // console.log(luckyTokenXContract, inputTokenContract);
  // Function to fetch balances and round data
  // We will get warning about missing dependencies in useEffect
  // Best practice is to memoize the functions by useCallback!!
  const fetchBalances = useCallback(
    async (address) => {
      if (
        !inputTokenContract ||
        !luckyTokenXContract ||
        !auctionContract ||
        !address
      ) {
        console.error(
          "Contracts are not initialized or wallet address is missing"
        );
        return;
      }

      try {
        // Fetch Input Token Balance
        const inputTokenBalance = await inputTokenContract.balanceOf(address);
        const formattedInputTokenBalance = parseFloat(
          ethers.utils.formatEther(inputTokenBalance)
        ).toFixed(0);

        // Fetch LuckyX Balance
        const luckyXBalance = await luckyTokenXContract.balanceOf(address);
        const formattedLuckyXBalance = parseFloat(
          ethers.utils.formatEther(luckyXBalance)
        ).toFixed(0);

        // Fetch current round
        const currentRound = await auctionContract.currentRound();

        // Fetch total deposits for the current round
        const totalDeposits = await auctionContract.totalDepositsPerRound(
          currentRound
        );
        const formattedTotalDeposits = ethers.utils.formatEther(totalDeposits);

        // Fetch user's deposits for the current round
        const userDeposits = await auctionContract.userDeposits(
          address,
          currentRound
        );
        const formattedUserDeposits = ethers.utils.formatEther(userDeposits);

        // Calculate expected LuckyX tokens
        const expectedLuckyX =
          formattedTotalDeposits > 0
            ? (formattedUserDeposits * 1000) / formattedTotalDeposits
            : 0;

        // Update state
        setLuckyXBalance(formattedLuckyXBalance);
        setInputTokenBalance(formattedInputTokenBalance);
        setCurrentRound(currentRound.toString());
        setDepositAmountTotalRound(formattedTotalDeposits);
        setDepositAmountUserRound(formattedUserDeposits);
        setExpectedLuckyX(expectedLuckyX.toFixed(1));
      } catch (error) {
        console.error("Error fetching balances:", error);
      }
    },
    [
      inputTokenContract,
      luckyTokenXContract,
      auctionContract,
      setLuckyXBalance,
      setInputTokenBalance,
      setCurrentRound,
      setDepositAmountTotalRound,
      setDepositAmountUserRound,
      setExpectedLuckyX,
    ]
  );

  // Trigger fetchBalances when dependencies are ready
  useEffect(() => {
    if (walletAddress) {
      fetchBalances(walletAddress);
    }
  }, [
    walletAddress,
    inputTokenContract,
    luckyTokenXContract,
    auctionContract,
    auctionAddress,
    fetchBalances,
  ]);

  useEffect(() => {
    if (chainId && !SUPPORTED_CHAINS.includes(chainId)) {
      // Unsupported chain: reset UI and alert user
      alert("Chain not supported. Please switch to a supported network.");
      setLuckyXBalance(null);
      setInputTokenBalance(null);
      setDepositAmountUserRound(null);
      setDepositAmountTotalRound(null);
      setExpectedLuckyX(null);
    }
  }, [chainId]); // Run this effect whenever the chainId changes

  // Function to fetch round info: round number and remaining time
  const getRoundInfo = useCallback(async () => {
    try {
      // Get start time of the round
      const startTimeRoundHex = await auctionContract.startTimeCurrentRound();
      const startTimeRound = startTimeRoundHex.toNumber();

      // Log start time for debugging
      console.log("startTimeRound (as number):", startTimeRound);

      // Calculate the end time
      const endTimeRound = startTimeRound + duration;
      console.log("endTimeRound (as number):", endTimeRound);

      // Update the end time in state
      setCurrentRoundEndTime(endTimeRound);
    } catch (error) {
      console.error("Error during getting time:", error);
    }
  }, [auctionContract, duration]); // Dependencies: Recompute only if these change

  // Function to format time in HH:mm:ss
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Pad single-digit values with a leading zero
    const pad = (num) => String(num).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Fetch round info on mount and periodically every 20 seconds
  useEffect(() => {
    getRoundInfo(); // Initial fetch
    const pollInterval = setInterval(getRoundInfo, 20000); // Poll every 20 seconds

    return () => clearInterval(pollInterval); // Cleanup on component unmount
  }, [auctionContract, duration, getRoundInfo]);

  // Real-time countdown logic
  useEffect(() => {
    if (currentRoundEndTime !== null) {
      const interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000); // Current time in seconds
        const remaining = Math.max(currentRoundEndTime - now, 0); // Prevent negative values

        // Update the formatted time
        setFormattedTime(formatTime(remaining));

        // Stop the countdown if time reaches zero
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000); // Update every second

      return () => clearInterval(interval); // Cleanup on component unmount or when endTime changes
    }
  }, [currentRoundEndTime]);

  // WebSocket to get currentRound and currentRoundEndTime
  // useEffect(() => {
  //   const ws = new WebSocket("ws://localhost:8080");
  //   //const ws = new WebSocket("wss://solidity-projects.onrender.com");

  //   ws.onopen = () => {
  //     console.log("Connected to WebSocket server");
  //   };

  //   ws.onmessage = (event) => {
  //     const data = JSON.parse(event.data);
  //     console.log("WebSocket data received:", data);

  //     setCurrentRound(data.currentRound);
  //     setCurrentRoundEndTime(data.currentRoundEndTime); // Fixed end time
  //   };

  //   ws.onclose = () => {
  //     console.log("Disconnected from WebSocket server");
  //   };

  //   ws.onerror = (error) => {
  //     console.error("WebSocket error:", error);
  //   };

  //   return () => ws.close(); // Cleanup WebSocket on component unmount
  // }, []);

  // // Convert seconds in following format: hours, minutes, seconds
  // const formatTime = (totalSeconds) => {
  //   const hours = Math.floor(totalSeconds / 3600);
  //   const minutes = Math.floor((totalSeconds % 3600) / 60);
  //   const seconds = totalSeconds % 60;

  //   // Pad single-digit values with a leading zero
  //   const pad = (num) => String(num).padStart(2, "0");

  //   return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  // };

  // // Real-time countdown
  // useEffect(() => {
  //   if (currentRoundEndTime !== null) {
  //     const interval = setInterval(() => {
  //       const now = Math.floor(Date.now() / 1000); // Current time in seconds
  //       const remaining = Math.max(currentRoundEndTime - now, 0);
  //       setFormattedTime(formatTime(remaining)); // Format remaining time

  //       if (remaining === 0) {
  //         clearInterval(interval); // Stop countdown at 0
  //       }
  //     }, 1000);

  //     return () => clearInterval(interval); // Cleanup on component unmount or endTime change
  //   }
  // }, [currentRoundEndTime]);

  const handleApprove = async () => {
    try {
      if (!inputTokenContract || !auctionContract) {
        throw new Error("Contracts are not initialized");
      }
      const amount = ethers.utils.parseEther(depositAmount); // Convert input to wei
      // Attach signer to the inputTokenContract
      const signer = provider.getSigner(); // Get the signer from the provider
      const inputTokenWithSigner = inputTokenContract.connect(signer);
      // Approve the auction contract to spend user's tokens
      const approvalTx = await inputTokenWithSigner.approve(
        auctionAddress,
        amount,
        { gasLimit: 300000 }
      );
      await approvalTx.wait(); // Wait for the transaction to be mined
      console.log("Approval successful:", approvalTx);
    } catch (error) {
      console.error("Error during approval or deposit:", error);
    }
  };

  const handleDeposit = async () => {
    try {
      if (!inputTokenContract || !auctionContract) {
        throw new Error("Contracts are not initialized");
      }

      const amount = ethers.utils.parseEther(depositAmount); // Convert input to wei
      const signer = provider.getSigner(); // Get the signer from the provider

      const auctionWithSigner = auctionContract.connect(signer);
      const depositTx = await auctionWithSigner.deposit(amount);
      await depositTx.wait(); // Wait for the transaction to be mined
      console.log("Deposit successful:", depositTx);
      alert("Deposit successful!");

      // setTimeout(async () => {
      //   console.log("userAddress:", userAddress); // Access userAddress directly
      //   await fetchBalances(userAddress); // Refresh balances
      // }, 20000); // Introduce delay to allow blockchain state update
    } catch (error) {
      console.error("Error during deposit:", error);
    }
  };

  // Event listener for: deposit event and RoundUpdated event.
  // Deposit event: if user deposits, the balance on UI gets updated
  // RoundUpdated event: when rounds ends, the balance on UI gets updated
  useEffect(() => {
    if (!auctionContract) return;

    if (!walletAddress) {
      throw new Error(
        "User address is not available. Please connect your wallet."
      );
    }

    const handleEvent = async (eventName) => {
      console.log(`${eventName} event detected, refreshing balances...`);
      await fetchBalances(walletAddress);
    };

    // Add listeners for both events
    auctionContract.on("Deposit", () => handleEvent("Deposit"));
    auctionContract.on("RoundUpdated", () => handleEvent("RoundUpdated"));

    // Cleanup the event listeners on component unmount
    return () => {
      auctionContract.off("Deposit", () => handleEvent("Deposit"));
      auctionContract.off("RoundUpdated", () => handleEvent("RoundUpdated"));
    };
  }, [auctionContract, walletAddress, fetchBalances]);

  //Listening to event RoundUpdated (update claimable UI when new round)
  useEffect(() => {
    if (!auctionContract) return;

    if (!walletAddress) {
      throw new Error(
        "User address is not available. Please connect your wallet."
      );
    }

    const handleRoundUpdatedEvent = async () => {
      console.log("RoundUpdated event detected, refreshing balances...");
      //await fetchClaimableRounds(); // Refresh Claimable Balances
      await fetchBalances(walletAddress);
    };

    // Listen for the RoundUpdated event
    auctionContract.on("RoundUpdated", handleRoundUpdatedEvent);

    // Cleanup the event listener on component unmount
    return () => {
      auctionContract.off("RoundUpdated", handleRoundUpdatedEvent);
    };
  }, [auctionContract, walletAddress, fetchBalances]);

  const handleClaim = async (round) => {
    if (!auctionContract) {
      alert("Auction contract is not initialized.");
      return;
    }

    try {
      // Trigger the claim transaction
      const claimTx = await auctionContract.amountToClaim(walletAddress, round);
      const receipt = await claimTx.wait();
      console.log(`Claim successful for round ${round}:`, receipt);
      alert(`Successfully claimed tokens for round ${round}`);
      fetchClaimableRounds(); // Refresh claimable rounds after claiming
    } catch (error) {
      console.error("Error claiming tokens:", error);
      alert("Failed to claim tokens. See console for details.");
    }
  };

  const fetchClaimableRounds = useCallback(async () => {
    if (!auctionContract || !walletAddress) return;

    try {
      const currentRound = await auctionContract.currentRound(); // Fetch current round
      const allRounds = [];

      for (let round = 0; round < currentRound; round++) {
        const userDeposit = await auctionContract.userDeposits(
          walletAddress,
          round
        );
        const roundTotalDeposits = await auctionContract.totalDepositsPerRound(
          round
        );

        // Check if the user has already claimed or deposited nothing
        const claimed = userDeposit.eq(0); // Use `eq` for BigNumber comparison

        // Calculate claimable tokens
        const toClaim = claimed
          ? 0
          : userDeposit.mul(1000).div(roundTotalDeposits).toString();

        //console.log("toClaim: ", toClaim);

        allRounds.push({
          round,
          totalDeposited: ethers.utils.formatEther(roundTotalDeposits),
          yourDeposit: ethers.utils.formatEther(userDeposit),
          toClaim: claimed ? 0 : toClaim,
          claimed,
        });

        // Add to total tokens only if not claimed
      }

      setClaimableRounds(allRounds); // Set all rounds (claimed and unclaimed)
    } catch (error) {
      console.error("Error fetching claimable rounds:", error);
    }
  }, [auctionContract, walletAddress, setClaimableRounds]); // Add all necessary dependencies;

  useEffect(() => {
    if (auctionContract && walletAddress) {
      fetchClaimableRounds();
    }
  }, [auctionContract, walletAddress, fetchBalances, fetchClaimableRounds]);

  return (
    <div className="App">
      {/* Using flexbox with columns */}
      {SUPPORTED_CHAINS.includes(chainId) ? (
        <div className={styles.container}>
          {/* 1st column */}
          <div className={styles.column}>
            <div className="info-card">
              <h2>Auction Rounds: Only 30 auction rounds!</h2>

              <p>
                <strong>No dev fees or team tokens:</strong>
              </p>
              <h5>50% of Dripx to liquidity LuckyX/Dripx</h5>
              <h5>40% of Dripx for lottery prizes</h5>
              <h5>10% of Dripx is burned!</h5>

              {walletAddress ? (
                <div>
                  <p>
                    <strong>Wallet Address:</strong> {walletAddress}
                  </p>
                  <p>
                    <strong>Chain ID:</strong> {chainId}
                  </p>
                  <p>
                    {" "}
                    <strong>Native Balance:</strong> {nativeBalance}
                  </p>
                  {luckyXBalance !== null ? (
                    <p>
                      <strong>LuckyX Balance: </strong> {luckyXBalance} LUCKYX
                    </p>
                  ) : (
                    <p>Loading LuckyX Balance...</p>
                  )}
                  {inputTokenBalance !== null ? (
                    <p>
                      <strong>Input Token Balance:</strong> {inputTokenBalance}{" "}
                      TOKEN
                    </p>
                  ) : (
                    <p>Loading Input Token Balance...</p>
                  )}
                </div>
              ) : (
                <p>Please connect your wallet to view auction data.</p>
              )}
            </div>
          </div>
          {/* 2nd column */}
          <div className={styles.column}>
            <div className="info-card">
              {/* Wallet Connection Section */}
              <h2>Current Round Stats</h2>

              <p>
                <strong>Round statistics:</strong>
              </p>
              <ul>
                {currentRound !== null ? (
                  currentRound < 5 ? (
                    <>
                      <h4>Current Round: {Number(currentRound) + 1}</h4>
                      <h4>Time remaining: {formattedTime}</h4>
                    </>
                  ) : (
                    <h4>Auction rounds have ended!</h4>
                  )
                ) : (
                  <h4>Loading current round...</h4>
                )}

                <h4>LuckyX tokens: 1 million </h4>
                {depositAmountUserRound !== null ? (
                  <h4>
                    Total Deposits in Current Round: {depositAmountTotalRound}{" "}
                    XXX{" "}
                  </h4>
                ) : (
                  <h4>Loading total deposits...</h4>
                )}
                <h4>USD value: xxx</h4>
              </ul>
              <p>
                <strong>Your stats:</strong>
              </p>
              <ul>
                <h4>
                  Your total deposits this Round: {depositAmountUserRound}{" "}
                </h4>
                <h4>Expected LuckyX this Round: {expectedLuckyX}</h4>
              </ul>
              {/* Approve and Claim Buttons */}
              <div className="action-container">
                <input
                  type="number"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="action-input"
                />
                <button className="action-button" onClick={handleApprove}>
                  Approve
                </button>
                <button className="action-button" onClick={handleDeposit}>
                  Deposit
                </button>
              </div>
            </div>
          </div>

          {/* 3rd column */}
          <div className={styles.column}>
            {/* Previous Rounds Section */}
            <div className="previous-auction-rounds">
              <h3>Previous Auction Rounds:</h3>
              <table>
                <thead>
                  <tr>
                    <th>Round Number</th>
                    <th>Total Deposited</th>
                    <th>Your Deposit</th>
                    <th>Claimable Tokens</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {claimableRounds.length > 0 ? (
                    claimableRounds.map((roundData, index) => (
                      <tr key={index}>
                        <td>{roundData.round}</td>
                        <td>{roundData.totalDeposited}</td>
                        <td>{roundData.yourDeposit}</td>
                        <td>{roundData.toClaim}</td>
                        <td>
                          {!roundData.claimed ? (
                            <button
                              className="claim-button"
                              onClick={() => handleClaim(roundData.round)}
                            >
                              Claim
                            </button>
                          ) : (
                            <span className="no-action">Claimed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5">No rounds available for claiming.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2>Unsupported Chain</h2>
          <p>Please switch to a supported network to view auction data.</p>
        </div>
      )}
    </div>
  );
}

export default AuctionPage;
