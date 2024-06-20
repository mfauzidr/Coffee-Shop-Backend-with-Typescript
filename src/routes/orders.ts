import { Router } from "express"
import { createOrders, deleteOrders, getAllOrders, getDetailOrders, updateOrders } from "../handlers/orders"
import { authMiddleware } from "../middlewares/auth.middleware"

const ordersRouter = Router()

ordersRouter.get('/', authMiddleware(["admin"]), getAllOrders)

ordersRouter.get('/:uuid', authMiddleware(["admin", "customer"]), getDetailOrders)

ordersRouter.post('/', authMiddleware(["admin", "customer"]), createOrders)

ordersRouter.patch('/:uuid', authMiddleware(["admin", "customer"]), updateOrders)

ordersRouter.delete('/:uuid', authMiddleware(["admin"]), deleteOrders)

export default ordersRouter