import express from "express";
import { createAuction,playerdetails, teamDetails,getPlayersByAuction,updateTeamName,fetchsquad,fetchRemainingPurse,Auctionstarted } from "../controller/Auctionmanage.js";
import { protectRoute } from "../middleware/protectroute.js";
const router = express.Router();
router.post("/Auctiondetails", protectRoute, createAuction);
router.post("/Players", protectRoute, playerdetails);
router.post("/Teams", protectRoute,teamDetails);
router.get("/fetchPlayers/:auctionCode", protectRoute, getPlayersByAuction);
router.post("/updateTeamName", protectRoute, updateTeamName);
router.get("/fetchsquad/:team/:auctionCode", protectRoute, fetchsquad);
router.get("/remainingpurse/:team/:auctionCode", protectRoute, fetchRemainingPurse);
router.get("/startAuction/:auctionCode", protectRoute, Auctionstarted);
export default router