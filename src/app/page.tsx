'use client';

import { useEffect, useState } from 'react';
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
        <div className="px-8 md:px-14 lg:px-20 h-16 grid grid-cols-3 items-center">
          {/* Left: name */}
          <button onClick={() => setActive('home')} className="text-left">
            <span className="block text-[20px] md:text-[24px] tracking-wider2 uppercase font-bold leading-none text-[#3A3A3C]">
              Lee Young
            </span>
          </button>

          {/* Center: language toggle */}
          <div className="flex items-center justify-center gap-1">
            <button
              onClick={() => setLang('ko')}
              className={`text-[10px] md:text-[11px] tracking-wider2 uppercase transition-colors ${
                lang === 'ko' ? 'text-ink font-medium' : 'text-muted hover:text-ink'
              }`}
            >
              KR
            </button>
            <span className="text-muted text-[10px]">/</span>
            <button
              onClick={() => setLang('en')}
              className={`text-[10px] md:text-[11px] tracking-wider2 uppercase transition-colors ${
                lang === 'en' ? 'text-ink font-medium' : 'text-muted hover:text-ink'
              }`}
            >
              EN
            </button>
          </div>

          {/* Right: nav */}
          <nav className="flex items-center justify-end gap-6 md:gap-10">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setActive(n.key)}
                className={`text-[10px] md:text-[11px] tracking-wider2 uppercase transition-colors ${
                  active === n.key ? 'text-ink font-medium' : 'text-muted hover:text-ink'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>
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

      {/* Footer */}
      <footer className="px-8 md:px-14 lg:px-20 py-8">
        <p className="text-[10px] tracking-wider2 uppercase text-muted">
          ⓒ 2025. Leeyoung. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
