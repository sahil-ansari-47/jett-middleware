// backend/src/models/RevokedToken.ts
import { Schema, Document, Model, model, models } from "mongoose";

export interface IRevokedToken extends Document {
  token: string;        // the JWT string
  expiresAt: Date;      // when the JWT would naturally expire
  createdAt: Date;      // when it was blacklisted
}

const RevokedTokenSchema = new Schema<IRevokedToken>({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Automatically delete revoked tokens after they expire
RevokedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RevokedToken: Model<IRevokedToken> =
  models.RevokedToken || model<IRevokedToken>("RevokedToken", RevokedTokenSchema);
