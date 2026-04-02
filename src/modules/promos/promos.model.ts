export interface IPromos extends IPromosBody {
  id: number
  uuid: string
  description?: string
  percentage?: number
  isExpired?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IPromosParams {
  id: number
}

export interface IPromosQueryParams {
  search?: string
}

export interface IPromosBody {
  name: string
  code: string
  maximumPromo: number
  minimumAmount: number
}