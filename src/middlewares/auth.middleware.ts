import { NextFunction, Request, Response } from "express-serve-static-core";
import jwt, { SignOptions } from "jsonwebtoken";

import { AppParams } from "../models/params";
import { IAuthResponse } from "../models/response";
import { IPayload } from "../models/payload";

export const jwtOptions: SignOptions = {
  expiresIn: "30m",
  issuer: process.env.JWT_ISSUER,
};

export const authMiddleware =
  (role: string[]) =>
    (req: Request<AppParams>, res: Response<IAuthResponse>, next: NextFunction) => {
      const bearerToken = req.header("Authorization");

      if (!bearerToken) {
        return res.status(403).json({
          message: "Forbidden",
          err: "Forbidden Access",
        });
      }
      const token = bearerToken.split(" ")[1];
      jwt.verify(token, <string>process.env.JWT_SECRET, jwtOptions, (err, payload) => {
        if (err) {
          return res.status(403).json({
            message: err.message,
            err: err.name,
          });
        }
        if (role) {
          if (!role.includes((payload as IPayload).role as string)) {
            return res.status(403).json({
              message: "Forbidden",
              err: "Forbidden Access",
            });
          }
        }
        req.userPayload = payload;
        next();
      });
    };