import express from 'express';
import {
    createBooking,
    getBookings,
    updateBooking,
    deleteBooking,
    getByIdBookings,
    getById_BookingUser,
    getBookingToday,
    getAvailableTimeSlots
} from "../controllers/booking.Controller.js";
import { protect ,authorizeRoles} from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/book", protect, createBooking);
router.get("/getbook", protect, getBookings);
router.put("/updatebooking/:id", protect, authorizeRoles("admin"), updateBooking);
//router.patch("/:id", PATCHBooking);
router.delete("/deletebooking/:id", protect, authorizeRoles("admin"), deleteBooking);
router.get("/getbyidbooked/:id", protect, getByIdBookings);
router.get("/getbyidbookinguser", protect, getById_BookingUser);
router.get("/today", protect, getBookingToday);
router.post("/available-timeslots", getAvailableTimeSlots);

export default router;