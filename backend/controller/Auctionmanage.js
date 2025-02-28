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
      "INSERT INTO Auctions (name, code, teamCount,createdAt, updatedAt) VALUES (?, ?, ?,NOW(), NOW())",
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
      return res.status(400).json({ error: "Insufficient Bidding Poi Chaav" });
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