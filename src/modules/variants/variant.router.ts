import { Router } from "express"
import { getAllVariants } from "./variant.handler"

export const variantRouter = Router()

variantRouter.get('/', getAllVariants)