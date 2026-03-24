"use client";

import { useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import { cn } from "@/lib/utils";

type MarketLocale = "ko" | "en";
type Localized = Record<MarketLocale, string>;
type Tone = "up" | "down" | "neutral";

type Row = { rank: string; name: string; category: string; score: string; change: string; href: string };

type Report = {
  id: string;
  kind: string;
  readTime: string;
  title: Localized;
  body: Localized;
  date: string;
  analyst: string;
  tone: Tone;
  focus: string[];
  thesis: Localized;
  highlights: Localized[];
  risks: Localized[];
  actions: Array<{ label: Localized; href: string }>;
};

type Event = {
  id: string;
  day: string;
  month: Localized;
  title: string;
  subtitle: Localized;
  impact: Localized;
  tone: Tone;
  dateLabel: Localized;
  countdown: Localized;
  status: Localized;
  description: Localized;
  watch: Localized[];
  affected: string[];
  actions: Array<{ label: Localized; href: string }>;
};

const COPY = {
  ko: {
    title: "시장 분석",
    description: "OSS 시장 흐름, 핵심 종목 모멘텀, 리서치 리포트와 예정 이벤트를 한 화면에서 추적합니다.",
    briefingTitle: "시장 브리핑",
    briefingDate: "2026.03.24 시장 요약",
    briefingHeading: "일일 시장 브리핑",
    briefingBody: "전체 OSS 시장은 상승 흐름을 유지하고 있습니다. 관측성, AI 인프라, 플랫폼 운영 종목이 상대 강세를 보이며, 메이저 릴리스와 컨퍼런스 일정을 앞둔 종목 중심으로 거래 참여가 늘고 있습니다.",
    keyPoints: "주요 요약",
    insightsTitle: "오늘의 인사이트",
    gainersTitle: "오늘의 상승 종목",
    losersTitle: "오늘의 하락 종목",
    reportsTitle: "최근 리서치 리포트",
    reportsDesc: "리포트를 선택하면 핵심 논지, 영향 종목, 리스크, 액션 포인트를 확인할 수 있습니다.",
    eventsTitle: "주요 예정 이벤트",
    eventsDesc: "이벤트를 선택하면 날짜, 영향 종목, 관찰 포인트, 바로가기를 확인할 수 있습니다.",
    analyst: "담당 분석",
    focus: "주요 커버리지",
    thesis: "핵심 논지",
    highlights: "핵심 포인트",
    risks: "리스크 요인",
    affected: "영향 종목",
    watch: "관찰 포인트",
    actions: "바로가기",
  },
  en: {
    title: "Market Analysis",
    description: "Track OSS market flow, stock momentum, research reports, and upcoming catalysts in one view.",
    briefingTitle: "Market Briefing",
    briefingDate: "2026.03.24 Market summary",
    briefingHeading: "Daily market briefing",
    briefingBody: "The OSS market remains constructive. Observability, AI infra, and platform operations continue to lead, while major releases and conferences are driving higher participation around key names.",
    keyPoints: "Key points",
    insightsTitle: "Today's insights",
    gainersTitle: "Today's gainers",
    losersTitle: "Today's decliners",
    reportsTitle: "Latest research reports",
    reportsDesc: "Select a report to view thesis, impacted names, risks, and actions.",
    eventsTitle: "Upcoming events",
    eventsDesc: "Select an event to review date, impacted names, watch items, and direct links.",
    analyst: "Analyst",
    focus: "Coverage",
    thesis: "Core thesis",
    highlights: "Highlights",
    risks: "Risks",
    affected: "Impacted names",
    watch: "Watch items",
    actions: "Quick actions",
  },
} as const;

const SUMMARY = [
  { label: { ko: "오늘의 분석", en: "Today's analyses" }, value: { ko: "4건", en: "4" }, tone: "neutral" as Tone },
  { label: { ko: "상승 종목", en: "Advancing names" }, value: { ko: "5개", en: "5" }, tone: "up" as Tone },
  { label: { ko: "하락 종목", en: "Declining names" }, value: { ko: "3개", en: "3" }, tone: "down" as Tone },
  { label: { ko: "예정 이벤트", en: "Upcoming events" }, value: { ko: "4개", en: "4" }, tone: "neutral" as Tone },
];

const POINTS: Localized[] = [
  { ko: "OSS Index가 강세를 유지하며 시장 리더 역할을 지속하고 있습니다.", en: "OSS Index remains firm and continues to lead the market." },
  { ko: "Prometheus, Grafana, OpenTelemetry가 관측성 섹터 강세를 이끌고 있습니다.", en: "Prometheus, Grafana, and OpenTelemetry are leading the observability complex." },
  { ko: "KubeCon EU와 Prometheus 3.0 RC 일정이 단기 모멘텀의 핵심 변수입니다.", en: "KubeCon EU and the Prometheus 3.0 RC are the key near-term catalysts." },
];

const INSIGHTS = [
  { title: { ko: "관측성 섹터 강세", en: "Observability stays strong" }, body: { ko: "Prometheus, Grafana, OpenTelemetry가 동반 강세를 보이며 시장 내 초과수익을 만들고 있습니다.", en: "Prometheus, Grafana, and OpenTelemetry are generating excess returns together." }, tone: "up" as Tone, tags: ["Prometheus", "Grafana", "OpenTelemetry"] },
  { title: { ko: "서비스 메시 선별 매매 구간", en: "Service mesh requires selectivity" }, body: { ko: "Istio, Cilium, Envoy는 같은 섹터지만 이벤트와 채택 속도 차이로 수익률 격차가 벌어지고 있습니다.", en: "Istio, Cilium, and Envoy are diverging as catalysts and adoption velocity differ." }, tone: "neutral" as Tone, tags: ["Istio", "Cilium", "Envoy"] },
  { title: { ko: "AI 인프라 과열 경계", en: "AI infra remains crowded" }, body: { ko: "vLLM, KServe, Langfuse, Open WebUI는 강세지만 이벤트 전후 조정폭도 커질 수 있습니다.", en: "vLLM, KServe, Langfuse, and Open WebUI remain strong but could see sharper event-driven pullbacks." }, tone: "up" as Tone, tags: ["vLLM", "KServe", "Langfuse"] },
  { title: { ko: "플랫폼 운영 종목 완만한 우상향", en: "Platform ops grinds higher" }, body: { ko: "Kubernetes, Argo CD, Terraform은 참여자 수가 늘며 안정적인 강세 구조를 만들고 있습니다.", en: "Kubernetes, Argo CD, and Terraform are building a steadier bullish structure on rising participation." }, tone: "up" as Tone, tags: ["Kubernetes", "Argo CD", "Terraform"] },
];

const GAINERS: Row[] = [
  { rank: "#1", name: "Argo CD", category: "CI/CD", score: "79.4", change: "+4.20%", href: "/market/trading/argo-cd" },
  { rank: "#2", name: "Kubernetes", category: "Orchestration", score: "94.5", change: "+2.49%", href: "/market/trading/kubernetes" },
  { rank: "#3", name: "Prometheus", category: "Observability", score: "88.2", change: "+2.08%", href: "/market/trading/prometheus" },
  { rank: "#4", name: "Grafana", category: "Observability", score: "86.1", change: "+1.77%", href: "/market/trading/grafana" },
  { rank: "#5", name: "OpenTelemetry", category: "Telemetry", score: "84.8", change: "+1.92%", href: "/market/trading/opentelemetry" },
];

const LOSERS: Row[] = [
  { rank: "#1", name: "Istio", category: "Service Mesh", score: "75.3", change: "-1.57%", href: "/market/trading/istio" },
  { rank: "#2", name: "Cilium", category: "Networking", score: "82.7", change: "-0.60%", href: "/market/trading/cilium" },
  { rank: "#3", name: "containerd", category: "Container Runtime", score: "78.6", change: "-0.38%", href: "/market/trading/containerd" },
];

const REPORTS: Report[] = [
  {
    id: "cncf",
    kind: "Quarterly Report",
    readTime: "12분",
    title: { ko: "2026 Q1 CNCF 프로젝트 흐름 보고서", en: "2026 Q1 CNCF Flow Report" },
    body: { ko: "CNCF 핵심 종목의 점수 흐름과 참여자 포지션, 릴리스 일정을 종합한 분기 리포트입니다.", en: "Quarterly readout on CNCF leaders across score trends, participant positioning, and release schedules." },
    date: "2026.03.20",
    analyst: "Codex Research Desk",
    tone: "up",
    focus: ["Kubernetes", "Argo CD", "Prometheus", "Envoy"],
    thesis: { ko: "CNCF 핵심 종목은 여전히 시장 리더십을 유지하고 있으며, KubeCon 전후 추가 유입 가능성이 높습니다.", en: "Core CNCF names still lead the market and may attract fresh inflows around KubeCon." },
    highlights: [{ ko: "Kubernetes 생태계 종목이 지수 상승의 절반 이상을 설명합니다.", en: "Kubernetes-linked names explain more than half of the index move." }, { ko: "Argo CD는 단기 모멘텀이 가장 강합니다.", en: "Argo CD has the strongest near-term momentum." }],
    risks: [{ ko: "메이저 릴리스 지연 시 단기 기대치가 후퇴할 수 있습니다.", en: "Any major release delay could unwind short-term expectations." }, { ko: "서비스 메시 계열은 변동성이 더 큽니다.", en: "Service mesh names remain more volatile." }],
    actions: [{ label: { ko: "Kubernetes 보기", en: "Open Kubernetes" }, href: "/market/trading/kubernetes" }, { label: { ko: "Argo CD 보기", en: "Open Argo CD" }, href: "/market/trading/argo-cd" }],
  },
  {
    id: "k8s",
    kind: "Technical Analysis",
    readTime: "8분",
    title: { ko: "Kubernetes 1.30 릴리스 영향 분석", en: "Kubernetes 1.30 Release Impact" },
    body: { ko: "Kubernetes 1.30이 플랫폼 운영, 관측성, 네트워킹 종목에 미칠 영향을 정리했습니다.", en: "Impact analysis for how Kubernetes 1.30 may affect platform ops, observability, and networking names." },
    date: "2026.03.18",
    analyst: "Platform Ops Lab",
    tone: "neutral",
    focus: ["Kubernetes", "Cilium", "Helm", "OpenTelemetry"],
    thesis: { ko: "릴리스는 중장기 호재지만 업그레이드 비용과 호환성 이슈가 단기 심리를 흔들 수 있습니다.", en: "The release is structurally positive, but upgrade cost and compatibility issues may affect short-term sentiment." },
    highlights: [{ ko: "플랫폼 운영 섹터의 신뢰도 점수 상승이 예상됩니다.", en: "Trust scores should improve across platform ops." }, { ko: "관측성/네트워킹은 종목별 차별화가 나타날 수 있습니다.", en: "Observability and networking may diverge name by name." }],
    risks: [{ ko: "초기 RC 해석이 과열되면 과매수 위험이 있습니다.", en: "Overreading early RC signals can create overbought setups." }, { ko: "호환성 이슈가 변동률을 키울 수 있습니다.", en: "Compatibility issues may widen daily moves." }],
    actions: [{ label: { ko: "Kubernetes 트레이딩", en: "Trade Kubernetes" }, href: "/market/trading/kubernetes" }, { label: { ko: "Cilium 보기", en: "Open Cilium" }, href: "/market/trading/cilium" }],
  },
  {
    id: "obs",
    kind: "Comparison Report",
    readTime: "15분",
    title: { ko: "관측성 스택 비교: Prometheus vs Grafana", en: "Observability Stack: Prometheus vs Grafana" },
    body: { ko: "관측성 섹터의 점수 구조와 채택 흐름을 비교한 리포트입니다.", en: "Compares score structure and adoption flow across the observability sector." },
    date: "2026.03.15",
    analyst: "Observability Desk",
    tone: "up",
    focus: ["Prometheus", "Grafana", "OpenTelemetry", "Loki"],
    thesis: { ko: "Prometheus와 Grafana는 경쟁보다 보완 관계가 강해 동반 강세 가능성이 높습니다.", en: "Prometheus and Grafana look more complementary than competitive, supporting paired strength." },
    highlights: [{ ko: "Prometheus는 실행력, Grafana는 도입도가 강합니다.", en: "Prometheus leads execution while Grafana leads adoption." }, { ko: "OpenTelemetry는 표준화 수혜 가능성이 큽니다.", en: "OpenTelemetry may benefit from standardization tailwinds." }],
    risks: [{ ko: "대형 릴리스 전후 기대가 앞서갈 수 있습니다.", en: "Expectations can run ahead of releases." }, { ko: "통합 스토리가 약해지면 강세가 일부 종목에 집중될 수 있습니다.", en: "Strength may narrow if the integration story weakens." }],
    actions: [{ label: { ko: "Prometheus 보기", en: "Open Prometheus" }, href: "/market/trading/prometheus" }, { label: { ko: "Grafana 보기", en: "Open Grafana" }, href: "/market/trading/grafana" }],
  },
];

const EVENTS: Event[] = [
  {
    id: "kubecon",
    day: "15",
    month: { ko: "4월", en: "Apr" },
    title: "KubeCon EU 2026",
    subtitle: { ko: "유럽 최대 클라우드 네이티브 컨퍼런스", en: "Europe's largest cloud native conference" },
    impact: { ko: "높은 영향", en: "High impact" },
    tone: "up",
    dateLabel: { ko: "2026.04.15 ~ 2026.04.18", en: "2026.04.15 ~ 2026.04.18" },
    countdown: { ko: "D-22", en: "D-22" },
    status: { ko: "사전 기대 유입 구간", en: "Pre-event accumulation window" },
    description: { ko: "Kubernetes, Prometheus, Argo CD 중심으로 기대치 재평가가 나타날 수 있는 가장 큰 이벤트입니다.", en: "This is the strongest catalyst for repricing expectations across Kubernetes, Prometheus, and Argo CD." },
    watch: [{ ko: "로드맵 발표", en: "Roadmap announcements" }, { ko: "신규 채택 사례 공개 여부", en: "Whether new adoption stories are announced" }, { ko: "키노트 직후 참여자 수 급증 여부", en: "Participation spike after keynotes" }],
    affected: ["Kubernetes", "Argo CD", "Prometheus", "OpenTelemetry"],
    actions: [{ label: { ko: "Kubernetes 보기", en: "Open Kubernetes" }, href: "/market/trading/kubernetes" }, { label: { ko: "Prometheus 보기", en: "Open Prometheus" }, href: "/market/trading/prometheus" }],
  },
  {
    id: "prom-rc",
    day: "28",
    month: { ko: "3월", en: "Mar" },
    title: "Prometheus 3.0 RC Release",
    subtitle: { ko: "메이저 버전 릴리스 후보 공개", en: "Major version release candidate" },
    impact: { ko: "높은 영향", en: "High impact" },
    tone: "up",
    dateLabel: { ko: "2026.03.28", en: "2026.03.28" },
    countdown: { ko: "D-4", en: "D-4" },
    status: { ko: "기대 모멘텀 강화", en: "Momentum building" },
    description: { ko: "Prometheus 3.0 RC는 관측성 섹터 전반의 기대치를 흔드는 핵심 일정입니다.", en: "Prometheus 3.0 RC is the key near-term event for the observability complex." },
    watch: [{ ko: "RC 직후 이슈/PR 흐름", en: "Issue/PR flow right after the RC" }, { ko: "마이그레이션 가이드 공개 여부", en: "Migration guide availability" }, { ko: "Grafana 동반 강세 여부", en: "Whether Grafana confirms the move" }],
    affected: ["Prometheus", "Grafana", "OpenTelemetry"],
    actions: [{ label: { ko: "Prometheus 트레이딩", en: "Trade Prometheus" }, href: "/market/trading/prometheus" }, { label: { ko: "Grafana 보기", en: "Open Grafana" }, href: "/market/trading/grafana" }],
  },
  {
    id: "rebalance",
    day: "01",
    month: { ko: "4월", en: "Apr" },
    title: "월간 인덱스 리밸런싱",
    subtitle: { ko: "OSS / AI Infra / Security 지수 재구성", en: "OSS / AI Infra / Security rebalance" },
    impact: { ko: "중간 영향", en: "Medium impact" },
    tone: "neutral",
    dateLabel: { ko: "2026.04.01", en: "2026.04.01" },
    countdown: { ko: "D-8", en: "D-8" },
    status: { ko: "구성 종목 점검 단계", en: "Basket review in progress" },
    description: { ko: "상대 강세 종목에 추가 수급이 들어올 수 있는 이벤트입니다. 특히 AI Infra 중형주 반응이 클 수 있습니다.", en: "This event can create follow-through demand for outperformers, especially in mid-cap AI infra names." },
    watch: [{ ko: "AI Infra 가중치 변화", en: "AI Infra weight changes" }, { ko: "Security Index 편입 변동", en: "Security basket changes" }, { ko: "중형 성장주 거래량 급증 여부", en: "Volume spikes in growth names" }],
    affected: ["Langfuse", "Open WebUI", "KServe", "Trivy"],
    actions: [{ label: { ko: "스크리너 보기", en: "Open screener" }, href: "/market/screener" }, { label: { ko: "KServe 보기", en: "Open KServe" }, href: "/market/trading/kserve" }],
  },
];

function SectionHeading({ title }: { title: string }) {
  return <h2 className="text-[16px] font-semibold leading-6 text-[#d1d4dc]">{title}</h2>;
}

function TonePill({ label, tone }: { label: string; tone: Tone }) {
  return <span className={cn("inline-flex h-[18px] items-center rounded-[4px] px-2 text-[9px] leading-[13.5px]", tone === "up" && "bg-[rgba(200,74,49,0.1)] text-[#c84a31]", tone === "down" && "bg-[rgba(18,97,196,0.1)] text-[#1261c4]", tone === "neutral" && "bg-[rgba(132,142,156,0.1)] text-[#848e9c]")}>{label}</span>;
}

function BulletList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-[#a7b0bd]">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={`${title}-${item}`} className="flex items-start gap-2 text-[12px] leading-5 text-[#d1d4dc]">
            <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#3366ff]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MovementTable({ title, rows, tone }: { title: string; rows: Row[]; tone: Tone }) {
  return (
    <MarketPanel className="overflow-hidden">
      <div className="border-b border-[#2b2f36] px-4 py-3"><h3 className="text-[14px] font-semibold text-[#d1d4dc]">{title}</h3></div>
      {rows.map((row) => (
        <Link key={`${title}-${row.name}`} className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 border-b border-[#2b2f36] px-4 py-3 transition hover:bg-[rgba(255,255,255,0.02)] last:border-b-0" href={row.href}>
          <span className="text-[11px] text-[#848e9c]">{row.rank}</span>
          <div className="min-w-0"><p className="truncate text-[13px] font-medium text-[#d1d4dc]">{row.name}</p><p className="mt-1 truncate text-[10px] text-[#848e9c]">{row.category}</p></div>
          <div className="text-right"><p className="text-[13px] text-[#d1d4dc]">{row.score}</p><p className={cn("mt-1 text-[10px]", tone === "up" ? "text-[#c84a31]" : "text-[#1261c4]")}>{row.change}</p></div>
        </Link>
      ))}
    </MarketPanel>
  );
}

export function FigmaMarketAnalysisPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];
  const [reportId, setReportId] = useState(REPORTS[0]?.id ?? "");
  const [eventId, setEventId] = useState(EVENTS[0]?.id ?? "");
  const report = useMemo(() => REPORTS.find((item) => item.id === reportId) ?? REPORTS[0], [reportId]);
  const event = useMemo(() => EVENTS.find((item) => item.id === eventId) ?? EVENTS[0], [eventId]);

  return (
    <div className="space-y-5 font-figma-body">
      <section className="relative left-1/2 -mx-4 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.28)] sm:-mx-6 xl:mx-0">
        <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-4 px-4 py-5 sm:px-6 xl:px-0">
          <div><h1 className="text-[24px] font-bold text-[#d1d4dc]">{text.title}</h1><p className="mt-1 text-[12px] text-[#848e9c]">{text.description}</p></div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {SUMMARY.map((item) => (
              <MarketPanel key={item.label.ko} className="px-[13px] py-[12px]">
                <p className="text-[10px] text-[#848e9c]">{item.label[locale]}</p>
                <p className={cn("mt-1 text-[18px] font-bold text-[#d1d4dc]", item.tone === "up" && "text-[#c84a31]", item.tone === "down" && "text-[#1261c4]")}>{item.value[locale]}</p>
              </MarketPanel>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.briefingTitle} />
        <MarketPanel className="px-5 py-5">
          <p className="text-[12px] text-[#848e9c]">{text.briefingDate}</p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#d1d4dc]">{text.briefingHeading}</h2>
          <p className="mt-4 text-[14px] leading-[22px] text-[#d1d4dc]">{text.briefingBody}</p>
          <div className="mt-4"><p className="text-[12px] font-semibold text-[#848e9c]">{text.keyPoints}</p><ul className="mt-2 space-y-2">{POINTS.map((point) => <li key={point.ko} className="flex items-start gap-2 text-[12px] text-[#848e9c]"><span className="text-[#3366ff]">•</span><span>{point[locale]}</span></li>)}</ul></div>
        </MarketPanel>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.insightsTitle} />
        <div className="grid gap-3 xl:grid-cols-2">
          {INSIGHTS.map((item) => (
            <MarketPanel key={item.title.ko} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3"><h3 className="text-[14px] font-semibold text-[#d1d4dc]">{item.title[locale]}</h3><TonePill label={item.tone === "up" ? (locale === "ko" ? "강세" : "Bullish") : locale === "ko" ? "중립" : "Neutral"} tone={item.tone} /></div>
              <p className="mt-3 text-[11px] leading-[18px] text-[#848e9c]">{item.body[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={`${item.title.ko}-${tag}`} className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[9px] text-[#848e9c]">{tag}</span>)}</div>
            </MarketPanel>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="space-y-3"><SectionHeading title={text.gainersTitle} /><MovementTable rows={GAINERS} title={text.gainersTitle} tone="up" /></div>
        <div className="space-y-3"><SectionHeading title={text.losersTitle} /><MovementTable rows={LOSERS} title={text.losersTitle} tone="down" /></div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.reportsTitle} />
        <p className="text-[11px] text-[#848e9c]">{text.reportsDesc}</p>
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <MarketPanel className="overflow-hidden">
            {REPORTS.map((item) => (
              <button key={item.id} className={cn("w-full border-b border-[#2b2f36] px-4 py-4 text-left transition last:border-b-0", item.id === report?.id ? "bg-[rgba(51,102,255,0.08)]" : "hover:bg-[rgba(255,255,255,0.02)]")} onClick={() => setReportId(item.id)} type="button">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(51,102,255,0.1)] px-2 text-[9px] text-[#3366ff]">{item.kind}</span><span className="text-[9px] text-[#848e9c]">{item.readTime}</span></div><h3 className="mt-3 text-[14px] font-semibold text-[#d1d4dc]">{item.title[locale]}</h3><p className="mt-2 line-clamp-2 text-[11px] leading-[18px] text-[#848e9c]">{item.body[locale]}</p></div>
                  <TonePill label={item.date} tone={item.tone} />
                </div>
              </button>
            ))}
          </MarketPanel>

          {report && (
            <MarketPanel className="px-5 py-5">
              <div className="border-b border-[#2b2f36] pb-4">
                <div className="flex flex-wrap items-center gap-2"><span className="inline-flex h-[18px] items-center rounded-[4px] bg-[rgba(51,102,255,0.1)] px-2 text-[9px] text-[#3366ff]">{report.kind}</span><TonePill label={report.date} tone={report.tone} /><span className="text-[10px] text-[#848e9c]">{report.readTime}</span></div>
                <h3 className="mt-3 text-[18px] font-semibold text-[#d1d4dc]">{report.title[locale]}</h3>
                <p className="mt-2 text-[12px] leading-6 text-[#9aa4b2]">{report.body[locale]}</p>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div><p className="text-[11px] font-semibold text-[#a7b0bd]">{text.analyst}</p><p className="mt-2 text-[12px] text-[#d1d4dc]">{report.analyst}</p></div>
                  <div><p className="text-[11px] font-semibold text-[#a7b0bd]">{text.focus}</p><div className="mt-2 flex flex-wrap gap-2">{report.focus.map((item) => <span key={`${report.id}-${item}`} className="inline-flex h-[20px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[10px] text-[#d1d4dc]">{item}</span>)}</div></div>
                  <div><p className="text-[11px] font-semibold text-[#a7b0bd]">{text.thesis}</p><p className="mt-2 text-[12px] leading-6 text-[#d1d4dc]">{report.thesis[locale]}</p></div>
                </div>
                <div className="space-y-4">
                  <BulletList title={text.highlights} items={report.highlights.map((item) => item[locale])} />
                  <BulletList title={text.risks} items={report.risks.map((item) => item[locale])} />
                </div>
              </div>
              <div className="mt-5 border-t border-[#2b2f36] pt-4"><p className="text-[11px] font-semibold text-[#a7b0bd]">{text.actions}</p><div className="mt-3 flex flex-wrap gap-2">{report.actions.map((action) => <Link key={`${report.id}-${action.href}`} className="inline-flex h-9 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]" href={action.href}>{action.label[locale]}</Link>)}</div></div>
            </MarketPanel>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeading title={text.eventsTitle} />
        <p className="text-[11px] text-[#848e9c]">{text.eventsDesc}</p>
        <div className="grid gap-4 xl:grid-cols-[360px_minmax(0,1fr)]">
          <MarketPanel className="overflow-hidden">
            {EVENTS.map((item) => (
              <button key={item.id} className={cn("grid w-full grid-cols-[56px_minmax(0,1fr)] gap-4 border-b border-[#2b2f36] px-4 py-4 text-left transition last:border-b-0", item.id === event?.id ? "bg-[rgba(51,102,255,0.08)]" : "hover:bg-[rgba(255,255,255,0.02)]")} onClick={() => setEventId(item.id)} type="button">
                <div className="text-center"><p className="text-[24px] font-semibold text-[#d1d4dc]">{item.day}</p><p className="mt-1 text-[9px] text-[#848e9c]">{item.month[locale]}</p></div>
                <div className="min-w-0"><div className="flex items-center justify-between gap-3"><h3 className="truncate text-[14px] font-semibold text-[#d1d4dc]">{item.title}</h3><TonePill label={item.countdown[locale]} tone={item.tone} /></div><p className="mt-1 line-clamp-2 text-[11px] leading-[18px] text-[#848e9c]">{item.subtitle[locale]}</p></div>
              </button>
            ))}
          </MarketPanel>

          {event && (
            <MarketPanel className="px-5 py-5">
              <div className="border-b border-[#2b2f36] pb-4">
                <div className="flex flex-wrap items-center gap-2"><TonePill label={event.impact[locale]} tone={event.tone} /><span className="text-[10px] text-[#848e9c]">{event.dateLabel[locale]}</span><span className="text-[10px] text-[#848e9c]">{event.countdown[locale]}</span></div>
                <h3 className="mt-3 text-[18px] font-semibold text-[#d1d4dc]">{event.title}</h3>
                <p className="mt-1 text-[12px] text-[#a7b0bd]">{event.subtitle[locale]}</p>
                <p className="mt-4 rounded-[6px] border border-[#2b2f36] bg-[#10151d] px-3 py-3 text-[12px] leading-6 text-[#d1d4dc]">{event.description[locale]}</p>
              </div>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                  <div><p className="text-[11px] font-semibold text-[#a7b0bd]">Status</p><p className="mt-2 text-[12px] text-[#d1d4dc]">{event.status[locale]}</p></div>
                  <div><p className="text-[11px] font-semibold text-[#a7b0bd]">{text.affected}</p><div className="mt-2 flex flex-wrap gap-2">{event.affected.map((item) => <span key={`${event.id}-${item}`} className="inline-flex h-[20px] items-center rounded-[4px] bg-[rgba(132,142,156,0.1)] px-2 text-[10px] text-[#d1d4dc]">{item}</span>)}</div></div>
                </div>
                <BulletList title={text.watch} items={event.watch.map((item) => item[locale])} />
              </div>
              <div className="mt-5 border-t border-[#2b2f36] pt-4"><p className="text-[11px] font-semibold text-[#a7b0bd]">{text.actions}</p><div className="mt-3 flex flex-wrap gap-2">{event.actions.map((action) => <Link key={`${event.id}-${action.href}`} className="inline-flex h-9 items-center rounded-[4px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.1)] px-3 text-[12px] font-medium text-[#d1d4dc] transition hover:bg-[rgba(51,102,255,0.16)]" href={action.href}>{action.label[locale]}</Link>)}</div></div>
            </MarketPanel>
          )}
        </div>
      </section>
    </div>
  );
}
