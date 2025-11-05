import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Booking from "../models/Booking.js";
import { updateCaddyBooking } from "./caddy.Controller.js";
import mongoose from "mongoose";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: แทนที่ด้วยฟังก์ชันเช็คว่างจริงของคุณ
async function checkAvailability({ date, timeSlot, caddy = [], golfCartQty = 0, golfBagQty = 0 }) {
  // อย่างน้อย ๆ ให้ return ok:true ไปก่อน เพื่อให้ทดสอบ flow ได้
  return { ok: true };
}

export const createCheckoutFromDetails = async (req, res) => {
  try {
    const { courseType, date, timeSlot, players, groupName, 
      caddy = [], golfCartQty = 0, golfBagQty = 0, totalPrice 
    } = req.body;

    // 1) เช็คว่างก่อน
    const avail = await checkAvailability({ date, timeSlot, caddy, golfCartQty, golfBagQty });
    if (!avail.ok) {
      return res.status(409).json({ ok: false, message: "เวลานี้ไม่ว่าง", reason: avail.reason });
    }

    // 2) ว่าง -> สร้าง checkout session (ยังไม่บันทึก DB)
const session = await stripe.checkout.sessions.create({
  mode: "payment",
  payment_method_types: ["card"], // ✅ ใช้เฉพาะบัตร
  allow_promotion_codes: false,
  customer_creation: "if_required",
  success_url: `${process.env.FRONTEND_URL}/booking?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/booking?cancelled=1`,
  line_items: [{
    price_data: {
      currency: "thb",
      product_data: { name: `Booking ${courseType} holes @ ${timeSlot}` },
      unit_amount: Math.round(Number(totalPrice) * 100),
    },
    quantity: 1,
  }],
      metadata: {
        userId: req.user._id.toString(),
        courseType, date, timeSlot, players, groupName,
        caddy: JSON.stringify(caddy),
        golfCar: String(golfCartQty),
        golfBag: String(golfBagQty),
        totalPrice: String(totalPrice),
      },
    });

    return res.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("createCheckoutFromDetails error:", err);
    return res.status(500).json({ ok: false, message: "Cannot create checkout session" });
  }
};

// webhook: จ่ายสำเร็จ -> ค่อยบันทึกลง DB
export const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
 
  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const md = s.metadata || {};
    try {
      // 1) แปลง caddy (เป็น userId) → ObjectId
      const caddies = JSON.parse(md.caddy || "[]")
        .filter((id) => id && String(id).trim() !== "")
        .map((id) => new mongoose.Types.ObjectId(String(id)));
 
      // 2) สร้าง Booking
      const booking = await Booking.create({
        user: md.userId,
        courseType: md.courseType,
        date: new Date(md.date),
        timeSlot: md.timeSlot,
        players: Number(md.players || 1),
        groupName: md.groupName,
        caddy: caddies,               // เก็บ userIds ของแคดดี้ลง booking
        golfCar: Number(md.golfCar || 0),
        golfBag: Number(md.golfBag || 0),
        totalPrice: Number(md.totalPrice || 0),
        isPaid: true,
        status: "booked",
        stripeSessionId: s.id,
      });
 
      // 3) อัปเดตสถานะ caddy ใน collection caddies
      if (caddies.length > 0) {
        const r = await updateCaddyBooking(caddies, "booked");
        // console.log("🟢 updateCaddyBooking:", r);
      }
 
      console.log("✅ Booking created after payment:", booking._id);
    } catch (e) {
      console.error("Webhook save error:", e);
    }
  }
 
  res.json({ received: true });
};

export const getBookingBySession = async (req, res) => {
  const booking = await Booking.findOne({ stripeSessionId: req.params.sessionId });
  if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
  res.json({ success: true, booking });
};
