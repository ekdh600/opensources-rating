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
function translateValidationDetail(detail: Record<string, unknown>): string | null {
  const type = typeof detail.type === "string" ? detail.type : "";
  const loc = Array.isArray(detail.loc) ? detail.loc.map(String) : [];
  const field = loc[loc.length - 1] ?? "";
  const ctx = detail.ctx && typeof detail.ctx === "object" ? (detail.ctx as Record<string, unknown>) : {};

  const fieldLabel =
    field === "password" || field === "new_password"
      ? "비밀번호"
      : field === "username"
        ? "아이디"
        : field === "email"
          ? "이메일"
          : field === "display_name"
            ? "이름"
            : field === "token"
              ? "토큰"
              : field === "content"
                ? "내용"
                : null;

  if (type === "string_too_short" && fieldLabel) {
    const minLength = typeof ctx.min_length === "number" ? ctx.min_length : null;
    if (minLength != null) {
      return `${fieldLabel}는 최소 ${minLength}자 이상이어야 합니다.`;
    }
  }

  if (type === "string_too_long" && fieldLabel) {
    const maxLength = typeof ctx.max_length === "number" ? ctx.max_length : null;
    if (maxLength != null) {
      return `${fieldLabel}는 최대 ${maxLength}자까지 입력할 수 있습니다.`;
    }
  }

  if (type === "missing" && fieldLabel) {
    return `${fieldLabel}를 입력해 주세요.`;
  }

  if (type === "greater_than" && fieldLabel) {
    const gt = typeof ctx.gt === "number" ? ctx.gt : null;
    if (gt != null) {
      return `${fieldLabel}는 ${gt}보다 커야 합니다.`;
    }
  }

  if (type === "less_than_equal" && fieldLabel) {
    const le = typeof ctx.le === "number" ? ctx.le : null;
    if (le != null) {
      return `${fieldLabel}는 ${le} 이하여야 합니다.`;
    }
  }

  if (type === "string_pattern_mismatch" && fieldLabel) {
    return `${fieldLabel} 형식이 올바르지 않습니다.`;
  }

  return null;
}

function readErrorMessage(text: string): string {
  const slice = text.slice(0, 500);
  try {
    const body = JSON.parse(text) as { detail?: unknown };
    const d = body?.detail;
    if (typeof d === "string") return d;
    if (Array.isArray(d)) {
      const translated = d
        .map((item) =>
          item && typeof item === "object" ? translateValidationDetail(item as Record<string, unknown>) : null,
        )
        .filter((item): item is string => Boolean(item));
      if (translated.length > 0) {
        return translated.join(" ");
      }
      return JSON.stringify(d);
    }
    if (d != null) return JSON.stringify(d);
  } catch {
    /* HTML/빈 응답 등 */
  }
  return slice || "(본문 없음)";
}

function buildHeaders(headers?: HeadersInit, accessToken?: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...headers,
  };
}

async function fetchAPI<T>(path: string, options?: RequestInit, accessToken?: string): Promise<T> {
  const base = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${base}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(options?.headers, accessToken),
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
  auth: {
    register: (body: {
      username: string;
      email: string;
      display_name: string;
      password: string;
    }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/register`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    login: (body: { username: string; password: string }) =>
      fetchAPI<{ access_token: string; token_type: string }>(`/api/v1/auth/login`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    requestEmailVerification: (body: { email: string }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/verify-email/request`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    confirmEmailVerification: (body: { token: string }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/verify-email/confirm`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    recoverId: (body: { email: string }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/recover-id`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    requestPasswordReset: (body: { email: string; username?: string }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/password-reset/request`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    validatePasswordReset: (body: { token: string }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/password-reset/validate`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    confirmPasswordReset: (body: { token: string; new_password: string }) =>
      fetchAPI<{ message: string }>(`/api/v1/auth/password-reset/confirm`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    me: (accessToken: string) => fetchAPI<any>(`/api/v1/auth/me`, undefined, accessToken),
  },
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
  seasons: {
    list: () => fetchAPI<any[]>(`/api/v1/seasons`),
    current: () => fetchAPI<any>(`/api/v1/seasons/current`),
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
  news: {
    headlines: (limit = 8) => fetchAPI<any>(`/api/v1/news/headlines?limit=${limit}`),
    project: (slug: string, limit = 8) => fetchAPI<any>(`/api/v1/news/projects/${slug}?limit=${limit}`),
    analysisFeed: (limit = 6) => fetchAPI<any>(`/api/v1/news/analysis-feed?limit=${limit}`),
  },
  search: (q: string) => fetchAPI<any>(`/api/v1/search?q=${encodeURIComponent(q)}`),
  scoring: {
    explain: (slug: string) => fetchAPI<any>(`/api/v1/scoring/explain/${slug}`),
  },
  trading: {
    quotes: (limit = 20) => fetchAPI<any[]>(`/api/v1/trading/quotes?limit=${limit}`),
    portfolio: (accessToken: string) => fetchAPI<any>(`/api/v1/trading/portfolio`, undefined, accessToken),
    orders: (accessToken: string, limit = 50) =>
      fetchAPI<any[]>(`/api/v1/trading/orders?limit=${limit}`, undefined, accessToken),
    createOrder: (
      accessToken: string,
      body: {
        project_slug: string;
        side: "buy" | "sell";
        quantity: number;
      },
    ) =>
      fetchAPI<any>(
        `/api/v1/trading/orders`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        accessToken,
      ),
    comments: (accessToken: string, slug: string) =>
      fetchAPI<any[]>(`/api/v1/trading/projects/${slug}/comments`, undefined, accessToken),
    createComment: (
      accessToken: string,
      slug: string,
      body: { content: string; parent_id?: number | null },
    ) =>
      fetchAPI<any>(
        `/api/v1/trading/projects/${slug}/comments`,
        {
          method: "POST",
          body: JSON.stringify(body),
        },
        accessToken,
      ),
    toggleCommentRecommendation: (accessToken: string, commentId: number) =>
      fetchAPI<any>(
        `/api/v1/trading/comments/${commentId}/recommend`,
        {
          method: "POST",
        },
        accessToken,
      ),
  },
};
