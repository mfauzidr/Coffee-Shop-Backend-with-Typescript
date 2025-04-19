import express, { Request, Response } from "express";
import * as dotenv from "dotenv";
import router from "./src/routes";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";

let path = "./.env.production";
dotenv.config({ path });

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const logger = morgan("dev");
app.use(logger);

const configs: CorsOptions = {
  origin: [
    "http://localhost:8888",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "https://react-ts-cosho.vercel.app",
    "http://localhost:8080",
  ],
  methods: ["POST", "PATCH", "DELETE"],
  allowedHeaders: ["Authorization", "x-headers", "Content-Type"],
};
app.use(cors(configs));

app.use(express.static("./public"));

app.get("/", (req: Request, res: Response) =>
  res.json({
    success: true,
    message: "Backend is running well",
  })
);

app.use(router);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

export default app;
