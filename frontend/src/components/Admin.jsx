import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
import socket from "../store/socketglobal.jsx";
import "../styles/Adminstyle.css";
function Admin() {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    teamCount: "",
  });

  const logout = useAuthStore((state) => state.logout);
  const setAuctionCode = useAuthStore((state) => state.setAuctionCode);
  const navigate = useNavigate();
  const setSocketid = useAuthStore((state) => state.setSocketid);

  // Mutation for logout
  const { mutate: logoutMutate } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to log out");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      logout();
      navigate("/login");
    },
  });

  // Mutation for creating an auction
  const { mutate: createAuctionMutate } = useMutation({
    mutationFn: async ({ name, code, teamCount }) => {
      try {
        const res = await fetch("/api/auction/Auctiondetails", {
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
    e.preventDefault();
    createAuctionMutate(formData);
  };

  return (
    <div className="container">
      <h1>Admin Panel</h1>
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
          placeholder="Enter Auction Code (6 letters)"
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
        <button type="submit">Submit</button>
      </form>
      <button className="logout" onClick={logoutMutate}>
        Logout
      </button>
    </div>
  );
}
export default Admin;