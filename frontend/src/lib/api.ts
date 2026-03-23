/**
 * 브라우저 기본: 항상 같은 출처 `/api/...` → next.config rewrites → FastAPI
 * (비교 페이지 등에서 localhost:8000 직접 호출 시 404·CORS·환경 차이로 깨지는 것 방지)
 *
 * 직접 백엔드 URL을 쓰려면: NEXT_PUBLIC_API_DIRECT=true + NEXT_PUBLIC_API_URL=http://...
 */
function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const direct =
      process.env.NEXT_PUBLIC_API_DIRECT === "true" ||
      process.env.NEXT_PUBLIC_API_DIRECT === "1";
    const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
    if (direct && explicit) return explicit;
    return "";
  }
  return (
    process.env.INTERNAL_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "http://127.0.0.1:8000"
  );
}

/** JSON detail 없으면 일부 텍스트/HTML 포함 */
function readErrorMessage(text: string): string {
  const slice = text.slice(0, 500);
  try {
    const body = JSON.parse(text) as { detail?: unknown };
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) return JSON.stringify(d);
    if (d != null) return JSON.stringify(d);
  } catch {
    /* HTML/빈 응답 등 */
  }
  return slice || "(본문 없음)";
}

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  const text = await res.text();
  if (!res.ok) {
    const detail = readErrorMessage(text);
    throw new Error(
      `API Error: ${res.status} ${res.statusText} — ${detail}`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API Error: JSON 파싱 실패 (${path})`);
  }
}

/**
 * 비교 전용: 같은 출처 `/api/...` 프록시가 404/5xx 이면 로컬 백엔드로 1회 재시도
 * (Docker에서 BACKEND_INTERNAL_URL 누락·재시작 누락 등 대비)
 */
async function fetchCompareAPI<T>(pathWithQuery: string): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const tryOnce = async (url: string) => {
    const res = await fetch(url, { headers });
    const text = await res.text();
    return { res, text };
  };

  let { res, text } = await tryOnce(pathWithQuery);

  const needFallback =
    !res.ok &&
    typeof window !== "undefined" &&
    (res.status === 404 || res.status === 502 || res.status === 503);

  if (needFallback) {
    const fb = (
      process.env.NEXT_PUBLIC_API_FALLBACK_URL || "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    const second = await tryOnce(`${fb}${pathWithQuery}`);
    res = second.res;
    text = second.text;
  }

  if (!res.ok) {
    const detail = readErrorMessage(text);
    throw new Error(
      `API Error: ${res.status} ${res.statusText} — ${detail}`
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`API Error: 비교 응답 JSON 파싱 실패`);
  }
}

export const api = {
  projects: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<{ total: number; page: number; page_size: number; items: any[] }>(
        `/api/v1/projects${qs}`
      );
    },
    get: (slug: string) => fetchAPI<any>(`/api/v1/projects/${slug}`),
    score: (slug: string) => fetchAPI<any>(`/api/v1/projects/${slug}/score`),
    trend: (slug: string, days = 30) =>
      fetchAPI<any>(`/api/v1/projects/${slug}/trend?days=${days}`),
  },
  leaderboards: {
    global: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/v1/leaderboards/global${qs}`);
    },
    cncf: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/v1/leaderboards/cncf${qs}`);
    },
    rising: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/v1/leaderboards/rising${qs}`);
    },
  },
  categories: {
    list: () => fetchAPI<any[]>(`/api/v1/categories`),
    leaderboard: (slug: string, params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/v1/categories/${slug}/leaderboard${qs}`);
    },
  },
  compare: (projects: string[]) => {
    const qs = new URLSearchParams();
    qs.set("projects", projects.join(","));
    return fetchCompareAPI<any>(`/api/v1/compare?${qs.toString()}`);
  },
  search: (q: string) => fetchAPI<any>(`/api/v1/search?q=${encodeURIComponent(q)}`),
  scoring: {
    explain: (slug: string) => fetchAPI<any>(`/api/v1/scoring/explain/${slug}`),
  },
};
