import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type AxisKey = "attention" | "execution" | "health" | "trust";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(
  num: number,
  locale: "ko-KR" | "en-US" = "ko-KR"
): string {
  return new Intl.NumberFormat(locale, {
    notation: num >= 1000 ? "compact" : "standard",
    maximumFractionDigits: num >= 1000 ? 1 : 0,
  }).format(num);
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}

export function formatPercent(
  value: number,
  locale: "ko-KR" | "en-US" = "ko-KR",
  digits = 1
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatDateLabel(
  value: string,
  locale: "ko-KR" | "en-US" = "ko-KR"
): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-state-success";
  if (score >= 60) return "text-brand";
  if (score >= 40) return "text-axis-trust";
  return "text-state-danger";
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return "border border-state-success/20 bg-state-success/10 text-state-success";
  if (score >= 60) return "border border-brand/20 bg-brand-soft text-brand-strong";
  if (score >= 40) return "border border-axis-trust/20 bg-axis-trust/10 text-axis-trust";
  return "border border-state-danger/20 bg-state-danger/10 text-state-danger";
}

export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return "border border-axis-trust/30 bg-axis-trust/15 text-axis-trust";
  if (rank === 2) return "border border-line bg-slate-200/70 text-slate-700";
  if (rank === 3) return "border border-accent-rose/20 bg-accent-rose/10 text-accent-rose";
  return "border border-line/80 bg-white/70 text-muted";
}

export function getAxisClasses(axis: AxisKey): {
  text: string;
  soft: string;
  bar: string;
  border: string;
} {
  const map = {
    attention: {
      text: "text-axis-attention",
      soft: "bg-axis-attention/10",
      bar: "bg-axis-attention",
      border: "border-axis-attention/20",
    },
    execution: {
      text: "text-axis-execution",
      soft: "bg-axis-execution/10",
      bar: "bg-axis-execution",
      border: "border-axis-execution/20",
    },
    health: {
      text: "text-axis-health",
      soft: "bg-axis-health/10",
      bar: "bg-axis-health",
      border: "border-axis-health/20",
    },
    trust: {
      text: "text-axis-trust",
      soft: "bg-axis-trust/10",
      bar: "bg-axis-trust",
      border: "border-axis-trust/20",
    },
  } as const;

  return map[axis];
}

export function getFoundationLabel(foundationType: string | null): string {
  if (foundationType === "cncf") return "CNCF";
  if (foundationType === "apache") return "Apache";
  if (foundationType === "linux") return "Linux Foundation";
  return "Independent";
}

export function getStageTone(stage: string | null): string {
  if (stage === "graduated") {
    return "border border-axis-execution/20 bg-axis-execution/10 text-axis-execution";
  }
  if (stage === "incubating") {
    return "border border-axis-attention/20 bg-axis-attention/10 text-axis-attention";
  }
  if (stage === "sandbox") {
    return "border border-axis-trust/20 bg-axis-trust/10 text-axis-trust";
  }
  return "border border-line bg-white/70 text-muted";
}

export function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    Go: "#00ADD8",
    TypeScript: "#3178C6",
    JavaScript: "#F7DF1E",
    Python: "#3776AB",
    Rust: "#DEA584",
    Java: "#B07219",
    "C++": "#F34B7D",
    C: "#555555",
    Ruby: "#CC342D",
    Shell: "#89E051",
  };
  return colors[lang] || "#8B8B8B";
}
