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
app.use(cors());
app.use(cookieParser());
app.use("/api/auth", authroutes);
app.use("/api/auction", Auctiondetails);

const PORT = process.env.PORT || 8200;

server.listen(PORT,()=>{
    console.log(`server running on port  ${PORT}`)
    connectMySQL();
})