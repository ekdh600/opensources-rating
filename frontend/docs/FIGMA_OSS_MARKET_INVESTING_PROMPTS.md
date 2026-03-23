# Figma Prompts For Investing-Inspired OSS Market

## Usage Rule
- 이 문서는 `Investing 스타일 정보구조`를 `OSS Market`에 맞게 재해석하기 위한 프롬프트 세트다.
- 실제 금융 포털을 복제하지 말고, `탐색 구조와 정보 밀도`만 차용한다.
- 한 번에 전체 제품을 그리게 하지 말고 `프레임 단위`로 나눠 요청한다.
- 첨부 추천:
  - [OSS_MARKET_INVESTING_INSPIRED_IA.md](C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\docs\OSS_MARKET_INVESTING_INSPIRED_IA.md)
  - [OSS_STOCK_MARKET_INFORMATION_ARCHITECTURE.md](C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\docs\OSS_STOCK_MARKET_INFORMATION_ARCHITECTURE.md)
  - [FIGMA_BRIEF.md](C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\docs\FIGMA_BRIEF.md)
  - [KOREAN_COPY_SHEET.md](C:\Users\NAMUTECH\Documents\Opensources_Rating\frontend\docs\KOREAN_COPY_SHEET.md)

## Master Prompt
```text
첨부한 문서를 기준으로 OSS Market의 정보구조를 금융 포털형으로 확장해줘.

중요:
- Investing.com 같은 금융 포털의 정보 구조와 UX 패턴은 참고하되, 디자인과 카피를 직접 복제하지 말 것
- 이 제품은 실제 금융 서비스가 아니라 오픈소스 프로젝트를 시장 메타포로 해석한 분석 서비스임
- 한국어 우선
- dark market terminal + calm research dashboard 톤 유지
- 정보 밀도는 높지만 과한 네온, 과도한 알림, 거래소식 과장 UI는 피할 것

이번 작업의 목표:
- 시장, 지수, 종목, 관심종목, 분석, 캘린더, 스크리너까지 연결되는 정보 구조 설계
- 컴포넌트화 가능한 형태로 정리
- Desktop 1440 기준 우선
```

## Prompt 1: Market Home
```text
OSS Market의 메인 홈 화면을 설계해줘.

참고 방향:
- 금융 포털의 "시장 홈"처럼 여러 지수와 종목 흐름을 한눈에 보여주는 정보 구조
- 하지만 오픈소스 데이터 제품다운 정체성을 유지해야 함

필수 요소:
- 상단 시장 요약 바
- 6~8개의 멀티 인덱스 카드
- 대표 지수 차트
- 히트맵
- 오늘의 강세/약세 종목
- 섹터 리더
- 하단 분석/캘린더 티저

인덱스 후보:
- OSS Index
- CNCF Index
- Observability Index
- Runtime Index
- Platform Ops Index
- Dev Toolchain Index
- Mesh & Gateway Index
- Database Infra Index

제약:
- 실제 금융 포털을 그대로 베끼지 말 것
- 카드와 테이블, 차트의 위계를 명확하게 할 것
- 한국어 텍스트 길이를 고려할 것
```

## Prompt 2: Index Hub
```text
개별 지수를 위한 Index Hub 화면을 설계해줘.

대상:
- Index Hub / Desktop 1440

필수 요소:
- 지수 타이틀과 설명
- 큰 시계열 차트
- 구성 종목 테이블
- 섹터 비중 또는 구성 비율
- 최근 상승/하락 기여 종목
- 관련 분석 티저

목표:
- 사용자가 "이 지수가 어떤 OSS 종목으로 구성되는지" 이해할 수 있어야 함
- 투자 지수 페이지처럼 읽히되, 오픈소스 분석 문맥이 분명해야 함
```

## Prompt 3: Trading List
```text
OSS 종목 전체를 탐색하는 Trading List 화면을 설계해줘.

대상:
- Trading List / Desktop 1440

필수 요소:
- 검색
- 필터 칩
- 상단 시황 요약 바
- 고밀도 종목 테이블
- 즐겨찾기 토글
- 정렬 가능한 헤더

필수 컬럼:
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

디자인 목표:
- 금융 포털의 종목 리스트처럼 빠르게 스캔 가능해야 함
- 너무 빽빽하지만 읽기 어려운 표는 피할 것
```

