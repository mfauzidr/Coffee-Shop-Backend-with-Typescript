export interface IOrders extends IOrdersBody {
  id: number
  uuid: string
  orderNumber: string
  promoId?: number
  taxAmount?: number
  createdAt: Date
  updatedAt: Date
}

export interface IOrdersParams {
  uuid: string
}

export interface IOrdersQueryParams {
  searchOrder?: string
  page?: string
  limit?: string
}

export interface IOrdersBody {
  userId: number
  productId: number[]
  status: string
  deliveryAddress?: string
  fullName: string
  email: string
}