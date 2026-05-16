export default function ContactSection() {
  return (
    <div className="px-8 md:px-14 lg:px-20 py-16 md:py-24 max-w-3xl">
      <SectionHeader title="Contact" />

      <dl className="mt-14 space-y-6 md:space-y-8">
        <Row label="E-mail">
          <a href="mailto:leeyoung.ver@gmail.com" className="hover:opacity-60 transition-opacity">
            leeyoung.ver@gmail.com
          </a>
        </Row>
        <Row label="Instagram">
          <a
            href="https://instagram.com/nomadizero"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-60 transition-opacity"
          >
            @nomadizero
          </a>
        </Row>
      </dl>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-[11px] tracking-wider3 uppercase text-muted">{title}</h2>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] md:grid-cols-[120px_1fr] gap-4">
      <dt className="text-[11px] tracking-wider2 uppercase text-muted pt-[2px]">{label}</dt>
      <dd className="text-[15px] md:text-[17px]">{children}</dd>
    </div>
  );
}
