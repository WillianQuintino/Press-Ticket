import express from "express";
import * as HealthController from "../controllers/HealthController";

const healthRoutes = express.Router();

// Rota pública — sem isAuth — para PM2, Docker e CI/CD
healthRoutes.get("/health", HealthController.check);

export default healthRoutes;
