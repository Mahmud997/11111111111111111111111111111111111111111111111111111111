import { Schema, model, Document, Types } from 'mongoose';

export interface IGuestResponse extends Document {
  invitationId: Types.ObjectId;
  guestName: string;
  status: 'attending' | 'attending_with_partner' | 'declined';
  partnerName?: string;
  message?: string;
  createdAt: Date;
}

const GuestResponseSchema = new Schema<IGuestResponse>(
  {
    invitationId: {
      type: Schema.Types.ObjectId,
      ref: 'Invitation',
      required: true,
      index: true,
    },
    guestName: { type: String, required: true, trim: true },
    status: {
      type: String,
      required: true,
      enum: ['attending', 'attending_with_partner', 'declined'],
    },
    partnerName: { type: String, trim: true },
    message: { type: String, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

GuestResponseSchema.index({ invitationId: 1, createdAt: -1 });

export const GuestResponse = model<IGuestResponse>('GuestResponse', GuestResponseSchema);
