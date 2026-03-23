"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import { cn } from "@/lib/utils";

type MarketLocale = "ko" | "en";
type Localized = Record<MarketLocale, string>;
type Tone = "up" | "down" | "neutral";

interface SummaryStat {
  label: Localized;
  value: Localized;
  tone?: Tone;
}

interface InsightCard {
  title: Localized;
  body: Localized;
  impact: Localized;
  tone: Tone;
  tags: string[];
}

interface ReportCard {
  kind: string;
  readTime: string;
  title: Localized;
  body: Localized;
  date: string;
}

interface EventCard {
  day: string;
  month: Localized;
  title: string;
  subtitle: Localized;
  impact: Localized;
  tone: Tone;
}

const COPY = {
  ko: {
    title: "시장 분석",
    description: "OSS 시장의 흐름과 주요 프로젝트 동향을 심층 분석합니다",
    briefingTitle: "시장 브리핑",
    briefingDate: "2026.03.22 시장 요약",
    briefingHeading: "일일 시장 브리핑",
    briefingBody:
      "전체 OSS 시장은 CNCF 프로젝트들의 강세와 함께 상승세를 유지하고 있습니다. Kubernetes 생태계 전반이 활성화되고 있으며, 특히 관측성 도구들의 성장이 두드러집니다.",
    keyPoints: "주요 요약",
    gainersTitle: "오늘의 상승 종목",
    losersTitle: "오늘의 하락 종목",
    reportsTitle: "최근 리서치 리포트",
    eventsTitle: "주요 예정 이벤트",
  },
  en: {
    title: "Market Analysis",
    description: "Deep dives into OSS market momentum and key project developments",
    briefingTitle: "Market Briefing",
    briefingDate: "2026.03.22 Market summary",
    briefingHeading: "Daily market briefing",
    briefingBody:
      "The overall OSS market remains in an uptrend led by CNCF projects. The Kubernetes ecosystem is broadly active, with especially strong momentum in observability tools.",
    keyPoints: "Key points",
    gainersTitle: "Today's gainers",
    losersTitle: "Today's decliners",
    reportsTitle: "Latest research reports",
    eventsTitle: "Upcoming events",
  },
} as const;

const SUMMARY_STATS: SummaryStat[] = [
  { label: { ko: "오늘의 분석", en: "Today's analyses" }, value: { ko: "4건", en: "4" } },
  { label: { ko: "상승 프로젝트", en: "Advancing projects" }, value: { ko: "5개", en: "5" }, tone: "up" },
  { label: { ko: "하락 프로젝트", en: "Declining projects" }, value: { ko: "3개", en: "3" }, tone: "down" },
  { label: { ko: "예정 이벤트", en: "Upcoming events" }, value: { ko: "3개", en: "3" } },
];

const KEY_POINTS: Localized[] = [
  { ko: "OSS Index는 1.5% 상승하며 1247.82를 기록", en: "OSS Index rose 1.5% to 1247.82." },
  { ko: "Observability Index가 2.07% 상승하며 시장을 선도", en: "Observability Index led the market with a 2.07% rise." },
  { ko: "Platform Ops 관련 프로젝트들의 커뮤니티 활동 증가", en: "Platform Ops projects are seeing stronger community activity." },
  { ko: "Runtime 계열 프로젝트들의 안정적인 성장세 유지", en: "Runtime projects continue to show steady growth." },
];

