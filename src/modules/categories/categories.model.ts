export interface ICategories {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IProductCategories {
  productId: number;
  categoryId: number;
}

export interface IProductCategoryBody {
  productId: number;
  categoryId: number;
}
