import { Schema, Document, Types, Model, model, models } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  provider: string;
  providerId: string;
  name: string;
  email: string;
  avatar?: string;
  accessToken?: string
}

const UserSchema = new Schema<IUser>({
  provider: { type: String, required: true },
  providerId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  avatar: String,
  accessToken: String
});

export const User: Model<IUser> = models.User as Model<IUser> || model<IUser>("User", UserSchema);
