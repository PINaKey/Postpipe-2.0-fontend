import { NextRequest, NextResponse } from 'next/server';
import { TemplateUpdateService } from '@/lib/services/TemplateUpdateService';

export async function POST(req: NextRequest) {
  try {
    const { type, version, secret } = await req.json();

    // Protect this endpoint
    if (secret !== process.env.GITHUB_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!type) {
      return NextResponse.json({ error: 'Missing type parameter (e.g., express or fastapi)' }, { status: 400 });
    }

    const newVersion = version || `manual-${Date.now().toString().slice(-6)}`;

    // Await for testing visibility
    const result = await TemplateUpdateService.propagateUpdate(type, newVersion);

    return NextResponse.json({
      success: true,
      message: `Triggered update for ${type} with version ${newVersion}`,
      result
    });
  } catch (error: any) {
    console.error('Error handling test template update:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
