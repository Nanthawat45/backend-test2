import Booking from "../models/Booking.js";
import { checkItem } from "./item.controller.js";
//import {updateCaddyBooking} from "./caddy.Controller.js";
import { createCheckoutFromDetails } from "./stripe.controller.js";
import { startOfDay, endOfDay, addHours } from "date-fns"

export const createBooking = async (req, res) => {
  try {
    const {
      courseType, date, timeSlot, players, groupName, caddy,
      totalPrice, golfCar = 0, golfBag = 0
    } = req.body;

    const bookingDate = new Date(date);
    const isBooked = await Booking.checkAvailability(bookingDate, timeSlot);
    if (isBooked) {
      return res.status(400).json({
        success: false,
        message: `ไม่สามารถจองได้! มีการจองในวันที่ ${bookingDate.toDateString()} เวลา ${timeSlot} แล้ว`,
      });
    }

    // ตรวจสอบ availability
    let golfBagId = [];
    let golfCarId = [];
    if (golfBag > 0) golfBagId = await checkItem(golfBag, "golfBag");
    if (golfBagId.length < golfBag) return res.status(400).json({ message: "Not enough golf Bag available." });

    if (golfCar > 0) golfCarId = await checkItem(golfCar, "golfCar");
    if (golfCarId.length < golfCar) return res.status(400).json({ message: "Not enough golf cars available." });

    // ตรวจสอบ caddy
    const caddyArray = Array.isArray(caddy) ? caddy : [caddy];
    for (const caddyId of caddyArray) {
      const overlap = await Booking.findOne({ caddy: caddyId, date: new Date(date) });
      if (overlap) return res.status(400).json({ message: `Caddy ${caddyId} is already booked.` });
    }
    //const caddyBooked = await updateCaddyBooking(caddyArray, "booked");

    // สร้าง booking
    const booking = new Booking({
      user: req.user._id,
      courseType, date, timeSlot, players, groupName,
      caddy: caddyArray, totalPrice, isPaid: false,
      golfCar, golfBag, bookedGolfCarIds: golfCarId,
      bookedGolfBagIds: golfBagId, status: "pending"
    });

    const savedBooking = await booking.save();

    // สร้าง Stripe session
    //const paymentUrl = await createPaymentIntent(savedBooking, req.user.email);
        const result = await createCheckoutFromDetails({
      body: { courseType, date, timeSlot, players, groupName, caddy, golfCartQty: golfCar, golfBagQty: golfBag, totalPrice },
      user: req.user
    }, res);
    return result;
    //res.status(201).json({ success: true, booking: savedBooking, paymentUrl });
  } catch (error) {
    console.error("Error creating booking with payment:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getBookings = async (req, res) => {
    try{
        const bookings = await Booking.find()
        .populate('user', 'name email')
        // .populate('bookedGolfCartIds', 'name')
        // .populate('bookedGolfBagIds', 'name')
        res.json(bookings);
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
};

export const updateBooking = async (req, res) =>{
    
    try{
        const booking = await Booking.findById(req.params.id);
        if(!booking){
            return res.status(404).json({message:"Booking not found"});//ไม่พบการจอง
        }
        if(req.body.timeSlot){
            booking.timeSlot = req.body.timeSlot;
        } else {
            return res.status(400).json({message:"Invalid time slot"});//ช่วงเวลาที่ไม่ถูกต้อง
        }
        const updatedBooking = await booking.save();
        res.status(200).json ({message: "Booking updated successfully", booking: updatedBooking });
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
}

export const deleteBooking = async (req, res) =>{
    try{
        const booking = await Booking.findById(req.params.id);
        // console.log(booking);
        if(!booking){
            return res.status(404).json({message:"Booking not found"});//ไม่พบการจอง
        }
        await booking.deleteOne();
        res.status(200).json({message:"Booking deleted successfully"});//ลบการจองสำเร็จ
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
}

export const getByIdBookings = async (req, res) => {
    const { id } = req.params;
    try{
        const bookedById = await Booking.findById(id);
        if(!bookedById){
            return res.status(404).json({message:"Booking not found"});//ไม่พบการจอง
        }
        res.send(bookedById);
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
};

export const updateBookingStatus = async (bookingId, newStatus) => {
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status: newStatus },
      { new: true }
    );
    if (!updatedBooking) {
      throw new Error("Booking not found.");
    }
    return updatedBooking;
  } catch (error) {
    throw new Error(`Failed to update booking status: ${error.message}`);
  }
};

// GET Booking by ID (ข้อมูลใน Booking เท่านั้น)
export const getById_BookingUser = async (req, res) => {
    const user = req.user._id; // ID ของแคดดี้ที่ล็อกอินอยู่

    try {
        const bookings = await Booking.find({ user })
        
        .sort({ date: 1, timeSlot: 1 });
        if (!bookings || bookings.length === 0) { 
            return res.status(404).json({ message: "No assigned bookings found." }); 
        }
        res.status(200).json(bookings); 

    } catch (error) {
        res.status(500).json({ error: error.message || "Failed to fetch assigned bookings." });
    }
};

export const getBookingToday = async (req, res) => {
  try {
    const { date } = req.query;

    // ใช้วันจาก query หรือวันปัจจุบัน
    const selectedDate = date ? new Date(date) : new Date();

    // ⚙️ ปรับให้ตรงกับเวลาไทย (UTC+7)
    // แปลงวันที่ที่เลือกจากไทย -> UTC
    const startOfSelectedDay = addHours(startOfDay(selectedDate), -7);
    const endOfSelectedDay = addHours(endOfDay(selectedDate), -7);

    // console.log("🇹🇭 Thai date:", selectedDate);
    // console.log("🕐 UTC range:", startOfSelectedDay, "→", endOfSelectedDay);

    // 🔍 ค้นหาการจองภายในวันนั้น (ตามเวลาไทย)
    const bookings = await Booking.find({
      date: { $gte: startOfSelectedDay, $lte: endOfSelectedDay },
    })
      .populate("user", "name email phone")
      .populate("caddy", "name")
      .sort({ date: 1 });

    // 🧭 แปลงเวลาที่แสดงกลับเป็นเวลาไทย (เพื่อความเข้าใจง่าย)
    const bookingsWithThaiTime = bookings.map((b) => ({
      ...b.toObject(),
      date_thai: addHours(b.date, 7), // เพิ่ม 7 ชั่วโมง เพื่อแสดงตามเวลาไทย
    }));

    res.status(200).json({
      success: true,
      date: date || "today",
      count: bookingsWithThaiTime.length,
      bookings: bookingsWithThaiTime,
    });
  } catch (error) {
    console.error("❌ Failed to get bookings by date:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bookings",
    });
  }
};

const SLOTS_18 = [
  "06:00","06:15","06:30","06:45","07:00","07:15","07:30","07:45",
  "08:00","08:15","08:30","08:45","09:00","09:15","09:30","09:45",
  "10:00","10:15","10:30","10:45","11:00","11:15","11:30","11:45","12:00"
];
const SLOTS_9 = [
  "12:15","12:30","12:45","13:00","13:15","13:30","13:45",
  "14:00","14:15","14:30","14:45","15:00","15:15","15:30","15:45",
  "16:00","16:15","16:30","16:45","17:00"
];

function buildThaiDayRange(dateStr /* 'YYYY-MM-DD' | null */) {
  if (dateStr) {
    const startTH = new Date(`${dateStr}T00:00:00.000+07:00`);
    const endTH   = new Date(`${dateStr}T23:59:59.999+07:00`);
    return { startTH, endTH };
  }
  // ไม่ส่ง date → ใช้ “วันนี้ของไทย”
  const now = new Date();
  const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const y = thNow.getUTCFullYear();
  const m = String(thNow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(thNow.getUTCDate()).padStart(2, "0");
  const startTH = new Date(`${y}-${m}-${d}T00:00:00.000+07:00`);
  const endTH   = new Date(`${y}-${m}-${d}T23:59:59.999+07:00`);
  return { startTH, endTH };
}

function formatThaiTodayForResponse() {
  const now = new Date();
  const thNow = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  const y = thNow.getUTCFullYear();
  const m = String(thNow.getUTCMonth() + 1).padStart(2, "0");
  const d = String(thNow.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const getAvailableTimeSlots = async (req, res) => {
  try {
    const dateStr = req.body?.date || null;              // 'YYYY-MM-DD' | null
    const courseType = req.body?.courseType || null;     // '18' | '9' | null
    const { startTH, endTH } = buildThaiDayRange(dateStr);

    // เลือกฐานเวลาตาม courseType (ไม่ส่ง -> รวมทั้งวัน)
    let baseSlots = [];
    if (courseType === "18") baseSlots = [...SLOTS_18];
    else if (courseType === "9") baseSlots = [...SLOTS_9];
    else baseSlots = [...SLOTS_18, ...SLOTS_9];

    // หา booking ของวันนั้น (ตามเวลาไทย) ที่ยังไม่นับจบ
    const query = {
      date: { $gte: startTH, $lte: endTH },
      status: { $in: ["pending", "booked", "onGoing"] },
    };
    if (courseType) query.courseType = courseType;

    const bookings = await Booking.find(query).select("timeSlot").lean();

    // เก็บ timeSlot ที่ถูกจอง (string) ให้ unique
    const reservedSet = new Set();
    for (const b of bookings) {
      if (b.timeSlot && typeof b.timeSlot === "string") {
        reservedSet.add(b.timeSlot);
      }
    }

    // ตัดเวลาที่ถูกจองออก
    const available = baseSlots.filter(t => !reservedSet.has(t));

    return res.status(200).json({
      date: dateStr ?? formatThaiTodayForResponse(), // เผื่ออยากเห็นว่ารันเป็นวันไหนเมื่อไม่ส่ง date มา
      courseType: courseType ?? null,
      availableTimeSlots: available,      // ✅ เวลาที่ "ยังว่าง"
      reservedTimeSlots: Array.from(reservedSet).sort(), // ให้ไว้เผื่อ debug/แสดงผล
    });
  } catch (err) {
    console.error("getAvailableTimeSlots error:", err);
    return res.status(500).json({ message: "Failed to get available time slots" });
  }
};