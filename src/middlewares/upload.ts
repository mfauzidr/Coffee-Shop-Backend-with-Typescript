import multer, { Field, Options, diskStorage, memoryStorage } from "multer";
import path from "path";
import { NextFunction, RequestHandler } from "express-serve-static-core";
import { Request, Response } from "express"
import fs from "fs"
import { AppParams } from "../models/params";

const multerDisk = diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/imgs");
  },
  filename: (req, file, cb) => {
    const extName = path.extname(file.originalname);
    const newFileName = `image-${Date.now()}${extName}`;
    cb(null, newFileName);
  },
});

const multerMemory = memoryStorage()

const createMulterOptions = (storageEngine: multer.StorageEngine): Options => ({
  storage: storageEngine,
  limits: {
    fileSize: 1e6
  },
  fileFilter: (req, file, cb) => {
    const allowedExtRe = /jpg|png|jpeg/gi;
    const extName = path.extname(file.originalname);
    if (!allowedExtRe.test(extName)) return cb(new Error("Incorrect File"));
    cb(null, true);
  },
});

const uploader = multer(createMulterOptions(multerDisk));
const cloudUploader = multer(createMulterOptions(multerMemory))

export const singleUploader = (fieldName: string) => (req: Request, res: Response, next: NextFunction) => {
  const upload = uploader.single(fieldName)
  upload(req, res, function (err) {
    const sizeErrReg = /File too large/
    if (err instanceof Error) {

      if (req.file) {
        const filePath = path.join(__dirname, '..', 'public', 'imgs', req.file.filename);
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting file:', unlinkErr);
        });
      }

      if (sizeErrReg.test(err.message)) {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum 1MB."
        })
      }

      if (err.message === "Incorrect File") {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPEG, JPG, and PNG are allowed."
        })
      }
    }
    next()
  })
};

export const multiUploader = (fieldName: string, maxCount: number) => uploader.array(fieldName, maxCount);
export const multiFieldUploader = (fieldConfig: Field[]) => uploader.fields(fieldConfig);

export const singleCloudUploader = (fieldName: string) => cloudUploader.single(fieldName) as RequestHandler<AppParams>;
export const multiCloudUploader = (fieldName: string, maxCount: number) => cloudUploader.array(fieldName, maxCount);
export const multiFieldCloudUploader = (fieldConfig: Field[]) => cloudUploader.fields(fieldConfig);