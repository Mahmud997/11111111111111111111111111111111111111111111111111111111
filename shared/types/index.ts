/**
 * Shared TypeScript interfaces for the Event Invitation SaaS
 * Used by both backend and frontends.
 */

export type AssetCategory =
  | 'frames'
  | 'ornaments'
  | 'backgrounds'
  | 'video_backgrounds'
  | 'envelopes'
  | 'audio';

export type AssetType = 'svg' | 'png' | 'webp' | 'mp4' | 'mp3' | 'jpg';

export interface Asset {
  _id: string;
  title: string;
  category: AssetCategory;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export type TemplateCategory = 'wedding' | 'birthday' | 'anniversary' | 'corporate' | 'other';

export interface IntroConfig {
  enabled: boolean;
  type: 'envelope' | 'jewelry_box' | 'wax_seal';
  coverImageUrl?: string;
  sealText?: string; // supports {{groom_initial}} {{bride_initial}}
  buttonText?: string;
}

export interface AudioConfig {
  enabled: boolean;
  url?: string;
  autoPlayOnOpen: boolean;
  loop: boolean;
}

export interface AutoScrollConfig {
  enabled: boolean;
  speed: number; // 1-5
  stopOnTouch: boolean;
}

export interface CanvasConfig {
  width: number;   // default 390
  height: number;  // default 844
  backgroundColor: string;
  backgroundImageUrl?: string;
}

export type ObjectType = 'text' | 'image' | 'svg_ornament' | 'video_bg' | 'widget';
export type WidgetType = 'countdown' | 'calendar' | 'map' | 'dress_code' | 'rsvp';

export type AnimationType =
  | 'fade-up'
  | 'zoom-in'
  | 'slide-left'
  | 'slide-right'
  | 'rotate-in'
  | 'typewriter'
  | 'bounce'
  | 'none';

export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  delay: number;
  ease: string;
}

export interface ObjectStyle {
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fill?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  backgroundColor?: string;
  letterSpacing?: number;
  lineHeight?: number;
  textTransform?: string;
  [key: string]: any;
}

export interface CanvasObject {
  id: string;
  type: ObjectType;
  widgetType?: WidgetType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation?: number;
  opacity?: number;
  blendMode?: string;
  content?: string; // supports {{groom}}, {{bride}}, {{date}}, etc.
  src?: string;     // for image / svg / video
  style?: ObjectStyle;
  animation?: AnimationConfig;
  // Widget-specific
  mapUrl?: string;
  dressCodeColors?: string[];
}

export interface Template {
  _id: string;
  title: string;
  category: TemplateCategory;
  previewImageUrl?: string;
  isFree: boolean;
  introConfig: IntroConfig;
  audioConfig: AudioConfig;
  autoScrollConfig: AutoScrollConfig;
  canvasConfig: CanvasConfig;
  objects: CanvasObject[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientData {
  groom: string;
  bride: string;
  date: string;       // ISO or formatted
  time?: string;
  venueName?: string;
  address?: string;
  mapUrl?: string;
  photoUrls?: string[];
  dressCodeColors?: string[];
  rsvpOptions?: string[];
  // Extra free-form fields
  [key: string]: any;
}

export type InvitationStatus = 'draft' | 'published';

export interface Invitation {
  _id: string;
  userId: string;
  templateId: string;
  slug: string;
  status: InvitationStatus;
  clientData: ClientData;
  createdAt?: string;
  updatedAt?: string;
}

export type RsvpStatus = 'attending' | 'attending_with_partner' | 'declined';

export interface GuestResponse {
  _id: string;
  invitationId: string;
  guestName: string;
  status: RsvpStatus;
  partnerName?: string;
  message?: string;
  createdAt: string;
}

/** Merged public invitation payload returned by GET /api/public/i/:slug */
export interface PublicInvitation {
  slug: string;
  status: InvitationStatus;
  template: Template;
  clientData: ClientData;
  // Convenience: already resolved placeholders in objects if needed
}
