export interface IUser extends IUserBody {
  id: number;
  uuid: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IUserParams {
  uuid: string
  email?: string
}

export interface IUserQueryParams {
  search?: string;
  findBy?: string;
  orderBy?: string;
  page?: string;
  limit?: string
}

export interface IUserBody {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  address?: string;
  image?: string
}
