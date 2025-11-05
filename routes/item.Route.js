import express from "express";
import {
    createItem,
    getByIdItem,
    deleteItem,
    getItemCar,
    getItemBag,
    getItemAllStatus
} from "../controllers/item.controller.js";
import { protect, authorizeRoles} from '../middleware/auth.Middleware.js';

const router = express.Router();

router.post("/additem", protect, createItem);
router.get("/getitemcar", protect, authorizeRoles("admin", "starter"), getItemCar);
router.get("/getitembag", protect, authorizeRoles("admin", "starter"), getItemBag);
router.delete("/:id", protect, authorizeRoles("admin", "starter"), deleteItem);
router.get("/getbyiditem/:id", protect, getByIdItem);
router.get("/all-status", protect, getItemAllStatus);

export default router;
