import { Request, Response } from "express";
import {
  findAll,
  findDetails,
  insert,
  totalCount,
  update,
  deleteProduct,
  findOneById,
  insertProductImage,
  getProductImageCount,
  resetProductImagesPrimary,
  deleteProductImage,
  hasPrimaryProductImage,
  getFirstProductImageId,
  setProductImagePrimary,
} from "./products.repo";
import {
  IProducts,
  IProductsBody,
  IProductsParams,
  IProductsQueryParams,
} from "./products.model";
import { insertProductCategory } from "../../modules/categories/categories.repo";
import {
  insertProductSize,
  findProductSizeRelation,
  updateProductSizeRelation,
} from "../../modules/sizes/size.repo";
import { IErrResponse, IProductsResponse } from "../../shared/models/response.model";
import { cloudinaryUploader } from "../../shared/helper/cloudinary";
import paginLink from "../../shared/helper/paginLink";
import multer from "multer";
import { AppError } from "../../shared/helper/appError";

export const getAllProducts = async (
  req: Request<{}, {}, {}, IProductsQueryParams>,
  res: Response<IProductsResponse>
) => {
  const { priceRange } = req.query;

  let minPrice: number;
  let maxPrice: number;

  if (priceRange && Array.isArray(priceRange) && priceRange.length === 2) {
    [minPrice, maxPrice] = priceRange;
  } else {
    minPrice = 1000;
    maxPrice = Infinity;
  }

  const query = {
    ...req.query,
    minPrice,
    maxPrice,
  };

  const products = await findAll(query);

  if (products.length < 1) {
    throw new AppError("NO_DATA", "Products not found", 404);
  }

  const limit = req.query.limit || "6";
  const count = await totalCount(query);
  const currentPage = parseInt((req.query.page as string) || "1");
  const totalData = count;
  const totalPage = Math.ceil(totalData / parseInt(limit as string));

  return res.status(200).json({
    meta: {
      totalData,
      totalPage,
      currentPage,
      nextPage: currentPage != totalPage ? paginLink(req, "next") : null,
      prevPage: currentPage > 1 ? paginLink(req, "previous") : null,
    },
    message: `List all products. ${count} data found`,
    results: products,
  });
};

export const getDetailProduct = async (
  req: Request<IProducts>,
  res: Response<IProductsResponse>
): Promise<Response> => {
  const { uuid } = req.params;
  const product = await findDetails(uuid as string);
  if (product.length === 0) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }
  return res.json({
    success: true,
    message: "OK",
    results: product,
  });
};

export const createProduct = async (
  req: Request<{}, {}, IProductsBody>,
  res: Response<IProductsResponse>
): Promise<Response> => {
    const price = Number(req.body.price);

    const productData = {
      name: req.body.name,
      description: req.body.description,
      price,
    };
    const product = await insert(productData);
    const productUuid = product[0].uuid;
    const rawPrimaryImageIndex = Number(req.body.primaryImageIndex);
    const primaryImageIndex =
      Number.isInteger(rawPrimaryImageIndex) && rawPrimaryImageIndex >= 0
        ? rawPrimaryImageIndex
        : 0;

    if (req.body.categoryId) {
      const productId = product[0].id;
      const categoryId = req.body.categoryId;
      const data = {
        productId,
        categoryId,
      };
      await insertProductCategory(data);
    }

    if (req.body.sizeId) {
      const productId = product[0].id;
      const sizeId = req.body.sizeId;
      const data = {
        productId,
        sizeId,
      };
      await insertProductSize(data);
    }

    if (req.files && Array.isArray(req.files)) {
      const uploadResults: string[] = [];

      for (const [index, file] of (
        req.files as Express.Multer.File[]
      ).entries()) {
        const fakeReq = { file } as Request;

        const uploadResult = await cloudinaryUploader(
          fakeReq,
          "product",
          productUuid
        );

        if (uploadResult.error) {
          throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
        }

        if (uploadResult.result?.secure_url) {
          uploadResults.push(uploadResult.result.secure_url);
          await insertProductImage({
            productUuid,
            imageUrl: uploadResult.result.secure_url,
            isPrimary: index === primaryImageIndex,
            orderIndex: index + 1,
          });
        }
      }
    }

    return res.json({
      success: true,
      message: "Create product successfully",
      results: product,
    });
};

