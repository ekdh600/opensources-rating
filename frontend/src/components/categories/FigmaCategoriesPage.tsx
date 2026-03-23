"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { categorySummaries, pickText } from "@/lib/mock-data";

const AXIS_STYLES = {
  attention: {
    label: "#435ce7",
  },
  execution: {
    label: "#0e9f6e",
  },
  health: {
    label: "#0ea5b7",
  },
  trust: {
    label: "#d97706",
  },
} as const;

const COPY = {
  ko: {
    eyebrow: "Category map",
    title: "카테고리",
    description:
      "국내 사용자에게 익숙한 정보 구조를 우선 적용해 카테고리별로 오픈소스 프로젝트를 탐색할 수 있게 구성했습니다.",
    stats: [
      { label: "Groups", value: "6" },
      { label: "Model", value: "Korean-first IA" },
      { label: "Coverage", value: "MVP + market extension" },
    ],
    footer: {
      title: "OSS 리더보드",
      description:
        "한국어 우선 오픈소스 프로젝트 관측 플랫폼. 다양한 지표를 통해 프로젝트의 현재 상태를 읽기 쉬운 형태로 정리합니다.",
      sources: "GitHub API · CNCF DevStats · OSS Insight · deps.dev",
      copyright: "© 2026 OSS Leaderboard",
    },
  },
  en: {
    eyebrow: "Category map",
    title: "Categories",
    description:
      "This view prioritizes a Korean-first information architecture so users can explore open source projects by category.",
    stats: [
      { label: "Groups", value: "6" },
      { label: "Model", value: "Korean-first IA" },
      { label: "Coverage", value: "MVP + market extension" },
    ],
    footer: {
      title: "OSS Leaderboard",
      description:
        "A Korean-first observability platform for open source projects, organized to make the current state of each project easier to read.",
      sources: "GitHub API · CNCF DevStats · OSS Insight · deps.dev",
      copyright: "© 2026 OSS Leaderboard",
    },
  },
} as const;

function CategoryStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[16px] border border-[#2d3548] bg-[#12161f] px-[16.8px] pb-[18px] pt-[16.8px]">
      <p className="font-pretendard text-[11px] font-semibold uppercase leading-[16.5px] tracking-[1.76px] text-[#64748b]">
        {label}
      </p>
      <p className="mt-2 font-pretendard text-[20px] font-semibold leading-[30px] tracking-[-0.5px] text-[#e2e8f0]">
        {value}
      </p>
    </article>
  );
}

function CategoryCard({
  axis,
  name,
  summary,
  count,
  href,
}: {
  axis: keyof typeof AXIS_STYLES;
  name: string;
  summary: string;
  count: number;
  href: string;
}) {
  const tone = AXIS_STYLES[axis];

  return (
    <Link
      href={href}
      className="block rounded-[24px] border border-[#2d3548] bg-[#1a1f2e] px-6 pb-[25px] pt-6 transition hover:-translate-y-0.5 hover:border-[#475569] hover:bg-[#202637]"
    >
      <p
        className="font-pretendard text-[11px] font-semibold uppercase leading-[16.5px] tracking-[1.76px]"
        style={{ color: tone.label }}
      >
        {axis}
      </p>
      <h2 className="mt-[12px] font-pretendard text-[20px] font-semibold leading-[30px] tracking-[-0.5px] text-[#e2e8f0]">
        {name}
      </h2>
      <p className="mt-3 min-h-[56px] font-pretendard text-[14px] leading-7 text-[#94a3b8]">{summary}</p>
      <span className="mt-4 inline-flex h-[34px] items-center rounded-full border border-[#2d3548] bg-[rgba(255,255,255,0.05)] px-3 font-pretendard text-[14px] leading-[21px] text-[#94a3b8]">
        {count} projects
      </span>
    </Link>
  );
}

export function FigmaCategoriesPage() {
  const locale = useLocale();
  const copy = COPY[locale === "ko" ? "ko" : "en"];

  return (
    <div className="relative left-1/2 min-h-screen w-screen -translate-x-1/2 bg-[#0a0e17] text-[#e2e8f0]">
      <div className="mx-auto w-full max-w-[1152px] px-4 pb-20 pt-12 md:px-6 xl:px-0">
        <section className="max-w-[1087px]">
          <span className="inline-flex h-[30px] items-center rounded-full border border-[rgba(37,99,235,0.2)] bg-[rgba(37,99,235,0.1)] px-4 font-pretendard text-[11px] font-semibold uppercase leading-[16.5px] tracking-[1.98px] text-[#60a5fa]">
            {copy.eyebrow}
          </span>
          <h1 className="mt-4 font-pretendard text-[40px] font-semibold leading-[1.1] tracking-[-1.2px] text-white md:text-[48px] md:leading-[72px]">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-[672px] font-pretendard text-[16px] leading-6 text-[#94a3b8]">{copy.description}</p>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {copy.stats.map((stat) => (
            <CategoryStatCard key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {categorySummaries.map((category) => (
            <CategoryCard
              key={category.slug}
              axis={category.dominantAxis}
              count={category.count}
              href={`/categories?category=${category.slug}`}
              name={pickText(locale, category.name)}
              summary={pickText(locale, category.summary)}
            />
          ))}
        </section>
      </div>

      <footer className="border-t border-[#2d3548] bg-[#0a0e17] px-4 py-12 md:px-6 xl:px-0">
        <div className="mx-auto w-full max-w-[1152px]">
          <div className="flex flex-col gap-6 rounded-[8px] border border-[#2d3548] bg-[#12161f] px-[24.8px] py-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-[672px]">
              <h2 className="font-pretendard text-[24px] font-medium leading-9 tracking-[-0.4px] text-[#6b9bd1]">
                {copy.footer.title}
              </h2>
              <p className="mt-3 font-pretendard text-[14px] leading-6 text-[#64748b]">{copy.footer.description}</p>
            </div>
            <div className="space-y-2 md:text-right">
              <p className="font-pretendard text-[11px] uppercase leading-[16.5px] tracking-[0.6px] text-[#64748b]">
                {copy.footer.sources}
              </p>
              <p className="font-pretendard text-[11px] uppercase leading-[16.5px] tracking-[0.6px] text-[#64748b]">
                {copy.footer.copyright}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
