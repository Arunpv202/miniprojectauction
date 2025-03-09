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

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("createAuction", async ({ auctionCode }) => {
    try {
      socket.join(auctionCode);
      console.log(`Admin created room: ${auctionCode}`);

      await Auction.update({ socketid: socket.id }, { where: { code: auctionCode } });

      console.log(`Admin for ${auctionCode} is now socket ${socket.id}`);
    } catch (error) {
      console.error("Error creating auction:", error);
    }
  });

  socket.on("joinAuction", async ({ teamName, auctionCode }) => {
    try {
      console.log(`${teamName} joining room: ${auctionCode}`);
      socket.join(auctionCode);
      console.log(`${teamName} joined room: ${auctionCode}`);

      const team = await Team.findOne({ where: { auctionCode, teamName } });
      if (!team) {
        console.error("Team not found");
        return;
      }

      socket.data.remainingPurse = team.remainingPurse;
      socket.data.auctionCode = auctionCode;
      socket.data.teamName = teamName;

      console.log("Remaining purse:", socket.data.remainingPurse);

      const auction = await Auction.findOne({ where: { code: auctionCode } });
      if (!auction || !auction.socketid) return;

      const teams = await sequelize.query(
        "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NOT NULL",
        {
          replacements: [auctionCode],
          type: sequelize.QueryTypes.SELECT,
        }
      );

      socket.to(auction.socketid).emit("updateTeams", { teams });
    } catch (error) {
      console.error("Error joining auction:", error);
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

  socket.on("placeBid", async ({ newPrice }) => {
    try {
      if (parseInt(newPrice) > socket.data.remainingPurse) {
        console.error("Insufficient funds");
        return;
      }

      socket.to(socket.data.auctionCode).emit("newBid", { newPrice, teamName: socket.data.teamName });
    } catch (error) {
      console.error("Error placing bid:", error);
    }
  });

  socket.on("playersold", async ({ playerno, baseprice, playername, teamName }) => {
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
        let changeprice = socket.data.remainingPurse - parseInt(baseprice);
        socket.data.remainingPurse = changeprice;

        await Player.update({ teamPurchased: teamName }, { where: { id: playerno } });
        await Team.update({ remainingPurse: changeprice }, { where: { auctionCode: socket.data.auctionCode, teamName } });
      }

      io.to(socket.data.auctionCode).emit("nextPlayer", { playerno, baseprice, playername, teamName });
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
  socket.on("disconnect", async () => {
    try {
      console.log(`User disconnected: ${socket.id}`);

      const auction = await Auction.findOne({ where: { socketid: socket.id } });

      if (auction) {
        console.log(`Admin for auction ${auction.code} disconnected.`);
        await Auction.update({ socketid: null }, { where: { code: auction.code } });
        console.log(`Cleared socket ID for auction ${auction.code}`);
        return;
      }

      if (socket.data?.teamName && socket.data?.auctionCode) {
        console.log(`Team ${socket.data.teamName} disconnected from auction ${socket.data.auctionCode}`);

        await Team.update(
          { teamName: null },
          { where: { auctionCode: socket.data.auctionCode, teamName: socket.data.teamName } }
        );

        console.log(`Removed team ${socket.data.teamName} from auction ${socket.data.auctionCode}`);

        const updatedTeams = await sequelize.query(
          "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NOT NULL",
          {
            replacements: [socket.data.auctionCode],
            type: sequelize.QueryTypes.SELECT,
          }
        );

        const updatedAuction = await Auction.findOne({ where: { code: socket.data.auctionCode } });
        if (updatedAuction && updatedAuction.socketid) {
          io.to(updatedAuction.socketid).emit("updateTeams", { teams: updatedTeams });
        }
      }
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

export { io, app, server };
