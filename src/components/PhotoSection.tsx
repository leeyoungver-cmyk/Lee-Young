'use client';

import { useEffect, useState } from 'react';
import type { Lang } from '@/app/page';
import type { Photo } from '@/types/photo';

export default function PhotoSection({ lang = 'ko' }: { lang?: Lang }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((data) => setPhotos(data.photos ?? []))
      .catch(() => setPhotos([]));
  }, []);

  const isEn = lang === 'en';

  return (
    <div className="w-full px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-5xl mx-auto">
      <h2 className="text-[11px] tracking-wider3 uppercase text-muted">Photo</h2>

      {photos.length === 0 ? (
        <div className="mt-14 text-[13px] text-muted leading-relaxed">
          {isEn
            ? 'Photos will be added soon.'
            : <>사진이 곧 업데이트될 예정입니다.<div className="mt-2 text-[11px] tracking-wider2 uppercase">Photos will be added soon.</div></>
          }
        </div>
      ) : !expanded ? (
        // ── STACK STATE ──
        <div className="mt-16 md:mt-24 flex justify-center">
          <button
            onClick={() => setExpanded(true)}
            className="group relative w-[62vw] md:w-[36vw] max-w-[420px] aspect-[3/4] cursor-pointer"
            aria-label="Expand photo archive"
          >
            {/* Bottom card */}
            <div
              className="absolute inset-0 bg-subtle overflow-hidden shadow-[0_10px_30px_-12px_rgba(0,0,0,0.3)] transition-transform duration-700 ease-out"
              style={{ transform: 'translate(8%, 6%) rotate(6deg)' }}
            >
              {photos[2]?.images[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photos[2].images[0].src} alt="" className="block w-full h-full object-cover opacity-90" />
              )}
            </div>
            {/* Middle card */}
            <div
              className="absolute inset-0 bg-subtle overflow-hidden shadow-[0_12px_30px_-12px_rgba(0,0,0,0.35)] transition-transform duration-700 ease-out"
              style={{ transform: 'translate(-6%, 3%) rotate(-4deg)' }}
            >
              {photos[1]?.images[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photos[1].images[0].src} alt="" className="block w-full h-full object-cover opacity-95" />
              )}
            </div>
            {/* Top card (representative) */}
            <div className="absolute inset-0 bg-subtle overflow-hidden shadow-[0_18px_36px_-12px_rgba(0,0,0,0.45)] transition-transform duration-700 ease-out group-hover:-translate-y-2">
              {photos[0]?.images[0] && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={photos[0].images[0].src} alt="" className="block w-full h-full object-cover" />
              )}
            </div>
            {/* Hint */}
            <div className="absolute -bottom-10 left-0 right-0 flex justify-center">
              <span className="text-[10px] tracking-wider2 uppercase text-muted">
                {isEn ? `Tap to open · ${photos.length}` : `눌러서 열기 · ${photos.length}장`}
              </span>
            </div>
          </button>
        </div>
      ) : (
        // ── EXPANDED STATE ──
        <div className="mt-16 md:mt-20">
          <div className="flex items-center justify-between mb-10">
            <span className="text-[12px] tracking-wider2 uppercase text-muted">
              {isEn ? `Archive · ${photos.length}` : `아카이브 · ${photos.length}장`}
            </span>
            <button
              onClick={() => setExpanded(false)}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] transition-all duration-500"
            >
              {isEn ? '↑ Collapse' : '↑ 접기'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14 md:gap-x-14 md:gap-y-20">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setOpenIdx(i)}
                className="group text-left photo-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="bg-subtle overflow-hidden relative">
                  {p.images[0] && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.images[0].src}
                      alt={p.caption ?? ''}
                      className="block w-full h-auto transition-[opacity,transform,filter] duration-700 group-hover:scale-[1.03] group-hover:brightness-[0.95] opacity-0"
                      onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                    />
                  )}
                  {p.images.length > 1 && (
                    <span className="absolute top-2 right-2 text-[9px] tracking-wider2 uppercase text-bg bg-ink/60 px-1.5 py-0.5">
                      +{p.images.length - 1}
                    </span>
                  )}
                </div>
                {p.caption && (
                  <div className="mt-3 text-[12px] md:text-[13px] text-muted leading-relaxed">
                    {p.caption}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {openIdx !== null && photos[openIdx] && (
        <PhotoLightbox
          photo={photos[openIdx]}
          onClose={() => setOpenIdx(null)}
          onPrev={openIdx > 0 ? () => setOpenIdx(openIdx - 1) : undefined}
          onNext={openIdx < photos.length - 1 ? () => setOpenIdx(openIdx + 1) : undefined}
        />
      )}

      <style jsx>{`
        .photo-card { animation: photoRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes photoRise {
          from { opacity: 0; transform: translateY(14px); filter: blur(5px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

function PhotoLightbox({
  photo, onClose, onPrev, onNext,
}: {
  photo: Photo;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose, onPrev, onNext]);

  const caption = photo.caption;
  const isPair = photo.images.length === 2;

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-bg overflow-y-auto lightbox-enter"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`${isPair ? 'max-w-6xl' : 'max-w-4xl'} mx-auto px-5 md:px-14 py-8 md:py-10`}>
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-wider2 uppercase text-muted">Lee Young — Photo</div>
          <button
            onClick={onClose}
            className="text-[11px] tracking-wider2 uppercase hover:[filter:blur(0.7px)] transition-all duration-500"
            aria-label="Close"
          >Close ✕</button>
        </div>

        <div className="mt-10 md:mt-14">
          {isPair ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
              {photo.images.map((img, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={img.src}
                  alt={caption ?? ''}
                  className="w-full h-auto opacity-0 transition-opacity duration-700"
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-6 md:space-y-10">
              {photo.images.map((img, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={i}
                  src={img.src}
                  alt={caption ?? ''}
                  className="w-full h-auto opacity-0 transition-opacity duration-700"
                  onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                />
              ))}
            </div>
          )}
          {caption && (
            <p className="mt-5 text-[13px] md:text-[14px] text-muted leading-relaxed max-w-2xl break-keep">
              {caption}
            </p>
          )}
        </div>

        {(onPrev || onNext) && (
          <div className="mt-12 mb-8 flex items-center justify-between">
            <button
              onClick={onPrev}
              disabled={!onPrev}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >← Prev</button>
            <button
              onClick={onClose}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] transition-all duration-500"
            >Back</button>
            <button
              onClick={onNext}
              disabled={!onNext}
              className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink hover:[filter:blur(0.7px)] disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-500"
            >Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
