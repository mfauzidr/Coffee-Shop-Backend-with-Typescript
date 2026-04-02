import { Request } from "express-serve-static-core";
import { UploadApiOptions, UploadApiResponse } from "cloudinary";
import DataUriParser from "datauri/parser";
import path from "path";

import cloudinary from "../config/cloud";

export const cloudinaryUploader = async (
  req: Request,
  prefix: string,
  uid: string
): Promise<{ result?: UploadApiResponse; error?: Error }> => {
  const { file } = req;
  if (!file) return { error: new Error("File Not Found") };
  const { buffer } = file;

  const parser = new DataUriParser();
  const extName = path.extname(file.originalname);
  const base64File = parser.format(extName, buffer);
  if (!base64File.content) return { error: new Error("Failed Parsing") };

  const publicId = `${prefix}-${file.fieldname}-${uid}`;

  try {
    const uploadConfig: UploadApiOptions = {
      folder: "Coffee Shop",
      public_id: publicId,
    };
    const result = await cloudinary.uploader.upload(base64File.content, uploadConfig);
    return { result };
  } catch (error) {
    if (!(error instanceof Error)) {
      console.log(error);
    }
    return { error: error as Error };
  }
};