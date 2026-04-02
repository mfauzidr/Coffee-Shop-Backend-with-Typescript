import { Router } from "express"
import { getAllCategories } from "./categories.handler"

export const categoryRouter = Router()

categoryRouter.get('/', getAllCategories)