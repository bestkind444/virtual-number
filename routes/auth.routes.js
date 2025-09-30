import { Router } from "express";
import { registerUser, loginUser } from "../controller/auth.controller.js";
import { refreshToken } from "../middleware/auth.middleware.js";
const authRoutes = Router();

authRoutes.post("/register", registerUser);
authRoutes.post("/login", loginUser);
authRoutes.post("/refresh", refreshToken);

export default authRoutes;