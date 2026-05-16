import { NextRequest, NextResponse } from 'next/server';
import { deleteWork, getWork, updateWork } from '@/lib/works';
import { isAuthorized, unauthorized } from '@/lib/auth';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const work = await getWork(params.id);
  if (!work) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ work });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    const updated = await updateWork(params.id, {
      title: body.title !== undefined ? String(body.title) : undefined,
      year: body.year !== undefined ? String(body.year) : undefined,
      medium: body.medium !== undefined ? String(body.medium) : undefined,
      description: body.description !== undefined ? String(body.description) : undefined,
      images: Array.isArray(body.images) ? body.images : undefined,
    });
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ work: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) return unauthorized();
  const ok = await deleteWork(params.id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
