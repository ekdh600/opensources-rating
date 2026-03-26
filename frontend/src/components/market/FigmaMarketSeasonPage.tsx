const seasonStats = [
  { label: "시즌", value: "2024 Q1", tone: "amber", icon: "👑" },
  { label: "참여자", value: "2,847명", tone: "blue", icon: "👥" },
  { label: "총 예측", value: "18,392", tone: "emerald", icon: "◉" },
  { label: "평균 정확도", value: "67.3%", tone: "red", icon: "↗" },
] as const;

const podium = [
  {
    rank: 2,
    name: "Code_Prophet",
    points: "2,720",
    winRate: "79.8%",
    hits: "198",
    tone: "silver",
  },
  {
    rank: 1,
    name: "OSS.Master.Kim",
    points: "2,850",
    winRate: "82.5%",
    hits: "234",
    tone: "gold",
  },
  {
    rank: 3,
    name: "DataDriven_Lee",
    points: "2,680",
    winRate: "81.2%",
    hits: "212",
    tone: "bronze",
  },
] as const;

const leaderboard = [
  { rank: 4, delta: "-1", name: "TechAnalyst_Par", icons: "🚀 🧠", points: "2,540", accuracy: "76.5%", trust: "72.8%", record: "143/187" },
  { rank: 5, delta: "+2", name: "ML.Enthusiast", icons: "🔥 💎", points: "2,480", accuracy: "78.3%", trust: "76.4%", record: "159/203" },
  { rank: 6, delta: "+4", name: "CloudNative_Cho", icons: "☁️ ✨", points: "2,420", accuracy: "75.8%", trust: "73.9%", record: "148/195" },
  { rank: 7, delta: "+6", name: "DevOps_Guru", icons: "🚀 🔥", points: "2,350", accuracy: "77.2%", trust: "74.5%", record: "137/178" },
  { rank: 8, delta: "-2", name: "Frontend_Wizard", icons: "✨", points: "2,280", accuracy: "74.5%", trust: "71.3%", record: "141/189" },
  { rank: 9, delta: "+1", name: "Backend_Expert", icons: "🛠️ 🔥", points: "2,210", accuracy: "76.1%", trust: "75.8%", record: "131/172" },
  { rank: 10, delta: "+2", name: "Data_Scientist_Jun", icons: "🧠", points: "2,150", accuracy: "73.8%", trust: "70.2%", record: "122/165" },
  { rank: 11, delta: "+5", name: "AI.Researcher", icons: "🚀", points: "2,080", accuracy: "75.3%", trust: "72.1%", record: "117/156" },
  { rank: 12, delta: "+3", name: "System_Architect", icons: "✨", points: "2,020", accuracy: "72.5%", trust: "69.8%", record: "107/148" },
  { rank: 13, delta: "+4", name: "Security_Pro", icons: "🔥", points: "1,950", accuracy: "74.2%", trust: "71.5%", record: "105/142" },
  { rank: 14, delta: "+3", name: "Mobile_Dev_Han", icons: "📱", points: "1,890", accuracy: "71.8%", trust: "68.9%", record: "97/135" },
  { rank: 15, delta: "+3", name: "Kubernetes_Fan", icons: "💎", points: "1,820", accuracy: "73.1%", trust: "70.4%", record: "94/128" },
] as const;

const rewards = [
  { title: "1위 보상", subtitle: "시즌 챔피언 뱃지", icon: "🏆", tone: "amber" },
  { title: "2-3위 보상", subtitle: "우수 예측가 뱃지", icon: "🥈🥉", tone: "slate" },
  { title: "TOP 10 보상", subtitle: "시즌 참가 뱃지", icon: "⭐", tone: "blue" },
] as const;

function statTone(tone: string) {
  if (tone === "amber") return "bg-[rgba(240,185,11,0.1)] text-[#f0b90b]";
  if (tone === "emerald") return "bg-[rgba(34,171,148,0.1)] text-[#22ab94]";
  if (tone === "red") return "bg-[rgba(200,74,49,0.1)] text-[#c84a31]";
  return "bg-[rgba(51,102,255,0.1)] text-[#3366ff]";
}

