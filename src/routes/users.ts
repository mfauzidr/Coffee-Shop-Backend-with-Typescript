import { Router } from "express"
import { getAllUsers, getDetailUser, createUsers, updateUsers, deleteUsers } from "../handlers/users"
import { authMiddleware } from "../middlewares/auth.middleware"
import { singleCloudUploader } from "../middlewares/upload"

const usersRouter = Router()

usersRouter.get('/', authMiddleware(["admin"]), getAllUsers)

usersRouter.get('/:uuid', authMiddleware(["admin", "customer"]), getDetailUser)

usersRouter.post('/', authMiddleware(["admin"]), singleCloudUploader("image"), createUsers)

usersRouter.patch('/:uuid', authMiddleware(["admin", "customer"]), singleCloudUploader("image"), updateUsers)

usersRouter.delete('/:uuid', authMiddleware(["admin"]), deleteUsers)

export default usersRouter