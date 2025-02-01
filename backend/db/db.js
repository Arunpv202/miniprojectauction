import Sequelize from "sequelize";
import dotenv from "dotenv"
dotenv.config();

const sequelize = new Sequelize(
	process.env.DB_NAME, // Database name
	process.env.DB_USER, // Database username
	process.env.DB_PASSWORD, // Database password
	{
		host: process.env.DB_HOST, // Database host
		port: process.env.DB_PORT || 10253, // Database port (fallback to 10253 if not provided)
		dialect: "mysql", // Database dialect
		logging: false, // Disable logging (optional)
	}
);



const connectMySQL = async () => {
	try {
		await sequelize.authenticate({force:false});
		console.log("Connected to MySQL successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

export { sequelize, connectMySQL };