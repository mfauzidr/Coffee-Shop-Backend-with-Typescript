import { Response } from "express";

export const handlePgError = (err: any, res: Response) => {
  switch (err.code) {
    case "23505":
      const errDetails = err.detail?.match(/\((.*?)\)=\((.*?)\)/);
      const column = errDetails ? errDetails[1] : "field";

      return res.status(400).json({
        success: false,
        message: `${column} already exist.`,
      });

    case "23502":
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      });

    case "23503":
      return res.status(400).json({
        success: false,
        message: "Invalid reference",
      });

      case "22P02":
        return res.status(400).json({
          success: false,
          message: "Invalid UUID Format"
        })

      case "LIMIT_FILE_SIZE":
        return res.status(400).json({
        success: false,
        message: "File Too Large. Max 1MB.",
      });

    default:
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
  }
};
