import express from "express";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get("/api/users", userController.getAllUsers);
router.get("/api/users/:id", userController.getUserById);
router.get("/api/users/:id/assignments", userController.getAssignmentsByUserId);

export default router;
