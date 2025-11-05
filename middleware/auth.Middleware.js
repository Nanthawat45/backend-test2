import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
      if (req.originalUrl === "/api/stripe/webhook") {
        return next();
    }
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
}

export const authorizeRoles = (...roles) => {//...roles คือการรับหลายๆ บทบาท (Rest Parameter)
  return (req, res, next) => {
    // ตรวจสอบว่า req.user (ที่มาจาก protect middleware) มีบทบาทที่ถูกต้องหรือไม่
    if (!req.user || !roles.includes(req.user.role)) { //req.user.role คือ role ของผู้ใช้ที่ล็อกอินอยู่  //!roles ถูกส่งเข้ามาตอนเรียก authorizeRoles
      return res.status(403).json({ message: `User role '${req.user ? req.user.role : 'unknown'}'
        is not authorized to access this route` });// ถ้าไม่มีบทบาทที่ถูกต้อง ให้ส่งข้อความว่าไม่ได้รับอนุญาต
    }
    next(); // ไปยัง Middleware หรือ Controller ถัดไป
  };
};