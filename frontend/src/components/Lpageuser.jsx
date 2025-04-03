
import "../styles/Successpage.css";
import { useState, useEffect } from 'react';
import socket from "../store/socketglobal.jsx";
import { useMutation } from "@tanstack/react-query";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useAuthStore } from "../store/global-store.jsx";
import { useNavigate } from "react-router-dom";
function Successpage() {
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8045";
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(null);
  const [playername,setPlayername]=useState("");
  const [baseprice,setBaseprice]=useState("");
  const [isBiddingDisabled, setIsBiddingDisabled] = useState(false);
  const [bidincrement,setBidincrement]=useState("");
  const [playerno,setPlayerno]=useState("");
  const [teamName,setTeamName]=useState(""); 
  const [squad, setsquad] = useState([]);
  const [playersFetched, setPlayersFetched] = useState(false);
  const [remainingPurse, setRemainingPurse] = useState(0);
  const team=useAuthStore((state)=>state.Teamname)
  const auctionCode=useAuthStore((state)=>state.auctionCode)
  console.log(team);
  
  useEffect(() => {
    if (!team || !auctionCode) return;
    fetchRemainingPurse();
  }, [team, auctionCode]);

  useEffect(() => {
    socket.on("playertobid", ({playerId, name, basePrice ,bidincrement}) => {
      console.log(`Player ${name} picked for ${basePrice}`);
      console.log(playerId);
      setPlayername(name);
      console.log(`Player ${name} picked for ${bidincrement}`);
      setBaseprice(basePrice);
      setBidincrement(bidincrement);
      setPlayerno(playerId);
      console.log(playerno);
      setIsBiddingDisabled(false);
      setTeamName("");
    });
    socket.on("newBid", ({ newPrice,teamName }) => {
      console.log(`New bid: ${newPrice} by ${teamName}`);
      setBaseprice(newPrice);
      setTeamName(teamName);
      setIsBiddingDisabled(false); // Re-enable button when another user bids
    });
    socket.on("timerUpdate",({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });
    socket.on("disableBidButton", () => {
      setIsBiddingDisabled(true); // Disable the button when another user bids
    });

    socket.on("nextPlayer", ({ playerno,baseprice,playername,teamName}) => {
      if(teamName==="") {
        console.log(playername,playerno);
        setPlayername("Unsold");
        setBaseprice(baseprice);
        setPlayerno("");
        setTeamName(teamName);
      }
      else{
        console.log(playername,playerno);
        setPlayername("Sold");
        setBaseprice(baseprice);
        setPlayerno("");
        setTeamName(teamName);
      }
      setIsBiddingDisabled(true); // Disable the button
      mutate(); // Fetch the next player
      fetchRemainingPurse();
    });
    socket.on("auctionfinished", () => {
      socket.disconnect();
      navigate("/Rolechoose");
    });
    return () => {
      socket.off("playertobid");
      socket.off("newBid");
      socket.off("nextPlayer");
      socket.off("auctionfinished");
      socket.off("timerUpdate");
      socket.off("disableBidButton");
    };

  }, []);
  const handleBid = () => {
    setIsBiddingDisabled(true); 
    let newPrice = teamName ? parseInt(baseprice) + parseInt(bidincrement) : parseInt(baseprice);
    if (newPrice > remainingPurse) {
      alert("You don't have enough balance to bid");
      return;
    }
    else{
    console.log(newPrice);
    console.log(socket.data?.remainingPurse);
    newPrice = newPrice.toString();
    setBaseprice(newPrice);
    setTeamName(team);
    socket.emit("placeBid", { newPrice, teamName: team,auctionCode });
    }
  };

  const fetchsquad = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auction/fetchsquad/${team}/${auctionCode}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  };
  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: fetchsquad,
    onSuccess: (data) => {
      setsquad(data);
      setPlayersFetched(true);
    },
    onError: (error) => {
      console.error("Error fetching players:", error.message);
    },
  });

  const fetchRemainingPurse = async () => {
    const res = await fetch(`${API_BASE_URL}/api/auction/remainingpurse/${team}/${auctionCode}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch remaining purse");
    const data = await res.json();
    console.log(data.remainingPurse);
    setRemainingPurse(data.remainingPurse);
  };
  
  return (
    <>
        <div className="dropdown-containerul">
              <button
                className="dropdown-btnul"
                onClick={() => mutate()}
                disabled={isLoading || playersFetched}
              >
                {isLoading ? <LoadingSpinner size="sm" /> : playersFetched ? "Players Loaded" : "Show Players"}
                {isError && <p className="error-msg">{error.message}</p>}
              </button>
              {playersFetched && (
                <div className="dropdown-contentul">
                  {squad.length === 0 ? <p>No Players Available</p> : 
                    squad.map((player) => (
                      <p key={player.id}>{player.name}</p>
                    ))
                  }
                </div>
              )}
            </div>

      {/* Section Container */}
      <div className="section-containerul">
        {/* Timer */}
        <div className="timer">{timeLeft} s</div>

        {/* Data Boxes */}
        <div id="box1" className="data-boxul">{playername ? `${playername}`: ""}</div>
        <div id="box2" className="data-boxul">{teamName ? `${teamName}`:""}</div>
        <div id="box3" className="data-boxul">{baseprice ? `${baseprice}` : ""}</div>

        {/* Bid Button */}
        <button className="bid-buttonul"onClick={handleBid} disabled={isBiddingDisabled}>Bid</button>
      </div>
      <div className="remaining-purse">Remaining purse: {remainingPurse}</div>
    </>
  );
}

export default Successpage;