import { NextRequest, NextResponse } from 'next/server';
import { deletePhoto, updatePhoto } from '@/lib/photos';
import { isAuthorized, unauthorized } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    const updated = await updatePhoto(params.id, body);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ photo: updated });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuthorized(req)) return unauthorized();
  const ok = await deletePhoto(params.id);
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
