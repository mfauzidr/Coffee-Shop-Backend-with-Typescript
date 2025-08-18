export interface IOrders extends IOrdersBody {
  id: number;
  uuid: string;
  orderNumber: string;
  image?: string;
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
  status?: string;
  deliveryMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
}

export interface IOrdersBody {
  userId: string;
  image?: string;
  fullName: string;
  email: string;
  status: string;
  deliveryAddress: string;
  deliveryMethod: string;
}

export interface IOrderDetailsBody extends IOrdersBody {
  productId: string | string[];
  sizeId: string | number[];
  variantId: string | number[];
  qty: string | number[];
}
