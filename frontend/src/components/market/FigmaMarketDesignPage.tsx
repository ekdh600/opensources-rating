"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { MarketPanel } from "@/components/market/MarketUi";

type MarketLocale = "ko" | "en";

const COPY = {
  ko: {
    title: "Foundation & Components",
    subtitle: "OSS Market 디자인 시스템과 컴포넌트 라이브러리",
    principles: "디자인 원칙",
    colors: "Color System",
    typography: "Typography",
    spacing: "Spacing & Layout",
    components: "Components",
    guidelines: "사용 가이드라인",
    designSystemCopy:
      "시장 메인과 포트폴리오, 랭킹, 배지 화면이 같은 토큰과 컴포넌트 규칙을 공유하도록 설계합니다.",
    sampleCardCopy: "실제 화면에 쓰이는 패널, 카드, 상태 표시를 한 곳에 모았습니다.",
    positionDistribution: "포지션 분포",
    participants: "932 참여",
    rise: "49% 상승",
    flat: "31% 보합",
    fall: "20% 하락",
  },
  en: {
    title: "Foundation & Components",
    subtitle: "OSS Market design system and component library",
    principles: "Design Principles",
    colors: "Color System",
    typography: "Typography",
    spacing: "Spacing & Layout",
    components: "Components",
    guidelines: "Usage Guidelines",
    designSystemCopy:
      "Market, portfolio, ranking, and badges share one token system so the product feels like one surface.",
    sampleCardCopy: "Reusable cards, panels, and state blocks used across the market flows.",
    positionDistribution: "Position split",
    participants: "932 participants",
    rise: "49% up",
    flat: "31% flat",
    fall: "20% down",
  },
} as const;

const LINKS = ["Colors", "Typography", "Spacing", "Components"] as const;

const PRINCIPLES = [
  ["Dark First", "업비트 스타일의 다크 테마를 기본으로, 눈의 피로를 줄이고 정보 집중도를 높입니다."],
  ["Korean Exchange", "한국 거래소 색상 체계인 상승=빨강, 하락=파랑을 채택해 더 직관적으로 보이게 합니다."],
  ["High Density", "컴팩트한 그리드와 카드 중심 구조로 한 화면에서 많은 데이터를 빠르게 파악할 수 있게 합니다."],
] as const;

const COLOR_GROUPS = {
  primary: [
    ["Primary", "#3366ff", "--color-primary", "핵심 링크와 활성 상태"],
    ["Primary Foreground", "#ffffff", "--color-primary-foreground", "프라이머리 위 텍스트"],
  ],
  semantic: [
    ["Up (Red)", "#c84a31", "--market-up", "상승, 강세, 양수"],
    ["Down (Blue)", "#1261c4", "--market-down", "하락, 약세, 음수"],
    ["Success", "#22ab94", "--color-success", "확정, 성공, 긍정 상태"],
    ["Warning", "#f0b90b", "--color-warning", "주의, 안내, 보조 경고"],
  ],
  surfaces: [
    ["Background", "#181c21", "--market-bg", "앱 전체 배경"],
    ["Panel", "#1e2026", "--market-panel", "카드와 패널 표면"],
    ["Border", "#2b2f36", "--market-border", "패널 경계선"],
    ["Muted", "#848e9c", "--market-muted", "보조 텍스트"],
  ],
  roles: [
    ["Interest", "#3366ff", "--axis-interest", "관심도와 활동량"],
    ["Execution", "#4f6fff", "--axis-execution", "실행력과 릴리스"],
    ["Health", "#a855f7", "--axis-health", "건강도와 지속성"],
    ["Trust", "#f0b90b", "--axis-trust", "신뢰도와 채택"],
  ],
} as const;

const TYPE_ROWS = {
  headings: [
    ["Market Dashboard", "24px / 32px", "700", "시장 메인 타이틀"],
    ["Top Stocks", "18px / 28px", "700", "섹션 헤더"],
    ["Category Title", "14px / 20px", "600", "카드 제목"],
    ["Section Label", "12px / 16px", "600", "보조 라벨"],
  ],
  body: [
    ["Body", "12px / 16px", "400", "기본 설명 텍스트"],
    ["Small", "10px / 15px", "400", "보조 메타 정보"],
    ["Metric", "18px / 28px", "700", "1,247.82"],
    ["Micro", "9px / 13.5px", "500", "9px 시스템 라벨"],
  ],
} as const;

