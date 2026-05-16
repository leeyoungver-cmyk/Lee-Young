# Lee Young — Portfolio

미니멀 포트폴리오 사이트. Next.js 14 (App Router) + TypeScript + Tailwind CSS.

## 구조

```
lee-young-portfolio/
├── data/
│   └── works.json              # 작품 데이터 (JSON 파일 기반 저장)
├── public/
│   └── uploads/                # 업로드된 이미지 저장 위치
├── src/
│   ├── app/
│   │   ├── page.tsx            # 메인 포트폴리오 (CV / Text / Works / Contact)
│   │   ├── admin/page.tsx      # /admin — 로그인 후 작품 관리
│   │   ├── api/
│   │   │   ├── auth/route.ts   # 로그인 (비밀번호 확인)
│   │   │   ├── works/route.ts  # 작품 목록 GET / 생성 POST / 순서변경 PATCH
│   │   │   ├── works/[id]/route.ts  # 단일 작품 GET / PUT / DELETE
│   │   │   └── upload/route.ts # 이미지 업로드
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── CVSection.tsx       # 전시·수상 이력
│   │   ├── TextSection.tsx     # 작가 노트 (메타-멘터리)
│   │   ├── WorksSection.tsx    # 작품 그리드 + 라이트박스
│   │   └── ContactSection.tsx
│   ├── lib/
│   │   ├── works.ts            # works.json 읽기/쓰기
│   │   └── auth.ts             # admin 헤더 검증
│   └── types/work.ts
├── .env.local.example
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── next.config.mjs
```

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.local.example .env.local
# .env.local 열어서 ADMIN_PASSWORD 를 강력한 값으로 변경

# 3. 개발 서버 실행
npm run dev
# → http://localhost:3000        포트폴리오 (공개)
# → http://localhost:3000/admin  작품 관리 (비밀번호 필요)
```

## 작품 추가 / 수정

1. `/admin` 으로 접속
2. `.env.local` 에 지정한 `ADMIN_PASSWORD` 로 로그인
3. **+ New Work** 클릭 → 제목, 연도, 매체, 설명, 이미지 추가
4. 목록에서 ▲▼ 로 작품 순서 변경, **Edit / Delete** 로 수정·삭제 가능

이미지는 `public/uploads/` 에 저장되고, 데이터는 `data/works.json` 에 누적됩니다.
두 디렉토리는 git 으로 함께 커밋되므로 배포 후에도 그대로 유지됩니다.

## 콘텐츠 수정

- **CV (전시·수상)** : `src/components/CVSection.tsx` 의 `exhibitions`, `awards` 배열 수정
- **Text (작가 노트)** : `src/components/TextSection.tsx` 의 본문 수정
- **Contact** : `src/components/ContactSection.tsx` 의 전화/이메일/SNS 수정

작품(Works)은 `/admin` 에서 관리하므로 코드 수정이 필요 없습니다.

## 디자인 시스템

`tailwind.config.ts` 에 정의되어 있습니다:

| Token       | Value      | 용도                  |
|-------------|------------|----------------------|
| `bg`        | `#F8F9F6`  | 배경                  |
| `ink`       | `#1A1A1A`  | 본문 텍스트            |
| `muted`     | `#6B6B6B`  | 보조 텍스트            |
| `line`      | `#E2E3DE`  | 구분선                |
| `subtle`    | `#EFF0EC`  | 이미지 placeholder    |

폰트: Inter (라틴) + Pretendard Variable (한글). 모두 CDN 로드.

## 배포

### Vercel (가장 간단)
1. GitHub 에 푸시
2. [vercel.com](https://vercel.com) 에서 import
3. Environment Variables 에 `ADMIN_PASSWORD` 추가
4. Deploy

**주의:** Vercel 의 서버리스 파일시스템은 ephemeral 입니다. 즉, `/admin` 에서 추가한 작품·이미지가 다음 배포 때 사라집니다. 영구 저장이 필요하면:
- 옵션 A: 로컬에서 작품 추가 → git commit → push (가장 단순)
- 옵션 B: Vercel Blob, S3, 또는 Cloudinary 같은 외부 스토리지로 전환
- 옵션 C: Railway, Render, Fly.io 같은 영구 디스크 호스팅 사용

### 자체 서버 (영구 디스크)
`data/` 와 `public/uploads/` 디렉토리에 쓰기 권한만 있으면 그대로 동작합니다.

```bash
npm run build
npm start
```

## 보안 메모

- 어드민 인증은 환경변수 비밀번호 1개에 의존하는 가벼운 방식입니다. 트래픽이 늘거나 여러 사람이 관리한다면 [NextAuth.js](https://next-auth.js.org) 등으로 교체하세요.
- 로그인 후 브라우저 `localStorage` 에 토큰이 저장됩니다 (= 비밀번호). HTTPS 환경에서만 운영하세요.
- 업로드는 image MIME 만 허용, 파일당 15MB 제한.

## 다음 단계 아이디어

- `next/image` 로 이미지 최적화 (현재는 `<img>` 로 단순화)
- 작품 detail 페이지를 독립 URL (`/works/[id]`) 로 분리 → 공유·SEO 강화
- Markdown 으로 작가 노트 관리
- 다국어 (한/영 토글)
- 비디오 임베드 (YouTube/Vimeo) 지원
