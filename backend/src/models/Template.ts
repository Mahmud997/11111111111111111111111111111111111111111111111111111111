import { Schema, model, Document } from 'mongoose';

const AnimationSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['fade-up', 'zoom-in', 'slide-left', 'slide-right', 'rotate-in', 'typewriter', 'bounce', 'none'],
      default: 'none',
    },
    duration: { type: Number, default: 0.8 },
    delay: { type: Number, default: 0 },
    ease: { type: String, default: 'power2.out' },
  },
  { _id: false }
);

const ObjectStyleSchema = new Schema(
  {
    fontSize: Number,
    fontFamily: String,
    fontWeight: Schema.Types.Mixed,
    fill: String,
    color: String,
    textAlign: { type: String, enum: ['left', 'center', 'right'] },
    borderColor: String,
    borderWidth: Number,
    borderRadius: Number,
    backgroundColor: String,
    letterSpacing: Number,
    lineHeight: Number,
    textTransform: String,
  },
  { _id: false, strict: false }
);

const CanvasObjectSchema = new Schema(
  {
    id: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['text', 'image', 'svg_ornament', 'video_bg', 'widget'],
    },
    widgetType: {
      type: String,
      enum: ['countdown', 'calendar', 'map', 'dress_code', 'rsvp'],
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    zIndex: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 },
    opacity: { type: Number, default: 1 },
    blendMode: String,
    content: String,
    src: String,
    style: ObjectStyleSchema,
    animation: AnimationSchema,
    mapUrl: String,
    dressCodeColors: [String],
  },
  { _id: false }
);

export interface ITemplate extends Document {
  title: string;
  category: 'wedding' | 'birthday' | 'anniversary' | 'corporate' | 'other';
  previewImageUrl?: string;
  isFree: boolean;
  introConfig: {
    enabled: boolean;
    type: 'envelope' | 'jewelry_box' | 'wax_seal';
    coverImageUrl?: string;
    sealText?: string;
    buttonText?: string;
  };
  audioConfig: {
    enabled: boolean;
    url?: string;
    autoPlayOnOpen: boolean;
    loop: boolean;
  };
  autoScrollConfig: {
    enabled: boolean;
    speed: number;
    stopOnTouch: boolean;
  };
  canvasConfig: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImageUrl?: string;
  };
  objects: any[];
  createdAt: Date;
  updatedAt: Date;
}

const TemplateSchema = new Schema<ITemplate>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['wedding', 'birthday', 'anniversary', 'corporate', 'other'],
      default: 'wedding',
    },
    previewImageUrl: String,
    isFree: { type: Boolean, default: true },
    introConfig: {
      enabled: { type: Boolean, default: true },
      type: {
        type: String,
        enum: ['envelope', 'jewelry_box', 'wax_seal'],
        default: 'envelope',
      },
      coverImageUrl: String,
      sealText: { type: String, default: '{{groom_initial}} & {{bride_initial}}' },
      buttonText: { type: String, default: 'Open Invitation' },
    },
    audioConfig: {
      enabled: { type: Boolean, default: false },
      url: String,
      autoPlayOnOpen: { type: Boolean, default: true },
      loop: { type: Boolean, default: true },
    },
    autoScrollConfig: {
      enabled: { type: Boolean, default: false },
      speed: { type: Number, min: 1, max: 5, default: 2 },
      stopOnTouch: { type: Boolean, default: true },
    },
    canvasConfig: {
      width: { type: Number, default: 390 },
      height: { type: Number, default: 844 },
      backgroundColor: { type: String, default: '#ffffff' },
      backgroundImageUrl: String,
    },
    objects: { type: [CanvasObjectSchema], default: [] },
  },
  { timestamps: true }
);

TemplateSchema.index({ category: 1, isFree: 1 });

export const Template = model<ITemplate>('Template', TemplateSchema);
