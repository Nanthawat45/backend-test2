/**
 * @swagger
 * tags:
 *   - name: User
 *     description: การจัดการผู้ใช้งานระบบ
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: สมัครผู้ใช้งานทั่วไป
 *     tags: [User]
 *     requestBody:
 *       description: ข้อมูลผู้ใช้สำหรับสมัคร
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Aa2 Test"
 *               phone:
 *                 type: string
 *                 example: "0812223333"
 *               email:
 *                 type: string
 *                 example: "aa2@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Nn123456789"
 *               role:
 *                 type: string
 *                 example: "user"
 *     responses:
 *       201:
 *         description: สมัครผู้ใช้สำเร็จ
 *       400:
 *         description: ผู้ใช้งานมีอยู่แล้ว
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/admin/register:
 *   post:
 *     summary: สมัครผู้ใช้งานโดย Admin
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: ข้อมูลผู้ใช้สำหรับสมัครโดย Admin
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, phone, email, password, role]
 *             properties:
 *               name: { type: string, example: "Caddy One" }
 *               phone: { type: string, example: "0822222222" }
 *               email: { type: string, example: "caddy1@example.com" }
 *               password: { type: string, example: "CaddyP@ss1" }
 *               role: { type: string, example: "caddy" }
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: สมัครผู้ใช้สำเร็จโดย Admin
 *       400:
 *         description: ผู้ใช้งานมีอยู่แล้ว
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [User]
 *     requestBody:
 *       description: ข้อมูลสำหรับเข้าสู่ระบบ
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "aa2@gmail.com"
 *               password:
 *                 type: string
 *                 example: "Nn123456789"
 *     responses:
 *       200:
 *         description: เข้าสู่ระบบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 name: { type: string }
 *                 phone: { type: string }
 *                 email: { type: string }
 *                 role: { type: string }
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง
 */

/**
 * @swagger
 * /user/logout:
 *   post:
 *     summary: ออกจากระบบ
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ออกจากระบบสำเร็จ
 */

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: ข้อมูลผู้ใช้งานปัจจุบัน
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลผู้ใช้
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id: { type: string }
 *                 name: { type: string }
 *                 phone: { type: string }
 *                 email: { type: string }
 *                 role: { type: string }
 *                 img:  { type: string }
 *       404:
 *         description: ไม่พบผู้ใช้งาน
 */

/**
 * @swagger
 * /user/all:
 *   get:
 *     summary: ดึงข้อมูลผู้ใช้ทั้งหมด
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลผู้ใช้ทั้งหมด
 *       404:
 *         description: ไม่พบผู้ใช้งาน
 */

/**
 * @swagger
 * /user/getbyiduser/{id}:
 *   get:
 *     summary: ข้อมูลผู้ใช้งานตาม ID
 *     tags: [User]
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
 *         description: ข้อมูลผู้ใช้
 *       404:
 *         description: ไม่พบผู้ใช้งาน
 */

/**
 * @swagger
 * /user/updateuser/{id}:
 *   put:
 *     summary: อัพเดตข้อมูลผู้ใช้ (Admin/Owner)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: ฟอร์มอัปเดตข้อมูลผู้ใช้
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:     { type: string }
 *               phone:    { type: string }
 *               email:    { type: string }
 *               password: { type: string }
 *               role:     { type: string }
 *               img:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: อัพเดตผู้ใช้สำเร็จ
 *       404:
 *         description: ไม่พบผู้ใช้งาน
 */

/**
 * @swagger
 * /user/allnotuser:
 *   get:
 *     summary: ดึงข้อมูลพนักงานทั้งหมด (ไม่รวม user)
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ข้อมูลผู้ใช้ที่ไม่ใช่ user
 *       500:
 *         description: Server error
 */