## Prompt 4: Trading Detail
```text
OSS 종목의 Trading Detail 화면을 설계해줘.

대상:
- Trading Detail / Desktop 1440

핵심 방향:
- 금융 앱의 거래 상세 구조를 차용하되, OSS Market에 맞게 재해석

필수 요소:
- 상단 종목 헤더
- 호가창
- 실시간 체결
- 메인 차트
- 주문 티켓
- 내 포지션
- 미체결 주문
- 리스크 체크
- 리서치 브리핑

주의:
- 실제 주식/코인 거래소 UI를 그대로 베끼지 말 것
- 오픈소스 프로젝트 분석 게임/시뮬레이션이라는 맥락이 느껴져야 함
```

## Prompt 5: Watchlist
```text
관심종목 화면을 설계해줘.

대상:
- Watchlist / Desktop 1440

필수 요소:
- 관심종목 요약
- 저장된 종목 리스트
- 최근 변동률
- 참여자 변화
- 빠른 이동 CTA

디자인 목표:
- 금융 포털의 관심목록처럼 빠르게 훑을 수 있어야 함
- 정보 밀도는 높되, 포트폴리오와는 다른 화면으로 보이게 할 것
```

## Prompt 6: Screener
```text
OSS 종목 스크리너 화면을 설계해줘.

대상:
- Screener / Desktop 1440

필수 요소:
- 좌측 필터 패널
- 우측 결과 테이블
- 저장 가능한 필터 세트
- 카테고리 / 재단 / 언어 / 점수 구간 / 변동률 / 참여자 수 필터

목표:
- 사용자가 새로운 OSS 종목을 조건 기반으로 찾을 수 있어야 함
- 복잡한 조건 검색이지만 시각적으로 명확해야 함
```

## Prompt 7: Analysis Hub
```text
OSS Market의 분석 허브를 설계해줘.

대상:
- Analysis Hub / Desktop 1440

필수 요소:
- 시장 브리핑
- 오늘의 상승 이유
- 오늘의 하락 이유
- 프로젝트 리서치 카드
- AI 분석 요약

디자인 목표:
- 금융 포털의 분석 섹션처럼 읽히되, OSS 데이터 제품 특유의 리서치 감도를 유지할 것
- 뉴스보다 분석과 해설 중심으로 보일 것
```

## Prompt 8: Calendar
```text
OSS Market의 캘린더 화면을 설계해줘.

대상:
- Calendar / Desktop 1440

필수 요소:
- 상단 날짜 범위 선택
- 이벤트 리스트 또는 캘린더 뷰
- 릴리스 일정
- CNCF 이벤트
- 브레이킹 체인지 예정
- 보안 공지

목표:
- 경제 캘린더를 차용한 OSS 이벤트 캘린더처럼 보여야 함
- 이벤트 중요도와 영향도를 한눈에 알 수 있어야 함
```

## Prompt 9: Foundations and Components
```text
Investing 스타일 정보 구조를 OSS Market에 적용하기 위한 foundations와 components를 정리해줘.

필수 foundations:
- color semantics
- typography scale
- spacing
- table density rules
- chart color system
- status colors

필수 components:
- index card
- mini index sparkline
- stock row
- heatmap tile
- order book row
- trade tape row
- watchlist row
- screener filter group
- analysis card
- calendar event card

제약:
- 기존 다크 톤 유지
- 실제 금융 포털을 직접 복제하지 말 것
- 한국어 우선 레이아웃이어야 함
```

## Prompt 10: Refinement
```text
현재 제안된 OSS Market 디자인을 더 정교하게 다듬어줘.

집중할 점:
- 금융 포털처럼 풍부하지만 과하지 않은 정보 위계
- 멀티 인덱스 카드와 종목 리스트의 균형
- 시장 홈, 트레이딩, 스크리너, 분석의 역할 구분
- 한국어 카피에 맞는 테이블 폭과 카드 높이

피해야 할 것:
- 실제 Investing.com 레이아웃 복제
- 크립토 거래소식 과장된 네온 UI
- 지나치게 게임처럼 보이는 포인트 강조
```
