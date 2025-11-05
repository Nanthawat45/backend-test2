import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import { updateCaddyBooking } from "./caddy.Controller.js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// TODO: แทนที่ด้วยฟังก์ชันเช็คว่างจริงของคุณ
async function checkAvailability({ date, timeSlot, caddy = [], golfCartQty = 0, golfBagQty = 0 }) {
  // อย่างน้อย ๆ ให้ return ok:true ไปก่อน เพื่อให้ทดสอบ flow ได้
  return { ok: true };
}

/**
 * POST /api/stripe/create-checkout
 * สร้าง Stripe Checkout Session (ยังไม่บันทึก DB)
 */
export const createCheckoutFromDetails = async (req, res) => {
  try {
    const {
      courseType,
      date,
      timeSlot,
      players,
      groupName,
      caddy = [],
      golfCartQty = 0,
      golfBagQty = 0,
      totalPrice,
    } = req.body;

    // 1) เช็คว่างก่อน
    const avail = await checkAvailability({ date, timeSlot, caddy, golfCartQty, golfBagQty });
    if (!avail.ok) {
      return res
        .status(409)
        .json({ ok: false, message: "เวลานี้ไม่ว่าง", reason: avail.reason });
    }

    // 2) ว่าง -> สร้าง checkout session (ยังไม่บันทึก DB)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"], // ✅ ใช้เฉพาะบัตร
      allow_promotion_codes: false,
      customer_creation: "if_required",

      // กลับหน้าสำเร็จ (ตามที่โอห์มใช้ได้แล้ว)
success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
cancel_url:  `${process.env.FRONTEND_URL}/booking?cancelled=1`,

      line_items: [
        {
          price_data: {
            currency: "thb",
            product_data: { name: `Booking ${courseType} holes @ ${timeSlot}` },
            unit_amount: Math.round(Number(totalPrice) * 100),
          },
          quantity: 1,
        },
      ],

      metadata: {
        userId: req.user._id.toString(),
        courseType,
        date,
        timeSlot,
        players,
        groupName,
        caddy: JSON.stringify(caddy),
        golfCar: String(golfCartQty),
        golfBag: String(golfBagQty),
        totalPrice: String(totalPrice),
      },
    });

    return res.json({ ok: true, url: session.url });
  } catch (err) {
    console.error("createCheckoutFromDetails error:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Cannot create checkout session" });
  }
};

/**
 * POST /api/stripe/webhook
 * Stripe webhook: จ่ายสำเร็จ -> บันทึกลง DB
 * NOTE: ต้องใช้ express.raw({ type: "application/json" }) ที่ route นี้เท่านั้น
 */
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object; // Stripe.Checkout.Session
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
        caddy: caddies, // เก็บ userIds ของแคดดี้ลง booking
        golfCar: Number(md.golfCar || 0),
        golfBag: Number(md.golfBag || 0),
        totalPrice: Number(md.totalPrice || 0),
        isPaid: true,
        status: "booked",
        stripeSessionId: s.id, // สำคัญ! เอาไว้ค้นหาในหน้า success
      });

      // 3) อัปเดตสถานะ caddy
      if (caddies.length > 0) {
        await updateCaddyBooking(caddies, "booked");
      }

      console.log("✅ Booking created after payment:", booking._id);
    } catch (e) {
      console.error("Webhook save error:", e);
      // ยังให้ 200 กลับไป เพื่อไม่ให้ Stripe retry รัว ๆ ถ้าเป็น error ฝั่งเรา
    }
  }

  // ตอบ 200 ให้ Stripe เสมอ (ถ้าอยากให้ retry ใช้ status อื่น ตามต้องการ)
  res.json({ received: true });
};

/**
 * GET /api/stripe/by-session/:session_id
 * (ต้องล็อกอิน) ใช้ดึง booking โดยอ้างอิง session_id ที่ Stripe ส่งกลับมา
 */
export const getBookingBySession = async (req, res) => {
  try {
    // route ของคุณประกาศเป็น :session_id
    const sid = req.params.session_id || req.params.sessionId;
    if (!sid) {
      return res.status(400).json({ success: false, message: "Missing session_id" });
    }

    const booking = await Booking.findOne({ stripeSessionId: sid });
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    res.json({ success: true, booking });
  } catch (err) {
    console.error("getBookingBySession error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
