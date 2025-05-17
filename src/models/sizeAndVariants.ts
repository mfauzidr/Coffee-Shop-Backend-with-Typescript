export interface ISizes {
  id: number;
  size: string;
  additionalPrice: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IVariants {
  id: number;
  name: string;
  additionalPrice: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IProductSizes {
  productId: number;
  sizeId: number;
}

export interface IProductSizeBody {
  productId: number;
  sizeId: number;
}
