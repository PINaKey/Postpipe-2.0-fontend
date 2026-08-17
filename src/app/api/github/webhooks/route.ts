import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { TemplateUpdateService } from '@/lib/services/TemplateUpdateService';

const WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || '';

function verifySignature(payload: string, signature: string | null) {
  if (!WEBHOOK_SECRET) {
    console.warn('GITHUB_WEBHOOK_SECRET is not set. Skipping signature verification.');
    return true; // For testing in environments without secret, but ideally false in prod
  }
  if (!signature) return false;
  
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = `sha256=${hmac.update(payload).digest('hex')}`;
  
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-hub-signature-256');
    const event = req.headers.get('x-github-event');

    const rawBody = await req.text();
    
    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (event !== 'push') {
      return NextResponse.json({ message: 'Ignored non-push event' });
    }

    const payload = JSON.parse(rawBody);

    // Only process pushes to the main/default branch
    const defaultBranch = payload.repository?.default_branch || 'main';
    if (payload.ref !== `refs/heads/${defaultBranch}`) {
      return NextResponse.json({ message: 'Ignored push to non-default branch' });
    }

    const repoName = payload.repository?.name;
    let templateType: string | null = null;

    if (repoName === 'postpipe-connector-template') {
      templateType = 'express';
    } else if (repoName === 'postpipe-connector-fastapi') {
      templateType = 'fastapi';
    }

    if (!templateType) {
      return NextResponse.json({ message: 'Ignored push from non-template repository' });
    }

    // Determine the "new version" based on the commit SHA or we can just bump a timestamp
    // Ideally the template repository has a .postpipe-version or we derive it from commit
    const newVersion = payload.head_commit?.id.substring(0, 7) || Date.now().toString();

    // Trigger update asynchronously so we don't timeout the webhook response
    TemplateUpdateService.propagateUpdate(templateType, newVersion).catch(err => {
      console.error(`Async propagation failed for ${templateType}:`, err);
    });

    return NextResponse.json({
      success: true,
      message: `Triggered update for ${templateType} with version ${newVersion}`
    });
  } catch (error: any) {
    console.error('Error handling GitHub webhook:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
