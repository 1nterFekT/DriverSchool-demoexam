import express from "express";

import * as assignmentController from "../controllers/assignmentController.js";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", isAuthenticated, assignmentController.renderHome);
router.post(
    "/assignments",
    isAuthenticated,
    assignmentController.createAssignment
);

router.get("/api/assignments", assignmentController.getAllAssignments);
router.get("/api/assignments/:id", assignmentController.getAssignmentById);

export default router;
