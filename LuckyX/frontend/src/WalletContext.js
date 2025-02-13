import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
// Import the ABI (assuming you have the Auction ABI locally, or you can manually copy it from your Hardhat artifacts)
import AuctionABI from "./pages/Auction.json"; // Correct import path now
import ERC20_ABI from "./pages/ERC20.json"; // Correct import path now

export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [nativeBalance, setNativeBalance] = useState("");
  const [auctionContract, setAuctionContract] = useState(null);
  const [inputTokenContract, setInputTokenContract] = useState(null);
  const [luckyTokenXContract, setLuckyTokenXContract] = useState(null);
  const [signer, setSigner] = useState(null);

  const inputTokenAddress = "0x23Cd660055157fA8997f85D65F4e91A0d5FebC32";
  const luckyxAddress = "0xa6D4E6f25849529ce8Ef15f1c12Ae1DeBb62F1Dd";
  const auctionAddress = "0x1AbB8C31Cc06759bEeB07184a0DF9A0Ce11CbA9c";

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

          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          setSigner(signer);

          const balanceOf = await provider.getBalance(newAddress);
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

          console.log("Wallet switched to:", newAddress);
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
  }, [walletAddress, chainId]);

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
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
