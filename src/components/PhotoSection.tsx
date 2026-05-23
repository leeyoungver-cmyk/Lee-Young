'use client';

import type { Lang } from '@/app/page';

export type Country = 'KR' | 'MN' | 'CZ' | 'DE' | 'DK';

export const COUNTRIES: { code: Country; ko: string; en: string }[] = [
  { code: 'KR', ko: '한국', en: 'Korea' },
  { code: 'MN', ko: '몽골', en: 'Mongolia' },
  { code: 'CZ', ko: '체코', en: 'Czech Republic' },
  { code: 'DE', ko: '독일', en: 'Germany' },
  { code: 'DK', ko: '덴마크', en: 'Denmark' },
];

type Photo = { src: string; caption?: string };

// Photo data placeholder — will be populated via admin or directly added later
const PHOTOS: Record<Country, Photo[]> = {
  KR: [],
  MN: [],
  CZ: [],
  DE: [],
  DK: [],
};

export default function PhotoSection({ country = 'KR', lang = 'ko' }: { country?: Country; lang?: Lang }) {
  const photos = PHOTOS[country] ?? [];
  const countryInfo = COUNTRIES.find((c) => c.code === country);
  const countryName = countryInfo ? (lang === 'en' ? countryInfo.en : countryInfo.ko) : country;

  return (
    <div className="w-full px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-5xl mx-auto">
      <h2 className="text-[11px] tracking-wider3 uppercase text-muted">Photo</h2>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="text-[20px] md:text-[26px] font-light tracking-tight">{countryName}</span>
        <span className="text-[11px] tracking-wider2 uppercase text-muted">{country}</span>
      </div>

      {photos.length === 0 ? (
        <div className="mt-16 text-[13px] text-muted leading-relaxed">
          {lang === 'en'
            ? 'Photos will be added soon.'
            : <>사진이 곧 업데이트될 예정입니다.<div className="mt-2 text-[11px] tracking-wider2 uppercase">Photos will be added soon.</div></>
          }
        </div>
      ) : (
        <div className="mt-16 columns-1 md:columns-2 gap-x-10 md:gap-x-14">
          {photos.map((p, i) => (
            <figure key={i} className="break-inside-avoid mb-10 md:mb-14">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.caption ?? ''} className="block w-full h-auto" />
              {p.caption && (
                <figcaption className="mt-2 text-[11px] text-muted leading-relaxed">{p.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
