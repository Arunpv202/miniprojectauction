import User from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import { Sequelize } from "sequelize";

export const signup = async (req, res) => {
	try {
	  const { fullName, username, password, email } = req.body; 
	  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
	  if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	  }
	  const [existingUser] = await User.sequelize.query(
		"SELECT * FROM Users WHERE username = ? LIMIT 1", {
		  replacements: [username],
		  type: Sequelize.QueryTypes.SELECT,
	  });
  
	  if (existingUser) {
		return res.status(400).json({ error: "Username already taken" });
	  }
	  if (password.length < 6) {
		return res.status(400).json({ error: "Password must be at least 6 characters long" });
	  }
	  
	  const salt = await bcrypt.genSalt(10);
	  const hashedPassword = await bcrypt.hash(password, salt);

	  const [newUser] = await User.sequelize.query(
		"INSERT INTO Users (fullName, username, password, email, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())", {
		  replacements: [fullName, username, hashedPassword, email],
		  type: Sequelize.QueryTypes.INSERT,
	  });
  
	  res.status(201).json({
		id: newUser,
		fullName,
		username,
		email,
	  });
	} catch (error) {
	  console.log("Error in signup controller", error);
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
  