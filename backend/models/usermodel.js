import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";

const User = sequelize.define("User", {
	id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	fullName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			len: [6, 255],
		},
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: false,
		validate: {
			isEmail: true,
		},
	},
}, {
	timestamps: true,
});
User.sync({ force: false }) // Set `force: true` to drop and recreate the table (use with caution)
  .then(() => {
    console.log("Users table created or already exists.");
  })
  .catch((error) => {
    console.error("Unable to create Users table:", error);
  });

export default User;