import { DataTypes } from "sequelize";
import {sequelize} from "../db/db.js"; // Adjust based on your project structure

const Auction = sequelize.define("Auction", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,  // This makes the id auto-increment
  },
  started: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  }, 
  socketid: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(6),
    allowNull: false,
    validate: {
      len: [6, 6], // Ensures exactly 6 characters
    },
  },
  teamCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1, // Ensures at least 1 team
    },
  },
  bidincrement: {
    type: DataTypes.INTEGER,
    default:null,
  },
},{
  timestamp: true,
});
Auction.sync({ force:true}) // Set `force: true` to drop and recreate the table (use with caution)
  .then(() => {
    console.log("Auction table created or already exists.");
  })
  .catch((error) => {
    console.error("Unable to create Auction table:", error);
  });
export default Auction;