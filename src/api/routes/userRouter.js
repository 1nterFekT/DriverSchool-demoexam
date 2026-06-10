import express from "express";

import * as userController from "../controllers/userController.js";
import { isAuthenticated } from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login");
});

router.post("/login", userController.login);

router.get("/register", (req, res) => {
    res.render("register");
});

router.post("/register", userController.register);

router.get("/logout", userController.logout);

router.get("/profile", isAuthenticated, userController.getProfile);
router.post("/reviews", isAuthenticated, userController.createReview);

router.get("/api/users", userController.getAllUsers);
router.get("/api/users/:id", userController.getUserById);
router.get("/api/users/:id/assignments", userController.getAssignmentsByUserId);

export default router;
