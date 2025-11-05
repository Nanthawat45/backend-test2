import express from "express"

import {
    startRound,
    markCaddyAsAvailable,
    endRound,
    cancelDuringRound,
    cancelStart,
    getCaddyAvailable,
    getCaddyBooking
}from "../controllers/caddy.Controller.js"

import { protect, authorizeRoles} from '../middleware/auth.Middleware.js';

const router = express.Router();

router.put("/start/:bookingId", protect, authorizeRoles("caddy"), startRound);
router.put("/end/:bookingId", protect, authorizeRoles("caddy"), endRound);
router.put("/available/:bookingId", protect, authorizeRoles("caddy"), markCaddyAsAvailable);
router.put("/cancel-start/:bookingId", protect, authorizeRoles("caddy"), cancelStart);
router.put("/cancel-during-round/:bookingId", protect, authorizeRoles("caddy"), cancelDuringRound);

router.post("/available-caddies", protect, getCaddyAvailable);
router.get("/caddybooking", protect, authorizeRoles("caddy"), getCaddyBooking);
export default router;