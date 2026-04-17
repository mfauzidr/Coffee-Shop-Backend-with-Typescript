import { Router } from "express";
import {
  getAllUsers,
  getDetailUser,
  createUsers,
  updateUsers,
  updatePassword,
  deactivateUsers,
  restoreUsers,
} from "@modules/users/users.handler";
import { authMiddleware } from "@middlewares/auth.middleware";
import { singleCloudUploader } from "@middlewares/upload.middleware";

const usersRouter = Router();

usersRouter.get("/", authMiddleware(["admin"]), getAllUsers);
usersRouter.get("/:uuid", authMiddleware(["admin", "customer"]), getDetailUser);
usersRouter.post(
  "/",
  authMiddleware(["admin"]),
  singleCloudUploader("image"),
  createUsers
);
usersRouter.post(
  "/update-password",
  authMiddleware(["admin", "customer"]),
  updatePassword
);
usersRouter.patch(
  "/:uuid",
  authMiddleware(["admin", "customer"]),
  singleCloudUploader("image"),
  updateUsers
);
usersRouter.patch("/deactive/:uuid", authMiddleware(["admin"]), deactivateUsers);
usersRouter.patch("/restore/:uuid", authMiddleware(["admin"]), restoreUsers);

export default usersRouter;
