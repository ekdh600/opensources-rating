# OSS Market Investing-Inspired Information Architecture

## Goal
- `OSS Market`를 단순 예측 보드가 아니라 `시장 포털형 OSS 분석 서비스`로 확장한다.
- 정보 구조는 금융 포털의 탐색성과 밀도를 차용하되, 표현과 정체성은 `오픈소스 데이터 제품`에 맞춘다.
- 핵심 원칙은 `복제`가 아니라 `패턴 차용`이다.

## Design Reference Rule
- 차용 대상:
  - 다층 내비게이션
  - 지수 중심 홈 구조
  - 종목 스크리너
  - 관심종목
  - 차트/분석/캘린더 분리
  - 정보 밀도 높은 표와 카드 혼합
- 피해야 할 것:
  - Investing.com의 레이아웃/브랜드/카피 직접 복제
  - 실제 금융 상품으로 오해되는 표현
  - 실시간 체결/자산 관리 기능을 과도하게 사실적으로 모사

## Product Positioning
- 제품 정체성:
  - 오픈소스 프로젝트를 시장 메타포로 해석한 분석 서비스
- 기본 비유:
  - `Index` = 여러 OSS 프로젝트를 묶은 시장 지수
  - `Stock` = 개별 오픈소스 프로젝트
  - `Sector` = 카테고리 또는 재단 묶음
  - `Portfolio` = 내 포지션
  - `Trader` = 예측가
  - `Order / Trade` = 게임형 포지션 액션
- 표현 원칙:
  - 실제 금융 거래와 혼동되지 않도록 `OSS`, `예측`, `점수`, `시장 해석` 맥락을 계속 유지한다.

## Top-Level Navigation
- `시장`
  - 시장 홈, 멀티 인덱스, 시장 개황, 히트맵
- `트레이딩`
  - 종목 리스트, 호가/체결 중심 상세, 주문 티켓
- `관심종목`
  - 사용자가 저장한 프로젝트
- `포트폴리오`
  - 내 포지션, 평가 손익, 정산 내역
- `랭킹`
  - 시즌 랭킹, 트레이더 랭킹
- `분석`
  - AI 리서치, 시장 해설, 프로젝트 리포트
- `캘린더`
  - 릴리스 일정, CNCF 이벤트, 메이저 브레이킹 체인지
- `스크리너`
  - 조건 검색과 정렬 기반 프로젝트 탐색
- `디자인`
  - 시장용 파운데이션과 컴포넌트 가이드

## Core Information Architecture

### 1. Market Home
- 목적:
  - 전체 OSS 시장을 한 번에 읽는 랜딩 허브
- 주요 섹션:
  - 상단 시장 요약 바
  - 핵심 인덱스 6~8개
  - 시장 개황
  - 대표 지수 차트
  - 히트맵
  - 오늘의 강세/약세 종목
  - 섹터별 리더
  - 시장 뉴스/분석 티저
- 핵심 지표:
  - `OSS Index`
  - `CNCF Index`
  - `Observability Index`
  - `Infra Growth Index`
  - `Runtime Index`
  - `Platform Ops Index`
  - `Dev Toolchain Index`
  - `Mesh & Gateway Index`

### 2. Index Hub
- 목적:
  - 각 지수의 정의와 구성 종목을 보여주는 페이지
- 주요 섹션:
  - 지수 헤더
  - 지수 설명
  - 시계열 차트
  - 구성 종목 테이블
  - 섹터 비중
  - 최근 영향 요인
- 지수 종류 제안:
  - `OSS Index`
  - `CNCF Index`
  - `Observability Index`
  - `Runtime Index`
  - `Platform Ops Index`
  - `Dev Toolchain Index`
  - `Mesh & Gateway Index`
  - `Database Infra Index`

### 3. Trading List
- 목적:
  - 시장에서 거래 가능한 모든 OSS 종목을 빠르게 훑는 화면
- 주요 섹션:
  - 검색
  - 필터 칩
  - 시황 요약
  - 고밀도 테이블
  - 즐겨찾기
  - 거래량/참여자/변동률 강조
- 기본 컬럼:
  - 종목명
  - 카테고리
  - 순위
  - 점수
  - 고점
  - 저점
  - 변동
  - 변동률
  - 상승/보합/하락 분포
  - 참여자 수

### 4. Trading Detail
- 목적:
  - 개별 프로젝트를 거래 화면처럼 해석하는 상세 페이지
- 주요 섹션:
  - 종목 헤더
  - 호가창
  - 실시간 체결
  - 메인 차트
  - 요약 메트릭
  - 주문 티켓
  - 내 포지션
  - 미체결 주문
  - 리스크 체크
  - 리서치 브리핑
- 차용 포인트:
  - 좌측 호가/체결
  - 중앙 차트
  - 우측 주문 티켓
- OSS 해석:
  - 가격 = 점수 또는 기대 점수
  - 거래량 = 예측/참여 강도

### 5. Watchlist
- 목적:
  - 사용자가 주시하는 OSS 종목을 별도로 관리
- 주요 섹션:
  - 관심종목 요약
  - 그룹별 리스트
  - 최근 변동
  - 알림 후보
