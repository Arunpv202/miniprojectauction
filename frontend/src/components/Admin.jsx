import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
import socket from "../store/socketglobal.jsx";
import "../styles/Adminstyle.css";
import { User } from 'lucide-react';
import { Send } from 'lucide-react';

function Admin() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8045";
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teamCount: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const setAuctionCode = useAuthStore((state) => state.setAuctionCode);
  const navigate = useNavigate();
  const setSocketid = useAuthStore((state) => state.setSocketid);

  // Mutation for logout

  // Mutation for creating an auction
  const { mutate: createAuctionMutate } = useMutation({
    mutationFn: async ({ name, code, teamCount }) => {
      try {
        const res = await fetch(API_BASE_URL+"/api/auction/Auctiondetails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, code, teamCount }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create auction");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      alert("Auction created successfully!");
      setAuctionCode(data.auction.code);
      socket.connect();
      socket.emit("createAuction", { auctionCode: data.auction.code });
      socket.on("connect", () => {
        console.log("socket connected", socket.id);
      })
      setSocketid(data.auction.socketid);
      navigate("/Adminpage2");
    },
    
    onError: (error) => {
      alert(error.message || "Failed to create auction");
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "teamCount") {
      if (value === "" || (/^\d*$/.test(value) && Number(value) >= 1)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    setErrorMessage("");
    e.preventDefault();
    if(!formData.code || !formData.name || !formData.teamCount || formData.teamCount == 0){
      console.log("error in fields");
      setErrorMessage("All fields are mandatory");
      return;
    }
    if(formData.code.length!=6){
      setErrorMessage("Auction Code Should Be Exactly 6 characters");
      return;
    }
    createAuctionMutate(formData);
  };

  return (
    <div>
      <div className="welcome-container">
        <h1 className="welcome-admin">Welcome, Admin!</h1>
        <p className="admin-description">
          Manage auctions efficiently – Create auctions, add players, and approve teams.
        </p>
      </div>
      
      <div className="container">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter Auction Name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="text"
            name="code"
            placeholder="Enter Auction Code (Min 1 character)"
            value={formData.code}
            onChange={handleInputChange}
            required
          />
          <input
            type="number"
            name="teamCount"
            placeholder="Enter Number of Teams"
            value={formData.teamCount}
            onChange={handleInputChange}
            required
          />
          <button type="submit"><Send/>Submit</button>
        </form>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
      </div>
    </div>
  );
}

export default Admin;
