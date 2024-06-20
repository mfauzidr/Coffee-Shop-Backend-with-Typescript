import { Router } from "express"

import usersRouter from "./users"
import productsRouter from "./products"
import promosRouter from "./promos"
import ordersRouter from "./orders"
import orderDetailsRouter from "./orderDetails"
import authRouter from "./auth"

const router = Router()

router.use("/users", usersRouter)
router.use("/products", productsRouter)
router.use("/promos", promosRouter)
router.use("/orders", ordersRouter)
router.use("/orderDetails", orderDetailsRouter)

router.use("/", authRouter)

export default router