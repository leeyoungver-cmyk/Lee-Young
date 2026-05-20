'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Work } from '@/types/work';
import CVSection from '@/components/CVSection';
import TextSection from '@/components/TextSection';
import WorksSection from '@/components/WorksSection';
import ContactSection from '@/components/ContactSection';
import HomeSection from '@/components/HomeSection';

type SectionKey = 'home' | 'cv' | 'text' | 'works' | 'contact';
export type Lang = 'ko' | 'en';

const NAV: { key: SectionKey; label: string }[] = [
  { key: 'text', label: 'Text' },
  { key: 'works', label: 'Works' },
  { key: 'cv', label: 'CV' },
  { key: 'contact', label: 'Contact' },
];

export default function Home() {
  const [active, setActive] = useState<SectionKey>('home');
  const [works, setWorks] = useState<Work[]>([]);
  const [lang, setLang] = useState<Lang>('ko');

  const years = useMemo(() =>
    [...new Set(works.map((w) => w.year))].sort((a, b) => b.localeCompare(a)),
    [works]
  );

  const goToYear = (year: string) => {
    setActive('works');
    setTimeout(() => {
      document.getElementById(`year-${year}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  useEffect(() => {
    fetch('/api/works')
      .then((r) => r.json())
      .then((data) => setWorks(data.works ?? []))
      .catch(() => setWorks([]));
  }, []);

  useEffect(() => {
    const hash = (typeof window !== 'undefined' && window.location.hash.slice(1)) as SectionKey;
    if (hash && NAV.some((n) => n.key === hash)) setActive(hash);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', active === 'home' ? '/' : `#${active}`);
    }
  }, [active]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur border-b border-line">

        {/* ── Mobile: 2-row ── */}
        <div className="md:hidden">
          {/* Row 1: name + lang */}
          <div className="px-5 h-12 flex items-center justify-between">
            <button onClick={() => setActive('home')} className="text-left">
              <span className="block text-[15px] tracking-[0.18em] uppercase font-medium leading-none text-[#3A3A3C]">
                Lee Young
              </span>
            </button>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLang('ko')}
                className={`relative text-[10px] tracking-wider uppercase transition-[filter] duration-500 ease-out ${
                  lang === 'ko' ? 'text-ink' : 'text-muted hover:text-ink hover:[filter:blur(0.6px)] active:text-ink active:[filter:blur(0.6px)]'
                }`}
              >KR</button>
              <span className="text-muted text-[9px]">/</span>
              <button
                onClick={() => setLang('en')}
                className={`relative text-[10px] tracking-wider uppercase transition-[filter] duration-500 ease-out ${
                  lang === 'en' ? 'text-ink' : 'text-muted hover:text-ink hover:[filter:blur(0.6px)] active:text-ink active:[filter:blur(0.6px)]'
                }`}
              >EN</button>
            </div>
          </div>
          {/* Row 2: nav */}
          <div className="px-5 h-10 flex items-center">
            <nav className="flex items-center gap-5">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  onClick={() => setActive(n.key)}
                  className={`relative text-[10px] tracking-wider uppercase transition-[filter,color] duration-500 ease-out [will-change:filter] pb-0.5 ${
                    active === n.key ? 'text-ink' : 'text-muted hover:text-ink hover:[filter:blur(0.6px)] active:text-ink active:[filter:blur(0.6px)]'
                  }`}
                >
                  {n.label}
                  <span className={`absolute bottom-0 left-0 right-0 h-px bg-ink transition-transform duration-300 origin-left ${
                    active === n.key ? 'scale-x-100' : 'scale-x-0'
                  }`} />
                </button>
              ))}
            </nav>
          </div>

          {/* Row 3: year nav — Works 활성 시만 표시 */}
          <div className={`overflow-hidden transition-[max-height,opacity] duration-500 ${
            active === 'works' && years.length > 0 ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
          }`} style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className="px-5 pb-4 pt-2 flex items-center justify-between">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => goToYear(year)}
                  className="text-[10px] tracking-wider tabular-nums text-muted hover:text-ink hover:[filter:blur(0.9px)] active:text-ink active:[filter:blur(0.9px)] transition-all duration-500"
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Desktop: single row ── */}
        <div className="hidden md:block">
          <div className="relative px-14 lg:px-20 h-16 flex items-center justify-between">
            <button onClick={() => setActive('home')} className="text-left shrink-0">
              <span className="block text-[24px] tracking-[0.2em] uppercase font-medium leading-none text-[#3A3A3C]">
                Lee Young
              </span>
            </button>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
              <button
                onClick={() => setLang('ko')}
                className={`relative text-[11px] tracking-wider2 uppercase transition-[filter] duration-500 ease-out ${
                  lang === 'ko' ? 'text-ink' : 'text-muted hover:text-ink hover:[filter:blur(0.7px)] active:text-ink active:[filter:blur(0.7px)]'
                }`}
              >KR</button>
              <span className="text-muted text-[10px]">/</span>
              <button
                onClick={() => setLang('en')}
                className={`relative text-[11px] tracking-wider2 uppercase transition-[filter] duration-500 ease-out ${
                  lang === 'en' ? 'text-ink' : 'text-muted hover:text-ink hover:[filter:blur(0.7px)] active:text-ink active:[filter:blur(0.7px)]'
                }`}
              >EN</button>
            </div>

            <nav className="flex items-center shrink-0">
              {NAV.map((n) => (
                <div key={n.key} className={`relative flex justify-center w-20 ${n.key === 'works' ? 'group/works' : ''}`}>
                  <button
                    onClick={() => setActive(n.key)}
                    className={`relative text-[11px] tracking-wider uppercase transition-[filter,color] duration-500 ease-out [will-change:filter] pb-1 ${
                      active === n.key ? 'text-ink' : 'text-muted hover:text-ink hover:[filter:blur(0.7px)] active:text-ink active:[filter:blur(0.7px)]'
                    }`}
                  >
                    {n.label}
                    <span className={`absolute bottom-0 left-0 right-0 h-px bg-ink transition-transform duration-300 origin-left ${
                      active === n.key ? 'scale-x-100' : 'scale-x-0'
                    }`} />
                  </button>
                  {n.key === 'works' && years.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-8 opacity-0 group-hover/works:opacity-100 pointer-events-none group-hover/works:pointer-events-auto transition-all duration-500 translate-y-1 group-hover/works:translate-y-0">
                      <div className="flex flex-col items-center gap-2.5">
                        {years.map((year) => (
                          <button
                            key={year}
                            onClick={() => goToYear(year)}
                            className="text-[10px] tracking-wider tabular-nums text-muted hover:text-ink hover:[filter:blur(0.9px)] active:text-ink active:[filter:blur(0.9px)] transition-all duration-500 whitespace-nowrap"
                          >{year}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

      </header>

      {/* Main content */}
      <main className="flex-1">
        <div key={active + lang} className="section-enter">
          {active === 'home' && <HomeSection />}
          {active === 'text' && <TextSection lang={lang} />}
          {active === 'works' && <WorksSection works={works} lang={lang} />}
          {active === 'cv' && <CVSection lang={lang} />}
          {active === 'contact' && <ContactSection />}
        </div>
      </main>

      <footer className="px-8 md:px-14 lg:px-20 py-10">
        <p className="text-[8px] tracking-[0.22em] uppercase text-muted/50">
          © 2026 Leeyoung. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