const INSIGHTS: InsightCard[] = [
  {
    title: { ko: "Kubernetes 생태계 전반 강세", en: "Kubernetes ecosystem strength broadens" },
    body: {
      ko: "Kubernetes를 중심으로 한 클라우드 네이티브 생태계 전반이 강세를 보이고 있습니다. 특히 Argo CD와 같은 GitOps 도구들의 채택이 급증하고 있으며, 기업 도입 사례가 늘어나고 있습니다.",
      en: "The cloud native ecosystem centered on Kubernetes is broadly strengthening. GitOps tools like Argo CD are seeing rapid adoption and more enterprise usage.",
    },
    impact: { ko: "높은 영향", en: "High impact" },
    tone: "up",
    tags: ["Kubernetes", "Argo CD"],
  },
  {
    title: { ko: "관측성 도구 수요 증가", en: "Demand for observability tools rises" },
    body: {
      ko: "마이크로서비스 아키텍처의 확산과 함께 관측성 도구의 수요가 증가하고 있습니다. Prometheus와 Grafana의 동반 도입이 이어지고 있으며, OpenTelemetry의 표준화도 탄력을 받고 있습니다.",
      en: "As microservice architectures spread, demand for observability tooling is rising. Prometheus and Grafana are increasingly deployed together while OpenTelemetry continues to standardize the stack.",
    },
    impact: { ko: "높은 영향", en: "High impact" },
    tone: "up",
    tags: ["Prometheus", "Grafana"],
  },
  {
    title: { ko: "Service Mesh 시장 재편", en: "Service mesh market reshuffle" },
    body: {
      ko: "Istio와 Linkerd, Cilium 간의 경쟁이 치열해지고 있습니다. 각 프로젝트가 차별화된 기능을 강조하고 있으며 일부 영역에서는 아직도 치열한 선택 경쟁이 이어지고 있습니다.",
      en: "Competition between Istio, Linkerd, and Cilium is intensifying. Each project is pushing differentiated capabilities while some segments remain highly contested.",
    },
    impact: { ko: "중간 영향", en: "Medium impact" },
    tone: "neutral",
    tags: ["Istio", "Cilium"],
  },
  {
    title: { ko: "Breaking Changes 예정 프로젝트 주의", en: "Watch projects with upcoming breaking changes" },
    body: {
      ko: "일부 핵심 프로젝트들이 다음 메이저 릴리스에서 Breaking Changes를 예고하고 있습니다. 단기적으로는 커뮤니티 혼선이 늘고, 마이그레이션 비용이 변동성을 키울 수 있습니다.",
      en: "Several major projects are signaling breaking changes in upcoming major releases. Short-term community friction could increase volatility.",
    },
    impact: { ko: "중간 영향", en: "Medium impact" },
    tone: "down",
    tags: ["Prometheus", "Grafana"],
  },
];

const GAINERS = [
  { rank: "#1", name: "Argo CD", category: "CI/CD", score: "79.4", change: "+4.20%", href: "/market/trading/argo-cd" },
  { rank: "#2", name: "Kubernetes", category: "Orchestration", score: "94.5", change: "+2.49%", href: "/market/trading/kubernetes" },
  { rank: "#3", name: "Prometheus", category: "Observability", score: "88.2", change: "+2.08%", href: "/market/trading/prometheus" },
  { rank: "#4", name: "Grafana", category: "Observability", score: "86.1", change: "+1.77%", href: "/market/trading/grafana" },
  { rank: "#5", name: "Envoy", category: "Networking", score: "83.9", change: "+0.96%", href: "/market/trading/envoy" },
];

const LOSERS = [
  { rank: "#1", name: "Istio", category: "Service Mesh", score: "75.3", change: "-1.57%", href: "/market/trading/istio" },
  { rank: "#2", name: "Cilium", category: "Networking", score: "82.7", change: "-0.60%", href: "/market/trading/cilium" },
  { rank: "#3", name: "containerd", category: "Container Runtime", score: "78.6", change: "-0.38%", href: "/market/trading/containerd" },
];

const REPORTS: ReportCard[] = [
  {
    kind: "Quarterly Report",
    readTime: "12분",
    title: { ko: "2026 Q1 CNCF 프로젝트 동향 보고서", en: "2026 Q1 CNCF Project Trend Report" },
    body: {
      ko: "CNCF 관련 프로젝트들의 최근 3개월 동향과 주요 이슈를 분석한 분기 보고서입니다.",
      en: "A comprehensive report on the last quarter's performance and key issues across CNCF-related projects.",
    },
    date: "2026.03.20",
  },
  {
    kind: "Technical Analysis",
    readTime: "8분",
    title: { ko: "Kubernetes 1.30 릴리스 영향 분석", en: "Kubernetes 1.30 Release Impact Analysis" },
    body: {
      ko: "Kubernetes 1.30 릴리스가 생태계에 미치는 변화를 분석하고, 주요 변경 사항과 업그레이드 전략을 제시합니다.",
      en: "Analyzes the ecosystem impact of Kubernetes 1.30 and outlines key changes plus upgrade guidance.",
    },
    date: "2026.03.18",
  },
  {
    kind: "Comparison Report",
    readTime: "15분",
    title: { ko: "관측성 스택 비교: Prometheus vs Grafana Stack", en: "Observability Stack Comparison: Prometheus vs Grafana Stack" },
    body: {
      ko: "관측성 도구들의 차이점과 최적의 조합을 제안하는 심층 비교 리포트입니다.",
      en: "An in-depth comparison of observability tooling and the best-fit stack combinations.",
    },
    date: "2026.03.15",
  },
  {
    kind: "Market Trend",
    readTime: "10분",
    title: { ko: "Service Mesh 채택 트렌드 2026", en: "Service Mesh Adoption Trends 2026" },
    body: {
      ko: "Istio, Linkerd, Cilium의 시장 점유와 기업 채택 현황을 분석한 트렌드 리포트입니다.",
      en: "A trend report analyzing market share and enterprise adoption across Istio, Linkerd, and Cilium.",
    },
    date: "2026.03.12",
  },
];

