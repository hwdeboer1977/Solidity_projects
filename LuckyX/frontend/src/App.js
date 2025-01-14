import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import MainPage from "./pages/MainPage";
import AuctionPage from "./pages/AuctionPage";
import StakingPage from "./pages/StakingPage";
import WrapPage from "./pages/WrapPage";
import StatsPage from "./pages/StatsPage";
import DocsPage from "./pages/DocsPage";
import WalletConnect from "./pages/WalletConnect"; // Wallet connect script
import { WalletProvider } from "./WalletContext";
import "./App.css";

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // Toggle the state of the menu
  };

  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <nav className="navbar">
            <div className="navbar-container">
              {/* Logo */}
              <img src="logo.jpg" alt="Logo" className="logo_auction_app" />

              <button className="hamburger-menu" onClick={toggleMenu}>
                ☰
              </button>
              <ul className={`navbar-links ${isMenuOpen ? "active" : ""}`}>
                <NavButton to="/" label="Home" />
                <NavButton to="/auction" label="Auction" />
                <NavButton to="/staking" label="Staking" />
                <NavButton to="/wrap" label="Wrap" />
                <NavButton to="/stats" label="Stats" />
                <NavButton to="/docs" label="Docs" />
              </ul>

              {/* Connect Wallet Button (conditionally rendered) */}
              <ConnectWalletWrapper />
            </div>
          </nav>

          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/auction" element={<AuctionPage />} />
            <Route path="/staking" element={<StakingPage />} />
            <Route path="/wrap" element={<WrapPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/docs" element={<DocsPage />} />
          </Routes>
        </div>
      </Router>
    </WalletProvider>
  );
}
// Wrapper to conditionally render the WalletConnect button
const ConnectWalletWrapper = () => {
  const location = useLocation();

  // Define subpages where the wallet button should appear
  const allowedPaths = ["/auction", "/staking", "/wrap"];

  // Check if the current path is in the allowed paths
  if (allowedPaths.includes(location.pathname)) {
    return (
      <div className="wallet-container">
        <WalletConnect
          onWalletConnected={(address) =>
            console.log("Wallet connected:", address)
          }
          onWalletDisconnected={() => console.log("Wallet disconnected")}
        />
      </div>
    );
  }

  return null; // Do not render the button for other paths
};

// Custom Button Component for Navigation
const NavButton = ({ to, label }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <li>
      <button onClick={handleClick} className="nav-button">
        {label}
      </button>
    </li>
  );
};

export default App;
