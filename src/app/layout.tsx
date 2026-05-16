import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lee Young',
  description: '이영(b.2000)은 현실이라고 부르는 장면이 어떤 조건 속에서 만들어지고 유지되는지를 의심하는 것에서 작업을 시작한다. Lee Young (b.2000) is a Seoul-based artist working with the concept of Meta-Mentary.',
  icons: {
    icon: 'data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 viewBox%3D%220 0 32 32%22%3E%3Crect width%3D%2232%22 height%3D%2232%22 fill%3D%22%23F8F9F6%22/%3E%3Ctext x%3D%2216%22 y%3D%2222%22 text-anchor%3D%22middle%22 font-family%3D%22Inter%2Csans-serif%22 font-size%3D%2218%22 fill%3D%22%231A1A1A%22%3EL%3C/text%3E%3C/svg%3E',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-bg text-ink">
        {children}
      </body>
    </html>
  );
}
