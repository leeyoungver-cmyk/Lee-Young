import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { isAuthorized, unauthorized } from '@/lib/auth';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB per file
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return unauthorized();

  const form = await req.formData();
  const files = form.getAll('files');
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files' }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const saved: { src: string; name: string; size: number }[] = [];

  for (const f of files) {
    if (!(f instanceof File)) continue;
    if (!ALLOWED.has(f.type)) {
      return NextResponse.json({ error: `Unsupported type: ${f.type}` }, { status: 400 });
    }
    if (f.size > MAX_BYTES) {
      return NextResponse.json({ error: `File too large: ${f.name}` }, { status: 400 });
    }

    const ext = extFromType(f.type) || path.extname(f.name) || '.bin';
    const stamp = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2, 8);
    const safeBase = path.basename(f.name, path.extname(f.name)).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40) || 'img';
    const filename = `${stamp}-${rand}-${safeBase}${ext}`;
    const dest = path.join(UPLOAD_DIR, filename);

    const buf = Buffer.from(await f.arrayBuffer());
    await fs.writeFile(dest, buf);

    saved.push({ src: `/uploads/${filename}`, name: f.name, size: f.size });
  }

  return NextResponse.json({ files: saved });
}

function extFromType(t: string): string {
  switch (t) {
    case 'image/jpeg': return '.jpg';
    case 'image/png': return '.png';
    case 'image/webp': return '.webp';
    case 'image/gif': return '.gif';
    case 'image/avif': return '.avif';
    default: return '';
  }
}
