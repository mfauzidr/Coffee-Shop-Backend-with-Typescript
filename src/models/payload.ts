import { JwtPayload } from "jsonwebtoken";

export interface IPayload extends JwtPayload {
  id?: number
  uuid?: string
  role?: string
}