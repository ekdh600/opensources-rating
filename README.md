# OSS 리더보드 — 오픈소스 프로젝트 종합 평가 + 예측 플랫폼

오픈소스 프로젝트의 **관심도**, **실행력**, **건강도**, **신뢰도**를 종합 산출하여 리더보드로 제공하고, **시즌제 예측 게임**으로 프로젝트의 미래 가치를 커뮤니티가 함께 탐색하는 플랫폼입니다.

## 핵심 기능

### 리더보드 (데이터 기반 현재 평가)
- **글로벌 리더보드** — 종합 점수 기반 전체 순위
- **CNCF 전용 리더보드** — DevStats 기반 심화 평가
- **급상승 프로젝트** — 최근 30일 점수 상승 추이
- **프로젝트 상세** — 점수 구성, 추세, 지표, 설명
- **프로젝트 비교** — 2~3개 프로젝트 병렬 비교
- **점수 설명** — 왜 이 순위인지 한국어로 설명

### 예측 시장 (커뮤니티 기반 미래 예측)
- **90일 상승/보합/하락 예측** — 가상 포인트 기반 예측 게임
- **시즌 랭킹** — 3개월 단위 시즌제 경쟁
- **레벨 시스템** — LV.1 비기너 ~ LV.99 선구자
- **뱃지 체계** — 시즌 챔피언, 역발상 적중자, 얼리 시그널 등
- **유저 평판 점수** — 적중률 + 일관성 + 난이도 + 조기 포착
- **선구안 점수** — 대세와 반대/조기 포착 적중 평가
- **커뮤니티 기대치** — 단순 집계 + 평판 가중 기대치
- **주식형 차트 UI** — 점수·기대치 시계열 시각화

## 점수 체계

```
종합 = 관심도×0.34 + 실행력×0.38 + 건강도×0.18 + 신뢰도×0.10
```

| 축 | 가중치 | 주요 입력 |
|------|------|---------|
| 관심도 | 34% | 스타 증가율, 와처, 추세 가속도 |
| 실행력 | 38% | 커밋, PR, 이슈, 기여자, 릴리스 |
| 건강도 | 18% | 이슈 닫힘률, PR 병합률, 응답성 |
| 신뢰도 | 10% | 보안, 의존성, 라이선스, 릴리스 |

## 예측 정산 기준

```
score_change_pct = (최종점수 - 기준점수) / 기준점수 × 100
+12% 이상 → 상승 적중 | -12% 이하 → 하락 적중 | 그 외 → 보합 적중
```

## 기술 스택

### 백엔드
- FastAPI + SQLAlchemy 2.x + PostgreSQL
- Celery + Redis (배치 수집/점수 계산)
- JWT 인증 (예측 시장 참여용)
- Alembic (DB 마이그레이션)

### 프론트엔드
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Recharts
- next-intl (한국어/영문 i18n)

### 인프라
- Docker Compose (PostgreSQL, Redis, Backend, Frontend, Celery)

### 프론트 → API (비교 페이지 포함)

- 브라우저에서는 기본 **`/api/v1/...`** (같은 출처)로만 요청합니다.
- Next.js `rewrites`가 이를 FastAPI로 넘깁니다 (`next.config.ts`, Docker의 `BACKEND_INTERNAL_URL`).
- 예전처럼 `NEXT_PUBLIC_API_URL=http://localhost:8000`만 두면 비교 페이지에서 **404**가 날 수 있어, 직접 백엔드 호출은 `NEXT_PUBLIC_API_DIRECT=true`일 때만 켜 두었습니다.

## 프로젝트 구조

```
├── backend/
│   ├── app/
│   │   ├── api/v1/          # FastAPI 라우터 (리더보드 + 예측 시장)
│   │   ├── models/          # ORM 모델 (Project, Score, User, Prediction, Season, Badge)
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── repositories/    # DB 접근 레이어
│   │   ├── scoring/         # 스코어링 + 이상치 탐지
│   │   ├── explainer/       # 설명 생성기
│   │   ├── prediction/      # 정산, 레벨, 평판, 선구안, 악용 방지
│   │   ├── collectors/      # 데이터 수집기
│   │   ├── jobs/            # Celery 작업
│   │   └── core/            # 설정, DB, 인증
│   ├── alembic/             # DB 마이그레이션
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/[locale]/    # 페이지 (홈,순위,CNCF,예측시장,비교...)
│   │   ├── components/      # UI + prediction + leaderboard + project
│   │   ├── lib/             # API 클라이언트, 유틸
│   │   ├── i18n/            # 국제화 설정
│   │   ├── messages/        # ko.json, en.json
│   │   └── types/           # TypeScript 타입
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API 엔드포인트

### 리더보드 API

| 메서드 | 경로 | 설명 |
|-------|------|-----|
| GET | `/api/v1/projects` | 프로젝트 목록 |
| GET | `/api/v1/projects/{slug}` | 프로젝트 상세 |
| GET | `/api/v1/projects/{slug}/score` | 최신 점수 |
| GET | `/api/v1/projects/{slug}/trend` | 점수 추세 |
| GET | `/api/v1/leaderboards/global` | 전체 리더보드 |
| GET | `/api/v1/leaderboards/cncf` | CNCF 리더보드 |
| GET | `/api/v1/leaderboards/rising` | 급상승 리더보드 |
| GET | `/api/v1/categories` | 카테고리 목록 |
| GET | `/api/v1/compare?projects=a,b` | 프로젝트 비교 |
| GET | `/api/v1/search?q=` | 프로젝트 검색 |
| GET | `/api/v1/scoring/explain/{slug}` | 점수 설명 |

### 예측 시장 API

| 메서드 | 경로 | 설명 |
|-------|------|-----|
| POST | `/api/v1/auth/register` | 회원가입 |
| POST | `/api/v1/auth/login` | 로그인 |
| GET | `/api/v1/auth/me` | 내 프로필 |
| POST | `/api/v1/predictions` | 예측 생성 |
| GET | `/api/v1/predictions/my` | 내 예측 목록 |
| GET | `/api/v1/predictions/products` | 예측 상품 목록 |
| GET | `/api/v1/predictions/products/{slug}` | 프로젝트별 상품 |
| GET | `/api/v1/seasons` | 시즌 목록 |
| GET | `/api/v1/seasons/current` | 현재 시즌 |
| GET | `/api/v1/seasons/{id}/ranking` | 시즌 랭킹 |
| GET | `/api/v1/seasons/{id}/my-result` | 내 시즌 성적 |
| GET | `/api/v1/seasons/top-predictors` | 최고 예측가 |
| GET | `/api/v1/seasons/badges` | 뱃지 목록 |
| GET | `/api/v1/seasons/my-badges` | 내 뱃지 |

## 라이선스

MIT License
