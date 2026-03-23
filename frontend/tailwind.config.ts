import type { Config } from "tailwindcss";

const withOpacity = (cssVar: string) => `rgb(var(${cssVar}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: withOpacity("--color-bg"),
        surface: withOpacity("--color-surface"),
        card: withOpacity("--color-card"),
        ink: withOpacity("--color-ink"),
        muted: withOpacity("--color-muted"),
        line: withOpacity("--color-line"),
        brand: {
          DEFAULT: withOpacity("--color-brand"),
          strong: withOpacity("--color-brand-strong"),
          soft: withOpacity("--color-brand-soft"),
          glow: withOpacity("--color-brand-glow"),
        },
        accent: {
          teal: withOpacity("--color-accent-teal"),
          amber: withOpacity("--color-accent-amber"),
          rose: withOpacity("--color-accent-rose"),
        },
        axis: {
          attention: withOpacity("--color-axis-attention"),
          execution: withOpacity("--color-axis-execution"),
          health: withOpacity("--color-axis-health"),
          trust: withOpacity("--color-axis-trust"),
        },
        state: {
          success: withOpacity("--color-state-success"),
          warning: withOpacity("--color-state-warning"),
          danger: withOpacity("--color-state-danger"),
          info: withOpacity("--color-state-info"),
        },
      },
      fontFamily: {
        display: [
          "Pretendard Variable",
          "Pretendard",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
        sans: [
          "Pretendard Variable",
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "Malgun Gothic",
          "sans-serif",
        ],
        mono: ["IBM Plex Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      borderRadius: {
        panel: "1.5rem",
        pill: "999px",
      },
      boxShadow: {
        panel: "0 24px 60px -32px rgb(15 23 42 / 0.28)",
        soft: "0 18px 44px -28px rgb(15 23 42 / 0.18)",
        glow: "0 32px 80px -36px rgb(var(--color-brand) / 0.42)",
      },
    },
  },
  plugins: [],
};

export default config;
