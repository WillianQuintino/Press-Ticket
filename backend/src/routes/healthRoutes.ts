import express from "express";
import * as HealthController from "../controllers/HealthController";
import { healthLimiter } from "../config/rateLimiter";

const healthRoutes = express.Router();

// Rota pública — sem isAuth — para PM2, Docker e CI/CD
healthRoutes.get("/health", healthLimiter, HealthController.check);

export default healthRoutes;
