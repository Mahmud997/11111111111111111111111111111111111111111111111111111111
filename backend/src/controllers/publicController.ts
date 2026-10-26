import { Request, Response, NextFunction } from 'express';
import { Invitation } from '../models/Invitation';
import { Template } from '../models/Template';
import { GuestResponse } from '../models/GuestResponse';
import { mergeTemplateWithClientData } from '../utils/placeholders';
import { z } from 'zod';

const rsvpSchema = z.object({
  guestName: z.string().min(1).max(100),
  status: z.enum(['attending', 'attending_with_partner', 'declined']),
  partnerName: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});

/**
 * GET /api/public/i/:slug
 * Returns fully merged invitation (template + client data) for guest view.
 */
export async function getPublicInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const invitation = await Invitation.findOne({ slug, status: 'published' })
      .populate('templateId')
      .lean();

    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found or not published' });
      return;
    }

    const template = invitation.templateId as any;
    if (!template) {
      res.status(500).json({ error: 'Template missing' });
      return;
    }

    // Merge placeholders
    const mergedTemplate = mergeTemplateWithClientData(template, invitation.clientData);

    res.json({
      slug: invitation.slug,
      status: invitation.status,
      template: mergedTemplate,
      clientData: invitation.clientData,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/public/i/:slug/rsvp
 * Records a guest RSVP response.
 */
export async function submitRsvp(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = req.params;

    const parsed = rsvpSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const invitation = await Invitation.findOne({ slug, status: 'published' });
    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }

    const { guestName, status, partnerName, message } = parsed.data;

    // Optional: prevent duplicate RSVPs from same name (soft check)
    const existing = await GuestResponse.findOne({
      invitationId: invitation._id,
      guestName: { $regex: new RegExp(`^${guestName}$`, 'i') },
    });

    if (existing) {
      // Update existing
      existing.status = status;
      existing.partnerName = partnerName;
      existing.message = message;
      await existing.save();
      res.json({ success: true, message: 'RSVP updated', id: existing._id });
      return;
    }

    const response = await GuestResponse.create({
      invitationId: invitation._id,
      guestName,
      status,
      partnerName,
      message,
    });

    res.status(201).json({ success: true, message: 'RSVP recorded', id: response._id });
  } catch (err) {
    next(err);
  }
}
