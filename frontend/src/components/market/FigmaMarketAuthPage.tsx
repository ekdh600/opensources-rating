"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { MarketPageIntro, MarketPanel } from "@/components/market/MarketUi";
import { api } from "@/lib/api";
import { loginTradingSession } from "@/lib/trading-session";
import { cn } from "@/lib/utils";

type AuthMode =
  | "login"
  | "register"
  | "verify-email"
  | "find-id"
  | "reset-password-request"
  | "reset-password-confirm";

type EntryMode = "login" | "register" | "recover";

const ENTRY_TABS: Array<{ key: EntryMode; label: string; body: string }> = [
  {
    key: "login",
    label: "로그인",
    body: "기존 계정으로 로그인합니다. 이메일 인증을 완료한 계정만 로그인할 수 있습니다.",
  },
  {
    key: "register",
    label: "회원가입",
    body: "새 계정을 만들고 이메일 인증 토큰으로 바로 활성화를 진행합니다.",
  },
  {
    key: "recover",
    label: "계정을 잃어 버리셨나요?",
    body: "아이디 찾기 또는 비밀번호 찾기를 진행할 수 있습니다. 비밀번호 찾기 인증이 끝나면 새 비밀번호를 바로 등록해야 합니다.",
  },
];

const RECOVERY_TABS: Array<{
  key: Extract<AuthMode, "find-id" | "reset-password-request">;
  label: string;
}> = [
  { key: "find-id", label: "아이디 찾기" },
  { key: "reset-password-request", label: "비밀번호 찾기" },
];

