import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { Sequelize } from "sequelize";

export const signup = async (req, res) => {
	try {
	  const { fullname, username, password, email } = req.body;
  
	  // Log the request body for debugging
	  console.log("Request body:", req.body);
  
	  // Validate email format
	  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	  if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	  }
  
	  // Check if username is already taken
	  let existingUser;
	  try {
		[existingUser] = await User.sequelize.query(
		  "SELECT * FROM Users WHERE username = ? LIMIT 1", {
			replacements: [username], // Ensure this is correct
			type: Sequelize.QueryTypes.SELECT,
		});
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
	  let newUser;
	  try {
		[newUser] = await User.sequelize.query(
		  "INSERT INTO Users (fullName, username, password, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())", {
			replacements: [fullname, username, hashedPassword, email], // Ensure this matches the placeholders
			type: Sequelize.QueryTypes.INSERT,
		});
	  } catch (error) {
		console.error("Database query error:", error);
		return res.status(500).json({ error: "Internal Server Error" });
	  }
  
	  // Retrieve the inserted user's ID using a separate query
	  const userId = await User.sequelize.query("SELECT LAST_INSERT_ID() AS id;", {
		type: Sequelize.QueryTypes.SELECT,
	  });
  
	
  
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
		"SELECT username, fullName, password, email FROM Users WHERE username = ? LIMIT 1", {
		  replacements: [username],
		  type: Sequelize.QueryTypes.SELECT,
	  });
  
	  if (!user) {
		return res.status(400).json({ error: "Invalid username or password" });
	  }
  
	  const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
  
	  if (!isPasswordCorrect) {
		return res.status(400).json({ error: "Invalid username or password" });
	  }

	  res.status(200).json({
		username: user.username,
		fullName: user.fullName,
		email: user.email,
	  });
	} catch (error) {
	  console.log("Error in login controller", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  };
  