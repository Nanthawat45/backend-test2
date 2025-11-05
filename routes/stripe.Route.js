import express from "express";
//import { createPaymentIntent, handleWebhook, getBookingBySession } from "../controllers/stripe.controller.js";
import { createCheckoutFromDetails, getBookingBySession, handleWebhook } from "../controllers/stripe.controller.js";
import { protect } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);
//stripe listen --forward-to localhost:5000/api/stripe/webhook

// สร้าง PaymentIntent (สำหรับ user ปกติ)
//router.post("/create-payment-intent", protect, createPaymentIntent);
router.post("/create-checkout", express.json(), protect, createCheckoutFromDetails);
// Stripe Webhook (สำคัญ! ต้อง express.raw สำหรับ signature verification)

// ดึง booking ด้วย sessionId (Step5)
router.get("/by-session/:session_id", protect, getBookingBySession);
export default router;
