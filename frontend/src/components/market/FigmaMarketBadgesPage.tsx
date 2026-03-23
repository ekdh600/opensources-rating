const badgeStats = [
  { label: "전체 뱃지", value: "21개", tone: "blue", icon: "◉" },
  { label: "획득한 뱃지", value: "10개", tone: "emerald", icon: "🔓" },
  { label: "미획득 뱃지", value: "11개", tone: "slate", icon: "🔒" },
  { label: "달성률", value: "47.6%", tone: "red", icon: "◌" },
] as const;

const filterChips = ["전체", "업적", "마일스톤", "특별", "시즌"] as const;
const activeFilter = "전체";
const activeCollectionFilter = "보유 뱃지";

const raritySummary = [
  { label: "일반", value: "4", note: "획득: 4", tone: "slate" },
  { label: "레어", value: "9", note: "획득: 5", tone: "blue" },
  { label: "에픽", value: "5", note: "획득: 1", tone: "purple" },
  { label: "전설", value: "3", note: "획득: 0", tone: "amber" },
] as const;

type BadgeCardItem = {
  icon: string;
  name: string;
  rarity: string;
  desc: string;
  requirement: string;
  progress: number;
  meta: string;
  accent: "blue" | "purple" | "amber" | "slate";
  owned: boolean;
  progressText?: string;
};

const badges: BadgeCardItem[] = [
  { icon: "🎯", name: "첫 예측", rarity: "일반", desc: "첫 번째 예측을 완료했습니다", requirement: "예측 1회 달성", progress: 100, meta: "획득 2026. 3. 1", accent: "blue", owned: true },
  { icon: "💯", name: "원백러 주", rarity: "에픽", desc: "원백 포인트 획득을 달성했습니다", requirement: "포인트 100 달성", progress: 100, meta: "획득 2026. 3. 5", accent: "purple", owned: true },
  { icon: "🔥", name: "연승 마스터", rarity: "레어", desc: "10회 연속 예측에 성공했습니다", requirement: "연승 10회", progress: 100, meta: "획득 2026. 3. 10", accent: "blue", owned: true },
  { icon: "💎", name: "확신의 예측가", rarity: "전설", desc: "90% 이상 신뢰도로 10회 적중", requirement: "고신뢰 10회", progress: 37, meta: "진행률", accent: "amber", owned: false, progressText: "370/1000" },
  { icon: "🌄", name: "얼리버드", rarity: "레어", desc: "신규 프로젝트 초기 예측에 적중했습니다", requirement: "신규 프로젝트 예측 5회", progress: 100, meta: "획득 2026. 3. 1", accent: "blue", owned: true },
  { icon: "🎭", name: "예측가 루키", rarity: "에픽", desc: "다양한 카테고리의 예측을 골고루 수행", requirement: "3개 카테고리 달성", progress: 52, meta: "진행률", accent: "purple", owned: false, progressText: "1/2" },
  { icon: "📊", name: "예측 입문자", rarity: "레어", desc: "10개의 예측을 완료했습니다", requirement: "누적 예측 10회", progress: 100, meta: "획득 2026. 3. 2", accent: "blue", owned: true },
  { icon: "📈", name: "예측 전문가", rarity: "레어", desc: "총 50회 예측을 완료했습니다", requirement: "누적 예측 50회", progress: 100, meta: "획득 2026. 3. 2", accent: "blue", owned: true },
  { icon: "⛏️", name: "예측 마스터", rarity: "에픽", desc: "총 100회 예측을 완료했습니다", requirement: "누적 예측 100회", progress: 59, meta: "진행률", accent: "purple", owned: false, progressText: "59/100" },
  { icon: "💰", name: "원 포인트", rarity: "레어", desc: "총 포인트 1,000점을 달성했습니다", requirement: "누적 포인트 1,000점", progress: 100, meta: "획득 2026. 3. 10", accent: "blue", owned: true },
  { icon: "💎", name: "포인트 부자", rarity: "전설", desc: "총 포인트 5,000점을 달성했습니다", requirement: "누적 포인트 5,000점", progress: 55, meta: "진행률", accent: "amber", owned: false, progressText: "5500/10000" },
  { icon: "🥇", name: "금손을 달성", rarity: "에픽", desc: "승률 80% 이상을 달성했습니다", requirement: "승률 80%", progress: 68, meta: "진행률", accent: "purple", owned: false, progressText: "68/80" },
  { icon: "☁️", name: "클라우드 네이티브 전문가", rarity: "레어", desc: "Cloud Native 카테고리 20회 이상 예측", requirement: "Cloud Native 카테고리 20회", progress: 100, meta: "획득 2026. 3. 9", accent: "blue", owned: true },
  { icon: "🤖", name: "AI/ML 구루", rarity: "레어", desc: "Machine Learning 카테고리 15회 예측", requirement: "ML 카테고리 15회", progress: 8, meta: "진행률", accent: "blue", owned: false, progressText: "8/15" },
  { icon: "🎨", name: "프론트엔드 마스터", rarity: "레어", desc: "Frontend 카테고리 20회 예측", requirement: "Frontend 카테고리 20회", progress: 12, meta: "진행률", accent: "blue", owned: false, progressText: "12/20" },
  { icon: "🍀", name: "행운의 세븐", rarity: "일반", desc: "7일 연속 접속에 성공했습니다", requirement: "7일 연속 접속", progress: 100, meta: "획득 2026. 3. 8", accent: "slate", owned: true },
  { icon: "🦉", name: "올빼미 예측가", rarity: "레어", desc: "야간 시간대 예측 10회를 달성", requirement: "새벽 예측 10회", progress: 57, meta: "진행률", accent: "blue", owned: false, progressText: "5/10" },
  { icon: "🌟", name: "2024 Q1 참가", rarity: "일반", desc: "2024 Q1 시즌에 참가했습니다", requirement: "2024 Q1 시즌 참가", progress: 100, meta: "획득 2026. 3. 1", accent: "slate", owned: true },
  { icon: "🥉", name: "TOP 100", rarity: "레어", desc: "시즌 종료 시 TOP 100에 진입", requirement: "시즌 TOP 100 달성", progress: 0, meta: "진행률", accent: "blue", owned: false, progressText: "0/1" },
  { icon: "🥈", name: "TOP 10", rarity: "에픽", desc: "시즌 종료 시 TOP 10에 진입", requirement: "시즌 TOP 10 달성", progress: 0, meta: "진행률", accent: "purple", owned: false, progressText: "0/1" },
  { icon: "🏆", name: "시즌 챔피언", rarity: "전설", desc: "시즌 1위를 달성했습니다", requirement: "시즌 1위 달성", progress: 0, meta: "전설", accent: "amber", owned: false, progressText: "0/1" },
] as const;

