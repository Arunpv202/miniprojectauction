import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/global-store.jsx";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../styles/Admin2.css";

function AuctionDetails() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const auctionCode=useAuthStore((state)=>state.auctionCode);
  console.log(auctionCode);
  const [playerName, setPlayerName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [allocatedPurse, setAllocatedPurse] = useState("");
  const [bidIncrement, setBidIncrement] = useState("");

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
        body: JSON.stringify({ allocatedPurse, bidincrement: bidIncrement ,auctionCode}),
      });
      if (!res.ok) throw new Error("Failed to submit auction");
      return res.json();
    },
    onSuccess: () => {
      setAllocatedPurse("");
      setBidIncrement("");
      navigate("/admin3")
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
      <h1>Auction Details</h1>
      <input
        type="text"
        placeholder="Player Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Base Price"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
      />
      <button onClick={addPlayer}>Add Player</button>

      <input
        type="number"
        placeholder="Common Budget for Teams"
        value={allocatedPurse}
        onChange={(e) => setAllocatedPurse(e.target.value)}
      />
      <input
        type="number"
        placeholder="Price Increment per Bid"
        value={bidIncrement}
        onChange={(e) => setBidIncrement(e.target.value)}
      />
      <button onClick={submitAuction}>Submit Auction</button>

      <button className="logout" onClick={logoutMutate}>Logout</button>
    </div>
  );
}

export default AuctionDetails;