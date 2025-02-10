import express from "express";
import { createAuction,playerdetails, teamDetails,getPlayersByAuction } from "../controller/Auctionmanage.js";
import { protectRoute } from "../middleware/protectroute.js";
const router = express.Router();
router.post("/Auctiondetails", protectRoute, createAuction);
router.post("/Players", protectRoute, playerdetails);
router.post("/Teams", protectRoute,teamDetails);
router.get("/fetchPlayers/:auctionCode", protectRoute, getPlayersByAuction);
export default router