export const updateProduct = async (
  req: Request<{ uuid: string }, {}, IProductsBody>,
  res: Response<IProductsResponse>
): Promise<Response> => {
  const { uuid } = req.params;
  try {
    const {
      categoryId,
      sizeId,
      primaryImageIndex,
      deleteImageIds,
      ...bodyWithoutRelations
    } = req.body;

    const data = Object.fromEntries(
      Object.entries(bodyWithoutRelations).filter(([, value]) => {
        if (value === undefined || value === null) return false;
        if (typeof value === "string" && value.trim() === "") return false;
        return true;
      })
    ) as Partial<
      Omit<IProductsBody, "categoryId" | "sizeId" | "primaryImageIndex" | "deleteImageIds">
    >;

    let product = [] as IProducts[];
    if (Object.keys(data).length > 0) {
      product = await update(uuid, data as Omit<IProductsBody, "categoryId" | "sizeId">);
      if (product.length === 0) {
        throw new AppError("NOT_FOUND", "Products not found", 404);
      }
    } else {
      product = await findOneById(uuid);
      if (product.length === 0) {
        throw new AppError("NOT_FOUND", "Products not found", 404);
      }
    }

    if (req.body.deleteImageIds && Array.isArray(req.body.deleteImageIds)) {
      for (const imageId of req.body.deleteImageIds) {
        const deleted = await deleteProductImage(uuid, imageId);
        if (deleted === 0) {
          throw new AppError(
            "NOT_FOUND",
            `Image id ${imageId} not found for this product`,
            404,
          );
        }
      }

      const primaryExists = await hasPrimaryProductImage(uuid);
      if (!primaryExists) {
        const firstImageId = await getFirstProductImageId(uuid);
        if (firstImageId) {
          await setProductImagePrimary(firstImageId);
        }
      }
    }

    if (req.body.sizeId) {
      const productId = product[0].id;
      const sizeId = Number(req.body.sizeId);
      const existingSizeRelation = await findProductSizeRelation(productId);

      if (existingSizeRelation.length > 0) {
        await updateProductSizeRelation(productId, sizeId);
      } else {
        await insertProductSize({ productId, sizeId });
      }
    }

    if (req.files && Array.isArray(req.files)) {
      const rawPrimaryImageIndex = Number(req.body.primaryImageIndex);
      const primaryImageIndex =
        Number.isInteger(rawPrimaryImageIndex) && rawPrimaryImageIndex >= 0
          ? rawPrimaryImageIndex
          : 0;
      const existingImageCount = await getProductImageCount(uuid);
      await resetProductImagesPrimary(uuid);

      for (const [index, file] of (
        req.files as Express.Multer.File[]
      ).entries()) {
        const fakeReq = { file } as Request;

        const uploadResult = await cloudinaryUploader(
          fakeReq,
          "product",
          uuid
        );

        if (uploadResult.error) {
          throw new AppError("UPLOAD_FAILED", "Failed to upload image", 400);
        }

        if (uploadResult.result?.secure_url) {
          await insertProductImage({
            productUuid: uuid,
            imageUrl: uploadResult.result.secure_url,
            isPrimary: index === primaryImageIndex,
            orderIndex: existingImageCount + index + 1,
          });
        }
      }
    }

    if (product) {
      return res.json({
        success: true,
        message: "Update Success",
        results: product,
      });
    }
    throw new AppError("NOT_FOUND", "Products not found", 404);
  } catch (error) {
    if (error instanceof multer.MulterError) {
      if (error.message === "Incorrect File") {
        throw new AppError(
          "INVALID_FILE_TYPE",
          "Incorrect file type. Only jpg, png, and jpeg are allowed.",
          400,
        );
      }
      if (error.code === "LIMIT_FILE_SIZE") {
        throw new AppError("LIMIT_FILE_SIZE", "File is too large. Maximum size is 1MB.", 400);
      }
    }

    if (
      error instanceof Error &&
      error.message === "File too large"
    ) {
      throw new AppError("LIMIT_FILE_SIZE", "File is too large. Maximum size is 1MB.", 400);
    }

    throw error;
  }
};

export const deleteProducts = async (
  req: Request<IProductsParams>,
  res: Response<IProductsResponse>
): Promise<Response> => {
  const { uuid } = req.params;

  const product = await deleteProduct(uuid);

  if (product.length === 0) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  return res.json({
    success: true,
    message: "Delete success",
    results: product,
  });
};

export const getOneById = async (
  req: Request<IProducts>,
  res: Response<IProductsResponse>
): Promise<Response> => {
  const { uuid } = req.params;
  const product = await findOneById(uuid);
  if (product.length === 0) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }
  return res.json({
    success: true,
    message: "OK",
    results: product,
  });
};
