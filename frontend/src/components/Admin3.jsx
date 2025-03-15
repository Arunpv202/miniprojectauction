import "../styles/Auctionsuccess.css";
import { useState,useEffect } from "react";
import { useAuthStore } from "../store/global-store.jsx";
import { useMutation } from "@tanstack/react-query";
import socket from "../store/socketglobal.jsx"
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "./common/LoadingSpinner"; 
import { toast } from "react-toastify";

function StartAuction() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8045";
  const Navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showPlayers, setShowPlayers] = useState(false);
  const auctionCode = useAuthStore((state) => state.auctionCode);
  useEffect(() => {
    socket.on("updateTeams", ({ teams }) => {
      console.log("Received updated teams:", teams);
      setTeams(teams); // Update the state with received teams
    });

    socket.on("Teamrequest", ({ teamName,username,auctionCode}) => {
      console.log("Received Teamrequest:", teamName);
      const toastId = toast.info(
        <div style={{ 
            padding: "12px", 
            borderRadius: "8px", 
            backgroundColor: "#f0f8ff", 
            fontFamily: "Arial, sans-serif" 
          }}>
          
          {/* Username */}
          <p style={{ fontWeight: "bold", color: "#3498db", marginBottom: "2px" }}>
            Username: <span style={{ color: "#2c3e50", fontWeight: "normal" }}>{username}</span>
          </p>
          
          {/* Team */}
          <p style={{ fontWeight: "bold", color: "#e74c3c", marginBottom: "15px" }}>
            Team: <span style={{ color: "#2c3e50", fontWeight: "normal" }}>{teamName}</span>
          </p>
      
          {/* Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={() => {
                socket.emit("teamapproved", { teamName, auctionCode });
                toast.dismiss(toastId);
                toast.success(`${teamName} has been approved`);
              }}
              style={{
                padding: "6px 12px",
                backgroundColor: "#2ecc71", // Green for Accept
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✅ Accept
            </button>
      
            <button
              onClick={() => {
                socket.emit("teamrejected", { teamName, auctionCode });
                toast.dismiss(toastId);
                toast.error(`${teamName} has been rejected`);
              }}
              style={{
                padding: "6px 12px",
                backgroundColor: "#f1c40f", // Yellow for Reject
                color: "black",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ❌ Reject
            </button>
          </div>
        </div>,
        { autoClose: false, closeOnClick: false }
      );
    });
  
    return () => {
      socket.off("updateTeams");
      socket.off("Teamrequest");
    };
  }, []);



  const fetchPlayers = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auction/fetchPlayers/${auctionCode}`, {
      method: "GET",
      credentials: "include", // Include credentials
    });
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  };

  const { mutate:fetchingplayer, isLoading, isError, error } = useMutation({
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
      fetchingplayer();
    }
  };

  const Auctionstarted = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auction/startAuction/${auctionCode}`, {
      method: "GET",
      credentials: "include", // Include credentials
    });
    if (!res.ok) throw new Error("Failed to start auction");
    return res.json();
  };
  const { mutate:StartingAuction} = useMutation({
    mutationFn: Auctionstarted,
    onSuccess: (data) => {
      console.log("Auction started successfully:", data);
      socket.emit("teamdetails",{teams,auctionCode})
      Navigate("/Adminpanel");
    },
    onError: (error) => {
      console.error("Error starting auction:", error.message);
    },
  });

  return (
    <div className="auction-container">
      {/* Teams Dropdown - Top Left */}
      <div className="dropdown-container team-dropdown">
        <button className="dropdown-btn">Teams</button>
        <div className="dropdown-content expanded-list">
          {teams.length === 0 ? <p>No Teams Available</p> : 
            teams.map((team, index) => <p key={index}>{team.teamName}</p>)}
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
        <button className="start-auction-btn" onClick={()=>StartingAuction()}>Start Round</button>
      </div>
    </div>
  );
}

export default StartAuction;