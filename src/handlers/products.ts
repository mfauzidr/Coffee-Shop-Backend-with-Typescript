import { Request, Response } from 'express'
import { findAll, findDetails, insert, totalCount, update, deleteProduct } from "../repositories/products"
import { IProducts, IProductsBody, IProductsParams, IProductsQueryParams } from "../models/products"
import { IErrResponse, IProductsResponse } from '../models/response'
import paginLink from '../helper/paginLink'
import multer from 'multer'
import fs from "fs"
import path from "path"

export const getAllProducts = async (req: Request<{}, {}, {}, IProductsQueryParams>, res: Response<IProductsResponse>) => {
  try {

    const products = await findAll(req.query)
    if (products.length < 1) {
      throw new Error('no_data')
    }
    const limit = req.query.limit || '6'
    const count = await totalCount(req.query)
    const currentPage = parseInt((req.query.page as string) || '1');
    const totalData = count
    const totalPage = Math.ceil(totalData / parseInt(limit as string));
    console.log(totalPage)
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
    })

  } catch (error) {
    const err = error as IErrResponse
    if (err.message === 'no_data') {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      })
    }

    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    })
  }
}
export const getDetailProduct = async (req: Request<IProducts>, res: Response<IProductsResponse>): Promise<Response> => {
  const { uuid } = req.params

  try {
    const product = await findDetails(uuid as string)
    if (product.length === 0) {
      throw new Error("Not Found")
    }
    return res.json({
      success: true,
      message: 'OK',
      results: product,
    })
  } catch (error) {
    const err = error as IErrResponse

    if (err.message === "Not Found") {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`
      })
    }

    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const createProduct = async (req: Request<{}, {}, IProductsBody>, res: Response<IProductsResponse>): Promise<Response> => {
  try {
    if (req.file) {
      const imgUrl = `/imgs/${req.file.filename}`
      req.body.image = imgUrl;
    }
    const product = await insert(req.body)

    return res.json({
      success: true,
      message: 'Create product successfully',
      results: product,
    })

  } catch (error) {
    const err = error as IErrResponse

    if (req.file) {
      const filePath = path.join(__dirname, '..', 'public', 'imgs', req.file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }

    if (err.code === "23505") {
      return res.status(400).json({
        success: false,
        message: `Product name already exist.`
      })
    }

    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      })
    }

    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
}

export const updateProduct = async (req: Request<{ uuid: string }, {}, IProductsBody>, res: Response<IProductsResponse>): Promise<Response> => {
  const { uuid } = req.params
  try {
    const data: Partial<IProductsBody> = {
      ...req.body
    }

    if (req.file) {
      const imgUrl = `/imgs/${req.file.filename}`
      req.body.image = imgUrl;
    }

    console.log(req.body);
    const product = await update(uuid, data)
    if (product) {
      return res.json({
        success: true,
        message: 'Update Success',
        results: product
      })
    }
    return res.status(404).json({
      success: false,
      message: 'Products not found'
    })
  } catch (error) {
    const err = error as IErrResponse
    if (req.file) {
      const filePath = path.join(__dirname, '..', 'public', 'imgs', req.file.filename);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    }

    if (err instanceof multer.MulterError) {
      if (err.message === 'Incorrect File') {
        return res.status(400).json({
          success: false,
          message: 'Incorrect file type. Only jpg, png, and jpeg are allowed.'
        });
      }
    }

    if (err.message === 'File too large') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 1MB.'
      });
    }
    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`
      })
    }
    console.log(error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
}

export const deleteProducts = async (req: Request<IProductsParams>, res: Response<IProductsResponse>): Promise<Response> => {
  const { uuid } = req.params

  try {
    const product = await deleteProduct(uuid)

    if (product.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    return res.json({
      success: true,
      message: 'Delete success',
      results: product,
    })
  } catch (error) {
    const err = error as IErrResponse

    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`
      })
    }

    console.error(JSON.stringify(error))
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
};