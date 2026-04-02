import { ParamsDictionary } from "express-serve-static-core";
import { IUserParams } from "@modules/users/users.model";
import { IProductsParams, IProductsQueryParams } from "@modules/products/products.model";
import { IPromosParams } from "@modules/promos/promos.model";
import { IOrdersParams } from "@modules/orders/orders.model";

export type AppParams =
  | ParamsDictionary
  | IUserParams
  | IProductsParams
  | IPromosParams
  | IOrdersParams;
export type QueryParams = IProductsQueryParams;
