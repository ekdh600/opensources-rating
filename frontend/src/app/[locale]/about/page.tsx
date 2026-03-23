"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

const DATA_SOURCES = [
  { name: "GitHub API", desc: "스타, 포크, 커밋, PR, 이슈, 릴리스 등의 기본 메타데이터" },
  { name: "CNCF DevStats", desc: "CNCF 프로젝트의 활동성, 기여자 다양성, 기업 참여도" },
  { name: "OSS Insight", desc: "실시간 트렌드와 비교 보조 데이터" },
  { name: "Star History", desc: "장기 스타 추세 시각화 데이터" },
  { name: "deps.dev", desc: "공급망과 보안 리스크 신호" },
];

export default function AboutPage() {
  return (
    <div className="page-shell space-y-8 py-8">
      <PageHeader
        eyebrow="About the product"
        title="소개"
        description="OSS 리더보드는 단순 스타 정렬이 아니라, 오픈소스 프로젝트의 현재 상태를 설명 가능한 방식으로 읽어내는 관측 플랫폼입니다."
        stats={[
          { label: "Language", value: "ko-KR", note: "영문 보조 지원" },
          { label: "Output", value: "Leaderboard", note: "Explainable ranking structure" },
          { label: "Sources", value: "7+", note: "Cross-source aggregation" },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <Panel tone="muted">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            핵심 원칙
          </h2>
          <div className="mt-4 space-y-3 text-sm leading-7 text-muted">
            <p>다중 신호 기반 종합 평가</p>
            <p>CNCF 프로젝트에 대한 심화 신호 반영</p>
            <p>왜 이 순위인지 설명 가능한 구조</p>
            <p>한국어 우선 정보 구조와 카피</p>
          </div>
        </Panel>

        <Panel tone="muted">
          <h2 className="text-xl font-semibold tracking-tight text-ink">
            데이터 출처
          </h2>
          <div className="mt-4 space-y-3">
            {DATA_SOURCES.map((source) => (
              <div
                key={source.name}
                className="rounded-2xl border border-line/70 bg-white/75 p-4"
              >
                <p className="font-semibold text-ink">{source.name}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{source.desc}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
