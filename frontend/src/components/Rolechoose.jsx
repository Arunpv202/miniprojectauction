import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
import { useState } from "react";
import "../styles/rolechoose.css";
import { LogOut } from 'lucide-react';
import { User } from 'lucide-react';
import { Users } from 'lucide-react';
import { UserRound } from 'lucide-react';


function RoleSelection() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8045";
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const currentuser=useAuthStore((state)=>state.authUser);

  const { mutate } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(API_BASE_URL+"/api/auth/logout", {
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

  return (
    <>
    <div className="role-container">
      <h1 className="role-heading">Decide Your Role, Define the Game!</h1>
      <div className="role-buttons">
        <button className="role-btn admin-btn" onClick={() => navigate("/Admin")}>
        <UserRound/>Admin
          <span className="role-text">Create An Auction</span>
        </button>
        <button className="role-btn user-btn" onClick={() => navigate("/users")}>
        <Users/> User
          <span className="role-text">Join In An Auction</span>
        </button>
      </div>
    </div>
    <div className="toggle-containerfj">
      {/* Toggle Button */}
      <button className="toggle-btnfj" onClick={() => setIsOpen(!isOpen)}>
        <User/>
      </button>

      {/* Dropdown Menu */}
      <div className={`dropdownfj ${isOpen ? "show" : ""}`}>
        <p>Username : {currentuser.username}</p>
        <button onClick={mutate}><LogOut /></button>
      </div>
    </div>
    </>
  );
}

export default RoleSelection;