function podiumTone(tone: string) {
  if (tone === "gold") {
    return "border-[rgba(240,185,11,0.4)] bg-[linear-gradient(180deg,rgba(240,185,11,0.18)_0%,rgba(240,185,11,0.06)_100%)] shadow-[0px_10px_15px_0px_rgba(240,185,11,0.18)]";
  }
  if (tone === "bronze") {
    return "border-[rgba(200,124,67,0.35)] bg-[linear-gradient(180deg,rgba(200,124,67,0.16)_0%,rgba(200,124,67,0.05)_100%)]";
  }
  return "border-[rgba(132,142,156,0.4)] bg-[linear-gradient(180deg,rgba(132,142,156,0.15)_0%,rgba(132,142,156,0.05)_100%)]";
}

function deltaTone(delta: string) {
  return delta.startsWith("-") ? "text-[#1261c4]" : "text-[#c84a31]";
}

export function FigmaMarketSeasonPage() {
  return (
    <div className="space-y-5 font-figma-body text-[#d1d4dc]">
      <section className="relative left-1/2 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)]">
        <div className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 2xl:px-8">
          <div className="space-y-4 px-6">
            <div>
              <h1 className="text-[24px] font-bold leading-8">시즌 랭킹</h1>
              <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">2024 Q1 시즌의 예측 리더보드</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {seasonStats.map((stat) => (
                <article key={stat.label} className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-[13px] pb-px pt-[13px]">
                  <div className="flex items-center gap-[10px]">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[4px] text-[14px] ${statTone(stat.tone)}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{stat.label}</p>
                      <p className="mt-0.5 text-[16px] font-bold leading-6">{stat.value}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-[10px] pt-[10px] pb-[9px]">
              <div className="flex items-center justify-between text-[10px] leading-[15px]">
                <span className="text-[#848e9c]">시즌 진행률</span>
                <span className="font-semibold">9일 남음</span>
              </div>
              <div className="mt-[6px] h-[6px] rounded-full bg-[linear-gradient(90deg,#3366ff_0%,#22ab94_100%)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[10px] border border-[#2b2f36] bg-[#1e2026] px-[21px] pt-[21px] pb-[20px] shadow-[0px_20px_25px_0px_rgba(0,0,0,0.1),0px_8px_10px_0px_rgba(0,0,0,0.1)]">
        <div className="text-center">
          <h2 className="text-[16px] font-bold leading-6">🏆 Top Predictors</h2>
          <p className="mt-1 text-[9px] font-medium leading-[13.5px] text-[#848e9c]">HALL OF FAME</p>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {podium.map((item) => (
            <article
              key={item.rank}
              className={`rounded-[8px] border p-[10px] ${podiumTone(item.tone)} ${item.rank === 1 ? "lg:-mt-3" : "lg:mt-6"}`}
            >
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#3b4150] bg-[rgba(24,28,33,0.7)] text-[11px] text-[#848e9c]">
                  {item.rank}
                </div>
                <p className="mt-2 text-[11px] font-semibold leading-[16.5px]">{item.name}</p>
              </div>
              <div className="mt-3 flex items-start justify-between">
                <span className={`text-[28px] font-black leading-7 tracking-[-1.4px] ${item.rank === 1 ? "text-[#f0b90b]" : item.rank === 2 ? "text-[#c0c0c0]" : "text-[#c77b43]"}`}>
                  {item.rank}
                </span>
                <div className="text-right">
                  <p className="text-[28px] font-black leading-7 tracking-[-1.2px]">{item.points}</p>
                  <p className="text-[9px] leading-[13.5px] text-[#848e9c]">POINTS</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between rounded-[4px] bg-[rgba(43,47,54,0.35)] px-2 py-1 text-[9px] leading-[13.5px]">
                  <span className="text-[#848e9c]">승률</span>
                  <span className="font-semibold text-[#c84a31]">{item.winRate}</span>
                </div>
                <div className="flex items-center justify-between rounded-[4px] bg-[rgba(43,47,54,0.35)] px-2 py-1 text-[9px] leading-[13.5px]">
                  <span className="text-[#848e9c]">예측</span>
                  <span className="font-semibold">{item.hits}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
        <p className="text-[12px] font-semibold leading-4">내 순위</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[28px] font-bold leading-7 text-[#848e9c]">47</div>
            <div className="h-8 w-8 rounded-full bg-[rgba(43,47,54,0.8)]" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold leading-4">You</span>
                <span className="text-[9px] leading-[13.5px] text-[#f0b90b]">👑</span>
              </div>
              <p className="mt-1 text-[9px] leading-[13.5px] text-[#848e9c]">160 적중 · 연속 3승</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="text-right">
              <p className="text-[24px] font-bold leading-7">1,250</p>
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">포인트</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-semibold leading-6 text-[#c84a31]">62.5%</p>
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">승률</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-semibold leading-6 text-[#3366ff]">65.8%</p>
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">평균 신뢰도</p>
            </div>
            <div className="text-right">
              <p className="text-[16px] font-semibold leading-6">60/96</p>
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">예측/적중</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026]">
        <div className="flex items-center justify-between border-b border-[#2b2f36] px-4 py-3">
          <h2 className="text-[12px] font-semibold leading-4">전체 리더보드</h2>
          <span className="text-[9px] leading-[13.5px] text-[#848e9c]">TOP 15</span>
        </div>
        <div>
          {leaderboard.map((row) => (
            <div key={row.rank} className="grid grid-cols-[56px_minmax(0,1fr)_88px_88px_88px_88px] items-center gap-2 border-b border-[#2b2f36] px-4 py-3 last:border-b-0">
              <div>
                <p className="text-[28px] font-bold leading-7 text-[#9ca3af]">{row.rank}</p>
                <p className={`mt-1 text-[9px] leading-[13.5px] ${deltaTone(row.delta)}`}>{row.delta}</p>
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-4">{row.name} <span className="text-[10px] text-[#f0b90b]">{row.icons}</span></p>
                <p className="mt-1 text-[9px] leading-[13.5px] text-[#848e9c]">{160 + row.rank} 적중 · {row.delta.startsWith("+") ? row.delta : row.delta.replace("-", "+")} 순위</p>
              </div>
              <div className="text-right">
                <p className="text-[24px] font-bold leading-7">{row.points}</p>
                <p className="text-[9px] leading-[13.5px] text-[#848e9c]">포인트</p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-semibold leading-6 text-[#c84a31]">{row.accuracy}</p>
                <p className="text-[9px] leading-[13.5px] text-[#848e9c]">승률</p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-semibold leading-6 text-[#3366ff]">{row.trust}</p>
                <p className="text-[9px] leading-[13.5px] text-[#848e9c]">평균 신뢰도</p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-semibold leading-6">{row.record}</p>
                <p className="text-[9px] leading-[13.5px] text-[#848e9c]">예측/적중</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
        <h2 className="text-[14px] font-semibold leading-5">랭킹 정보</h2>
        <div className="mt-4 grid gap-3 xl:grid-cols-3">
          <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-3 py-3">
            <p className="text-[12px] font-semibold leading-4">총 포인트</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">예측 정확도와 신뢰도를 종합하여 계산된 포인트. 높을수록 순위가 올라갑니다.</p>
          </div>
          <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-3 py-3">
            <p className="text-[12px] font-semibold leading-4">승률</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">전체 예측 중 적중한 비율. 일관성 있는 예측 능력을 나타냅니다.</p>
          </div>
          <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-3 py-3">
            <p className="text-[12px] font-semibold leading-4">신뢰도</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">예측 시 설정한 평균 신뢰도. 자신감과 실제 성과의 균형을 보여줍니다.</p>
          </div>
        </div>
        <div className="mt-4 border-t border-[#2b2f36] pt-3 text-[10px] leading-[16.25px] text-[#848e9c]">
          💡 시즌이 종료되면 상위 랭커에게는 특별 뱃지와 보상이 제공됩니다. 단순히 많은 예측을 하는 것보다 정확도와 신뢰도를 높이는 것이 중요합니다.
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        {rewards.map((reward) => (
          <article
            key={reward.title}
            className={`rounded-[4px] border px-[17px] pt-[17px] pb-4 ${
              reward.tone === "amber"
                ? "border-[rgba(240,185,11,0.2)] bg-[linear-gradient(164deg,rgba(240,185,11,0.10)_0%,rgba(0,0,0,0)_100%)]"
                : reward.tone === "blue"
                  ? "border-[rgba(51,102,255,0.2)] bg-[linear-gradient(164deg,rgba(51,102,255,0.10)_0%,rgba(0,0,0,0)_100%)]"
                  : "border-[rgba(132,142,156,0.2)] bg-[linear-gradient(164deg,rgba(132,142,156,0.10)_0%,rgba(0,0,0,0)_100%)]"
            }`}
          >
            <p className="text-[14px] font-semibold leading-5">{reward.title}</p>
            <p className="mt-2 text-[12px] leading-4 text-[#848e9c]">{reward.subtitle}</p>
            <p className="mt-3 text-[24px] leading-8">{reward.icon}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