const EVENTS: EventCard[] = [
  {
    day: "15",
    month: { ko: "4월", en: "Apr" },
    title: "KubeCon EU 2026",
    subtitle: { ko: "유럽 최대 클라우드 네이티브 컨퍼런스", en: "Europe's largest cloud native conference" },
    impact: { ko: "높은 영향", en: "High impact" },
    tone: "up",
  },
  {
    day: "28",
    month: { ko: "3월", en: "Mar" },
    title: "Prometheus 3.0 RC Release",
    subtitle: { ko: "메이저 버전 릴리스 후보 공개", en: "Major version release candidate" },
    impact: { ko: "높은 영향", en: "High impact" },
    tone: "up",
  },
  {
    day: "5",
    month: { ko: "4월", en: "Apr" },
    title: "Grafana 11.0 Stable",
    subtitle: { ko: "안정 버전 릴리스 예정", en: "Stable release scheduled" },
    impact: { ko: "중간 영향", en: "Medium impact" },
    tone: "neutral",
  },
];

function SectionIcon() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[#51606f] text-[#848e9c]">
      <svg aria-hidden="true" className="h-2.5 w-2.5" fill="none" viewBox="0 0 12 12">
        <path d="M3.25 6H8.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
        <path d="M6 3.25V8.75" stroke="currentColor" strokeLinecap="round" strokeWidth="1.1" />
      </svg>
    </span>
  );
}

function TrendMark({ tone }: { tone: Tone }) {
  if (tone === "up") return <span className="text-[12px] text-[#c84a31]">▲</span>;
  if (tone === "down") return <span className="text-[12px] text-[#1261c4]">▼</span>;
  return <span className="text-[12px] text-[#848e9c]">△</span>;
}

function ImpactPill({ label, tone }: { label: string; tone: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex h-[18px] items-center rounded-[4px] px-2 text-[9px] leading-[13.5px]",
        tone === "up" && "bg-[rgba(200,74,49,0.1)] text-[#c84a31]",
        tone === "down" && "bg-[rgba(18,97,196,0.1)] text-[#1261c4]",
        tone === "neutral" && "bg-[rgba(132,142,156,0.1)] text-[#848e9c]",
      )}
    >
      {label}
    </span>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-2">
      <SectionIcon />
      <h2 className="font-figma-body text-[16px] font-semibold leading-6 text-[#d1d4dc]">{title}</h2>
    </div>
  );
}

