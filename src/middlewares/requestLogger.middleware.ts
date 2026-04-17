import { logger } from "@shared/logger/logger";
import { NextFunction, Request, Response } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.info({
    method: req.method,
    url: req.originalUrl,
  });

  next();
};
