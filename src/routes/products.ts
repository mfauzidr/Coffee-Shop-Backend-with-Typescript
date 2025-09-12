import { Router } from "express";
import {
  createProduct,
  deleteProducts,
  getAllProducts,
  getDetailProduct,
  updateProduct,
} from "../handlers/products";
import { authMiddleware } from "../middlewares/auth.middleware";
import { multiCloudUploader, singleCloudUploader } from "../middlewares/upload";

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
