"use client";

import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { LevelBadge } from "@/components/prediction/LevelBadge";
import { MarketSubnav } from "@/components/prediction/MarketSubnav";
import { topPredictors } from "@/lib/mock-data";

export default function TopPredictorsPage() {
  return (
    <div className="space-y-5">
      <MarketPageIntro
        actions={<MarketSubnav />}
        description="정확도, 선구안, 평판을 함께 반영해 시장에서 가장 영향력 있는 예측가를 보여줍니다."
        eyebrow="Predictor board"
        stats={[
          { label: "Signal leader", value: topPredictors[0].display, note: "현재 1위 예측가", accent: "text-[#3366ff]" },
          { label: "Best foresight", value: topPredictors[0].foresight?.toFixed(1) ?? "-", note: "선구안 점수", accent: "text-[#a855f7]" },
          { label: "Best accuracy", value: `${(topPredictors[0].accuracy * 100).toFixed(0)}%`, note: "최고 적중률", accent: "text-[#c84a31]" },
          { label: "Top streak", value: `${topPredictors[0].streak}`, note: "최장 연속 적중", accent: "text-[#f0b90b]" },
        ]}
        title="최고 예측가"
      />

      <div className="space-y-3">
        {topPredictors.map((user) => (
          <MarketPanel key={user.username} className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">#{user.rank}</p>
                <h2 className="mt-2 text-[22px] font-semibold leading-7 text-[#d1d4dc]">{user.display}</h2>
                <p className="mt-1 text-sm text-[#848e9c]">@{user.username}</p>
                <div className="mt-3">
                  <LevelBadge level={user.level} size="sm" titleEn={user.titleEn} titleKo={user.titleKo} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Reputation</p>
                  <p className="mt-2 text-xl font-semibold text-[#3366ff]">{user.reputation.toFixed(1)}</p>
                </div>
                <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Foresight</p>
                  <p className="mt-2 text-xl font-semibold text-[#a855f7]">{user.foresight?.toFixed(1)}</p>
                </div>
                <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Accuracy</p>
                  <p className="mt-2 text-xl font-semibold text-[#c84a31]">{(user.accuracy * 100).toFixed(0)}%</p>
                </div>
                <div className="rounded-[4px] border border-[#2b2f36] bg-[rgba(24,28,33,0.72)] px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.8px] text-[#848e9c]">Streak</p>
                  <p className="mt-2 text-xl font-semibold text-[#f0b90b]">{user.streak}</p>
                </div>
              </div>
            </div>
          </MarketPanel>
        ))}
      </div>
    </div>
  );
}
