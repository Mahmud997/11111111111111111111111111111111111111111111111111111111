import { Request, Response, NextFunction } from 'express';
import { Asset } from '../models/Asset';
import { Template } from '../models/Template';
import { Invitation } from '../models/Invitation';
import { z } from 'zod';
import slugify from 'slugify';

const assetSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.enum(['frames', 'ornaments', 'backgrounds', 'video_backgrounds', 'envelopes', 'audio']),
  type: z.enum(['svg', 'png', 'webp', 'mp4', 'mp3', 'jpg']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
});

/**
 * POST /api/admin/assets
 * Register a new external asset (CDN / S3 link) into the media library.
 */
export async function createAsset(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const parsed = assetSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten() });
      return;
    }

    const asset = await Asset.create(parsed.data);
    res.status(201).json(asset);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/assets
 */
export async function listAssets(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { category } = req.query;
    const filter: any = {};
    if (category) filter.category = category;

    const assets = await Asset.find(filter).sort({ createdAt: -1 }).lean();
    res.json(assets);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/templates
 */
export async function createTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const template = await Template.create(req.body);
    res.status(201).json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/templates/:id
 */
export async function updateTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/templates
 */
export async function listTemplates(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const templates = await Template.find().sort({ updatedAt: -1 }).lean();
    res.json(templates);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/templates/:id
 */
export async function getTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const template = await Template.findById(req.params.id).lean();
    if (!template) {
      res.status(404).json({ error: 'Template not found' });
      return;
    }
    res.json(template);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/invitations
 * Create a new invitation instance from a template.
 */
export async function createInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { templateId, clientData, slug: customSlug, userId } = req.body;

    if (!templateId || !clientData?.groom || !clientData?.bride) {
      res.status(400).json({ error: 'templateId, groom and bride are required' });
      return;
    }

    const baseSlug =
      customSlug ||
      slugify(`${clientData.groom}-${clientData.bride}`, { lower: true, strict: true });

    // Ensure uniqueness
    let slug = baseSlug;
    let counter = 1;
    while (await Invitation.exists({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const invitation = await Invitation.create({
      userId: userId || '000000000000000000000000', // placeholder for demo
      templateId,
      slug,
      status: 'draft',
      clientData,
    });

    res.status(201).json(invitation);
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/invitations/:id/publish
 */
export async function publishInvitation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invitation = await Invitation.findByIdAndUpdate(
      req.params.id,
      { status: 'published' },
      { new: true }
    );
    if (!invitation) {
      res.status(404).json({ error: 'Invitation not found' });
      return;
    }
    res.json(invitation);
  } catch (err) {
    next(err);
  }
}
