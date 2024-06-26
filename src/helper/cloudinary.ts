import { Request } from "express-serve-static-core"
import DataUriParser from 'datauri/parser'
import path from 'path'

import cloudinary from "../config/cloud"
import { UploadApiOptions, UploadApiResponse } from "cloudinary"

export const cloudinaryUploader = async (req: Request, prefix: string, uuid: string): Promise<{ result?: UploadApiResponse; error?: Error }> => {
  const { file } = req
  if (!file) return { error: new Error("File not found") }
  const { buffer } = file

  const parser = new DataUriParser()
  const extName = path.extname(file.originalname)
  const base64file = parser.format(extName, buffer)
  if (!base64file.content) return { error: new Error("Failed Parsing") }

  const publicId = `${prefix}-${file.fieldname}-${uuid}`

  try {
    const uploadConfig: UploadApiOptions = {
      folder: "Coffeeshop",
      public_id: publicId
    }
    const result = await cloudinary.uploader.upload(base64file.content, uploadConfig)
    return { result }
  } catch (error) {
    if (!(error instanceof Error)) {
      console.log(error);
    }
    return { error: error as Error }
  }
}