import { Request, Response } from 'express'
import { findAll, findDetails, insert, update, deletePromo } from "./promos.repo"
import { IPromos, IPromosBody, IPromosParams, IPromosQueryParams, } from "./promos.model"
import { IPromosResponse } from '../../shared/models/response.model';
import { AppError } from '../../shared/helper/appError';

export const getAllPromos = async (req: Request<{}, {}, {}, IPromosQueryParams>, res: Response<IPromosResponse>) => {
  const promos = await findAll(req.query);
  if (promos.length < 1) {
    throw new AppError('NO_DATA', 'Data not found', 404);
  }
  return res.json({
    success: true,
    message: 'List all promos',
    results: promos
  });
};

export const getDetailPromos = async (req: Request<IPromos>, res: Response<IPromosResponse>): Promise<Response> => {
  const { id } = req.params;
  const promo = await findDetails(id);

  if (promo.length < 1) {
    throw new AppError('NOT_FOUND', 'Promo not found', 404);
  }

  return res.json({
    success: true,
    message: 'OK',
    results: promo
  });
};

export const createPromos = async (req: Request<{}, {}, IPromosBody>, res: Response<IPromosResponse>): Promise<Response> => {
  const promo = await insert(req.body);
  return res.json({
    success: true,
    message: 'Create promo successfully',
    results: promo
  });
};

export const updatePromos = async (req: Request<IPromosParams, IPromosBody>, res: Response<IPromosResponse>): Promise<Response> => {
  const { id } = req.params;
  const data = {
    ...req.body
  }
  const promo = await update(id, data)

  if (promo.length < 1) {
    throw new AppError('NOT_FOUND', 'Promo not found', 404);
  }

  return res.json({
    success: true,
    message: 'OK',
    results: promo
  });
};

export const deletePromos = async (req: Request<IPromosParams, {}, IPromosBody>, res: Response<IPromosResponse>): Promise<Response> => {
  const { id } = req.params;
  const promo = await deletePromo(id);

  if (promo.length < 1) {
    throw new AppError('NOT_FOUND', 'Promo not found', 404);
  }

  return res.json({
    success: true,
    message: 'Delete success',
    results: promo
  });
};