import { Router } from "express";
import {
  deleteCarts,
  getAllCartItems,
  insertCart,
  updateCart,
} from "../handlers/cart";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.get("/", authMiddleware(["admin", "customer"]), getAllCartItems);
cartRouter.post("/add", authMiddleware(["admin", "customer"]), insertCart);
cartRouter.patch(
  "/edit/:id",
  authMiddleware(["admin", "customer"]),
  updateCart
);
cartRouter.delete(
  "/delete/:id",
  authMiddleware(["admin", "customer"]),
  deleteCarts
);

export default cartRouter;