const SCALE_ROWS = {
  spacing: [
    ["4", "4px", "16%"],
    ["8", "8px", "28%"],
    ["12", "12px", "40%"],
    ["16", "16px", "56%"],
    ["24", "24px", "72%"],
    ["32", "32px", "88%"],
  ],
  radius: [
    ["4", "4px", "26%"],
    ["6", "6px", "42%"],
    ["8", "8px", "58%"],
    ["10", "10px", "74%"],
  ],
} as const;

function SectionHeader({ id, title, icon }: { id: string; title: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-[10px]" id={id}>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-[4px] bg-[rgba(51,102,255,0.12)] text-[#3366ff]">
        {icon}
      </span>
      <h2 className="text-[18px] font-bold leading-7 text-[#d1d4dc]">{title}</h2>
    </div>
  );
}

function CardHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="space-y-1">
      <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{title}</h3>
      {description ? <p className="text-[10px] leading-[15px] text-[#848e9c]">{description}</p> : null}
    </div>
  );
}

function MiniIcon({ type }: { type: "palette" | "type" | "grid" | "component" }) {
  if (type === "palette") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="6" cy="6.2" fill="currentColor" r="0.9" />
        <circle cx="9.6" cy="5.2" fill="currentColor" r="0.9" />
        <circle cx="10.4" cy="8.8" fill="currentColor" r="0.9" />
      </svg>
    );
  }

  if (type === "type") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
        <path d="M4 4H12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M8 4V12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  if (type === "grid") {
    return (
      <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
        <path d="M5 3V13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M11 3V13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M3 5H13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
        <path d="M3 11H13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16">
      <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2" width="4" x="2.5" y="3" />
      <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2" width="4" x="9.5" y="3" />
      <rect height="4" rx="0.8" stroke="currentColor" strokeWidth="1.2" width="11" x="2.5" y="9" />
    </svg>
  );
}

function ColorTokenCard({
  token,
}: {
  token: readonly [string, string, string, string];
}) {
  return (
    <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-3 py-3">
      <div className="flex items-center gap-3">
        <div
          className="h-12 w-12 shrink-0 rounded-[4px] border border-[#2b2f36]"
          style={{ backgroundColor: token[1] }}
        />
        <div>
          <p className="text-[12px] font-semibold leading-4 text-[#d1d4dc]">{token[0]}</p>
          <p className="mt-1 text-[10px] leading-[15px] text-[#848e9c]">{token[1]}</p>
          <p className="mt-0.5 text-[9px] leading-[13.5px] text-[#848e9c]">{token[2]}</p>
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-[15px] text-[#848e9c]">{token[3]}</p>
    </div>
  );
}

function TypeRow({ row }: { row: readonly [string, string, string, string] }) {
  return (
    <div className="flex flex-col gap-2 rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] px-3 py-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[12px] font-semibold leading-4 text-[#d1d4dc]">{row[0]}</p>
        <p className="mt-1 text-[10px] leading-[15px] text-[#848e9c]">
          {row[1]} · {row[2]}
        </p>
      </div>
      <p className="text-right text-[12px] leading-4 text-[#d1d4dc]">{row[3]}</p>
    </div>
  );
}

function ScaleRow({ row }: { row: readonly [string, string, string] }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] leading-[15px] text-[#848e9c]">
        <span>{row[0]}</span>
        <span>{row[1]}</span>
      </div>
      <div className="h-2 rounded-[6px] bg-[rgba(43,47,54,0.42)]">
        <div className="h-2 rounded-[6px] bg-[#4f6fff]" style={{ width: row[2] }} />
      </div>
    </div>
  );
}

