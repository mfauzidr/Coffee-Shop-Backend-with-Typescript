import { Router } from "express"
import { getAllSizes, getAllVariants } from "../handlers/sizeAndVariants"

export const sizeRouter = Router()

sizeRouter.get('/', getAllSizes)

export const variantRouter = Router()

variantRouter.get('/', getAllVariants)
