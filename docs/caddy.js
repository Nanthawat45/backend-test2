/**
 * @swagger
 * tags:
 *   - name: Caddy
 *     description: จัดการงานของแคดดี้
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CaddyActionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Round started successfully. All assets and caddies are now in use."
 *         booking:
 *           type: object
 *           description: "ข้อมูลสรุปหลังอัปเดตสถานะการจอง (จาก checkUpdatedBookingStatus)"
 *           properties:
 *             updated:
 *               type: boolean
 *               example: true
 *             phase:
 *               type: string
 *               example: "afterStart"
 *             newStatus:
 *               type: string
 *               example: "onGoing"
 *             startedCount:
 *               type: integer
 *               example: 3
 *             finishedCount:
 *               type: integer
 *               example: 0
 *             required:
 *               type: integer
 *               example: 3
 *     CaddyAvailableListItem:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: "userId ของแคดดี้"
 *           example: "671fa3d9f0a3f2b1c9b01234"
 *         img:
 *           type: string
 *           example: "https://example.com/avatar.png"
 *         name:
 *           type: string
 *           example: "Caddy One"
 *         caddy_id:
 *           type: string
 *           example: "671fa3d9f0a3f2b1c9b01234"
 *         caddyDocId:
 *           type: string
 *           example: "6720aa11bb22cc33dd445566"
 *         profilePic:
 *           type: string
 *           example: "https://example.com/avatar.png"
 */

/**
 * @swagger
 * /caddy/start/{bookingId}:
 *   put:
 *     summary: แคดดี้เริ่มรอบการเล่น
 *     tags: [Caddy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720b68b2b9c0b4ea1f9abcd"
 *     responses:
 *       200:
 *         description: เริ่มรอบเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaddyActionResponse'
 *       401:
 *         description: ต้องเข้าสู่ระบบ
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ
 *       404:
 *         description: ไม่พบการจอง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /caddy/end/{bookingId}:
 *   put:
 *     summary: แคดดี้จบรอบการเล่น
 *     tags: [Caddy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720b68b2b9c0b4ea1f9abcd"
 *     responses:
 *       200:
 *         description: จบรอบเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaddyActionResponse'
 *       401:
 *         description: ต้องเข้าสู่ระบบ
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ
 *       404:
 *         description: ไม่พบการจอง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /caddy/available/{bookingId}:
 *   put:
 *     summary: แคดดี้แจ้งสถานะว่าว่างหลังจากทำความสะอาดอุปกรณ์
 *     description: ปลดสถานะแคดดี้จาก 'clean'/'cleaning' ไปเป็น 'available' และปลดอุปกรณ์จาก booking เป็น 'available'
 *     tags: [Caddy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720b68b2b9c0b4ea1f9abcd"
 *     responses:
 *       200:
 *         description: อัปเดตสถานะเรียบร้อยแล้ว
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Caddy and related assets are now available."
 *                 caddy:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: สถานะไม่ถูกต้อง
 *       403:
 *         description: ไม่ใช่แคดดี้ที่รับงาน หรือไม่ได้ถูกมอบหมายให้ booking นี้
 *       404:
 *         description: ไม่พบ booking/caddy
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/**
 * @swagger
 * /caddy/cancel-start/{bookingId}:
 *   put:
 *     summary: แคดดี้ยกเลิกงานก่อนเริ่มรอบ
 *     tags: [Caddy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720b68b2b9c0b4ea1f9abcd"
 *     responses:
 *       200:
 *         description: ยกเลิกก่อนเริ่มเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaddyActionResponse'
 *       401:
 *         description: ต้องเข้าสู่ระบบ
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ
 *       404:
 *         description: ไม่พบการจอง
 */

/**
 * @swagger
 * /caddy/cancel-during-round/{bookingId}:
 *   put:
 *     summary: แคดดี้ยกเลิกงานระหว่างรอบ
 *     tags: [Caddy]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *           example: "6720b68b2b9c0b4ea1f9abcd"
 *     responses:
 *       200:
 *         description: ยกเลิกระหว่างรอบเรียบร้อย
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CaddyActionResponse'
 *       401:
 *         description: ต้องเข้าสู่ระบบ
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ
 *       404:
 *         description: ไม่พบการจอง
 */

/**
 * @swagger
 * /caddy/caddybooking:
 *   get:
 *     summary: แคดดี้ดูรายการจองที่ได้รับมอบหมาย
 *     tags: [Caddy]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: รายการที่ได้รับมอบหมาย
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   courseType:
 *                     type: string
 *                     example: "18-hole"
 *                   date:
 *                     type: string
 *                     format: date
 *                     example: "2025-11-04"
 *                   timeSlot:
 *                     type: string
 *                     example: "07:00-09:00"
 *                   groupName:
 *                     type: string
 *                     example: "Ohm Group"
 *                   status:
 *                     type: string
 *                     example: "booked"
 *       401:
 *         description: ต้องเข้าสู่ระบบ
 *       403:
 *         description: สิทธิ์ไม่เพียงพอ (ต้องเป็น caddy)
 */
