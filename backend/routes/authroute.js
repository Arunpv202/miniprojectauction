import express from "express";
const router = express.Router();
import { protectRoute } from "../middleware/protectroute.js";
import { signup,login,logout,getMe } from "../controller/authcontroller.js";
router.post("/signup",signup)
router.post("/login",login)
router.post("/logout", logout);
router.get("/me", protectRoute, getMe);
export default router