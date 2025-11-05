import express from "express";
import {
    createHole,
    close,
    open,
    report,
    getHoles,
    getByIdHoles,
    reportHelpCar,
    resolveGoCar
} from "../controllers/hole.Controller.js";
import { protect, authorizeRoles } from "../middleware/auth.Middleware.js";

const router = express.Router();

router.post("/addhole", protect, authorizeRoles("admin"), createHole);
router.put("/close", protect, authorizeRoles("caddy", "starter"), close);
router.put("/open", protect, authorizeRoles("caddy", "starter"), open);
router.put("/report", protect, authorizeRoles("caddy", "starter"), report);
router.get("/gethole", protect, authorizeRoles("caddy", "starter"), getHoles);
router.get("/gethole/:id", protect, authorizeRoles("caddy", "starter"), getByIdHoles);
router.put("/help-car", protect, authorizeRoles("caddy"), reportHelpCar);
router.put("/go-car", protect, authorizeRoles("starter"), resolveGoCar);
export default router;