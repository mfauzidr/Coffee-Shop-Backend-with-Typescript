import { JwtPayload } from "jsonwebtoken";

export interface IPayload extends JwtPayload {
  uuid?: string
  role?: string
}