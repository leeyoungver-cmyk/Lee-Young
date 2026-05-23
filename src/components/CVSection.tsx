import type { Lang } from '@/app/page';

type Entry = {
  year: string;
  title: string;
  titleEn?: string;
  venue: string;
  venueEn?: string;
  url?: string;
};

type Award = {
  year: string;
  title: string;
  titleEn: string;
  org: string;
  orgEn: string;
};

const exhibitions: Entry[] = [
  {
    year: '2025',
    title: '서울 일러스트페어',
    titleEn: 'Seoul Illustration Fair',
    venue: '코엑스, 서울',
    venueEn: 'COEX, Seoul',
  },
  {
    year: '2025',
    title: '아키비스트: 텅 빈 곳에도 맥박은 있다',
    titleEn: 'Archivist: Even Empty Spaces Have a Pulse',
    venue: 'KUMA gallery, 의왕',
    venueEn: 'KUMA gallery, Uiwang',
  },
  {
    year: '2025',
    title: '+49 911 9404 0 und +82 31 420 1870',
    venue: 'Akademie Galerie, Nürnberg, 독일',
    venueEn: 'Akademie Galerie, Nürnberg, Germany',
  },
  {
    year: '2025',
    title: '개미는 옆집에 누가 사는지 모른다',
    titleEn: "Ants Don’t Know Who Lives Next Door",
    venue: 'Galvani Galerie, Nürnberg, 독일',
    venueEn: 'Galvani Galerie, Nürnberg, Germany',
  },
  {
    year: '2025',
    title: 'AI Works',
    venue: 'KUMA gallery, 의왕',
    venueEn: 'KUMA gallery, Uiwang',
  },
  {
    year: '2025',
    title: 'Epilogout',
    venue: '군포문화회관, 군포',
    venueEn: 'Gunpo Culture Center, Gunpo',
  },
];

const awards: Award[] = [
  {
    year: '2024',
    title: '부산국제마케팅 광고제 CREATIVITY 부문 수상',
    titleEn: 'Busan International Marketing Advertising Festival — CREATIVITY Award',
    org: '부산 벡스코 / coss 주관',
    orgEn: 'BEXCO Busan / organized by COSS',
  },
  {
    year: '2024',
    title: '고흥 분청사기 요지 미디어 아트 작품 공모전 — 별빛모색 실감상 수상',
    titleEn: 'Goheung Buncheong Ceramic Site Media Art Competition — Starlight Award',
    org: '고흥군 분청 문화 박물관 / 고흥 군청 주관',
    orgEn: 'Goheung Buncheong Culture Museum / organized by Goheung County',
  },
];

export default function CVSection({ lang = 'ko', onSwitchToText }: { lang?: Lang; onSwitchToText?: () => void }) {
  const isEn = lang === 'en';

  return (
    <div className="px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-4xl">
      <SectionHeader title="CV" otherLabel={onSwitchToText ? 'Text' : undefined} onSwitchOther={onSwitchToText} />

      <div className="mt-14">
        <SubHead label="Exhibitions" ko={isEn ? undefined : '전시'} />
        <ul className="mt-6 space-y-4 md:space-y-5">
          {exhibitions.map((e, i) => (
            <li key={i} className="grid grid-cols-[64px_1fr] md:grid-cols-[88px_1fr] gap-4 md:gap-8">
              <span className="text-[13px] md:text-[14px] tabular-nums text-muted pt-[2px]">{e.year}</span>
              <div className="text-[14px] md:text-[16px] leading-relaxed">
                <span>{isEn && e.titleEn ? e.titleEn : e.title}</span>
                <span className="text-muted">, {isEn && e.venueEn ? e.venueEn : e.venue}</span>
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 text-[11px] tracking-wider2 uppercase text-muted hover:text-ink transition-colors"
                  >
                    Video link →
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 md:mt-20">
        <SubHead label="Awards" ko={isEn ? undefined : '수상'} />
        <ul className="mt-6 space-y-5 md:space-y-6">
          {awards.map((a, i) => (
            <li key={i} className="grid grid-cols-[64px_1fr] md:grid-cols-[88px_1fr] gap-4 md:gap-8">
              <span className="text-[13px] md:text-[14px] tabular-nums text-muted pt-[2px]">{a.year}</span>
              <div className="text-[14px] md:text-[16px] leading-relaxed">
                <div>{isEn ? a.titleEn : a.title}</div>
                <div className="text-muted mt-1 text-[13px]">{isEn ? a.orgEn : a.org}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SectionHeader({ title, otherLabel, onSwitchOther }: { title: string; otherLabel?: string; onSwitchOther?: () => void }) {
  return (
    <h2 className="text-[11px] tracking-wider3 uppercase text-muted flex items-baseline gap-3">
      <span className="text-ink">{title}</span>
      {otherLabel && onSwitchOther && (
        <>
          <span className="md:hidden text-muted/50">/</span>
          <button
            onClick={onSwitchOther}
            className="md:hidden text-muted hover:text-ink hover:[filter:blur(0.4px)] transition-all duration-500"
          >
            {otherLabel}
          </button>
        </>
      )}
    </h2>
  );
}

function SubHead({ label, ko }: { label: string; ko?: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <h3 className="text-[12px] tracking-wider2 uppercase text-ink">{label}</h3>
      {ko && <span className="text-[11px] text-muted">/ {ko}</span>}
    </div>
  );
}
