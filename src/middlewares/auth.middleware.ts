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
  (
    req: Request<AppParams>,
    res: Response<IAuthResponse>,
    next: NextFunction
  ) => {
    const bearerToken = req.header("Authorization");

    if (!bearerToken) {
      return res.status(403).json({
        message: "Forbidden",
        err: "Forbidden Access",
      });
    }
    const token = bearerToken.split(" ")[1];
    jwt.verify(
      token,
      <string>process.env.JWT_SECRET,
      jwtOptions,
      (err, payload) => {
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
      }
    );
  };

export const redirectIfAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      // Validasi token menggunakan JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      if (decoded) {
        // Redirect ke home jika token valid
        res.redirect("/");
        return;
      }
    } catch (err) {
      // Jika token tidak valid, lanjutkan ke endpoint login
      return next();
    }
  }

  // Jika token tidak ada, lanjutkan ke login
  next();
};
