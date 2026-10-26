/**
 * Seed script — creates a sample wedding template + invitation.
 * Run: npm run seed
 */
import dotenv from 'dotenv';
import { connectDB } from '../config/db';
import { Template } from '../models/Template';
import { Invitation } from '../models/Invitation';
import { Asset } from '../models/Asset';

dotenv.config();

async function seed() {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/event-invitations');

  // Clear existing demo data (optional)
  await Template.deleteMany({ title: 'Elegant Floral Wedding' });
  await Invitation.deleteMany({ slug: 'adilet-madina' });

  // Sample assets (using placeholder CDN URLs)
  const assets = await Asset.insertMany([
    {
      title: 'Floral Frame Gold',
      category: 'frames',
      type: 'png',
      url: 'https://cdn.example.com/frames/floral-gold.png',
      thumbnailUrl: 'https://cdn.example.com/frames/floral-gold-thumb.webp',
    },
    {
      title: 'Rose Ornament',
      category: 'ornaments',
      type: 'svg',
      url: 'https://cdn.example.com/ornaments/rose.svg',
    },
    {
      title: 'Soft Piano Loop',
      category: 'audio',
      type: 'mp3',
      url: 'https://cdn.example.com/audio/soft-piano.mp3',
    },
    {
      title: 'Envelope Cover',
      category: 'envelopes',
      type: 'png',
      url: 'https://cdn.example.com/envelopes/classic-ivory.png',
    },
  ]);

  console.log(`✅ Created ${assets.length} assets`);

  // Sample template
  const template = await Template.create({
    title: 'Elegant Floral Wedding',
    category: 'wedding',
    previewImageUrl: 'https://cdn.example.com/previews/elegant-floral.jpg',
    isFree: true,
    introConfig: {
      enabled: true,
      type: 'envelope',
      coverImageUrl: 'https://cdn.example.com/envelopes/classic-ivory.png',
      sealText: '{{groom_initial}} & {{bride_initial}}',
      buttonText: 'Open Invitation',
    },
    audioConfig: {
      enabled: true,
      url: 'https://cdn.example.com/audio/soft-piano.mp3',
      autoPlayOnOpen: true,
      loop: true,
    },
    autoScrollConfig: {
      enabled: true,
      speed: 2,
      stopOnTouch: true,
    },
    canvasConfig: {
      width: 390,
      height: 844,
      backgroundColor: '#fdf8f5',
      backgroundImageUrl: '',
    },
    objects: [
      {
        id: 'title-1',
        type: 'text',
        x: 40,
        y: 120,
        width: 310,
        height: 60,
        zIndex: 10,
        content: '{{groom}} & {{bride}}',
        style: {
          fontSize: 32,
          fontFamily: 'Playfair Display',
          fontWeight: 700,
          color: '#3d2b1f',
          textAlign: 'center',
        },
        animation: { type: 'fade-up', duration: 1.2, delay: 0.2, ease: 'power2.out' },
      },
      {
        id: 'date-1',
        type: 'text',
        x: 40,
        y: 200,
        width: 310,
        height: 40,
        zIndex: 10,
        content: '{{date}}',
        style: {
          fontSize: 18,
          fontFamily: 'Cormorant Garamond',
          color: '#6b4c3b',
          textAlign: 'center',
        },
        animation: { type: 'fade-up', duration: 1, delay: 0.4, ease: 'power2.out' },
      },
      {
        id: 'ornament-1',
        type: 'svg_ornament',
        x: 145,
        y: 260,
        width: 100,
        height: 40,
        zIndex: 5,
        src: 'https://cdn.example.com/ornaments/rose.svg',
        animation: { type: 'zoom-in', duration: 1, delay: 0.6, ease: 'back.out(1.7)' },
      },
      {
        id: 'venue-1',
        type: 'text',
        x: 40,
        y: 340,
        width: 310,
        height: 80,
        zIndex: 10,
        content: '{{venueName}}\n{{address}}',
        style: {
          fontSize: 16,
          fontFamily: 'Cormorant Garamond',
          color: '#5a4030',
          textAlign: 'center',
          lineHeight: 1.5,
        },
        animation: { type: 'fade-up', duration: 1, delay: 0.8, ease: 'power2.out' },
      },
      {
        id: 'countdown-widget',
        type: 'widget',
        widgetType: 'countdown',
        x: 45,
        y: 450,
        width: 300,
        height: 100,
        zIndex: 15,
        animation: { type: 'fade-up', duration: 1, delay: 1.0, ease: 'power2.out' },
      },
      {
        id: 'map-widget',
        type: 'widget',
        widgetType: 'map',
        x: 45,
        y: 580,
        width: 300,
        height: 60,
        zIndex: 15,
        mapUrl: '{{mapUrl}}',
        content: 'View Venue on Map',
        style: {
          backgroundColor: '#3d2b1f',
          color: '#ffffff',
          borderRadius: 8,
          textAlign: 'center',
          fontSize: 16,
        },
        animation: { type: 'fade-up', duration: 1, delay: 1.2, ease: 'power2.out' },
      },
      {
        id: 'rsvp-widget',
        type: 'widget',
        widgetType: 'rsvp',
        x: 45,
        y: 680,
        width: 300,
        height: 120,
        zIndex: 20,
        animation: { type: 'fade-up', duration: 1, delay: 1.4, ease: 'power2.out' },
      },
    ],
  });

  console.log(`✅ Created template: ${template._id}`);

  // Sample invitation
  const invitation = await Invitation.create({
    userId: '000000000000000000000001',
    templateId: template._id,
    slug: 'adilet-madina',
    status: 'published',
    clientData: {
      groom: 'Adilet',
      bride: 'Madina',
      date: '2026-08-15',
      time: '16:00',
      venueName: 'The Grand Ballroom',
      address: '123 Park Avenue, Almaty',
      mapUrl: 'https://maps.google.com/?q=123+Park+Avenue+Almaty',
      photoUrls: [],
      dressCodeColors: ['#3d2b1f', '#c9a86c', '#f5e6d3'],
      rsvpOptions: ['attending', 'attending_with_partner', 'declined'],
    },
  });

  console.log(`✅ Created invitation: https://yourdomain.com/i/${invitation.slug}`);
  console.log('Done.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
