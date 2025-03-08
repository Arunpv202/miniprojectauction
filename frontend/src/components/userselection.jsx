import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthStore } from "../store/global-store.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/JoinAuction.css";
import socket from "../store/socketglobal.jsx";
function JoinAuction() {
  const navigate = useNavigate();
  const setAuctionCode = useAuthStore((state) => state.setAuctionCode);
  const [teamName, setTeamName] = useState("");
  const [auctionCode, setAuctionCodeState] = useState("");
  const [AuctionName, setAuctionName] = useState("");
  const setTeamname = useAuthStore((state) => state.setTeamname);
  const [errorMessage, setErrorMessage] = useState("");

  // Mutation for joining an auction
  const { mutate: joinAuction } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auction/updateTeamName", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ teamName, auctionCode, AuctionName }),
      });
      const data = await res.json();
      console.log(data);
      if (!res.ok) throw new Error(data.error || "Failed to join auction");
      return data;
    },
    onSuccess: () => {
      setAuctionCode(auctionCode);
      setTeamname(teamName)
      socket.connect();
      socket.emit("joinAuction", { teamName, auctionCode });
      socket.on("connect", () => {
        console.log("socket connected", socket.id);
      })
      navigate("/finalpage");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  return (
    <div className="join-auction-container">
      <h1>Join Auction</h1>
      <input
        type="text"
        placeholder="Team Name"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        className="input-field"
      />
      <input
        type="text"
        placeholder="Auction Code"
        value={auctionCode}
        onChange={(e) => setAuctionCodeState(e.target.value)}
        className="input-field"
      />
      <input
        type="text"
        placeholder="Auction Name"
        value={AuctionName}
        onChange={(e) => setAuctionName(e.target.value)}
        className="input-field"
      />
      <button className="join-button" onClick={joinAuction}>
        Join Auction
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default JoinAuction;
