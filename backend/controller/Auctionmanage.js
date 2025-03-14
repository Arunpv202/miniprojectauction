import e from "express";
import {sequelize} from "../db/db.js";
import Auction from "../models/Auctiontable.js";
import Player from "../models/player.js";
import Team from "../models/team.js";

export const createAuction = async (req, res) => {
  try {
    const { name, code, teamCount } = req.body;

    if (!name || !code || !teamCount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if an auction with the same code already exists
    const existingAuction = await sequelize.query(
      "SELECT id FROM Auctions WHERE code = ? LIMIT 1",
      {
        replacements: [code],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingAuction.length > 0) {
      return res.status(400).json({ error: "Auction with this code already exists" });
    }

    // Insert new auction if code is unique
    const auction = await sequelize.query(
      "INSERT INTO Auctions (started,socketid,name, code, teamCount,createdAt, updatedAt) VALUES (false,null,?, ?, ?,NOW(), NOW())",
      {
        replacements: [name, code, teamCount],
        type: sequelize.QueryTypes.INSERT,
      }
    );
    const result = await sequelize.query(
        "SELECT id, name, code, teamCount FROM Auctions WHERE id = LAST_INSERT_ID()",
        {
          type: sequelize.QueryTypes.SELECT,
        }
      );
    res.status(201).json({ message: "Auction created successfully",auction:result[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const playerdetails = async (req, res) => {
  try {
    const { name, basePrice,auctionCode} = req.body;
    if (!name || !basePrice) {
      return res.status(400).json({ error: "Player name and base price are required" });
    }
    const player = await Player.create({
      name,
      basePrice,
      teamPurchased:null,
      auctionCode,
    });
    res.status(201).json({ message: "Player added successfully", player });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const teamDetails = async (req, res) => {
  try {
    const { allocatedPurse,bidincrement,auctionCode} = req.body;
    console.log(allocatedPurse,bidincrement);
    if(bidincrement<1){
      return res.status(400).json({ error: "Insufficient Bidding" });
    }
    //finding any player in players table
    const player = await Player.findOne({
      where: {
        auctionCode: auctionCode,
      },
    });
    console.log("added players",player);
    if (!player) {
      return res.status(400).json({ error: "minimum one player needed" });
    }
    await sequelize.query(
      "Update Auctions set bidincrement=? where code=?",
      {
        replacements: [bidincrement,auctionCode],
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    const numberOfTeams = await sequelize.query("SELECT teamCount FROM Auctions WHERE code = ? LIMIT 1",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log(numberOfTeams);
    console.log(numberOfTeams[0].teamCount);
    const noteam=numberOfTeams[0].teamCount;
    // Create teams based on the number of teams in the auction
    const teams = [];
    for (let i = 0; i < noteam; i++) {
      const team = await Team.create({
        teamName: null, // Teams start with null name
        allocatedPurse,
        remainingPurse: allocatedPurse, // Initially, the remaining purse is the same as allocated
        auctionCode,
      });
      // Fetch the newly created team with its data
      teams.push(team);
    }

    res.status(201).json({ message: "Teams added successfully", teams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const getPlayersByAuction = async (req, res) => {
  try {
    const { auctionCode } = req.params;
    console.log(auctionCode);

    const players = await sequelize.query(
      "SELECT id, name, basePrice  FROM Players WHERE auctionCode = ?",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log(players);
    console.log(players[0].name);
    res.status(200).json(players);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const updateTeamName = async (req, res) => {
  try {
    const { teamName, auctionCode, AuctionName } = req.body;
    console.log(teamName, auctionCode, AuctionName);

    if (!teamName || !auctionCode) {
      return res.status(400).json({ error: "Team name and auction code are required" });
    }
  
    const existingAuction = await sequelize.query(
      "SELECT id FROM Auctions WHERE code = ? LIMIT 1",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingAuction.length === 0) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Check if the team name already exists in the auction
    const existingTeam = await sequelize.query(
      "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName = ? LIMIT 1",
      {
        replacements: [auctionCode, teamName],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (existingTeam.length > 0) {
      return res.status(400).json({ error: "Team name already exists" });
    }

    // Check if there are available slots for teams
    const availableTeam = await sequelize.query(
      "SELECT teamName FROM Teams WHERE auctionCode = ? AND teamName IS NULL LIMIT 1",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );

    if (availableTeam.length === 0) {
      return res.status(400).json({ error: "Wait for the admin to start" });
    }

    const auctionstarted = await sequelize.query(
      "SELECT started FROM Auctions WHERE code = ? LIMIT 1",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log(auctionstarted);
    if(auctionstarted[0].started===1){
      return res.status(400).json({ error: "Auction already started" });
    }

    // Update the first available team
    const result = await sequelize.query(
      "UPDATE Teams SET teamName = ? WHERE auctionCode = ? AND teamName IS NULL LIMIT 1",
      {
        replacements: [teamName, auctionCode],
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    console.log(result);

    res.status(200).json({ message: "Team name updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

export const fetchsquad = async (req, res) => {
  try {
    const { team,auctionCode } = req.params;
    console.log(team,auctionCode);
    const squad = await sequelize.query(
      "SELECT name FROM Players WHERE teamPurchased = ? AND auctionCode = ?",
      {
        replacements: [team,auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log(squad);
    res.status(200).json(squad);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
export const fetchRemainingPurse = async (req, res) => {
  try {
    const { team, auctionCode } = req.params;
    console.log(team,auctionCode);
    const remainingPurse = await sequelize.query(
      "SELECT remainingPurse FROM Teams WHERE teamName = ? AND auctionCode = ?",
      {
        replacements: [team, auctionCode],
        type: sequelize.QueryTypes.SELECT,
      }
    );
    console.log(remainingPurse);
    res.status(200).json(remainingPurse[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
export const Auctionstarted = async (req, res) => {
  try {
    const { auctionCode } = req.params;
    console.log(auctionCode);
    const result = await sequelize.query(
      "UPDATE Auctions SET started = true WHERE code = ?",
      {
        replacements: [auctionCode],
        type: sequelize.QueryTypes.UPDATE,
      }
    );
    console.log(result);
    res.status(200).json({ message: "Auction started successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}