'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Work, WorkImage } from '@/types/work';
import type { Photo } from '@/types/photo';

const TOKEN_KEY = 'ly_admin_token';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = typeof window !== 'undefined' ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (t) setToken(t);
  }, []);

  if (!token) {
    return <Login onSuccess={(t) => { window.localStorage.setItem(TOKEN_KEY, t); setToken(t); }} />;
  }

  return <Dashboard token={token} onLogout={() => { window.localStorage.removeItem(TOKEN_KEY); setToken(null); }} />;
}

/* ───────────────────────────────  LOGIN  ─────────────────────────────── */

function Login({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      const r = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Login failed');
      }
      const d = await r.json();
      onSuccess(d.token);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <div className="text-[11px] tracking-wider3 uppercase text-muted">Lee Young / Admin</div>
        <h1 className="mt-2 text-[24px] font-light tracking-tight">Sign in</h1>
        <div className="mt-10">
          <label className="block text-[11px] tracking-wider2 uppercase text-muted mb-2">Password</label>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoFocus
            className="w-full border-b border-ink/40 py-2 text-[15px] focus:outline-none focus:border-ink"
          />
        </div>
        {err && <div className="mt-4 text-[12px] text-red-700">{err}</div>}
        <button
          type="submit"
          disabled={busy || !pw}
          className="mt-8 text-[12px] tracking-wider2 uppercase border border-ink px-6 py-3 disabled:opacity-40 hover:bg-ink hover:text-bg transition-colors"
        >
          {busy ? 'Signing in…' : 'Enter'}
        </button>
        <div className="mt-10 text-[11px] text-muted">
          Set <code className="text-ink">ADMIN_PASSWORD</code> in <code className="text-ink">.env.local</code> before signing in.
        </div>
      </form>
    </main>
  );
}

/* ─────────────────────────────  DASHBOARD  ───────────────────────────── */

type Tab = 'works' | 'photos';

function Dashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>('works');

  return (
    <main className="min-h-screen">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-5 flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <a href="/" className="text-[13px] tracking-wider3 uppercase">Lee Young</a>
            <span className="text-[11px] tracking-wider2 uppercase text-muted">/ Admin</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] tracking-wider2 uppercase">
            <a href="/" className="text-muted hover:text-ink">View site</a>
            <button onClick={onLogout} className="text-muted hover:text-ink">Logout</button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 md:px-10">
          <div className="flex items-center gap-6 text-[11px] tracking-wider2 uppercase pb-2">
            <button
              onClick={() => setTab('works')}
              className={`pb-2 border-b ${tab === 'works' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}
            >Works</button>
            <button
              onClick={() => setTab('photos')}
              className={`pb-2 border-b ${tab === 'photos' ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'}`}
            >Photos</button>
          </div>
        </div>
      </header>

      {tab === 'works' ? <WorksManager token={token} /> : <PhotosManager token={token} />}
    </main>
  );
}

/* ──────────────────────────  WORKS MANAGER  ─────────────────────────── */

