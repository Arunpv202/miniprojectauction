import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/global-store.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Admin2.css";
import { User } from 'lucide-react';
import { UserRoundPlus } from 'lucide-react';
import { ShieldCheck } from 'lucide-react';

function AuctionDetails() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  let auctionCode = useAuthStore((state) => state.auctionCode);

  const [playerName, setPlayerName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [allocatedPurse, setAllocatedPurse] = useState("");
  const [bidIncrement, setBidIncrement] = useState("");
  const [errormessage, setErrorMessage] = useState("");

  // Mutation for adding a player
  const { mutate: addPlayer } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auction/Players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: playerName, basePrice, auctionCode }),
      });
      if (!res.ok) throw new Error("Failed to add player");
      return res.json();
    },
    onSuccess: () => {
      setPlayerName("");
      setBasePrice("");
    },
  });

  // Mutation for submitting the auction (creating teams)
  const { mutate: submitAuction } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auction/Teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ allocatedPurse, bidincrement: bidIncrement, auctionCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit auction");
      }
      return data;
    },
    onSuccess: () => {
      setAllocatedPurse("");
      setBidIncrement("");
      setErrorMessage("");
      navigate("/admin3");
    },
    onError: (error) => {
      setErrorMessage(error.message);
    },
  });

  // Mutation for logout
  const { mutate: logoutMutate } = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log out");

      return res.json();
    },
    onSuccess: () => {
      logout();
      navigate("/login");
    },
  });

  return (
    <div className="container">
      {/* Header Section */}
      <div className="welcome-container">
        <h1 className="welcome-admin">Auction Setup Hub</h1>
        <p className="admin-description">
          Manage your auction by adding players, setting budgets, and defining bid increments.
        </p>
      </div>

      <input
        type="text"
        placeholder="Player Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Base Price (Should Not Be Negative)"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
      />
      <button onClick={addPlayer}><UserRoundPlus/>Add Player</button>

      <input
        type="number"
        placeholder="Common Budget for Teams (Should Not Be Negative)"
        value={allocatedPurse}
        onChange={(e) => setAllocatedPurse(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price Increment per Bid (Should Not Be Negative)"
        value={bidIncrement}
        onChange={(e) => setBidIncrement(e.target.value)}
      />
      <button onClick={submitAuction}><ShieldCheck/>Submit Auction</button>

      <button className="logout-btn" onClick={logoutMutate}><User/></button>
      {errormessage && <p>{errormessage}</p>}
    </div>
  );
}

export default AuctionDetails;
