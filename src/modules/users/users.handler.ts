import { Request, Response } from "express";
import {
  findAllUsers,
  findDetails,
  insert,
  update,
  totalCount,
  getPassword,
  setActiveUser,
} from "../../modules/users/users.repo";
import {
  IUserParams,
  IUserBody,
  IUserQueryParams,
  IForgotPasswordBody,
} from "../../modules/users/users.model";
import { IErrResponse, IUserResponse } from "@shared/models/response.model";
import { cloudinaryUploader } from "@shared/helper/cloudinary";
import paginLink from "@shared/helper/paginLink";
import { AppParams } from "@shared/models/params.model";
import { IPayload } from "@shared/models/payload.model";
import bcrypt from "bcrypt";
import { AppError } from "@shared/helper/appError";

export const getAllUsers = async (
  req: Request<{}, {}, {}, IUserQueryParams>,
  res: Response<IUserResponse>,
) => {
  const users = await findAllUsers(req.query);
  if (users.length < 1) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }
  const limit = req.query.limit || "5";
  const count = await totalCount(req.query);
  const currentPage = parseInt((req.query.page as string) || "1");
  const totalData = count;
  const totalPage = Math.ceil(totalData / parseInt(limit as string));

  return res.status(200).json({
    meta: {
      totalData,
      totalPage,
      currentPage,
      nextPage: currentPage != totalPage ? paginLink(req, "next") : null,
      prevPage: currentPage > 1 ? paginLink(req, "previous") : null,
    },
    message: `List all users. ${count} data found`,
    results: users,
  });
};

export const getDetailUser = async (
  req: Request<IUserParams>,
  res: Response<IUserResponse>,
): Promise<Response> => {
  const { uuid } = req.params;

  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const user = await findDetails(uuid as string);
  if (user.length === 0) {
    throw new AppError("NO_DATA", "No Data Found", 404);
  }
  return res.status(200).json({
    success: true,
    message: "User Retrieved Successfully",
    results: user,
  });
};

export const createUsers = async (
  req: Request<{}, {}, IUserBody>,
  res: Response<IUserResponse>,
) => {
  const { password } = req.body;
  if (!req.body.fullName || !req.body.email || !req.body.password) {
    const missingFields: string[] = [];
    if (!req.body.fullName) missingFields.push("fullName");
    if (!req.body.email) missingFields.push("email");
    if (!req.body.password) missingFields.push("password");

    throw new AppError(
      "MISSING_FIELD",
      `${missingFields.join(", ")} cannot be empty`,
      400,
    );
  }

  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);
  req.body.password = hashed;

  const user = await insert(req.body);
  const userUuid = user[0].uuid;

  if (req.file) {
    const uploadResult = await cloudinaryUploader(req, "user", userUuid);

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result?.secure_url;
    await update(userUuid, { image: imageUrl });
  }
  return res.json({
    success: true,
    message: "Create user successfully",
    results: user,
  });
};

export const updateUsers = async (
  req: Request<{ uuid: string }, {}, IUserBody>,
  res: Response<IUserResponse>,
): Promise<Response> => {
  const {
    params: { uuid },
    body: { password },
  } = req;

  const data: Partial<IUserBody> = { ...req.body };

  if (password) {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(password, salt);
    data.password = hashed;
  }

  if (req.file) {
    const uploadResult = await cloudinaryUploader(req, "user", uuid);

    if (uploadResult.error) {
      throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
    }
    const imageUrl = uploadResult.result?.secure_url;
    data.image = imageUrl;
  }

  const user = await update(uuid, data);
  if (user.length < 1) {
    throw new AppError("NOT_FOUND", "Users not found", 404);
  }
  return res.json({
    success: true,
    message: "Update user successfully",
    results: user,
  });
};

export const deactivateUsers = async (
  req: Request<{ uuid: string }>,
  res: Response<IUserResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const result = await setActiveUser(uuid, false);
  if (result.length < 1) {
    throw new AppError("NOT_FOUND", "Users not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Users deactived",
    results: result,
  });
};

export const restoreUsers = async (
  req: Request<{ uuid: string }>,
  res: Response<IUserResponse>,
): Promise<Response> => {
  const { uuid } = req.params;
  if (!uuid || uuid === ":uuid") {
    throw new AppError("NO_ID", "UUID must be provided", 400);
  }

  const result = await setActiveUser(uuid, true);
  if (result.length < 1) {
    throw new AppError("NOT_FOUND", "Users not found", 404);
  }

  return res.status(200).json({
    success: true,
    message: "Users restored",
    results: result,
  });
};

export const updatePassword = async (
  req: Request<{}, {}, IForgotPasswordBody>,
  res: Response<IUserResponse>,
) => {
  const { password, newPassword } = req.body;
  const uuid = (req as Request<AppParams> & { userPayload: IPayload })
    .userPayload!.uuid;

    const user = await getPassword(uuid!);
    if (!password) {
      throw new AppError("INVALID", "Insert Old Password", 400);
    }
    if (!newPassword) {
      throw new AppError("INVALID", "Please insert the new password", 400);
    }
    if (!user) {
      throw new AppError("NOT_FOUND", "User Not Found", 404);
    }

    const isOldPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isOldPasswordCorrect) {
      throw new AppError("INVALID", "Wrong old password", 400);
    }

    if (password === newPassword) {
      throw new AppError(
        "INVALID",
        "Your new password can't be the same as your old password",
        400,
      );
    }

    const salt = await bcrypt.genSalt();
    const newHashed = await bcrypt.hash(newPassword, salt);

    const updatePassword = { password: newHashed };

    await update(uuid!, updatePassword);
    return res.json({
      success: true,
      message: "Update password successfully",
    });
  
};
