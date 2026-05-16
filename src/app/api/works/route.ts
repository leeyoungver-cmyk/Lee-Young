import { NextRequest, NextResponse } from 'next/server';
import { addWork, getWorks, reorderWorks } from '@/lib/works';
import { isAuthorized, unauthorized } from '@/lib/auth';

export async function GET() {
  const works = await getWorks();
  return NextResponse.json({ works });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!body?.title || !body?.year) {
      return NextResponse.json({ error: 'title and year are required' }, { status: 400 });
    }
    const created = await addWork({
      title: String(body.title),
      year: String(body.year),
      medium: body.medium ? String(body.medium) : undefined,
      description: body.description ? String(body.description) : undefined,
      images: Array.isArray(body.images) ? body.images : [],
    });
    return NextResponse.json({ work: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

// Reorder works by passing { orderedIds: string[] } in PATCH
export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ error: 'orderedIds[] required' }, { status: 400 });
    }
    await reorderWorks(body.orderedIds.map(String));
    const works = await getWorks();
    return NextResponse.json({ works });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
