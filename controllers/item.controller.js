import Item from "../models/Item.js";

export const createItem = async (req, res) => {
    const { itemId, type } = req.body;
    try {
        const itemExists = await Item.findOne({ itemId });
        if (itemExists) {
            return res.status(400).json({ message: "Item already exists" });//มีรายการอยู่แล้ว
        }
        const item = new Item({
            itemId,
            type,
            status: 'available'
        });
        const savedItem = await item.save();
        res.status(201).json(savedItem);
    } catch {
        res.status(500).json({ message: "Server error" }); //เซิร์ฟเวอร์ error
    }
}

export const getByIdItem = async (req, res) => {
    const { id } = req.params;
    try {
        const bookedById = await Item.findById(id);
        if (!bookedById) {
            return res.status(404).json({ message: "Booking not found" });//ไม่พบการจอง
        }
        res.send(bookedById);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });//เซิร์ฟเวอร์ error
    }
};

export const deleteItem = async (req, res) => {
    try {
        const DItem = await Item.findById(req.params.id);
        // console.log(DItem);
        if (!DItem) {
            return res.status(404).json({ message: "Item not found" });//ไม่พบการจอง
        }
        await DItem.deleteOne();
        res.status(200).json({ message: "Item deleted successfully" });//ลบการจองสำเร็จ
    } catch {
        res.status(500).json({ message: "Server error" });//เซิร์ฟเวอร์ error
    }
}

export const getItemCar = async (req, res) => {
    try {
        const Items = await Item.find({ type: "golfCar" })
        //.populate('Item', 'itemId type status')
        // .populate('bookedGolfCartIds', 'name')
        // .populate('bookedGolfBagIds', 'name')
        res.json(Items);
    } catch {
        res.status(500).json({ message: "Server error" });//เซิร์ฟเวอร์ error
    }
};

export const getItemBag = async (req, res) => {
    try {
        const Items = await Item.find({ type: "golfBag" })
        //.populate('Item', 'itemId type status')
        // .populate('bookedGolfCartIds', 'name')
        // .populate('bookedGolfBagIds', 'name')
        res.json(Items);
    } catch {
        res.status(500).json({ message: "Server error" });//เซิร์ฟเวอร์ error
    }
};

export const checkItem = async (quantity, itemType) => {
    try {
        if (quantity <= 0) {
            return [];
        }
        const items = await Item.find({
            type: itemType,
            status: "available"
        }).limit(quantity);
        const itemId = items.map(item => item.id);
        await Item.updateMany(
            { _id: { $in: itemId } },
            { $set: { status: "booked" } }
        )
        return itemId
    } catch {
        res.status(500).json({ message: "Server error" });//เซิร์ฟเวอร์ error
    }
}

export const updateItemStatus = async (itemIds, newStatus) => {
    try {
        await Item.updateMany(
            { _id: { $in: itemIds } },
            { $set: { status: newStatus } }
        );
    } catch (error) {
        throw new Error(`Failed to update item status: ${error.message}`);
    }
};

export const updateItemStatusinUse = async (itemIds, newStatus) => {
    try {
        await Item.updateMany(
            { _id: { $in: itemIds } },
            { $set: { status: newStatus } }
        );
    } catch (error) {
        throw new Error(`Failed to update item status: ${error.message}`);
    }
};

export const getItemAllStatus = async (req, res) => {
    try {
        const itemStatuses = await Item.aggregate([ // ใช้ aggregate เพื่อจัดกลุ่มและนับสถานะ
            {
                $group: {
                    _id: { type: "$type", status: "$status" }, // จัดกลุ่มตาม type และ status
                    count: { $sum: 1 } // นับจำนวน //เพิ่ม 1 ทุกครั้ง
                }
            },
            {
                $project: {
                    _id: 0, // ไม่แสดง _id ในผลลัพธ์
                    type: "$_id.type", // ดึง type จาก _id ออกมาจาก $ group
                    status: "$_id.status", // ดึง status จาก _id ออกมาจาก $ group
                    count: 1
                }
            }
        ]);

        const golfCarSummary = {
            booked: 0,
            inUse: 0,
            clean: 0,
            available: 0,
            spare: 0,
            broken: 0
        };
        const golfBagSummary = {
            booked: 0,
            inUse: 0,
            clean: 0,
            available: 0,
            spare: 0,
            broken: 0
        };

        itemStatuses.forEach(item => {
            if (item.type === 'golfCar') {
                golfCarSummary[item.status] = item.count;
            } else if (item.type === 'golfBag') {
                golfBagSummary[item.status] = item.count;
            }
        });

        res.status(200).json({
            golfCar: golfCarSummary,
            golfBag: golfBagSummary
        });

    } catch (error) {
        console.error("Error fetching item overall status:", error); // เกิดข้อผิดพลาดในการดึงสถานะโดยรวมของ item
        res.status(500).json({ error: error.message || "Failed to fetch item overall status." }); // ดึงสถานะโดยรวมของ item ไม่สำเร็จ
    }
};