/**
 * @swagger
 * tags:
 *   - name: Hole
 *     description: จัดการหลุมและรายงานปัญหา
 */

/**
 * @swagger
 * /hole/addhole:
 *   post:
 *     summary: สร้างหลุมใหม่
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               holeNumber:
 *                 type: number
 *     responses:
 *       "201":
 *         description: สร้างหลุมเรียบร้อย
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/close:
 *   put:
 *     summary: ปิดหลุม
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               holeNumber:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       "200":
 *         description: ปิดหลุมเรียบร้อย
 *       "400":
 *         description: ข้อมูลไม่ครบ
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/open:
 *   put:
 *     summary: เปิดหลุม
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               holeNumber:
 *                 type: number
 *     responses:
 *       "200":
 *         description: เปิดหลุมเรียบร้อย
 *       "400":
 *         description: ข้อมูลไม่ครบ
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/report:
 *   put:
 *     summary: รายงานหลุมกำลังแก้ไข
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               holeNumber:
 *                 type: number
 *     responses:
 *       "200":
 *         description: รายงานหลุมเรียบร้อย
 *       "400":
 *         description: ข้อมูลไม่ครบ
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/gethole:
 *   get:
 *     summary: ดึงข้อมูลหลุมทั้งหมด
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: รายการหลุม
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/gethole/{id}:
 *   get:
 *     summary: ดึงข้อมูลหลุมตาม ID
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       "200":
 *         description: ข้อมูลหลุม
 *       "404":
 *         description: ไม่พบหลุม
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/help-car:
 *   put:
 *     summary: รายงานปัญหารถกอล์ฟที่ต้องช่วย
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               holeNumber:
 *                 type: number
 *               description:
 *                 type: string
 *               bookingId:
 *                 type: string
 *     responses:
 *       "200":
 *         description: รายงานช่วยรถเรียบร้อย
 *       "404":
 *         description: ไม่พบหลุม
 *       "500":
 *         description: Server error
 */

/**
 * @swagger
 * /hole/go-car:
 *   put:
 *     summary: แก้ไขปัญหารถกอล์ฟ
 *     tags: [Hole]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               holeNumber:
 *                 type: number
 *     responses:
 *       "200":
 *         description: แก้ไขปัญหารถเรียบร้อย
 *       "404":
 *         description: ไม่พบหลุมหรือการจอง
 *       "500":
 *         description: Server error
 */
