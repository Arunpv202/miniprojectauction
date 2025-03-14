
import { Server } from "socket.io";
import http from "http";
import express from "express";
import { sequelize } from "../db/db.js";
import Auction from "../models/Auctiontable.js";
import Team from "../models/team.js";
import Player from "../models/player.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
const auctionTeams = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createAuction", async ({ auctionCode }) => {
    try {
      socket.join(auctionCode);
      console.log(`Admin created room: ${auctionCode}`);
      if (!auctionTeams[auctionCode]) {
        auctionTeams[auctionCode] = {};
        console.log(`Created team list for auction ${auctionCode}  ${auctionTeams[auctionCode]}`);
      }

      auctionTeams[auctionCode]["admin"] = socket.id;
      await Auction.update({ socketid: socket.id }, { where: { code: auctionCode } });

      console.log(`Admin for ${auctionCode} is now socket ${socket.id}`);
    } catch (error) {
      console.error("Error creating auction:", error);
    }
  });

  socket.on("joinAuction", async ({teamName, auctionCode,AuctionName ,username}) => {
   try{
    console.log(`Team ${teamName} joined auction ${auctionCode} for ${AuctionName} by ${username}`);
    const existingauction= await Auction.findOne({ where: { code: auctionCode } });
    if(!existingauction){
      socket.emit("auctionerror", { message: "Auction not found" });
      return;
    }
    const availableTeam = await sequelize.query(
      "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NULL LIMIT 1",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if(availableTeam.length === 0){
      socket.emit("auctionerror", { message: "wait admin to start" });
      return;
    }
    const auctionstarted = await sequelize.query(
      "SELECT started FROM Auctions WHERE code = ? LIMIT 1",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if(auctionstarted[0].started){
      socket.emit("auctionerror", { message: "Auction already started" });
      return;
    }
    const existingTeam = await sequelize.query(
      "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName = ? LIMIT 1",
      {
        replacements: [auctionCode, teamName],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    if(existingTeam.length > 0){
      socket.emit("auctionerror", { message: "Team name already exists" });
      return;
    }
    if(!auctionTeams[auctionCode]){
      auctionTeams[auctionCode] = {};
      console.log(`Created team list for auction ${auctionCode}  ${auctionTeams[auctionCode]}`);
    }
    auctionTeams[auctionCode][teamName] = socket.id;
    io.to(auctionTeams[auctionCode]["admin"]).emit("Teamrequest", { teamName ,username, auctionCode });

   }
   catch (error) {
    console.error("Error joining auction:", error);
   }
  });

  socket.on("teamapproved", async ({ teamName, auctionCode }) => {
    try {
      console.log(`Team ${teamName} approved for auction ${auctionCode}`);

      const availableTeam = await Team.findOne({ where: { auctionCode, teamName: null } });
      if (!availableTeam) {
        console.log(`No available slots for team ${teamName} in auction ${auctionCode}`);
        io.to(auctionTeams[auctionCode][teamName]).emit("auctionerror",{message:"auction full"});
        return;
      }
      await Team.update(
        { teamName }, 
        { where: { teamId:availableTeam.teamId } }  // Only update the specific team
      );
      socket.data.teamName=teamName;
      socket.data.auctionCode=auctionCode;
      console.log("team and its socket data",socket.data.auctionCode,socket.data.teamName)
      const teamSocket = io.sockets.sockets.get(auctionTeams[auctionCode][teamName]);
      if (teamSocket) {
        teamSocket.join(auctionCode);
        console.log("team joined room")
      } else {
        console.error(`Socket instance for team ${teamName} not found.`);
      }
      const updatedTeams = await sequelize.query(
        "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NOT NULL",
        {
          replacements: [auctionCode],
          type: sequelize.QueryTypes.SELECT,
        }
      );
      console.log(`Updated teams: ${updatedTeams}`);
      io.to(auctionTeams[auctionCode][teamName]).emit("teamapproved",{teamName,auctionCode});
      io.to(auctionTeams[auctionCode]["admin"]).emit("updateTeams", { teams: updatedTeams });
      
    } catch (error) {
      console.error("Error approving team:", error);
    }
  })

  socket.on("teamrejected", async ({ teamName, auctionCode }) => {
    try {
      console.log(`Team ${teamName} rejected for auction ${auctionCode}`);
      io.to(auctionTeams[auctionCode][teamName]).emit("auctionerror", { message: "Your Request Has Been Rejected By Admin" });
      delete auctionTeams[auctionCode][teamName];
      const updatedTeams = await sequelize.query(
        "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NOT NULL",
        {
          replacements: [auctionCode],
          type: sequelize.QueryTypes.SELECT,
        }
      );
      socket.data.teamName=teamName;
      socket.data.auctionCode=auctionCode;
      console.log("team and its socket data",socket.data.auctionCode,socket.data.teamName)
      console.log(`Updated teams: ${updatedTeams}`);
      io.to(auctionTeams[auctionCode]["admin"]).emit("updateTeams", { teams: updatedTeams });
    }
    catch (error) {
      console.error("Error rejecting team:", error);
    }
  });

  socket.on("pickPlayer", async ({ playerId, name, basePrice, auctionCode }) => {
    try {
      console.log(`Player ${name} picked by ${auctionCode} for ${basePrice}`);
      const auction = await Auction.findOne({ where: { code: auctionCode } });
      if (!auction) {
        console.error("Auction not found");
        return;
      }

      const player = await Player.findOne({ where: { id: playerId, teamPurchased: null } });
      if (!player) {
        console.error("Player not available");
        return;
      }

      io.to(auctionCode).emit("playertobid", { playerId, name, basePrice, bidincrement: auction.bidincrement });
    } catch (error) {
      console.error("Error picking player:", error);
    }
  });

  socket.on("placeBid", async ({ newPrice ,teamName,auctionCode}) => {
    try {
      console.log(`New bid: ${newPrice} by ${teamName}`);
      const crntteam = await Team.findOne({ where: {auctionCode, teamName } });

      if (!crntteam) {
        console.error("Team not found"); 
        return;
      }
      if (parseInt(newPrice) > crntteam.remainingPurse) {
        console.error("Insufficient funds");
        return;
      }

      socket.to(auctionCode).emit("newBid", { newPrice, teamName });
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  });

  socket.on("playersold", async ({ playerno, baseprice, playername, teamName,auctionCode }) => {
    try {
      console.log(`Player ${playername} sold to ${teamName} for ${baseprice}`);

      const player = await Player.findOne({ where: { id: playerno } });
      if (!player) {
        console.error("Player not found");
        return;
      }

      if (teamName === "") {
        await Player.update({ teamPurchased: "unsold" }, { where: { id: playerno } });
      } else {
        const teampurchased = await Team.findOne({ where: { auctionCode, teamName } });
        if (!teampurchased) { 
          console.error("Team not found");
          return;
        }
        let changeprice = teampurchased.remainingPurse - parseInt(baseprice);

        await Player.update({ teamPurchased: teamName }, { where: { id: playerno } });
        await Team.update({ remainingPurse: changeprice }, { where: { auctionCode:auctionCode, teamName } });
      }

      io.to(auctionCode).emit("nextPlayer", { playerno, baseprice, playername, teamName });
    } catch (error) {
      console.error("Error finalizing player sale:", error);
    }
  });
  socket.on("endAuction", async ({ auctionCode }) => {
    try {
      console.log(`Auction ${auctionCode} ended`);

      const auction = await Auction.findOne({ where: { code: auctionCode } });
      if (!auction) {
        console.error("Auction not found");
        return;
      }
      await sequelize.query("DELETE FROM Auctions WHERE code = ?", {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.DELETE,
      });
      
      await sequelize.query("DELETE FROM Teams WHERE auctionCode = ?", {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.DELETE,
      });
      
      await sequelize.query("DELETE FROM Players WHERE auctionCode = ?", {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.DELETE,
      });
      

      io.to(auctionCode).emit("auctionfinished");  
    } catch (error) {
      console.error("Error ending auction:", error);
    }
  });
  socket.on("teamdetails",async({teams,auctionCode})=>{
    console.log("teams to pass",teams,auctionCode);
    io.to(auctionCode).emit("teamdetaills",{teamparticipating:teams});
  })
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.id}`);

      const auction = await Auction.findOne({ where: { socketid: socket.id } });

      if (auction) {
        console.log(`Admin for auction ${auction.code} disconnected.`);
        await Auction.update({ socketid: null }, { where: { code: auction.code } });
        console.log(`Cleared socket ID for auction ${auction.code}`);
        delete auctionTeams[auction.code];
        console.log(`Deleted team list for auction ${auction.code}`);
        return;
      }
      let teamName = null;
        let auctionCode = null;

        // Find team using socket ID
        for (const code in auctionTeams) {
            for (const team in auctionTeams[code]) {
                if (auctionTeams[code][team] === socket.id) {
                    teamName = team;
                    auctionCode = code;
                    break;
                }
            }
            if (teamName) break;
        }

        if (teamName && auctionCode) {
            console.log(`Team ${teamName} disconnected from auction ${auctionCode}`);

            await Team.update(
                { teamName: null },
                { where: { auctionCode, teamName } }
            );

            console.log(`Removed team ${teamName} from auction ${auctionCode}`);
            delete auctionTeams[auctionCode][teamName];

            // Fetch updated teams list
            const updatedTeams = await sequelize.query(
                "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NOT NULL",
                {
                    replacements: [auctionCode],
                    type: sequelize.QueryTypes.SELECT,
                }
            );

            // Notify admin if still connected
            const updatedAuction = await Auction.findOne({ where: { code: auctionCode } });
            if (updatedAuction && updatedAuction.socketid) {
                io.to(updatedAuction.socketid).emit("updateTeams", { teams: updatedTeams });
            }
        } else {
            console.log(`No matching team found for disconnected socket ${socket.id}`);
        }
      
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

export { io, app, server };
