import { Router } from "express";
import {
  createProduct,
  deleteProducts,
  getAllProducts,
  getDetailProduct,
  updateProduct,
} from "../handlers/products";
import { authMiddleware } from "../middlewares/auth.middleware";
import { singleCloudUploader } from "../middlewares/upload";

const productsRouter = Router();

productsRouter.get("/", getAllProducts);

productsRouter.get("/:uuid", getDetailProduct);

productsRouter.post(
  "/",
  authMiddleware(["admin"]),
  singleCloudUploader("image"),
  createProduct
);

productsRouter.patch(
  "/:uuid",
  authMiddleware(["admin"]),
  singleCloudUploader("image"),
  updateProduct
);

productsRouter.delete("/:uuid", authMiddleware(["admin"]), deleteProducts);

export default productsRouter;
