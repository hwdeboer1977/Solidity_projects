import React, { useContext } from "react";
import { WalletContext } from "../WalletContext";

function WalletConnect() {
  const { walletAddress, connectWallet, disconnectWallet } =
    useContext(WalletContext);

  const handleButtonClick = () => {
    if (walletAddress) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  };

  return (
    <button onClick={handleButtonClick} className="connect-wallet-button">
      {walletAddress
        ? `Connected: ...${walletAddress.slice(-5)}`
        : "Connect Wallet"}
    </button>
  );
}

export default WalletConnect;
