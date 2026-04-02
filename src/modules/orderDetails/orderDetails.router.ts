import { Router } from "express";
import {
  createOrderDetails,
  deleteOrderDetails,
  getAllOrderDetails,
  getDetailOrderDetails,
} from "./orderDetails.handler";

const orderDetailsRouter = Router();

orderDetailsRouter.get("/", getAllOrderDetails);

orderDetailsRouter.get("/:id", getDetailOrderDetails);

orderDetailsRouter.post("/", createOrderDetails);

orderDetailsRouter.delete("/:id", deleteOrderDetails);

export default orderDetailsRouter;
