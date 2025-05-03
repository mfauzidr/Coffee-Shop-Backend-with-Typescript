import { Router } from "express";

import usersRouter from "./users";
import productsRouter from "./products";
import promosRouter from "./promos";
import ordersRouter from "./orders";
import orderDetailsRouter from "./orderDetails";
import authRouter from "./auth";
import { sizeRouter, variantRouter } from "./sizeAndVariants";
import { categoryRouter } from "./categories";
import cartRouter from "./cart";

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

router.use("/", authRouter);

export default router;
