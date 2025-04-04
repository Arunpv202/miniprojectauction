import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser";
import authroutes from "./routes/authroute.js"
import Auctiondetails from "./routes/Auctiondetails.js"
import { connectMySQL } from "./db/db.js";
import {app,server} from "./lib/socket.js"
dotenv.config();
console.log(process.env.PORT)
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(
    cors({
      origin: ["http://localhost:3000", "https://ideal-essence-production.up.railway.app","*"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow only your frontend
      credentials: true, // Allow cookies/auth headers
    })
  );
app.use(cookieParser());
app.use("/api/auth", authroutes);
app.use("/api/auction", Auctiondetails);

const PORT = process.env.PORT || 8045;

server.listen(PORT,"0.0.0.0",()=>{
    console.log(`server running on port  ${PORT}`)
    connectMySQL();
})