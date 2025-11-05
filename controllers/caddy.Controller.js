import Caddy from "../models/Caddy.js";
import Booking from "../models/Booking.js";
import { updateBookingStatus  } from "./booking.Controller.js"
import { updateItemStatus } from "./item.controller.js";
import { startOfDay, endOfDay } from 'date-fns';
import mongoose from "mongoose";

export const startRound = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'inUse'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'inUse');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'onGoing'
    await updateCaddyStatus(caddyId, 'onGoing');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'onGoing'
    const bump = await checkUpdatedBookingStatus(bookingId, 'afterStart');

    res.status(200).json({
      message: "Round started successfully. All assets and caddies are now in use.",
      booking: bump
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const updateCaddyStatus = async (caddyId, newStatus) => {
  try {
    await Caddy.updateOne(
      { caddy_id: caddyId },
      { $set: { caddyStatus: newStatus } }
    );
  } catch (error) {
    throw new Error(`Failed to update caddy status: ${error.message}`);
  }
};

export const updateCaddyBooking = async (caddyUserIds, newStatus) => {
  // caddyUserIds คือ array ของ User._id (จาก front)
  const objIds = (caddyUserIds || [])
    .filter(Boolean)
    .map((id) => new mongoose.Types.ObjectId(String(id)));
 
  // ใช้ caddy_id ไม่ใช่ _id !!
  const result = await Caddy.updateMany(
    { caddy_id: { $in: objIds } },        // <<< สำคัญ
    { $set: { caddyStatus: newStatus } }
  );
 
  // console.log(" Caddy.updateMany:", {
  //   matchedCount: result.matchedCount,
  //   modifiedCount: result.modifiedCount,
  // });
 
  return result;
};

export const endRound = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'clean'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'clean');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'clean'
    await updateCaddyStatus(caddyId, 'clean');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'completed'
    const bump = await checkUpdatedBookingStatus(bookingId, 'afterEnd');

    res.status(200).json({
      message: "Round started successfully. All assets and caddies are now in use.",
      booking: bump
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const markCaddyAsAvailable = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'available'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'available');
    }
    const updatedCaddy = await updateCaddyStatus(caddyId, 'available');

    res.status(200).json({
      message: "Caddy and related assets are now available.",
      caddy: updatedCaddy,
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const cancelStart = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'available'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'available');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'available'
    await updateCaddyStatus(caddyId, 'available');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'canceled'
    const bump = await checkUpdatedBookingStatus(bookingId, 'afterCancel');

    res.status(200).json({
      message: "Round canceled successfully. All assets and caddies are now available.",
      booking: bump
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const cancelDuringRound = async (req, res) => {
  const { bookingId } = req.params;
  const caddyId = req.user._id;

  try {
    const booking = await Booking.findById(bookingId);

    // 1. ตรวจสอบ: การจองมีอยู่จริงหรือไม่
    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    // 2. ตรวจสอบ: แคดดี้ที่ล็อกอินอยู่ได้รับมอบหมายให้กับการจองนี้หรือไม่
    if (booking.caddy && !booking.caddy.map(id => id.toString()).includes(caddyId.toString())) {
      return res.status(403).json({ message: "You are not assigned to this booking." });
    }

    // 3. เปลี่ยนสถานะของ Golf Carts และ Golf Bags จาก 'booked' เป็น 'clean'
    const bookedAssetIds = [...(booking.bookedGolfCarIds || []), ...(booking.bookedGolfBagIds || [])];
    if (bookedAssetIds.length > 0) {
      await updateItemStatus(bookedAssetIds, 'clean');
    }

    // 4. เปลี่ยนสถานะของแคดดี้ จาก 'booked' เป็น 'clean'
    await updateCaddyStatus(caddyId, 'clean');

    // 5. เปลี่ยนสถานะของ Booking จาก 'booked' เป็น 'canceled'
    const bump = await checkUpdatedBookingStatus(bookingId, 'afterCancel');

    res.status(200).json({
      message: "Round canceled successfully. All assets and caddies are now available.",
      booking: bump
    });

  } catch (error) {
    console.error("Failed to start round:", error);
    res.status(400).json({ error: error.message || "Failed to start round." });
  }
};

export const getCaddyAvailable = async (req, res) => {
  try {
    const dateStr = req.body?.date || null; // 'YYYY-MM-DD' หรือ null
    const { startTH, endTH } = buildThaiDayRange(dateStr);

    // หา booking ของ "วันนั้น" (ตามเวลาไทย) ที่ยังไม่จบ
    const bookedBookings = await Booking.find({
      date: { $gte: startTH, $lte: endTH },
      status: { $in: ["pending", "booked", "onGoing"] },
    }).select("caddy");

    // รวม userId ของแคดดี้ที่ถูกจองแล้ว (booking.caddy เก็บเป็น userId)
    const exclude = new Set();
    for (const b of bookedBookings) {
      if (Array.isArray(b.caddy)) {
        for (const uid of b.caddy) exclude.add(String(uid));
      }
    }
    const excludeIds = Array.from(exclude);

    // เลือกเฉพาะแคดดี้ที่ยังไม่ถูกจอง (เปรียบเทียบกับ caddy.caddy_id = User._id)
    const raw = await Caddy.find({ caddy_id: { $nin: excludeIds } })
      .select("caddy_id name")
      .populate("caddy_id", "img");

    // ส่งผลลัพธ์แบบ "compatible ของเก่า" + กันพัง
    const list = raw.map(c => {
      const userId = String(c?.caddy_id?._id || c?.caddy_id || "");
      const img = c?.caddy_id?.img || "";
      const name = c?.name || "-";
      return {
        // legacy (ของเก่าต้องมี)
        _id: userId,
        img,
        // กันพังเวลาหน้าบ้าน filter ด้วย name.toLowerCase()
        name,
        // เผื่อใช้งานต่อ
        caddy_id: userId,
        caddyDocId: String(c._id),
        profilePic: img,
      };
    });

    return res.status(200).json(list);
  } catch (error) {
    console.error("getCaddyAvailable error:", error);
    return res.status(500).json({ message: "Failed to get available caddies" });
  }
};

export const getCaddyBooking = async (req, res) => {
    const caddyId = req.user._id; // ID ของแคดดี้ที่ล็อกอินอยู่

    try {
        const bookings = await Booking.find({ // ค้นหา Booking ที่มีแคดดี้คนนี้ถูกมอบหมาย
            caddy: caddyId, //caddy ต้องตรงกับ caddyId ที่ล็อกอินอยู่
        })
        .select('courseType date timeSlot groupName status') // เลือกเฉพาะ field ที่ต้องการ
        .sort({ date: 1, timeSlot: 1 }); // เรียงตามวันที่และเวลา //.sort การเรียงลำดับ
        // 1 คือ เรียงจากน้อยไปมาก (Ascending) -1 คือ เรียงจากมากไปน้อย (Descending)
        // แล้วถ้าวันที่เหมือนกัน ก็จะเรียงตาม เวลาที่จอง
        if (!bookings || bookings.length === 0) { 
            return res.status(404).json({ message: "No assigned bookings found." }); 
            // ถ้าไม่พบการจองที่แคดดี้ถูกมอบหมาย ให้ส่งข้อความว่าไม่พบการจอง
        }
        res.status(200).json(bookings); // ส่งข้อมูลการจองที่แคดดี้ถูกมอบหมายกลับไปยังผู้ใช้

    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch assigned bookings." });
        // ไม่สามารถรับการจองที่ ถูกมอบหมายได้
        // ส่งข้อความแสดงข้อผิดพลาดกลับไปยังผู้ใช้
    }
};

export const checkUpdatedBookingStatus = async (bookingId, phase) => {
  if (!mongoose.isValidObjectId(bookingId)) {
    return { updated: false, reason: 'invalid bookingId' };
  }

  const booking = await Booking.findById(bookingId).select('status caddy').lean();
  if (!booking) return { updated: false, reason: 'booking not found' };

  // รองรับทั้งแบบเก็บเป็น ObjectId ตรงๆ หรือเป็น subdoc { caddy } / { caddy_id }
  let caddyIds = [];
  if (Array.isArray(booking.caddy)) {
    caddyIds = booking.caddy.map(item => {
      if (mongoose.isValidObjectId(item)) return item;
      if (item?.caddy) return item.caddy;
      if (item?.caddy_id) return item.caddy_id;
      return null;
    }).filter(Boolean);
  }

  if (caddyIds.length === 0) {
    return { updated: false, reason: 'this booking has no caddies' };
  }

  // ดึงสถานะแคดดี้จริง
  const caddies = await Caddy.find({ caddy_id: { $in: caddyIds } })
    .select('caddy_id caddyStatus')
    .lean();

  // คนที่ "ไม่นับ" = ยกเลิกแล้ว
  const cancelStates = ['cancelStart', 'cancelDuringRound'];

  // เหลือเฉพาะคนที่ยัง active เพื่อนับเป็นยอดที่ต้องครบ
  const activeCaddies = caddies.filter(c => !cancelStates.includes(c.caddyStatus));
  const required = activeCaddies.length;

  // ถ้ายกเลิกหมด ⇒ booking = 'canceled'
  if (required === 0) {
    if (booking.status !== 'canceled') {
      const updated = await updateBookingStatus(bookingId, 'canceled');
      return { updated: true, phase, newStatus: updated.status, required: 0 };
    }
    return { updated: false, phase, reason: 'already canceled', required: 0 };
  }

  // “จบงาน” คือ clean (เพิ่ม 'resting' ได้ถ้าต้องการ)
  const endStates = ['clean'];

  if (phase === 'afterStart') {
    // เริ่มครบ = onGoing ของ active ครบตาม required
    const startedCount = activeCaddies.filter(c => c.caddyStatus === 'onGoing').length;

    if (startedCount >= required) {
      if (booking.status !== 'onGoing') {
        const updated = await updateBookingStatus(bookingId, 'onGoing');
        return { updated: true, phase, newStatus: updated.status, startedCount, required };
      }
      return { updated: false, phase, reason: 'already onGoing', startedCount, required };
    }
    return { updated: false, phase, reason: 'not all caddies onGoing', startedCount, required };
  }

  if (phase === 'afterEnd') {
    // จบครบ = อยู่ใน endStates ครบตาม required
    const finishedCount = activeCaddies.filter(c => endStates.includes(c.caddyStatus)).length;

    if (finishedCount >= required) {
      // ✅ ตามที่คุณต้องการ: end ครบ (หลังหัก cancel) ⇒ completed
      if (booking.status !== 'completed') {
        const updated = await updateBookingStatus(bookingId, 'completed');
        return { updated: true, phase, newStatus: updated.status, finishedCount, required };
      }
      return { updated: false, phase, reason: 'already completed', finishedCount, required };
    }
    return { updated: false, phase, reason: 'not all caddies finished', finishedCount, required };
  }

  if (phase === 'afterCancel') {
    // เงื่อนไข canceled ถูกเช็คไว้ข้างบนแล้ว
    return { updated: false, phase, reason: 'some caddies still active', required };
  }

  return { updated: false, reason: 'invalid phase' };
};

function buildThaiDayRange(dateStr /* 'YYYY-MM-DD' | null */) {
  if (dateStr) {
    const startTH = new Date(`${dateStr}T00:00:00.000+07:00`);
    const endTH   = new Date(`${dateStr}T23:59:59.999+07:00`);
    return { startTH, endTH };
  }
  const now = new Date();
  const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000); // ดันเป็นเวลาไทยชั่วคราวเพื่ออ่าน Y-M-D
  const y = thNow.getUTCFullYear();
  const m = String(thNow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(thNow.getUTCDate()).padStart(2, "0");
  const startTH = new Date(`${y}-${m}-${d}T00:00:00.000+07:00`);
  const endTH   = new Date(`${y}-${m}-${d}T23:59:59.999+07:00`);
  return { startTH, endTH };
}