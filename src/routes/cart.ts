import { Router } from "express";
import {
  deleteAllCarts,
  deleteCarts,
  getAllCartItems,
  insertCart,
  updateCart,
} from "../handlers/cart";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.get("/", authMiddleware(["admin", "customer"]), getAllCartItems);
cartRouter.post("/add", authMiddleware(["admin", "customer"]), insertCart);
cartRouter.patch("/edit", authMiddleware(["admin", "customer"]), updateCart);
cartRouter.delete(
  "/delete/:id",
  authMiddleware(["admin", "customer"]),
  deleteCarts
);
cartRouter.delete(
  "/deleteAll/:userId",
  authMiddleware(["admin", "customer"]),
  deleteAllCarts
);

export default cartRouter;
