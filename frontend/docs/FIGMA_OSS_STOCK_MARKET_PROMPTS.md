# Figma Prompts For OSS Stock Market

## Usage Rule
- 먼저 `Market Dashboard`부터 만든다.
- 그다음 `Stock Detail`, `Portfolio`, `Trader Ranking`, `Season Board` 순서로 간다.
- 한 번에 전체 시장을 다 만들게 하지 말고, 프레임 단위로 나눠 요청한다.
- 첨부 추천:
  - `frontend/docs/OSS_STOCK_MARKET_INFORMATION_ARCHITECTURE.md`
  - `frontend/docs/FIGMA_BRIEF.md`
  - `frontend/docs/KOREAN_COPY_SHEET.md`
  - 현재 구현 화면 캡처 또는 베이스 프레임

## Prompt 1: Market Dashboard
```text
첨부한 문서를 기준으로 "주식형 OSS 시장" 개념의 메인 시장 화면을 설계해줘.

제품 성격:
- 한국어 우선 OSS 데이터 제품
- 실제 금융 거래 앱이 아니라, 오픈소스 프로젝트를 시장 메타포로 해석한 분석 서비스
- 지수(Index) = 시장, 종목(Stock) = 프로젝트, 포트폴리오 = 내 포지션, 트레이더 = 예측가

핵심 디자인 방향:
- dark market terminal + calm research dashboard
- 정보 밀도가 높지만 과하게 복잡하지 않게
- 과한 네온, 크립토 거래소 스타일, 실제 주식 앱 복제는 피할 것
- 기존 서비스의 다크 톤과 맞아야 함

이번 프레임 목표:
- 대상: Market / Desktop 1440
- 메인 시장 대시보드 설계

필수 포함 요소:
- Hero
- 시장 지수 카드 3~4개
- 시장 해석 바 또는 regime strip
- 종목 카드 그리드
- 시장 전체 추세 차트
- 하단 market footer

지수 제안:
- OSS Index
- CNCF Index
- Observability Index
- Infra Growth Index

종목 카드 규칙:
- 프로젝트명
- 참여 수
- 현재 점수
- 상승/보합/하락 분포 바
- 프로젝트 보기 CTA

카피 방향:
- "매수/매도"보다 "상승/보합/하락" 사용
- "주가" 대신 "점수" 또는 "기대 점수" 사용

결과는 컴포넌트화 가능한 구조로 제안해줘.
```

## Prompt 2: Stock Detail
```text
주식형 OSS 시장의 종목 상세 화면을 설계해줘.

대상:
- Stock Detail / Desktop 1440
- 실제 의미는 개별 오픈소스 프로젝트 상세 페이지

핵심 목표:
- 프로젝트 상세를 시장 문법으로 재해석
- 시장 메인과 같은 다크 톤과 컴포넌트 시스템 유지

필수 포함 요소:
- 상단 종목 히어로
- 현재 점수 / 순위 / 예측 참여 수
- 점수 구성 패널
- 상승/보합/하락 분포
- 점수와 기대치 추세 차트
- 핵심 메트릭
- 관련 종목 비교 카드

디자인 지침:
- 금융 차트 느낌은 가져오되, 오픈소스 분석 제품처럼 보여야 함
- 카드와 차트의 시각적 밀도를 유지
- 브랜드 느낌은 조용하고 신뢰감 있게

카피 지침:
- 종목 = 프로젝트
- 지수 = 시장
- 포지션 = 예측 포지션
- 매수/매도 표현은 사용하지 말 것
```

## Prompt 3: Portfolio
```text
주식형 OSS 시장의 포트폴리오 화면을 설계해줘.

대상:
- Portfolio / Desktop 1440
- 현재 서비스의 "내 포지션"을 포트폴리오 관점으로 재해석

필수 포함 요소:
- 포트폴리오 요약 카드
- 총 포인트
- 적중률
- 연속 적중
- 활성 포지션 목록
- 정산 완료 포지션 목록
- 포지션 믹스 요약

디자인 목표:
- 투자 앱처럼 보이되, 실제 금융 거래 UI처럼 과장되지 않게
- 한 사용자의 전략과 성과를 읽을 수 있어야 함
- market 메인 / 종목 상세와 같은 시스템 안에 있어야 함
```

## Prompt 4: Trader Ranking
```text
주식형 OSS 시장의 트레이더 랭킹 화면을 설계해줘.

대상:
- Trader Ranking / Desktop 1440
- 현재 "최고 예측가" 페이지를 더 시장 친화적인 구조로 재설계

필수 포함 요소:
- 페이지 히어로
- 상위 트레이더 카드 또는 테이블
- reputation
- foresight
- accuracy
- streak
- 시즌 내 퍼포먼스 요약

디자인 목표:
- 금융 플랫폼의 analyst/trader leaderboard 같은 느낌
- 그러나 과도한 경쟁 앱처럼 보이지 않게
- 냉정하고 정돈된 데이터 제품처럼 보여야 함
```

## Prompt 5: Season Board
```text
주식형 OSS 시장의 시즌 성과 보드 화면을 설계해줘.

대상:
- Season Board / Desktop 1440
- 현재 "시즌 랭킹" 화면을 시즌 퍼포먼스 리더보드로 재구성

필수 포함 요소:
- 시즌 기간
- 참여자 수
- 시즌 리더보드 테이블
- 정확도 / 수익 / 평판
- 시즌 요약 인사이트

디자인 목표:
- 시즌 단위의 성과를 장기전 대시보드처럼 보여줄 것
- 시장 메인과 동일한 컴포넌트 언어 유지
```

## Prompt 6: Foundation and Components
```text
주식형 OSS 시장 디자인을 위한 foundations와 components를 먼저 정리해줘.

필수 foundations:
- color system
- typography
- spacing
- radius
- shadows
- chart palette
- bullish / neutral / bearish semantics

필수 components:
- index card
- stock card
- score pill
- distribution bar
- trader card
- portfolio summary tile
- market footer
- chart panel
- tab pill

제약:
- 기존 다크 UI와 어울려야 함
- 실제 주식 거래 앱을 그대로 따라하지 말 것
- 오픈소스 데이터 제품이라는 정체성을 유지할 것
```

## Prompt 7: Refinement Prompt
```text
현재 제안된 주식형 OSS 시장 디자인을 더 정교하게 다듬어줘.

집중할 점:
- 정보 위계
- 지수 카드와 종목 카드의 관계
- 시장 차트와 종목 차트의 역할 구분
- 오픈소스 제품다운 정체성 유지
- 한국어 텍스트 길이에 맞는 레이아웃

피해야 할 것:
- 크립토 거래소 느낌
- 네온/과장된 실시간 거래 느낌
- 너무 게임처럼 보이는 포인트 UI
```
