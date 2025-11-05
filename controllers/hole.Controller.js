import Hole from "../models/Hole.js";
import Item from "../models/Item.js";
import mongoose from "mongoose";

export const close = async (req, res) => {
    const { holeNumber, description } = req.body;
    const userId = req.user._id;
    try {
        if(!holeNumber || !description){
            return res.status(400).json({message:"Please provide holeNumber and description"});
            //กรุณาใส่หมายเลขหลุมและคำอธิบาย
        }
        if(holeNumber < 1 || holeNumber > 18){
            return res.status(400).json({message:"Hole number must be between 1 and 18"});
            //หมายเลขหลุมต้องอยู่ระหว่าง 1 ถึง 18
        }
         await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "close",
            description:description,
            reportedBy: userId
        }
    })
    return res.status(200).json({ message: "Hole status successfully updated to close." });
    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const createHole = async (req, res) => {
    const {holeNumber} = req.body;

    try {
        const holes = new Hole({
            holeNumber
        });
        const savedHole = await holes.save();
        res.status(201).json(savedHole);
        
    } catch {
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const open = async (req, res) => {
    const { holeNumber} = req.body;
    const userId = req.user._id;
    try {
        if(!holeNumber ){
            return res.status(400).json({message:"Please provide holeNumber and description"});
            //กรุณาใส่หมายเลขหลุมและคำอธิบาย
        }
        if(holeNumber < 1 || holeNumber > 18){
            return res.status(400).json({message:"Hole number must be between 1 and 18"});
            //หมายเลขหลุมต้องอยู่ระหว่าง 1 ถึง 18
        }
         await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "open",
            resolvedBy: userId,
            description: ""
        }
    })
    return res.status(200).json({ message: "Hole status successfully updated to open." });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const report = async (req, res) => {
    const { holeNumber} = req.body;
    const userId = req.user._id;
    try {
        if(!holeNumber ){
            return res.status(400).json({message:"Please provide holeNumber and description"});
            //กรุณาใส่หมายเลขหลุมและคำอธิบาย
        }
        if(holeNumber < 1 || holeNumber > 18){
            return res.status(400).json({message:"Hole number must be between 1 and 18"});
            //หมายเลขหลุมต้องอยู่ระหว่าง 1 ถึง 18
        }
         await Hole.updateOne(
            {holeNumber: holeNumber},
            {
                $set: {status: "editing",
            resolvedBy: userId,
            description: "กำลังแก้ไข"
        }
    })
    return res.status(200).json({ message: "Hole status successfully updated to report." });
    
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const getHoles = async (req, res) => {
    try{
        const holes = await Hole.find()
        res.json(holes);
    } catch {
        res.status(500).json({message:"Server error"});//เซิร์ฟเวอร์ error
    }
}

export const getByIdHoles = async (req, res) => {
    const { id } = req.params;
    try{
        const holeById = await Hole.findById(id);
        if(!holeById){
            return res.status(404).json({message:"Hole not found"});//ไม่พบหลุม
        }
        res.status(200).json(holeById);
    }catch (error){
        console.log(error);
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const reportHelpCar = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { holeNumber, description = "", helpCarCount } = req.body;
    const userId = req.user?._id;

    // --- validate ---
    if (holeNumber === undefined || holeNumber === null) {
      return res.status(400).json({ message: "กรุณาระบุหมายเลขหลุม (holeNumber)" });
    }
    const count = Number(helpCarCount ?? 1);
    if (!Number.isFinite(count) || count <= 0) {
      return res.status(400).json({ message: "helpCarCount ต้องเป็นจำนวนเต็มบวก" });
    }

    // --- find hole ---
    const hole = await Hole.findOne({ holeNumber }).session(session);
    if (!hole) return res.status(404).json({ message: "ไม่พบหลุมที่ระบุ" });

    // กันแจ้งซ้ำ
    if (hole.status === 'help_car') {
      return res.status(409).json({ message: "หลุมนี้ถูกแจ้งขอรถช่วยอยู่แล้ว" });
    }

    // --- update hole ---
    hole.status = 'help_car';
    hole.description = description;
    hole.helpCarCount = count;     // เก็บจำนวนรถเสียที่แจ้ง
    hole.reportedBy = userId || null;
    hole.reportedAt = new Date();

    const updatedHole = await hole.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "บันทึกการขอรถกอล์ฟช่วยสำเร็จ",
      hole: updatedHole,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("reportHelpCar error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดขณะบันทึกการขอรถกอล์ฟช่วย" });
  }
};

export const resolveGoCar = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { holeNumber } = req.body;
    const userId = req.user?._id;

    if (holeNumber === undefined || holeNumber === null) {
      return res.status(400).json({ message: "กรุณาระบุหมายเลขหลุม (holeNumber)" });
    }

    // --- hole ---
    const hole = await Hole.findOne({ holeNumber }).session(session);
    if (!hole || hole.status !== 'help_car') {
      return res.status(404).json({ message: "ไม่พบการแจ้งขอรถช่วยของหลุมนี้ (หรือสถานะไม่ใช่ help_car)" });
    }

    const need = Number(hole.helpCarCount ?? 1);
    if (!Number.isFinite(need) || need <= 0) {
      return res.status(400).json({ message: "จำนวนรถที่ต้องสลับ (helpCarCount) ไม่ถูกต้อง" });
    }

    // --- หารถตามจำนวน ---
    // 1) เอา available -> spare
    const availableCars = await Item.find({
      type: 'golfCar',
      status: 'available',
    }).limit(need).session(session);

    if (availableCars.length < need) {
      return res.status(404).json({ message: `รถสถานะ available ไม่พอ ต้องการ ${need} คัน` });
    }

    // 2) เอา spare -> broken
    const spareCars = await Item.find({
      type: 'golfCar',
      status: 'spare',
    }).limit(need).session(session);

    if (spareCars.length < need) {
      return res.status(404).json({ message: `รถสถานะ spare ไม่พอ ต้องการ ${need} คัน` });
    }

    // --- อัปเดตสถานะทั้งหมด (ใน transaction) ---
    // available -> spare
    for (const car of availableCars) {
      car.status = 'spare';
      await car.save({ session });
    }

    // spare -> broken
    for (const car of spareCars) {
      car.status = 'broken';
      await car.save({ session });
    }

    // --- ปิดเคสหลุม ---
    //hole.status = 'go_help_car'; // แก้ใช้นี้ open ไปก่อน 
    hole.status = 'open';
    hole.resolvedBy = userId || null;
    hole.resolvedAt = new Date();
    // ถ้าต้องการเคลียร์ count หลังแก้แล้ว:
    // hole.helpCarCount = 0;

    const updatedHole = await hole.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: `ดำเนินการสลับคลังรถสำรองสำเร็จ: available→spare และ spare→broken จำนวน ${need} คัน`,
      hole: updatedHole,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("resolveGoCar error:", error);
    return res.status(500).json({ message: "เกิดข้อผิดพลาดขณะดำเนินการสลับรถ" });
  }
};