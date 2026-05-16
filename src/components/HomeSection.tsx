'use client';

export default function HomeSection() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <h1 className="text-[22px] md:text-[28px] tracking-[0.28em] uppercase font-light text-ink/80 transition-[letter-spacing,opacity] duration-[1400ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:tracking-[0.48em] hover:text-ink/60 select-none cursor-default">
        Lee Young
      </h1>
    </div>
  );
}