- 정렬 기준:
  - 변동률
  - 참여자 수
  - 점수 순위
  - 카테고리

### 6. Screener
- 목적:
  - 조건 기반으로 새로운 종목을 찾는 화면
- 주요 필터:
  - 카테고리
  - 재단
  - 언어
  - 점수 구간
  - 변동률
  - 참여자 수
  - 상승 비중
  - 릴리스 신선도
- 결과 레이아웃:
  - 좌측 필터 패널
  - 우측 결과 테이블
  - 저장 가능한 뷰

### 7. Analysis Hub
- 목적:
  - 프로젝트 및 시장 리서치를 모아 보여주는 허브
- 주요 섹션:
  - 시장 브리핑
  - 오늘의 상승 이유
  - 오늘의 하락 이유
  - 프로젝트 리포트
  - AI 요약 카드
- 콘텐츠 유형:
  - 시장 개황
  - 프로젝트 분석
  - 섹터별 모멘텀
  - 리스크 노트

### 8. Calendar
- 목적:
  - OSS 시장에 영향을 줄 이벤트를 일정 기반으로 보여주는 화면
- 주요 이벤트:
  - 메이저 릴리스
  - CNCF/KubeCon 이벤트
  - 브레이킹 체인지 예정
  - 대형 기업 채택 발표
  - 보안 공지
- 뷰:
  - 리스트
  - 타임라인
  - 캘린더 월간 뷰

### 9. Portfolio
- 목적:
  - 포지션 관리와 성과 확인
- 주요 섹션:
  - 총 평가금액
  - 평가 손익
  - 실현 손익
  - 보유 포지션
  - 정산 내역
  - 자산 배분

## Expanded OSS Coverage
- 현재 우선 종목군:
  - Kubernetes
  - Prometheus
  - Grafana
  - Cilium
  - Istio
  - Envoy
  - containerd
  - Docker
  - etcd
  - Terraform
- 다음 확장 후보:
  - Helm
  - OpenTelemetry
  - Loki
  - Jaeger
  - Fluent Bit
  - Linkerd
  - NATS
  - Redis
  - PostgreSQL
  - OpenTofu
  - Keycloak
  - Harbor

## Index Construction Guide
- `OSS Index`
  - 전체 종목 가중 평균
- `CNCF Index`
  - CNCF 관련 종목
- `Observability Index`
  - Prometheus, Grafana, Loki, Jaeger, OpenTelemetry 등
- `Runtime Index`
  - Docker, containerd, CRI 계열
- `Platform Ops Index`
  - Kubernetes, Argo CD, Terraform, Helm 등
- `Dev Toolchain Index`
  - 개발 생산성/배포/자동화 중심 종목
- `Mesh & Gateway Index`
  - Istio, Envoy, Linkerd, Gateway 관련 종목
- `Database Infra Index`
  - etcd, Redis, PostgreSQL, Cassandra 계열

## Screen Relationship
- `Market Home`에서 지수 카드 클릭 -> `Index Hub`
- `Market Home` 또는 `Trading List`에서 종목 클릭 -> `Trading Detail`
- `Trading Detail`에서 북마크 -> `Watchlist`
- `Trading Detail`에서 관련 종목 클릭 -> 다른 상세
- `Market Home`의 뉴스/리서치 티저 -> `Analysis Hub`
- `Market Home`의 이벤트 티저 -> `Calendar`

## Component System
- `Market Header`
- `Index Card`
- `Index Hero Panel`
- `Heatmap Tile`
- `Stock Row`
- `Stock Detail Hero`
- `Order Ticket`
- `Order Book`
- `Trade Tape`
- `Open Orders Card`
- `Portfolio Summary`
- `Watchlist Row`
- `Screener Filter Group`
- `Analysis Card`
- `Calendar Event Card`

## Copy Rules
- 추천 표현:
  - `시장`
  - `지수`
  - `종목`
  - `시장 흐름`
  - `포지션`
  - `거래 시뮬레이션`
  - `리서치`
  - `예상 점수`
- 주의 표현:
  - `실제 투자`
  - `실제 수익`
  - `실제 금융 거래`
- 안전 문구:
  - `이 화면은 오픈소스 프로젝트를 시장 메타포로 해석한 시뮬레이션입니다`

## UX Principles
- 첫 화면은 항상 `시장 > 지수 > 종목` 순으로 읽히게 한다.
- 금융 포털처럼 정보는 풍부하되, 과도한 소음은 줄인다.
- 차트와 표의 비중을 높이고, 장식성 카드는 줄인다.
- 한국어 텍스트 길이를 감안해 표와 카드 폭을 충분히 확보한다.

## Figma Scope
- `Market / Home`
- `Market / Index Hub`
- `Market / Trading List`
- `Market / Trading Detail`
- `Market / Watchlist`
- `Market / Screener`
- `Market / Analysis`
- `Market / Calendar`

## Implementation Priority
1. 멀티 인덱스가 있는 `Market Home`
2. 확장된 종목 풀이 있는 `Trading List`
3. 실제 거래 화면 같은 `Trading Detail`
4. `Watchlist`
5. `Screener`
6. `Analysis`
7. `Calendar`
