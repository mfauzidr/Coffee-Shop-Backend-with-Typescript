import { ICart } from "./cart";
import { IProductCategories } from "./categories";
import { IOrderDetails } from "./orderDetails";
import { IOrders } from "./orders";
import { IProducts } from "./products";
import { IPromos } from "./promos";
import { IProductSizes, ISizes, IVariants } from "./sizeAndVariants";
import { IUser } from "./users";

interface IPaginationMeta {
  totalData?: number;
  currentPage?: number;
  totalPage?: number;
  nextPage?: string | null;
  prevPage?: string | null;
}

interface IBasicResponse {
  success?: boolean;
  message: string;
  err?: string;
  warning?: string;
  meta?: IPaginationMeta;
}

export interface IUserResponse extends IBasicResponse {
  results?: IUser[];
}
export interface IAuthResponse extends IBasicResponse {
  results?: { token: string }[];
  uuid?: string;
}

export interface IProductsResponse extends IBasicResponse {
  results?: IProducts[];
}

export interface IPromosResponse extends IBasicResponse {
  results?: IPromos[];
}

export interface IOrderResponse extends IBasicResponse {
  results?: IOrders[];
}

export interface IOrderDetailsResponse extends IBasicResponse {
  results?: IOrderDetails[];
}

export interface ISizeResponse extends IBasicResponse {
  results?: ISizes[];
}

export interface IVariantResponse extends IBasicResponse {
  results?: IVariants[];
}

export interface ICartResponse extends IBasicResponse {
  results?: ICart[];
}

export interface IProductCategoryResponse extends IBasicResponse {
  results?: IProductCategories[];
}
export interface IProductSizeResponse extends IBasicResponse {
  results?: IProductSizes[];
}

export interface IErrResponse {
  code?: string;
  column?: string;
  detail?: string;
  message?: string;
}
