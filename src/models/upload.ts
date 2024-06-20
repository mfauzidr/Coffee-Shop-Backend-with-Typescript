export interface IUploadBody {
  image: string
  userId: number
}

export interface IUploadParams {
  userId: string
}

export interface IUpload extends IUploadBody {
  id: number
  createdAt: Date
  updatedAt?: Date
}