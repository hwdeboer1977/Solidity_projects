import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDroplet,
  faTrophy,
  faRecycle,
} from "@fortawesome/free-solid-svg-icons";
import Treasury from "./treasury.png"; // Adjust the path to your image
import WalletConnect from "./WalletConnect";
import "./StakingPage.css"; // Loaded first
import "./WalletConnect.css"; // Loaded second, overrides wrappage.css if selectors are equally specific

const StakingPage = () => {
  const [userAddress, setUserAddress] = useState(null);
  const [chainId, setUserChainId] = useState(null);

  const handleWalletConnected = ({ address, chainId }) => {
    console.log("Wallet connected with address:", address);
    console.log("Connected on chain ID:", chainId);
    setUserAddress(address);
    setUserChainId(chainId);
  };

  const handleWalletDisconnected = () => {
    console.log("Wallet disconnected");
    setUserAddress(null);
    setUserChainId(null);
  };

  const iconTextStyle = {
    color: "#333333", // Replace with your desired color
    textAlign: "center",
  };

  return (
    <div style={pageStyle}>
      <div style={contentStyle}>
        {/* Left Side: Cards */}
        <div style={cardsContainerStyle}>
          {/* Drip Pool Rewards */}
          <div style={cardStyle}>
            <div style={iconTextStyle}>
              <FontAwesomeIcon icon={faDroplet} size="2x" color="#007BFF" />
              <div>
                <h2>Drip Pool Rewards</h2>
                <p>
                  Stake your tokens and watch the rewards roll in! Every day,{" "}
                  <strong>1% of the treasury pool</strong> is distributed to
                  stakers, ensuring a steady stream of earnings. The longer you
                  stake, the more you grow.
                </p>
              </div>
            </div>
          </div>

          {/* Lottery Jackpot */}
          <div style={cardStyle}>
            <div style={iconTextStyle}>
              <FontAwesomeIcon icon={faTrophy} size="2x" color="#FFD700" />
              <div>
                <h2>Lottery Jackpot</h2>
                <p>
                  Feeling lucky? <strong>10% of the treasury</strong> fuels an
                  exciting lottery prize pool. By staking, you’re automatically
                  entered for a chance to win big!
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

        {/* Right Side: Image and Text */}
        <div style={imageContainerStyle}>
          <img
            src={Treasury}
            alt="Treasury Chest"
            style={{
              width: "400px",
              maxWidth: "100%",
              borderRadius: "10px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
            }}
          />
          <h1 style={winnerTextStyle}>And the winner is?</h1>
        </div>
        {/* Wallet Connect Section */}
        <div className="wallet-connect-container">
          <WalletConnect
            onWalletConnected={handleWalletConnected}
            onWalletDisconnected={handleWalletDisconnected}
          />
        </div>
      </div>
    </div>
  );
};

const pageStyle = {
  padding: "20px",
  fontFamily: "Arial, sans-serif",
  maxWidth: "1200px",
  margin: "auto",
};

const contentStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "20px",
};

const cardsContainerStyle = {
  flex: "2",
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "20px",
};

const cardStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e0e0e0",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
};

const iconTextStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "15px",
};

const imageContainerStyle = {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const winnerTextStyle = {
  marginTop: "20px",
  fontSize: "1.8rem",
  color: "#333",
  textAlign: "center",
};

export default StakingPage;
