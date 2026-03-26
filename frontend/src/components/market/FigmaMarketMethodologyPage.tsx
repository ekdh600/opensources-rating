"use client";

import { useEffect, useMemo, useState } from "react";

import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";

type QuoteApi = {
  slug: string;
  name: string;
  category: string | null;
  current_price: number;
  previous_close: number;
  change_points: number;
  change_rate: number;
  score_date: string;
};

type LeaderboardEntryApi = {
  total_score: number;
  project: {
    slug: string;
    display_name_ko: string | null;
    display_name_en: string | null;
    category?: {
      name_ko: string;
      name_en: string;
    } | null;
  };
};

type CompareItemApi = {
  project: {
    slug: string;
    display_name_ko: string | null;
    display_name_en: string | null;
  };
  latest_score?: {
    score_date: string;
    attention_score: number;
    execution_score: number;
    health_score: number;
    trust_score: number;
    total_score: number;
  } | null;
  stars_total?: number | null;
  contributors_30d?: number | null;
  commits_30d?: number | null;
  prs_merged_30d?: number | null;
  issues_closed_30d?: number | null;
};

type MethodologyState = {
  quotes: QuoteApi[];
  globalDate: string | null;
  globalEntries: LeaderboardEntryApi[];
  cncfDate: string | null;
  cncfEntries: LeaderboardEntryApi[];
  compareDate: string | null;
  compareItems: CompareItemApi[];
};

type MethodologyRow = {
  name: string;
  source: string;
  destination: string;
  collectedAt: string;
  formula: string;
  collectedValue: string;
  currentValue: string;
  result: string;
};

const SCORE_SYSTEM_ROWS = [
  {
    name: "관심도 Attention",
    formula: "34%",
    inputs: "stars 증가, watchers, 외부 주목 신호",
    purpose: "프로젝트가 지금 얼마나 시장의 관심을 끌고 있는지 반영",
    rationale:
      "오픈소스 시장에서는 가격보다 관심의 유입이 먼저 움직입니다. 다만 관심만 높고 실행이 약한 프로젝트를 과대평가하지 않도록 34%로 제한했습니다.",
  },
  {
    name: "실행력 Execution",
    formula: "38%",
    inputs: "commits, PR 병합, issues closed, contributors, release 활동",
    purpose: "유지보수 팀이 실제로 개발과 운영을 계속 수행하고 있는지 반영",
    rationale:
      "이 서비스는 커뮤니티와 프로젝트 지속성을 함께 보려는 게임이므로, 단순 인기보다 실제 개발 활동을 가장 중요하게 두었습니다. 그래서 가장 큰 비중인 38%를 부여했습니다.",
  },
  {
    name: "건강도 Health",
    formula: "18%",
    inputs: "이슈 종료율, PR 병합률, 응답 속도, stale issue 비율",
    purpose: "프로젝트 운영 구조가 건강하게 유지되는지 반영",
    rationale:
      "활동량이 높아도 운영 품질이 나쁘면 장기적으로 신뢰가 떨어집니다. 다만 실행력과 일부 겹치므로 보조 축으로 18%를 배정했습니다.",
  },
  {
    name: "신뢰도 Trust",
    formula: "10%",
    inputs: "보안 점수, 의존성 리스크, 최근 릴리스 여부",
    purpose: "보안, 공급망, 릴리스 위생 측면의 신뢰성 반영",
    rationale:
      "신뢰도는 매우 중요하지만 현재 수집 가능한 신호가 상대적으로 제한적이어서, 전체 점수를 왜곡하지 않도록 10%의 안정화 가중치로 두었습니다.",
  },
];

function formatNumber(value: number, digits = 2) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function categoryIndexLabel(category: string) {
  return `${category} Index`;
}

function projectName(project: { slug: string; display_name_ko?: string | null; display_name_en?: string | null }) {
  return project.display_name_ko || project.display_name_en || project.slug;
}

function resolveSnapshotDate(data: MethodologyState) {
  const candidates = [
    ...data.quotes.map((quote) => quote.score_date),
    ...data.compareItems
      .map((item) => item.latest_score?.score_date)
      .filter((value): value is string => Boolean(value)),
    data.globalDate,
    data.cncfDate,
    data.compareDate,
  ].filter((value): value is string => Boolean(value));

  if (candidates.length === 0) {
    return "-";
  }

  const counts = new Map<string, number>();
  candidates.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1));
  return [...counts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1];
    }
    return left[0].localeCompare(right[0]);
  })[0]?.[0] ?? candidates[0];
}

