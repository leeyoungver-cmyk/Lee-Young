'use client';

import { useEffect, useState } from 'react';
import type { Lang } from '@/app/page';
import type { Photo } from '@/types/photo';

type OpenState = { albumId: string; index: number };

export default function PhotoSection({ lang = 'ko' }: { lang?: Lang }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState<OpenState | null>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => setPhotos([]));
  }, []);

  const isEn = lang === 'en';
  const openAlbum = open ? photos.find((p) => p.id === open.albumId) : null;

  return (
    <div className="w-full px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-[11px] tracking-wider3 uppercase text-muted">Photo</h2>

      {photos.length === 0 ? (
        <div className="mt-14 text-[13px] text-muted leading-relaxed">
          {isEn
            ? 'Photos will be added soon.'
            : <>사진이 곧 업데이트될 예정입니다.<div className="mt-2 text-[11px] tracking-wider2 uppercase">Photos will be added soon.</div></>
          }
        </div>
      ) : !expanded ? (
        // ── STACK STATE (no text) ──
        <div className="mt-20 md:mt-28 flex justify-center">
          <button
            onClick={() => setExpanded(true)}
            className="group relative w-[68vw] md:w-[38vw] max-w-[440px] aspect-[3/4] cursor-pointer"
            aria-label="Open photo archive"
          >
            {[3, 2, 1, 0].map((depth) => {
              const photo = photos[depth];
              if (!photo?.images[0]) return null;
              const layouts = [
                { tx: 0, ty: 0, rot: 0,    sx: 1 },          // top (rep)
                { tx: -7, ty: 3, rot: -4.5, sx: 0.97 },
                { tx: 6, ty: 5, rot: 4.5,   sx: 0.95 },
                { tx: -2, ty: 8, rot: -1.5, sx: 0.93 },
              ];
              const l = layouts[depth];
              // On hover, fan out slightly more
              return (
                <div
                  key={depth}
                  className="absolute inset-0 bg-subtle overflow-hidden transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] origin-bottom"
                  style={{
                    transform: `translate(${l.tx}%, ${l.ty}%) rotate(${l.rot}deg) scale(${l.sx})`,
                    zIndex: 10 - depth,
                    boxShadow: `0 ${10 + depth * 6}px ${24 + depth * 4}px -10px rgba(0,0,0,${0.32 - depth * 0.05})`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.images[0].src} alt="" className="block w-full h-full object-cover" />
                </div>
              );
            })}
          </button>
        </div>
      ) : (
        // ── EXPANDED (per-album sections) ──
        <div className="mt-12 md:mt-16 expand-root">
          <div className="flex items-center justify-end mb-10 md:mb-14">
            <button
              onClick={() => setExpanded(false)}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] transition-all duration-500"
            >
              {isEn ? '↑ Collapse' : '↑ 접기'}
            </button>
          </div>

          <div className="space-y-24 md:space-y-32">
            {photos.map((album, ai) => (
              <section
                key={album.id}
                className="album-section"
                style={{ animationDelay: `${ai * 130 + 120}ms` }}
              >
                {album.caption && (
                  <h3 className="mb-6 md:mb-8 text-[16px] md:text-[20px] font-light tracking-tight break-keep">
                    {album.caption}
                  </h3>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
                  {album.images.map((img, j) => (
                    <button
                      key={j}
                      onClick={() => setOpen({ albumId: album.id, index: j })}
                      className="group block aspect-[3/4] bg-subtle overflow-hidden"
                      aria-label={`${album.caption ?? 'Photo'} ${j + 1}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.src}
                        alt=""
                        className="w-full h-full object-cover transition-[opacity,transform,filter] duration-700 group-hover:scale-[1.03] group-hover:brightness-[0.95]"
                        style={{ opacity: 0 }}
                        onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                      />
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}

      {open && openAlbum && (
        <PhotoLightbox
          album={openAlbum}
          index={open.index}
          onClose={() => setOpen(null)}
          onChange={(i) => setOpen({ albumId: openAlbum.id, index: i })}
        />
      )}

      <style jsx>{`
        .expand-root {
          animation: expandRoot 520ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes expandRoot {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .album-section {
          animation: albumRise 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes albumRise {
          from { opacity: 0; transform: translateY(28px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

function PhotoLightbox({
  album, index, onClose, onChange,
}: {
  album: Photo;
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const total = album.images.length;
  const img = album.images[index];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && index > 0) onChange(index - 1);
      else if (e.key === 'ArrowRight' && index < total - 1) onChange(index + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [index, total, onClose, onChange]);

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-bg overflow-y-auto lightbox-enter"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-6 md:py-8">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-wider2 uppercase text-muted">
            Lee Young — Photo {album.caption ? `/ ${album.caption}` : ''}
          </div>
          <button
            onClick={onClose}
            className="text-[11px] tracking-wider2 uppercase hover:[filter:blur(0.7px)] transition-all duration-500"
            aria-label="Close"
          >Close ✕</button>
        </div>

        {/* Image — larger on PC (max 82vh, never bigger than viewport) */}
        <div className="mt-6 md:mt-8 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={img.src}
            src={img.src}
            alt={album.caption ?? ''}
            className="block max-w-full md:max-w-[88vw] lg:max-w-[78vw] max-h-[82vh] w-auto h-auto object-contain opacity-0 transition-opacity duration-700"
            onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
          />
        </div>

        {/* Meta + nav */}
        <div className="mt-6 md:mt-8 flex flex-col gap-4 items-center">
          <div className="text-[10px] tracking-wider2 uppercase text-muted tabular-nums">
            {index + 1} / {total}
          </div>
          <div className="flex items-center gap-10">
            <button
              onClick={() => index > 0 && onChange(index - 1)}
              disabled={index === 0}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >← Prev</button>
            <button
              onClick={onClose}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] transition-all duration-500"
            >Back</button>
            <button
              onClick={() => index < total - 1 && onChange(index + 1)}
              disabled={index === total - 1}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
