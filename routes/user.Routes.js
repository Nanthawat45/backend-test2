import express from 'express';
import {
    registerUser,
    registerByAdmin,
    login,
    getUserProfile,
    getAllUser,
    logout,
    getUserById,
    updateUser,
    getAllNotUser
} from "../controllers/user.Controller.js";
import { protect, authorizeRoles } from '../middleware/auth.Middleware.js';
import { upload, uploadToFirebase } from "../middleware/file.middleware.js";

const router = express.Router();

router.post("/admin/register", protect, authorizeRoles('admin'), upload, uploadToFirebase, registerByAdmin);
router.post("/register", registerUser);
router.post("/login", login);
router.get("/profile", protect, getUserProfile);
router.get("/all", protect, getAllUser);
router.post("/logout", protect, logout);
router.get("/getbyiduser/:id", protect, getUserById);
router.put("/updateuser/:id", protect, upload, uploadToFirebase, updateUser);
router.get("/allnotuser", protect, authorizeRoles('admin'), getAllNotUser);

export default router;