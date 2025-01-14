import React, { useState, useEffect } from "react";

const Countdown = ({ initialTime }) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  // Helper function to format time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000); // Decrease every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return <h4>Remaining time: {formatTime(timeRemaining)}</h4>;
};

export default Countdown;
