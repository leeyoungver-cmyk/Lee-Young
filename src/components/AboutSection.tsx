import TextSection from './TextSection';
import CVSection from './CVSection';
import type { Lang } from '@/app/page';

export type AboutTab = 'text' | 'cv';

export default function AboutSection({ lang = 'ko', tab = 'text' }: { lang?: Lang; tab?: AboutTab }) {
  return tab === 'text' ? <TextSection lang={lang} /> : <CVSection lang={lang} />;
}
