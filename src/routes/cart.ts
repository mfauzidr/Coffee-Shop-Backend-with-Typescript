import { Router } from "express";
import { getAllCartItems } from "../handlers/cart";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.get("/", authMiddleware(["admin", "customer"]), getAllCartItems);

export default cartRouter;
