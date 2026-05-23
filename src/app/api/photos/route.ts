import { NextRequest, NextResponse } from 'next/server';
import { addPhoto, getPhotos, reorderPhotos } from '@/lib/photos';
import { isAuthorized, unauthorized } from '@/lib/auth';

export async function GET() {
  const photos = await getPhotos();
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    const images = Array.isArray(body?.images) ? body.images.filter((i: any) => i?.src).map((i: any) => ({ src: String(i.src) })) : [];
    if (images.length === 0) {
      return NextResponse.json({ error: 'at least one image is required' }, { status: 400 });
    }
    const created = await addPhoto({
      images,
      caption: body.caption ? String(body.caption) : undefined,
      captionEn: body.captionEn ? String(body.captionEn) : undefined,
    });
    return NextResponse.json({ photo: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();
  try {
    const body = await req.json();
    if (!Array.isArray(body?.orderedIds)) {
      return NextResponse.json({ error: 'orderedIds[] required' }, { status: 400 });
    }
    await reorderPhotos(body.orderedIds.map(String));
    const photos = await getPhotos();
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
}
