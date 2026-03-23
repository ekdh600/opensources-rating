"use client";

import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { cncfLeaderboard } from "@/lib/mock-data";

export default function CNCFPage() {
  return (
    <div className="page-shell space-y-8 py-8">
      <PageHeader
        eyebrow="CNCF board"
        title="CNCF 리더보드"
        description="CNCF 프로젝트에는 DevStats 기반 활동 신호를 함께 반영해 실행력과 건강도를 더 깊게 읽습니다."
        stats={[
          { label: "Projects", value: "46", note: "Tracked in the CNCF universe" },
          { label: "Graduated", value: "23", note: "Highest maturity tier" },
          { label: "Snapshot", value: "2026-03-19", note: "Daily refresh" },
        ]}
      />

      <Panel tone="muted">
        <div className="flex flex-wrap gap-2">
          {["All", "Graduated", "Incubating", "Sandbox"].map((stage, index) => (
            <button
              key={stage}
              className={`rounded-pill border px-4 py-2 text-sm font-medium transition ${
                index === 0
                  ? "border-brand/20 bg-brand-soft text-brand-strong"
                  : "border-line bg-white/70 text-muted hover:border-brand/20 hover:bg-brand-soft/60 hover:text-brand-strong"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </Panel>

      <Panel className="overflow-hidden">
        <LeaderboardTable entries={cncfLeaderboard} />
      </Panel>
    </div>
  );
}
