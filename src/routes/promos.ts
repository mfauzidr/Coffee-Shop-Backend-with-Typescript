import { Router } from "express"
import { createPromos, getAllPromos, getDetailPromos, updatePromos, deletePromos } from "../handlers/promos"
import { authMiddleware } from "../middlewares/auth.middleware"

const promosRouter = Router()

promosRouter.get('/', authMiddleware(["admin", "customer"]), getAllPromos)

promosRouter.get('/:id', authMiddleware(["admin", "customer"]), getDetailPromos)

promosRouter.post('/', authMiddleware(["admin"]), createPromos)

promosRouter.patch('/:id', authMiddleware(["admin"]), updatePromos)

promosRouter.delete('/:id', authMiddleware(["admin"]), deletePromos)

export default promosRouter