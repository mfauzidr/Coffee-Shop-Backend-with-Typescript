export interface IProducts extends IProductsBody {
  id: number;
  uuid: string;
  image?: string;
  category?: string;
  discount?: string;
  isRecommended?: boolean;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProductsParams {
  uuid: string;
}

export interface IProductsQueryParams {
  search?: string;
  category?: string;
  sortBy?: string;
  priceRange?: [number, number];
  minPrice?: number;
  maxPrice?: number;
  page?: string;
  limit?: string;
}

export interface IProductsBody {
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId?: number;
  sizeId?: number;
}
