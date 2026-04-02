import { Router } from "express"
import { getAllSizes } from "./size.handler"

export const sizeRouter = Router()

sizeRouter.get('/', getAllSizes)
