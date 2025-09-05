import { Schema, Document, Types, Model, model, models } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  providers: Array<string>;
  name: string;
  username: string;
  email: string;
  avatar: string | undefined;
  accessToken?: string
}

const UserSchema = new Schema<IUser>({
  providers: { type: [String], required: true },
  username: String,
  name: String,
  email: { type: String, required: true, unique: true },
  avatar: String,
  accessToken: String
});

export const User: Model<IUser> = models.User as Model<IUser> || model<IUser>("User", UserSchema);
