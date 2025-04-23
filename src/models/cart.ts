export interface ICartUpdateBody {
  productSizeId?: number;
  productVariantId?: number;
  quantity?: number;
  subtotal?: number;
}

export interface ICart {
  id: number;
  userId: string;
  productId: string | number[];
  sizeId: string | number[];
  variantId: string | number[];
  qty: string | number[];
  productName: string;
  image?: string;
  size?: string;
  variant?: string;
  subtotal: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICartParams {
  id: number;
  userId: string;
}

export interface ICartQueryParams {
  userId?: string;
}

export interface ICartBody {
  userId: string;
  productId: string | string[];
  sizeId: string | number[];
  variantId: string | number[];
  qty: string | number[];
}

export interface ICartBatchUpdateBody extends ICartBody {
  id: number;
}
