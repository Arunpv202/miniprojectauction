import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sequelize } from "../db/db.js";

dotenv.config();

export const protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;
		if (!token) {
			return res.status(401).json({ error: "Unauthorized: No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized: Invalid Token" });
		}

		const userId = decoded.userId; // Use the `userId` from the token

		if (!userId) {
			return res.status(401).json({ error: "Unauthorized: No userId found in token" });
		}

		const user = await sequelize.query(
			"SELECT id, username, fullName, email FROM Users WHERE id = ? LIMIT 1",
			{
				replacements: [userId],
				type: sequelize.QueryTypes.SELECT,
			}
		);

		if (!user || user.length === 0) {
			return res.status(404).json({ error: "User not found" });
		}

		req.user = user[0]; // Get the first result (since LIMIT 1 is used)
		next();
	} catch (err) {
		console.log("Error in protectRoute middleware", err.message);
		return res.status(500).json({ error: "Internal Server Error" });
	}
};
