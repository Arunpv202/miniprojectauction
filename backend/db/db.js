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

console.log({
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
  });

const connectMySQL = async () => {
	try {
		await sequelize.authenticate({force:false});
		console.log("Connected to MySQL successfully.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
	}
};

export { sequelize, connectMySQL };