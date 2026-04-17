import { Router } from "express";

import usersRouter from "@modules/users/users.router";
import productsRouter from "@modules/products/products.router";
import promosRouter from "@modules/promos/promos.router";
import ordersRouter from "@modules/orders/orders.router";
import orderDetailsRouter from "@modules/orderDetails/orderDetails.router";
import authRouter from "@modules/auth/auth.router";
import { sizeRouter } from "@modules/sizes/size.router";
import { variantRouter } from "@modules/variants/variant.router";
import { categoryRouter } from "@modules/categories/categories.router";
import cartRouter from "@modules/carts/cart.router";
import { globalErrorHandler } from "@middlewares/error.middleware";
import { requestLogger } from "@middlewares/requestLogger.middleware";

const router = Router();

router.use("/users", usersRouter);
router.use("/products", productsRouter);
router.use("/promos", promosRouter);
router.use("/orders", ordersRouter);
router.use("/order-details", orderDetailsRouter);
router.use("/size", sizeRouter);
router.use("/variant", variantRouter);
router.use("/categories", categoryRouter);
router.use("/cart", cartRouter);

router.use("/auth", authRouter);

router.use(requestLogger);
router.use(globalErrorHandler);

export default router;
