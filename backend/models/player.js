import { DataTypes } from "sequelize";
import {sequelize} from "../db/db.js";

const Player = sequelize.define("Player", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  basePrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  teamPurchased: {
    type: DataTypes.STRING, // Nullable until auction happens
    allowNull: true,
  },
  auctionCode: {
    type: DataTypes.STRING,
    allowNull: false, // Must be linked to an auction
  },
  
},{
	timestamps: true,
});
Player.sync({ force: true }) // Set `force: true` to drop and recreate the table (use with caution)
  .then(() => {
    console.log("player table created or already exists.");
  })
  .catch((error) => {
    console.error("Unable to create Auction table:", error);
  });

export default Player;
