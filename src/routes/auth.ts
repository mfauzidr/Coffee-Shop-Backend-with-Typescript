import { Router } from "express"
import { forgotPassword, login, registerUser } from "../handlers/auth"

const authRouter = Router()

authRouter.post('/login', login)
authRouter.post('/register', registerUser)
authRouter.patch('/forgot-password', forgotPassword)

export default authRouter