import { ParamsDictionary } from "express-serve-static-core"
import { IUserParams } from "./users"
import { IProductsParams, IProductsQueryParams } from "./products"
import { IPromosParams } from "./promos"
import { IOrdersParams } from "./orders"

export type AppParams = ParamsDictionary | IUserParams | IProductsParams | IPromosParams | IOrdersParams
export type QueryParams = IProductsQueryParams