import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
// Import the ABI (assuming you have the Auction ABI locally, or you can manually copy it from your Hardhat artifacts)
import AuctionABI from "./pages/Auction.json"; // Correct import path now
import ERC20_ABI from "./pages/ERC20.json"; // Correct import path now
import Staking_ABI from "./pages/Staking.json"; // Correct import path now

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [nativeBalance, setNativeBalance] = useState("");
  const [auctionContract, setAuctionContract] = useState(null);
  const [inputTokenContract, setInputTokenContract] = useState(null);
  const [luckyTokenXContract, setLuckyTokenXContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [signer, setSigner] = useState(null);
  const [config, setConfig] = useState(null); // Store config data

  useEffect(() => {
    fetch("/input.json")
      .then((response) => response.json())
      .then((data) => {
        setConfig(data);
        console.log("📂 Loaded Addresses:", data);
      })
      .catch((error) => console.error("❌ Error loading input.json:", error));
  }, []); // ✅ No missing dependencies

  // // ✅ Another useEffect for when `config` updates
  // useEffect(() => {
  //   if (config) {
  //     console.log("🎯 Config updated:", config);
  //   }
  // }, [config]); // ✅ This runs when config is updated

  // ✅ Only set addresses if config is available
  const inputTokenAddress = config ? config.inputTokenContract : null;
  const luckyxAddress = config ? config.luckXContract : null;
  const auctionAddress = config ? config.auctionContract : null;
  const stakingAddress = config ? config.stakingContract : null;

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Get provider, accounts, chain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const network = await provider.getNetwork();

        setProvider(provider);
        setWalletAddress(accounts[0]);
        setChainId(network.chainId);

        // Get signer
        const signer = provider.getSigner();
        setSigner(signer);

        // Get native balance
        const balanceOf = await provider.getBalance(accounts[0]);
        setNativeBalance(
          Number(ethers.utils.formatEther(balanceOf)).toFixed(2)
        );

        // Initialize auction contract
        if (!auctionAddress || !AuctionABI) {
          throw new Error("Auction contract address or ABI is missing.");
        }
        const auctionContractI = new ethers.Contract(
          auctionAddress,
          AuctionABI,
          signer
        );
        setAuctionContract(auctionContractI);

        // Initialize LuckyX token contract
        const tokenLuckyX = new ethers.Contract(
          luckyxAddress,
          ERC20_ABI,
          provider
        );
        setLuckyTokenXContract(tokenLuckyX);

        // Initialize Input token contract
        const tokenInput = new ethers.Contract(
          inputTokenAddress,
          ERC20_ABI,
          provider
        );
        setInputTokenContract(tokenInput);

        // Initialize staking contract
        if (!stakingAddress || !Staking_ABI) {
          throw new Error("Staking contract address or ABI is missing.");
        }
        const stakingContractI = new ethers.Contract(
          stakingAddress,
          Staking_ABI,
          signer
        );
        setStakingContract(stakingContractI);
      } catch (error) {
        console.error("Error connecting wallet:", error);
      }
    } else {
      alert("MetaMask is not installed. Please install it to connect.");
    }
  };

  const disconnectWallet = () => {
    setProvider(null);
    setWalletAddress(null);
    setChainId(null);
    setSigner(null);
    setNativeBalance(null);
    setAuctionContract(null);
    setLuckyTokenXContract(null);
    setInputTokenContract(null);
    setStakingContract(null);

    console.log("Wallet Disconnected");
  };

  // Add listeners for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      // Handle account changes
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          const newAddress = accounts[0];
          setWalletAddress(newAddress);

          console.log("🔄 Wallet switched to:", newAddress);
          console.log("🔍 Checking contract addresses...");
          console.log("Auction Address (before use):", auctionAddress);
          console.log("Staking Address:", stakingAddress);
          console.log("LuckyX Token Address:", luckyxAddress);
          console.log("Input Token Address:", inputTokenAddress);

          // Prevent errors if any address is missing
          if (
            !auctionAddress ||
            !stakingAddress ||
            !luckyxAddress ||
            !inputTokenAddress
          ) {
            console.error(
              "❌ ERROR: One or more contract addresses are NULL! Stopping initialization."
            );
            return;
          }

          try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            setSigner(signer);

            const balanceOf = await provider.getBalance(newAddress);
            setNativeBalance(
              Number(ethers.utils.formatEther(balanceOf)).toFixed(2)
            );

            console.log(
              "📢 Creating Auction Contract with Address:",
              auctionAddress
            );

            // ✅ Ensure the contract is only created when auctionAddress is properly set
            if (auctionAddress) {
              const auctionContractI = new ethers.Contract(
                auctionAddress,
                AuctionABI,
                signer
              );
              setAuctionContract(auctionContractI);
            } else {
              console.error(
                "❌ ERROR: Auction Address is NULL during contract creation!"
              );
            }

            if (stakingAddress) {
              const stakingContractI = new ethers.Contract(
                stakingAddress,
                Staking_ABI,
                signer
              );
              setStakingContract(stakingContractI);
            } else {
              console.error(
                "❌ ERROR: Staking Address is NULL during contract creation!"
              );
            }

            if (luckyxAddress) {
              const tokenLuckyX = new ethers.Contract(
                luckyxAddress,
                ERC20_ABI,
                provider
              );
              setLuckyTokenXContract(tokenLuckyX);
            }

            if (inputTokenAddress) {
              const tokenInput = new ethers.Contract(
                inputTokenAddress,
                ERC20_ABI,
                provider
              );
              setInputTokenContract(tokenInput);
            }

            console.log("✅ Contracts reinitialized successfully.");
          } catch (error) {
            console.error("❌ ERROR: Failed to initialize contracts:", error);
          }
        } else {
          disconnectWallet();
        }
      };

      // Handle chain changes
      const handleChainChanged = async (newChainId) => {
        const parsedChainId = parseInt(newChainId, 16); // Convert hex chain ID to decimal
        setChainId(parsedChainId);

        console.log("Network switched to:", parsedChainId);

        // Reset state and reinitialize
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setProvider(provider);
        setSigner(signer);

        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const balanceOf = await provider.getBalance(accounts[0]);
          setNativeBalance(
            Number(ethers.utils.formatEther(balanceOf)).toFixed(2)
          );

          const auctionContractI = new ethers.Contract(
            auctionAddress,
            AuctionABI,
            signer
          );
          setAuctionContract(auctionContractI);

          const tokenLuckyX = new ethers.Contract(
            luckyxAddress,
            ERC20_ABI,
            provider
          );
          setLuckyTokenXContract(tokenLuckyX);

          const tokenInput = new ethers.Contract(
            inputTokenAddress,
            ERC20_ABI,
            provider
          );
          setInputTokenContract(tokenInput);

          // Initialize staking contract
          const stakingContractI = new ethers.Contract(
            stakingAddress,
            Staking_ABI,
            signer
          );
          setStakingContract(stakingContractI);
        }
      };

      // Attach event listeners
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      // Cleanup listeners on unmount
      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [
    walletAddress,
    chainId,
    auctionAddress,
    inputTokenAddress,
    luckyxAddress,
    stakingAddress,
  ]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        chainId,
        provider,
        signer,
        nativeBalance,
        connectWallet,
        disconnectWallet,
        auctionContract,
        luckyTokenXContract,
        inputTokenContract,
        auctionAddress,
        stakingAddress,
        stakingContract,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
