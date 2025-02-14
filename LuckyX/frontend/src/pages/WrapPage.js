//import React, { useContext, useEffect, useState } from "react";
import React from "react";
import "./WrapPage.css"; // Loaded first
import "./WalletConnect.css"; // Loaded second, overrides wrappage.css if selectors are equally specific
import LuckyX from "./LuckyX.png"; // Adjust the path to your image
//import { WalletContext } from "../WalletContext";

function WrapPage() {
  // // Retrieve this information from WalletContect (avaiable in all subpages)
  // const { walletAddress, chainId, provider, nativeBalance } =
  //   useContext(WalletContext);

  return (
    <div className="grid-container">
      <div className="left-box">
        <h3>Why Choose LuckyLux?</h3>
        <h4>Secure, decentralized, no dev fees</h4>
        <h4>Contract is verified: PM</h4>
        <h4>It only goes up in terms of LuckyX!</h4>
        <h4>You can buy LuckyX here to start: </h4>
        <h3>But how?</h3>
        <h4>The mint and redeem fee (5%) ensure that:</h4>
        <h4>supply LuckyX in contract > total supply of LuckyLux</h4>
        <h4>Price = backed LuckyX balance in the contract divided by</h4>
        <h4>the total supply of LuckyLux.</h4>
      </div>

      <div className="middle-box">
        {/* Buttons in image */}
        <div className="image-container">
          <button className="mint-button">Mint</button>
          <button className="redeem-button">Redeem</button>
          <img
            src={LuckyX}
            alt="Diagram showing the process flow"
            className="diagram-image"
          />
        </div>
        <div className="info-user">
          <h4>Your balance LuckyX: {}</h4>
          <h4>Your balance LuckyLux: {}</h4>
          <h4>Current price: {}</h4>
          <h4>Backed supply LuckyX: {}</h4>
          <h4>Current supply LuckyLux: {}</h4>
        </div>
      </div>

      <div className="right-box">
        {/* Wallet Connect Section */}
        <div className="wallet-connect-container"></div>
      </div>
    </div>
  );
}

export default WrapPage;
