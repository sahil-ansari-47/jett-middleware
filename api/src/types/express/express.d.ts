// types/express.d.ts
import { JwtPayload } from "./auth";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
