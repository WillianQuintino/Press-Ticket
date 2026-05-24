import { Request, Response } from "express";
import database from "../database";
import { name, version } from "../../package.json";

export const check = async (req: Request, res: Response): Promise<Response> => {
  const startedAt = new Date().toISOString();

  try {
    await database.authenticate();

    return res.status(200).json({
      status: "ok",
      app: name,
      version,
      timestamp: startedAt,
      uptime: Math.floor(process.uptime()),
      database: "connected",
      environment: process.env.NODE_ENV || "production"
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno";

    return res.status(503).json({
      status: "error",
      app: name,
      version,
      timestamp: startedAt,
      database: "disconnected",
      error: message
    });
  }
};
