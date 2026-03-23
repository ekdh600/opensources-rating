"use client";

import { useLocale } from "next-intl";

const WEIGHTS = [
  { key: "attention", labelKo: "관심도", labelEn: "Attention", weight: 34, color: "#6b9bd1" },
  { key: "execution", labelKo: "실행력", labelEn: "Execution", weight: 38, color: "#af87d7" },
  { key: "health", labelKo: "건강도", labelEn: "Health", weight: 18, color: "#87af87" },
  { key: "trust", labelKo: "신뢰도", labelEn: "Trust", weight: 10, color: "#d7af5f" },
] as const;

const DETAILS = {
  ko: [
    {
      title: "관심도",
      note: "단기 급증과 장기 성장의 균형을 읽는 축입니다.",
      chips: ["7일 스타 증가", "30일 스타 증가", "와처 수", "추세 가속도"],
    },
    {
      title: "실행력",
      note: "실제 유지보수와 릴리스 리듬을 가장 강하게 반영합니다.",
      chips: ["30일 커밋", "30일 병합 PR", "30일 해결 이슈", "30일 기여자", "90일 릴리스"],
    },
    {
      title: "건강도",
      note: "프로젝트 운영 안정성과 반응성을 읽기 위한 유지보수 품질 축입니다.",
      chips: ["이슈 닫힘률", "PR 병합률", "유지보수 응답시간", "오래된 이슈 비율"],
    },
    {
      title: "신뢰도",
      note: "공급망과 운영 신뢰 신호를 보수적으로 반영합니다.",
      chips: ["라이선스", "보안 점수", "의존성 리스크", "릴리스 위생"],
    },
  ],
  en: [
    {
      title: "Attention",
      note: "Captures the balance between short-term spikes and sustained growth.",
      chips: ["7d star growth", "30d star growth", "Watchers", "Trend acceleration"],
    },
    {
      title: "Execution",
      note: "Weights actual maintenance rhythm and release cadence most heavily.",
      chips: ["30d commits", "30d merged PRs", "30d closed issues", "30d contributors", "90d releases"],
    },
    {
      title: "Health",
      note: "Measures maintenance quality signals tied to operational stability.",
      chips: ["Issue close rate", "PR merge rate", "Maintainer response time", "Stale issue ratio"],
    },
    {
      title: "Trust",
      note: "Applies supply-chain and operational trust signals conservatively.",
      chips: ["License", "Security score", "Dependency risk", "Release hygiene"],
    },
  ],
} as const;

const COPY = {
  ko: {
    eyebrow: "SCORING MODEL",
    title: "점수 기준",
    subtitle: "랭킹과 급상승 화면에서 쓰는 네 개의 축을 같은 색상 체계로 유지한 채, 고정 가중치로 종합 점수를 계산합니다.",
    statLabels: ["ATTENTION", "EXECUTION", "HEALTH + TRUST"],
    formulaLabel: "FORMULA",
    formulaNote: "축별 정규화 점수에 고정 가중치를 곱해 최종 합산합니다.",
    distributionTitle: "가중치 분포",
    distributionSub: "가장 큰 비중은 실행력이며, 관심도와 유지보수 지표가 뒤를 받칩니다.",
    detailsTitle: "축별 해석",
    detailsSub: "각 축은 별도 신호를 읽고, 프로젝트 유형에 따라 일부 데이터 소스를 우선 적용합니다.",
    footer: {
      title: "OSS 리더보드",
      description:
        "한국어 우선 오픈소스 프로젝트 관측 플랫폼. 다양한 지표를 통해 프로젝트의 현재 상태를 읽기 쉬운 형태로 정리합니다.",
      sources: "GITHUB API · CNCF DEVSTATS · OSS INSIGHT · DEPS.DEV",
      copyright: "© 2026 OSS LEADERBOARD",
    },
  },
  en: {
    eyebrow: "SCORING MODEL",
    title: "Scoring",
    subtitle: "The same four axes used across ranking and rising views are combined with fixed weights to produce the total score.",
    statLabels: ["ATTENTION", "EXECUTION", "HEALTH + TRUST"],
    formulaLabel: "FORMULA",
    formulaNote: "Each normalized axis score is multiplied by a fixed weight and then combined.",
    distributionTitle: "Weight distribution",
    distributionSub: "Execution carries the largest share, followed by attention and maintenance signals.",
    detailsTitle: "Axis interpretation",
    detailsSub: "Each axis reads a different group of signals, and some project types prioritize specific sources.",
    footer: {
      title: "OSS LEADERBOARD",
      description:
        "A Korean-first observability platform for open source projects, organized to make each project's current state easier to read.",
      sources: "GITHUB API · CNCF DEVSTATS · OSS INSIGHT · DEPS.DEV",
      copyright: "© 2026 OSS LEADERBOARD",
    },
  },
} as const;

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <article className="oss-panel px-4 py-3">
      <p className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[1px] text-[#64748b]">{label}</p>
      <p className="font-figma-display mt-2 text-[26px] leading-[26px] tracking-[-0.64px] text-[#e2e8f0]">{value}</p>
      <p className="font-figma-mono mt-2 text-[11px] uppercase leading-4 tracking-[0.6px]" style={{ color: accent }}>
        weighted axis
      </p>
    </article>
  );
}

