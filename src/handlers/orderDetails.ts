import { Request, Response } from 'express';
import { findAll, findDetails, insert, deleteOrderDetail } from '../repositories/orderDetails';

export const getAllOrderDetails = async (req: Request, res: Response): Promise<Response> => {
  const orderDetails = await findAll();
  return res.json({
    success: true,
    message: 'List all orderDetails',
    results: orderDetails,
  });
};

export const getDetailOrderDetails = async (req: Request, res: Response): Promise<Response> => {
  const id = parseInt(req.params.id);
  const orderDetails = await findDetails(id);
  if (!orderDetails) {
    return res.status(404).json({
      success: false,
      message: 'orderDetails not found',
    });
  }

  return res.json({
    success: true,
    message: 'OK',
    results: orderDetails,
  });
};

export const createOrderDetails = async (req: Request, res: Response): Promise<Response> => {
  try {
    const orderDetails = await insert(req.body);
    return res.json({
      success: true,
      message: 'Create orderDetails successfully',
      results: orderDetails,
    });
  } catch (error) {
    const err = error as { code?: string; column?: string; detail?: string; message: string }
    console.log(JSON.stringify(err));
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      });
    }
    if (err.code === '22P02') {
      return res.status(400).json({
        success: false,
        message: `${err.column} must be filled with an integer type. Please see the table for guidance`,
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

// export const updateOrderDetails = async (req: Request, res: Response): Promise<Response> => {
//   const id = parseInt(req.params.id);
//   const { variant, size } = req.body;
//   const orderDetails = await update(id, { variant, size });

//   if (!orderDetails) {
//     return res.status(404).json({
//       success: false,
//       message: 'orderDetails not found',
//     });
//   }
//   return res.json({
//     success: true,
//     message: 'OK',
//     results: orderDetails,
//   });
// };

export const deleteOrderDetails = async (req: Request, res: Response): Promise<Response> => {
  const id = parseInt(req.params.id);
  const orderDetails = await deleteOrderDetail(id);
  if (!orderDetails) {
    return res.status(404).json({
      success: false,
      message: 'orderDetails not found',
    });
  }
  return res.json({
    success: true,
    message: 'Delete success',
    results: orderDetails,
  });
};
