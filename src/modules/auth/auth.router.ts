import { Router } from "express";
import { login, registerUser } from "./auth.handler";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.post("/register", registerUser);
// authRouter.post("/forgot-password", forgotPassword);

export default authRouter;
