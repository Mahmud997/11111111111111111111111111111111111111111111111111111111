import { Schema, model, Document } from 'mongoose';

export interface IAsset extends Document {
  title: string;
  category: 'frames' | 'ornaments' | 'backgrounds' | 'video_backgrounds' | 'envelopes' | 'audio';
  type: 'svg' | 'png' | 'webp' | 'mp4' | 'mp3' | 'jpg';
  url: string;
  thumbnailUrl?: string;
  createdAt: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['frames', 'ornaments', 'backgrounds', 'video_backgrounds', 'envelopes', 'audio'],
    },
    type: {
      type: String,
      required: true,
      enum: ['svg', 'png', 'webp', 'mp4', 'mp3', 'jpg'],
    },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AssetSchema.index({ category: 1, type: 1 });

export const Asset = model<IAsset>('Asset', AssetSchema);
