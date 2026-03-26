"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { MarketPanel } from "@/components/market/MarketUi";
import {
  MARKET_SCREENER_CATEGORIES as MARKET_CATEGORY_DATA,
  MARKET_SCREENER_ROWS as MARKET_SCREENER_DATA,
} from "@/lib/market-data";
import { cn } from "@/lib/utils";

type MarketLocale = "ko" | "en";

interface ScreenerRow {
  rank: string;
  name: string;
  slug: string;
  category: string;
  filter?: string;
  score: number;
  delta: number;
  changeRate: number;
  up: number;
  flat: number;
  down: number;
  participants: number;
}

const COPY = {
  ko: {
    title: "OSS 기회 탐색",
    description: "거래 전에 조건으로 후보 종목을 좁혀보는 탐색 전용 화면입니다",
    roleLead: "탐색 중심",
    roleBody: "로그인 없이도 점수, 변동률, 참여자 조건으로 관심 종목 후보를 빠르게 찾을 수 있습니다.",
    tradeLead: "실행은 트레이딩에서",
    tradeBody: "실제 주문과 포지션 관리는 트레이딩 탭에서 진행하고, 이 화면은 후보를 추리는 데 집중합니다.",
    placeholder: "프로젝트명 검색...",
    categories: "카테고리",
    scoreRange: "점수 범위",
    volatilityRange: "변동률 범위 (%)",
    minParticipants: "최소 참여자 수",
    options: "기타 옵션",
    favoritesOnly: "즐겨찾기만 보기",
    results: "검색 결과",
    columns: ["순위", "종목명", "카테고리", "점수", "변동", "변동률", "상승", "보합", "하락", "참여자"],
    emptyTitle: "조건에 맞는 프로젝트가 없습니다.",
    emptyBody: "검색어 또는 필터 조건을 조정해 다시 확인해보세요.",
  },
  en: {
    title: "OSS Opportunity Finder",
    description: "A discovery-first screen for narrowing candidates before you trade",
    roleLead: "Discovery first",
    roleBody: "Filter potential names quickly by score, change, and participation signals even before logging in.",
    tradeLead: "Execution lives in Trading",
    tradeBody: "Use Trading for orders and portfolio management; use this screen to narrow the field.",
    placeholder: "Search projects...",
    categories: "Categories",
    scoreRange: "Score range",
    volatilityRange: "Volatility range (%)",
    minParticipants: "Minimum participants",
    options: "Other options",
    favoritesOnly: "Favorites only",
    results: "Results",
    columns: ["Rank", "Name", "Category", "Score", "Delta", "Change", "Up", "Flat", "Down", "Participants"],
    emptyTitle: "No projects match these filters.",
    emptyBody: "Try adjusting your search term or filters.",
  },
} as const;

const CATEGORIES = [
  "Orchestration",
  "Observability",
  "Networking",
  "CI/CD",
  "Service Mesh",
  "Container Runtime",
] as const;

const ROWS: ScreenerRow[] = [
  { rank: "#1", name: "Kubernetes", slug: "kubernetes", category: "Orchestration", score: 94.5, delta: 2.3, changeRate: 2.49, up: 1247, flat: 332, down: 89, participants: 1668 },
  { rank: "#2", name: "Prometheus", slug: "prometheus", category: "Observability", score: 88.2, delta: 1.8, changeRate: 2.08, up: 892, flat: 245, down: 123, participants: 1260 },
  { rank: "#5", name: "Cilium", slug: "cilium", category: "Networking", score: 82.7, delta: -0.5, changeRate: -0.6, up: 456, flat: 289, down: 187, participants: 932 },
  { rank: "#7", name: "Argo CD", slug: "argo-cd", category: "CI/CD", score: 79.4, delta: 3.2, changeRate: 4.2, up: 678, flat: 198, down: 76, participants: 952 },
  { rank: "#3", name: "Grafana", slug: "grafana", category: "Observability", score: 86.1, delta: 1.5, changeRate: 1.77, up: 1034, flat: 312, down: 98, participants: 1444 },
  { rank: "#12", name: "Istio", slug: "istio", category: "Service Mesh", score: 75.3, delta: -1.2, changeRate: -1.57, up: 345, flat: 412, down: 223, participants: 980 },
  { rank: "#4", name: "Envoy", slug: "envoy", category: "Networking", score: 83.9, delta: 0.8, changeRate: 0.96, up: 567, flat: 289, down: 144, participants: 1000 },
  { rank: "#9", name: "containerd", slug: "containerd", category: "Container Runtime", score: 78.6, delta: -0.3, changeRate: -0.38, up: 423, flat: 356, down: 187, participants: 966 },
];

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#848e9c]" fill="none" viewBox="0 0 16 16">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4 text-[#d1d4dc]" fill="none" viewBox="0 0 16 16">
      <path d="M2.25 3.5H13.75L9 8.8V12.25L7 13V8.8L2.25 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

