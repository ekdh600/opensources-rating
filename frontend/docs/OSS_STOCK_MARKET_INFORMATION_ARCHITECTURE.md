# OSS Stock Market Information Architecture

## Goal
- `예측 시장`을 단순 투표 화면이 아니라 `주식형 OSS 시장`처럼 이해되는 구조로 재정의한다.
- 핵심 비유는 `지수(Index) = 시장`, `종목(Stock) = 프로젝트`, `포트폴리오 = 내 포지션`, `트레이더 = 예측가`이다.
- 실제 금융상품처럼 보이게 하기보다, `오픈소스 데이터 + 시장 메타포`를 결합한 분석 제품으로 설계한다.

## Naming Model
- 추천 기본 명명:
  - `OSS Index`: 전체 오픈소스 시장 지수
  - `CNCF Index`: CNCF 프로젝트 지수
  - `Infra Growth Index`: 인프라 성장 지수
  - `Observability Index`: 관측성 지수
  - `Stock`: 개별 오픈소스 프로젝트
  - `Trader`: 예측가
  - `Portfolio`: 내 포지션
- 피해야 할 방향:
  - `코스피`, `나스닥` 같은 실제 거래소 브랜드를 그대로 복제하는 표현
  - 과도하게 실거래 UI처럼 보이는 금융 앱 카피

## Core Mapping
- `시장(Index)` = 여러 OSS 프로젝트의 가중 평균 흐름
- `종목(Stock)` = 개별 OSS 프로젝트
- `섹터(Sector)` = 카테고리
  - Kubernetes
  - Observability
  - Networking/CNI
  - CI/CD
  - Database
  - AI/ML
- `현재가 / Price` = 현재 종합 점수 또는 현재 기대 점수
- `등락률 / Change` = 최근 7일 또는 30일 점수 변화율
- `거래량 / Volume` = 예측 참여 수
- `시가총액 유사 개념 / Weight` = 영향력 가중치
  - stars
  - contributors
  - commits
  - releases
  - dependency relevance
- `포지션(Position)` = 상승 / 보합 / 하락
- `포트폴리오(Portfolio)` = 사용자의 보유 포지션 묶음

## Current Route Mapping
- `frontend/src/app/[locale]/market/page.tsx`
  - 시장 메인
  - 지수 보드 + 종목 리스트 + 시장 차트
- `frontend/src/app/[locale]/projects/[slug]/page.tsx`
  - 종목 상세
  - 프로젝트 상세를 `Stock Detail` 톤으로 해석
- `frontend/src/app/[locale]/market/season/page.tsx`
  - 시즌 수익률/성과 랭킹
- `frontend/src/app/[locale]/market/top-predictors/page.tsx`
  - 트레이더 랭킹 / 애널리스트 보드
- `frontend/src/app/[locale]/market/my-positions/page.tsx`
  - 내 포트폴리오
- `frontend/src/app/[locale]/market/badges/page.tsx`
  - 업적 / 배지

## Data Mapping
- `frontend/src/lib/mock-data.ts`
- `marketProducts`
  - 종목 카드 데이터
  - `score` = 현재가 역할
  - `up / neutral / down` = 포지션 분포
  - `total` = 참여 수 / 거래량 역할
- `marketTrend`
  - 시장 또는 종목 차트 데이터
- `seasonRanking`
  - 시즌 성과 랭킹
- `topPredictors`
  - 트레이더 랭킹
- `userPredictions`
  - 포트폴리오 보유 내역

## Screen IA

### 1. Market Dashboard
- 목적:
  - 시장 전체 흐름을 먼저 보여주고, 그 아래에 종목 단위 판단으로 내려간다.
- 섹션:
  - Hero
  - Index cards
  - Market regime / threshold bar
  - Stock grid
  - Market trend chart
  - Footer
- 핵심 지표:
  - 현재 시즌
  - 남은 일수
  - 활성 예측
  - 시장 총 참여자
  - 주요 지수 변화율

### 2. Stock Detail
- 목적:
  - 프로젝트 상세를 시장 문법으로 해석한다.
- 섹션:
  - Hero with stock meta
  - Score model / factor weights
  - Bull / neutral / bear distribution
  - Score and expectation trend
  - Core metrics
  - Related stocks
- 핵심 지표:
  - total score
  - global rank
  - category rank
  - rising rank
  - predictions count

### 3. Season Ranking
- 목적:
  - 시즌 단위 성과를 `수익률 리더보드`처럼 보여준다.
- 섹션:
  - Hero
  - Ranking table
  - Season summary cards
- 해석:
  - accuracy = 적중률
  - profit = 수익
  - reputation = 신뢰도

### 4. Top Predictors
- 목적:
  - 최고의 트레이더/애널리스트를 보여준다.
- 섹션:
  - Hero
  - Trader cards or table
  - Foresight / accuracy / reputation summary

### 5. My Portfolio
- 목적:
  - `내 포지션`을 진짜 포트폴리오처럼 읽히게 한다.
- 섹션:
  - Portfolio summary
  - Active positions
  - Settled positions
  - Position mix
- 추가 가능 지표:
  - total points
  - realized gain
  - unrealized expectation
  - hit rate

### 6. Badges / Achievements
- 목적:
  - 금융 앱의 `성과 배지`처럼 보이되, 게임화 과잉은 피한다.
- 섹션:
  - Rarity groups
  - Unlock conditions
  - Featured badges

## Component System
- Global market shell
- Index card
- Stock card
- Stock score pill
- Position distribution bar
- Market threshold strip
- Stock detail factor panel
- Trader card
- Portfolio summary tile
- Achievement card
- Chart panel

## Visual Direction
- Base mood:
  - dark market terminal + calm research dashboard
- Must keep:
  - Korean-first copy
  - high information density
  - muted dark surfaces
  - controlled accent colors
- Avoid:
  - fake candlestick overload
  - neon trading app aesthetics
  - crypto exchange style gimmicks
  - pure finance mimicry

## Color Semantics
- `blue`
  - attention / market info / neutral product emphasis
- `green`
  - bullish / 상승 / positive
- `red`
  - bearish / 하락 / negative
- `amber`
  - trust / weighted expectation / caution
- `slate`
  - base rails / muted labels / neutral

## Copy Guidelines
- 제품은 `거래`보다 `예측`과 `관측` 중심이어야 한다.
- 추천 표현:
  - `지수`
  - `종목`
  - `시장 흐름`
  - `기대 점수`
  - `포지션`
  - `포트폴리오`
  - `예측가`
- 피할 표현:
  - `매수`, `매도`, `주가`, `체결`
  - 실제 금융 서비스로 오해될 수 있는 용어

## Recommended MVP
1. Market 메인에 `Index cards` 추가
2. Project detail을 `Stock detail` 톤으로 통일
3. `내 포지션`을 `Portfolio` 구조로 승격
4. `최고 예측가`를 `Trader ranking`으로 정리
5. `시즌 랭킹`을 `Season performance board`로 정리

## Figma Scope
- `05_Market`
  - `Market / Desktop 1440`
  - `Stock Detail / Desktop 1440`
  - `Portfolio / Desktop 1440`
  - `Trader Ranking / Desktop 1440`
  - `Season Board / Desktop 1440`
- 모바일은 메인 시장과 종목 상세만 우선 정의

## Implementation Notes
- 기존 데이터 스키마는 유지한다.
- 백엔드 API 변경 없이 UI/IA 해석만 바꾼다.
- Figma에서 먼저 지수 카드, 종목 카드, 포트폴리오 카드 컴포넌트를 잠근다.
- Codex 구현은 항상 `프레임 단위`로 진행한다.
