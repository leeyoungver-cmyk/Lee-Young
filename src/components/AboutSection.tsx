import TextSection from './TextSection';
import CVSection from './CVSection';
import type { Lang } from '@/app/page';

export default function AboutSection({ lang = 'ko' }: { lang?: Lang }) {
  return (
    <>
      <TextSection lang={lang} />
      <div className="px-8 md:px-14 lg:px-20">
        <div className="max-w-3xl border-t border-line/60" />
      </div>
      <CVSection lang={lang} />
    </>
  );
}
