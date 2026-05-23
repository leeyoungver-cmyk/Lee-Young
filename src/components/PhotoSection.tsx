'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '@/app/page';
import type { Photo } from '@/types/photo';

type Phase = 'stack' | 'opening' | 'expanded';
type OpenState = { albumId: string; index: number };

export default function PhotoSection({ lang = 'ko' }: { lang?: Lang }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [phase, setPhase] = useState<Phase>('stack');
  const [openAlbums, setOpenAlbums] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<OpenState | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => setPhotos([]));
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;
    const intv = setInterval(() => setSlideIdx((i) => (i + 1) % photos.length), 3000);
    return () => clearInterval(intv);
  }, [photos.length]);

  // Stable random tilts per photo (deterministic by id+index)
  const tilts = useMemo(() => {
    const map: Record<string, number[]> = {};
    photos.forEach((p) => {
      const arr: number[] = [];
      for (let i = 0; i < p.images.length; i++) {
        const seed = (p.id.charCodeAt((i * 3) % p.id.length) + i * 13) % 100;
        arr.push(((seed - 50) / 50) * 1.5); // -1.5° ~ +1.5°
      }
      map[p.id] = arr;
    });
    return map;
  }, [photos]);

  const isEn = lang === 'en';
  const openAlbum = open ? photos.find((p) => p.id === open.albumId) : null;

  const toggleAlbum = (id: string) => {
    setOpenAlbums((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openStack = () => {
    if (phase !== 'stack') return;
    setPhase('opening');
    setTimeout(() => setPhase('expanded'), 700);
  };

  const closeToStack = () => {
    setPhase('stack');
    setOpenAlbums(new Set());
  };

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
      ) : phase !== 'expanded' ? (
        // ── STACK STATE ──
        <div className="mt-16 md:mt-20 flex justify-center">
          <button
            onClick={openStack}
            disabled={phase === 'opening'}
            className="group relative w-[50vw] md:w-[26vw] max-w-[300px] aspect-[3/4] cursor-pointer"
            aria-label="Open photo archive"
          >
            {[3, 2, 1, 0].map((depth) => {
              const isTop = depth === 0;
              const slidePhoto = photos[(slideIdx + depth) % photos.length];
              const photo = isTop ? slidePhoto : (photos[depth] ?? slidePhoto);
              if (!photo?.images[0]) return null;
              const layouts = [
                { tx: 0, ty: 0, rot: 0,    sx: 1 },
                { tx: -7, ty: 4, rot: -4.5, sx: 0.97 },
                { tx: 6, ty: 6, rot: 4.5,   sx: 0.95 },
                { tx: -2, ty: 9, rot: -1.5, sx: 0.93 },
              ];
              const fanClasses = ['fan-0', 'fan-1', 'fan-2', 'fan-3'];
              const l = layouts[depth];
              return (
                <div
                  key={depth}
                  className={`absolute inset-0 bg-subtle overflow-hidden ${phase === 'opening' ? fanClasses[depth] : ''}`}
                  style={{
                    transform: phase === 'opening' ? undefined : `translate(${l.tx}%, ${l.ty}%) rotate(${l.rot}deg) scale(${l.sx})`,
                    transition: phase === 'opening' ? undefined : 'transform 700ms cubic-bezier(0.22,1,0.36,1)',
                    transformOrigin: 'bottom center',
                    zIndex: 10 - depth,
                    boxShadow: `0 ${10 + depth * 6}px ${24 + depth * 4}px -10px rgba(0,0,0,${0.32 - depth * 0.05})`,
                  }}
                >
                  {isTop ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={slidePhoto.id}
                      src={slidePhoto.images[0].src}
                      alt=""
                      className="block w-full h-full object-cover slide-fade"
                      style={{ filter: 'grayscale(1) contrast(0.95)' }}
                    />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={photo.images[0].src}
                      alt=""
                      className="block w-full h-full object-cover"
                      style={{ filter: 'grayscale(1) contrast(0.95)' }}
                    />
                  )}
                </div>
              );
            })}
          </button>
        </div>
      ) : (
        // ── EXPANDED — album list with mini stacks ──
        <div className="mt-12 md:mt-16 expand-root">
          <div className="flex items-center justify-end mb-8 md:mb-12">
            <button
              onClick={closeToStack}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] transition-all duration-500"
            >
              {isEn ? '↑ Collapse all' : '↑ 닫기'}
            </button>
          </div>

          <ul className="divide-y divide-line/60 border-t border-line/60">
            {photos.map((album, ai) => {
              const isOpen = openAlbums.has(album.id);
              const albumTilts = tilts[album.id] ?? [];
              return (
                <li
                  key={album.id}
                  className="album-entry"
                  style={{ animationDelay: `${ai * 90 + 80}ms` }}
                >
                  <button
                    onClick={() => toggleAlbum(album.id)}
                    className="w-full flex items-center justify-between gap-5 py-6 md:py-8 text-left group"
                  >
                    <div className="flex items-center gap-5 md:gap-7 min-w-0">
                      {/* mini stack thumbnail */}
                      <div className="relative w-[68px] md:w-[80px] aspect-[3/4] shrink-0">
                        {[2, 1, 0].map((d) => {
                          const img = album.images[d]?.src ?? album.images[0]?.src;
                          if (!img) return null;
                          const layouts = [
                            { tx: 0, ty: 0, rot: 0 },
                            { tx: -10, ty: 4, rot: -5 },
                            { tx: 10, ty: 7, rot: 5 },
                          ];
                          const l = layouts[d];
                          return (
                            <div
                              key={d}
                              className="absolute inset-0 bg-subtle overflow-hidden transition-transform duration-500 group-hover:[--hov:1]"
                              style={{
                                transform: `translate(${l.tx}%, ${l.ty}%) rotate(${l.rot}deg)`,
                                zIndex: 10 - d,
                                boxShadow: `0 ${4 + d * 3}px ${8 + d * 2}px -4px rgba(0,0,0,${0.3 - d * 0.06})`,
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={img}
                                alt=""
                                className="block w-full h-full object-cover"
                                style={{ filter: 'grayscale(1) contrast(0.95)' }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <h3 className="text-[13px] md:text-[15px] font-light tracking-tight break-keep group-hover:[filter:blur(0.4px)] transition-[filter] duration-500">
                        {album.caption || (isEn ? 'Untitled' : '제목 없음')}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] tracking-wider2 uppercase text-muted tabular-nums">
                        {album.images.length}
                      </span>
                      <span
                        className="text-[12px] text-muted transition-transform duration-500"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >▾</span>
                    </div>
                  </button>

                  {/* Album photos — 촤라락 cascade open */}
                  <div
                    className="overflow-hidden transition-[max-height,opacity] duration-700"
                    style={{
                      maxHeight: isOpen ? '12000px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <div className="pb-12 md:pb-16 pt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 md:gap-x-10 gap-y-8 md:gap-y-12">
                        {album.images.map((img, j) => (
                          <button
                            key={j}
                            onClick={() => setOpen({ albumId: album.id, index: j })}
                            className={`group block ${isOpen ? 'polaroid-pop' : ''}`}
                            style={{
                              transform: `rotate(${albumTilts[j] ?? 0}deg)`,
                              animationDelay: `${j * 70}ms`,
                            }}
                            aria-label={`${album.caption ?? 'Photo'} ${j + 1}`}
                          >
                            <div className="bg-white p-2.5 md:p-3 pb-7 md:pb-10 shadow-[0_10px_22px_-10px_rgba(0,0,0,0.4)] transition-transform duration-500 group-hover:-translate-y-1">
                              <div className="aspect-[3/4] bg-subtle overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={img.src}
                                  alt=""
                                  className="w-full h-full object-cover transition-[opacity,transform,filter] duration-700 group-hover:scale-[1.02] group-hover:brightness-[0.96]"
                                  style={{ opacity: 0 }}
                                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                                />
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
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
        /* Top card slide cross-fade */
        .slide-fade { animation: slideFade 800ms cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes slideFade {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }

        /* 촤라락 fan-up open: cards sweep up sequentially */
        .fan-0 { animation: fanUp 700ms cubic-bezier(0.5, 0, 0.6, 1) 0ms forwards; }
        .fan-1 { animation: fanUp 700ms cubic-bezier(0.5, 0, 0.6, 1) 70ms forwards; }
        .fan-2 { animation: fanUp 700ms cubic-bezier(0.5, 0, 0.6, 1) 140ms forwards; }
        .fan-3 { animation: fanUp 700ms cubic-bezier(0.5, 0, 0.6, 1) 210ms forwards; }
        @keyframes fanUp {
          to {
            transform: translateY(-220%) rotate(18deg) scale(0.82);
            opacity: 0;
          }
        }

        /* Expanded root */
        .expand-root {
          animation: expandRoot 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes expandRoot {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .album-entry {
          animation: albumRise 700ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes albumRise {
          from { opacity: 0; transform: translateY(14px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        /* 촤라락 polaroid wave in */
        .polaroid-pop {
          animation: polaroidPop 800ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes polaroidPop {
          from { opacity: 0; transform: translateY(28px) rotate(0deg) scale(0.94); filter: blur(8px); }
          to { opacity: 1; filter: blur(0); }
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
