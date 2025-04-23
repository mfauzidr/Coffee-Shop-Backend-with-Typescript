export interface IOrders extends IOrdersBody {
  id: number;
  uuid: string;
  orderNumber: string;
  subtotal: number;
  promoId?: number;
  taxAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrdersParams {
  uuid: string;
}

export interface IOrdersQueryParams {
  userId?: string;
  orderNumber?: string;
  page?: string;
  limit?: string;
}

export interface IOrdersBody {
  userId: string;
  fullName: string;
  email: string;
  deliveryAddress: string;
  deliveryMethod: string;
}

export interface IOrderDetailsBody extends IOrdersBody {
  productId: string | string[];
  sizeId: string | number[];
  variantId: string | number[];
  qty: string | number[];
}
