import { Request, Response } from "express";
import { IUserBody } from "../../modules/users/users.model";
import { register, getEmail } from "./auth.repo";
import { IAuthResponse, IErrResponse } from "@shared/models/response.model";
import { IPayload } from "@shared/models/payload.model";
import { jwtOptions } from "@middlewares/auth.middleware";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { AppError } from "@shared/helper/appError";

export const login = async (
  req: Request<{}, {}, IUserBody>,
  res: Response<IAuthResponse>
) => {
  const { email, password } = req.body;
  if(!email){
    throw new AppError("NO_EMAIL", "Please enter your email", 400)
  }
  if(!password || password === ""){
    throw new AppError("NO_PASS", "Please enter your password", 400)
  }
    const user = await getEmail(email);
    if (!user) {
      throw new AppError("NO_DATA", "User not found", 400);
    }
    const hash = user.password;
    const isValid = await bcrypt.compare(password, hash);
    if (!isValid) {
      throw new AppError("WRONG_PASSWORD", "Wrong Password", 400)
    }

    const payload: IPayload = { id: user.id, uuid: user.uuid, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET as string,
      jwtOptions
    );

    return res.status(200).json({
      success: true,
      message: `Login Success.`,
      results: [{ token }],
    });
};

export const registerUser = async (
  req: Request<{}, {}, IUserBody>,
  res: Response
) => {
  const { password } = req.body;

  if (!req.body.fullName || !req.body.email || !password) {
    const missingFields: string[] = [];
    if (!req.body.fullName) missingFields.push("fullName");
    if (!req.body.email) missingFields.push("email");
    if (!password) missingFields.push("password");

    throw new AppError("MISSING_FIELD", `${missingFields.join(", ")} cannot be empty`, 400)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!req.body.email.match(emailRegex)) {
    throw new AppError("INVALID", "Invalid email format", 400)
  }

  const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/;
  if (
    req.body.fullName.match(specialCharsRegex) ||
    req.body.password.match(specialCharsRegex)
  ) {
    const invalidFields: string[] = [];
    if (req.body.fullName.match(specialCharsRegex))
      invalidFields.push("fullName");
    if (req.body.password.match(specialCharsRegex))
      invalidFields.push("password");

    throw new AppError("INVALID", `${invalidFields.join(", ")} cannot contain special characters`, 400)
  }
  
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);

    const user = await register(req.body, hashed);

    return res.status(201).json({
      success: true,
      message: "Register successfully",
      results: user,
    });
};
