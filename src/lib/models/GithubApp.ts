import mongoose, { Schema, Document } from 'mongoose';

export interface IGithubInstallation extends Document {
  installationId: number;
  userId: mongoose.Types.ObjectId; // The user who installed it in Postpipe
  accountName: string; // GitHub username or org name
  accountType: string; // 'User' | 'Organization'
  createdAt: Date;
}

const GithubInstallationSchema: Schema = new Schema({
  installationId: { type: Number, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  accountName: { type: String, required: true },
  accountType: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const GithubInstallation = mongoose.models.GithubInstallation || mongoose.model<IGithubInstallation>('GithubInstallation', GithubInstallationSchema);

export interface IGithubConnector extends Document {
  installationId: number; // reference to installation
  userId: mongoose.Types.ObjectId;
  repoOwner: string;
  repoName: string;
  type: string; // 'js' | 'fastapi'
  createdAt: Date;
}

const GithubConnectorSchema: Schema = new Schema({
  installationId: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  repoOwner: { type: String, required: true },
  repoName: { type: String, required: true },
  type: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const GithubConnector = mongoose.models.GithubConnector || mongoose.model<IGithubConnector>('GithubConnector', GithubConnectorSchema);
