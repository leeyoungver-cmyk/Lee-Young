'use client';

import { useState } from 'react';
import type { Work } from '@/types/work';
import type { Lang } from '@/app/page';

export default function WorksSection({ works, lang = 'ko' }: { works: Work[]; lang?: Lang }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = works.find((w) => w.id === openId) ?? null;

  // Group by year, descending
  const grouped = works.reduce<Record<string, Work[]>>((acc, work) => {
    const y = work.year ?? 'N/A';
    (acc[y] ??= []).push(work);
    return acc;
  }, {});
  const years = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-6xl">
      <SectionHeader title="Works" />

      {works.length === 0 ? (
        <div className="mt-14 text-[13px] text-muted leading-relaxed">
          {lang === 'en'
            ? 'Works will be added soon.'
            : <>작품이 곧 업데이트될 예정입니다.<div className="mt-2 text-[11px] tracking-wider2 uppercase">Works will be added soon.</div></>
          }
        </div>
      ) : (
        <div className="mt-12 md:mt-16 space-y-16 md:space-y-20">
          {years.map((year) => {
            const items = grouped[year];
            return (
              <section key={year}>
                {/* Year group header */}
                <div className="flex items-baseline gap-4 mb-8 md:mb-10">
                  <span className="text-[20px] font-light tracking-tight shrink-0">{year}</span>
                  <div className="flex-1 h-px bg-line self-center" />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12 items-start">
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
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[11px] tracking-wider2 uppercase text-muted">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="text-[14px] leading-snug flex items-center gap-2">
                          {lang === 'en' && w.titleEn ? w.titleEn : w.title}
                          {w.url && (
                            <span className="text-[9px] tracking-wider2 uppercase text-muted border border-line px-1.5 py-0.5 shrink-0">
                              Video
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[12px] text-muted truncate">
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
  return (
    <div
      role="dialog"
      aria-modal
      className="fixed inset-0 z-50 bg-bg overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="max-w-5xl mx-auto px-8 md:px-14 py-10">
        <div className="flex items-center justify-between">
          <div className="text-[10px] tracking-wider2 uppercase text-muted">
            Lee Young — Works
          </div>
          <button
            onClick={onClose}
            className="text-[11px] tracking-wider2 uppercase hover:opacity-60 transition-opacity"
            aria-label="Close"
          >
            Close ✕
          </button>
        </div>

        <div className="mt-12 md:mt-16">
          <h3 className="text-[22px] md:text-[30px] font-light tracking-tight leading-tight">
            {isEn && work.titleEn ? work.titleEn : work.title}
          </h3>
          <div className="mt-2 text-[12px] text-muted">
            {work.year}{work.medium ? ` · ${isEn && work.mediumEn ? work.mediumEn : work.medium}` : ''}
          </div>
          {(isEn ? (work.descriptionEn || work.description) : work.description) && (
            <p className="mt-6 max-w-prose2 text-[14px] leading-[1.9] text-ink/90 whitespace-pre-wrap">
              {isEn ? (work.descriptionEn || work.description) : work.description}
            </p>
          )}
          {work.url && (
            <a
              href={work.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-[11px] tracking-wider2 uppercase border border-ink px-4 py-2 hover:bg-ink hover:text-bg transition-colors"
            >
              Video link →
            </a>
          )}
        </div>

        <div className="mt-12 md:mt-16 space-y-12">
          {work.images.map((img, i) => (
            <figure key={i}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={img.caption ?? `${work.title} ${i + 1}`}
                className="w-full h-auto"
              />
              {img.caption && (
                <figcaption className="mt-3 text-[12px] text-muted leading-relaxed max-w-prose2">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>

        <div className="mt-20 mb-8 flex justify-center">
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
