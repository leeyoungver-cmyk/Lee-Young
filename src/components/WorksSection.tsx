'use client';

import { useState, useEffect } from 'react';
import type { Work } from '@/types/work';
import type { Lang } from '@/app/page';

export default function WorksSection({ works, lang = 'ko' }: { works: Work[]; lang?: Lang }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = works.find((w) => w.id === openId) ?? null;

  const grouped = works.reduce<Record<string, Work[]>>((acc, work) => {
    const y = work.year ?? 'N/A';
    (acc[y] ??= []).push(work);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-5xl">
      <SectionHeader title="Works" />

      {works.length === 0 ? (
        <div className="mt-14 text-[13px] text-muted leading-relaxed">
          {lang === 'en'
            ? 'Works will be added soon.'
            : <>작품이 곧 업데이트될 예정입니다.<div className="mt-2 text-[11px] tracking-wider2 uppercase">Works will be added soon.</div></>
          }
        </div>
      ) : (
        <div className="mt-16 md:mt-20 space-y-20 md:space-y-28">
          {years.map((year) => {
            const items = grouped[year];
            return (
              <section key={year} id={`year-${year}`}>
                {/* Year label — minimal, no rule */}
                <div className="mb-10 md:mb-12">
                  <span className="text-[11px] tracking-wider2 uppercase text-muted">{year}</span>
                </div>

                {/* 2-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14 md:gap-x-14 md:gap-y-20 items-start">
                  {items.map((w) => (
                    <button
                      key={w.id}
                      onClick={() => setOpenId(w.id)}
                      className="group text-left"
                    >
                      <div className="aspect-[3/4] bg-subtle overflow-hidden">
                        {w.images[0] ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={w.images[0].src}
                            alt={w.title}
                            className="w-full h-full object-cover transition-[opacity,transform,filter] duration-700 group-hover:scale-[1.03] group-hover:brightness-[0.95] opacity-0"
                            onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] tracking-wider2 uppercase text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="mt-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[15px] md:text-[16px] leading-snug">
                            {lang === 'en' && w.titleEn ? w.titleEn : w.title}
                          </span>
                          {w.url && (
                            <span className="text-[9px] tracking-wider2 uppercase text-muted border border-line px-1.5 py-0.5 shrink-0">
                              Video
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 text-[12px] text-muted truncate">
                          {w.year}{w.medium ? ` · ${lang === 'en' && w.mediumEn ? w.mediumEn : w.medium}` : ''}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {open && <WorkLightbox work={open} onClose={() => setOpenId(null)} lang={lang} />}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-5">
      <h2 className="text-[11px] tracking-wider3 uppercase text-muted shrink-0">{title}</h2>
      <div className="flex-1 h-px bg-line" />
    </div>
  );
}

function WorkLightbox({ work, onClose, lang = 'ko' }: { work: Work; onClose: () => void; lang?: Lang }) {
  const isEn = lang === 'en';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-bg overflow-y-auto lightbox-enter"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-w-4xl mx-auto px-5 md:px-14 py-8 md:py-10">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-wider2 uppercase text-muted">
            Lee Young — Works
          </div>
          <button
            onClick={onClose}
            className="text-[11px] tracking-wider2 uppercase hover:opacity-50 transition-opacity"
            aria-label="Close"
          >
            Close ✕
          </button>
        </div>

        <div className="mt-14 md:mt-20">
          <h3 className="text-[20px] md:text-[32px] font-light tracking-tight leading-tight">
            {isEn && work.titleEn ? work.titleEn : work.title}
          </h3>
          <div className="mt-3 text-[13px] text-muted tracking-wide">
            {work.year}{work.medium ? ` · ${isEn && work.mediumEn ? work.mediumEn : work.medium}` : ''}
          </div>
          {(isEn ? (work.descriptionEn || work.description) : work.description) && (
            <div className="mt-8 max-w-2xl text-[15px] leading-[1.9] text-ink/85 space-y-5">
              {(isEn ? (work.descriptionEn || work.description) : work.description)!
                .split('\n\n')
                .map((para, i) => (
                  <p key={i}>{para.replace(/\n/g, ' ')}</p>
                ))}
            </div>
          )}
          {work.url && (
            <a
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-[11px] tracking-wider2 uppercase border border-ink px-4 py-2 hover:bg-ink hover:text-bg transition-colors"
            >
              Video link →
            </a>
          )}
        </div>

        <div className="mt-16 md:mt-20 space-y-10">
          {work.images.map((img, i) => (
            <figure key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.caption ?? `${work.title} ${i + 1}`}
                className="w-full h-auto opacity-0 transition-opacity duration-700"
                onLoad={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '1'; }}
              />
              {img.caption && (
                <figcaption className="mt-3 text-[12px] text-muted leading-relaxed">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="mt-24 mb-8 flex justify-center">
          <button
            onClick={onClose}
            className="text-[11px] tracking-wider2 uppercase text-muted hover:text-ink transition-colors"
          >
            ← Back to Works
          </button>
        </div>
      </div>
    </div>
  );
}
