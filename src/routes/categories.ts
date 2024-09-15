import { Router } from "express"
import { getAllCategories } from "../handlers/categories"

export const categoryRouter = Router()

categoryRouter.get('/', getAllCategories)