function StarIcon({ active }: { active: boolean }) {
  return (
    <svg aria-hidden="true" className={cn("h-3.5 w-3.5", active ? "text-[#f0b90b]" : "text-[#848e9c]")} fill={active ? "currentColor" : "none"} viewBox="0 0 16 16">
      <path
        d="M8 2.4L9.6 5.62L13.15 6.13L10.57 8.64L11.18 12.18L8 10.5L4.82 12.18L5.43 8.64L2.85 6.13L6.4 5.62L8 2.4Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function RangeTrack({
  min,
  max,
  absoluteMin,
  absoluteMax,
}: {
  min: number;
  max: number;
  absoluteMin: number;
  absoluteMax: number;
}) {
  const start = ((min - absoluteMin) / (absoluteMax - absoluteMin)) * 100;
  const end = ((max - absoluteMin) / (absoluteMax - absoluteMin)) * 100;

  return (
    <div className="mt-4 h-[4px] rounded-full bg-[#2b2f36]">
      <div className="relative h-full rounded-full bg-[#3366ff]" style={{ left: `${start}%`, width: `${Math.max(end - start, 4)}%` }} />
    </div>
  );
}

export function FigmaMarketScreenerPage() {
  const locale = (useLocale() === "ko" ? "ko" : "en") as MarketLocale;
  const text = COPY[locale];
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [scoreMin, setScoreMin] = useState(0);
  const [scoreMax, setScoreMax] = useState(100);
  const [volatilityMin, setVolatilityMin] = useState(-10);
  const [volatilityMax, setVolatilityMax] = useState(10);
  const [minParticipants, setMinParticipants] = useState(0);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setSelectedCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  };

  const toggleFavorite = (slug: string) => {
    setFavorites((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  };

  const filteredRows = MARKET_SCREENER_DATA.filter((row) => {
    const matchesQuery = row.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(row.category) ||
      selectedCategories.includes(row.filter ?? row.category);
    const matchesScore = row.score >= scoreMin && row.score <= scoreMax;
    const matchesVolatility = row.changeRate >= volatilityMin && row.changeRate <= volatilityMax;
    const matchesParticipants = row.participants >= minParticipants;
    const matchesFavorite = !favoritesOnly || favorites.includes(row.slug);
    return matchesQuery && matchesCategory && matchesScore && matchesVolatility && matchesParticipants && matchesFavorite;
  });

  return (
    <div className="space-y-5 font-figma-body">
      <section className="space-y-2">
        <h1 className="text-[24px] font-bold leading-8 text-[#d1d4dc]">{text.title}</h1>
        <p className="text-[12px] leading-4 text-[#848e9c]">{text.description}</p>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        <MarketPanel className="px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#6f7c8f]">{text.roleLead}</p>
          <p className="mt-2 text-[12px] leading-6 text-[#d1d4dc]">{text.roleBody}</p>
        </MarketPanel>
        <MarketPanel className="px-4 py-4">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#6f7c8f]">{text.tradeLead}</p>
          <p className="mt-2 text-[12px] leading-6 text-[#d1d4dc]">{text.tradeBody}</p>
        </MarketPanel>
      </section>

      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <SearchIcon />
        </div>
        <input
          className="h-[36px] w-full rounded-[4px] border border-[#2b2f36] bg-[#1e2026] pl-9 pr-4 text-[13px] text-[#d1d4dc] outline-none placeholder:text-[#848e9c] focus:border-[#3a4252]"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={text.placeholder}
          value={query}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[233px_minmax(0,1fr)]">
        <div className="space-y-4">
          <MarketPanel className="px-4 py-4">
            <div className="flex items-center gap-2">
              <FilterIcon />
              <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.categories}</h2>
            </div>
            <div className="mt-4 space-y-1">
              {MARKET_CATEGORY_DATA.map((category) => {
                const active = selectedCategories.includes(category);
                return (
                  <button
                    key={category}
                    className={cn(
                      "flex w-full items-center rounded-[4px] px-3 py-2 text-left text-[13px] leading-5 transition",
                      active ? "bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]" : "text-[#d1d4dc] hover:bg-[rgba(255,255,255,0.03)]",
                    )}
                    onClick={() => toggleCategory(category)}
                    type="button"
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.scoreRange}</h2>
            <div className="mt-4 grid grid-cols-[1fr_12px_1fr] items-center gap-2">
              <input
                className="h-[28px] rounded-[4px] border border-[#2b2f36] bg-[#2a2e37] px-3 text-[13px] text-[#d1d4dc] outline-none"
                max={scoreMax}
                min={0}
                onChange={(event) => setScoreMin(Number(event.target.value))}
                type="number"
                value={scoreMin}
              />
              <span className="text-center text-[12px] text-[#848e9c]">~</span>
              <input
                className="h-[28px] rounded-[4px] border border-[#2b2f36] bg-[#2a2e37] px-3 text-[13px] text-[#d1d4dc] outline-none"
                max={100}
                min={scoreMin}
                onChange={(event) => setScoreMax(Number(event.target.value))}
                type="number"
                value={scoreMax}
              />
            </div>
            <RangeTrack absoluteMax={100} absoluteMin={0} max={scoreMax} min={scoreMin} />
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.volatilityRange}</h2>
            <div className="mt-4 grid grid-cols-[1fr_12px_1fr] items-center gap-2">
              <input
                className="h-[28px] rounded-[4px] border border-[#2b2f36] bg-[#2a2e37] px-3 text-[13px] text-[#d1d4dc] outline-none"
                max={volatilityMax}
                min={-10}
                onChange={(event) => setVolatilityMin(Number(event.target.value))}
                type="number"
                value={volatilityMin}
              />
              <span className="text-center text-[12px] text-[#848e9c]">~</span>
              <input
                className="h-[28px] rounded-[4px] border border-[#2b2f36] bg-[#2a2e37] px-3 text-[13px] text-[#d1d4dc] outline-none"
                max={10}
                min={volatilityMin}
                onChange={(event) => setVolatilityMax(Number(event.target.value))}
                type="number"
                value={volatilityMax}
              />
            </div>
            <RangeTrack absoluteMax={10} absoluteMin={-10} max={volatilityMax} min={volatilityMin} />
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.minParticipants}</h2>
            <input
              className="mt-4 h-[28px] w-full rounded-[4px] border border-[#2b2f36] bg-[#2a2e37] px-3 text-[13px] text-[#d1d4dc] outline-none"
              min={0}
              onChange={(event) => setMinParticipants(Number(event.target.value))}
              type="number"
              value={minParticipants}
            />
          </MarketPanel>

          <MarketPanel className="px-4 py-4">
            <h2 className="text-[14px] font-semibold leading-5 text-[#d1d4dc]">{text.options}</h2>
            <button
              className="mt-4 flex items-center gap-2 text-[13px] leading-5 text-[#d1d4dc]"
              onClick={() => setFavoritesOnly((current) => !current)}
              type="button"
            >
              <StarIcon active={favoritesOnly} />
              <span>{text.favoritesOnly}</span>
            </button>
          </MarketPanel>
        </div>

        <MarketPanel className="overflow-hidden">
          <div className="border-b border-[#2b2f36] px-4 py-4">
            <h2 className="text-[18px] font-semibold leading-7 text-[#d1d4dc]">
              {text.results} ({locale === "ko" ? `${filteredRows.length}개` : filteredRows.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead className="bg-[#161a20]">
                <tr>
                  {text.columns.map((column) => (
                    <th key={column} className="px-4 py-3 text-left text-[11px] font-medium leading-4 text-[#848e9c]">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => {
                  const favorite = favorites.includes(row.slug);
                  const positive = row.delta > 0;

                  return (
                    <tr key={row.slug} className="border-t border-[#2b2f36]">
                      <td className="px-4 py-4 text-[13px] leading-5 text-[#848e9c]">{row.rank}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <Link className="text-[14px] font-medium leading-5 text-[#d1d4dc] transition hover:text-white" href={`/market/trading/${row.slug}`}>
                            {row.name}
                          </Link>
                          <button onClick={() => toggleFavorite(row.slug)} type="button">
                            <StarIcon active={favorite} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex h-[20px] items-center rounded-[4px] bg-[#2a2e37] px-2 text-[11px] leading-4 text-[#d1d4dc]">
                          {row.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[14px] leading-5 text-[#d1d4dc]">{row.score.toFixed(1)}</td>
                      <td className={cn("px-4 py-4 text-[14px] font-medium leading-5", positive ? "text-[#f6465d]" : "text-[#2f86eb]")}>
                        {positive ? "▲" : "▼"} {Math.abs(row.delta).toFixed(1)}
                      </td>
                      <td className={cn("px-4 py-4 text-[14px] font-medium leading-5", positive ? "text-[#f6465d]" : "text-[#2f86eb]")}>
                        {positive ? "+" : ""}
                        {row.changeRate.toFixed(2)}%
                      </td>
                      <td className="px-4 py-4 text-[14px] leading-5 text-[#f6465d]">{row.up.toLocaleString()}</td>
                      <td className="px-4 py-4 text-[14px] leading-5 text-[#848e9c]">{row.flat.toLocaleString()}</td>
                      <td className="px-4 py-4 text-[14px] leading-5 text-[#2f86eb]">{row.down.toLocaleString()}</td>
                      <td className="px-4 py-4 text-[14px] leading-5 text-[#848e9c]">{row.participants.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRows.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[14px] font-medium leading-5 text-[#d1d4dc]">{text.emptyTitle}</p>
              <p className="mt-2 text-[12px] leading-5 text-[#848e9c]">{text.emptyBody}</p>
            </div>
          ) : null}
        </MarketPanel>
      </div>
    </div>
  );
}
