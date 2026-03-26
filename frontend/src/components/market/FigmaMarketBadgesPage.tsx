type Accent = "blue" | "purple" | "amber" | "slate" | "emerald";

type BadgeCardItem = {
  icon: string;
  name: string;
  rarity: "일반" | "레어" | "에픽" | "전설";
  desc: string;
  requirement: string;
  progress: number;
  meta: string;
  accent: Accent;
  owned: boolean;
  progressText?: string;
  family: "온보딩" | "시장 감각" | "커뮤니티" | "카테고리 탐험" | "시즌 경쟁" | "레전드";
};

const badges: BadgeCardItem[] = [
  { icon: "🌱", name: "첫 로그인", rarity: "일반", desc: "OSS Market에 첫 발을 들였습니다", requirement: "첫 로그인 1회", progress: 100, meta: "획득 2026. 3. 1", accent: "slate", owned: true, family: "온보딩" },
  { icon: "🗣️", name: "첫 댓글", rarity: "일반", desc: "종목 커뮤니티에 첫 댓글을 남겼습니다", requirement: "댓글 1개 작성", progress: 100, meta: "획득 2026. 3. 2", accent: "blue", owned: true, family: "온보딩" },
  { icon: "📦", name: "첫 포트폴리오", rarity: "일반", desc: "첫 종목을 담아 포트폴리오를 만들었습니다", requirement: "첫 매수 1회", progress: 100, meta: "획득 2026. 3. 2", accent: "blue", owned: true, family: "온보딩" },
  { icon: "🧭", name: "첫 시즌 참가", rarity: "일반", desc: "시즌 경쟁에 처음으로 참여했습니다", requirement: "시즌 1회 참가", progress: 100, meta: "획득 2026. 3. 3", accent: "slate", owned: true, family: "온보딩" },
  { icon: "📝", name: "브리핑 독파", rarity: "레어", desc: "시장 분석과 방법론 페이지를 꾸준히 읽었습니다", requirement: "분석/계산 방식 10회 열람", progress: 70, meta: "진행률", accent: "blue", owned: false, progressText: "7/10", family: "온보딩" },

  { icon: "🚀", name: "모멘텀 서퍼", rarity: "레어", desc: "급등 종목의 흐름을 빠르게 포착합니다", requirement: "상승률 상위 종목 적중 10회", progress: 100, meta: "획득 2026. 3. 8", accent: "blue", owned: true, family: "시장 감각" },
  { icon: "🪙", name: "밸류 헌터", rarity: "레어", desc: "저평가 종목을 꾸준히 찾아냅니다", requirement: "저평가 예측 적중 8회", progress: 63, meta: "진행률", accent: "blue", owned: false, progressText: "5/8", family: "시장 감각" },
  { icon: "🌊", name: "로테이션 리더", rarity: "에픽", desc: "카테고리 순환매 흐름을 가장 먼저 읽습니다", requirement: "강세 전환 카테고리 선제 포착 5회", progress: 40, meta: "진행률", accent: "purple", owned: false, progressText: "2/5", family: "시장 감각" },
  { icon: "🧊", name: "칼날 줍는 자", rarity: "에픽", desc: "하락 종목의 반등 타이밍을 정확히 잡아냅니다", requirement: "급락 종목 반등 적중 6회", progress: 50, meta: "진행률", accent: "purple", owned: false, progressText: "3/6", family: "시장 감각" },
  { icon: "🔄", name: "역발상 펀치", rarity: "에픽", desc: "대중과 다른 시선으로 시장을 이깁니다", requirement: "컨센서스 반대 포지션 적중 12회", progress: 100, meta: "획득 2026. 3. 12", accent: "purple", owned: true, family: "시장 감각" },
  { icon: "🦅", name: "시그널 스나이퍼", rarity: "전설", desc: "짧은 순간의 결정적 신호를 놓치지 않습니다", requirement: "상위 1% 신호 적중 10회", progress: 20, meta: "진행률", accent: "amber", owned: false, progressText: "2/10", family: "시장 감각" },

  { icon: "🔥", name: "핫테이커", rarity: "레어", desc: "추천을 부르는 인상적인 한마디를 남깁니다", requirement: "댓글 추천 50회 획득", progress: 100, meta: "획득 2026. 3. 9", accent: "blue", owned: true, family: "커뮤니티" },
  { icon: "🧵", name: "스레드 메이커", rarity: "레어", desc: "토론이 이어지는 댓글 스레드를 만듭니다", requirement: "답글 20회 이상 받기", progress: 80, meta: "진행률", accent: "blue", owned: false, progressText: "16/20", family: "커뮤니티" },
  { icon: "📚", name: "리서치 큐레이터", rarity: "에픽", desc: "뉴스와 근거를 함께 엮어 토론을 풍성하게 만듭니다", requirement: "출처 포함 댓글 15회", progress: 53, meta: "진행률", accent: "purple", owned: false, progressText: "8/15", family: "커뮤니티" },
  { icon: "🫶", name: "추천 자석", rarity: "에픽", desc: "꾸준히 좋은 댓글로 공감을 얻습니다", requirement: "추천 200회 획득", progress: 61, meta: "진행률", accent: "purple", owned: false, progressText: "122/200", family: "커뮤니티" },
  { icon: "🌉", name: "브릿지 빌더", rarity: "에픽", desc: "서로 다른 의견을 연결해 합의를 만듭니다", requirement: "상반된 스레드 모두에서 추천 받기 8회", progress: 25, meta: "진행률", accent: "purple", owned: false, progressText: "2/8", family: "커뮤니티" },
  { icon: "📣", name: "커뮤니티 앵커", rarity: "전설", desc: "종목 커뮤니티의 중심으로 자리잡았습니다", requirement: "월간 커뮤니티 TOP 3 진입 3회", progress: 33, meta: "진행률", accent: "amber", owned: false, progressText: "1/3", family: "커뮤니티" },

  { icon: "☸️", name: "쿠버네티스 레인저", rarity: "레어", desc: "쿠버네티스 흐름을 가장 먼저 읽습니다", requirement: "쿠버네티스 관련 예측 25회", progress: 100, meta: "획득 2026. 3. 11", accent: "blue", owned: true, family: "카테고리 탐험" },
  { icon: "📡", name: "옵저버빌리티 와처", rarity: "레어", desc: "관측성 생태계의 변화를 놓치지 않습니다", requirement: "관측성 종목 20회 분석", progress: 75, meta: "진행률", accent: "blue", owned: false, progressText: "15/20", family: "카테고리 탐험" },
  { icon: "🛡️", name: "보안 센티넬", rarity: "레어", desc: "보안 관련 종목의 리스크와 반등을 잡아냅니다", requirement: "보안 카테고리 적중 10회", progress: 30, meta: "진행률", accent: "blue", owned: false, progressText: "3/10", family: "카테고리 탐험" },
  { icon: "🗃️", name: "데이터 마이너", rarity: "레어", desc: "데이터베이스와 스트리밍 카테고리에 강합니다", requirement: "데이터 카테고리 예측 18회", progress: 44, meta: "진행률", accent: "blue", owned: false, progressText: "8/18", family: "카테고리 탐험" },
  { icon: "🛰️", name: "플랫폼 노마드", rarity: "에픽", desc: "다양한 카테고리를 넘나드는 넓은 시야를 가졌습니다", requirement: "6개 카테고리에서 적중 달성", progress: 67, meta: "진행률", accent: "purple", owned: false, progressText: "4/6", family: "카테고리 탐험" },
  { icon: "🧪", name: "GitOps 파일럿", rarity: "에픽", desc: "배포 자동화와 운영 실험 흐름을 읽습니다", requirement: "GitOps 종목 상위 적중 7회", progress: 100, meta: "획득 2026. 3. 14", accent: "purple", owned: true, family: "카테고리 탐험" },

  { icon: "🥉", name: "TOP 100", rarity: "레어", desc: "시즌 종료 시 TOP 100 안에 들었습니다", requirement: "시즌 TOP 100", progress: 100, meta: "획득 2026. 3. 15", accent: "blue", owned: true, family: "시즌 경쟁" },
  { icon: "🥈", name: "TOP 10", rarity: "에픽", desc: "시즌 종료 시 TOP 10에 진입했습니다", requirement: "시즌 TOP 10", progress: 0, meta: "진행률", accent: "purple", owned: false, progressText: "0/1", family: "시즌 경쟁" },
  { icon: "🥇", name: "포디움 피니셔", rarity: "에픽", desc: "시즌 3위 안에 들어 마감합니다", requirement: "시즌 TOP 3", progress: 0, meta: "진행률", accent: "purple", owned: false, progressText: "0/1", family: "시즌 경쟁" },
  { icon: "🏁", name: "풀 시즌 완주", rarity: "레어", desc: "시즌 내내 꾸준히 참여했습니다", requirement: "90일 시즌 연속 참여", progress: 89, meta: "진행률", accent: "blue", owned: false, progressText: "80/90", family: "시즌 경쟁" },
  { icon: "🏆", name: "시즌 챔피언", rarity: "전설", desc: "시즌 정상에 올라 최고의 예측가가 됩니다", requirement: "시즌 1위", progress: 0, meta: "전설", accent: "amber", owned: false, progressText: "0/1", family: "시즌 경쟁" },
  { icon: "🔁", name: "백투백", rarity: "전설", desc: "두 시즌 연속 상위권을 지켜냅니다", requirement: "연속 시즌 TOP 10", progress: 0, meta: "진행률", accent: "amber", owned: false, progressText: "0/2", family: "시즌 경쟁" },

  { icon: "🔮", name: "시그널 오라클", rarity: "전설", desc: "다른 이들이 보기 전 신호를 먼저 읽어냅니다", requirement: "조기 신호 적중 20회", progress: 45, meta: "진행률", accent: "amber", owned: false, progressText: "9/20", family: "레전드" },
  { icon: "🦢", name: "블랙스완 헌터", rarity: "전설", desc: "예상 밖의 급변 구간을 정확히 잡아냅니다", requirement: "변동성 이벤트 적중 12회", progress: 17, meta: "진행률", accent: "amber", owned: false, progressText: "2/12", family: "레전드" },
  { icon: "📐", name: "오픈소스 퀀트", rarity: "전설", desc: "숫자와 정성 지표를 함께 읽는 희귀한 플레이어입니다", requirement: "복합 지표 적중률 85% 이상", progress: 72, meta: "진행률", accent: "amber", owned: false, progressText: "72/85", family: "레전드" },
  { icon: "🧠", name: "논문급 분석가", rarity: "전설", desc: "근거와 논리를 갖춘 깊은 분석으로 유명합니다", requirement: "장문 분석 추천 300회", progress: 41, meta: "진행률", accent: "amber", owned: false, progressText: "123/300", family: "레전드" },
  { icon: "🌌", name: "메타 리더", rarity: "전설", desc: "시장, 커뮤니티, 시즌을 모두 아우르는 상징적 존재입니다", requirement: "에픽 뱃지 10개 보유", progress: 20, meta: "진행률", accent: "amber", owned: false, progressText: "2/10", family: "레전드" },
  { icon: "👑", name: "시장 메이커", rarity: "전설", desc: "시장 분위기와 커뮤니티 논의를 동시에 이끄는 플레이어입니다", requirement: "포인트, 추천, 시즌 성적 동시 상위권", progress: 12, meta: "진행률", accent: "amber", owned: false, progressText: "12/100", family: "레전드" },
];

