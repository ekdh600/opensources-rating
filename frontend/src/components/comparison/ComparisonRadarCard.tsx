"use client";

import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { useLocale } from "next-intl";
import { Panel } from "@/components/ui/Panel";
import type { ComparisonItem } from "@/types";

interface ComparisonRadarCardProps {
  items: ComparisonItem[];
}

type AxisScoreKey =
  | "attention_score"
  | "execution_score"
  | "health_score"
  | "trust_score";

const COLORS = [
  "rgb(var(--color-axis-attention))",
  "rgb(var(--color-axis-execution))",
  "rgb(var(--color-axis-trust))",
];

export function ComparisonRadarCard({ items }: ComparisonRadarCardProps) {
  const locale = useLocale();

  const axes: { key: AxisScoreKey; label: string }[] = [
    { key: "attention_score", label: locale === "ko" ? "관심도" : "Attention" },
    { key: "execution_score", label: locale === "ko" ? "실행력" : "Execution" },
    { key: "health_score", label: locale === "ko" ? "건강도" : "Health" },
    { key: "trust_score", label: locale === "ko" ? "신뢰도" : "Trust" },
  ];

  const chartData = axes.map((axis) => {
    const entry: Record<string, number | string> = { subject: axis.label };
    items.forEach((item, index) => {
      entry[`p${index}`] = item.latest_score ? item.latest_score[axis.key] ?? 0 : 0;
    });
    return entry;
  });

  return (
    <Panel tone="muted" className="h-full">
      <div className="mb-4">
        <p className="overline">{locale === "ko" ? "비교 시각화" : "Visual Comparison"}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          {locale === "ko" ? "축별 점수 비교" : "Axis-by-axis score comparison"}
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="rgb(var(--color-line) / 0.75)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "rgb(var(--color-muted))" }} />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "rgb(var(--color-muted))" }}
          />
          {items.map((item, index) => (
            <Radar
              key={item.project.slug}
              name={
                locale === "ko"
                  ? item.project.display_name_ko
                  : item.project.display_name_en
              }
              dataKey={`p${index}`}
              stroke={COLORS[index]}
              fill={COLORS[index]}
              fillOpacity={0.14}
              strokeWidth={2}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: 12, color: "rgb(var(--color-muted))" }} />
        </RadarChart>
      </ResponsiveContainer>
    </Panel>
  );
}
