import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { Sequelize } from "sequelize";
import { sequelize } from "../db/db.js";
import { generateTokenAndSetCookie } from "../lib/generatetokens.js";

export const signup = async (req, res) => {
	try {
		const { fullname, username, password, email } = req.body;

		// Debugging logs
		console.log("Received data:", { fullname, username, password, email });

		// Validate required fields
		if (!fullname || !username || !password || !email) {
			return res.status(400).json({ error: "All fields are required" });
		}

		// Validate email format
		const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if username is already taken
		let existingUser;
		try {
			[existingUser] = await User.sequelize.query(
				"SELECT * FROM Users WHERE username = ? LIMIT 1",
				{
					replacements: [username],
					type: Sequelize.QueryTypes.SELECT,
				}
			);
		} catch (error) {
			console.error("Database query error:", error);
			return res.status(500).json({ error: "Internal Server Error" });
		}

		if (existingUser) {
			return res.status(400).json({ error: "Username already taken" });
		}

		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		// Hash the password
		const hashfun = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, hashfun);

		// Insert new user into the database
		try {
			await User.sequelize.query(
				"INSERT INTO Users (fullName, username, password, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())",
				{
					replacements: [fullname, username, hashedPassword, email],
					type: Sequelize.QueryTypes.INSERT,
				}
			);
		} catch (error) {
			console.error("Database insert error:", error);
			return res.status(500).json({ error: "Internal Server Error" });
		}

		// Retrieve the inserted user's ID
		const userId = await User.sequelize.query("SELECT LAST_INSERT_ID() AS id;", {
			type: Sequelize.QueryTypes.SELECT,
		});

		// Debugging log
		console.log("Inserted user ID:", userId);

		// Ensure userId exists before using it
		if (!userId[0].id) {
			return res.status(500).json({ error: "User creation failed" });
		}

		// Generate token and set cookie
		generateTokenAndSetCookie(userId[0].id, res);

		// Send success response
		res.status(201).json({
			id: userId[0].id,
			fullname,
			username,
			email,
		});
	} catch (error) {
		console.error("Error in signup controller:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};


  
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		const [user] = await User.sequelize.query(
			"SELECT id, username, fullName, password, email FROM Users WHERE username = ? LIMIT 1",
			{
				replacements: [username],
				type: Sequelize.QueryTypes.SELECT,
			}
		);

		if (!user) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		const isPasswordCorrect = await bcrypt.compare(password, user.password || "");

		if (!isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		// Generate token and set cookie using user ID
		generateTokenAndSetCookie(user.id, res);

		res.status(200).json({
			id: user.id,
			username: user.username,
			fullName: user.fullName,
			email: user.email,
		});
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
export const logout = async (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error in logout controller:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
 // Assuming you're using jwt for authentication
 export const getMe = async (req, res) => {
	try {
	  const userId = req.user.id; // Extract user ID from `req.user` (set in `protectRoute`)
  
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
  
	  res.status(200).json(user[0]);
	} catch (error) {
	  console.error("Error in getMe controller:", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  };
  
