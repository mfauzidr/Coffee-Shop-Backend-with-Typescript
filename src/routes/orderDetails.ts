import { Router } from "express"
import { createOrderDetails, deleteOrderDetails, getAllOrderDetails, getDetailOrderDetails } from "../handlers/orderDetails"

const orderDetailsRouter = Router()

orderDetailsRouter.get('/', getAllOrderDetails)

orderDetailsRouter.get('/:id', getDetailOrderDetails)

orderDetailsRouter.post('/', createOrderDetails)

// orderDetailsRouter.patch('/:id', updateOrderDetails)

orderDetailsRouter.delete('/:id', deleteOrderDetails)

export default orderDetailsRouter