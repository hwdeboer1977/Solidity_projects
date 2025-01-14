import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
// Import the ABI (assuming you have the Auction ABI locally, or you can manually copy it from your Hardhat artifacts)
import AuctionABI from "./pages/Auction.json"; // Correct import path now

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
  const auctionAddress = "0xEb9Ed228Dca0ebfD6122415c1Db9eA0aaD27a6c8";

  const ERC20_ABI = [
    // balanceOf function
    "function balanceOf(address account) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
  ];

  const SUPPORTED_NETWORKS = {
    11155111: {
      // Sepolia
      inputTokenAddress: "0xA6d6b4CcE63aC6778508c2277315e4173a1eF063",
      luckyxAddress: "0x7A796Ec4cb2fc5226b82976cCdd1eBbfD5C6B5b5",
      auctionAddress: "0x7F36B4fb45Fb834EE4A41Cb9E531d3049B58b105",
    },
  };

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
  }, []);

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
