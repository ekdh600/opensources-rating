"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTranslations } from "next-intl";
import { Panel } from "@/components/ui/Panel";

interface ScoreTrendChartProps {
  data: { date: string; score: number; expected?: number }[];
  baseScore?: number;
  seasonStart?: string;
}

export function ScoreTrendChart({ data, baseScore }: ScoreTrendChartProps) {
  const t = useTranslations("market");

  return (
    <Panel tone="muted" className="h-full">
      <div className="mb-4">
        <p className="overline">{t("scoreTrend")}</p>
        <h4 className="mt-2 text-xl font-semibold tracking-tight text-ink">
          점수와 기대치 흐름
        </h4>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--color-axis-attention))" stopOpacity={0.24} />
              <stop offset="95%" stopColor="rgb(var(--color-axis-attention))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expectGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--color-axis-trust))" stopOpacity={0.18} />
              <stop offset="95%" stopColor="rgb(var(--color-axis-trust))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgb(var(--color-line) / 0.7)" strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "rgb(var(--color-muted))" }} />
          <YAxis tick={{ fontSize: 11, fill: "rgb(var(--color-muted))" }} domain={["auto", "auto"]} />
          <Tooltip
            contentStyle={{
              borderRadius: 16,
              borderColor: "rgb(var(--color-line))",
              backgroundColor: "rgb(255 255 255 / 0.96)",
              fontSize: 12,
            }}
            labelStyle={{ fontWeight: 600 }}
          />
          {baseScore ? (
            <ReferenceLine
              y={baseScore}
              stroke="rgb(var(--color-muted))"
              strokeDasharray="5 5"
              label={{ value: "Base", fontSize: 10, fill: "rgb(var(--color-muted))" }}
            />
          ) : null}
          <Area
            type="monotone"
            dataKey="score"
            stroke="rgb(var(--color-axis-attention))"
            strokeWidth={2.5}
            fill="url(#scoreGrad)"
            name="Score"
          />
          {data.some((point) => point.expected !== undefined) ? (
            <Area
              type="monotone"
              dataKey="expected"
              stroke="rgb(var(--color-axis-trust))"
              strokeWidth={1.8}
              strokeDasharray="4 3"
              fill="url(#expectGrad)"
              name="Expected"
            />
          ) : null}
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
        <span>Y-axis: score</span>
        <span>Expectation is community-weighted</span>
      </div>
    </Panel>
  );
}