const familyDescriptions: Record<BadgeCardItem["family"], string> = {
  온보딩: "처음 들어온 유저가 빠르게 적응하고 참여 흐름에 올라타도록 돕는 시작 뱃지입니다.",
  "시장 감각": "상승, 하락, 순환매, 역발상처럼 실제 시장 감각을 게임화한 코어 뱃지입니다.",
  커뮤니티: "트레이딩을 가장한 커뮤니티 서비스라는 정체성을 강화하는 토론·추천 중심 뱃지입니다.",
  "카테고리 탐험": "특정 기술 영역에 대한 관심과 이해를 보여주는 탐험형 뱃지입니다.",
  "시즌 경쟁": "랭킹과 시즌 완주, 장기 성과를 드러내는 경쟁형 뱃지입니다.",
  레전드: "최상위 실력과 존재감을 상징하는 상징성 높은 희귀 뱃지입니다.",
};

const rarityOrder = ["일반", "레어", "에픽", "전설"] as const;
const familyOrder = ["온보딩", "시장 감각", "커뮤니티", "카테고리 탐험", "시즌 경쟁", "레전드"] as const;

function toneClass(tone: Accent) {
  if (tone === "emerald") return "bg-[rgba(34,171,148,0.1)] text-[#22ab94]";
  if (tone === "amber") return "bg-[rgba(240,185,11,0.1)] text-[#f0b90b]";
  if (tone === "purple") return "bg-[rgba(168,85,247,0.1)] text-[#a855f7]";
  if (tone === "slate") return "bg-[rgba(132,142,156,0.1)] text-[#848e9c]";
  return "bg-[rgba(51,102,255,0.1)] text-[#3366ff]";
}