function DetailCard({
  title,
  note,
  chips,
}: {
  title: string;
  note: string;
  chips: readonly string[];
}) {
  return (
    <article className="oss-panel px-5 py-5">
      <h3 className="font-figma-body text-[15px] font-bold leading-[22.5px] text-[#e2e8f0]">{title}</h3>
      <p className="font-figma-body mt-2 text-[12px] leading-[19.5px] text-[#64748b]">{note}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="oss-chip font-figma-mono inline-flex h-[24px] items-center px-[10px] text-[10px] uppercase leading-[15px] tracking-[0.5px] text-[#94a3b8]"
          >
            {chip}
          </span>
        ))}
      </div>
    </article>
  );
}

export function FigmaScoringPage() {
  const locale = useLocale();
  const copy = COPY[locale === "ko" ? "ko" : "en"];
  const details = DETAILS[locale === "ko" ? "ko" : "en"];

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 oss-frame">
      <div className="mx-auto w-full max-w-[1152px] px-4 pb-0 pt-0 md:px-6 xl:px-0">
        <section className="border-b border-[#2d3548] py-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-[760px]">
              <p className="font-figma-mono text-[10px] uppercase leading-[15px] tracking-[1px] text-[#6b9bd1]">
                {copy.eyebrow}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <span className="h-px w-8 bg-[#6b9bd1]" />
                <h1 className="font-figma-display text-[32px] leading-[35.2px] tracking-[-0.64px] text-[#e2e8f0]">
                  {copy.title}
                </h1>
              </div>
              <p className="font-figma-body mt-[6px] max-w-[720px] text-[12px] leading-[19.5px] text-[#64748b]">
                {copy.subtitle}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[520px]">
              <SummaryCard accent="#6b9bd1" label={copy.statLabels[0]} value="34%" />
              <SummaryCard accent="#af87d7" label={copy.statLabels[1]} value="38%" />
              <SummaryCard accent="#87af87" label={copy.statLabels[2]} value="28%" />
            </div>
          </div>
        </section>

        <section className="grid gap-5 py-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <section className="oss-panel overflow-hidden">
            <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
              <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.distributionTitle}</h2>
              <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">{copy.distributionSub}</p>
            </div>

            <div className="space-y-6 px-5 py-5">
              {WEIGHTS.map((item) => {
                const label = locale === "ko" ? item.labelKo : item.labelEn;
                return (
                  <div key={item.key}>
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-figma-body text-[12px] leading-4 text-[#cbd5e1]">
                        {label} ({item.weight}%)
                      </span>
                      <span className="font-figma-mono text-[12px] font-bold leading-4" style={{ color: item.color }}>
                        {item.weight.toFixed(1)}
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#111622]">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: item.color,
                          width: `${(item.weight / 40) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="space-y-5">
            <section className="oss-panel overflow-hidden">
              <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
                <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.formulaLabel}</h2>
                <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">{copy.formulaNote}</p>
              </div>
              <div className="px-5 py-5">
                <div className="rounded-[4px] border border-[#2d3548] bg-[#111622] px-4 py-4 font-figma-mono text-[13px] leading-5 text-[#6b9bd1]">
                  total = 0.34 × attention + 0.38 × execution + 0.18 × health + 0.10 × trust
                </div>
              </div>
            </section>

            <section className="oss-panel overflow-hidden">
              <div className="border-b border-[#2d3548] px-5 pb-[15px] pt-[14px]">
                <h2 className="font-figma-display text-[22px] leading-[26.4px] text-[#e2e8f0]">{copy.detailsTitle}</h2>
                <p className="font-figma-body mt-1 text-[12px] leading-[19.5px] text-[#64748b]">{copy.detailsSub}</p>
              </div>

              <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
                {details.map((detail) => (
                  <DetailCard key={detail.title} chips={detail.chips} note={detail.note} title={detail.title} />
                ))}
              </div>
            </section>
          </div>
        </section>

        <section className="border-t border-[#2d3548] py-7">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[640px]">
              <p className="font-figma-display text-[24px] leading-none tracking-[-0.4px] text-[#6b9bd1]">
                {copy.footer.title}
              </p>
              <p className="font-figma-body mt-3 text-[14px] leading-6 text-[#64748b]">{copy.footer.description}</p>
            </div>
            <div className="space-y-2 md:text-right">
              <p className="font-figma-mono text-[11px] uppercase tracking-[0.6px] text-[#64748b]">{copy.footer.sources}</p>
              <p className="font-figma-mono text-[11px] uppercase tracking-[0.6px] text-[#64748b]">
                {copy.footer.copyright}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
