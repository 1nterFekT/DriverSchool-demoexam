import express from "express";

import { isAdmin } from "../../middlewares/adminMiddleware.js";
import * as adminController from "../controllers/adminController.js";

const router = express.Router();

router.get("/", (req, res) => {
    res.render("admin-login");
});

router.post("/", adminController.loginAdmin);

router.get("/dashboard", isAdmin, adminController.getDashboard);
router.post("/status", isAdmin, adminController.updateStatus);

export default router;