function MovementTable({
  title,
  rows,
  tone,
}: {
  title: string;
  rows: { rank: string; name: string; category: string; score: string; change: string; href: string }[];
  tone: Tone;
}) {
  return (
    <MarketPanel className="overflow-hidden">
      <div className="border-b border-[#2b2f36] px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendMark tone={tone} />
          <h3 className="font-figma-body text-[14px] font-semibold leading-5 text-[#d1d4dc]">{title}</h3>
        </div>
      </div>

      {rows.map((row) => (
        <Link
          key={`${title}-${row.name}`}
          className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 border-b border-[#2b2f36] px-4 py-3 transition hover:bg-[rgba(255,255,255,0.02)] last:border-b-0"
          href={row.href}
        >
          <span className="font-figma-body text-[11px] leading-[14px] text-[#848e9c]">{row.rank}</span>
          <div className="min-w-0">
            <p className="truncate font-figma-body text-[13px] font-medium leading-4 text-[#d1d4dc]">{row.name}</p>
            <p className="mt-1 truncate font-figma-body text-[10px] leading-[13px] text-[#848e9c]">{row.category}</p>
          </div>
          <div className="text-right">
            <p className="font-figma-body text-[13px] leading-4 text-[#d1d4dc]">{row.score}</p>
            <p className={cn("mt-1 font-figma-body text-[10px] leading-[13px]", tone === "up" ? "text-[#c84a31]" : "text-[#1261c4]")}>
              {row.change}
            </p>
          </div>
        </Link>
      ))}
    </MarketPanel>
  );
}

export function FigmaMarketAnalysisPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];

  return (
    <div className="space-y-5 font-figma-body">
      <section className="relative left-1/2 -mx-4 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.28)] sm:-mx-6 xl:mx-0">
        <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-4 px-4 py-5 sm:px-6 xl:px-0">
          <div>
            <h1 className="text-[24px] font-bold leading-8 text-[#d1d4dc]">{text.title}</h1>
            <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">{text.description}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SUMMARY_STATS.map((item) => (
              <MarketPanel key={item.label.ko} className="px-[13px] py-[12px]">
                <p className="text-[10px] leading-[15px] text-[#848e9c]">{item.label[locale]}</p>
                <p
                  className={cn(
                    "mt-1 text-[18px] font-bold leading-7 text-[#d1d4dc]",
                    item.tone === "up" && "text-[#c84a31]",
                    item.tone === "down" && "text-[#1261c4]",
                  )}
                >
                  {item.value[locale]}
                </p>
              </MarketPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.briefingTitle} />
        <MarketPanel className="px-5 py-5">
          <p className="text-[12px] leading-4 text-[#848e9c]">{text.briefingDate}</p>
          <h2 className="mt-1 text-[18px] font-semibold leading-7 text-[#d1d4dc]">{text.briefingHeading}</h2>
          <p className="mt-4 text-[14px] leading-[22px] text-[#d1d4dc]">{text.briefingBody}</p>

          <div className="mt-4">
            <p className="text-[12px] font-semibold leading-4 text-[#848e9c]">{text.keyPoints}</p>
            <ul className="mt-2 space-y-2">
              {KEY_POINTS.map((point) => (
                <li key={point.ko} className="flex items-start gap-2 text-[12px] leading-4 text-[#848e9c]">
                  <span className="mt-[2px] text-[#3366ff]">•</span>
                  <span>{point[locale]}</span>
                </li>
              ))}
            </ul>
          </div>
        </MarketPanel>
      </section>

      <section className="space-y-3">
        <SectionHeading title={locale === "ko" ? "오늘의 인사이트" : "Today's insights"} />
        <div className="grid gap-3 xl:grid-cols-2">
          {INSIGHTS.map((card) => (
            <MarketPanel key={card.title.ko} className="border-l-[1px] border-[#38404f] px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <TrendMark tone={card.tone} />
                  <h3 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{card.title[locale]}</h3>
                </div>
                <ImpactPill label={card.impact[locale]} tone={card.tone} />
              </div>
              <p className="mt-3 text-[11px] leading-[18px] text-[#848e9c]">{card.body[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {card.tags.map((tag) => (
                  <span
                    key={`${card.title.ko}-${tag}`}
                    className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[9px] leading-[13.5px] text-[#848e9c]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </MarketPanel>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3">
          <SectionHeading title={text.gainersTitle} />
          <MovementTable rows={GAINERS} title={text.gainersTitle} tone="up" />
        </div>
        <div className="space-y-3">
          <SectionHeading title={text.losersTitle} />
          <MovementTable rows={LOSERS} title={text.losersTitle} tone="down" />
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.reportsTitle} />
        <div className="grid gap-3 xl:grid-cols-2">
          {REPORTS.map((report) => (
            <MarketPanel key={report.title.ko} className="px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(51,102,255,0.1)] px-2 text-[9px] leading-[13.5px] text-[#3366ff]">
                  {report.kind}
                </span>
                <span className="text-[9px] leading-[13.5px] text-[#848e9c]">{report.readTime}</span>
              </div>
              <h3 className="mt-3 text-[15px] font-semibold leading-[22px] text-[#d1d4dc]">{report.title[locale]}</h3>
              <p className="mt-2 text-[11px] leading-[18px] text-[#848e9c]">{report.body[locale]}</p>
              <p className="mt-5 text-[9px] leading-[13.5px] text-[#848e9c]">{report.date}</p>
            </MarketPanel>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.eventsTitle} />
        <MarketPanel className="overflow-hidden">
          {EVENTS.map((event) => (
            <div
              key={`${event.day}-${event.title}`}
              className="grid grid-cols-[56px_minmax(0,1fr)_88px] items-center gap-4 border-b border-[#2b2f36] px-4 py-4 last:border-b-0"
            >
              <div className="text-center">
                <p className="text-[24px] font-semibold leading-7 text-[#d1d4dc]">{event.day}</p>
                <p className="mt-1 text-[9px] leading-[13.5px] text-[#848e9c]">{event.month[locale]}</p>
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-[14px] font-semibold leading-5 text-[#d1d4dc]">{event.title}</h3>
                <p className="mt-1 truncate text-[11px] leading-[18px] text-[#848e9c]">{event.subtitle[locale]}</p>
              </div>
              <div className="flex justify-end">
                <ImpactPill label={event.impact[locale]} tone={event.tone} />
              </div>
            </div>
          ))}
        </MarketPanel>
      </section>
    </div>
  );
}