function ExamplePill({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return <span className={className}>{label}</span>;
}

function ExampleButton({
  label,
  className,
}: {
  label: string;
  className: string;
}) {
  return (
    <button className={className} type="button">
      {label}
    </button>
  );
}

function Sparkline({ stroke }: { stroke: string }) {
  return (
    <svg className="h-10 w-full" viewBox="0 0 280 40" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 0 27 L 40 20 L 80 23 L 120 17 L 160 14 L 200 10 L 240 14 L 280 8"
        fill="none"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function FigmaMarketDesignPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];

  return (
    <div className="space-y-8 font-figma-body text-[#d1d4dc]">
      <section className="relative left-1/2 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)]">
        <div className="mx-auto w-full max-w-[1680px] px-4 py-5 sm:px-6 2xl:px-8">
          <div className="space-y-4 px-6 py-5">
            <div>
              <h1 className="text-[24px] font-bold leading-8 text-[#d1d4dc]">{text.title}</h1>
              <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">{text.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {LINKS.map((link) => (
                <a
                  key={link}
                  className="inline-flex h-[30px] items-center rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-[13px] text-[12px] leading-4 text-[#d1d4dc] transition hover:border-[#3a4050] hover:bg-[#20242d]"
                  href={`#${link.toLowerCase()}`}
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[10px] border border-[rgba(51,102,255,0.2)] bg-[linear-gradient(174deg,rgba(51,102,255,0.10)_0%,rgba(0,0,0,0)_100%)] px-[21px] py-[21px]">
        <SectionHeader icon={<MiniIcon type="component" />} id="principles" title={text.principles} />
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {PRINCIPLES.map((principle) => (
            <div key={principle[0]} className="space-y-1">
              <p className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{principle[0]}</p>
              <p className="text-[10px] leading-[16.25px] text-[#848e9c]">{principle[1]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4" id="colors">
        <SectionHeader icon={<MiniIcon type="palette" />} id="colors-title" title={text.colors} />
        <MarketPanel className="space-y-6 p-[17px]">
          <div className="space-y-3">
            <CardHeader description={text.designSystemCopy} title="Primary Colors" />
            <div className="grid gap-3 md:grid-cols-2">
              {COLOR_GROUPS.primary.map((token) => (
                <ColorTokenCard key={token[0]} token={token} />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <CardHeader title="Semantic Colors" />
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {COLOR_GROUPS.semantic.map((token) => (
                <ColorTokenCard key={token[0]} token={token} />
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <CardHeader title="Neutral & Surface" />
              <div className="grid gap-3 md:grid-cols-2">
                {COLOR_GROUPS.surfaces.map((token) => (
                  <ColorTokenCard key={token[0]} token={token} />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <CardHeader title="Role / Score Colors" />
              <div className="grid gap-3 md:grid-cols-2">
                {COLOR_GROUPS.roles.map((token) => (
                  <ColorTokenCard key={token[0]} token={token} />
                ))}
              </div>
            </div>
          </div>
        </MarketPanel>
      </section>

      <section className="space-y-4" id="typography">
        <SectionHeader icon={<MiniIcon type="type" />} id="typography-title" title={text.typography} />
        <div className="grid gap-4 xl:grid-cols-2">
          <MarketPanel className="space-y-3 p-[17px]">
            <CardHeader title="Headings" />
            {TYPE_ROWS.headings.map((row) => (
              <TypeRow key={row[0]} row={row} />
            ))}
          </MarketPanel>
          <MarketPanel className="space-y-3 p-[17px]">
            <CardHeader title="Body Text" />
            {TYPE_ROWS.body.map((row) => (
              <TypeRow key={row[0]} row={row} />
            ))}
          </MarketPanel>
        </div>
      </section>

      <section className="space-y-4" id="spacing">
        <SectionHeader icon={<MiniIcon type="grid" />} id="spacing-title" title={text.spacing} />
        <div className="grid gap-4 xl:grid-cols-2">
          <MarketPanel className="space-y-4 p-[17px]">
            <CardHeader title="Spacing Scale" />
            {SCALE_ROWS.spacing.map((row) => (
              <ScaleRow key={row[0]} row={row} />
            ))}
          </MarketPanel>
          <MarketPanel className="space-y-4 p-[17px]">
            <CardHeader title="Border Radius" />
            {SCALE_ROWS.radius.map((row) => (
              <ScaleRow key={row[0]} row={row} />
            ))}
          </MarketPanel>
        </div>
      </section>

      <section className="space-y-4" id="components">
        <SectionHeader icon={<MiniIcon type="component" />} id="components-title" title={text.components} />
        <MarketPanel className="space-y-6 p-[17px]">
          <div className="space-y-3">
            <CardHeader title="Buttons" />
            <div className="flex flex-wrap items-center gap-2">
              <ExampleButton className="inline-flex h-[28px] items-center rounded-[4px] bg-[#3366ff] px-3 text-[10px] font-medium leading-[15px] text-white" label="Primary Action" />
              <ExampleButton className="inline-flex h-[28px] items-center rounded-[4px] border border-[#2b2f36] bg-[rgba(43,47,54,0.42)] px-3 text-[10px] font-medium leading-[15px] text-[#d1d4dc]" label="Secondary Button" />
              <ExampleButton className="inline-flex h-[28px] items-center rounded-[4px] px-3 text-[10px] font-medium leading-[15px] text-[#848e9c]" label="Ghost Button" />
              <ExampleButton className="inline-flex h-[28px] items-center rounded-[4px] bg-[#c84a31] px-3 text-[10px] font-medium leading-[15px] text-white" label="Delete" />
              <ExampleButton className="inline-flex h-[24px] items-center rounded-[4px] bg-[#1f6feb] px-3 text-[9px] font-medium leading-[13.5px] text-white" label="Small Primary" />
            </div>
          </div>

          <div className="space-y-3">
            <CardHeader title="Badges" />
            <div className="flex flex-wrap items-center gap-2">
              <ExamplePill className="rounded-[4px] bg-[rgba(51,102,255,0.1)] px-2.5 py-1 text-[10px] leading-[15px] text-[#3366ff]" label="Analyst" />
              <ExamplePill className="rounded-[4px] bg-[rgba(34,171,148,0.12)] px-2.5 py-1 text-[10px] leading-[15px] text-[#22ab94]" label="Market" />
              <ExamplePill className="rounded-[4px] bg-[rgba(168,85,247,0.12)] px-2.5 py-1 text-[10px] leading-[15px] text-[#a855f7]" label="Health" />
              <ExamplePill className="rounded-[4px] bg-[rgba(240,185,11,0.12)] px-2.5 py-1 text-[10px] leading-[15px] text-[#f0b90b]" label="Warning" />
              <ExamplePill className="rounded-[4px] bg-[rgba(132,142,156,0.12)] px-2.5 py-1 text-[10px] leading-[15px] text-[#848e9c]" label="Neutral" />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
              <p className="text-[10px] leading-[15px] text-[#848e9c]">설계 의도</p>
              <p className="mt-2 text-[18px] font-bold leading-7 text-[#d1d4dc]">시장 지수 카드</p>
              <p className="mt-1 text-[10px] leading-[15px] text-[#848e9c]">{text.sampleCardCopy}</p>
            </div>
            <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
              <p className="text-[10px] leading-[15px] text-[#848e9c]">Overall open source market index</p>
              <p className="mt-1 text-[14px] font-semibold leading-5 text-[#d1d4dc]">OSS Index</p>
              <p className="mt-2 text-[18px] font-bold leading-7 text-[#d1d4dc]">1,247.82</p>
              <p className="text-[10px] leading-[15px] text-[#c84a31]">+18.42 (+1.50%)</p>
              <div className="mt-3">
                <Sparkline stroke="#c84a31" />
              </div>
            </div>
            <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
              <div className="flex items-center gap-[6px]">
                <p className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">Cilium</p>
                <span className="rounded-[4px] bg-[rgba(43,47,54,0.5)] px-1.5 py-0.5 text-[10px] leading-[15px] text-[#848e9c]">#5</span>
              </div>
              <p className="mt-0.5 text-[10px] leading-[15px] text-[#848e9c]">Networking</p>
              <div className="mt-3">
                <Sparkline stroke="#1261c4" />
              </div>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-[18px] font-bold leading-7 text-[#d1d4dc]">82.7</span>
                <span className="mb-[3px] text-[10px] leading-[15px] text-[#1261c4]">▼ 0.5 (-0.60%)</span>
              </div>
              <div className="mt-2.5">
                <div className="flex items-center justify-between text-[10px] leading-[15px] text-[#848e9c]">
                  <span>{text.positionDistribution}</span>
                  <span>{text.participants}</span>
                </div>
                <div className="mt-2 flex h-[4px] overflow-hidden rounded-[6px] bg-[rgba(43,47,54,0.3)]">
                  <div className="w-[49%] bg-[#c84a31]" />
                  <div className="w-[31%] bg-[#848e9c]" />
                  <div className="w-[20%] bg-[#1261c4]" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="space-y-3">
              <CardHeader title="Alerts" />
              <div className="space-y-2 rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3 text-[10px] leading-[15px]">
                <div className="rounded-[4px] border border-[rgba(34,171,148,0.2)] bg-[rgba(34,171,148,0.1)] px-3 py-2 text-[#22ab94]">Success: 시장 지수 업데이트가 완료되었습니다.</div>
                <div className="rounded-[4px] border border-[rgba(240,185,11,0.2)] bg-[rgba(240,185,11,0.1)] px-3 py-2 text-[#f0b90b]">Warning: 예측 데이터가 일부 지연될 수 있습니다.</div>
                <div className="rounded-[4px] border border-[rgba(200,74,49,0.2)] bg-[rgba(200,74,49,0.1)] px-3 py-2 text-[#c84a31]">Alert: 급격한 변동성이 감지되었습니다.</div>
              </div>
            </div>
            <div className="space-y-3">
              <CardHeader title="Distribution Bar" />
              <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] p-3">
                <div className="flex items-center justify-between text-[10px] leading-[15px] text-[#848e9c]">
                  <span>{text.positionDistribution}</span>
                  <span>{text.participants}</span>
                </div>
                <div className="mt-2 flex h-[4px] overflow-hidden rounded-[6px] bg-[rgba(43,47,54,0.3)]">
                  <div className="w-[49%] bg-[#c84a31]" />
                  <div className="w-[31%] bg-[#848e9c]" />
                  <div className="w-[20%] bg-[#1261c4]" />
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] font-medium leading-[13.5px]">
                  <span className="text-[#c84a31]">{text.rise}</span>
                  <span className="text-[#848e9c]">{text.flat}</span>
                  <span className="text-[#1261c4]">{text.fall}</span>
                </div>
              </div>
            </div>
          </div>
        </MarketPanel>
      </section>

      <section className="space-y-4">
        <SectionHeader icon={<MiniIcon type="component" />} id="guidelines" title={text.guidelines} />
        <MarketPanel className="grid gap-4 p-[21px] md:grid-cols-2">
          <div className="space-y-2">
            <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">색상 사용</h3>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 상승은 항상 빨강(#c84a31), 하락은 파랑(#1261c4)을 사용</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• Primary 색상은 중요한 액션과 링크에만 사용</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 배경은 #181c21, 카드는 #1e2026으로 계층 구분</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 텍스트는 가독성을 위해 충분한 대비를 유지</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">타이포그래피</h3>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 제목은 bold, 본문은 normal weight 사용</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 중요한 숫자는 semibold 또는 bold로 강조</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 최소 폰트 크기는 9px, 가독성 우선</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 행간은 충분히 확보하여 답답하지 않게</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">레이아웃</h3>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 정보 밀도가 높되 여백을 통해 호흡감 유지</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 그리드 시스템으로 일관성 있는 배치</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 카드 단위로 정보를 그룹화</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 모바일에서도 가독성 유지</p>
          </div>
          <div className="space-y-2">
            <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">인터랙션</h3>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 호버 시 미묘한 색상 변화로 피드백</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 클릭 가능한 요소는 명확히 구분</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 트랜지션은 빠르게(150-300ms)</p>
            <p className="text-[10px] leading-[15px] text-[#848e9c]">• 로딩 상태는 명확히 표시</p>
          </div>
        </MarketPanel>
      </section>
    </div>
  );
}
