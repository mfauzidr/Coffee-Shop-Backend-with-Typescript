import express, { Request, Response } from 'express'
import * as dotenv from "dotenv"
import router from './src/routes'
import morgan from "morgan"
import cors, { CorsOptions } from 'cors'

dotenv.config()

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const logger = morgan("dev")
app.use(logger)

const configs: CorsOptions = {
  origin: ["http://localhost:8888", "http://127.0.0.1:5500"],
  methods: ["POST", "PATCH"],
  allowedHeaders: ["Authorization", "x-headers"],
};
app.use(cors(configs));

app.use(express.static("./public"))

app.get("/", (req: Request, res: Response) => res.json({
  success: true,
  message: "Backend is running well",
}))

app.use(router)

const PORT = process.env.PORT || 8888

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
});
