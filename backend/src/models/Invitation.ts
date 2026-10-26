import { Schema, model, Document, Types } from 'mongoose';

export interface IClientData {
  groom: string;
  bride: string;
  date: string;
  time?: string;
  venueName?: string;
  address?: string;
  mapUrl?: string;
  photoUrls?: string[];
  dressCodeColors?: string[];
  rsvpOptions?: string[];
  [key: string]: any;
}

export interface IInvitation extends Document {
  userId: Types.ObjectId | string;
  templateId: Types.ObjectId;
  slug: string;
  status: 'draft' | 'published';
  clientData: IClientData;
  createdAt: Date;
  updatedAt: Date;
}

const ClientDataSchema = new Schema(
  {
    groom: { type: String, required: true, trim: true },
    bride: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: String,
    venueName: String,
    address: String,
    mapUrl: String,
    photoUrls: [String],
    dressCodeColors: [String],
    rsvpOptions: [String],
  },
  { _id: false, strict: false }
);

const InvitationSchema = new Schema<IInvitation>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    clientData: { type: ClientDataSchema, required: true },
  },
  { timestamps: true }
);

InvitationSchema.index({ slug: 1 }, { unique: true });
InvitationSchema.index({ userId: 1, status: 1 });

export const Invitation = model<IInvitation>('Invitation', InvitationSchema);
