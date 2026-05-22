import { Router } from "express"
import { createOrders, deleteOrders, getAllOrders, getDetailOrders, updateOrders } from "./orders.handler"
import { authMiddleware } from "../../middlewares/auth.middleware"

const ordersRouter = Router()

ordersRouter.get('/', getAllOrders)

ordersRouter.get('/:uuid', authMiddleware(["admin", "customer"]), getDetailOrders)

ordersRouter.post('/', createOrders)

ordersRouter.patch('/:uuid', authMiddleware(["admin", "customer"]), updateOrders)

ordersRouter.delete('/:uuid', authMiddleware(["admin"]), deleteOrders)

export default ordersRouter