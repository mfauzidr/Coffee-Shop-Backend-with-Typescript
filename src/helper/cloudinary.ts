import { Request } from "express-serve-static-core"
import DataUriParser from 'datauri/parser'
import path from 'path'

import cloudinary from "../config/cloud"
import { UploadApiOptions, UploadApiResponse } from "cloudinary"

const uploader = async (req: Request, prefix: string, uid: string): Promise<{ result?: UploadApiResponse err: Error }> => {
  const { file } = req
  if (!file) return {}
  const { buffer } = file

  const parser = new DataUriParser()
  const extName = path.extname(file.originalname)
  const base64file = parser.format(extName, buffer)
  if (!base64file.content) return {}

  const publicId = `${prefix}-${file.fieldname}-${uid}`

  try {
    const uploadConfig: UploadApiOptions = {
      folder: "Coffeeshop",
      public_id: publicId
    }
    const result = await cloudinary.uploader.upload(base64file?.content, uploadConfig)
  } catch (error) {
    return {}
  }
}