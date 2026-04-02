import { Router } from "express";
import {
  createProduct,
  deleteProducts,
  getAllProducts,
  getDetailProduct,
  updateProduct,
} from "./products.handler";
import { authMiddleware } from "@middlewares/auth.middleware";
import { multiCloudUploader, singleCloudUploader } from "@middlewares/upload.middleware";

const productsRouter = Router();

productsRouter.get("/", getAllProducts);

productsRouter.get("/:uuid", getDetailProduct);

productsRouter.post(
  "/",
  authMiddleware(["admin"]),
  multiCloudUploader("image", 4),
  createProduct
);

productsRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  multiCloudUploader("image", 4),
  updateProduct
);

productsRouter.delete("/:uuid", authMiddleware(["admin"]), deleteProducts);

export default productsRouter;
