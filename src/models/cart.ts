export interface ICart extends ICartBody {
  id: number;
  productName: string;
  quantity: number;
  size?: string;
  variant?: string;
  subtotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartParams {
  id: number;
}

export interface ICartQueryParams {
  userId?: string;
}

export interface ICartBody {
  userId: string;
  productId: number;
  qty: number;
  sizeId: number;
  variantId: number;
  subtotal: number;
}
