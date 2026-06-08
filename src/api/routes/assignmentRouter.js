import express from "express";

import * as assignmentController from "../controllers/assignmentController.js";

const router = express.Router();

router.get("/api/assignments", assignmentController.getAllAssignments);
router.get("/api/assignments/:id", assignmentController.getAssignmentById);

export default router;
