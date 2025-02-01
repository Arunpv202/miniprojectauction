import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import authroutes from "./routes/authroute.js"
import { connectMySQL } from "./db/db.js";
dotenv.config();
console.log(process.env.PORT)
const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());
app.use("/api/auth", authroutes);

const PORT = process.env.PORT || 8000;

app.listen(PORT,()=>{
    console.log(`server running on port  ${PORT}`)
    connectMySQL();
})