function rarityTone(tone: Accent) {
  if (tone === "amber") return "border-[rgba(240,185,11,0.24)] text-[#f0b90b]";
  if (tone === "purple") return "border-[rgba(168,85,247,0.24)] text-[#a855f7]";
  if (tone === "slate") return "border-[rgba(132,142,156,0.24)] text-[#848e9c]";
  if (tone === "emerald") return "border-[rgba(34,171,148,0.24)] text-[#22ab94]";
  return "border-[rgba(51,102,255,0.24)] text-[#3366ff]";
}

function familyTone(family: BadgeCardItem["family"]) {
  if (family === "레전드") return "amber";
  if (family === "커뮤니티") return "emerald";
  if (family === "시장 감각" || family === "시즌 경쟁") return "purple";
  if (family === "온보딩") return "slate";
  return "blue";
}

export function FigmaMarketBadgesPage() {
  const totalCount = badges.length;
  const ownedCount = badges.filter((badge) => badge.owned).length;
  const lockedCount = totalCount - ownedCount;
  const completionRate = ((ownedCount / totalCount) * 100).toFixed(1);

  const badgeStats = [
    { label: "전체 뱃지", value: `${totalCount}개`, tone: "blue" as Accent, icon: "◉" },
    { label: "획득한 뱃지", value: `${ownedCount}개`, tone: "emerald" as Accent, icon: "🔓" },
    { label: "미획득 뱃지", value: `${lockedCount}개`, tone: "slate" as Accent, icon: "🔒" },
    { label: "달성률", value: `${completionRate}%`, tone: "amber" as Accent, icon: "✦" },
  ];

  const raritySummary = rarityOrder.map((rarity) => {
    const items = badges.filter((badge) => badge.rarity === rarity);
    const owned = items.filter((badge) => badge.owned).length;
    return {
      label: rarity,
      value: `${items.length}`,
      note: `획득: ${owned}`,
      tone:
        rarity === "전설" ? "amber" : rarity === "에픽" ? "purple" : rarity === "레어" ? "blue" : "slate",
    };
  });

  const featuredBadges = badges.filter((badge) => badge.rarity === "전설" || badge.rarity === "에픽").slice(0, 8);
  const badgeGroups = familyOrder.map((family) => ({
    family,
    items: badges.filter((badge) => badge.family === family),
  }));

  return (
    <div className="space-y-6 font-figma-body text-[#d1d4dc]">
      <section className="relative left-1/2 -mt-5 w-screen -translate-x-1/2 border-b border-[#2b2f36] bg-[rgba(30,32,38,0.3)]">
        <div className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 2xl:px-8">
          <div className="space-y-5 px-6">
            <div>
              <h1 className="text-[24px] font-bold leading-8">뱃지 컬렉션</h1>
              <p className="mt-1 text-[12px] leading-4 text-[#848e9c]">시장 감각, 커뮤니티 기여, 시즌 경쟁을 모두 담은 확장형 뱃지 컬렉션입니다.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {badgeStats.map((stat) => (
                <article key={stat.label} className="rounded-[8px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-[6px] text-[14px] ${toneClass(stat.tone)}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] text-[#848e9c]">{stat.label}</p>
                      <p className="mt-1 text-[18px] font-bold">{stat.value}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-[8px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-[#848e9c]">컬렉션 진행률</span>
                <span className="font-semibold">{ownedCount} / {totalCount}</span>
              </div>
              <div className="mt-2 h-[8px] overflow-hidden rounded-full bg-[#2b2f36]">
                <div className="h-[8px] rounded-full bg-[linear-gradient(90deg,#3366ff_0%,#22ab94_50%,#f0b90b_100%)]" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[16px] font-semibold leading-6">테마별 컬렉션</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {badgeGroups.map((group) => (
            <article key={group.family} className="rounded-[8px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[14px] font-semibold">{group.family}</h3>
                  <p className="mt-2 text-[11px] leading-5 text-[#848e9c]">{familyDescriptions[group.family]}</p>
                </div>
                <span className={`inline-flex rounded-[999px] px-2.5 py-1 text-[10px] font-semibold ${toneClass(familyTone(group.family))}`}>
                  {group.items.length}개
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold leading-5">등급별 분포</h2>
        <div className="grid gap-3 xl:grid-cols-4">
          {raritySummary.map((item) => (
            <article
              key={item.label}
              className={`rounded-[8px] border px-4 py-4 ${
                item.tone === "amber"
                  ? "border-[rgba(240,185,11,0.24)] bg-[rgba(240,185,11,0.06)]"
                  : item.tone === "purple"
                    ? "border-[rgba(168,85,247,0.24)] bg-[rgba(168,85,247,0.06)]"
                    : item.tone === "blue"
                      ? "border-[rgba(51,102,255,0.24)] bg-[rgba(51,102,255,0.06)]"
                      : "border-[rgba(132,142,156,0.24)] bg-[rgba(43,47,54,0.28)]"
              }`}
            >
              <p className="text-[10px] text-[#848e9c]">{item.label}</p>
              <p className="mt-2 text-[24px] font-bold leading-7">{item.value}</p>
              <p className="mt-1 text-[10px] text-[#848e9c]">{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-[14px] font-semibold leading-5">주목할 뱃지</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {featuredBadges.map((badge) => (
            <article key={badge.name} className="rounded-[10px] border border-[#2b2f36] bg-[#20242d] px-4 py-4">
              <div className="flex items-start justify-between">
                <div className="text-[34px] leading-none">{badge.icon}</div>
                <span className={`inline-flex rounded-[999px] border px-2 py-[3px] text-[9px] font-semibold ${rarityTone(badge.accent)}`}>
                  {badge.rarity}
                </span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold">{badge.name}</h3>
              <p className="mt-2 text-[11px] leading-5 text-[#9aa4b2]">{badge.desc}</p>
              <div className="mt-4 rounded-[6px] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[10px] text-[#c7d0da]">{badge.requirement}</div>
            </article>
          ))}
        </div>
      </section>

      {badgeGroups.map((group) => (
        <section key={group.family} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-[14px] font-semibold leading-5">{group.family}</h2>
              <p className="mt-1 text-[11px] text-[#848e9c]">{familyDescriptions[group.family]}</p>
            </div>
            <span className="text-[10px] text-[#848e9c]">{group.items.length}개</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {group.items.map((badge) => (
              <article
                key={badge.name}
                className={`rounded-[8px] border px-4 pb-3 pt-4 ${
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
                                : badge.accent === "emerald"
                                  ? "bg-[#22ab94]"
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
      ))}

      <section className="rounded-[8px] border border-[#2b2f36] bg-[#1e2026] px-4 py-4">
        <h2 className="text-[14px] font-semibold leading-5">뱃지 설계 방향</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="text-[12px] font-semibold leading-4">시장 감각을 게임화</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">상승, 하락, 순환매, 반등, 역발상처럼 실제 시장 해석 감각을 뱃지로 치환해 플레이 스타일이 드러나게 했습니다.</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-4">커뮤니티 기여 반영</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">이 서비스의 핵심이 토론과 추천 흐름이라는 점을 반영해 댓글, 답글, 추천, 출처 기반 리서치를 별도 뱃지 축으로 확장했습니다.</p>
          </div>
          <div>
            <p className="text-[12px] font-semibold leading-4">카테고리 전문성 시각화</p>
            <p className="mt-2 text-[10px] leading-[16.25px] text-[#848e9c]">쿠버네티스, 관측성, 보안, 데이터, GitOps처럼 기술 축에 따라 전문성이 드러나도록 탐험형 뱃지를 추가했습니다.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
