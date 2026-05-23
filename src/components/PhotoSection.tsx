'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [stackHover, setStackHover] = useState(false);

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

  // Stack card layouts: idle vs hovered (subtle spread)
  const stackLayouts = [
    // [depth 0 (top), 1, 2, 3]
    { idle: { tx: 0, ty: 0,  rot: 0,    sx: 1 },     hov: { tx: 0, ty: -3,  rot: 0,    sx: 1 } },
    { idle: { tx: -7, ty: 4, rot: -4.5, sx: 0.97 },  hov: { tx: -13, ty: 5, rot: -8,   sx: 0.97 } },
    { idle: { tx: 6, ty: 6,  rot: 4.5,  sx: 0.95 },  hov: { tx: 12, ty: 8,  rot: 8,    sx: 0.95 } },
    { idle: { tx: -2, ty: 9, rot: -1.5, sx: 0.93 },  hov: { tx: -4, ty: 13, rot: -3,   sx: 0.93 } },
  ];

  return (
    <div className="w-full px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-6xl mx-auto">
      <h2 className="text-[11px] tracking-wider3 uppercase text-muted">Photo</h2>

      {photos.length === 0 ? (
        <div className="mt-14" aria-hidden />
      ) : phase !== 'expanded' ? (
        // ── STACK STATE ──
        <div className="mt-16 md:mt-20 flex justify-center">
          <button
            onClick={openStack}
            disabled={phase === 'opening'}
            onMouseEnter={() => setStackHover(true)}
            onMouseLeave={() => setStackHover(false)}
            className="group relative w-[50vw] md:w-[26vw] max-w-[300px] aspect-[3/4] cursor-pointer"
            aria-label="Open photo archive"
          >
            {[3, 2, 1, 0].map((depth) => {
              const isTop = depth === 0;
              const photo = photos[depth] ?? photos[0];
              if (!photo?.images[0]) return null;
              const l = stackHover && phase === 'stack' ? stackLayouts[depth].hov : stackLayouts[depth].idle;
              const fanClasses = ['fan-0', 'fan-1', 'fan-2', 'fan-3'];
              return (
                <div
                  key={depth}
                  className={`absolute inset-0 bg-subtle overflow-hidden ${phase === 'opening' ? fanClasses[depth] : ''}`}
                  style={{
                    transform: phase === 'opening' ? undefined : `translate(${l.tx}%, ${l.ty}%) rotate(${l.rot}deg) scale(${l.sx})`,
                    transition: phase === 'opening' ? undefined : 'transform 600ms cubic-bezier(0.22,1,0.36,1)',
                    transformOrigin: 'bottom center',
                    zIndex: 10 - depth,
                    boxShadow: `0 ${10 + depth * 6}px ${24 + depth * 4}px -10px rgba(0,0,0,${0.32 - depth * 0.05})`,
                  }}
                >
                  {isTop ? (
                    // Cross-fade slideshow: all top photos pre-rendered, opacity-toggled
                    <>
                      {photos.map((p, i) => (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          key={p.id}
                          src={p.images[0]?.src}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms] ease-in-out"
                          style={{
                            opacity: i === slideIdx % photos.length ? 1 : 0,
                            filter: 'grayscale(1) contrast(0.95)',
                          }}
                        />
                      ))}
                    </>
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
        // ── EXPANDED — album list ──
        <div className="mt-12 md:mt-16 expand-root">
          <div className="mb-8 md:mb-12" />

          <ul className="divide-y divide-line/60 border-t border-line/60">
            {photos.map((album, ai) => {
              const isOpen = openAlbums.has(album.id);
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
                      {/* mini stack thumbnail — color, compact */}
                      <div className="relative w-[36px] md:w-[44px] aspect-[3/4] shrink-0">
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
                              className="absolute inset-0 bg-subtle overflow-hidden"
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
                              />
                            </div>
                          );
                        })}
                      </div>
                      <h3 className="text-[13px] md:text-[15px] font-light tracking-tight break-keep group-hover:[filter:blur(0.4px)] transition-[filter] duration-500">
                        {(isEn ? (album.captionEn || album.caption) : album.caption) || (isEn ? 'Untitled' : '제목 없음')}
                      </h3>
                    </div>
                    <div className="flex items-center shrink-0">
                      <span
                        className="text-[12px] text-muted transition-transform duration-500"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >▾</span>
                    </div>
                  </button>

                  {/* Album photos — 1 column, no frame, cascade open */}
                  <div
                    className="overflow-hidden transition-[max-height,opacity] duration-700"
                    style={{
                      maxHeight: isOpen ? '20000px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    <div className="pb-12 md:pb-16 pt-2 space-y-6 md:space-y-10">
                      {album.images.map((img, j) => (
                        <button
                          key={j}
                          onClick={() => setOpen({ albumId: album.id, index: j })}
                          className={`group block w-full bg-subtle overflow-hidden ${isOpen ? 'photo-rise' : ''}`}
                          style={{ animationDelay: `${j * 90}ms` }}
                          aria-label={`${album.caption ?? 'Photo'} ${j + 1}`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.src}
                            alt=""
                            loading="lazy"
                            className="block w-full h-auto transition-[opacity,transform,filter] duration-700 group-hover:scale-[1.01] group-hover:brightness-[0.96]"
                            style={{ opacity: 0 }}
                            onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                          />
                        </button>
                      ))}
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
          lang={lang}
          onClose={() => setOpen(null)}
          onChange={(i) => setOpen({ albumId: openAlbum.id, index: i })}
        />
      )}

      <style jsx>{`
        .slide-fade { animation: slideFade 800ms cubic-bezier(0.22, 1, 0.36, 1); }
        @keyframes slideFade {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }

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
        .photo-rise {
          animation: photoRise 900ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes photoRise {
          from { opacity: 0; transform: translateY(40px); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

function PhotoLightbox({
  album, index, lang, onClose, onChange,
}: {
  album: Photo;
  index: number;
  lang: Lang;
  onClose: () => void;
  onChange: (i: number) => void;
}) {
  const displayCaption = lang === 'en' ? (album.captionEn || album.caption) : album.caption;
  const total = album.images.length;
  const [autoPlay, setAutoPlay] = useState(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cross-fade overlay: keep one image fully visible underneath while the next fades in over it
  const [displayedIdx, setDisplayedIdx] = useState(index);
  const [incomingIdx, setIncomingIdx] = useState<number | null>(null);
  const transitionRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (index === displayedIdx) return;
    if (transitionRef.current) clearTimeout(transitionRef.current);
    setIncomingIdx(index);
    transitionRef.current = setTimeout(() => {
      setDisplayedIdx(index);
      setIncomingIdx(null);
    }, 1500);
    return () => {
      if (transitionRef.current) clearTimeout(transitionRef.current);
    };
  }, [index, displayedIdx]);

  // Stable refs so the auto-slide interval isn't reset on every parent render
  const indexRef = useRef(index);
  const totalRef = useRef(total);
  const onChangeRef = useRef(onChange);
  useEffect(() => { indexRef.current = index; }, [index]);
  useEffect(() => { totalRef.current = total; }, [total]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Auto-slideshow — 4s interval
  useEffect(() => {
    if (!autoPlay) return;
    const intv = setInterval(() => {
      const i = indexRef.current;
      const t = totalRef.current;
      onChangeRef.current(i < t - 1 ? i + 1 : 0);
    }, 4000);
    return () => clearInterval(intv);
  }, [autoPlay]);

  const pauseAndResume = () => {
    setAutoPlay(false);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setAutoPlay(true), 8000);
  };

  const goPrev = () => {
    pauseAndResume();
    if (index > 0) onChange(index - 1);
  };
  const goNext = () => {
    pauseAndResume();
    if (index < total - 1) onChange(index + 1);
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total]);

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-bg overflow-y-auto lightbox-enter"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full px-4 md:px-8 py-5 md:py-6">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-wider2 uppercase text-muted">
            Lee Young — Photo {displayCaption ? `/ ${displayCaption}` : ''}
          </div>
          <button
            onClick={onClose}
            className="text-[11px] tracking-wider2 uppercase hover:[filter:blur(0.7px)] transition-all duration-500"
            aria-label="Close"
          >Close ✕</button>
        </div>

        {/* Image area — incoming overlays current with fade-in (no dim midpoint) */}
        <div className="mt-4 md:mt-6 relative w-full" style={{ height: '82vh' }}>
          {/* Always-visible current image */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={album.images[displayedIdx]?.src}
              alt={album.caption ?? ''}
              className="max-w-full max-h-full w-auto h-auto object-contain"
            />
          </div>
          {/* Incoming overlay fades in from 0 → 1 */}
          {incomingIdx !== null && (
            <div key={`in-${incomingIdx}`} className="absolute inset-0 flex items-center justify-center fade-in-overlay">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={album.images[incomingIdx]?.src}
                alt={album.caption ?? ''}
                className="max-w-full max-h-full w-auto h-auto object-contain"
              />
            </div>
          )}
        </div>

        <div className="mt-5 md:mt-6 flex flex-col gap-3 items-center">
          <div className="flex items-center gap-4 text-[10px] tracking-wider2 uppercase text-muted">
            <span className="tabular-nums">{index + 1} / {total}</span>
            <span>·</span>
            <button
              onClick={() => setAutoPlay((v) => !v)}
              className="hover:text-ink transition-colors"
            >
              {autoPlay ? '❚❚ Pause' : '▶ Play'}
            </button>
          </div>
          <div className="flex items-center gap-10">
            <button
              onClick={goPrev}
              disabled={index === 0}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >← Prev</button>
            <button
              onClick={onClose}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] transition-all duration-500"
            >Back</button>
            <button
              onClick={goNext}
              disabled={index === total - 1}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >Next →</button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .fade-in-overlay {
          animation: fadeInOverlay 1500ms ease-in-out forwards;
        }
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
