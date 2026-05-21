import "module-alias/register";
import * as dotenv from "dotenv";
const envPath =
  process.env.NODE_ENV === "production" ? "./.env.production" : "./.env";

dotenv.config({ path: envPath, override: true });

import "express-async-errors";
import express, { Request, Response } from "express";
import morgan from "morgan";
import cors, { CorsOptions } from "cors";
import router from "./src/shared/routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

const corsConfig: CorsOptions = {
  origin: [
    "http://localhost:8888",
    "http://127.0.0.1:5500",
    "http://localhost:5173",
    "https://react-ts-cosho.vercel.app",
    "http://localhost:8080",
  ],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  allowedHeaders: ["Authorization", "x-headers", "Content-Type"],
};
app.use(cors(corsConfig));

app.use(express.static("./public"));

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Backend is running well 🚀",
    environment: process.env.NODE_ENV || "development",
  });
});

app.use(router);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `✅ Server running on port ${PORT} in ${
      process.env.NODE_ENV || "development"
    } mode — DB: ${process.env.DB_HOST || "not specified"}`
  );
});

export default app;
