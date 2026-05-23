import { promises as fs } from 'fs';
import path from 'path';
import type { Photo } from '@/types/photo';

const DATA_FILE = path.join(process.cwd(), 'data', 'photos.json');

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function getPhotos(): Promise<Photo[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const arr = JSON.parse(raw) as Photo[];
    return arr.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export async function savePhotos(photos: Photo[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(photos, null, 2), 'utf-8');
}

export async function addPhoto(input: Omit<Photo, 'id' | 'order' | 'createdAt' | 'updatedAt'>): Promise<Photo> {
  const photos = await getPhotos();
  const now = new Date().toISOString();
  const newPhoto: Photo = {
    ...input,
    id: cryptoRandomId(),
    order: photos.length,
    createdAt: now,
    updatedAt: now,
  };
  photos.push(newPhoto);
  await savePhotos(photos);
  return newPhoto;
}

export async function updatePhoto(id: string, patch: Partial<Omit<Photo, 'id' | 'createdAt'>>): Promise<Photo | null> {
  const photos = await getPhotos();
  const idx = photos.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const updated: Photo = {
    ...photos[idx],
    ...patch,
    id: photos[idx].id,
    createdAt: photos[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  photos[idx] = updated;
  await savePhotos(photos);
  return updated;
}

export async function deletePhoto(id: string): Promise<boolean> {
  const photos = await getPhotos();
  const next = photos.filter((p) => p.id !== id);
  if (next.length === photos.length) return false;
  next.forEach((p, i) => { p.order = i; });
  await savePhotos(next);
  return true;
}

export async function reorderPhotos(orderedIds: string[]): Promise<void> {
  const photos = await getPhotos();
  const map = new Map(photos.map((p) => [p.id, p] as const));
  const next: Photo[] = [];
  orderedIds.forEach((id, i) => {
    const p = map.get(id);
    if (p) { p.order = i; next.push(p); map.delete(id); }
  });
  for (const leftover of map.values()) {
    leftover.order = next.length;
    next.push(leftover);
  }
  await savePhotos(next);
}

function cryptoRandomId(): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${t}${r}`;
}
