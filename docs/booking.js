/**
 * @swagger
 * tags:
 *   - name: Booking
 *     description: จัดการการจองกอล์ฟ
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BookingRequest:
 *       type: object
 *       required: [courseType, date, timeSlot, players, groupName, totalPrice]
 *       properties:
 *         courseType:
 *           type: string
 *           description: "18 หรือ 9 (หลุม)"
 *           example: "18"
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-11-04"
 *         timeSlot:
 *           type: string
 *           example: "07:00"
 *         players:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Ohm", "A", "B", "C"]
 *         groupName:
 *           type: string
 *           example: "Ohm Group"
 *         caddy:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: string
 *           example: ["671fa3d9f0a3f2b1c9b0c001", "671fa3d9f0a3f2b1c9b0c002"]
 *         totalPrice:
 *           type: number
 *           example: 4600
 *         golfCar:
 *           type: integer
 *           example: 1
 *         golfBag:
 *           type: integer
 *           example: 2
 *
 *     Booking:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "6720b68b2b9c0b4ea1f9abcd"
 *         user:
 *           type: string
 *           example: "671fa3d9f0a3f2b1c9b01234"
 *         courseType:
 *           type: string
 *           example: "18"
 *         date:
 *           type: string
 *           format: date-time
 *           example: "2025-11-04T00:00:00.000Z"
 *         timeSlot:
 *           type: string
 *           example: "07:00"
 *         players:
 *           type: array
 *           items:
 *             type: string
 *         groupName:
 *           type: string
 *           example: "TTT1"
 *         caddy:
 *           type: array
 *           items:
 *             type: string
 *         totalPrice:
 *           type: number
 *           example: 4600
 *         isPaid:
 *           type: boolean
 *           example: false
 *         golfCar:
 *           type: integer
 *           example: 1
 *         golfBag:
 *           type: integer
 *           example: 2
 *         bookedGolfCarIds:
 *           type: array
 *           items:
 *             type: string
 *         bookedGolfBagIds:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 *           enum: [pending, booked, onGoing, completed, canceled]
 *           example: "pending"
 *
 *     StripeCheckoutResponse:
 *       type: object
 *       description: "ผลลัพธ์การสร้าง Stripe Checkout (shape มาจาก stripe.controller.js)"
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         url:
 *           type: string
 *           example: "https://checkout.stripe.com/c/pay_cs_test_..."
 *         sessionId:
 *           type: string
 *           example: "cs_test_a1B2C3..."
 *
 *     TimeSlotsRequest:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           description: "YYYY-MM-DD (ถ้าไม่ส่ง ใช้วันนี้ตามเวลาไทย)"
 *           example: "2025-11-04"
 *         courseType:
 *           type: string
 *           description: "18 หรือ 9 (ถ้าไม่ส่ง = รวมทั้งวัน)"
 *           example: "18"
 *
 *     TimeSlotsResponse:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           example: "2025-11-04"
 *         courseType:
 *           type: string
 *           nullable: true
 *           example: "18"
 *         availableTimeSlots:
 *           type: array
 *           items:
 *             type: string
 *           example: ["06:00","06:15","06:30","06:45","07:15"]
 *         reservedTimeSlots:
 *           type: array
 *           items:
 *             type: string
 *           example: ["07:00","08:00","09:00"]
 */

/**
 * @swagger
 * /booking/book:
 *   post:
 *     summary: สร้างการจองใหม่ + สร้าง Stripe Checkout
 *     description: |
 *       - ตรวจสอบซ้ำซ้อนเวลา/คิว
 *       - จองสินทรัพย์ (golfCar/golfBag) ชั่วคราวเป็นสถานะ "booked"
 *       - คืนลิงก์ Stripe Checkout เพื่อให้ลูกค้าชำระเงิน
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BookingRequest'
 *           examples:
 *             sample:
 *               value:
 *                 courseType: "18"
 *                 date: "2025-11-04"
 *                 timeSlot: "07:00"
 *                 players: ["Ohm","A","B","C"]
 *                 groupName: "Ohm Group"
 *                 caddy: ["671fa3d9f0a3f2b1c9b0c001"]
 *                 totalPrice: 4600
 *                 golfCar: 1
 *                 golfBag: 2
 *     responses:
 *       201:
 *         description: สร้าง Checkout สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StripeCheckoutResponse'
 *       400:
 *         description: ข้อมูลไม่ถูกต้องหรืออุปกรณ์ไม่เพียงพอ / มีการจองเวลานี้แล้ว
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /booking/getbook:
 *   get:
 *     summary: ดึงข้อมูลการจองทั้งหมด
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการการจอง
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 */

/**
 * @swagger
 * /booking/updatebooking/{id}:
 *   put:
 *     summary: แก้ไขเวลาการจอง
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [timeSlot]
 *             properties:
 *               timeSlot:
 *                 type: string
 *                 example: "08:15"
 *     responses:
 *       200:
 *         description: แก้ไขสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking updated successfully"
 *                 booking:
 *                   $ref: '#/components/schemas/Booking'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง
 *       404:
 *         description: ไม่พบการจอง
 */

/**
 * @swagger
 * /booking/deletebooking/{id}:
 *   delete:
 *     summary: ลบการจอง
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking deleted successfully"
 *       404:
 *         description: ไม่พบการจอง
 */

/**
 * @swagger
 * /booking/getbyidbooked/{id}:
 *   get:
 *     summary: ดึงการจองตาม ID
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Booking'
 *       404:
 *         description: ไม่พบการจอง
 */

/**
 * @swagger
 * /booking/getbyidbookinguser:
 *   get:
 *     summary: ดึงการจองทั้งหมดของผู้ใช้ปัจจุบัน
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Booking'
 *       404:
 *         description: ไม่พบรายการของผู้ใช้
 */

/**
 * @swagger
 * /booking/today:
 *   get:
 *     summary: ดึงการจองตามวัน (ใช้ query `date=YYYY-MM-DD`, ไม่ส่ง = วันนี้ตามเวลาไทย)
 *     tags: [Booking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           example: "2025-11-04"
 *         description: วันที่รูปแบบ YYYY-MM-DD (optional)
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 date:
 *                   type: string
 *                   example: "today"
 *                 count:
 *                   type: integer
 *                   example: 3
 *                 bookings:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Booking'
 *                       - type: object
 *                         properties:
 *                           date_thai:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-04T07:00:00.000+07:00"
 */

/**
 * @swagger
 * /booking/available-timeslots:
 *   post:
 *     summary: ตรวจสอบช่องเวลาที่ว่างตามวัน/ประเภทสนาม (อิงเวลาไทย)
 *     tags: [Booking]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TimeSlotsRequest'
 *           examples:
 *             for18:
 *               value: { "date": "2025-11-04", "courseType": "18" }
 *             all:
 *               value: { "date": "2025-11-04" }
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TimeSlotsResponse'
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
