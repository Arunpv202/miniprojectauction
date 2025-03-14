
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import socket from "../store/socketglobal.jsx";
import { useAuthStore } from "../store/global-store";
import LoadingSpinner from "../components/common/LoadingSpinner";
import "../styles/Adminlast.css";
import { useNavigate } from "react-router-dom";

const Adminlast = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [playername, setPlayername] = useState("");
  const [baseprice, setBaseprice] = useState("");
  const [bidincrement, setBidincrement] = useState("");
  const [playerno, setPlayerno] = useState("");
  const [cteamName, setcTeamName] = useState("");
  const [playersFetched, setPlayersFetched] = useState(false);
  const [playersRemoved, setPlayersRemoved] = useState(false);
  const [ispicking, setIspicking] = useState(false);
  const auctionCode = useAuthStore((state) => state.auctionCode);

  useEffect(() => {
    socket.on("playertobid", ({ playerId, name, basePrice, bidincrement }) => {
      setPlayername(name);
      setBaseprice(basePrice);
      setcTeamName("");
      setBidincrement(bidincrement);
      setPlayerno(playerId);
      setIspicking(true);
    });
    socket.on("newBid", ({ newPrice,teamName }) => {
      console.log(`New bid: ${newPrice} by ${teamName}`);
      setBaseprice(newPrice);
      setcTeamName(teamName);
      console.log(cteamName);
      setIspicking(true); // Re-enable button when another user bids
    });

    socket.on("nextPlayer", ({ playerno,baseprice,playername,teamName}) => {
      console.log("Next player");
      if(teamName==="") {
        console.log(playername,playerno);
        setPlayername("Unsold");
        setBaseprice(baseprice);
        setPlayerno("");
        setcTeamName(teamName);
        setIspicking(false);
      }
      else{
        console.log(playername,playerno);
        setPlayername("Sold");
        setBaseprice(baseprice);
        setPlayerno("");
        setcTeamName(teamName);
        setIspicking(false);
      }
    });
      socket.on("auctionfinished", () => {
        socket.disconnect();
      navigate("/Rolechoose");
      });

    return () => {
      socket.off("nextPlayer");
      socket.off("auctionfinished");
      socket.off("playertobid");
      socket.off("newBid");
    }
  }, []);

  const fetchPlayers = async () => {
    const res = await fetch(`/api/auction/fetchPlayers/${auctionCode}`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch players");
    return res.json();
  };

  const { mutate, isLoading, isError, error } = useMutation({
    mutationFn: fetchPlayers,
    onSuccess: (data) => {
      setPlayers(data);
      setPlayersFetched(true);
      setPlayersRemoved(false);
    },
    onError: (error) => {
      console.error("Error fetching players:", error.message);
    },
  });

  const handleInputChange = (e) => {
    setSelectedPlayerId(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const player = players.find((p) => p.id.toString() === selectedPlayerId);
    if (!player) {
      alert("Invalid Player ID");
      return;
    }

    socket.emit("pickPlayer", { 
      playerId: player.id, 
      name: player.name, 
      basePrice: player.basePrice, 
      auctionCode 
    });

    const updatedPlayers = players.filter((p) => p.id !== player.id);
    setPlayers(updatedPlayers);
    setSelectedPlayerId("");

    if (updatedPlayers.length === 0) {
      setPlayersRemoved(true);
    }
  };

  const endfunction = () => {
    socket.emit("endAuction", { auctionCode });
  };

  return (
    <div>
      <div className="dropdown-container3">
        <button
          className="dropdown-btn3"
          onClick={() => mutate()}
          disabled={isLoading || playersFetched || playersRemoved}
        >
          {isLoading ? <LoadingSpinner size="sm" /> : playersFetched ? "Players Loaded" : "Show Players"}
          {isError && <p className="error-msg">{error.message}</p>}
        </button>
        {playersFetched && (
          <div className="dropdown-content3">
            {players.length === 0 ? <p>No Players Available</p> : 
              players.map((player) => (
                <p key={player.id}>{player.name} - ${player.basePrice} (ID: {player.id})</p>
              ))
            }
          </div>
        )}
      </div>

      <div className="end-button-container3">
        <button className="end-button3" onClick={()=>endfunction()}>End</button>
      </div>

      <div className="boxes-wrapper3">
        <div id="box1" className="data-box">
          {playername ? `${playername}` : ""}
        </div>
        <div className="horizontal-boxes3">
          <div id="box2" className="data-box">{cteamName ? cteamName:""}</div>
          <div id="box3" className="data-box">
            {baseprice ? `${baseprice}` : ""}
          </div>
        </div>
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            <input type="text" name="playerId" placeholder="Player Id"
              value={selectedPlayerId} onChange={handleInputChange} required />
            <button type="submit" disabled={ispicking}>Pick Player</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Adminlast;