function MethodologyTable({ rows }: { rows: MethodologyRow[] }) {
  return (
    <div className="overflow-x-auto rounded-[8px] border border-[#2b2f36] bg-[#161b24]">
      <table className="min-w-full text-left text-[12px] text-[#d1d4dc]">
        <thead className="text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">
          <tr className="border-b border-[#2b2f36]">
            <th className="px-3 py-3">이름</th>
            <th className="px-3 py-3">수집 위치</th>
            <th className="px-3 py-3">목적지</th>
            <th className="px-3 py-3">수집시간</th>
            <th className="px-3 py-3">계산식</th>
            <th className="px-3 py-3">수집값</th>
            <th className="px-3 py-3">현재값</th>
            <th className="px-3 py-3">도출값</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-[rgba(43,47,54,0.55)] align-top last:border-b-0">
              <td className="px-3 py-4 font-semibold text-[#d1d4dc]">{row.name}</td>
              <td className="px-3 py-4 text-[#9aa4b2]">{row.source}</td>
              <td className="px-3 py-4 text-[#d1d4dc]">{row.destination}</td>
              <td className="px-3 py-4 text-[#9aa4b2]">{row.collectedAt}</td>
              <td className="px-3 py-4 text-[#9aa4b2]">{row.formula}</td>
              <td className="px-3 py-4 text-[#9aa4b2]">{row.collectedValue}</td>
              <td className="px-3 py-4 text-[#d1d4dc]">{row.currentValue}</td>
              <td className="px-3 py-4 text-[#8fb3ff]">{row.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FigmaMarketMethodologyPage() {
  const [data, setData] = useState<MethodologyState>({
    quotes: [],
    globalDate: null,
    globalEntries: [],
    cncfDate: null,
    cncfEntries: [],
    compareDate: null,
    compareItems: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [quotes, globalBoard, cncfBoard, compare] = await Promise.all([
          api.trading.quotes(20),
          api.leaderboards.global({ page_size: "5" }),
          api.leaderboards.cncf({ page_size: "5" }),
          api.compare(["kubernetes", "prometheus", "argo-cd"]),
        ]);

        if (cancelled) return;
        setData({
          quotes: Array.isArray(quotes) ? quotes : [],
          globalDate: typeof globalBoard?.date === "string" ? globalBoard.date : null,
          globalEntries: Array.isArray(globalBoard?.entries) ? globalBoard.entries : [],
          cncfDate: typeof cncfBoard?.date === "string" ? cncfBoard.date : null,
          cncfEntries: Array.isArray(cncfBoard?.entries) ? cncfBoard.entries : [],
          compareDate: typeof compare?.date === "string" ? compare.date : null,
          compareItems: Array.isArray(compare?.items) ? compare.items : [],
        });
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "계산 데이터를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const snapshotDate = useMemo(() => resolveSnapshotDate(data), [data]);

  const indexRows = useMemo<MethodologyRow[]>(() => {
    const quoteMap = new Map(data.quotes.map((quote) => [quote.slug, quote]));

    const buildIndexRow = (
      name: string,
      source: string,
      destination: string,
      boardDate: string | null,
      entries: LeaderboardEntryApi[],
    ) => {
      const linked = entries
        .map((entry) => {
          const slug = entry.project.slug;
          const quote = quoteMap.get(slug);
          return quote ? { name: projectName(entry.project), totalScore: entry.total_score, changeRate: quote.change_rate } : null;
        })
        .filter((item): item is { name: string; totalScore: number; changeRate: number } => item !== null);

      const scoreAverage = average(linked.map((item) => item.totalScore));
      const changeAverage = average(linked.map((item) => item.changeRate));

      return {
        name,
        source,
        destination,
        collectedAt: snapshotDate !== "-" ? snapshotDate : boardDate ?? "-",
        formula: "avg(total_score) + avg(change_rate)",
        collectedValue: linked
          .map((item) => `${item.name} ${formatNumber(item.totalScore)}/${formatNumber(item.changeRate, 3)}%`)
          .join(", "),
        currentValue: `평균 점수 ${formatNumber(scoreAverage)}, 평균 등락률 ${formatNumber(changeAverage, 3)}%`,
        result: `${name} ${formatNumber(scoreAverage)} / ${formatNumber(changeAverage, 3)}%`,
      };
    };

    const categoryGroups = new Map<string, QuoteApi[]>();
    data.quotes.forEach((quote) => {
      const category = quote.category ?? "기타";
      categoryGroups.set(category, [...(categoryGroups.get(category) ?? []), quote]);
    });
    const categoryRows = [...categoryGroups.entries()]
      .sort((left, right) => right[1].length - left[1].length)
      .slice(0, 6)
      .map(([category, quotes]) => {
        const avgPrice = average(quotes.map((quote) => quote.current_price));
        const avgChange = average(quotes.map((quote) => quote.change_rate));
        return {
          name: categoryIndexLabel(category),
          source: "/api/v1/trading/quotes",
          destination: "메인 화면 카테고리 인덱스 카드",
          collectedAt: snapshotDate !== "-" ? snapshotDate : quotes[0]?.score_date ?? "-",
          formula: "avg(current_price) + avg(change_rate)",
          collectedValue: quotes
            .map((quote) => `${quote.name} ${formatNumber(quote.current_price)}/${formatNumber(quote.change_rate, 3)}%`)
            .join(", "),
          currentValue: `평균 가격 ${formatNumber(avgPrice)}, 평균 등락률 ${formatNumber(avgChange, 3)}%`,
          result: `${categoryIndexLabel(category)} ${formatNumber(avgPrice)} / ${formatNumber(avgChange, 3)}%`,
        };
      });

    const rows = [
      buildIndexRow(
        "OSS Index",
        "/api/v1/leaderboards/global + /api/v1/trading/quotes",
        "메인 화면 상단 OSS Index 카드",
        data.globalDate,
        data.globalEntries,
      ),
      buildIndexRow(
        "CNCF Index",
        "/api/v1/leaderboards/cncf + /api/v1/trading/quotes",
        "메인 화면 상단 CNCF Index 카드",
        data.cncfDate,
        data.cncfEntries,
      ),
    ];

    return [...rows, ...categoryRows];
  }, [data, snapshotDate]);

  const stockRows = useMemo<MethodologyRow[]>(() => {
    const quoteMap = new Map(data.quotes.map((quote) => [quote.slug, quote]));

    return data.compareItems
      .filter((item) => item.latest_score)
      .map((item) => {
        const score = item.latest_score!;
        const quote = quoteMap.get(item.project.slug);
        const formulaValue =
          0.34 * score.attention_score +
          0.38 * score.execution_score +
          0.18 * score.health_score +
          0.1 * score.trust_score;

        return {
          name: projectName(item.project),
          source: "GitHub API repos/issues/pulls/releases + /api/v1/trading/quotes",
          destination: `종목 상세와 트레이딩 보드의 ${projectName(item.project)} 가격/등락률`,
          collectedAt: snapshotDate !== "-" ? snapshotDate : score.score_date,
          formula: `0.34×attention + 0.38×execution + 0.18×health + 0.10×trust`,
          collectedValue: `stars ${formatNumber(item.stars_total ?? 0, 0)}, contributors ${formatNumber(item.contributors_30d ?? 0, 0)}, commits ${formatNumber(item.commits_30d ?? 0, 0)}, PR ${formatNumber(item.prs_merged_30d ?? 0, 0)}, issue ${formatNumber(item.issues_closed_30d ?? 0, 0)}`,
          currentValue: `attention ${formatNumber(score.attention_score)}, execution ${formatNumber(score.execution_score)}, health ${formatNumber(score.health_score)}, trust ${formatNumber(score.trust_score)}${quote ? `, 현재가 ${formatNumber(quote.current_price)}, 등락률 ${formatNumber(quote.change_rate, 3)}%` : ""}`,
          result: quote
            ? `total_score ${formatNumber(formulaValue)} → 현재가 ${formatNumber(quote.current_price)} / 등락률 ${formatNumber(quote.change_rate, 3)}%`
            : `total_score ${formatNumber(formulaValue)}`,
        };
      });
  }, [data, snapshotDate]);

  return (
    <div className="space-y-6 font-figma-body">
      <MarketPageIntro
        eyebrow="Methodology"
        title="계산 방식"
        description="이 페이지는 화면에 보이는 인덱스와 종목이 어디서 수집되고, 어떤 식으로 계산되어, 어떤 값으로 표출되는지 순서대로 보여줍니다."
        stats={[
          {
            label: "현재 기준일",
            value: snapshotDate,
            note: "페이지 전체는 하나의 공통 스냅샷 날짜 기준으로 고정해 표시합니다.",
          },
          {
            label: "인덱스",
            value: `${indexRows.length}개`,
            note: "메인 화면에 쓰이는 대표 인덱스 계산 예시",
          },
          {
            label: "대표 종목",
            value: `${stockRows.length}개`,
            note: "실제 API로 확인 가능한 종목 계산 예시",
          },
          {
            label: "현재 데이터",
            value: "시드 기반 API",
            note: "운영 실수집 전 단계의 개발용 스냅샷입니다.",
          },
        ]}
      />

      {error ? (
        <MarketPanel className="p-5">
          <div className="rounded-[8px] border border-[rgba(255,90,90,0.22)] bg-[rgba(255,90,90,0.08)] px-4 py-4 text-[13px] text-[#ffb4b4]">
            {error}
          </div>
        </MarketPanel>
      ) : null}

      {loading ? (
        <MarketPanel className="p-5">
          <div className="rounded-[8px] border border-[#2b2f36] bg-[#161b24] px-4 py-4 text-[13px] text-[#9aa4b2]">
            계산 표를 불러오는 중입니다.
          </div>
        </MarketPanel>
      ) : null}

      {!loading && !error ? (
        <>
          <MarketPanel className="p-5">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">1. 각 인덱스</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#9aa4b2]">
                메인 화면 인덱스 카드가 어떤 종목 묶음을 읽고, 어떤 평균식으로 계산되어 표시되는지 보여줍니다.
              </p>
            </div>
            <MethodologyTable rows={indexRows} />
          </MarketPanel>

          <MarketPanel className="p-5">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">2. 각 종목</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#9aa4b2]">
                대표 종목이 어떤 원천값을 받아 total_score로 계산되고, 최종적으로 종목 현재가와 등락률로 표출되는지 보여줍니다.
              </p>
            </div>
            <MethodologyTable rows={stockRows} />
          </MarketPanel>

          <MarketPanel className="p-5">
            <div className="mb-4">
              <h2 className="text-[18px] font-semibold text-[#d1d4dc]">3. 점수 체계와 계산 근거</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#9aa4b2]">
                점수는 단순 인기 순위가 아니라 관심, 실행, 운영 건강, 신뢰를 함께 보도록 설계했습니다. 최종 공식은
                ` total_score = 0.34×attention + 0.38×execution + 0.18×health + 0.10×trust `입니다.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {SCORE_SYSTEM_ROWS.map((row) => (
                <article key={row.name} className="rounded-[8px] border border-[#2b2f36] bg-[#161b24] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[15px] font-semibold text-[#d1d4dc]">{row.name}</h3>
                    <span className="text-[14px] font-semibold text-[#8fb3ff]">{row.formula}</span>
                  </div>
                  <p className="mt-3 text-[12px] leading-6 text-[#9aa4b2]">
                    <span className="font-semibold text-[#d1d4dc]">입력값</span>: {row.inputs}
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-[#9aa4b2]">
                    <span className="font-semibold text-[#d1d4dc]">보는 목적</span>: {row.purpose}
                  </p>
                  <p className="mt-2 text-[12px] leading-6 text-[#9aa4b2]">
                    <span className="font-semibold text-[#d1d4dc]">이렇게 만든 근거</span>: {row.rationale}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-4 rounded-[8px] border border-[rgba(51,102,255,0.22)] bg-[rgba(51,102,255,0.08)] px-4 py-4">
              <p className="text-[12px] leading-6 text-[#d9e4ff]">
                이 점수 체계는 “많이 언급되는 프로젝트”와 “실제로 건강하게 유지되는 프로젝트”를 구분하려는 목적을 가집니다.
                그래서 관심도만으로 순위를 만들지 않고, 실행력과 건강도를 더 크게 반영해 커뮤니티 활동성과 프로젝트 지속성을
                함께 보도록 설계했습니다.
              </p>
            </div>
          </MarketPanel>
        </>
      ) : null}
    </div>
  );
}
