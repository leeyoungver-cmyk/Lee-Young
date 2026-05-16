'use client';

export default function HomeSection() {
  return (
    <div
      className="w-full flex items-center justify-center"
      style={{ height: 'calc(100vh - 64px)' }}
    >
      <h1 className="text-[32px] md:text-[44px] tracking-[0.22em] uppercase font-extralight text-ink/75 transition-[letter-spacing,opacity] duration-[1600ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:tracking-[0.42em] hover:text-ink/45 select-none cursor-default">
        Lee Young
      </h1>
    </div>
  );
}
