import express from "express";

import * as assignmentController from "../controllers/assignmentController.js";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/api/assignments", assignmentController.getAllAssignments);
router.get("/api/assignments/:id", assignmentController.getAssignmentById);

router.get("/", isAuthenticated, (req, res) => {
    res.render("home", {
        userId: req.session.user.id,
    });
});

export default router;
