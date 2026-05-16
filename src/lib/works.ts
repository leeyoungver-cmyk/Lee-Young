import { promises as fs } from 'fs';
import path from 'path';
import type { Work } from '@/types/work';

const DATA_FILE = path.join(process.cwd(), 'data', 'works.json');

async function ensureFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function getWorks(): Promise<Work[]> {
  await ensureFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const arr = JSON.parse(raw) as Work[];
    return arr.sort((a, b) => a.order - b.order);
  } catch {
    return [];
  }
}

export async function saveWorks(works: Work[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(works, null, 2), 'utf-8');
}

export async function getWork(id: string): Promise<Work | null> {
  const works = await getWorks();
  return works.find((w) => w.id === id) ?? null;
}

export async function addWork(input: Omit<Work, 'id' | 'order' | 'createdAt' | 'updatedAt'>): Promise<Work> {
  const works = await getWorks();
  const now = new Date().toISOString();
  const newWork: Work = {
    ...input,
    id: cryptoRandomId(),
    order: works.length,
    createdAt: now,
    updatedAt: now,
  };
  works.push(newWork);
  await saveWorks(works);
  return newWork;
}

export async function updateWork(id: string, patch: Partial<Omit<Work, 'id' | 'createdAt'>>): Promise<Work | null> {
  const works = await getWorks();
  const idx = works.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  const updated: Work = {
    ...works[idx],
    ...patch,
    id: works[idx].id,
    createdAt: works[idx].createdAt,
    updatedAt: new Date().toISOString(),
  };
  works[idx] = updated;
  await saveWorks(works);
  return updated;
}

export async function deleteWork(id: string): Promise<boolean> {
  const works = await getWorks();
  const next = works.filter((w) => w.id !== id);
  if (next.length === works.length) return false;
  // re-pack order
  next.forEach((w, i) => { w.order = i; });
  await saveWorks(next);
  return true;
}

export async function reorderWorks(orderedIds: string[]): Promise<void> {
  const works = await getWorks();
  const map = new Map(works.map((w) => [w.id, w] as const));
  const next: Work[] = [];
  orderedIds.forEach((id, i) => {
    const w = map.get(id);
    if (w) {
      w.order = i;
      next.push(w);
      map.delete(id);
    }
  });
  // append any leftovers
  for (const leftover of map.values()) {
    leftover.order = next.length;
    next.push(leftover);
  }
  await saveWorks(next);
}

function cryptoRandomId(): string {
  // 12-char base36 id, sufficient for portfolio scale
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `${t}${r}`;
}
