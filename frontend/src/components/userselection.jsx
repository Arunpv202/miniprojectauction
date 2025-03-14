import { useEffect } from "react";
import { useState } from "react";
import { useAuthStore } from "../store/global-store.jsx";
import { useNavigate } from "react-router-dom";
import "../styles/JoinAuction.css";
import LoadingSpinner from "../components/common/LoadingSpinner";
import socket from "../store/socketglobal.jsx";

function JoinAuction() {
  const navigate = useNavigate();
  const setAuctionCode = useAuthStore((state) => state.setAuctionCode);
  const [teamName, setTeamName] = useState("");
  const [loading, setLoading] = useState(false);
  const [auctionCode, setAuctionCodeState] = useState("");
  const [AuctionName, setAuctionName] = useState("");
  const setTeamname = useAuthStore((state) => state.setTeamname);
  const [errorMessage, setErrorMessage] = useState("");
  const currentuser=useAuthStore((state)=>state.authUser);
  console.log(currentuser);
  console.log(currentuser.username);

  const handleauctionjoin = async () => {
    if (!teamName || !auctionCode || !AuctionName) {
      setErrorMessage("Team Name and Auction Code are required");
      return;
    }
    setErrorMessage("");
    setLoading(true);
    socket.connect();
    socket.on("connect", () => {
      console.log("Connected to server", socket.id);
    });
    socket.emit("joinAuction",{teamName, auctionCode, AuctionName,username:currentuser.username});

  };
 useEffect(() => {
    socket.on("auctionerror", ({ message }) => {
      setErrorMessage(message);
      setLoading(false);
      socket.disconnect();
    });
    socket.on("teamapproved", ({ teamName,auctionCode}) => {
      console.log("teamnaame is ",teamName)
      setTeamname(teamName);
      setAuctionCode(auctionCode);
      setLoading(false);
      navigate("/finalpage");
    });
    return () => {
      socket.off("auctionerror");
      socket.off("teamapproved");
    };
 }, []);

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
      <button className="join-button" onClick={() => {handleauctionjoin()}}>
      {loading ? <LoadingSpinner size="sm" /> : "join"}
      </button>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
  );
};

export default JoinAuction;