import { DataTypes } from "sequelize";
import {sequelize} from "../db/db.js";

const Team = sequelize.define("Team", {
  teamName: { 
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  auctionCode: {
    type: DataTypes.STRING,
    allowNull: false, // Link to auction
  },
  allocatedPurse: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  remainingPurse: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  
},{
    timestamps: true,
});
Team.sync({ force: true }) // Set `force: true` to drop and recreate the table (use with caution)
  .then(() => {
    console.log("Auction table created or already exists.");
  })
  .catch((error) => {
    console.error("Unable to create Auction table:", error);
  });

export default Team;