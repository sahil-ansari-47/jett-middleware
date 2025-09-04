import { Schema, model, Document, Types, models, Model } from 'mongoose';

export interface IProject extends Document {
  _id: Types.ObjectId;
  deploy_id: string;
  project_name: string;
  user_id?: Types.ObjectId;
  username: string;
  status: 'uploaded' | 'building' | 'deployed'| 'failed';
  repo_link: string;
  branch_name: string;
  deployed_url: string;
  createdAtString: string;
  last_commit_message: string;
  last_commit_datetime: Date;
}

const ProjectSchema = new Schema<IProject>({
  project_name: { type: String, required: true },
  deploy_id: { type: String, required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true },
  status: { type: String, enum: ['uploaded', 'building', 'deployed', 'failed'], default: 'failed' },
  repo_link: { type: String, required: true },
  branch_name: { type: String, required: true },
  deployed_url: { type: String},
  createdAtString: { type: String },
  last_commit_message: { type: String, required: true },
  last_commit_datetime: { type: Date, required: true },
}, { timestamps: true });

export const Project: Model<IProject> = models.Project as Model<IProject> || model<IProject>('Project', ProjectSchema);
