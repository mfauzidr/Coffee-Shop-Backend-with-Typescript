import { Router } from "express";
import { getAllCartItems, insertCart, updateCart } from "../handlers/cart";
import { authMiddleware } from "../middlewares/auth.middleware";

const cartRouter = Router();

cartRouter.get("/", authMiddleware(["admin", "customer"]), getAllCartItems);
cartRouter.post("/add", authMiddleware(["admin", "customer"]), insertCart);
cartRouter.patch(
  "/edit/:id",
  authMiddleware(["admin", "customer"]),
  updateCart
);

export default cartRouter;
