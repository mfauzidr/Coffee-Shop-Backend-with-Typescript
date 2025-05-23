export interface IOrderDetails {
  orderNumber: string;
  productName: string;
  size: string;
  variant: string;
  quantity: number;
}

export interface IOrderDetailsParams {
  id: number;
}