export function FigmaMarketAuthPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const handledLinkRef = useRef<string | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const linkAction = searchParams.get("action");
  const linkToken = searchParams.get("token")?.trim() ?? "";
  const linkEmail = searchParams.get("email")?.trim() ?? "";
  const tokenProvidedByLink =
    (mode === "verify-email" && linkAction === "verify-email" && linkToken.length > 0) ||
    (mode === "reset-password-confirm" && linkAction === "password-reset" && linkToken.length > 0);

  const entryMode: EntryMode =
    mode === "login" ? "login" : mode === "register" || mode === "verify-email" ? "register" : "recover";

  function selectEntry(next: EntryMode) {
    setError(null);
    setSuccess(null);
    if (next === "login") {
      setMode("login");
      return;
    }
    if (next === "register") {
      setMode("register");
      return;
    }
    setMode("find-id");
  }

  const activeEntry = ENTRY_TABS.find((item) => item.key === entryMode) ?? ENTRY_TABS[0];

  async function resendVerificationEmail() {
    if (!email) return;
    try {
      setLoading(true);
      setError(null);
      const result = await api.auth.requestEmailVerification({ email });
      setSuccess(result.message);
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "인증 메일 재발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function resendPasswordResetLink() {
    if (!email) return;
    try {
      setLoading(true);
      setError(null);
      const result = await api.auth.requestPasswordReset({
        email,
        username: username || undefined,
      });
      setSuccess(result.message);
      setMode("reset-password-confirm");
    } catch (resendError) {
      setError(resendError instanceof Error ? resendError.message : "비밀번호 재설정 링크 발송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (linkEmail) {
      setEmail(linkEmail);
    }

    if (!linkAction || !linkToken) {
      return;
    }

    const handledKey = `${linkAction}:${linkToken}`;
    if (handledLinkRef.current === handledKey) {
      return;
    }
    handledLinkRef.current = handledKey;

    let cancelled = false;

    async function handleLinkAction() {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (linkAction === "verify-email") {
          setMode("verify-email");
          setToken(linkToken);
          const result = await api.auth.confirmEmailVerification({ token: linkToken });
          if (cancelled) return;
          setSuccess(result.message);
          setMode("login");
          return;
        }

        if (linkAction === "password-reset") {
          setMode("reset-password-confirm");
          setToken(linkToken);
          const result = await api.auth.validatePasswordReset({ token: linkToken });
          if (cancelled) return;
          setSuccess(result.message);
        }
      } catch (linkError) {
        if (cancelled) return;
        setError(linkError instanceof Error ? linkError.message : "이메일 링크 처리 중 오류가 발생했습니다.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void handleLinkAction();

    return () => {
      cancelled = true;
    };
  }, [linkAction, linkToken, linkEmail]);

  async function submit() {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (mode === "login") {
        await loginTradingSession({ username, password });
        router.push("/market/account");
        router.refresh();
        return;
      }

      if (mode === "register") {
        const result = await api.auth.register({
          username,
          email,
          display_name: displayName,
          password,
        });
        setSuccess(result.message);
        setMode("verify-email");
        return;
      }

      if (mode === "verify-email") {
        const result = token
          ? await api.auth.confirmEmailVerification({ token })
          : await api.auth.requestEmailVerification({ email });
        setSuccess(result.message);
        if (token) setMode("login");
        return;
      }

      if (mode === "find-id") {
        const result = await api.auth.recoverId({ email });
        setSuccess(result.message);
        return;
      }

      if (mode === "reset-password-request") {
        const result = await api.auth.requestPasswordReset({
          email,
          username: username || undefined,
        });
        setSuccess(result.message);
        setMode("reset-password-confirm");
        return;
      }

      if (mode === "reset-password-confirm") {
        const result = await api.auth.confirmPasswordReset({
          token,
          new_password: newPassword,
        });
        setSuccess(result.message);
        setMode("login");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "인증 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  const primaryDisabled =
    loading ||
    (mode === "login" && (!username || !password)) ||
    (mode === "register" && (!username || !email || !displayName || !password)) ||
    (mode === "verify-email" && !email && !token) ||
    (mode === "find-id" && !email) ||
    (mode === "reset-password-request" && !email) ||
    (mode === "reset-password-confirm" && (!token || !newPassword));

  return (
    <div className="space-y-6">
      <MarketPageIntro
        eyebrow="Auth"
        title="로그인 / 계정 복구"
        description="개인 포인트 기반 트레이딩 게임을 이용하려면 이메일 인증이 완료된 계정이 필요합니다."
        stats={[
          { label: "로그인", value: "인증 완료 계정", note: "이메일 인증을 마친 계정만 트레이딩을 이용할 수 있습니다." },
          { label: "회원가입", value: "이메일 인증 동시 진행", note: "가입 직후 이메일 인증 토큰을 발송하고 계정을 활성화합니다." },
          { label: "계정 복구", value: "아이디 / 비밀번호", note: "계정을 잃어 버리셨나요? 메뉴에서는 아이디 찾기와 비밀번호 찾기만 제공합니다." },
          { label: "비밀번호 복구", value: "재설정 토큰", note: "인증 후에는 새 비밀번호를 반드시 등록해야 하며 이전 비밀번호는 사용할 수 없습니다." },
        ]}
      />

      <MarketPanel className="mx-auto max-w-[680px] p-5">
        <div className="grid gap-2 md:grid-cols-3">
          {ENTRY_TABS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => selectEntry(item.key)}
              className={cn(
                "rounded-[6px] border px-4 py-4 text-left transition",
                entryMode === item.key
                  ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]"
                  : "border-[#2b2f36] bg-[#161b24] text-[#848e9c]",
              )}
            >
              <p className="text-[14px] font-semibold">{item.label}</p>
              <p className="mt-2 text-[12px] leading-5">{item.body}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-[6px] border border-[#2b2f36] bg-[#10151d] px-4 py-4">
          <p className="text-[11px] uppercase tracking-[0.8px] text-[#848e9c]">{activeEntry.label}</p>
          <p className="mt-2 text-[13px] leading-6 text-[#d1d4dc]">{activeEntry.body}</p>
          {linkAction === "verify-email" ? (
            <p className="mt-2 text-[12px] leading-5 text-[#8fb4ff]">
              이메일 링크를 클릭하면 인증을 즉시 처리합니다. 링크가 만료되었으면 아래에서 인증 메일을 다시 보낼 수 있습니다.
            </p>
          ) : null}
          {linkAction === "password-reset" ? (
            <p className="mt-2 text-[12px] leading-5 text-[#8fb4ff]">
              비밀번호 재설정 링크가 유효하면 새 비밀번호 등록 화면으로 바로 이어집니다.
            </p>
          ) : null}
        </div>

        {entryMode === "recover" ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {RECOVERY_TABS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setMode(item.key);
                  setError(null);
                  setSuccess(null);
                }}
                className={cn(
                  "h-11 rounded-[4px] border px-3 text-[13px] font-semibold transition",
                  mode === item.key
                    ? "border-[#3366ff] bg-[rgba(51,102,255,0.12)] text-[#d1d4dc]"
                    : "border-[#2b2f36] bg-[#161b24] text-[#848e9c]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          {mode === "register" ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">이름</span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "login" || mode === "register" || mode === "reset-password-request") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">아이디</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "login" || mode === "register") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">비밀번호</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "register" || mode === "verify-email" || mode === "find-id" || mode === "reset-password-request") ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">이메일</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
            </label>
          ) : null}

          {(mode === "verify-email" || mode === "reset-password-confirm") && !tokenProvidedByLink ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">
                {mode === "verify-email" ? "이메일 인증 토큰" : "비밀번호 재설정 토큰"}
              </span>
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
              {mode === "verify-email" ? (
                <p className="mt-2 text-[11px] leading-5 text-[#848e9c]">
                  회원가입 버튼을 누르면 이메일로 인증 링크가 발급됩니다. 링크 클릭이 어려운 경우에만 토큰을 직접 입력해 주세요.
                </p>
              ) : null}
            </label>
          ) : null}

          {mode === "reset-password-confirm" ? (
            <label className="block">
              <span className="text-[12px] text-[#848e9c]">새 비밀번호</span>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-2 h-11 w-full rounded-[4px] border border-[#2b2f36] bg-[#1c212c] px-3 text-[14px] text-[#d1d4dc] outline-none"
              />
              <p className="mt-2 text-[11px] leading-5 text-[#848e9c]">
                비밀번호 찾기 인증이 끝나면 새 비밀번호를 반드시 등록해야 합니다. 직전 비밀번호를 포함해 이전에 사용한 비밀번호는 다시 사용할 수 없습니다.
              </p>
            </label>
          ) : null}
        </div>

        {success ? (
          <div className="mt-4 rounded-[6px] border border-[rgba(20,184,166,0.28)] bg-[rgba(20,184,166,0.12)] px-4 py-3 text-[13px] text-[#d7fffa]">
            {success}
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-[6px] border border-[rgba(214,88,58,0.28)] bg-[rgba(214,88,58,0.1)] px-4 py-3 text-[13px] text-[#ffd7cf]">
            {error}
          </div>
        ) : null}

        {mode === "verify-email" && email ? (
          <button
            type="button"
            onClick={() => void resendVerificationEmail()}
            disabled={loading}
            className="mt-4 inline-flex h-10 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-4 text-[13px] font-medium text-[#d1d4dc] transition hover:border-[#3a4252] disabled:cursor-not-allowed disabled:opacity-60"
          >
            인증 메일 다시 보내기
          </button>
        ) : null}

        {mode === "reset-password-confirm" && email ? (
          <button
            type="button"
            onClick={() => void resendPasswordResetLink()}
            disabled={loading}
            className="mt-4 inline-flex h-10 items-center rounded-[4px] border border-[#2b2f36] bg-[#161b24] px-4 text-[13px] font-medium text-[#d1d4dc] transition hover:border-[#3a4252] disabled:cursor-not-allowed disabled:opacity-60"
          >
            재설정 링크 다시 보내기
          </button>
        ) : null}

        {!(mode === "verify-email" && tokenProvidedByLink) ? (
          <button
            type="button"
            onClick={() => void submit()}
            disabled={primaryDisabled}
            className={cn(
              "mt-5 h-11 w-full rounded-[4px] bg-[#3366ff] text-[15px] font-semibold text-white transition hover:bg-[#4b7cff]",
              primaryDisabled && "cursor-not-allowed opacity-60",
            )}
          >
            {loading
              ? "처리 중..."
              : mode === "login"
                ? "로그인"
                : mode === "register"
                  ? "회원가입"
                  : mode === "verify-email"
                    ? token
                      ? "이메일 인증 완료"
                      : "인증 메일 재발송"
                    : mode === "find-id"
                      ? "아이디 찾기"
                      : mode === "reset-password-request"
                        ? "재설정 링크 받기"
                        : "새 비밀번호 등록"}
          </button>
        ) : null}
      </MarketPanel>
    </div>
  );
}
