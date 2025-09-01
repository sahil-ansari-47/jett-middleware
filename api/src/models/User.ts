import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  provider: string;
  providerId: string;
  name: string;
  email: string;
  avatar?: string;
}

const UserSchema = new Schema<IUser>({
  provider: { type: String, required: true },
  providerId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  avatar: String,
});

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
