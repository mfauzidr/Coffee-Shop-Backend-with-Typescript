import { Request, Response } from "express";
import { IUserBody } from "../models/users";
import { IAuthResponse, IErrResponse, IUserResponse } from "../models/response";
import { register, getEmail } from "../repositories/auth";
import bcrypt from "bcrypt"
import { update } from "../repositories/users";
import jwt from 'jsonwebtoken'
import { IPayload } from "../models/payload";
import { jwtOptions } from "../middlewares/auth.middleware";

export const login = async (req: Request<{}, {}, IUserBody>, res: Response<IAuthResponse>) => {
  const { email, password } = req.body
  try {
    const user = await getEmail(email)
    if (!user) {
      throw new Error('wrong')
    }
    const hash = user.password
    const name = user.fullName
    const isValid = await bcrypt.compare(password, hash)
    if (!isValid) throw new Error('wrong');

    const payload: IPayload = { uuid: user.uuid, role: user.role }
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, jwtOptions)

    return res.json({
      success: true,
      message: `Login Success. Welcome ${name || email}`,
      results: [{ token }]
    });
  } catch (error) {
    const err = error as IErrResponse
    if (err.message === 'wrong') {
      return res.status(401).json({
        success: false,
        message: 'Wrong email or password',
      });
    }
    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
}

export const registerUser = async (req: Request<{}, {}, IUserBody>, res: Response) => {
  const { password } = req.body

  //validasi input
  if (!req.body.fullName || !req.body.email || !password) {
    const missingFields = [];
    if (!req.body.fullName) missingFields.push('fullName');
    if (!req.body.email) missingFields.push('email');
    if (!password) missingFields.push('password');

    return res.status(400).json({
      success: false,
      message: `${missingFields.join(', ')} cannot be empty`
    })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!req.body.email.match(emailRegex)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/
  if (req.body.fullName.match(specialCharsRegex) || req.body.password.match(specialCharsRegex)) {
    const invalidFields = [];
    if (req.body.fullName.match(specialCharsRegex)) invalidFields.push('fullName');
    if (req.body.password.match(specialCharsRegex)) invalidFields.push('password');

    return res.status(400).json({
      success: false,
      message: `${invalidFields.join(', ')} cannot contain special characters`
    });
  }
  try {
    const salt = await bcrypt.genSalt()
    const hashed = await bcrypt.hash(password, salt)

    const user = await register(req.body, hashed)

    return res.status(201).json({
      success: true,
      message: 'Register successfully',
      results: user
    })
  } catch (error) {
    const err = error as IErrResponse
    if (err.code === "23502") {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`
      })
    }
    if (err.code === "23505") {
      const errDetails = err.detail?.match(/\((.*?)\)=\((.*?)\)/)
      const column = errDetails ? errDetails[1] : 'field'

      return res.status(400).json({
        success: false,
        message: `${column} already exist.`
      })
    }

    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const forgotPassword = async (req: Request<{}, {}, IUserBody>, res: Response<IUserResponse>) => {
  const { email, password, role } = req.body

  try {
    const user = await getEmail(email)
    if (!email) {
      throw new Error('Insert Email')
    }
    if (!user) {
      throw new Error('Email is not registered');
    }
    if (!password) {
      throw new Error('Please insert the new password');
    }
    const salt = await bcrypt.genSalt()
    const hashed = await bcrypt.hash(password, salt)

    const updatePassword = { password: hashed }

    const updateUser = await update(user.uuid, updatePassword)
    return res.json({
      success: true,
      message: 'Update password successfully',
    });

  } catch (error) {
    const err = error as IErrResponse
    console.log(JSON.stringify(err));
    return res.status(400).json({
      success: false,
      message: err.message || 'Bad request'
    });
  }
}