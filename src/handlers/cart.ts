import { Request, Response } from "express";
import { findAll, findAllByUid } from "../repositories/cart";
import { ICart, ICartQueryParams } from "../models/cart";
import { ICartResponse, IErrResponse } from "../models/response";

export const getAllCartItems = async (
  req: Request<{}, {}, {}, ICartQueryParams>,
  res: Response<ICartResponse>
) => {
  try {
    let cart: ICart[];
    if (req.query.userId) {
      cart = await findAllByUid(req.query);
    } else {
      cart = await findAll(req.query);
    }
    if (cart.length < 1) {
      throw new Error("no_data");
    }

    return res.json({
      success: true,
      message: "List all cart items",
      results: cart,
    });
  } catch (error) {
    const err = error as IErrResponse;
    if (err.message === "no_data") {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