function toneClass(tone: string) {
  if (tone === "emerald") return "bg-[rgba(34,171,148,0.1)] text-[#22ab94]";
  if (tone === "red") return "bg-[rgba(200,74,49,0.1)] text-[#c84a31]";
  if (tone === "slate") return "bg-[rgba(132,142,156,0.1)] text-[#848e9c]";
  return "bg-[rgba(51,102,255,0.1)] text-[#3366ff]";
}

function rarityTone(tone: string) {
  if (tone === "amber") return "border-[rgba(240,185,11,0.24)] text-[#f0b90b]";
  if (tone === "purple") return "border-[rgba(168,85,247,0.24)] text-[#a855f7]";
  if (tone === "slate") return "border-[rgba(132,142,156,0.24)] text-[#848e9c]";
  return "border-[rgba(51,102,255,0.24)] text-[#3366ff]";
}

export function FigmaMarketBadgesPage() {
  return (
    <div className="space-y-5 font-figma-body text-[#d1d4dc]">
      <section className="relative left-1/2 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)]">
        <div className="mx-auto max-w-[1232px] px-4 py-5 sm:px-6 xl:px-0">
          <div className="space-y-4 px-6">
            <div>
              <h1 className="text-[24px] font-bold leading-8">뱃지 컬렉션</h1>
              <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">업적을 달성하고 특별한 뱃지를 수집하세요</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {badgeStats.map((stat) => (
                <article key={stat.label} className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-[13px] pb-px pt-[13px]">
                  <div className="flex items-center gap-[10px]">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-[4px] text-[14px] ${toneClass(stat.tone)}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{stat.label}</p>
                      <p className={`mt-0.5 text-[16px] font-bold leading-6 ${stat.tone === "emerald" ? "text-[#22ab94]" : ""}`}>{stat.value}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-[10px] pt-[10px] pb-[9px]">
              <div className="flex items-center justify-between text-[10px] leading-[15px]">
                <span className="text-[#848e9c]">컬렉션 진행률</span>
                <span className="font-semibold">10 / 21</span>
              </div>
              <div className="mt-[6px] h-[6px] overflow-hidden rounded-full bg-[#2b2f36]">
                <div className="h-[6px] w-[47.6%] rounded-full bg-[linear-gradient(90deg,#3366ff_0%,#22ab94_100%)]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold leading-6">필터</h2>
          <button className="text-[10px] leading-[15px] text-[#848e9c]" type="button">초기화</button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip}
              className={`inline-flex h-[23px] items-center rounded-[4px] px-[10px] text-[10px] font-medium leading-[15px] ${
                chip === activeFilter ? "bg-[#3366ff] text-white" : "text-[#848e9c]"
              }`}
              type="button"
            >
              {chip}
            </button>
          ))}
          <button className="inline-flex h-[23px] items-center rounded-[4px] bg-[#3366ff] px-[10px] text-[10px] font-medium leading-[15px] text-white" type="button">
            {activeCollectionFilter}
          </button>
          <button className="inline-flex h-[23px] items-center rounded-[4px] px-[10px] text-[10px] leading-[15px] text-[#848e9c]" type="button">
            🔒 획득순 정렬
          </button>
          <span className="ml-auto text-[10px] leading-[15px] text-[#848e9c]">조회 21개</span>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold leading-5">등급별 분포</h2>
        <div className="grid gap-3 xl:grid-cols-4">
          {raritySummary.map((item) => (
            <article
              key={item.label}
              className={`rounded-[4px] border px-4 py-4 ${
                item.tone === "amber"
                  ? "border-[rgba(240,185,11,0.24)] bg-[rgba(240,185,11,0.06)]"
                  : item.tone === "purple"
                    ? "border-[rgba(168,85,247,0.24)] bg-[rgba(168,85,247,0.06)]"
                    : item.tone === "blue"
                      ? "border-[rgba(51,102,255,0.24)] bg-[rgba(51,102,255,0.06)]"
                      : "border-[rgba(132,142,156,0.24)] bg-[rgba(43,47,54,0.28)]"
              }`}
            >
              <p className="text-[9px] leading-[13.5px] text-[#848e9c]">{item.label}</p>
              <p className="mt-2 text-[24px] font-bold leading-7">{item.value}</p>
              <p className="mt-1 text-[9px] leading-[13.5px] text-[#848e9c]">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold leading-5">뱃지 컬렉션(21개)</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {badges.map((badge) => (
            <article
              key={badge.name}
              className={`rounded-[8px] border px-4 pt-4 pb-3 ${
                badge.owned ? "border-[#2b2f36] bg-[#20242d]" : "border-[#2b2f36] bg-[#1e2026]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-[30px] leading-none opacity-95">{badge.icon}</div>
                <div className="flex items-center gap-1">
                  {badge.owned ? <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#22ab94] text-[9px] text-white">✓</span> : null}
                  {!badge.owned ? <span className="text-[11px] text-[#6b7280]">🔒</span> : null}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-[14px] font-semibold leading-5">{badge.name}</h3>
                <span className={`mt-2 inline-flex rounded-[4px] border px-2 py-[3px] text-[9px] font-semibold leading-[13.5px] ${rarityTone(badge.accent)}`}>
                  {badge.rarity}
                </span>
                <p className="mt-3 text-[10px] leading-[16.25px] text-[#848e9c]">{badge.desc}</p>
              </div>
              <div className="mt-4 space-y-2">
                <div className="rounded-[4px] bg-[rgba(43,47,54,0.2)] px-2 py-1.5 text-[9px] leading-[13.5px] text-[#848e9c]">
                  {badge.requirement}
                </div>
                <div className="text-[9px] leading-[13.5px] text-[#848e9c]">{badge.meta}</div>
                <div className="space-y-1">
                  <div className="h-[3px] overflow-hidden rounded-[999px] bg-[rgba(43,47,54,0.6)]">
                    <div
                      className={`h-[3px] ${
                        badge.accent === "amber"
                          ? "bg-[#f0b90b]"
                          : badge.accent === "purple"
                            ? "bg-[#a855f7]"
                            : badge.accent === "slate"
                              ? "bg-[#848e9c]"
                              : "bg-[#3366ff]"
                      }`}
                      style={{ width: `${badge.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] leading-[13.5px] text-[#848e9c]">
                    <span>{badge.owned ? "완료" : "진행률"}</span>
                    <span>{badge.progressText ?? "1/1"}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[4px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
        <h2 className="text-[14px] font-semibold leading-5">뱃지 획득 가이드</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-[12px] font-semibold leading-4">🎯 업적 뱃지</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">특정 조건을 달성하면 즉시 획득할 수 있는 뱃지입니다. 연속 적중, 높은 신뢰도 유지 등 다양한 도전 과제가 있습니다.</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-4">🏁 마일스톤 뱃지</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">누적 기록으로 획득하는 뱃지입니다. 예측 횟수, 포인트, 승률 등 장기적인 목표를 달성하면 획득할 수 있습니다.</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-4">⭐ 특별 뱃지</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">특정 카테고리나 특별한 행동으로 획득하는 뱃지입니다. 각 기술 분야의 전문성이나 독특한 플레이 스타일을 인정받을 수 있습니다.</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-4">🏆 시즌 뱃지</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">시즌 종료 시 성적에 따라 획득하는 뱃지입니다. 시즌 랭킹 상위권에 들면 희귀한 뱃지를 획득할 수 있습니다.</p>
          </div>
        </div>
        <div className="mt-4 border-t border-[#2b2f36] pt-3 text-[10px] leading-[16.25px] text-[#848e9c]">
          💡 뱃지는 여러분의 예측 실력과 플랫폼 참여도를 보여주는 지표입니다. 다양한 카테고리에 도전하고, 일관성 있게 예측하면 더 많은 뱃지를 획득할 수 있습니다. 전설 등급 뱃지는 최상위 플레이어만 획득할 수 있는 특별한 성취입니다.
        </div>
      </section>
    </div>
  );
}