function WorksManager({ token }: { token: string }) {
  const [works, setWorks] = useState<Work[]>([]);
  const [editing, setEditing] = useState<Work | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/works');
    const d = await r.json();
    setWorks(d.works ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleDelete(w: Work) {
    if (!confirm(`"${w.title}" 작품을 삭제하시겠습니까?`)) return;
    const r = await fetch(`/api/works/${w.id}`, { method: 'DELETE', headers: { 'x-admin-token': token } });
    if (r.ok) refresh(); else alert('Delete failed');
  }

  async function move(w: Work, dir: -1 | 1) {
    const idx = works.findIndex((x) => x.id === w.id);
    const next = [...works];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setWorks(next);
    await fetch('/api/works', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ orderedIds: next.map((x) => x.id) }),
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] md:text-[28px] font-light tracking-tight">Works</h1>
        <button
          onClick={() => setCreating(true)}
          className="text-[12px] tracking-wider2 uppercase border border-ink px-5 py-2.5 hover:bg-ink hover:text-bg transition-colors"
        >+ New Work</button>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="text-[12px] tracking-wider2 uppercase text-muted">Loading…</div>
        ) : works.length === 0 ? (
          <div className="text-[12px] tracking-wider2 uppercase text-muted">
            No works yet. Click <span className="text-ink">+ New Work</span> to begin.
          </div>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {works.map((w, i) => (
              <li key={w.id} className="py-5 grid grid-cols-[60px_80px_1fr_auto] md:grid-cols-[60px_120px_1fr_auto] gap-4 items-center">
                <div className="flex flex-col gap-1 text-[11px] text-muted">
                  <button onClick={() => move(w, -1)} disabled={i === 0} className="hover:text-ink disabled:opacity-30" aria-label="Move up">▲</button>
                  <button onClick={() => move(w, 1)} disabled={i === works.length - 1} className="hover:text-ink disabled:opacity-30" aria-label="Move down">▼</button>
                </div>
                <div className="w-20 h-24 md:w-[120px] md:h-[120px] bg-subtle overflow-hidden">
                  {w.images[0] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={w.images[0].src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted uppercase tracking-wider2">empty</div>
                  )}
                </div>
                <div>
                  <div className="text-[14px]">{w.title}</div>
                  <div className="mt-1 text-[12px] text-muted">
                    {w.year}{w.medium ? ` · ${w.medium}` : ''} · {w.images.length} image{w.images.length === 1 ? '' : 's'}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] tracking-wider2 uppercase">
                  <button onClick={() => setEditing(w)} className="text-muted hover:text-ink">Edit</button>
                  <button onClick={() => handleDelete(w)} className="text-muted hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(creating || editing) && (
        <WorkEditor
          token={token}
          work={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

/* ──────────────────────────  PHOTOS MANAGER  ─────────────────────────── */

function PhotosManager({ token }: { token: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const r = await fetch('/api/photos');
    const d = await r.json();
    setPhotos(d.photos ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  async function handleDelete(p: Photo) {
    if (!confirm('이 사진을 삭제하시겠습니까?')) return;
    const r = await fetch(`/api/photos/${p.id}`, { method: 'DELETE', headers: { 'x-admin-token': token } });
    if (r.ok) refresh(); else alert('Delete failed');
  }

  async function move(p: Photo, dir: -1 | 1) {
    const idx = photos.findIndex((x) => x.id === p.id);
    const next = [...photos];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setPhotos(next);
    await fetch('/api/photos', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({ orderedIds: next.map((x) => x.id) }),
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] md:text-[28px] font-light tracking-tight">Photos</h1>
        <button
          onClick={() => setCreating(true)}
          className="text-[12px] tracking-wider2 uppercase border border-ink px-5 py-2.5 hover:bg-ink hover:text-bg transition-colors"
        >+ New Photo</button>
      </div>

      <div className="mt-10">
        {loading ? (
          <div className="text-[12px] tracking-wider2 uppercase text-muted">Loading…</div>
        ) : photos.length === 0 ? (
          <div className="text-[12px] tracking-wider2 uppercase text-muted">
            No photos yet. Click <span className="text-ink">+ New Photo</span> to begin.
          </div>
        ) : (
          <ul className="divide-y divide-line border-t border-line">
            {photos.map((p, i) => (
              <li key={p.id} className="py-5 grid grid-cols-[60px_80px_1fr_auto] md:grid-cols-[60px_120px_1fr_auto] gap-4 items-center">
                <div className="flex flex-col gap-1 text-[11px] text-muted">
                  <button onClick={() => move(p, -1)} disabled={i === 0} className="hover:text-ink disabled:opacity-30" aria-label="Move up">▲</button>
                  <button onClick={() => move(p, 1)} disabled={i === photos.length - 1} className="hover:text-ink disabled:opacity-30" aria-label="Move down">▼</button>
                </div>
                <div className="w-20 h-24 md:w-[120px] md:h-[120px] bg-subtle overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[14px]">{p.caption || <span className="text-muted">No caption</span>}</div>
                  {p.srcRight && <div className="mt-1 text-[11px] tracking-wider2 uppercase text-muted">Paired</div>}
                </div>
                <div className="flex items-center gap-4 text-[11px] tracking-wider2 uppercase">
                  <button onClick={() => setEditing(p)} className="text-muted hover:text-ink">Edit</button>
                  <button onClick={() => handleDelete(p)} className="text-muted hover:text-red-700">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {(creating || editing) && (
        <PhotoEditor
          token={token}
          photo={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSaved={() => { setCreating(false); setEditing(null); refresh(); }}
        />
      )}
    </div>
  );
}

/* ───────────────────────────  PHOTO EDITOR  ─────────────────────────── */

function PhotoEditor({
  token, photo, onClose, onSaved,
}: {
  token: string;
  photo: Photo | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !photo;
  const [src, setSrc] = useState(photo?.src ?? '');
  const [srcRight, setSrcRight] = useState(photo?.srcRight ?? '');
  const [caption, setCaption] = useState(photo?.caption ?? '');
  const [uploading, setUploading] = useState<'left' | 'right' | null>(null);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleUpload(fileList: FileList | null, side: 'left' | 'right') {
    if (!fileList || fileList.length === 0) return;
    setUploading(side); setErr(null);
    try {
      const fd = new FormData();
      Array.from(fileList).slice(0, 1).forEach((f) => fd.append('files', f));
      const r = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-token': token }, body: fd });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Upload failed');
      }
      const d = await r.json();
      const first = d.files?.[0];
      if (first?.src) {
        if (side === 'left') setSrc(first.src);
        else setSrcRight(first.src);
      }
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    if (!src.trim()) { setErr('Photo image is required.'); return; }
    setSaving(true); setErr(null);
    try {
      const payload = { src, srcRight: srcRight || undefined, caption };
      const r = await fetch(isNew ? '/api/photos' : `/api/photos/${photo!.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'content-type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Save failed');
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between">
          <div className="text-[11px] tracking-wider2 uppercase text-muted">
            {isNew ? 'New Photo' : 'Edit Photo'}
          </div>
          <button onClick={onClose} className="text-[12px] tracking-wider2 uppercase hover:opacity-60">Cancel ✕</button>
        </div>

        <div className="mt-10 space-y-8">
          <Field label="Images (left + optional right)">
            <div className="grid grid-cols-2 gap-5">
              {/* Left image */}
              <div>
                <div className="w-full aspect-square bg-subtle overflow-hidden">
                  {src ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted uppercase tracking-wider2">left (required)</div>
                  )}
                </div>
                <label className="mt-3 inline-flex items-center gap-3 text-[11px] tracking-wider2 uppercase border border-ink px-3 py-1.5 cursor-pointer hover:bg-ink hover:text-bg transition-colors">
                  {uploading === 'left' ? 'Uploading…' : src ? '↻ Replace' : '+ Add'}
                  <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files, 'left')} className="hidden" disabled={uploading !== null} />
                </label>
              </div>
              {/* Right image */}
              <div>
                <div className="w-full aspect-square bg-subtle overflow-hidden">
                  {srcRight ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={srcRight} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted uppercase tracking-wider2">right (optional)</div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="inline-flex items-center gap-3 text-[11px] tracking-wider2 uppercase border border-ink px-3 py-1.5 cursor-pointer hover:bg-ink hover:text-bg transition-colors">
                    {uploading === 'right' ? 'Uploading…' : srcRight ? '↻ Replace' : '+ Add'}
                    <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files, 'right')} className="hidden" disabled={uploading !== null} />
                  </label>
                  {srcRight && (
                    <button onClick={() => setSrcRight('')} className="text-[10px] tracking-wider2 uppercase text-muted hover:text-red-700">Remove</button>
                  )}
                </div>
              </div>
            </div>
          </Field>

          <Field label="Caption">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full border-b border-ink/40 py-2 text-[15px] leading-relaxed focus:outline-none focus:border-ink resize-y"
              placeholder="사진 설명을 입력하세요. (선택사항)"
            />
          </Field>

          {err && <div className="text-[12px] text-red-700">{err}</div>}

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={save}
              disabled={saving}
              className="text-[12px] tracking-wider2 uppercase bg-ink text-bg px-6 py-3 disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {saving ? 'Saving…' : isNew ? 'Create photo' : 'Save changes'}
            </button>
            <button onClick={onClose} className="text-[12px] tracking-wider2 uppercase text-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────────  WORK EDITOR  ─────────────────────────── */

function WorkEditor({
  token, work, onClose, onSaved,
}: {
  token: string;
  work: Work | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isNew = !work;
  const [title, setTitle] = useState(work?.title ?? '');
  const [year, setYear] = useState(work?.year ?? String(new Date().getFullYear()));
  const [medium, setMedium] = useState(work?.medium ?? '');
  const [description, setDescription] = useState(work?.description ?? '');
  const [images, setImages] = useState<WorkImage[]>(work?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true); setErr(null);
    try {
      const fd = new FormData();
      Array.from(fileList).forEach((f) => fd.append('files', f));
      const r = await fetch('/api/upload', { method: 'POST', headers: { 'x-admin-token': token }, body: fd });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Upload failed');
      }
      const d = await r.json();
      const newImages: WorkImage[] = (d.files ?? []).map((f: any) => ({ src: f.src }));
      setImages((prev) => [...prev, ...newImages]);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  function moveImage(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= images.length) return;
    const next = [...images];
    [next[i], next[j]] = [next[j], next[i]];
    setImages(next);
  }

  function removeImage(i: number) {
    setImages(images.filter((_, idx) => idx !== i));
  }

  function setCaption(i: number, caption: string) {
    setImages(images.map((img, idx) => idx === i ? { ...img, caption } : img));
  }

  async function save() {
    if (!title.trim() || !year.trim()) {
      setErr('Title and year are required.');
      return;
    }
    setSaving(true); setErr(null);
    try {
      const payload = { title, year, medium, description, images };
      const r = await fetch(isNew ? '/api/works' : `/api/works/${work!.id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'content-type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || 'Save failed');
      }
      onSaved();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-bg overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between">
          <div className="text-[11px] tracking-wider2 uppercase text-muted">{isNew ? 'New Work' : 'Edit Work'}</div>
          <button onClick={onClose} className="text-[12px] tracking-wider2 uppercase hover:opacity-60">Cancel ✕</button>
        </div>

        <div className="mt-10 space-y-8">
          <Field label="Title">
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border-b border-ink/40 py-2 text-[16px] focus:outline-none focus:border-ink" placeholder="Untitled" />
          </Field>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Field label="Year">
              <input value={year} onChange={(e) => setYear(e.target.value)} className="w-full border-b border-ink/40 py-2 text-[15px] focus:outline-none focus:border-ink" placeholder="2025" />
            </Field>
            <Field label="Medium">
              <input value={medium} onChange={(e) => setMedium(e.target.value)} className="w-full border-b border-ink/40 py-2 text-[15px] focus:outline-none focus:border-ink" placeholder="Mixed media, video installation…" />
            </Field>
          </div>

          <Field label="Description">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} className="w-full border-b border-ink/40 py-2 text-[15px] leading-relaxed focus:outline-none focus:border-ink resize-y" placeholder="작품 설명을 입력하세요. (선택사항)" />
          </Field>

          <Field label="Images">
            <label className="inline-flex items-center gap-3 text-[12px] tracking-wider2 uppercase border border-ink px-4 py-2 cursor-pointer hover:bg-ink hover:text-bg transition-colors">
              {uploading ? 'Uploading…' : '+ Add images'}
              <input type="file" accept="image/*" multiple onChange={(e) => handleUpload(e.target.files)} className="hidden" disabled={uploading} />
            </label>

            <ul className="mt-6 space-y-4">
              {images.map((img, i) => (
                <li key={i} className="grid grid-cols-[80px_1fr_auto] gap-4 items-start py-3 border-t border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.src} alt="" className="w-20 h-20 object-cover bg-subtle" />
                  <div className="flex flex-col gap-2">
                    <input value={img.caption ?? ''} onChange={(e) => setCaption(i, e.target.value)} placeholder="Caption (optional)" className="w-full border-b border-line py-1 text-[13px] focus:outline-none focus:border-ink" />
                    <div className="text-[10px] text-muted truncate">{img.src}</div>
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] text-muted">
                    <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="hover:text-ink disabled:opacity-30">▲</button>
                    <button onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="hover:text-ink disabled:opacity-30">▼</button>
                    <button onClick={() => removeImage(i)} className="hover:text-red-700 mt-1">✕</button>
                  </div>
                </li>
              ))}
            </ul>
          </Field>

          {err && <div className="text-[12px] text-red-700">{err}</div>}

          <div className="flex items-center gap-4 pt-4">
            <button onClick={save} disabled={saving} className="text-[12px] tracking-wider2 uppercase bg-ink text-bg px-6 py-3 disabled:opacity-40 hover:opacity-90 transition-opacity">
              {saving ? 'Saving…' : isNew ? 'Create work' : 'Save changes'}
            </button>
            <button onClick={onClose} className="text-[12px] tracking-wider2 uppercase text-muted hover:text-ink">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] tracking-wider2 uppercase text-muted mb-3">{label}</label>
      {children}
    </div>
  );
}
