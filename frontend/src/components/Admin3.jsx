import "../styles/Auctionsuccess.css";
import { useState } from "react";
import { useAuthStore } from "../store/global-store.jsx";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "./common/LoadingSpinner"; // Adjust path if needed

function StartAuction() {
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const auctionCode = useAuthStore((state) => state.auctionCode);

  const fetchPlayers = async () => {
    const res = await fetch(`/api/auction/fetchPlayers/${auctionCode}`, {
      method: "GET",
      credentials: "include", // Include credentials
    });
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  };

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: fetchPlayers,
    onSuccess: (data) => {
      setPlayers(data);
      setShowPlayers(true);
    },
    onError: (error) => {
      console.error("Error fetching players:", error.message);
    },
  });

  const handleTogglePlayers = () => {
    if (showPlayers) {
      setShowPlayers(false);
    } else {
      mutate();
    }
  };

  return (
    <div className="auction-container">
      {/* Teams Dropdown - Top Left */}
      <div className="dropdown-container team-dropdown">
        <button className="dropdown-btn">Teams</button>
        <div className="dropdown-content expanded-list">
          {teams.length === 0 ? <p>No Teams Available</p> : 
            teams.map((team, index) => <p key={index}>{team}</p>)}
        </div>
      </div>

      {/* Players Dropdown - Top Right */}
      <div className="dropdown-container player-dropdown">
        <button
          className="dropdown-btn"
          onClick={handleTogglePlayers}
          disabled={isLoading}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : showPlayers ? "Hide Players" : "Show Players"}
        </button>
        {showPlayers && (
          <div className="dropdown-content expanded-list">
            {isLoading ? (
              <LoadingSpinner size="md" />
            ) : isError ? (
              <p>Error: {error.message}</p>
            ) : (
              players.length === 0 ? <p>No Players Available</p> : 
              players.map((player, index) => (
                <p key={index}>{player.name} - ${player.basePrice}</p>
              ))
            )}
          </div>
        )}
      </div>

      {/* Start Round Button - Centered */}
      <div className="start-auction-wrapper">
        <button className="start-auction-btn">Start Round</button>
      </div>
    </div>
  );
}

export default StartAuction;
