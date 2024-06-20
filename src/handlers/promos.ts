import { Request, Response } from 'express'
import { findAll, findDetails, insert, update, deletePromo } from "../repositories/promos"
import { IPromos, IPromosBody, IPromosParams, IPromosQueryParams, } from "../models/promos"
import { IErrResponse, IPromosResponse } from '../models/response';

export const getAllPromos = async (req: Request<{}, {}, {}, IPromosQueryParams>, res: Response<IPromosResponse>) => {
  try {
    const promos = await findAll(req.query);
    if (promos.length < 1) {
      throw new Error('no_data');
    }
    return res.json({
      success: true,
      message: 'List all promos',
      results: promos
    });
  } catch (error) {
    const err = error as IErrResponse
    if (err.message === 'no_data') {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      });
    }

    console.error(JSON.stringify(error));
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const getDetailPromos = async (req: Request<IPromos>, res: Response<IPromosResponse>): Promise<Response> => {
  const { id } = req.params;
  try {
    const promo = await findDetails(id);

    if (promo.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found'
      });
    }

    return res.json({
      success: true,
      message: 'OK',
      results: promo
    });
  } catch (error) {
    const err = error as IErrResponse

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const createPromos = async (req: Request<{}, {}, IPromosBody>, res: Response<IPromosResponse>): Promise<Response> => {
  try {
    const promo = await insert(req.body);
    return res.json({
      success: true,
      message: 'Create promo successfully',
      results: promo
    });
  } catch (error) {
    const err = error as IErrResponse
    console.error(JSON.stringify(error));
    if (err.code === "23502") {
      return res.status(400).json({
        success: false,
        message: `${err.column} cannot be empty`
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const updatePromos = async (req: Request<IPromosParams, IPromosBody>, res: Response<IPromosResponse>): Promise<Response> => {
  try {
    const { id } = req.params;
    const data = {
      ...req.body
    }
    const promo = await update(id, data)

    if (promo.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found'
      });
    }

    return res.json({
      success: true,
      message: 'OK',
      results: promo
    });
  } catch (error) {
    const err = error as IErrResponse

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};

export const deletePromos = async (req: Request<IPromosParams, {}, IPromosBody>, res: Response<IPromosResponse>): Promise<Response> => {
  const { id } = req.params;
  try {
    const promo = await deletePromo(id);

    if (promo.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Promo not found'
      });
    }

    return res.json({
      success: true,
      message: 'Delete success',
      results: promo
    });
  } catch (error) {
    const err = error as IErrResponse

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
};