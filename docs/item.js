/**
 * @swagger
 * tags:
 *   - name: Item
 *     description: การจัดการสินทรัพย์ (รถกอล์ฟ, ถุงกอล์ฟ)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "671fa3d9f0a3f2b1c9b01234"
 *         itemId:
 *           type: string
 *           example: "GC001"
 *         type:
 *           type: string
 *           enum: [golfCar, golfBag]
 *           example: "golfCar"
 *         status:
 *           type: string
 *           enum: [booked, inUse, clean, available, spare, broken]
 *           example: "available"
 *     ItemCreateInput:
 *       type: object
 *       required: [itemId, type]
 *       properties:
 *         itemId:
 *           type: string
 *           example: "GC001"
 *         type:
 *           type: string
 *           enum: [golfCar, golfBag]
 *           example: "golfCar"
 *     ItemSummary:
 *       type: object
 *       properties:
 *         golfCar:
 *           type: object
 *           properties:
 *             booked:
 *               type: integer
 *               example: 2
 *             inUse:
 *               type: integer
 *               example: 4
 *             clean:
 *               type: integer
 *               example: 1
 *             available:
 *               type: integer
 *               example: 10
 *             spare:
 *               type: integer
 *               example: 1
 *             broken:
 *               type: integer
 *               example: 0
 *         golfBag:
 *           type: object
 *           properties:
 *             booked:
 *               type: integer
 *               example: 1
 *             inUse:
 *               type: integer
 *               example: 3
 *             clean:
 *               type: integer
 *               example: 2
 *             available:
 *               type: integer
 *               example: 15
 *             spare:
 *               type: integer
 *               example: 0
 *             broken:
 *               type: integer
 *               example: 1
 *     DeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Item deleted successfully"
 */

/**
 * @swagger
 * /item/additem:
 *   post:
 *     summary: เพิ่มสินทรัพย์ใหม่ (รถกอล์ฟ/ถุงกอล์ฟ)
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ItemCreateInput'
 *           examples:
 *             golfCar:
 *               value: { "itemId": "GC001", "type": "golfCar" }
 *             golfBag:
 *               value: { "itemId": "GB001", "type": "golfBag" }
 *     responses:
 *       201:
 *         description: สร้างสินทรัพย์สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       400:
 *         description: ข้อมูลไม่ถูกต้อง / มีรายการอยู่แล้ว
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               duplicate:
 *                 value: { "message": "Item already exists" }
 *       401:
 *         description: ไม่ได้รับอนุญาต (Unauthorized)
 *       403:
 *         description: ไม่มีสิทธิ์ (Forbidden)
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /item/getbyiditem/{id}:
 *   get:
 *     summary: ดึงข้อมูลสินทรัพย์ตามไอดี
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "671fa3d9f0a3f2b1c9b01234"
 *     responses:
 *       200:
 *         description: สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Item'
 *       404:
 *         description: ไม่พบรายการ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value: { "message": "Item not found" }
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/**
 * @swagger
 * /item/{id}:
 *   delete:
 *     summary: ลบสินทรัพย์ตามไอดี
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "671fa3d9f0a3f2b1c9b01234"
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *       404:
 *         description: ไม่พบรายการ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 value: { "message": "Item not found" }
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/**
 * @swagger
 * /item/getitemcar:
 *   get:
 *     summary: ดึงรายการสินทรัพย์ประเภทรถกอล์ฟทั้งหมด
 *     tags: [Item]
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
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/**
 * @swagger
 * /item/getitembag:
 *   get:
 *     summary: ดึงรายการสินทรัพย์ประเภทถุงกอล์ฟทั้งหมด
 *     tags: [Item]
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
 *                 $ref: '#/components/schemas/Item'
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */

/**
 * @swagger
 * /item/all-status:
 *   get:
 *     summary: ดูสรุปสถานะของสินทรัพย์ทั้งหมด
 *     tags: [Item]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: สรุปสถานะสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ItemSummary'
 *             examples:
 *               sample:
 *                 value:
 *                   golfCar: { booked: 2, inUse: 4, clean: 1, available: 10, spare: 1, broken: 0 }
 *                   golfBag: { booked: 1, inUse: 3, clean: 2, available: 15, spare: 0, broken: 1 }
 *       401:
 *         description: ไม่ได้รับอนุญาต
 *       403:
 *         description: ไม่มีสิทธิ์
 *       500:
 *         description: ข้อผิดพลาดภายในเซิร์ฟเวอร์
 */
